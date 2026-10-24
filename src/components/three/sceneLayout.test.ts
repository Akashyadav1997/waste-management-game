import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import type { ChapterScene } from '../../game/types';
import { frameCamera, getSceneFrame, getRoundItemSpots } from './sceneLayout';

const scenes: ChapterScene[] = ['kitchen', 'bathroom', 'street', 'school', 'flood', 'community'];
const binCount: Record<ChapterScene, number> = {
  kitchen: 2,
  bathroom: 2,
  street: 2,
  school: 2,
  flood: 2,
  community: 4,
};
const bodyLocals = [
  new THREE.Vector3(0, 1.05, 0.1),
  new THREE.Vector3(0, 0.62, 0.14),
  new THREE.Vector3(-0.22, 0.72, 0.08),
  new THREE.Vector3(0.22, 0.72, 0.08),
];

function actorPoint(position: [number, number, number], rotationY: number, scale: number, local: THREE.Vector3) {
  const point = local.clone().multiplyScalar(scale);
  point.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);
  point.x += position[0];
  point.y += position[1];
  point.z += position[2];
  return point;
}

describe('scene layout', () => {
  it.each(scenes)('%s keeps Jyoti on screen and clear of the items', (scene) => {
    for (const aspect of [1.6, 0.5]) {
      const phone = aspect < 0.75;
      const frame = getSceneFrame(scene, phone);
      const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 40);
      frameCamera(camera, aspect, scene);
      const samples = bodyLocals.map((local) => actorPoint(frame.jyoti.position, frame.jyoti.rotation[1], frame.jyoti.scale, local));
      const head = samples[0].clone().project(camera);
      const label = `${scene} ${phone ? 'phone' : 'desktop'}`;
      expect(Math.abs(head.x), `${label} head x ${head.x.toFixed(2)}`).toBeLessThan(0.92);
      expect(head.y, `${label} head y ${head.y.toFixed(2)}`).toBeGreaterThan(-0.2);
      expect(head.y, `${label} head high`).toBeLessThan(0.95);

      getRoundItemSpots(scene, phone).forEach((item, index) => {
        const itemPoint = item.clone().add(new THREE.Vector3(0, 0.18, 0));
        const itemNdc = itemPoint.clone().project(camera);
        const itemView = itemPoint.clone().applyMatrix4(camera.matrixWorldInverse);
        samples.forEach((sample, sampleIndex) => {
          const sampleNdc = sample.clone().project(camera);
          const sampleView = sample.clone().applyMatrix4(camera.matrixWorldInverse);
          const itemInFront = itemView.z > sampleView.z - 0.08;
          const distance = Math.hypot(itemNdc.x - sampleNdc.x, itemNdc.y - sampleNdc.y);
          if (itemInFront) {
            expect(distance, `${label} item ${index} covers body ${sampleIndex} (${distance.toFixed(3)})`).toBeGreaterThan(0.11);
          }
        });
      });

      expect(frame.bins.length, label).toBeGreaterThanOrEqual(binCount[scene]);
      frame.bins.slice(0, binCount[scene]).forEach((bin, index) => {
        const opening = bin.clone();
        opening.y = 0.45;
        const ndc = opening.project(camera);
        expect(Math.abs(ndc.x), `${label} bin ${index} x ${ndc.x.toFixed(2)}`).toBeLessThan(1.12);
        expect(ndc.y, `${label} bin ${index} y ${ndc.y.toFixed(2)}`).toBeGreaterThan(-1);
      });

      if (frame.surface) {
        const [sx, , sz] = frame.surface.position;
        const [width, height, depth] = frame.surface.size;
        const top = frame.surface.position[1] + height / 2;
        getRoundItemSpots(scene, phone).forEach((item, index) => {
          expect(Math.abs(item.x - sx), `${label} item ${index} off the mat`).toBeLessThan(width / 2 - 0.05);
          expect(Math.abs(item.z - sz), `${label} item ${index} off the mat`).toBeLessThan(depth / 2 - 0.02);
          expect(item.y, `${label} item ${index} floating`).toBeGreaterThanOrEqual(top - 0.01);
          expect(item.y, `${label} item ${index} floating`).toBeLessThan(top + 0.06);
        });
      }
    }
  });

  it('keeps both flood bins visible and clear of Jyoti', () => {
    for (const aspect of [1.6, 0.5]) {
      const phone = aspect < 0.75;
      const frame = getSceneFrame('flood', phone);
      const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 40);
      frameCamera(camera, aspect, 'flood');

      const binCenters = frame.bins.slice(0, 2).map((bin) => {
        const center = bin.clone();
        center.y = 0.45;
        return center.project(camera);
      });
      const head = actorPoint(frame.jyoti.position, frame.jyoti.rotation[1], frame.jyoti.scale, bodyLocals[0]).project(camera);
      const label = phone ? 'phone' : 'desktop';

      binCenters.forEach((center, index) => {
        expect(Math.abs(center.x), `${label} flood bin ${index} x ${center.x.toFixed(2)}`).toBeLessThan(0.82);
      });
      expect(
        Math.abs(binCenters[0].x - head.x),
        `${label} wet bin overlaps Jyoti`,
      ).toBeGreaterThan(phone ? 0.2 : 0.24);
    }
  });
});
