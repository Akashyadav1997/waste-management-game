import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { kitchenLayout } from './kitchenLayout';
import { createPaintTexture, createTileTexture, createWoodTexture } from './textures';

const PLASTIC = { roughness: 0.42, metalness: 0.04 };
const METAL = { roughness: 0.28, metalness: 0.72, color: '#E7EEF2' };

function usePaint(color: string) {
  const material = useMemo(() => {
    const map = createPaintTexture(color);
    return new THREE.MeshStandardMaterial({ map, color: '#ffffff', ...PLASTIC });
  }, [color]);
  useEffect(() => {
    return () => {
      material.map?.dispose();
      material.dispose();
    };
  }, [material]);
  return material;
}

export function KitchenSet() {
  const floor = useMemo(() => createWoodTexture('#C9844A', 4), []);
  const counterWood = useMemo(() => createWoodTexture('#E4C48A', 2), []);
  const tiles = useMemo(() => createTileTexture(), []);
  const blue = usePaint('#3C7ED6');
  const fridgePaint = usePaint('#F6C431');
  useEffect(() => {
    return () => {
      floor.dispose();
      counterWood.dispose();
      tiles.dispose();
    };
  }, [floor, counterWood, tiles]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.2]} receiveShadow>
        <planeGeometry args={[16, 14]} />
        <meshStandardMaterial map={floor} roughness={0.78} />
      </mesh>
      <mesh position={[0, 2.6, -2.72]} receiveShadow>
        <boxGeometry args={[12, 5.4, 0.16]} />
        <meshStandardMaterial color="#F6E7D2" roughness={0.92} />
      </mesh>
      <mesh position={[-4.2, 2.6, -0.4]} receiveShadow>
        <boxGeometry args={[0.16, 5.4, 5]} />
        <meshStandardMaterial color="#F3DEC4" roughness={0.92} />
      </mesh>
      <mesh position={[4.3, 2.6, -0.4]} receiveShadow>
        <boxGeometry args={[0.16, 5.4, 5]} />
        <meshStandardMaterial color="#F3DEC4" roughness={0.92} />
      </mesh>
      <mesh position={[0.4, 1.35, -2.6]} receiveShadow>
        <planeGeometry args={[6.4, 0.85]} />
        <meshStandardMaterial map={tiles} roughness={0.32} />
      </mesh>

      <Fridge material={fridgePaint} />
      <CabinetRun material={blue} wood={counterWood} />
      <UpperCabinets material={blue} />
      <Stove />
      <SinkSet material={blue} wood={counterWood} />
      <WindowSet />
      <ShelfAndProps />
      <BreakfastTable wood={counterWood} />
    </group>
  );
}

