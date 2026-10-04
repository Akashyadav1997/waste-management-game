import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createFabricTexture } from './textures';

const SKIN = '#C4845A';
const HAIR = '#3A241C';
const YELLOW = '#F2C200';
const GREEN = '#2F9E4F';
const PINK = '#E25B6A';
const APRON = '#FFF8EE';

function useFabric(color: string, roughness = 0.78) {
  const material = useMemo(() => {
    const map = createFabricTexture(color);
    return new THREE.MeshStandardMaterial({ map, roughness, metalness: 0.02 });
  }, [color, roughness]);
  useEffect(() => {
    return () => {
      material.map?.dispose();
      material.dispose();
    };
  }, [material]);
  return material;
}

function useSkin() {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SKIN,
        roughness: 0.56,
        metalness: 0.02,
        emissive: '#7A4030',
        emissiveIntensity: 0.07,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

function Eye({ x, scale = 1 }: { x: number; scale?: number }) {
  const side = x > 0 ? 1 : -1;
  return (
    <group position={[x, 0.02, 0.168]} scale={scale}>
      <mesh position={[0, 0, 0.02]} scale={[1.05, 1.2, 0.55]}>
        <sphereGeometry args={[0.05, 18, 14]} />
        <meshStandardMaterial color="#FFFEFB" roughness={0.25} />
      </mesh>
      <mesh position={[side * 0.004, -0.004, 0.05]}>
        <sphereGeometry args={[0.024, 16, 12]} />
        <meshStandardMaterial color="#6A3B22" roughness={0.32} />
      </mesh>
      <mesh position={[side * 0.004, -0.004, 0.068]}>
        <sphereGeometry args={[0.012, 12, 10]} />
        <meshBasicMaterial color="#1A120E" />
      </mesh>
      <mesh position={[0.012, 0.01, 0.078]}>
        <sphereGeometry args={[0.006, 8, 8]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 0.055, 0.03]} rotation={[0.15, 0, side * -0.25]}>
        <boxGeometry args={[0.055, 0.012, 0.012]} />
        <meshStandardMaterial color={HAIR} roughness={0.65} />
      </mesh>
    </group>
  );
}

function Smile({ y = -0.055 }: { y?: number; width?: number }) {
  return (
    <mesh position={[0, y, 0.2]} rotation={[0.15, 0, Math.PI]}>
      <torusGeometry args={[0.045, 0.008, 8, 18, Math.PI * 0.85]} />
      <meshBasicMaterial color="#9F1239" />
    </mesh>
  );
}

function Hand({
  position,
  rotation = [0, 0, 0],
  skin,
  mirror = false,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  skin: THREE.Material;
  mirror?: boolean;
}) {
  const side = mirror ? -1 : 1;
  const fingers = [-0.018, -0.006, 0.006, 0.018];
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, -0.028, 0]} material={skin} castShadow>
        <capsuleGeometry args={[0.03, 0.045, 4, 8]} />
      </mesh>
      <mesh position={[side * 0.028, -0.02, 0.01]} rotation={[0.25, 0, side * -0.9]} material={skin} castShadow>
        <capsuleGeometry args={[0.01, 0.028, 4, 8]} />
      </mesh>
      {fingers.map((x, index) => (
        <mesh key={x} position={[x, -0.072 - (index === 1 || index === 2 ? 0.008 : 0), 0.006]} material={skin} castShadow>
          <capsuleGeometry args={[0.009, 0.038, 4, 8]} />
        </mesh>
      ))}
    </group>
  );
}

function Braid({ side }: { side: -1 | 1 }) {
  return (
    <group>
      {Array.from({ length: 6 }, (_, index) => {
        const t = index / 5;
        return (
          <mesh key={index} position={[side * (0.18 + t * 0.05), 0.02 - t * 0.34, -0.02 - t * 0.05]} castShadow>
            <sphereGeometry args={[0.048 - t * 0.01, 12, 12]} />
            <meshStandardMaterial color={HAIR} roughness={0.72} />
          </mesh>
        );
      })}
      <mesh position={[side * 0.2, 0.0, 0.0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.028, 0.01, 8, 14]} />
        <meshStandardMaterial color={GREEN} roughness={0.45} />
      </mesh>
    </group>
  );
}

