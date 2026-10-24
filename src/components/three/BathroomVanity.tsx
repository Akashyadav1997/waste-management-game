import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

/** A small, local reflection map keeps chrome silver even without an HDR download. */
function createChromeReflection() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext('2d')!;
  const gradient = context.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#F9FCFF');
  gradient.addColorStop(0.42, '#D2DFE8');
  gradient.addColorStop(0.5, '#657B8A');
  gradient.addColorStop(0.65, '#B8CAD5');
  gradient.addColorStop(1, '#F2F7FA');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 256);
  context.fillStyle = '#FFFFFF';
  context.fillRect(70, 16, 55, 190);
  context.fillRect(300, 35, 95, 155);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

function WashBasin() {
  const bowl = useMemo(() => {
    // Follow the outside, rounded rim, then the inside down to the drain.
    // There is deliberately no top cap: the bowl is genuinely hollow.
    const profile = [
      [0.065, 0.018], [0.18, 0.018], [0.25, 0.035], [0.32, 0.075],
      [0.375, 0.145], [0.4, 0.19], [0.399, 0.205], [0.388, 0.213],
      [0.375, 0.207], [0.365, 0.19], [0.34, 0.14], [0.29, 0.095],
      [0.22, 0.08], [0.14, 0.067], [0.065, 0.062],
    ];
    const geometry = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 64);
    const colors: number[] = [];
    const white = new THREE.Color('#F9FCFD');
    const recessed = new THREE.Color('#B8D1DC');
    for (let i = 0; i < geometry.attributes.position.count; i += 1) {
      const part = i % profile.length;
      const depth = part > 8 ? (part - 8) / (profile.length - 9) : 0;
      const color = white.clone().lerp(recessed, depth * 0.8);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, []);
  const reflection = useMemo(createChromeReflection, []);
  const spout = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.035, -0.37),
    new THREE.Vector3(0, 0.29, -0.37),
    new THREE.Vector3(0, 0.405, -0.34),
    new THREE.Vector3(0, 0.43, -0.22),
    new THREE.Vector3(0, 0.375, -0.105),
    new THREE.Vector3(0, 0.31, -0.085),
  ]), 40, 0.026, 16, false), []);
  useEffect(() => () => {
    bowl.dispose();
    spout.dispose();
    reflection.dispose();
  }, [bowl, spout, reflection]);

  const chrome = { color: '#E4EDF2', metalness: 0.87, roughness: 0.2, envMap: reflection, envMapIntensity: 0.85 };
  return (
    <group name="ceramic-wash-basin" position={[1.47, 0.755, 0.12]}>
      <mesh geometry={bowl} scale={[1, 1, 0.85]} castShadow receiveShadow>
        <meshPhysicalMaterial vertexColors roughness={0.22} clearcoat={0.65} clearcoatRoughness={0.16} side={THREE.DoubleSide} />
      </mesh>
      {/* A visible metal drain and dark perforations give the hollow bowl scale. */}
      <group position={[0, 0.065, -0.05]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.064, 32]} />
          <meshStandardMaterial {...chrome} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <ringGeometry args={[0.047, 0.056, 32]} />
          <meshStandardMaterial color="#6A8596" roughness={0.35} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={[Math.sin(index * Math.PI / 3) * 0.028, 0.003, Math.cos(index * Math.PI / 3) * 0.028]}>
            <circleGeometry args={[0.007, 10]} />
            <meshBasicMaterial color="#314E60" />
          </mesh>
        ))}
      </group>
      {/* Overflow opening on the inner rear wall. */}
      <RoundedBox args={[0.065, 0.017, 0.01]} radius={0.005} position={[0, 0.162, -0.298]} rotation={[-0.6, 0, 0]}>
        <meshStandardMaterial color="#5F7D8B" roughness={0.6} />
      </RoundedBox>
      <mesh geometry={spout} castShadow><meshStandardMaterial {...chrome} /></mesh>
      <mesh position={[0, 0.024, -0.37]} castShadow>
        <cylinderGeometry args={[0.057, 0.065, 0.035, 24]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      <mesh position={[0, 0.308, -0.085]}>
        <cylinderGeometry args={[0.022, 0.022, 0.009, 20]} />
        <meshStandardMaterial color="#47616E" roughness={0.5} />
      </mesh>
      {/* Single lever mixer next to the spout. */}
      <mesh position={[0.1, 0.055, -0.37]} castShadow>
        <cylinderGeometry args={[0.031, 0.04, 0.09, 20]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      <RoundedBox args={[0.035, 0.025, 0.13]} radius={0.01} position={[0.1, 0.106, -0.335]} castShadow>
        <meshStandardMaterial {...chrome} />
      </RoundedBox>
    </group>
  );
}

export function BathroomVanity() {
  return (
    <group name="bathroom-vanity">
      <group position={[0.42, 0, 0.16]}>
        {/* Cabinet carcass, recessed plinth and inset doors. */}
        <RoundedBox args={[3.05, 0.54, 1.1]} radius={0.035} position={[0, 0.385, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#416E71" roughness={0.67} />
        </RoundedBox>
        <RoundedBox args={[2.83, 0.12, 0.86]} radius={0.015} position={[0, 0.075, -0.04]} castShadow>
          <meshStandardMaterial color="#2E5158" roughness={0.8} />
        </RoundedBox>
        {[-1, 0, 1].map((x) => (
          <group key={x} position={[x, 0.39, 0.56]}>
            <RoundedBox args={[0.96, 0.46, 0.045]} radius={0.018} castShadow receiveShadow>
              <meshStandardMaterial color="#659396" roughness={0.58} />
            </RoundedBox>
            <RoundedBox args={[0.79, 0.29, 0.012]} radius={0.012} position={[0, -0.025, 0.025]}>
              <meshStandardMaterial color="#729FA1" roughness={0.65} />
            </RoundedBox>
            <RoundedBox args={[0.24, 0.025, 0.035]} radius={0.01} position={[0, 0.15, 0.052]} castShadow>
              <meshStandardMaterial color="#D2E1E6" roughness={0.3} metalness={0.3} />
            </RoundedBox>
          </group>
        ))}
        {/* Slim, softly bevelled stone counter; the playable surface stays at its existing height. */}
        <RoundedBox args={[3.2, 0.105, 1.25]} radius={0.035} position={[0, 0.6975, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#E6ECEE" roughness={0.32} />
        </RoundedBox>
        <RoundedBox args={[3.12, 0.085, 0.045]} radius={0.012} position={[0, 0.7875, -0.58]} castShadow>
          <meshStandardMaterial color="#D4E1E4" roughness={0.35} />
        </RoundedBox>
      </group>
      {/* A distinct sorting mat leaves the sink area clear. */}
      <RoundedBox args={[2.08, 0.018, 0.84]} radius={0.008} position={[-0.04, 0.761, 0.27]} receiveShadow>
        <meshStandardMaterial color="#B7CFCD" roughness={0.92} />
      </RoundedBox>
      <RoundedBox args={[2, 0.006, 0.76]} radius={0.002} position={[-0.04, 0.773, 0.27]} receiveShadow>
        <meshStandardMaterial color="#E1ECE8" roughness={0.95} />
      </RoundedBox>
      <WashBasin />
    </group>
  );
}
