import { RoundedBox } from '@react-three/drei';
import { TissueShape } from './OrganicWasteShapes';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { ModelKind } from '../../game/types';

type Point = [number, number, number];
const ivory = '#FFF7DE';
const silver = '#A9B7C5';

function Box({ at = [0, 0.04, 0], size = [0.3, 0.07, 0.22], color = ivory, turn = 0 }: { at?: Point; size?: Point; color?: string; turn?: number }) {
  return <mesh position={at} rotation={[0, turn, 0]} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.65} /></mesh>;
}
function Ball({ at = [0, 0.1, 0], size = [0.1, 0.1, 0.1], color = ivory }: { at?: Point; size?: Point; color?: string }) {
  return <mesh position={at} scale={size} castShadow><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={color} roughness={0.78} /></mesh>;
}
function Cylinder({ at = [0, 0.1, 0], radius = 0.1, bottom = radius, height = 0.2, color = ivory, rotation = [0, 0, 0], open = false }: { at?: Point; radius?: number; bottom?: number; height?: number; color?: string; rotation?: Point; open?: boolean }) {
  return <mesh position={at} rotation={rotation} castShadow><cylinderGeometry args={[radius, bottom, height, 24, 1, open]} /><meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.48} metalness={color === silver ? 0.55 : 0} /></mesh>;
}
function Ring({ at = [0, 0.04, 0], radius = 0.12, tube = 0.012, color = ivory, rotation = [-Math.PI / 2, 0, 0], arc = Math.PI * 2 }: { at?: Point; radius?: number; tube?: number; color?: string; rotation?: Point; arc?: number }) {
  return <mesh position={at} rotation={rotation} castShadow><torusGeometry args={[radius, tube, 8, 24, arc]} /><meshStandardMaterial color={color} roughness={0.5} metalness={color === silver ? 0.5 : 0} /></mesh>;
}

