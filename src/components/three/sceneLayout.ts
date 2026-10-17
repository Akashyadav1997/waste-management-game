import * as THREE from 'three';
import type { ChapterScene, ModelKind } from '../../game/types';
import { kitchenLayout } from './kitchenLayout';

export type ActorTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

export type SortingSurface = {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
};

/** Character, item and bin placement for one chapter camera. */
export type SceneFrame = {
  jyoti: ActorTransform;
  mum?: { position: [number, number, number]; rotation: [number, number, number] };
  items: THREE.Vector3[];
  itemYaw: number[];
  bins: THREE.Vector3[];
  /** Null when the room already has a table or vanity under the items. */
  surface: SortingSurface | null;
};

export type ModelDisplay = {
  scale: number;
  rotation: [number, number, number];
  offset: [number, number, number];
  selectionRadius?: number;
  selectionScale?: [number, number];
  hitSize?: [number, number, number];
};

export type ModelDisplayVariant = 'default' | 'kitchen';

const rest: ModelDisplay = {
  scale: 1,
  rotation: [0, 0, 0],
  offset: [0, 0, 0],
  selectionRadius: 0.3,
  hitSize: [0.56, 0.26, 0.48],
};

/** Per-model pose so each prop sits on the surface and keeps its own colours. */
export const modelDisplay: Record<ModelKind, ModelDisplay> = {
  banana: {
    scale: 1.06,
    rotation: [0.1, 0.5, 0],
    offset: [0, 0.012, 0],
    selectionRadius: 0.31,
    selectionScale: [1.08, 0.62],
    hitSize: [0.58, 0.18, 0.48],
  },
  peels: {
    scale: 1.2,
    rotation: [0, 0.2, 0],
    offset: [0, 0.012, 0],
    selectionRadius: 0.25,
    selectionScale: [1.04, 0.72],
    hitSize: [0.48, 0.16, 0.38],
  },
  eggshells: { ...rest, rotation: [0, 0.25, 0], selectionRadius: 0.24, hitSize: [0.46, 0.2, 0.38] },
  paper: { ...rest, rotation: [0, -0.2, 0], selectionRadius: 0.31, selectionScale: [1.12, 0.78] },
  cardboard: rest,
  bottle: rest,
  tube: { ...rest, rotation: [0, 0.35, 0] },
  sachet: { ...rest, rotation: [0, 0.45, 0], offset: [0, 0.03, 0] },
  bag: { scale: 0.9, rotation: [0, 0.25, 0], offset: [0, 0.2, 0] },
  wrapper: { ...rest, rotation: [0, 0.55, 0], offset: [0, 0.03, 0] },
  containedSanitary: { ...rest, offset: [0, 0.08, 0] },
  battery: { ...rest, rotation: [0, 0.4, 0] },
  actionCard: { ...rest, rotation: [0, -0.25, 0], offset: [0, 0.035, 0] },
  water: rest,
  buds: rest,
};

const kitchenModelDisplay: Partial<Record<ModelKind, ModelDisplay>> = {
  banana: {
    scale: 1.15,
    rotation: [0.04, 0.15, 0],
    offset: [0, 0, 0],
    selectionRadius: 0.36,
    selectionScale: [1.25, 0.8],
    hitSize: [0.72, 0.28, 0.52],
  },
  peels: {
    scale: 1.18,
    rotation: [0, -0.05, 0],
    offset: [0, 0, 0],
    selectionRadius: 0.3,
    selectionScale: [1.15, 0.85],
    hitSize: [0.58, 0.22, 0.46],
  },
  eggshells: {
    scale: 1.12,
    rotation: [0, 0.15, 0],
    offset: [0, 0, 0],
    selectionRadius: 0.3,
    selectionScale: [1.12, 0.88],
    hitSize: [0.54, 0.24, 0.44],
  },
  paper: {
    scale: 1.06,
    rotation: [0, -0.15, 0],
    offset: [0, 0, 0],
    selectionRadius: 0.34,
    selectionScale: [1.2, 0.85],
    hitSize: [0.6, 0.16, 0.46],
  },
  cardboard: {
    scale: 1,
    rotation: [0, -0.12, 0],
    offset: [0, 0, 0],
    selectionRadius: 0.32,
    selectionScale: [1.15, 0.9],
    hitSize: [0.54, 0.36, 0.44],
  },
  bottle: {
    scale: 1,
    rotation: [0, 0.08, 0],
    offset: [0, 0, 0],
    selectionRadius: 0.28,
    selectionScale: [0.85, 0.85],
    hitSize: [0.36, 0.54, 0.36],
  },
};

export function getModelDisplay(kind: ModelKind, variant: ModelDisplayVariant = 'default') {
  return variant === 'kitchen' ? (kitchenModelDisplay[kind] ?? modelDisplay[kind]) : modelDisplay[kind];
}

function v(x: number, y: number, z: number) {
  return new THREE.Vector3(x, y, z);
}

const outdoorJyoti: ActorTransform = {
  position: [-1.55, 0, 0.98],
  rotation: [0, 0.8, 0],
  scale: 1,
};

const phoneOutdoorJyoti: ActorTransform = {
  position: [-0.62, 0, 1.08],
  rotation: [0, 0.65, 0],
  scale: 0.64,
};

const floodJyoti: ActorTransform = {
  position: [-1.82, 0, 0.98],
  rotation: [0, 0.72, 0],
  scale: 0.94,
};

const phoneFloodJyoti: ActorTransform = {
  position: [-0.92, 0, 1.12],
  rotation: [0, 0.62, 0],
  scale: 0.58,
};