function Fridge({ material }: { material: THREE.Material }) {
  return (
    <group position={[-2.15, 0, -1.95]}>
      <RoundedBox args={[1.05, 2.05, 0.72]} radius={0.08} position={[0, 1.05, 0]} material={material} castShadow receiveShadow />
      <RoundedBox args={[0.96, 0.62, 0.08]} radius={0.045} position={[0, 1.62, 0.4]} material={material} castShadow />
      <RoundedBox args={[0.96, 1.22, 0.08]} radius={0.045} position={[0, 0.66, 0.4]} material={material} castShadow />
      <mesh position={[0, 1.28, 0.46]}>
        <boxGeometry args={[0.9, 0.018, 0.02]} />
        <meshStandardMaterial color="#E2A61E" roughness={0.45} />
      </mesh>
      <mesh position={[0.34, 1.62, 0.5]} castShadow>
        <capsuleGeometry args={[0.028, 0.28, 4, 10]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      <mesh position={[0.34, 0.7, 0.5]} castShadow>
        <capsuleGeometry args={[0.028, 0.46, 4, 10]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      <RoundedBox args={[0.22, 0.1, 0.02]} radius={0.02} position={[-0.22, 1.7, 0.41]}>
        <meshStandardMaterial color="#FFF6D8" roughness={0.4} />
      </RoundedBox>
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.06, 0.22]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.1]} />
          <meshStandardMaterial color="#5C6770" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function CabinetRun({ material, wood }: { material: THREE.Material; wood: THREE.Texture }) {
  return (
    <group position={[-0.55, 0, -1.95]}>
      <RoundedBox args={[1.35, 0.86, 0.62]} radius={0.04} position={[0, 0.46, 0]} material={material} castShadow />
      <RoundedBox args={[0.58, 0.7, 0.04]} radius={0.03} position={[-0.32, 0.46, 0.32]} material={material} castShadow />
      <RoundedBox args={[0.58, 0.7, 0.04]} radius={0.03} position={[0.32, 0.46, 0.32]} material={material} castShadow />
      {[-0.32, 0.32].map((x) => (
        <mesh key={x} position={[x, 0.46, 0.37]} castShadow>
          <capsuleGeometry args={[0.016, 0.16, 4, 8]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
      ))}
      <mesh position={[0, 0.92, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[1.48, 0.08, 0.7]} />
        <meshStandardMaterial map={wood} roughness={0.62} />
      </mesh>
    </group>
  );
}

function UpperCabinets({ material }: { material: THREE.Material }) {
  return (
    <group position={[-0.55, 1.95, -2.28]}>
      {[-0.7, 0, 0.7].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <RoundedBox args={[0.66, 0.58, 0.34]} radius={0.03} material={material} castShadow />
          <mesh position={[0, 0, 0.2]}>
            <capsuleGeometry args={[0.014, 0.16, 4, 8]} />
            <meshStandardMaterial {...METAL} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Stove() {
  return (
    <group position={[0.85, 0, -1.95]}>
      <RoundedBox args={[1.15, 0.86, 0.62]} radius={0.04} position={[0, 0.46, 0]} castShadow>
        <meshStandardMaterial color="#F7F4EF" roughness={0.4} metalness={0.08} />
      </RoundedBox>
      <mesh position={[0, 0.48, 0.32]}>
        <boxGeometry args={[0.72, 0.46, 0.03]} />
        <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.48, 0.345]}>
        <boxGeometry args={[0.78, 0.03, 0.02]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      <mesh position={[0, 0.94, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.06, 0.68]} />
        <meshStandardMaterial color="#2A3038" roughness={0.35} metalness={0.55} />
      </mesh>
      {[
        [-0.28, -0.08],
        [0.22, -0.08],
        [-0.28, 0.16],
        [0.22, 0.16],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.98, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.11, 0.012, 8, 20]} />
          <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      {[-0.36, -0.14, 0.14, 0.36].map((x) => (
        <mesh key={x} position={[x, 0.55, 0.36]} castShadow>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color="#E11D48" roughness={0.35} />
        </mesh>
      ))}
      <group position={[-0.22, 1.12, 0.02]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.16, 0.15, 0.16, 20]} />
          <meshStandardMaterial color="#D7DEE4" metalness={0.65} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.17, 0.17, 0.03, 20]} />
          <meshStandardMaterial color="#C5CED6" metalness={0.7} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.14, 0]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color="#9AA6B2" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

function SinkSet({ material, wood }: { material: THREE.Material; wood: THREE.Texture }) {
  return (
    <group position={[2.15, 0, -1.95]}>
      <RoundedBox args={[1.25, 0.86, 0.62]} radius={0.04} position={[0, 0.46, 0]} material={material} castShadow />
      <RoundedBox args={[1.05, 0.34, 0.04]} radius={0.03} position={[0, 0.32, 0.32]} material={material} castShadow />
      <mesh position={[0, 0.62, 0.37]}>
        <capsuleGeometry args={[0.015, 0.28, 4, 8]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      <mesh position={[0, 0.93, 0.02]} receiveShadow>
        <boxGeometry args={[1.35, 0.08, 0.7]} />
        <meshStandardMaterial map={wood} roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.95, 0.04]} receiveShadow>
        <boxGeometry args={[0.62, 0.08, 0.4]} />
        <meshStandardMaterial color="#B7C3CC" metalness={0.8} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.9, 0.04]}>
        <boxGeometry args={[0.5, 0.06, 0.3]} />
        <meshStandardMaterial color="#8EA0AC" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.18, 1.16, -0.12]} castShadow>
        <capsuleGeometry args={[0.025, 0.28, 4, 8]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      <mesh position={[0.18, 1.3, 0.02]} rotation={[1.15, 0, 0]} castShadow>
        <capsuleGeometry args={[0.022, 0.22, 4, 8]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      <mesh position={[0.02, 1.22, -0.12]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.018, 0.16, 4, 8]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
    </group>
  );
}

