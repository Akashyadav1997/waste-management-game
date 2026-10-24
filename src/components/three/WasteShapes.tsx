import { BananaSkin, VegetableSkins } from './OrganicWasteShapes';
import { CatalogueShape } from './CatalogueShapes';
import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { ModelKind } from '../../game/types';
import {
  createBottleLabelTexture,
  createCardboardTexture,
  createEggshellTexture,
  createPaperTexture,
} from './textures';

export type WasteShapeVariant = 'default' | 'kitchen';

function createHollowEggshellGeometry(options: {
  radius: number;
  height: number;
  crackSeed: number;
  rimTeeth?: number;
}) {
  const { radius, height, crackSeed, rimTeeth = 6 } = options;
  const rings = 16;
  const segments = 24;
  const wallThickness = 0.0045;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let layer = 0; layer < 2; layer += 1) {
    const isInner = layer === 1;
    const rScale = isInner ? radius - wallThickness : radius;
    const hOffset = isInner ? wallThickness : 0;

    for (let i = 0; i <= rings; i += 1) {
      const t = i / rings;
      const yNorm = 1 - Math.cos((t * Math.PI) / 2);
      const rNorm = Math.sin((t * Math.PI) / 2) * (1 + 0.14 * Math.cos((t * Math.PI) / 2));
      const y = hOffset + yNorm * (height - hOffset);
      const r = rNorm * rScale;

      for (let j = 0; j <= segments; j += 1) {
        const v = j / segments;
        const angle = v * Math.PI * 2;

        let crack = 0;
        if (i === rings) {
          crack =
            Math.sin(angle * rimTeeth + crackSeed) * 0.013 +
            Math.cos(angle * (rimTeeth + 3) + crackSeed * 1.6) * 0.007;
        }

        const x = r * Math.cos(angle);
        const z = r * Math.sin(angle);
        positions.push(x, y + crack, z);
        uvs.push(v, t);
      }
    }
  }

  const ringVerts = segments + 1;
  const layerOffset = (rings + 1) * ringVerts;

  for (let i = 0; i < rings; i += 1) {
    for (let j = 0; j < segments; j += 1) {
      const a = i * ringVerts + j;
      const b = a + ringVerts;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  for (let i = 0; i < rings; i += 1) {
    for (let j = 0; j < segments; j += 1) {
      const a = layerOffset + i * ringVerts + j;
      const b = a + ringVerts;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }

  const outerRimStart = rings * ringVerts;
  const innerRimStart = layerOffset + rings * ringVerts;
  for (let j = 0; j < segments; j += 1) {
    const o1 = outerRimStart + j;
    const o2 = o1 + 1;
    const in1 = innerRimStart + j;
    const in2 = in1 + 1;
    indices.push(o1, o2, in1, o2, in2, in1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const faceIndices = rings * segments * 6;
  geometry.addGroup(0, faceIndices, 0);
  geometry.addGroup(faceIndices, faceIndices, 1);
  geometry.addGroup(faceIndices * 2, segments * 6, 1);
  return geometry;
}

function createNotebookPageGeometry() {
  const columns = 24;
  const rows = 18;
  const width = 0.44;
  const depth = 0.32;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let r = 0; r <= rows; r += 1) {
    const v = r / rows;
    const z = (v - 0.5) * depth;
    for (let c = 0; c <= columns; c += 1) {
      const u = c / columns;
      const x = (u - 0.5) * width;

      const wave = Math.sin(u * Math.PI) * 0.005 + Math.sin(v * Math.PI * 1.5) * 0.003;
      let dogEar = 0;
      if (u > 0.8 && v < 0.2) {
        dogEar = (u - 0.8 + (0.2 - v)) * 0.035;
      }
      const y = 0.005 + wave + dogEar;

      positions.push(x, y, z);
      uvs.push(u, 1 - v);
    }
  }

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < columns; c += 1) {
      const a = r * (columns + 1) + c;
      const b = a + columns + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createContouredBottleGeometry() {
  const points = [
    [0.004, 0],
    [0.048, 0],
    [0.058, 0.012],
    [0.062, 0.028],
    [0.06, 0.06],
    [0.056, 0.072],
    [0.06, 0.084],
    [0.06, 0.11],
    [0.056, 0.122],
    [0.06, 0.134],
    [0.054, 0.165],
    [0.053, 0.19],
    [0.058, 0.22],
    [0.058, 0.245],
    [0.048, 0.275],
    [0.034, 0.298],
    [0.021, 0.315],
    [0.02, 0.345],
    [0.022, 0.348],
    [0.019, 0.355],
    [0.004, 0.355],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(points, 32);
}

function createShell(radius: number, seed: number) {
  const geometry = new THREE.SphereGeometry(radius, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.58);
  const position = geometry.attributes.position;
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    if (y < radius * 0.12) {
      const jag = Math.sin(x * 46 + seed) * 0.02 + Math.cos(z * 33 + seed * 1.7) * 0.016;
      position.setY(index, y + jag);
    }
    const crack = Math.exp(-((x * Math.cos(seed) + z * 0.4) ** 2) * 90) * Math.max(0, radius * 0.25 - Math.abs(y - radius * 0.15));
    position.setX(index, x + crack * 0.35);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function Eggshells({ color }: { color?: string }) {
  const left = useMemo(() => createShell(0.12, 0.4), []);
  const right = useMemo(() => createShell(0.1, 1.7), []);
  const chip = useMemo(() => createShell(0.045, 2.4), []);
  useEffect(() => () => {
    left.dispose();
    right.dispose();
    chip.dispose();
  }, [left, right, chip]);
  const shell = color ?? '#F7F3EA';
  return (
    <group position={[0, 0.02, 0]}>
      <mesh geometry={left} position={[-0.08, 0.04, 0]} rotation={[0.4, 0.3, 0.2]} castShadow>
        <meshStandardMaterial color={shell} roughness={0.72} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.05, 0.08, 0.04]} rotation={[0.5, 0.2, 0.8]}>
        <boxGeometry args={[0.09, 0.008, 0.012]} />
        <meshBasicMaterial color="#C4B8A4" />
      </mesh>
      <mesh geometry={right} position={[0.1, 0.03, 0.04]} rotation={[-0.3, -0.5, 0.4]} castShadow>
        <meshStandardMaterial color={color ?? '#EFE8DC'} roughness={0.72} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={chip} position={[0.02, 0.02, -0.1]} rotation={[1.1, 0.4, 0.6]} castShadow>
        <meshStandardMaterial color={shell} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function KitchenEggshells({ color }: { color?: string }) {
  const flat = Boolean(color);
  const primaryShell = useMemo(
    () => createHollowEggshellGeometry({ radius: 0.076, height: 0.088, crackSeed: 0.8 }),
    [],
  );
  const secondaryShell = useMemo(
    () => createHollowEggshellGeometry({ radius: 0.068, height: 0.064, crackSeed: 2.3, rimTeeth: 5 }),
    [],
  );
  const eggTexture = useMemo(() => (color ? null : createEggshellTexture()), [color]);

  useEffect(
    () => () => {
      primaryShell.dispose();
      secondaryShell.dispose();
      eggTexture?.dispose();
    },
    [primaryShell, secondaryShell, eggTexture],
  );

  return (
    <group position={[0, 0.008, 0]} scale={1.12}>
      {/* Primary Cracked Half - tilted so camera sees hollow interior */}
      <group position={[-0.05, 0.038, 0.02]} rotation={[0.55, 0.25, 0.22]}>
        <mesh geometry={primaryShell} castShadow receiveShadow>
          <meshStandardMaterial
            attach="material-0"
            color={color ?? '#FFFFFF'}
            map={eggTexture ?? undefined}
            roughness={0.62}
            side={THREE.DoubleSide}
          />
          <meshStandardMaterial attach="material-1" color={color ?? '#FFF9ED'} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        {/* Subtle glossy residual egg-white glaze in bottom of shell */}
        {!flat && (
          <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.028, 16]} />
            <meshStandardMaterial color="#FAF8F5" roughness={0.08} metalness={0.1} transparent opacity={0.6} />
          </mesh>
        )}
      </group>

      {/* Secondary Cracked Half - tilted sideways */}
      <group position={[0.09, 0.026, -0.04]} rotation={[-0.6, -0.8, 0.4]}>
        <mesh geometry={secondaryShell} castShadow receiveShadow>
          <meshStandardMaterial
            attach="material-0"
            color={color ?? '#FFFFFF'}
            map={eggTexture ?? undefined}
            roughness={0.64}
            side={THREE.DoubleSide}
          />
          <meshStandardMaterial attach="material-1" color={color ?? '#FFF9ED'} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 2 Shell Shards on table */}
      {!flat && (
        <>
          <mesh position={[-0.02, 0.006, 0.12]} rotation={[0.4, 0.7, 0.1]} castShadow>
            <coneGeometry args={[0.022, 0.006, 3]} />
            <meshStandardMaterial color="#E5BCA0" roughness={0.65} />
          </mesh>
          <mesh position={[0.05, 0.005, -0.12]} rotation={[-0.3, 1.2, 0.2]} castShadow>
            <coneGeometry args={[0.018, 0.005, 3]} />
            <meshStandardMaterial color="#E2B799" roughness={0.65} />
          </mesh>
        </>
      )}
    </group>
  );
}

function PaperSheet({ color }: { color?: string }) {
  const map = useMemo(() => (color ? null : createPaperTexture()), [color]);
  useEffect(() => () => map?.dispose(), [map]);
  return (
    <group rotation={[0.08, 0.25, -0.04]} position={[0, 0.04, 0]}>
      <mesh castShadow rotation={[-0.12, 0, 0.08]}>
        <planeGeometry args={[0.46, 0.32]} />
        <meshStandardMaterial color={color ?? '#F7F4EC'} map={map ?? undefined} side={THREE.DoubleSide} roughness={0.88} />
      </mesh>
      <mesh position={[0.16, 0.01, 0.1]} rotation={[-0.4, 0.2, 0.5]} castShadow>
        <planeGeometry args={[0.12, 0.1]} />
        <meshStandardMaterial color={color ?? '#E7E2D6'} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
    </group>
  );
}

function KitchenPaperSheet({ color }: { color?: string }) {
  const flat = Boolean(color);
  const page = useMemo(() => createNotebookPageGeometry(), []);
  const map = useMemo(() => (color ? null : createPaperTexture()), [color]);

  useEffect(
    () => () => {
      page.dispose();
      map?.dispose();
    },
    [page, map],
  );

  return (
    <group position={[0, 0.035, 0]} rotation={[0.02, -0.15, 0.01]} scale={1.08}>
      {/* Subdivided gently draped notebook sheet */}
      <mesh geometry={page} castShadow receiveShadow>
        <meshStandardMaterial
          color={color ?? '#FAF9F5'}
          map={map ?? undefined}
          roughness={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Dog-eared folded corner on top-right */}
      {!flat && (
        <group position={[0.18, 0.012, -0.12]} rotation={[0, Math.PI / 4, 0.1]}>
          <mesh castShadow>
            <coneGeometry args={[0.038, 0.004, 3]} />
            <meshStandardMaterial color="#EDE9DE" roughness={0.9} />
          </mesh>
          {/* Subtle drop shadow under fold */}
          <mesh position={[0, -0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.045, 0.045]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.12} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function CardboardBox({ color }: { color?: string }) {
  const map = useMemo(() => (color ? null : createCardboardTexture()), [color]);
  useEffect(() => () => map?.dispose(), [map]);
  return (
    <group position={[0, 0.1, 0]}>
      <RoundedBox args={[0.4, 0.18, 0.28]} radius={0.02} castShadow>
        <meshStandardMaterial color={color ?? '#C47A3A'} map={map ?? undefined} roughness={0.82} />
      </RoundedBox>
      <mesh position={[0, 0.1, 0.08]} rotation={[-0.85, 0, 0]} castShadow>
        <boxGeometry args={[0.36, 0.015, 0.16]} />
        <meshStandardMaterial color={color ?? '#A1622F'} roughness={0.8} />
      </mesh>
      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[0.015, 0.16, 0.26]} />
        <meshStandardMaterial color={color ?? '#8A5324'} roughness={0.75} />
      </mesh>
    </group>
  );
}

function KitchenCardboardBox({ color }: { color?: string }) {
  const flat = Boolean(color);
  const map = useMemo(() => (color ? null : createCardboardTexture()), [color]);

  useEffect(() => () => map?.dispose(), [map]);

  const w = 0.36;
  const h = 0.18;
  const d = 0.26;
  const flapW = w;
  const flapH = 0.1;
  const sideFlapW = d;
  const sideFlapH = 0.08;

  return (
    <group position={[0, h / 2 + 0.006, 0]} rotation={[0, -0.22, 0]}>
      {/* Main Box Outer Walls */}
      <RoundedBox args={[w, h, d]} radius={0.012} castShadow receiveShadow>
        <meshStandardMaterial color={color ?? '#C08146'} map={map ?? undefined} roughness={0.82} />
      </RoundedBox>

      {/* Darker Inner Box Cavity */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[w - 0.024, h - 0.01, d - 0.024]} />
        <meshStandardMaterial color={color ?? '#8C5220'} roughness={0.88} side={THREE.BackSide} />
      </mesh>

      {/* 4 Open Top Flaps folded outward */}
      {/* Front flap */}
      <mesh position={[0, h / 2 + flapH * 0.42, d / 2 + 0.012]} rotation={[-0.45, 0, 0]} castShadow>
        <boxGeometry args={[flapW - 0.01, 0.008, flapH]} />
        <meshStandardMaterial color={color ?? '#B8783C'} map={map ?? undefined} roughness={0.8} />
      </mesh>

      {/* Back flap */}
      <mesh position={[0, h / 2 + flapH * 0.42, -d / 2 - 0.012]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[flapW - 0.01, 0.008, flapH]} />
        <meshStandardMaterial color={color ?? '#B8783C'} map={map ?? undefined} roughness={0.8} />
      </mesh>

      {/* Left flap */}
      <mesh position={[-w / 2 - 0.012, h / 2 + sideFlapH * 0.42, 0]} rotation={[0, 0, 0.52]} castShadow>
        <boxGeometry args={[sideFlapH, 0.008, sideFlapW - 0.01]} />
        <meshStandardMaterial color={color ?? '#A86C34'} roughness={0.82} />
      </mesh>

      {/* Right flap */}
      <mesh position={[w / 2 + 0.012, h / 2 + sideFlapH * 0.42, 0]} rotation={[0, 0, -0.48]} castShadow>
        <boxGeometry args={[sideFlapH, 0.008, sideFlapW - 0.01]} />
        <meshStandardMaterial color={color ?? '#A86C34'} roughness={0.82} />
      </mesh>

      {/* Packaging tape strip across bottom */}
      {!flat && (
        <mesh position={[0, -h / 2 + 0.002, 0]}>
          <boxGeometry args={[w + 0.002, 0.004, 0.05]} />
          <meshStandardMaterial color="#E2B87C" transparent opacity={0.45} roughness={0.4} />
        </mesh>
      )}
    </group>
  );
}

function Bottle({ color }: { color?: string }) {
  return (
    <group position={[0, 0.16, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.07, 0.075, 0.26, 20]} />
        <meshPhysicalMaterial
          color={color ?? '#D9F4FF'}
          roughness={0.14}
          metalness={0.02}
          thickness={0.35}
          transmission={color ? 0 : 0.62}
          transparent
          opacity={color ? 0.85 : 1}
        />
      </mesh>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.05, 0.06, 16]} />
        <meshPhysicalMaterial color={color ?? '#E0F4FF'} transparent opacity={0.7} roughness={0.16} transmission={color ? 0 : 0.35} />
      </mesh>
      <mesh position={[0, 0.21, 0]} castShadow>
        <cylinderGeometry args={[0.034, 0.034, 0.045, 16]} />
        <meshStandardMaterial color={color ?? '#1D4ED8'} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.02, 0.076]}>
        <planeGeometry args={[0.08, 0.1]} />
        <meshBasicMaterial color={color ?? '#FFFFFF'} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function KitchenBottle({ color }: { color?: string }) {
  const flat = Boolean(color);
  const bottle = useMemo(() => createContouredBottleGeometry(), []);
  const labelMap = useMemo(() => (color ? null : createBottleLabelTexture()), [color]);

  useEffect(
    () => () => {
      bottle.dispose();
      labelMap?.dispose();
    },
    [bottle, labelMap],
  );

  return (
    <group position={[0, 0.006, 0]} rotation={[0.04, 0.25, -0.04]}>
      {/* Contoured Clear PET Bottle with Grip Rings & Petalloid Base */}
      <mesh geometry={bottle} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={color ?? '#E0F7FA'}
          roughness={color ? 0.6 : 0.08}
          metalness={0.02}
          thickness={0.32}
          transmission={color ? 0 : 0.84}
          ior={1.52}
          transparent
          opacity={color ? 0.9 : 0.94}
        />
      </mesh>

      {/* Threaded Royal Blue Bottle Cap with Vertical Grips */}
      <group position={[0, 0.358, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.024, 0.024, 0.038, 20]} />
          <meshStandardMaterial color={color ?? '#1D4ED8'} roughness={0.32} />
        </mesh>
        {/* Tamper evident safety ring below cap */}
        <mesh position={[0, -0.022, 0]}>
          <cylinderGeometry args={[0.0245, 0.0245, 0.008, 16]} />
          <meshStandardMaterial color={color ?? '#1E40AF'} roughness={0.35} />
        </mesh>
      </group>

      {/* Printed Wrap-Around Recyclable Brand Label */}
      {!flat && (
        <mesh position={[0, 0.178, 0]} castShadow>
          <cylinderGeometry args={[0.061, 0.061, 0.082, 32, 1, true]} />
          <meshStandardMaterial
            map={labelMap ?? undefined}
            transparent
            opacity={0.92}
            roughness={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

export function WasteShape({ kind, color, variant = 'default' }: { kind: ModelKind; color?: string; variant?: WasteShapeVariant }) {
  const kitchen = variant === 'kitchen';
  switch (kind) {
    case 'banana':
      return <BananaSkin color={color} />;
    case 'peels':
      return <VegetableSkins color={color} />;
    case 'eggshells':
      if (kitchen) return <KitchenEggshells color={color} />;
      return <Eggshells color={color} />;
    case 'paper':
      if (kitchen) return <KitchenPaperSheet color={color} />;
      return <PaperSheet color={color} />;
    case 'cardboard':
      if (kitchen) return <KitchenCardboardBox color={color} />;
      return <CardboardBox color={color} />;
    case 'bottle':
      if (kitchen) return <KitchenBottle color={color} />;
      return <Bottle color={color} />;
    case 'tube':
      return (
        <group position={[0, 0.06, 0]} rotation={[0, 0.2, 0.2]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.32, 16]} />
            <meshStandardMaterial color={color ?? '#F8FAFC'} roughness={0.35} />
          </mesh>
          <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.06, 12]} />
            <meshStandardMaterial color="#0284C7" roughness={0.32} />
          </mesh>
        </group>
      );
    case 'sachet':
      return (
        <RoundedBox args={[0.34, 0.04, 0.42]} radius={0.02} castShadow rotation={[0.1, 0.3, 0]}>
          <meshStandardMaterial color={color ?? '#EC4899'} roughness={0.35} metalness={0.12} />
        </RoundedBox>
      );
    case 'bag':
      return <CatalogueShape kind={kind} />;
    case 'wrapper':
      return (
        <RoundedBox args={[0.42, 0.045, 0.26]} radius={0.03} castShadow rotation={[0.2, 0.4, 0.1]}>
          <meshStandardMaterial color={color ?? '#F97316'} roughness={0.4} metalness={0.08} />
        </RoundedBox>
      );
    case 'containedSanitary':
      return <CatalogueShape kind={kind} />;
    case 'battery':
      return (
        <group rotation={[0, 0, Math.PI / 2]} position={[0, 0.08, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.28, 16]} />
            <meshStandardMaterial color={color ?? '#334155'} roughness={0.45} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.03, 12]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.4} roughness={0.3} />
          </mesh>
        </group>
      );
    case 'actionCard':
      return (
        <RoundedBox args={[0.42, 0.05, 0.3]} radius={0.03} castShadow>
          <meshStandardMaterial color={color ?? '#FFFFFF'} roughness={0.7} />
        </RoundedBox>
      );
    case 'water':
      return (
        <group position={[0, 0.08, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.09, 0.07, 0.12, 20]} />
            <meshPhysicalMaterial color={color ?? '#D7F4FF'} transparent opacity={0.72} roughness={0.08} transmission={color ? 0 : 0.45} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
            <meshStandardMaterial color={color ?? '#7DD3FC'} transparent opacity={0.85} roughness={0.15} />
          </mesh>
        </group>
      );
    case 'buds':
      return (
        <group position={[0, 0.04, 0]}>
          {[-0.06, 0, 0.06].map((x, index) => (
            <group key={x} position={[x, 0, index * 0.02]} rotation={[0.2, 0, 0.4 - index * 0.35]}>
              <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.012, 0.012, 0.18, 8]} />
                <meshStandardMaterial color={color ?? '#F8FAFC'} roughness={0.6} />
              </mesh>
              {[-0.09, 0.09].map((tip) => (
                <mesh key={tip} position={[tip, 0, 0]} castShadow>
                  <sphereGeometry args={[0.028, 10, 8]} />
                  <meshStandardMaterial color={color ?? '#FFF7ED'} roughness={0.85} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      );
    default:
      return <CatalogueShape kind={kind} />;
  }
}
