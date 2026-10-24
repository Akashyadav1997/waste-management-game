import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

type Point = [number, number, number];
type Skin = 'banana' | 'carrot' | 'potato' | 'onion';
type Strip = { points: Point[]; width: number; cup?: number; twist?: number; taper?: boolean };

// A broad, thin sheet with two different faces, rolled edges and a rounded end.
// These are surfaces rather than tubes: peels must never look like worms or legs.
function peelGeometry(strip: Strip, underside: boolean) {
  const curve = new THREE.CatmullRomCurve3(strip.points.map((p) => new THREE.Vector3(...p)));
  const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
  const rows = 48, columns = 12;
  for (let i = 0; i <= rows; i += 1) {
    const t = i / rows;
    const center = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    const side = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const rounded = Math.pow(Math.sin(Math.PI * (0.035 + t * 0.93)), 0.35);
    const profile = strip.taper ? (0.23 + 0.77 * Math.sin(Math.PI * t) ** 0.6) : rounded;
    const width = strip.width * profile;
    for (let j = 0; j <= columns; j += 1) {
      const s = (j / columns) * 2 - 1;
      const roll = (strip.twist ?? 0) * Math.sin(t * Math.PI * 0.9);
      const ripple = Math.sin(t * 19 + s * 3) * 0.002 * Math.abs(s);
      const ridge = Math.cos(s * Math.PI * 4) * 0.0008;
      const point = center.clone().addScaledVector(side, s * width * Math.cos(roll));
      point.y += s * width * Math.sin(roll) + (strip.cup ?? 0.012) * s * s + ripple + ridge - (underside ? 0.004 : 0);
      positions.push(point.x, point.y, point.z);
      uvs.push(j / columns, t);
    }
  }
  for (let i = 0; i < rows; i += 1) for (let j = 0; j < columns; j += 1) {
    const a = i * (columns + 1) + j, b = a + columns + 1;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function peelTexture(skin: Skin, inside: boolean) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const palettes: Record<Skin, [string, string, string]> = {
    banana: ['#F5C52D', '#FFF0B0', '#C79724'],
    carrot: ['#DF6C22', '#F8AC53', '#BC531C'],
    potato: ['#AB7B47', '#F4DDB2', '#79512D'],
    onion: ['#AD5864', '#E9B7B4', '#7E3345'],
  };
  const [outer, inner, edge] = palettes[skin];
  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  gradient.addColorStop(0, edge); gradient.addColorStop(0.06, outer);
  gradient.addColorStop(0.17, inside ? inner : outer); gradient.addColorStop(0.8, inside ? inner : outer);
  gradient.addColorStop(0.95, outer); gradient.addColorStop(1, edge);
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 30; i += 1) {
    ctx.strokeStyle = inside ? 'rgba(132,89,44,0.12)' : 'rgba(255,237,189,0.16)';
    ctx.lineWidth = i % 4 === 0 ? 2 : 0.65;
    ctx.beginPath(); ctx.moveTo(i * 9, 0);
    ctx.bezierCurveTo(i * 9 + 9, 150, i * 9 - 8, 350, i * 9 + 4, 512); ctx.stroke();
  }
  if (!inside || skin === 'potato') {
    for (let i = 0; i < (skin === 'potato' ? 90 : 25); i += 1) {
      const x = ((i * 73 + 13) % 241) + 7, y = (i * 131 + 27) % 500;
      ctx.fillStyle = skin === 'banana' ? 'rgba(109,66,20,0.3)' : 'rgba(91,55,26,0.26)';
      ctx.beginPath(); ctx.ellipse(x, y, 1 + i % 3, 2 + i % 4, 0.2, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (skin === 'banana') {
    const tip = ctx.createLinearGradient(0, 470, 0, 512);
    tip.addColorStop(0, 'rgba(107,66,22,0)'); tip.addColorStop(1, '#886024');
    ctx.fillStyle = tip; ctx.fillRect(0, 470, 256, 42);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  return texture;
}

function PeelStrip({ strip, skin, skinUp = false, color }: { strip: Strip; skin: Skin; skinUp?: boolean; color?: string }) {
  const parts = useMemo(() => ({
    top: peelGeometry(strip, false), bottom: peelGeometry(strip, true),
    topMap: peelTexture(skin, !skinUp), bottomMap: peelTexture(skin, skinUp),
  }), [strip, skin, skinUp]);
  useEffect(() => () => Object.values(parts).forEach((part) => part.dispose()), [parts]);
  return <group>
    <mesh geometry={parts.top} castShadow receiveShadow><meshStandardMaterial color={color ?? '#FFFFFF'} map={color ? undefined : parts.topMap} roughness={0.79} side={THREE.DoubleSide} /></mesh>
    <mesh geometry={parts.bottom} castShadow><meshStandardMaterial color={color ?? '#FFFFFF'} map={color ? undefined : parts.bottomMap} roughness={0.72} side={THREE.DoubleSide} /></mesh>
  </group>;
}

const bananaStrips: Strip[] = [
  { points: [[-0.16, 0.17, 0], [-0.09, 0.16, 0.025], [0.035, 0.045, 0.03], [0.19, 0.018, 0.035], [0.25, 0.065, 0.015]], width: 0.068, cup: 0.018, twist: 0.16, taper: true },
  { points: [[-0.16, 0.17, 0], [-0.14, 0.105, 0.065], [-0.055, 0.027, 0.16], [0.075, 0.017, 0.18], [0.14, 0.05, 0.16]], width: 0.057, cup: 0.012, twist: -0.25, taper: true },
  { points: [[-0.16, 0.17, 0], [-0.08, 0.14, -0.065], [0.05, 0.035, -0.14], [0.17, 0.018, -0.15], [0.22, 0.06, -0.13]], width: 0.057, cup: 0.016, twist: 0.45, taper: true },
];

export function BananaSkin({ color }: { color?: string }) {
  const stem = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.16, 0.17, 0), new THREE.Vector3(-0.19, 0.205, 0), new THREE.Vector3(-0.21, 0.25, -0.012),
  ]), 16, 0.016, 10, false), []);
  useEffect(() => () => stem.dispose(), [stem]);
  return <group name="folded-banana-skin" rotation={[0, -0.15, 0]}>
    {bananaStrips.map((strip, i) => <PeelStrip key={i} strip={strip} skin="banana" color={color} />)}
    <mesh geometry={stem} castShadow><meshStandardMaterial color={color ?? '#7D702E'} roughness={0.85} /></mesh>
    <mesh position={[-0.21, 0.25, -0.012]} scale={[1, 0.45, 1]}><sphereGeometry args={[0.016, 12, 8]} /><meshStandardMaterial color={color ?? '#594025'} roughness={0.9} /></mesh>
  </group>;
}

