import * as THREE from 'three';
import { binMetrics } from './kitchenLayout';

/** A camera-facing plane keeps the grabbed point attached in screen space. */
export function createDragAnchor(camera: THREE.Camera, grabbedPoint: THREE.Vector3, origin: THREE.Vector3) {
  return {
    plane: new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), grabbedPoint),
    offset: origin.clone().sub(grabbedPoint),
  };
}

export function moveDragAnchor(ray: THREE.Ray, anchor: ReturnType<typeof createDragAnchor>, target: THREE.Vector3) {
  const hit = ray.intersectPlane(anchor.plane, new THREE.Vector3());
  if (hit) target.copy(hit).add(anchor.offset);
}

/** Hit only the visible bin geometry, independent of the item being carried. */
export function binUnderRay(raycaster: THREE.Raycaster, bins: THREE.Object3D[]) {
  const hit = raycaster.intersectObjects(bins, true)[0];
  if (!hit) return undefined;
  let object: THREE.Object3D | null = hit.object;
  while (object && !bins.includes(object)) object = object.parent;
  return object?.name;
}

/** A forgiving area around the whole bin; hover and release use the same target. */
export function binDropTarget(raycaster: THREE.Raycaster, bins: THREE.Object3D[]) {
  const directHit = binUnderRay(raycaster, bins);
  if (directHit) return directHit;
  const { width, depth, height, bodyLift } = binMetrics;
  const catchArea = new THREE.Box3(
    new THREE.Vector3(-width / 2 - 0.18, -0.08, -depth / 2 - 0.18),
    new THREE.Vector3(width / 2 + 0.18, height + bodyLift + 0.32, depth / 2 + 0.18),
  );
  let closest: string | undefined;
  let distance = Infinity;
  for (const bin of bins) {
    const ray = raycaster.ray.clone().applyMatrix4(bin.matrixWorld.clone().invert());
    const hit = ray.intersectBox(catchArea, new THREE.Vector3());
    if (!hit) continue;
    const nextDistance = hit.applyMatrix4(bin.matrixWorld).distanceTo(raycaster.ray.origin);
    if (nextDistance < distance) { closest = bin.name; distance = nextDistance; }
  }
  return closest;
}

/** Brief easing, capped at eight screen pixels so the item cannot trail far behind. */
export function smoothDragPosition(current: THREE.Vector3, target: THREE.Vector3, camera: THREE.Camera, viewportHeight: number, delta: number, reducedMotion: boolean) {
  if (reducedMotion || !(camera instanceof THREE.PerspectiveCamera)) {
    current.copy(target);
    return;
  }
  current.lerp(target, 1 - Math.exp(-30 * delta));
  const depth = Math.abs(target.clone().applyMatrix4(camera.matrixWorldInverse).z);
  const maxGap = 8 * (2 * depth * Math.tan(THREE.MathUtils.degToRad(camera.getEffectiveFOV() / 2))) / Math.max(viewportHeight, 1);
  const gap = current.distanceTo(target);
  if (gap > maxGap) current.lerp(target, 1 - maxGap / gap);
}