function createWindowView() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const context = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (!context) return texture;

  const sky = context.createLinearGradient(0, 0, 0, 384);
  sky.addColorStop(0, '#7EBEF0');
  sky.addColorStop(0.45, '#D7F3FF');
  sky.addColorStop(1, '#C6E7A4');
  context.fillStyle = sky;
  context.fillRect(0, 0, 512, 384);

  context.fillStyle = '#FFF6C8';
  context.beginPath();
  context.arc(390, 78, 34, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#2F8A45';
  context.beginPath();
  context.ellipse(90, 300, 70, 90, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#3E9A52';
  context.beginPath();
  context.ellipse(180, 270, 86, 110, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#267A3C';
  context.beginPath();
  context.ellipse(300, 310, 100, 80, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#8FBF6A';
  context.fillRect(0, 300, 512, 84);

  texture.needsUpdate = true;
  return texture;
}

function WindowSet() {
  const view = useMemo(() => createWindowView(), []);
  useEffect(() => () => view.dispose(), [view]);
  return (
    <group position={[2.2, 1.95, -2.6]}>
      <RoundedBox args={[1.25, 1.05, 0.08]} radius={0.04} castShadow>
        <meshStandardMaterial color="#FFF9F2" roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[1.02, 0.82]} />
        <meshStandardMaterial map={view} emissive="#FFF4D0" emissiveIntensity={0.28} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.04, 0.82, 0.02]} />
        <meshStandardMaterial color="#F7E7D0" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[1.02, 0.04, 0.02]} />
        <meshStandardMaterial color="#F7E7D0" />
      </mesh>
      <group position={[0.28, -0.28, 0.16]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.08, 12]} />
          <meshStandardMaterial color="#C47A3A" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#3F9D55" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function ShelfAndProps() {
  return (
    <group>
      <group position={[-0.55, 2.55, -2.42]}>
        <RoundedBox args={[1.7, 0.06, 0.28]} radius={0.02} castShadow>
          <meshStandardMaterial color="#E7C99A" roughness={0.65} />
        </RoundedBox>
        {[
          [-0.55, '#E25B6A', 0.16],
          [-0.28, '#F2C200', 0.2],
          [0.02, '#3C7ED6', 0.14],
          [0.32, '#2F9E4F', 0.18],
        ].map(([x, color, height]) => (
          <group key={String(x)} position={[Number(x), 0.08 + Number(height) / 2, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.06, 0.065, Number(height), 14]} />
              <meshStandardMaterial color={String(color)} roughness={0.38} metalness={0.04} />
            </mesh>
            <mesh position={[0, Number(height) / 2 + 0.02, 0]}>
              <cylinderGeometry args={[0.068, 0.068, 0.03, 14]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.35} />
            </mesh>
          </group>
        ))}
      </group>

      <group position={[1.45, 1.08, -1.7]}>
        <mesh rotation={[-Math.PI / 2, 0, 0.2]} receiveShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.025, 18]} />
          <meshStandardMaterial color="#F7F4EF" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.02, 18]} />
          <meshStandardMaterial color="#E7EEF2" metalness={0.4} roughness={0.3} />
        </mesh>
      </group>
      <group position={[2.55, 1.08, -1.68]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.075, 0.16, 14]} />
          <meshStandardMaterial color="#F7F4EF" roughness={0.35} />
        </mesh>
        {[0, 0.7, 1.4].map((angle) => (
          <mesh key={angle} position={[Math.sin(angle) * 0.02, 0.16, Math.cos(angle) * 0.02]} rotation={[0.2, angle, 0.4]} castShadow>
            <capsuleGeometry args={[0.012, 0.16, 4, 6]} />
            <meshStandardMaterial color="#C5CED6" metalness={0.7} roughness={0.25} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function BreakfastTable({ wood }: { wood: THREE.Texture }) {
  const [x, , z] = kitchenLayout.tablePosition;
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[2.25, 0.12, 1.05]} radius={0.08} position={[0, 0.76, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={wood} roughness={0.58} />
      </RoundedBox>
      <mesh position={[0, 0.66, 0]}>
        <boxGeometry args={[2.05, 0.06, 0.86]} />
        <meshStandardMaterial color="#E8C99A" roughness={0.7} />
      </mesh>
      {[
        [-0.96, -0.38],
        [0.96, -0.38],
        [-0.96, 0.38],
        [0.96, 0.38],
      ].map(([lx, lz]) => (
        <mesh key={`${lx}-${lz}`} position={[lx, 0.36, lz]} castShadow>
          <cylinderGeometry args={[0.055, 0.07, 0.72, 14]} />
          <meshStandardMaterial color="#A1622F" roughness={0.62} />
        </mesh>
      ))}
    </group>
  );
}
