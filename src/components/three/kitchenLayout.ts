import * as THREE from 'three';

/** Shared by the bin mesh, its opening and the kitchen drop targets. */
export const binMetrics = {
  width: 0.5,
  depth: 0.44,
  height: 0.72,
  wall: 0.04,
  bodyLift: 0.04,
  catchRadius: 0.64,
  interiorY: 0.3,
};

export const kitchenLayout = {
  tablePosition: [0.16, 0, 0.36] as [number, number, number],
  tableTop: 0.82,
  jyoti: {
    position: [-1.08, 0, 0.98] as [number, number, number],
    rotation: [0, -0.22, 0] as [number, number, number],
    scale: 1,
  },
  mum: {
    position: [0.55, 0, -0.42] as [number, number, number],
    rotation: [0, 0.2, 0] as [number, number, number],
  },
  bins: [new THREE.Vector3(-1.92, 0, 0.4), new THREE.Vector3(1.86, 0, 0.4)],
  phoneBins: [new THREE.Vector3(-1.42, 0, 0.28), new THREE.Vector3(1.5, 0, 0.28)],
  phoneJyoti: {
    position: [-0.78, 0, 0.72] as [number, number, number],
    rotation: [0, -0.12, 0] as [number, number, number],
    scale: 0.92,
  },
};

export const kitchenItemSpots = [
  new THREE.Vector3(-0.28, kitchenLayout.tableTop, 0.22),
  new THREE.Vector3(0.08, kitchenLayout.tableTop, 0.52),
  new THREE.Vector3(0.42, kitchenLayout.tableTop, 0.2),
  new THREE.Vector3(0.72, kitchenLayout.tableTop, 0.5),
  new THREE.Vector3(1.0, kitchenLayout.tableTop, 0.18),
  new THREE.Vector3(0.36, kitchenLayout.tableTop, 0.74),
];