/** Local canvas labels keep small packaging recognisable without fetching fonts. */
function Mark({ text, at = [0, 0.081, 0], size = [0.24, 0.12], upright = false, ink = '#263548', paper = '#FFFFFF' }: { text: string; at?: Point; size?: [number, number]; upright?: boolean; ink?: string; paper?: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = paper; ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = ink; ctx.font = 'bold 36px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 64, 240);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, [text, ink, paper]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={at} rotation={upright ? [0, 0, 0] : [-Math.PI / 2, 0, 0]}><planeGeometry args={size} /><meshStandardMaterial map={texture} roughness={0.8} /></mesh>;
}
function Leaf({ at = [0, 0.03, 0], turn = 0, dry = false }: { at?: Point; turn?: number; dry?: boolean }) {
  return <group position={at} rotation={[0, turn, 0]}><Ball at={[0, 0, 0]} size={[0.065, 0.012, 0.17]} color={dry ? '#A16B36' : '#559442'} /><Box at={[0, 0.013, 0]} size={[0.006, 0.006, 0.31]} color={dry ? '#DEB36D' : '#C4D18A'} />{[-1, 1].map((side) => <Box key={side} at={[side * 0.026, 0.014, -0.01]} size={[0.005, 0.004, 0.12]} turn={side * 0.7} color="#B3BC77" />)}</group>;
}
function Plate({ color = ivory }: { color?: string }) {
  return <><Cylinder at={[0, 0.025, 0]} radius={0.2} height={0.025} color={color} /><Ring at={[0, 0.045, 0]} radius={0.185} tube={0.014} color={color} /></>;
}
function Cup({ fibre, tall = false }: { fibre: boolean; tall?: boolean }) {
  const height = tall ? 0.32 : 0.23;
  const color = fibre ? '#C2A579' : '#DDECF5';
  return <><Cylinder at={[0, height / 2, 0]} radius={0.12} bottom={0.085} height={height} color={color} open /><Cylinder at={[0, 0.014, 0]} radius={0.085} height={0.018} color={color} /><Ring at={[0, height, 0]} radius={0.12} tube={0.009} color={color} />{fibre ? <Mark text="FIBRE" at={[0, height / 2, 0.112]} size={[0.16, 0.07]} upright paper={color} /> : <Mark text="PLASTIC" at={[0, height / 2, 0.112]} size={[0.17, 0.065]} upright paper={color} />}</>;
}
function Can({ label, color, lid = true }: { label: string; color: string; lid?: boolean }) {
  return <><Cylinder at={[0, 0.16, 0]} radius={0.11} height={0.3} color={color} /><Ring at={[0, 0.31, 0]} radius={0.106} color={silver} /><Ring at={[0, 0.015, 0]} radius={0.106} color={silver} />{lid && <Cylinder at={[0, 0.31, 0]} radius={0.1} height={0.008} color={silver} />}<Mark text={label} upright at={[0, 0.16, 0.112]} size={[0.19, 0.12]} paper={color} /></>;
}
function Wrapped({ label, color = '#ECD8C3' }: { label: string; color?: string }) {
  return <><Box size={[0.38, 0.06, 0.28]} color={color} /><Box at={[0, 0.073, 0]} size={[0.055, 0.006, 0.28]} color="#F5EEE4" /><Mark text={label} at={[0, 0.079, 0]} size={[0.28, 0.12]} /></>;
}

export function CatalogueShape({ kind }: { kind: ModelKind }) {
  switch (kind) {
    case 'bag':
      return <><Box size={[0.28, 0.025, 0.28]} at={[0, 0.02, 0]} color="#DAD8C9" />{[-0.08, 0.08].map((x) => <Ring key={x} at={[x, 0.025, -0.17]} radius={0.055} tube={0.012} color="#DAD8C9" />)}<Box size={[0.015, 0.008, 0.24]} at={[-0.08, 0.037, 0]} color="#BCBEB4" /></>;
    case 'containedSanitary':
      return <group>
        <RoundedBox args={[0.23, 0.09, 0.36]} radius={0.035} position={[0, 0.05, 0]} castShadow><meshStandardMaterial color="#D4B6C7" roughness={0.85} /></RoundedBox>
        <RoundedBox args={[0.19, 0.015, 0.24]} radius={0.007} position={[0, 0.101, -0.015]}><meshStandardMaterial color="#EEE1E7" roughness={0.95} /></RoundedBox>
        <Mark text="SANITARY PAD" at={[0, 0.11, 0.025]} size={[0.18, 0.075]} paper="#EEE1E7" ink="#76475F" />
        <Box at={[0, 0.111, -0.095]} size={[0.065, 0.005, 0.055]} color="#AE829A" />
      </group>;
    case 'fruit':
      return <>{[-0.1, 0.1].map((x) => <group key={x} position={[x, 0, x / 2]}><Ball size={[0.095, 0.07, 0.13]} at={[0, 0.065, 0]} color="#C64B38" /><Ball size={[0.08, 0.018, 0.11]} at={[0, 0.12, 0]} color="#F9DBA1" /><Ball size={[0.012, 0.008, 0.025]} at={[0, 0.139, 0]} color="#593D26" /></group>)}</>;
    case 'vegetables':
      return <><Cylinder radius={0.065} height={0.22} color="#E88B35" at={[-0.1, 0.065, 0]} rotation={[0, 0, Math.PI / 2]} /><Leaf at={[0.09, 0.025, 0.04]} turn={0.8} /><Ball at={[0.13, 0.045, -0.08]} size={[0.09, 0.045, 0.065]} color="#C4D98C" /></>;
    case 'spoiledFruit':
      return <><Ball color="#A58732" size={[0.14, 0.12, 0.13]} at={[-0.06, 0.12, 0]} /><Box at={[-0.06, 0.26, 0]} size={[0.025, 0.07, 0.025]} color="#67472C" /><Ball at={[-0.06, 0.18, 0.1]} size={[0.055, 0.04, 0.025]} color="#64745B" /><Ball at={[0.12, 0.07, 0.04]} size={[0.09, 0.065, 0.1]} color="#8E6438" /></>;
    case 'coffee':
      return <>{Array.from({ length: 18 }, (_, i) => <Ball key={i} at={[Math.sin(i * 2.4) * 0.13, 0.025 + (i % 3) * 0.012, Math.cos(i * 2.4) * 0.1]} size={[0.045, 0.025, 0.035]} color={i % 2 ? '#57331E' : '#37251A'} />)}</>;
    case 'coffeeFilter':
      return <><Cylinder at={[0, 0.08, 0]} radius={0.17} bottom={0.055} height={0.15} color="#D9BE94" open /><Cylinder at={[0, 0.09, 0]} radius={0.11} height={0.025} color="#513422" /></>;
    case 'teaBag':
      return <><Box size={[0.2, 0.035, 0.24]} color="#B8A279" /><Box at={[0, 0.062, 0]} size={[0.01, 0.008, 0.43]} color={ivory} /><Box at={[0, 0.065, 0.21]} size={[0.11, 0.012, 0.08]} color="#56824C" /><Mark text="TEA" at={[0, 0.047, 0]} size={[0.14, 0.1]} paper="#B8A279" /></>;
    case 'bread':
      return <><Box size={[0.27, 0.07, 0.25]} color="#A96E36" /><Box at={[0, 0.08, 0]} size={[0.23, 0.02, 0.21]} color="#EAD09A" /><Ball at={[-0.06, 0.07, -0.12]} size={[0.085, 0.045, 0.06]} color="#B77D3D" /><Ball at={[0.06, 0.07, -0.12]} size={[0.085, 0.045, 0.06]} color="#B77D3D" /></>;
    case 'breadRoll':
      return <><Ball size={[0.19, 0.09, 0.12]} at={[0, 0.09, 0]} color="#BF823F" />{[-0.08, 0, 0.08].map((x) => <Box key={x} at={[x, 0.174, 0]} size={[0.018, 0.008, 0.11]} turn={0.35} color="#F3D8A2" />)}</>;
    case 'pasta':
    case 'cereal':
    case 'leftovers':
      return <><Plate color="#EDE5D4" />{Array.from({ length: 9 }, (_, i) => <group key={i} position={[Math.sin(i * 2.4) * 0.12, 0.07 + i % 2 * 0.015, Math.cos(i * 2.4) * 0.1]}><Ring radius={0.026} tube={0.012} color={kind === 'cereal' ? '#BD8849' : '#EBC46C'} arc={kind === 'pasta' ? Math.PI * 1.4 : Math.PI * 2} />{kind === 'leftovers' && <Ball at={[0.02, 0.01, 0]} size={[0.022, 0.02, 0.024]} color={i % 2 ? '#6E9744' : '#DB783B'} />}</group>)}</>;
    case 'meat':
      return <><Ball size={[0.18, 0.045, 0.12]} at={[0, 0.05, 0]} color="#AD655B" /><Ring radius={0.055} tube={0.014} at={[-0.055, 0.094, 0]} color="#F2DBC6" /></>;
    case 'fish':
      return <><Ball size={[0.17, 0.045, 0.075]} at={[0, 0.05, 0]} color="#8AABAB" /><mesh position={[0.19, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}><coneGeometry args={[0.085, 0.12, 3]} /><meshStandardMaterial color="#668C91" /></mesh><Ball at={[-0.11, 0.09, 0.015]} size={[0.014, 0.008, 0.014]} color="#26373A" /><Box at={[0, 0.097, 0]} size={[0.17, 0.004, 0.006]} color="#D8D9C8" /></>;
    case 'dairy':
      return <><Box size={[0.25, 0.1, 0.18]} at={[0, 0.05, 0]} color="#F2D573" />{[-0.07, 0.055].map((x) => <Ball key={x} size={[0.024, 0.003, 0.02]} at={[x, 0.102, 0]} color="#B99646" />)}</>;
    case 'nuts':
      return <>{[-0.11, 0.02, 0.12].map((x, i) => <group key={x}><Ball at={[x, 0.04, i % 2 * 0.1]} size={[0.065, 0.035, 0.085]} color="#A37543" /><Ball at={[x, 0.067, i % 2 * 0.1]} size={[0.044, 0.008, 0.062]} color="#664729" /></group>)}</>;
    case 'leaves': case 'dryLeaves':
      return <>{[-1, 0, 1].map((n) => <Leaf key={n} at={[n * 0.085, 0.025 + (n + 1) * 0.012, 0]} turn={n * 0.8} dry={kind === 'dryLeaves'} />)}</>;
    case 'flowers': case 'dryFlowers':
      return <>{[-0.1, 0.1].map((x) => <group key={x} position={[x, 0.035, 0]}><Box at={[0, 0, 0.065]} size={[0.008, 0.008, 0.25]} color="#608849" />{Array.from({ length: 6 }, (_, i) => <Ball key={i} at={[Math.sin(i * Math.PI / 3) * 0.055, 0.015, -0.06 + Math.cos(i * Math.PI / 3) * 0.055]} size={[0.043, 0.012, 0.043]} color={kind === 'dryFlowers' ? '#9C7656' : '#E7A642'} />)}<Ball at={[0, 0.025, -0.06]} size={[0.028, 0.014, 0.028]} color="#7E5427" /></group>)}</>;
    case 'strawBundle': case 'broom':
      return <>{Array.from({ length: 11 }, (_, i) => <Cylinder key={i} at={[(i - 5) * 0.018, 0.025 + i % 2 * 0.015, 0]} radius={0.007} height={0.37 + i % 3 * 0.02} rotation={[Math.PI / 2, i * 0.016, 0]} color={kind === 'broom' ? '#9F773F' : '#D5B978'} />)}<Box at={[0, 0.055, 0.04]} size={[0.21, 0.012, 0.035]} color={kind === 'broom' ? '#A0473D' : '#A99971'} /></>;
    case 'woodStick':
      return <><Box size={[0.065, 0.015, 0.32]} at={[0, 0.015, 0]} color="#C9A877" />{[-0.16, 0.16].map((z) => <Cylinder key={z} at={[0, 0.015, z]} radius={0.0325} height={0.015} color="#C9A877" />)}</>;
    case 'shavings':
      return <>{[-1, 0, 1].map((n) => <Ring key={n} at={[n * 0.08, 0.035, n % 2 * 0.05]} radius={0.055} tube={0.014} arc={Math.PI * 1.5} color="#D8B17A" />)}<Box at={[0.03, 0.02, 0]} size={[0.015, 0.014, 0.09]} color="#5B5145" /></>;
    case 'leafPlate':
      return <><Plate color="#8A9D57" />{[-1, 0, 1].map((n) => <Leaf key={n} at={[n * 0.07, 0.055, 0]} turn={n * 0.35} />)}</>;
    case 'plasticPlate': return <><Plate color="#F1F3F5" /><Mark text="PLASTIC" at={[0, 0.04, 0]} size={[0.2, 0.07]} /></>;
    case 'fibreCup': return <Cup fibre />;
    case 'fibreGlass': return <Cup fibre tall />;
    case 'plasticCup': return <Cup fibre={false} />;
    case 'plasticGlass': return <Cup fibre={false} tall />;
    case 'tissue': case 'usedTissue':
      return <TissueShape used={kind === 'usedTissue'} />;
    case 'newspaper': case 'notebook':
      return <><Box size={[0.32, 0.04, 0.4]} color={kind === 'notebook' ? '#427B9D' : '#DDD9C8'} /><Box at={[0, 0.066, 0]} size={[0.29, 0.007, 0.37]} color={ivory} /><Mark text={kind === 'notebook' ? 'NOTES' : 'NEWS'} at={[0, 0.071, -0.11]} size={[0.26, 0.08]} paper={ivory} />{Array.from({ length: 6 }, (_, i) => <Box key={i} at={[0, 0.071, -0.04 + i * 0.035]} size={[0.23, 0.002, 0.004]} color="#83929B" />)}{kind === 'notebook' && [-0.12, -0.04, 0.04, 0.12].map((z) => <Ring key={z} at={[-0.16, 0.055, z]} radius={0.018} tube={0.004} color={silver} rotation={[Math.PI / 2, Math.PI / 2, 0]} />)}</>;
    case 'pen':
      return <><Cylinder at={[0, 0.026, 0]} radius={0.022} height={0.32} rotation={[Math.PI / 2, 0, 0]} color="#355B8A" /><Cylinder at={[0, 0.026, -0.2]} radius={0.026} height={0.08} rotation={[Math.PI / 2, 0, 0]} color="#26364B" /><Box at={[0.028, 0.03, -0.18]} size={[0.009, 0.01, 0.1]} color={silver} /></>;
    case 'container':
      return <><Box size={[0.32, 0.15, 0.24]} at={[0, 0.075, 0]} color="#C5DFDF" /><Box size={[0.35, 0.025, 0.27]} at={[0, 0.165, 0]} color="#52968D" /><Mark text="EMPTY" at={[0, 0.179, 0]} size={[0.23, 0.11]} paper="#52968D" /></>;
    case 'milkPouch':
      return <><Box size={[0.28, 0.045, 0.34]} color="#F5F6EA" /><Mark text="MILK" size={[0.25, 0.16]} at={[0, 0.064, 0]} ink="#225A97" />{[-0.16, 0.16].map((z) => <Box key={z} at={[0, 0.045, z]} size={[0.29, 0.035, 0.02]} color="#5295BE" />)}</>;
    case 'glassBottle':
      return <><Cylinder at={[0, 0.13, 0]} radius={0.09} height={0.24} color="#7DA994" /><Ball at={[0, 0.255, 0]} size={[0.09, 0.06, 0.09]} color="#7DA994" /><Cylinder at={[0, 0.33, 0]} radius={0.04} height={0.13} color="#7DA994" /><Ring at={[0, 0.395, 0]} radius={0.04} tube={0.009} color="#537E6B" /></>;
    case 'brokenGlass': return <Wrapped label="SHARP GLASS" />;
    case 'razor':
      return <><Box size={[0.055, 0.035, 0.28]} color="#446D83" /><Box at={[0, 0.055, -0.14]} size={[0.22, 0.07, 0.065]} color="#BDC8CE" /><Mark text="COVERED" at={[0, 0.092, -0.14]} size={[0.22, 0.05]} /></>;
    case 'staples':
      return <><Box size={[0.28, 0.025, 0.2]} color="#D9D2BD" />{[-0.07, 0, 0.07].map((x) => <group key={x}><Box at={[x, 0.068, 0]} size={[0.043, 0.007, 0.008]} color={silver} />{[-1, 1].map((side) => <Box key={side} at={[x + side * 0.021, 0.058, 0]} size={[0.006, 0.025, 0.008]} color={silver} />)}</group>)}<Mark text="SHARP" at={[0, 0.054, 0.065]} size={[0.18, 0.04]} /></>;
    case 'can': return <><Can label="FOOD" color="#93A38A" lid={false} />{[0.07, 0.12, 0.2, 0.25].map((y) => <Ring key={y} at={[0, y, 0]} radius={0.11} tube={0.003} color={silver} />)}</>;
    case 'sodaCan': return <><Can label="SODA" color="#D96D43" /><Ring at={[0, 0.32, 0]} radius={0.025} tube={0.009} color={silver} /></>;
    case 'foil':
      return <mesh position={[0, 0.035, 0]} scale={[0.19, 0.04, 0.14]} castShadow><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color={silver} metalness={0.85} roughness={0.34} flatShading /></mesh>;
    case 'canTab': return <group scale={1.5}><Ring at={[0, 0.018, -0.04]} radius={0.043} tube={0.012} color={silver} /><Ring at={[0, 0.018, 0.035]} radius={0.03} tube={0.012} color={silver} /></group>;
    case 'shirt':
      return <><Box size={[0.23, 0.02, 0.3]} color="#7D95AB" />{[-1, 1].map((side) => <Box key={side} at={[side * 0.16, 0.04, -0.08]} size={[0.13, 0.02, 0.12]} turn={side * 0.5} color="#7D95AB" />)}<Ring at={[0, 0.052, -0.14]} radius={0.04} tube={0.009} color="#3F5B72" /><Box at={[0.06, 0.055, 0.05]} size={[0.07, 0.004, 0.06]} color="#BCB3A0" /></>;
    case 'fabric':
      return <>{[-1, 0, 1].map((n) => <group key={n}><Box at={[n * 0.08, 0.025 + (n + 1) * 0.012, 0]} size={[0.18, 0.012, 0.23]} turn={n * 0.35} color={['#C08776', '#789AAA', '#BAA16B'][n + 1]} /></group>)}</>;
    case 'sandal':
      return <><Ball at={[0, 0.025, 0]} size={[0.09, 0.025, 0.19]} color="#454B56" /><Box at={[-0.028, 0.06, -0.05]} size={[0.025, 0.025, 0.15]} turn={-0.55} color="#73959B" /><Box at={[0.028, 0.06, -0.05]} size={[0.025, 0.025, 0.15]} turn={0.55} color="#73959B" /></>;
    case 'foam':
      return <><Box size={[0.34, 0.09, 0.22]} color="#F3F4F1" /><Box size={[0.12, 0.065, 0.25]} at={[-0.12, 0.1, 0]} color="#F3F4F1" />{Array.from({ length: 12 }, (_, i) => <Ball key={i} at={[-0.13 + i % 4 * 0.07, 0.09, -0.07 + Math.floor(i / 4) * 0.065]} size={[0.02, 0.009, 0.02]} color="#DFE2DE" />)}</>;
    case 'plasticStraw':
      return <><Cylinder at={[0, 0.022, 0]} radius={0.017} height={0.32} rotation={[Math.PI / 2, 0, 0]} color="#CD7C9A" /><Cylinder at={[0.025, 0.022, -0.19]} radius={0.017} height={0.09} rotation={[Math.PI / 2, -0.65, 0]} color="#CD7C9A" /></>;
    case 'eraser': return <><Box size={[0.2, 0.07, 0.11]} color="#DDADA6" /><Box at={[0.065, 0.04, 0]} size={[0.07, 0.071, 0.112]} color="#7D98B6" />{[-0.12, -0.08, 0.12].map((x) => <Ball key={x} at={[x, 0.015, 0.09]} size={[0.014, 0.009, 0.012]} color="#DDADA6" />)}</>;
    case 'diaper':
      return <><Ball at={[0, 0.07, 0]} size={[0.15, 0.06, 0.17]} color="#F1EEE5" />{[-1, 1].map((side) => <Box key={side} at={[side * 0.14, 0.08, -0.075]} size={[0.09, 0.025, 0.08]} color="#C3DBD5" />)}<Mark text="WRAPPED" at={[0, 0.133, 0]} size={[0.22, 0.08]} /></>;
    case 'bandage':
      return <><Wrapped label="WRAPPED" color="#F0E5D0" /><Box at={[0, 0.085, -0.07]} size={[0.29, 0.012, 0.07]} turn={0.1} color="#C79874" /><Box at={[0, 0.094, -0.07]} size={[0.065, 0.006, 0.055]} color="#EEE0C5" /></>;
    case 'phone':
      return <><Box size={[0.21, 0.035, 0.36]} color="#334353" /><Box at={[0, 0.061, 0]} size={[0.18, 0.007, 0.29]} color="#728B99" /><Mark text="E-WASTE" at={[0, 0.066, 0]} size={[0.17, 0.08]} paper="#728B99" /><Box at={[0, 0.066, -0.155]} size={[0.05, 0.003, 0.008]} color="#172535" /></>;
    case 'chemical':
      return <><Box size={[0.2, 0.26, 0.15]} at={[0, 0.13, 0]} color="#D6B46F" /><Cylinder at={[0, 0.285, 0]} radius={0.045} height={0.06} color="#724B36" /><Box at={[0.045, 0.33, 0]} size={[0.16, 0.04, 0.055]} color="#3D595D" /><Mark text="CLEANER" upright at={[0, 0.14, 0.076]} size={[0.18, 0.13]} paper="#FFF3DA" /></>;
    case 'paint': return <><Can label="PAINT" color="#B9967B" /><Ring at={[0, 0.22, 0]} radius={0.145} tube={0.008} color={silver} rotation={[0, 0, 0]} arc={Math.PI} /></>;
    case 'spray': return <><Can label="INSECT" color="#A29B6B" /><Cylinder at={[0, 0.34, 0]} radius={0.042} height={0.05} color="#3D494C" /><Box at={[0, 0.344, 0.04]} size={[0.018, 0.015, 0.02]} color="#D6D8D0" /></>;
    case 'medicine':
      return <><Box size={[0.25, 0.015, 0.34]} color={silver} />{Array.from({ length: 6 }, (_, i) => <Ball key={i} at={[-0.065 + i % 2 * 0.13, 0.066, -0.1 + Math.floor(i / 2) * 0.1]} size={[0.035, 0.018, 0.025]} color="#F2EEE1" />)}<Mark text="EXPIRED" at={[0, 0.052, 0.14]} size={[0.22, 0.045]} /></>;
    case 'thermometer':
      return <><Box size={[0.055, 0.025, 0.38]} color="#DDE6E2" /><Box at={[0, 0.056, 0]} size={[0.008, 0.004, 0.3]} color={silver} /><Ball at={[0, 0.05, 0.18]} size={[0.026, 0.014, 0.035]} color={silver} />{Array.from({ length: 7 }, (_, i) => <Box key={i} at={[0.014, 0.056, -0.13 + i * 0.04]} size={[0.014, 0.003, 0.004]} color="#435968" />)}</>;
    case 'bulb':
      return <><Cylinder at={[0, 0.055, 0]} radius={0.065} height={0.1} color={silver} /><Ball at={[0, 0.2, 0]} size={[0.12, 0.14, 0.12]} color="#ECE5C9" />{[0.035, 0.06, 0.085].map((y) => <Ring key={y} at={[0, y, 0]} radius={0.065} tube={0.005} color="#697B87" />)}</>;
    case 'tubeLight':
      return <><Cylinder at={[0, 0.035, 0]} radius={0.033} height={0.43} rotation={[0, 0, Math.PI / 2]} color="#E6E9DC" />{[-0.23, 0.23].map((x) => <Cylinder key={x} at={[x, 0.035, 0]} radius={0.035} height={0.035} rotation={[0, 0, Math.PI / 2]} color={silver} />)}</>;
    case 'cfl':
      return <><Cylinder at={[0, 0.045, 0]} radius={0.055} height={0.08} color={silver} /><Cylinder at={[0, 0.11, 0]} radius={0.08} height={0.07} color="#E4E6DB" />{[-0.05, 0.05].map((x) => <group key={x}><Cylinder at={[x, 0.235, 0]} radius={0.021} height={0.18} color="#F2EEDC" /><Ring at={[0, 0.325, 0]} radius={0.05} tube={0.021} color="#F2EEDC" rotation={[0, 0, 0]} arc={Math.PI} /></group>)}</>;
    default: return null;
  }
}
