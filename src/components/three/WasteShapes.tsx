import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { ModelKind } from '../../game/types';
import {
  createBananaTexture,
  createBottleLabelTexture,
  createCardboardTexture,
  createEggshellTexture,
  createOnionTexture,
  createPaperTexture,
} from './textures';

export type WasteShapeVariant = 'default' | 'kitchen';

type RibbonOptions = {
  length: number;
  maxWidth: number;
  curl: number;
  lift: number;
  lateral: number;
  cup: number;
  inset?: number;
  yOffset?: number;
  tStart?: number;
  tEnd?: number;
  lengthSegments?: number;
  widthSegments?: number;
};

function ribbonPoint(t: number, s: number, options: RibbonOptions) {
  const inset = options.inset ?? 1;
  const wave = Math.max(0, Math.sin(Math.PI * t));
  const pointedTip = 1 - 0.74 * t ** 4;
  const halfWidth = (0.008 + options.maxWidth * wave ** 0.72 * (0.96 - t * 0.24)) * pointedTip * inset;
  const centerX = options.lateral * Math.sin(t * Math.PI * 0.82) * (0.2 + t * 0.8);
  const centerY = 0.008 + options.lift * Math.sin(t * Math.PI * 0.78) + options.curl * t ** 2 + (options.yOffset ?? 0);
  const centerZ = options.length * t;
  const cuppedY = options.cup * s ** 2 * (0.32 + t * 0.68);
  return new THREE.Vector3(centerX + s * halfWidth, centerY + cuppedY, centerZ);
}

function createRibbonSurfaceGeometry(options: RibbonOptions) {
  const lengthSegments = options.lengthSegments ?? 28;
  const widthSegments = options.widthSegments ?? 8;
  const tStart = options.tStart ?? 0;
  const tEnd = options.tEnd ?? 1;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= lengthSegments; i += 1) {
    const u = i / lengthSegments;
    const t = THREE.MathUtils.lerp(tStart, tEnd, u);
    for (let j = 0; j <= widthSegments; j += 1) {
      const v = j / widthSegments;
      const s = -1 + v * 2;
      const point = ribbonPoint(t, s, options);
      positions.push(point.x, point.y, point.z);
      uvs.push(v, u);
    }
  }

  for (let i = 0; i < lengthSegments; i += 1) {
    for (let j = 0; j < widthSegments; j += 1) {
      const a = i * (widthSegments + 1) + j;
      const b = a + widthSegments + 1;
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

function createRibbonEdgeGeometry(options: RibbonOptions, side: -1 | 1, thickness = 0.008) {
  const lengthSegments = options.lengthSegments ?? 28;
  const tStart = options.tStart ?? 0;
  const tEnd = options.tEnd ?? 1;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= lengthSegments; i += 1) {
    const u = i / lengthSegments;
    const t = THREE.MathUtils.lerp(tStart, tEnd, u);
    const top = ribbonPoint(t, side, options);
    const bottom = ribbonPoint(t, side, { ...options, yOffset: (options.yOffset ?? 0) - thickness });
    positions.push(top.x, top.y, top.z, bottom.x, bottom.y, bottom.z);
  }

  for (let i = 0; i < lengthSegments; i += 1) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function disposeGeometries(geometries: THREE.BufferGeometry[]) {
  geometries.forEach((geometry) => geometry.dispose());
}

function frameAlong(curve: THREE.Curve<THREE.Vector3>, t: number) {
  const center = curve.getPointAt(t);
  const tangent = curve.getTangentAt(t).normalize();
  const side = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), tangent);
  if (side.lengthSq() < 1e-8) side.set(1, 0, 0);
  side.normalize();
  const up = new THREE.Vector3().crossVectors(tangent, side).normalize();
  return { center, tangent, side, up };
}

// ==========================================
// KITCHEN HIGH-FIDELITY PROCEDURAL GENERATORS
// ==========================================

