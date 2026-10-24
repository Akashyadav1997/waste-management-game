import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { binDropTarget, binUnderRay, createDragAnchor, moveDragAnchor, smoothDragPosition } from './dragInteraction';
import { frameCamera } from './sceneLayout';

describe('drag alignment', () => {
  for (const aspect of [1.6, 0.5]) {
    for (const scene of ['school', 'kitchen', 'bathroom'] as const) {
      it(`keeps an off-centre grab under the pointer in ${scene} at aspect ${aspect}`, () => {
        const camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 40);
        frameCamera(camera, aspect, scene);
        const origin = new THREE.Vector3(0.3, 0.4, 0.2);
        const grab = origin.clone().add(new THREE.Vector3(0.12, 0.15, 0.08));
        const anchor = createDragAnchor(camera, grab, origin);
        const raycaster = new THREE.Raycaster();
        const position = origin.clone();
        for (const pointer of [new THREE.Vector2(-0.8, -0.2), new THREE.Vector2(0.7, 0.5), new THREE.Vector2(0, -0.8)]) {
          raycaster.setFromCamera(pointer, camera);
          moveDragAnchor(raycaster.ray, anchor, position);
          const projectedGrab = position.clone().sub(anchor.offset).project(camera);
          expect(projectedGrab.x).toBeCloseTo(pointer.x, 7);
          expect(projectedGrab.y).toBeCloseTo(pointer.y, 7);
        }
      });
    }
  }

  it('targets visible rotated bin geometry and leaves nearby empty space untargeted', () => {
    const bin = new THREE.Group();
    bin.name = 'dry-bin';
    bin.rotation.y = 0.25;
    bin.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.72, 0.44), new THREE.MeshBasicMaterial()));
    bin.updateMatrixWorld(true);
    const ray = new THREE.Raycaster(new THREE.Vector3(0, 0, 3), new THREE.Vector3(0, 0, -1));
    expect(binUnderRay(ray, [bin])).toBe('dry-bin');
    ray.ray.origin.x = 0.6;
    expect(binUnderRay(ray, [bin])).toBeUndefined();
  });

  it('accepts nearby drops around the mouth and body, but not distant space', () => {
    const bin = new THREE.Group();
    bin.name = 'wet-bin';
    bin.position.x = 1;
    bin.updateMatrixWorld(true);
    const ray = new THREE.Raycaster(new THREE.Vector3(1.32, 0.9, 3), new THREE.Vector3(0, 0, -1));
    expect(binDropTarget(ray, [bin])).toBe('wet-bin');
    ray.ray.origin.y = 0.3;
    expect(binDropTarget(ray, [bin])).toBe('wet-bin');
    ray.ray.origin.set(1.6, 0.9, 3);
    expect(binDropTarget(ray, [bin])).toBeUndefined();
  });

  for (const fps of [30, 60, 120]) {
    it(`eases motion with at most eight pixels of lag at ${fps} fps`, () => {
      const camera = new THREE.PerspectiveCamera(40, 1.5, 0.1, 40);
      camera.position.z = 5;
      camera.updateMatrixWorld(true);
      const current = new THREE.Vector3(-1, 0, 0);
      const target = new THREE.Vector3(1, 0, 0);
      smoothDragPosition(current, target, camera, 900, 1 / fps, false);
      const pixels = (target.clone().project(camera).x - current.clone().project(camera).x) * 1350 / 2;
      expect(pixels).toBeGreaterThan(0);
      expect(pixels).toBeLessThanOrEqual(8.001);
      for (let i = 0; i < fps / 4; i++) smoothDragPosition(current, target, camera, 900, 1 / fps, false);
      expect(current.distanceTo(target)).toBeLessThan(0.001);
      smoothDragPosition(current, new THREE.Vector3(), camera, 900, 1 / fps, true);
      expect(current.length()).toBe(0);
    });
  }
});