const vegetableStrips: { strip: Strip; skin: Skin; skinUp?: boolean }[] = [
  // Wide orange shavings with one gently turned-up end, not tiny spirals.
  { skin: 'carrot', strip: { points: [[-0.19, 0.018, 0.075], [-0.09, 0.025, 0.11], [0.035, 0.018, 0.12], [0.15, 0.04, 0.09], [0.17, 0.075, 0.065]], width: 0.035, cup: 0.005, twist: 0.18 } },
  { skin: 'carrot', skinUp: true, strip: { points: [[-0.13, 0.022, -0.07], [-0.045, 0.06, -0.035], [0.07, 0.055, 0.01], [0.14, 0.025, -0.01]], width: 0.032, cup: 0.006, twist: -0.2 } },
  // Broad potato skin: brown speckled outside, pale flesh on the cut side.
  { skin: 'potato', skinUp: true, strip: { points: [[-0.16, 0.015, -0.015], [-0.095, 0.035, 0.015], [-0.02, 0.018, 0.025], [0.02, 0.022, -0.015]], width: 0.058, cup: 0.01 } },
  { skin: 'potato', strip: { points: [[-0.04, 0.02, -0.12], [0.035, 0.04, -0.1], [0.12, 0.022, -0.08], [0.18, 0.04, -0.055]], width: 0.047, cup: 0.009, twist: 0.15 } },
  { skin: 'onion', skinUp: true, strip: { points: [[0.02, 0.025, -0.045], [0.06, 0.04, -0.025], [0.13, 0.07, 0.02], [0.18, 0.11, 0.03]], width: 0.07, cup: 0.024, twist: -0.3 } },
];

export function VegetableSkins({ color }: { color?: string }) {
  return <group name="carrot-potato-onion-peels">{vegetableStrips.map((part, i) => <PeelStrip key={i} {...part} color={color} />)}</group>;
}

/** Soft, irregular paper, with actual folds instead of a solid rectangular block. */
export function TissueShape({ used = false }: { used?: boolean }) {
  const geometry = useMemo(() => {
    const mesh = new THREE.PlaneGeometry(0.28, 0.25, 18, 18);
    mesh.rotateX(-Math.PI / 2);
    const pos = mesh.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i), z = pos.getZ(i);
      const fold = used ? 0.045 * Math.cos(x * 27) * Math.cos(z * 22) + 0.02 * Math.sin(z * 46 + x * 18) : Math.abs(x + z * 0.4) * 0.11;
      pos.setY(i, 0.065 + fold + Math.sin(x * 65 + z * 23) * (used ? 0.008 : 0.002));
      if (used) pos.setX(i, x * (0.86 + 0.12 * Math.cos(z * 30)));
    }
    mesh.computeVertexNormals(); return mesh;
  }, [used]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={used ? '#E6DCC8' : '#FCFAF2'} roughness={0.98} side={THREE.DoubleSide} /></mesh>;
}