/** Generates an authentic crescent-curved banana with peel flaps peeled open */
function createCrescentBananaGeometries() {
  const points = [
    new THREE.Vector3(-0.17, 0.024, 0.03),
    new THREE.Vector3(-0.09, 0.062, -0.015),
    new THREE.Vector3(0.0, 0.078, -0.045),
    new THREE.Vector3(0.09, 0.058, -0.02),
    new THREE.Vector3(0.17, 0.025, 0.025),
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const segments = 32;
  const radial = 18;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const radiusAt = (t: number) => {
    const belly = Math.sin(Math.PI * t) ** 0.55;
    return (0.014 + 0.038 * belly) * (1 - 0.16 * t);
  };

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const pt = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(up, tangent).normalize();
    const norm = new THREE.Vector3().crossVectors(tangent, side).normalize();
    const r = radiusAt(t);

    for (let j = 0; j <= radial; j += 1) {
      const v = j / radial;
      const angle = v * Math.PI * 2;
      const facet = 1 + 0.065 * Math.cos(angle * 5);
      const px = pt.x + (side.x * Math.cos(angle) + norm.x * Math.sin(angle)) * r * facet;
      const py = pt.y + (side.y * Math.cos(angle) + norm.y * Math.sin(angle)) * r * facet;
      const pz = pt.z + (side.z * Math.cos(angle) + norm.z * Math.sin(angle)) * r * facet;

      positions.push(px, py, pz);
      uvs.push(t * 2, v);
    }
  }

  for (let i = 0; i < segments; i += 1) {
    for (let j = 0; j < radial; j += 1) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const bodyGeom = new THREE.BufferGeometry();
  bodyGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  bodyGeom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  bodyGeom.setIndex(indices);
  bodyGeom.computeVertexNormals();

  // Stem curve at t = 0
  const stemPoints = [
    new THREE.Vector3(-0.17, 0.024, 0.03),
    new THREE.Vector3(-0.2, 0.045, 0.045),
    new THREE.Vector3(-0.22, 0.072, 0.04),
    new THREE.Vector3(-0.21, 0.096, 0.025),
  ];
  const stemGeom = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(stemPoints), 12, 0.01, 8, false);

  // Peeled Flap 1 (peeled forward onto the wood)
  const flap1Points = [
    new THREE.Vector3(-0.06, 0.072, -0.01),
    new THREE.Vector3(-0.04, 0.082, 0.04),
    new THREE.Vector3(-0.02, 0.05, 0.095),
    new THREE.Vector3(0.01, 0.008, 0.15),
    new THREE.Vector3(0.03, 0.018, 0.18),
  ];
  const flap1Curve = new THREE.CatmullRomCurve3(flap1Points);

  // Peeled Flap 2 (peeled backward onto the wood)
  const flap2Points = [
    new THREE.Vector3(0.02, 0.076, -0.04),
    new THREE.Vector3(0.05, 0.082, -0.07),
    new THREE.Vector3(0.08, 0.045, -0.11),
    new THREE.Vector3(0.11, 0.008, -0.14),
    new THREE.Vector3(0.13, 0.018, -0.16),
  ];
  const flap2Curve = new THREE.CatmullRomCurve3(flap2Points);

  const makeFlap = (curvePath: THREE.CatmullRomCurve3) => {
    const fSegs = 18;
    const fPositions: number[] = [];
    const fUvs: number[] = [];
    const fIndices: number[] = [];
    const width = 0.048;

    for (let i = 0; i <= fSegs; i += 1) {
      const t = i / fSegs;
      const pt = curvePath.getPointAt(t);
      const tang = curvePath.getTangentAt(t).normalize();
      const n = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), tang).normalize();
      const w = width * (1 - 0.38 * t);

      fPositions.push(pt.x - (n.x * w) / 2, pt.y, pt.z - (n.z * w) / 2);
      fUvs.push(0, t);
      fPositions.push(pt.x + (n.x * w) / 2, pt.y, pt.z + (n.z * w) / 2);
      fUvs.push(1, t);
    }

    for (let i = 0; i < fSegs; i += 1) {
      const a = i * 2;
      fIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      fIndices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(fPositions, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(fUvs, 2));
    g.setIndex(fIndices);
    g.computeVertexNormals();
    return g;
  };

  const flap1 = makeFlap(flap1Curve);
  const flap2 = makeFlap(flap2Curve);

  return { body: bodyGeom, stem: stemGeom, flap1, flap2, tipPos: points[4] };
}