function outdoorItems(compact: boolean): THREE.Vector3[] {
  const y = 0.1;
  if (compact) {
    return [
      v(0.02, y, 0.9),
      v(-0.22, y, 0.72),
      v(0.26, y, 0.72),
      v(0.26, y, 1.02),
      v(-0.02, y, 1.08),
      v(0.1, y, 0.6),
    ];
  }
  return [
    v(0.12, y, 0.88),
    v(-0.3, y, 0.7),
    v(0.52, y, 0.7),
    v(0.78, y, 0.96),
    v(-0.02, y, 1.04),
    v(0.3, y, 0.58),
  ];
}

const outdoorYaw = [0.15, -0.45, 0.35, 0.05, -0.25, 0.5];

function outdoorSurface(color: string, compact: boolean): SortingSurface {
  return compact
    ? { position: [0.02, 0.05, 0.84], size: [1.05, 0.07, 0.62], color }
    : { position: [0.24, 0.05, 0.82], size: [1.8, 0.08, 0.62], color };
}

const bathroomItems = [
  v(-0.48, 0.775, 0.32),
  v(-0.08, 0.775, 0.52),
  v(0.28, 0.775, 0.2),
  v(0.58, 0.775, 0.48),
  v(0.82, 0.775, 0.14),
  v(0.08, 0.775, 0.02),
];

const phoneBathroomItems = [
  v(-0.22, 0.775, 0.34),
  v(0.1, 0.775, 0.52),
  v(0.38, 0.775, 0.2),
  v(0.62, 0.775, 0.44),
  v(0.72, 0.775, 0.1),
  v(0.18, 0.775, 0.04),
];

export function getSceneFrame(scene: ChapterScene, phone: boolean): SceneFrame {
  if (scene === 'kitchen') {
    return {
      jyoti: phone ? kitchenLayout.phoneJyoti : kitchenLayout.jyoti,
      mum: kitchenLayout.mum,
      items: [
        v(-0.62, kitchenLayout.tableTop, 0.36),
        v(-0.24, kitchenLayout.tableTop, 0.5),
        v(0.08, kitchenLayout.tableTop, 0.28),
        v(0.42, kitchenLayout.tableTop, 0.52),
        v(1.06, kitchenLayout.tableTop, 0.3),
        v(0.74, kitchenLayout.tableTop, 0.2),
      ],
      itemYaw: [0.15, -0.25, 0.18, -0.15, -0.18, 0.1],
      bins: phone ? kitchenLayout.phoneBins : kitchenLayout.bins,
      surface: null,
    };
  }

  if (scene === 'bathroom') {
    return {
      jyoti: phone
        ? { position: [-0.95, 0, 0.98], rotation: [0, 0.4, 0], scale: 0.78 }
        : { position: [-1.78, 0, 0.42], rotation: [0, 0.5, 0], scale: 1.04 },
      items: phone ? phoneBathroomItems : bathroomItems,
      itemYaw: [0.3, -0.2, 0.15, 0.4, -0.35, 0.05],
      bins: phone ? [v(-1.05, 0, 0.42), v(1.05, 0, 1.05)] : [v(-2.15, 0, 1.12), v(2.05, 0, 1.02)],
      surface: null,
    };
  }

  const surfaceColor = scene === 'school' ? '#E7D7A8' : scene === 'flood' ? '#E4EEF2' : scene === 'community' ? '#F3E0B8' : '#E4C48A';
  const bins = (() => {
    if (scene === 'flood') {
      return phone
        ? [v(-0.38, 0, 0.26), v(0.44, 0, 0.26)]
        : [v(-0.95, 0, 0.3), v(0.95, 0, 0.3)];
    }
    if (scene === 'community') {
      return phone
        ? [v(-0.78, 0, 0.4), v(-0.26, 0, 0.26), v(0.26, 0, 0.26), v(0.78, 0, 0.4)]
        : [v(-1.28, 0, 0.4), v(-0.42, 0, 0.26), v(0.48, 0, 0.26), v(1.38, 0, 0.4)];
    }
    return phone ? [v(-1.08, 0, 0.98), v(1.08, 0, 0.98)] : [v(-2.22, 0, 0.88), v(2.22, 0, 0.88)];
  })();

  return {
    jyoti: scene === 'flood' ? (phone ? phoneFloodJyoti : floodJyoti) : phone ? phoneOutdoorJyoti : outdoorJyoti,
    items: outdoorItems(phone),
    itemYaw: outdoorYaw,
    bins,
    surface: outdoorSurface(surfaceColor, phone),
  };
}

/** Matches the gameplay camera, including the narrower phone framing. */
export function frameCamera(camera: THREE.PerspectiveCamera, aspect: number, scene: ChapterScene) {
  const phone = aspect < 0.75;
  const narrow = aspect < 0.9;
  if (scene === 'kitchen') {
    const fov = phone ? 48 : narrow ? 40 : 36;
    const lookZ = 0.32;
    const span = phone ? 1.95 : 2.48;
    const distance = span / (Math.tan((fov * Math.PI) / 360) * Math.max(aspect, 0.42));
    camera.fov = fov;
    camera.position.set(0.04, phone ? 1.72 : 1.86, lookZ + distance);
    camera.lookAt(0.02, phone ? 0.58 : 0.72, lookZ);
  } else if (phone) {
    camera.fov = 50;
    camera.position.set(-0.02, 3.2, 6.2);
    camera.lookAt(-0.04, 0.5, 0.1);
  } else if (narrow) {
    camera.fov = 44;
    camera.position.set(0.08, 2.82, 5.4);
    camera.lookAt(0.06, 0.66, 0.16);
  } else {
    camera.fov = 38;
    camera.position.set(0.16, 2.42, 4.68);
    camera.lookAt(0.1, 0.68, 0.18);
  }
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
}