export function Jyoti({
  reducedMotion,
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  reducedMotion: boolean;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const skin = useSkin();
  const tunic = useFabric(YELLOW, 0.68);
  const pants = useFabric(GREEN, 0.74);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const bob = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 2.1) * 0.018;
    ref.current.position.set(position[0], position[1] + bob, position[2]);
    ref.current.rotation.set(rotation[0], rotation[1], rotation[2]);
    ref.current.scale.setScalar(scale);
  });

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      <mesh position={[-0.07, 0.03, 0.04]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.035, 0.16]} />
        <meshStandardMaterial color="#6B3E22" roughness={0.7} />
      </mesh>
      <mesh position={[0.07, 0.03, 0.04]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.035, 0.16]} />
        <meshStandardMaterial color="#6B3E22" roughness={0.7} />
      </mesh>
      <mesh position={[-0.07, 0.2, 0]} material={pants} castShadow>
        <capsuleGeometry args={[0.055, 0.22, 6, 12]} />
      </mesh>
      <mesh position={[0.07, 0.2, 0]} material={pants} castShadow>
        <capsuleGeometry args={[0.055, 0.22, 6, 12]} />
      </mesh>

      <mesh position={[0, 0.52, 0]} material={tunic} castShadow>
        <cylinderGeometry args={[0.15, 0.23, 0.46, 22]} />
      </mesh>
      <mesh position={[0, 0.72, 0.02]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.09, 0.018, 8, 18]} />
        <meshStandardMaterial color={GREEN} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.31, 0.02]}>
        <cylinderGeometry args={[0.23, 0.23, 0.045, 22]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>

      <group position={[-0.2, 0.58, 0.04]} rotation={[0.35, 0, 0.55]}>
        <mesh material={skin} castShadow>
          <capsuleGeometry args={[0.04, 0.22, 5, 10]} />
        </mesh>
        <Hand position={[0, -0.14, 0]} skin={skin} mirror />
      </group>
      <group position={[0.2, 0.58, 0.04]} rotation={[0.45, 0, -0.5]}>
        <mesh material={skin} castShadow>
          <capsuleGeometry args={[0.04, 0.22, 5, 10]} />
        </mesh>
        <Hand position={[0, -0.14, 0]} skin={skin} />
      </group>

      <mesh position={[0, 0.78, 0]} material={skin} castShadow>
        <cylinderGeometry args={[0.045, 0.05, 0.08, 12]} />
      </mesh>

      <group position={[0, 1.02, 0]}>
        <mesh material={skin} castShadow scale={[1, 1.05, 0.94]}>
          <sphereGeometry args={[0.21, 28, 24]} />
        </mesh>
        <mesh position={[-0.2, -0.01, 0]} rotation={[0, 0, 0.3]} material={skin} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
        </mesh>
        <mesh position={[0.2, -0.01, 0]} rotation={[0, 0, -0.3]} material={skin} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
        </mesh>
        <mesh position={[0, 0.06, -0.03]} scale={[1.08, 0.78, 1]} castShadow>
          <sphereGeometry args={[0.225, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshStandardMaterial color={HAIR} roughness={0.68} />
        </mesh>
        <mesh position={[0, 0.155, 0.08]} scale={[1.15, 0.32, 0.7]} castShadow>
          <sphereGeometry args={[0.14, 16, 12]} />
          <meshStandardMaterial color={HAIR} roughness={0.68} />
        </mesh>
        <Braid side={-1} />
        <Braid side={1} />
        <Eye x={-0.075} />
        <Eye x={0.075} />
        <mesh position={[0, -0.015, 0.2]} material={skin} castShadow>
          <sphereGeometry args={[0.032, 12, 10]} />
        </mesh>
        <Smile />
        <mesh position={[0, 0.09, 0.19]}>
          <sphereGeometry args={[0.016, 10, 10]} />
          <meshBasicMaterial color="#D61F3A" />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.12, -0.02, 0.15]} scale={[1, 0.65, 0.35]}>
            <sphereGeometry args={[0.045, 12, 10]} />
            <meshBasicMaterial color="#E8888A" transparent opacity={0.4} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function Mother({
  reducedMotion,
  position,
  rotation = [0, 0, 0],
}: {
  reducedMotion: boolean;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const ref = useRef<THREE.Group>(null);
  const skin = useSkin();
  const dress = useFabric(PINK, 0.7);
  const apron = useFabric(APRON, 0.82);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const breathe = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 1.6) * 0.012;
    ref.current.position.set(position[0], position[1] + breathe, position[2]);
    ref.current.rotation.set(rotation[0], rotation[1], rotation[2]);
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh position={[0, 0.72, 0]} material={dress} castShadow>
        <cylinderGeometry args={[0.18, 0.34, 0.86, 24]} />
      </mesh>
      <mesh position={[0, 0.7, 0.12]} material={apron} castShadow>
        <boxGeometry args={[0.4, 0.58, 0.06]} />
      </mesh>
      <mesh position={[0, 0.5, 0.16]}>
        <boxGeometry args={[0.16, 0.14, 0.02]} />
        <meshStandardMaterial color="#F3D2B5" roughness={0.8} />
      </mesh>
      <mesh position={[-0.1, 0.98, 0.04]} rotation={[0.5, 0, 0.5]}>
        <capsuleGeometry args={[0.018, 0.28, 4, 8]} />
        <meshStandardMaterial color={APRON} roughness={0.8} />
      </mesh>
      <mesh position={[0.1, 0.98, 0.04]} rotation={[0.5, 0, -0.5]}>
        <capsuleGeometry args={[0.018, 0.28, 4, 8]} />
        <meshStandardMaterial color={APRON} roughness={0.8} />
      </mesh>

      <mesh position={[-0.26, 0.86, 0.05]} rotation={[0.4, 0, 0.35]} material={dress} castShadow>
        <capsuleGeometry args={[0.05, 0.28, 5, 10]} />
      </mesh>
      <mesh position={[0.26, 0.86, 0.05]} rotation={[0.5, 0, -0.3]} material={dress} castShadow>
        <capsuleGeometry args={[0.05, 0.28, 5, 10]} />
      </mesh>
      <group position={[-0.3, 0.66, 0.12]}>
        <mesh material={skin} castShadow>
          <capsuleGeometry args={[0.042, 0.2, 4, 8]} />
        </mesh>
        <Hand position={[0, -0.13, 0]} skin={skin} mirror />
      </group>
      <group position={[0.32, 0.64, 0.16]} rotation={[0.7, 0, -0.2]}>
        <mesh material={skin} castShadow>
          <capsuleGeometry args={[0.042, 0.22, 4, 8]} />
        </mesh>
        <Hand position={[0, -0.14, 0]} skin={skin} />
      </group>
      <mesh position={[-0.34, 0.58, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.045, 0.008, 8, 14]} />
        <meshStandardMaterial color="#E7B84A" metalness={0.7} roughness={0.28} />
      </mesh>

      <mesh position={[0, 1.12, 0]} material={skin} castShadow>
        <cylinderGeometry args={[0.05, 0.055, 0.08, 12]} />
      </mesh>
      <group position={[0, 1.36, 0]}>
        <mesh material={skin} castShadow scale={[0.96, 1.04, 0.92]}>
          <sphereGeometry args={[0.2, 28, 24]} />
        </mesh>
        <mesh position={[-0.19, -0.01, 0]} material={skin} castShadow>
          <sphereGeometry args={[0.045, 12, 10]} />
        </mesh>
        <mesh position={[0.19, -0.01, 0]} material={skin} castShadow>
          <sphereGeometry args={[0.045, 12, 10]} />
        </mesh>
        <mesh position={[0, 0.05, -0.05]} scale={[1.06, 0.8, 1.02]} castShadow>
          <sphereGeometry args={[0.22, 28, 22, 0, Math.PI * 2, 0, Math.PI * 0.64]} />
          <meshStandardMaterial color={HAIR} roughness={0.66} />
        </mesh>
        <mesh position={[0, 0.12, 0.1]} rotation={[0.85, 0, 0]} scale={[1.55, 0.4, 0.5]} castShadow>
          <sphereGeometry args={[0.11, 16, 12]} />
          <meshStandardMaterial color={HAIR} roughness={0.66} />
        </mesh>
        {([-1, 1] as const).map((side) => (
          <mesh key={`lock-${side}`} position={[side * 0.175, -0.03, 0.05]} rotation={[0.15, side * -0.15, side * -0.2]} castShadow>
            <capsuleGeometry args={[0.058, 0.2, 5, 10]} />
            <meshStandardMaterial color={HAIR} roughness={0.66} />
          </mesh>
        ))}
        <group position={[0.22, -0.01, 0.0]} rotation={[0.7, 0.15, -0.4]}>
          <mesh castShadow>
            <sphereGeometry args={[0.085, 16, 14]} />
            <meshStandardMaterial color={HAIR} roughness={0.66} />
          </mesh>
          <mesh position={[0.02, -0.1, -0.03]} rotation={[0.35, 0, 0.1]} castShadow>
            <capsuleGeometry args={[0.04, 0.12, 5, 8]} />
            <meshStandardMaterial color={HAIR} roughness={0.66} />
          </mesh>
          <mesh position={[0.03, -0.2, -0.05]} castShadow>
            <sphereGeometry args={[0.038, 12, 10]} />
            <meshStandardMaterial color={HAIR} roughness={0.66} />
          </mesh>
          <mesh position={[0.01, -0.02, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.03, 0.008, 8, 14]} />
            <meshStandardMaterial color="#C45A6A" roughness={0.45} />
          </mesh>
        </group>
        <Eye x={-0.07} scale={0.92} />
        <Eye x={0.07} scale={0.92} />
        <mesh position={[0, -0.02, 0.19]} material={skin} castShadow>
          <sphereGeometry args={[0.03, 12, 10]} />
        </mesh>
        <Smile y={-0.06} />
        <mesh position={[0, 0.085, 0.182]}>
          <sphereGeometry args={[0.016, 10, 10]} />
          <meshBasicMaterial color="#D61F3A" />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.2, -0.01, 0.02]} rotation={[0.2, 0, side * 0.6]}>
            <torusGeometry args={[0.028, 0.008, 8, 14]} />
            <meshStandardMaterial color="#E7B84A" metalness={0.75} roughness={0.25} />
          </mesh>
        ))}
        {[-1, 1].map((side) => (
          <mesh key={`blush-${side}`} position={[side * 0.11, -0.025, 0.145]} scale={[1, 0.6, 0.3]}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshBasicMaterial color="#E8888A" transparent opacity={0.38} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