function createCarrotSpiralGeometry(turns = 2.6, radius = 0.038, length = 0.16) {
  const steps = 36;
  const width = 0.022;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const theta = t * turns * Math.PI * 2;
    const r = radius - t * (radius * 0.35);
    const cx = r * Math.cos(theta);
    const cz = r * Math.sin(theta) + t * length;
    const cy = 0.012 + t * 0.036;

    const nx = -Math.sin(theta);
    const nz = Math.cos(theta);

    positions.push(cx - (nx * width) / 2, cy - 0.004, cz - (nz * width) / 2);
    positions.push(cx + (nx * width) / 2, cy + 0.004, cz + (nz * width) / 2);
  }

  for (let i = 0; i < steps; i += 1) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createOnionSliceGeometry() {
  const stepsU = 16;
  const stepsV = 12;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= stepsV; i += 1) {
    const v = i / stepsV;
    const z = (v - 0.5) * 0.12;
    const cupZ = Math.sin(v * Math.PI) * 0.016;

    for (let j = 0; j <= stepsU; j += 1) {
      const u = j / stepsU;
      const angle = (u - 0.5) * Math.PI * 0.82;
      const r = 0.052;
      const x = r * Math.sin(angle);
      const y = 0.012 + r * (1 - Math.cos(angle)) + cupZ;

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  for (let i = 0; i < stepsV; i += 1) {
    for (let j = 0; j < stepsU; j += 1) {
      const a = i * (stepsU + 1) + j;
      const b = a + stepsU + 1;
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

function createTwistedPeelGeometry() {
  const steps = 24;
  const length = 0.22;
  const width = 0.026;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const z = (t - 0.5) * length;
    const arch = Math.sin(t * Math.PI) * 0.022;
    const twist = t * Math.PI * 1.25;

    const nx = Math.cos(twist) * width * 0.5;
    const ny = Math.sin(twist) * width * 0.5;

    positions.push(-nx, 0.014 + arch - ny, z);
    uvs.push(0, t);
    positions.push(nx, 0.014 + arch + ny, z);
    uvs.push(1, t);
  }

  for (let i = 0; i < steps; i += 1) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

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
      let y = hOffset + yNorm * (height - hOffset);
      const r = rNorm * rScale;

      for (let j = 0; j <= segments; j += 1) {
        const v = j / segments;
        const angle = v * Math.PI * 2;

        if (i === rings) {
          const crack =
            Math.sin(angle * rimTeeth + crackSeed) * 0.013 +
            Math.cos(angle * (rimTeeth + 3) + crackSeed * 1.6) * 0.007;
          y += crack;
        }

        const x = r * Math.cos(angle);
        const z = r * Math.sin(angle);
        positions.push(x, y, z);
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

function BananaPeelFlap({
  yaw,
  length,
  curl,
  maxWidth,
  lift,
  lateral,
  cup,
  color,
}: {
  yaw: number;
  length: number;
  curl: number;
  maxWidth: number;
  lift: number;
  lateral: number;
  cup: number;
  color?: string;
}) {
  const base = useMemo(
    () => ({ length, maxWidth, curl, lift, lateral, cup }),
    [length, maxWidth, curl, lift, lateral, cup],
  );
  const geometries = useMemo(
    () => ({
      skin: createRibbonSurfaceGeometry(base),
      inner: createRibbonSurfaceGeometry({ ...base, inset: 0.66, yOffset: 0.007, tStart: 0.04, tEnd: 0.92 }),
      tip: createRibbonSurfaceGeometry({ ...base, inset: 0.82, yOffset: 0.011, tStart: 0.84, tEnd: 1, lengthSegments: 7 }),
      leftEdge: createRibbonEdgeGeometry(base, -1, 0.009),
      rightEdge: createRibbonEdgeGeometry(base, 1, 0.009),
    }),
    [base],
  );
  useEffect(
    () => () => disposeGeometries(Object.values(geometries)),
    [geometries],
  );

  const flat = Boolean(color);
  return (
    <group rotation={[0, yaw, 0]}>
      <mesh geometry={geometries.skin} castShadow receiveShadow>
        <meshStandardMaterial color={color ?? '#F4C20D'} roughness={0.58} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometries.leftEdge} castShadow>
        <meshStandardMaterial color={color ?? '#D79E05'} roughness={0.62} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometries.rightEdge} castShadow>
        <meshStandardMaterial color={color ?? '#D79E05'} roughness={0.62} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometries.inner} castShadow>
        <meshStandardMaterial color={color ?? '#FFF0B8'} roughness={0.68} side={THREE.DoubleSide} />
      </mesh>
      {!flat && (
        <mesh geometry={geometries.tip} castShadow>
          <meshStandardMaterial color="#8B5A2B" roughness={0.78} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function BananaPeel({ color }: { color?: string }) {
  const flaps = [
    { yaw: -0.62, length: 0.3, curl: 0.04, maxWidth: 0.082, lift: 0.012, lateral: 0.018, cup: 0.013 },
    { yaw: 2.18, length: 0.31, curl: 0.04, maxWidth: 0.068, lift: 0.012, lateral: 0.024, cup: 0.011 },
    { yaw: -2.16, length: 0.32, curl: 0.043, maxWidth: 0.07, lift: 0.014, lateral: -0.02, cup: 0.012 },
  ];
  return (
    <group position={[0, 0.012, 0]}>
      {flaps.map((flap) => (
        <BananaPeelFlap key={flap.yaw} {...flap} color={color} />
      ))}
      <mesh position={[0, 0.03, 0]} scale={[1.15, 0.42, 1.05]} castShadow>
        <sphereGeometry args={[0.038, 20, 14]} />
        <meshStandardMaterial color={color ?? '#FFE9A6'} roughness={0.7} />
      </mesh>
      <mesh position={[0.006, 0.058, -0.032]} rotation={[0.9, 0.08, -0.12]} castShadow>
        <capsuleGeometry args={[0.009, 0.055, 5, 12]} />
        <meshStandardMaterial color={color ?? '#5C371C'} roughness={0.8} />
      </mesh>
    </group>
  );
}

function KitchenBananaPeel({ color }: { color?: string }) {
  const parts = useMemo(() => createCrescentBananaGeometries(), []);
  const skinMap = useMemo(() => (color ? null : createBananaTexture()), [color]);

  useEffect(
    () => () => {
      parts.body.dispose();
      parts.stem.dispose();
      parts.flap1.dispose();
      parts.flap2.dispose();
      skinMap?.dispose();
    },
    [parts, skinMap],
  );

  const flat = Boolean(color);

  return (
    <group position={[0, 0.012, 0]} rotation={[0.08, -0.25, 0.04]} scale={1.14}>
      {/* 1. Main Curved Crescent Banana Body with 5-sided facets & texture */}
      <mesh geometry={parts.body} castShadow receiveShadow>
        <meshStandardMaterial
          color={color ?? '#FACC15'}
          map={skinMap ?? undefined}
          roughness={0.52}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Curved Woody Greenish-Brown Stem */}
      <mesh geometry={parts.stem} castShadow>
        <meshStandardMaterial color={color ?? '#365314'} roughness={0.82} />
      </mesh>

      {/* Cut tip cap of stem */}
      <mesh position={[-0.21, 0.098, 0.024]} rotation={[0.3, 0.2, 0.8]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.006, 8]} />
        <meshStandardMaterial color={color ?? '#84CC16'} roughness={0.7} />
      </mesh>

      {/* Green transition collar at base of stem */}
      <mesh position={[-0.17, 0.026, 0.03]} rotation={[0.2, 0.4, 0.6]} castShadow>
        <cylinderGeometry args={[0.014, 0.018, 0.016, 12]} />
        <meshStandardMaterial color={color ?? '#65A30D'} roughness={0.72} />
      </mesh>

      {/* 3. Peeled Front Flap curling onto the wooden counter */}
      <mesh geometry={parts.flap1} castShadow receiveShadow>
        <meshStandardMaterial
          color={color ?? '#FACC15'}
          map={skinMap ?? undefined}
          roughness={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Inner pale cream lining of front flap */}
      <mesh geometry={parts.flap1} position={[0, 0.003, 0]} castShadow>
        <meshStandardMaterial color={color ?? '#FEF9C3'} roughness={0.78} side={THREE.DoubleSide} />
      </mesh>

      {/* 4. Peeled Back Flap curling backward onto the counter */}
      <mesh geometry={parts.flap2} castShadow receiveShadow>
        <meshStandardMaterial
          color={color ?? '#FACC15'}
          map={skinMap ?? undefined}
          roughness={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Inner pale cream lining of back flap */}
      <mesh geometry={parts.flap2} position={[0, 0.003, 0]} castShadow>
        <meshStandardMaterial color={color ?? '#FEF9C3'} roughness={0.78} side={THREE.DoubleSide} />
      </mesh>

      {/* 5. Exposed Banana Fruit Core inside opening */}
      {!flat && (
        <mesh position={[0.0, 0.082, -0.04]} rotation={[0, 0.2, -0.1]} castShadow>
          <capsuleGeometry args={[0.026, 0.09, 6, 12]} />
          <meshStandardMaterial color="#FFFDE0" roughness={0.65} />
        </mesh>
      )}

      {/* 6. Dark Bruised Blossom End Tip */}
      {!flat && (
        <mesh position={parts.tipPos} scale={[1.1, 0.8, 1.1]} castShadow>
          <sphereGeometry args={[0.016, 10, 8]} />
          <meshStandardMaterial color="#6B3410" roughness={0.85} />
        </mesh>
      )}
    </group>
  );
}

function CurvedScrap({
  position,
  rotation,
  length,
  maxWidth,
  curl,
  lift,
  lateral,
  cup,
  outerColor,
  innerColor,
  edgeColor,
  color,
  opacity = 1,
  innerInset = 0.62,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
  maxWidth: number;
  curl: number;
  lift: number;
  lateral: number;
  cup: number;
  outerColor: string;
  innerColor?: string;
  edgeColor: string;
  color?: string;
  opacity?: number;
  innerInset?: number;
}) {
  const base = useMemo(
    () => ({ length, maxWidth, curl, lift, lateral, cup, lengthSegments: 22, widthSegments: 6 }),
    [length, maxWidth, curl, lift, lateral, cup],
  );
  const geometries = useMemo(
    () => ({
      outer: createRibbonSurfaceGeometry(base),
      inner: innerColor ? createRibbonSurfaceGeometry({ ...base, inset: innerInset, yOffset: 0.006, tStart: 0.05, tEnd: 0.92 }) : undefined,
      leftEdge: createRibbonEdgeGeometry(base, -1, 0.006),
      rightEdge: createRibbonEdgeGeometry(base, 1, 0.006),
    }),
    [base, innerColor, innerInset],
  );
  useEffect(
    () => () => disposeGeometries(Object.values(geometries).filter((geometry): geometry is THREE.BufferGeometry => Boolean(geometry))),
    [geometries],
  );

  const flatColor = color;
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometries.outer} castShadow receiveShadow>
        <meshStandardMaterial
          color={flatColor ?? outerColor}
          roughness={0.72}
          transparent={!flatColor && opacity < 1}
          opacity={flatColor ? 1 : opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={geometries.leftEdge} castShadow>
        <meshStandardMaterial color={flatColor ?? edgeColor} roughness={0.74} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometries.rightEdge} castShadow>
        <meshStandardMaterial color={flatColor ?? edgeColor} roughness={0.74} side={THREE.DoubleSide} />
      </mesh>
      {geometries.inner && (
        <mesh geometry={geometries.inner} castShadow>
          <meshStandardMaterial
            color={flatColor ?? innerColor}
            roughness={0.78}
            transparent={!flatColor && opacity < 1}
            opacity={flatColor ? 1 : Math.min(0.9, opacity + 0.12)}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

function KitchenVegetablePeels({ color }: { color?: string }) {
  const flat = Boolean(color);
  const carrotSpiral = useMemo(() => createCarrotSpiralGeometry(2.6, 0.036, 0.16), []);
  const carrotRing = useMemo(() => createCarrotSpiralGeometry(1.6, 0.024, 0.08), []);
  const onion = useMemo(() => createOnionSliceGeometry(), []);
  const potato = useMemo(() => createTwistedPeelGeometry(), []);
  const onionTexture = useMemo(() => (color ? null : createOnionTexture()), [color]);

  useEffect(
    () => () => {
      carrotSpiral.dispose();
      carrotRing.dispose();
      onion.dispose();
      potato.dispose();
      onionTexture?.dispose();
    },
    [carrotSpiral, carrotRing, onion, potato, onionTexture],
  );

  return (
    <group position={[-0.01, 0.006, 0]} scale={1.14}>
      {/* 1. Spiral Carrot Ribbon */}
      <mesh
        geometry={carrotSpiral}
        position={[-0.08, 0.004, 0.04]}
        rotation={[0.1, -0.4, 0.2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color ?? '#EA580C'} roughness={0.48} side={THREE.DoubleSide} />
      </mesh>

      {/* 2. Smaller Carrot Curl */}
      <mesh
        geometry={carrotRing}
        position={[0.06, 0.006, 0.08]}
        rotation={[0.2, 0.8, -0.3]}
        castShadow
      >
        <meshStandardMaterial color={color ?? '#F97316'} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* 3. Translucent Red Onion Skin */}
      <mesh
        geometry={onion}
        position={[0.02, 0.005, -0.06]}
        rotation={[0.15, 0.6, 0.1]}
        castShadow
      >
        <meshStandardMaterial
          color={color ?? '#9D174D'}
          map={onionTexture ?? undefined}
          transparent={!flat}
          opacity={flat ? 1 : 0.86}
          roughness={0.38}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4. Twisted Potato Peel */}
      <mesh
        geometry={potato}
        position={[-0.02, 0.004, -0.02]}
        rotation={[-0.1, 0.35, 0.05]}
        castShadow
      >
        <meshStandardMaterial color={color ?? '#854D0E'} roughness={0.72} side={THREE.DoubleSide} />
      </mesh>

      {/* 5. Fresh Herb / Celery Sprig */}
      {!flat && (
        <group position={[-0.14, 0.012, -0.05]} rotation={[0.1, 0.5, 0.2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.005, 0.008, 0.14, 6]} />
            <meshStandardMaterial color="#86EFAC" roughness={0.65} />
          </mesh>
          {[-0.035, 0, 0.035].map((off, idx) => (
            <mesh key={idx} position={[off, 0.065, 0]} rotation={[0, 0, (idx - 1) * 0.45]} castShadow>
              <coneGeometry args={[0.014, 0.03, 4]} />
              <meshStandardMaterial color="#16A34A" roughness={0.6} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function FoodPeels({ color }: { color?: string }) {
  const flat = Boolean(color);
  return (
    <group position={[-0.02, 0.006, -0.02]}>
      <CurvedScrap
        position={[-0.035, 0.004, 0.02]}
        rotation={[0.02, -0.58, -0.08]}
        length={0.28}
        maxWidth={0.046}
        curl={0.036}
        lift={0.01}
        lateral={0.04}
        cup={0.008}
        outerColor="#F97316"
        innerColor="#FDBA74"
        edgeColor="#C2410C"
        color={color}
        innerInset={0.5}
      />
      <CurvedScrap
        position={[0.0, 0.004, -0.08]}
        rotation={[0, 0.32, 0.08]}
        length={0.24}
        maxWidth={0.065}
        curl={0.025}
        lift={0.006}
        lateral={-0.035}
        cup={0.014}
        outerColor="#A66A3D"
        innerColor="#F2D8A7"
        edgeColor="#70421F"
        color={color}
        innerInset={0.58}
      />
      <CurvedScrap
        position={[0.08, 0.01, 0.05]}
        rotation={[0.03, 2.15, 0.18]}
        length={0.25}
        maxWidth={0.074}
        curl={0.03}
        lift={0.008}
        lateral={0.044}
        cup={0.017}
        outerColor="#B86AC9"
        innerColor="#FFF7ED"
        edgeColor="#8B3FA1"
        color={color}
        opacity={0.68}
        innerInset={0.54}
      />
      {!flat && (
        <>
          {[
            [-0.005, 0.052, -0.01],
            [0.045, 0.047, 0.0],
            [0.018, 0.05, -0.06],
          ].map(([x, y, z]) => (
            <mesh key={`${x}-${z}`} position={[x, y, z]} scale={[1, 0.28, 1]} castShadow>
              <sphereGeometry args={[0.009, 8, 6]} />
              <meshStandardMaterial color="#5C351A" roughness={0.82} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
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
            color={color ?? '#E5BCA0'}
            map={eggTexture ?? undefined}
            roughness={0.62}
            side={THREE.DoubleSide}
          />
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
            color={color ?? '#ECD0B8'}
            map={eggTexture ?? undefined}
            roughness={0.64}
            side={THREE.DoubleSide}
          />
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
      if (kitchen) return <KitchenBananaPeel color={color} />;
      return <BananaPeel color={color} />;
    case 'peels':
      if (kitchen) return <KitchenVegetablePeels color={color} />;
      return <FoodPeels color={color} />;
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
      return (
        <mesh castShadow>
          <sphereGeometry args={[0.22, 18, 14]} />
          <meshStandardMaterial color={color ?? '#475569'} roughness={0.86} />
        </mesh>
      );
    case 'wrapper':
      return (
        <RoundedBox args={[0.42, 0.045, 0.26]} radius={0.03} castShadow rotation={[0.2, 0.4, 0.1]}>
          <meshStandardMaterial color={color ?? '#F97316'} roughness={0.4} metalness={0.08} />
        </RoundedBox>
      );
    case 'containedSanitary':
      return (
        <RoundedBox args={[0.4, 0.14, 0.26]} radius={0.04} castShadow>
          <meshStandardMaterial color={color ?? '#FDA4AF'} roughness={0.7} />
        </RoundedBox>
      );
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
      return null;
  }
}
