import { BathroomVanity } from './BathroomVanity';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Billboard, ContactShadows, RoundedBox, useCursor } from '@react-three/drei';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { destinations } from '../../data/bins';
import { getChapter } from '../../data/chapters';
import { getWasteItem } from '../../data/wasteItems';
import type { Chapter, Destination, WasteItem } from '../../game/types';
import { useGameStore } from '../../state/gameStore';
import { Jyoti, Mother } from './Characters';
import { KitchenSet } from './KitchenSet';
import { binMetrics } from './kitchenLayout';
import { frameCamera, getModelDisplay, getSceneFrame, getRoundItemSpots, type ModelDisplayVariant } from './sceneLayout';
import { getSortingRound } from '../../game/rounds';
import { WasteShape, type WasteShapeVariant } from './WasteShapes';

const DRAG_HEIGHT = 1.05;
const CATCH_RADIUS = 1.05;

function nearestDestinationId(
  point: THREE.Vector3,
  slots: THREE.Vector3[],
  list: Destination[],
  radius = CATCH_RADIUS,
): string | undefined {
  let bestId: string | undefined;
  let bestDistance = radius;
  list.forEach((destination, index) => {
    const slot = slots[index];
    if (!slot) return;
    const distance = Math.hypot(point.x - slot.x, point.z - slot.z);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestId = destination.id;
    }
  });
  return bestId;
}

function destinationUnderPointer(
  event: PointerEvent,
  camera: THREE.Camera,
  canvas: HTMLCanvasElement,
  slots: THREE.Vector3[],
  list: Destination[],
): string | undefined {
  const rect = canvas.getBoundingClientRect();
  const pointerX = event.clientX - rect.left;
  const pointerY = event.clientY - rect.top;
  let bestId: string | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  const binWidth = binMetrics.width * 1.65;
  const binDepth = binMetrics.depth * 1.65;
  const binHeight = binMetrics.height + binMetrics.bodyLift + 0.24;

  list.forEach((destination, index) => {
    const slot = slots[index];
    if (!slot) return;

    const projected = [
      [-binWidth / 2, 0, -binDepth / 2],
      [-binWidth / 2, 0, binDepth / 2],
      [binWidth / 2, 0, -binDepth / 2],
      [binWidth / 2, 0, binDepth / 2],
      [-binWidth / 2, binHeight, -binDepth / 2],
      [-binWidth / 2, binHeight, binDepth / 2],
      [binWidth / 2, binHeight, -binDepth / 2],
      [binWidth / 2, binHeight, binDepth / 2],
    ].map(([x, y, z]) => {
      const point = new THREE.Vector3(slot.x + x, y, slot.z + z).project(camera);
      return {
        x: ((point.x + 1) / 2) * rect.width,
        y: ((-point.y + 1) / 2) * rect.height,
      };
    });

    const minX = Math.min(...projected.map((point) => point.x)) - 24;
    const maxX = Math.max(...projected.map((point) => point.x)) + 24;
    const minY = Math.min(...projected.map((point) => point.y)) - 24;
    const maxY = Math.max(...projected.map((point) => point.y)) + 24;
    if (pointerX < minX || pointerX > maxX || pointerY < minY || pointerY > maxY) return;

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const distance = Math.hypot(pointerX - centerX, pointerY - centerY);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestId = destination.id;
    }
  });

  return bestId;
}

type DragSession = {
  itemId: string;
  pointerId: number;
  point: THREE.Vector3;
  offset: THREE.Vector3;
  hoverId?: string;
};

type Props = {
  chapter: Chapter;
  reducedMotion: boolean;
  onItemSelect: (itemId?: string) => void;
  onDestination: (itemId: string, destinationId: string) => void;
  onItemHover?: (itemName?: string) => void;
  sortedDestinations: Record<string, string>;
};

export function GameScene({
  chapter,
  reducedMotion,
  onItemSelect,
  onDestination,
  onItemHover,
  sortedDestinations,
  onReady,
}: Props & { onReady?: () => void }) {
  const settings = useGameStore((state) => state.settings);
  const draggingRef = useRef(false);
  const kitchen = chapter.scene === 'kitchen';
  const bathroom = chapter.scene === 'bathroom';

  return (
    <Canvas
      shadows={!settings.lowQuality}
      dpr={settings.lowQuality ? [0.75, 1] : [1, 1.5]}
      camera={{ position: [0.28, 1.62, 4.15], fov: 36, near: 0.1, far: 40 }}
      gl={{ antialias: !settings.lowQuality, powerPreference: settings.lowQuality ? 'low-power' : 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        onReady?.();
      }}
      onPointerMissed={() => {
        if (!draggingRef.current) onItemSelect(undefined);
      }}
    >
      <color attach="background" args={[kitchen ? '#F6E6D0' : '#FAF5E8']} />
      <ambientLight intensity={kitchen ? 0.38 : 0.8} color={kitchen ? '#FFF4E4' : '#FFFFFF'} />
      <hemisphereLight args={kitchen ? ['#FFF6E4', '#E7C4A0', 0.7] : bathroom ? ['#F4FAFF', '#B9CDCF', 0.75] : ['#FFF7ED', '#FED7AA', 0.65]} />
      {kitchen ? (
        <>
          <directionalLight
            castShadow={!settings.lowQuality}
            position={[3.4, 4.6, 2.4]}
            intensity={1.75}
            color="#FFF1D0"
            shadow-mapSize={[settings.lowQuality ? 512 : 2048, settings.lowQuality ? 512 : 2048]}
            shadow-bias={-0.00025}
            shadow-normalBias={0.035}
            shadow-camera-near={0.4}
            shadow-camera-far={16}
            shadow-camera-left={-6}
            shadow-camera-right={6}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />
          <directionalLight position={[-2.8, 2.4, 2.6]} intensity={0.55} color="#FFE8CC" />
          <pointLight position={[2.3, 1.9, -1.8]} intensity={1.4} distance={5.5} decay={2} color="#FFD78A" />
        </>
      ) : (
        <>
          <directionalLight
            castShadow={!settings.lowQuality}
            position={[4.5, 6.5, 4.0]}
            intensity={bathroom ? 1.9 : 2.4}
            color={bathroom ? '#F6FAFF' : '#FEF08A'}
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          <directionalLight position={[-3.5, 3.0, 3.5]} intensity={0.45} color="#BAE6FD" />
        </>
      )}
      <SceneContents
        chapter={chapter}
        reducedMotion={reducedMotion}
        onItemSelect={onItemSelect}
        onDestination={onDestination}
        onItemHover={onItemHover}
        sortedDestinations={sortedDestinations}
        draggingRef={draggingRef}
        lowQuality={settings.lowQuality}
      />
    </Canvas>
  );
}

function SceneContents({
  chapter,
  reducedMotion,
  onItemSelect,
  onDestination,
  onItemHover,
  sortedDestinations,
  draggingRef,
  lowQuality,
}: Props & { draggingRef: MutableRefObject<boolean>; lowQuality: boolean }) {
  const { camera, gl, size } = useThree();
  const selectedItemId = useGameStore((state) => state.selectedItemId);
  const completedItemIds = useGameStore((state) => state.completedItemIds);
  const status = useGameStore((state) => state.status);
  const chapterDestinations = useMemo(
    () => destinations.filter((destination) => chapter.destinationIds.includes(destination.id)),
    [chapter.destinationIds],
  );
  const phoneLayout = size.width / Math.max(size.height, 1) < 0.75;
  const frame = useMemo(() => getSceneFrame(chapter.scene, phoneLayout), [chapter.scene, phoneLayout]);
  const round = getSortingRound(chapter, completedItemIds);
  const spots = useMemo(() => getRoundItemSpots(chapter.scene, phoneLayout), [chapter.scene, phoneLayout]);
  const slots = useMemo(
    () => frame.bins.slice(0, chapterDestinations.length),
    [chapterDestinations.length, frame.bins],
  );
  const dragRef = useRef<DragSession | null>(null);
  const dropHandledRef = useRef(false);
  const [draggingId, setDraggingId] = useState<string | undefined>();
  const [hoverId, setHoverId] = useState<string | undefined>();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -DRAG_HEIGHT), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const onDestinationRef = useRef(onDestination);
  const slotsRef = useRef(slots);
  const destinationsRef = useRef(chapterDestinations);
  const catchRadiusRef = useRef(CATCH_RADIUS);
  onDestinationRef.current = onDestination;
  slotsRef.current = slots;
  destinationsRef.current = chapterDestinations;
  catchRadiusRef.current = chapter.scene === 'kitchen' ? binMetrics.catchRadius : CATCH_RADIUS;

  const pointOnPlane = (event: PointerEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, camera);
    const hit = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(plane, hit)) return null;
    hit.x = THREE.MathUtils.clamp(hit.x, -5.5, 5.5);
    hit.z = THREE.MathUtils.clamp(hit.z, -3.5, 3.2);
    hit.y = DRAG_HEIGHT;
    return hit;
  };
  const pointOnPlaneRef = useRef(pointOnPlane);
  pointOnPlaneRef.current = pointOnPlane;

  useEffect(() => {
    const updateHover = (session: DragSession, event: PointerEvent) => {
      const pointerHover = destinationUnderPointer(event, camera, gl.domElement, slotsRef.current, destinationsRef.current);
      const nextHover = pointerHover ?? nearestDestinationId(session.point, slotsRef.current, destinationsRef.current, catchRadiusRef.current);
      if (nextHover === session.hoverId) return;
      session.hoverId = nextHover;
      setHoverId(nextHover);
    };

    const onMove = (event: PointerEvent) => {
      const session = dragRef.current;
      if (!session || event.pointerId !== session.pointerId) return;
      const hit = pointOnPlaneRef.current(event);
      if (!hit) return;
      session.point.set(hit.x + session.offset.x, DRAG_HEIGHT, hit.z + session.offset.z);
      updateHover(session, event);
    };

    const finishDrag = (event: PointerEvent) => {
      const session = dragRef.current;
      if (!session || event.pointerId !== session.pointerId) return;
      const hit = pointOnPlaneRef.current(event);
      if (hit) session.point.set(hit.x + session.offset.x, DRAG_HEIGHT, hit.z + session.offset.z);
      const destinationId =
        destinationUnderPointer(event, camera, gl.domElement, slotsRef.current, destinationsRef.current) ??
        nearestDestinationId(session.point, slotsRef.current, destinationsRef.current, catchRadiusRef.current);
      dragRef.current = null;
      draggingRef.current = false;
      setDraggingId(undefined);
      setHoverId(undefined);
      if (destinationId) {
        dropHandledRef.current = true;
        onDestinationRef.current(session.itemId, destinationId);
        window.setTimeout(() => {
          dropHandledRef.current = false;
        }, 0);
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
    };
  }, [camera, draggingRef, gl.domElement]);

  const beginDrag = (itemId: string, origin: THREE.Vector3, event: ThreeEvent<PointerEvent>) => {
    if (status !== 'playing' || completedItemIds.includes(itemId)) return;
    event.stopPropagation();
    const hit = pointOnPlane(event.nativeEvent);
    const point = hit ? hit.clone() : origin.clone();
    const offset = new THREE.Vector3(origin.x - point.x, 0, origin.z - point.z);
    point.set(origin.x, DRAG_HEIGHT, origin.z);
    dragRef.current = { itemId, pointerId: event.pointerId, point, offset };
    draggingRef.current = true;
    setDraggingId(itemId);
    setHoverId(undefined);
    onItemSelect(itemId);
    try {
      gl.domElement.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is optional
    }
  };

  const kitchen = chapter.scene === 'kitchen';
  const wasteShapeVariant: WasteShapeVariant = chapter.id === 'kitchen' ? 'kitchen' : 'default';
  const modelDisplayVariant: ModelDisplayVariant = wasteShapeVariant;

  return (
    <>
      <CameraRig />
      <group>
        <Diorama scene={chapter.scene} />

        {frame.surface && (
          <group position={frame.surface.position}>
            <RoundedBox args={frame.surface.size} radius={0.04} receiveShadow>
              <meshStandardMaterial color={frame.surface.color} roughness={0.84} />
            </RoundedBox>
          </group>
        )}

        <Jyoti
          reducedMotion={reducedMotion}
          position={frame.jyoti.position}
          rotation={frame.jyoti.rotation}
          scale={frame.jyoti.scale}
        />

        {frame.mum && (
          <Mother
            reducedMotion={reducedMotion}
            position={frame.mum.position}
            rotation={frame.mum.rotation}
          />
        )}

        {/* Interactive Waste Items on the sorting table */}
        {round.itemIds.map((itemId, index) => {
          const item = getWasteItem(itemId);
          if (!item) return null;
          return (
            <InteractiveWaste
              key={`${chapter.id}-${item.id}`}
              item={item}
              sceneScale={chapter.scene === 'kitchen' || chapter.scene === 'bathroom' ? 1 : phoneLayout ? 0.58 : 0.85}
              origin={spots[index] ?? new THREE.Vector3(0, 0.7, 0)}
              selected={selectedItemId === item.id}
              completed={completedItemIds.includes(item.id)}
              dragging={draggingId === item.id}
              dragPoint={draggingId === item.id ? dragRef.current?.point : undefined}
              sortedSlot={slots[chapterDestinations.findIndex((destination) => destination.id === sortedDestinations[item.id])]}
              spotYaw={frame.itemYaw[index] ?? 0}
              variant={wasteShapeVariant}
              displayVariant={modelDisplayVariant}
              onDragStart={(event) => beginDrag(item.id, spots[index] ?? new THREE.Vector3(0, 0.7, 0), event)}
              onHoverChange={(hovered) => {
                if (onItemHover) onItemHover(hovered ? item.displayName : undefined);
              }}
            />
          );
        })}

        {/* Only canonical waste bins are rendered as dustbins. */}
        {chapterDestinations.map((destination, index) => (
          <DestinationModel
            key={destination.id}
            destination={destination}
            position={slots[index] ?? new THREE.Vector3(index === 0 ? -1.95 : 2.35, 0, 0.75)}
            rotation={kitchen ? [0, 0, 0] : index === 0 ? [0, 0.25, 0] : [0, -0.25, 0]}
            highlighted={hoverId === destination.id}
            selectedItemId={selectedItemId}
            dropHandledRef={dropHandledRef}
            onDestination={onDestination}
          />
        ))}
      </group>
      {!lowQuality && (
        <ContactShadows position={[0, 0.01, kitchen ? 0.25 : 0]} opacity={kitchen ? 0.16 : 0.28} scale={kitchen ? 12 : 9} blur={2.8} far={3.2} />
      )}
    </>
  );
}

function CameraRig() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const chapterId = useGameStore((state) => state.chapterId);
  useFrame(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const aspect = size.width / Math.max(size.height, 1);
    frameCamera(camera, aspect, getChapter(chapterId)?.scene ?? 'kitchen');
  });
  return null;
}

function Diorama({ scene }: { scene: Chapter['scene'] }) {
  if (scene === 'kitchen') return <KitchenSet />;
  if (scene === 'bathroom') return <BathroomSet />;
  return (
    <group>
      <RoundedBox args={[8.5, 0.28, 7]} radius={0.15} position={[0, -0.16, 0.2]} receiveShadow>
        <meshStandardMaterial color={scene === 'flood' ? '#8fb7c8' : '#e7c982'} roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[8.6, 0.18, 0.22]} radius={0.08} position={[0, 0.03, -3.2]}>
        <meshStandardMaterial color="#d7a15d" />
      </RoundedBox>
      {/* Backdrop wall for outdoor scenes */}
      <mesh position={[0, 3.4, -3.35]} receiveShadow>
        <boxGeometry args={[18, 6.8, 0.22]} />
        <meshStandardMaterial color={scene === 'school' ? '#FEF08A' : scene === 'street' ? '#FED7AA' : '#E2E8F0'} roughness={0.9} />
      </mesh>
      {scene === 'street' && <StreetSet />}
      {scene === 'school' && <SchoolSet />}
      {scene === 'flood' && <FloodSet />}
      {scene === 'community' && <CommunitySet />}
    </group>
  );
}


function createBathroomTilesTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 4);
  if (!context) return texture;

  // Soft fresh cyan/mint ceramic subway tiles
  context.fillStyle = '#CBD5E1'; // clean mortar grout
  context.fillRect(0, 0, size, size);

  const rows = 8;
  const rowH = size / rows;
  const brickW = size / 4;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (brickW / 2);
    for (let c = -1; c < 5; c++) {
      const x = c * brickW + offset;
      const y = r * rowH;
      // Soft gentle pastel ceramic tiles with subtle shade variation
      context.fillStyle = r % 2 === 0 ? '#F0F9FF' : '#E0F2FE';
      context.fillRect(x + 2, y + 2, brickW - 4, rowH - 4);
      // subtle gloss highlight
      context.fillStyle = 'rgba(255, 255, 255, 0.45)';
      context.fillRect(x + 3, y + 3, brickW - 6, 2);
    }
  }

  texture.needsUpdate = true;
  return texture;
}

function RoomClock({ position = [0.2, 2.5, -3.22] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Outer wooden / teal bezel frame */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.05, 32]} />
        <meshStandardMaterial color="#0284C7" roughness={0.4} />
      </mesh>
      {/* Clock Face */}
      <mesh position={[0, 0, 0.028]}>
        <circleGeometry args={[0.33, 32]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>
      {/* 12 Hour tick dots */}
      {Array.from({ length: 12 }).map((_, i) => {
        const rad = (i * Math.PI) / 6;
        const radius = 0.27;
        return (
          <mesh key={i} position={[Math.sin(rad) * radius, Math.cos(rad) * radius, 0.032]}>
            <circleGeometry args={[i % 3 === 0 ? 0.018 : 0.01, 12]} />
            <meshBasicMaterial color="#0F172A" />
          </mesh>
        );
      })}
      {/* Hour Hand (pointing at 10) */}
      <mesh position={[-0.07, 0.06, 0.035]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.024, 0.16, 0.005]} />
        <meshBasicMaterial color="#0F172A" />
      </mesh>
      {/* Minute Hand (pointing at 2) */}
      <mesh position={[0.08, 0.07, 0.036]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.018, 0.21, 0.005]} />
        <meshBasicMaterial color="#0F172A" />
      </mesh>
      {/* Center Pivot Pin */}
      <mesh position={[0, 0, 0.04]}>
        <circleGeometry args={[0.026, 16]} />
        <meshBasicMaterial color="#E11D48" />
      </mesh>
    </group>
  );
}

function BathroomSet() {
  const wallTexture = useMemo(() => createBathroomTilesTexture(), []);
  useEffect(() => () => wallTexture.dispose(), [wallTexture]);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.35]} receiveShadow>
        <planeGeometry args={[18, 16]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
      </mesh>

      {/* Tiled Back Wall */}
      <mesh position={[0, 3.4, -3.35]} receiveShadow>
        <boxGeometry args={[20, 6.8, 0.22]} />
        <meshStandardMaterial map={wallTexture} roughness={0.45} />
      </mesh>
      {/* Baseboard along bottom of wall */}
      <mesh position={[0, 0.1, -3.22]}>
        <boxGeometry args={[20, 0.2, 0.06]} />
        <meshStandardMaterial color="#38BDF8" roughness={0.6} />
      </mesh>

      {/* Cozy Wall Clock - clearly visible below header */}
      <RoomClock position={[0.7, 2.1, -3.22]} />

      {/* Wall Mirror above vanity */}
      <group position={[-1.2, 1.9, -3.22]}>
        <RoundedBox args={[1.3, 1.35, 0.06]} radius={0.08} castShadow>
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </RoundedBox>
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[1.15, 1.2]} />
          <meshStandardMaterial color="#E0F2FE" roughness={0.1} metalness={0.7} />
        </mesh>
      </group>

      {/* Bathroom Shelf with toiletries and cute potted succulent */}
      <group position={[1.5, 1.85, -3.22]}>
        <RoundedBox args={[1.5, 0.08, 0.32]} radius={0.03} castShadow>
          <meshStandardMaterial color="#BAE6FD" roughness={0.4} />
        </RoundedBox>
        {/* Shampoo bottle */}
        <mesh position={[-0.45, 0.22, 0.04]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.36, 16]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.3} />
        </mesh>
        {/* Soap dish with soap */}
        <RoundedBox args={[0.24, 0.04, 0.16]} radius={0.02} position={[-0.1, 0.06, 0.04]} castShadow>
          <meshStandardMaterial color="#F8FAFC" />
        </RoundedBox>
        <RoundedBox args={[0.18, 0.05, 0.11]} radius={0.02} position={[-0.1, 0.1, 0.04]} castShadow>
          <meshStandardMaterial color="#F472B6" />
        </RoundedBox>
        {/* Potted succulent plant */}
        <mesh position={[0.42, 0.12, 0.04]} castShadow>
          <cylinderGeometry args={[0.1, 0.07, 0.16, 16]} />
          <meshStandardMaterial color="#D97706" />
        </mesh>
        <mesh position={[0.42, 0.24, 0.04]} castShadow>
          <sphereGeometry args={[0.11, 14, 14]} />
          <meshStandardMaterial color="#16A34A" roughness={0.7} />
        </mesh>
      </group>

      <BathroomVanity />

      {/* Ground Drain with metallic cover */}
      <group position={[2.25, 0.02, 0.75]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.32, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[0.1, 0.3, 16]} />
          <meshBasicMaterial color="#64748B" wireframe />
        </mesh>
      </group>
    </group>
  );
}

function StreetSet() {
  return (
    <group>
      <RoundedBox args={[2.2, 0.5, 0.8]} radius={0.07} position={[-2, 0.28, -1.8]} castShadow>
        <meshStandardMaterial color="#e0a35a" />
      </RoundedBox>
      <RoundedBox args={[1.2, 0.25, 0.75]} radius={0.1} position={[1.7, 0.15, -1.5]} castShadow>
        <meshStandardMaterial color="#99aa7c" />
      </RoundedBox>
      <mesh position={[2.2, 0.45, -1.4]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function SchoolSet() {
  return (
    <group>
      <RoundedBox args={[4.5, 0.8, 0.45]} radius={0.08} position={[0, 0.45, -2]} castShadow>
        <meshStandardMaterial color="#de8d6f" />
      </RoundedBox>
      <RoundedBox args={[0.6, 0.9, 0.1]} radius={0.03} position={[-1.2, 0.55, -1.73]}>
        <meshStandardMaterial color="#7fb7d8" />
      </RoundedBox>
      <RoundedBox args={[0.6, 0.9, 0.1]} radius={0.03} position={[1.2, 0.55, -1.73]}>
        <meshStandardMaterial color="#7fb7d8" />
      </RoundedBox>
    </group>
  );
}

function FloodSet() {
  return (
    <group>
      <RoundedBox args={[6, 0.05, 2.1]} radius={0.12} position={[0, 0.03, -0.8]}>
        <meshStandardMaterial color="#75a9bf" transparent opacity={0.72} />
      </RoundedBox>
      <RoundedBox args={[1.2, 0.2, 0.65]} radius={0.04} position={[1.7, 0.15, -1.7]}>
        <meshStandardMaterial color="#46515c" />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.08, 0.18]} radius={0.02} position={[1.7, 0.36, -1.7]}>
        <meshStandardMaterial color="#f2c94c" />
      </RoundedBox>
    </group>
  );
}

function CommunitySet() {
  return (
    <group>
      <RoundedBox args={[1.6, 1.1, 0.7]} radius={0.08} position={[-2.2, 0.6, -1.7]} castShadow>
        <meshStandardMaterial color="#f0b868" />
      </RoundedBox>
      <RoundedBox args={[1.6, 1.1, 0.7]} radius={0.08} position={[1.8, 0.6, -1.8]} castShadow>
        <meshStandardMaterial color="#9cc6a4" />
      </RoundedBox>
      {[-0.8, 0.1, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.36, -1.1]} castShadow>
          <capsuleGeometry args={[0.12, 0.35, 6, 12]} />
          <meshStandardMaterial color="#5f6d7a" />
        </mesh>
      ))}
    </group>
  );
}


function drawRecycleMark(context: CanvasRenderingContext2D, color: string) {
  context.save();
  context.translate(256, 230);
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = 18;
  context.lineCap = 'round';
  for (let index = 0; index < 3; index += 1) {
    context.save();
    context.rotate((index * Math.PI * 2) / 3);
    context.beginPath();
    context.arc(0, 0, 58, 0.3, Math.PI * 0.72);
    context.stroke();
    context.beginPath();
    context.moveTo(18, -62);
    context.lineTo(62, -36);
    context.lineTo(22, -18);
    context.closePath();
    context.fill();
    context.restore();
  }
  context.restore();
}

function makeBinFaceTexture(word: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (!context) return texture;

  context.clearRect(0, 0, 512, 512);
  context.fillStyle = '#FFFFFF';
  context.beginPath();
  context.roundRect(48, 48, 416, 416, 48);
  context.fill();
  drawRecycleMark(context, color);
  context.fillStyle = color;
  const fontSize = word.length > 7 ? 58 : word.length > 5 ? 72 : 92;
  context.font = `800 ${fontSize}px sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(word, 256, 360);
  texture.needsUpdate = true;
  return texture;
}

function makeBadgeTexture(text: string) {
  const font = '700 64px sans-serif';
  const measure = document.createElement('canvas').getContext('2d');
  if (measure) measure.font = font;
  const textWidth = measure ? measure.measureText(text).width : text.length * 36;
  const pad = 28;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(textWidth + pad * 2);
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (!ctx) return { texture, width: 0.5 };

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(255, 249, 240, 0.92)';
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = '#14532D';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  texture.needsUpdate = true;
  return { texture, width: (canvas.width / canvas.height) * 0.11 };
}

function HollowBin({
  color,
  highlighted,
  label,
}: {
  color: string;
  highlighted: boolean;
  label: THREE.Texture;
}) {
  const { width: W, depth: D, height: H, wall: T, bodyLift } = binMetrics;
  const plastic = {
    color,
    roughness: 0.32,
    metalness: 0.08,
    emissive: highlighted ? '#FDE68A' : color,
    emissiveIntensity: highlighted ? 0.2 : 0.025,
  };
  const innerW = W - T * 2;
  const innerD = D - T * 2;
  const innerH = H - 0.08;
  return (
    <group position={[0, bodyLift, 0]}>
      <mesh position={[0, T / 2, 0]} receiveShadow>
        <boxGeometry args={[innerW, T, innerD]} />
        <meshStandardMaterial color="#10161d" roughness={0.94} />
      </mesh>
      {(
        [
          [-(W / 2 - T / 2), H / 2, 0, [T, H, D]],
          [W / 2 - T / 2, H / 2, 0, [T, H, D]],
          [0, H / 2, D / 2 - T / 2, [innerW, H, T]],
          [0, H / 2, -(D / 2 - T / 2), [innerW, H, T]],
        ] as const
      ).map(([x, y, z, args]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={args} />
          <meshStandardMaterial {...plastic} />
        </mesh>
      ))}
      <mesh position={[0, innerH / 2 + T, -innerD / 2 + 0.001]} receiveShadow>
        <planeGeometry args={[innerW - 0.01, innerH]} />
        <meshStandardMaterial color="#1a222c" roughness={0.92} />
      </mesh>
      <mesh position={[0, innerH / 2 + T, innerD / 2 - 0.001]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[innerW - 0.01, innerH]} />
        <meshStandardMaterial color="#1a222c" roughness={0.92} />
      </mesh>
      <mesh position={[-innerW / 2 + 0.001, innerH / 2 + T, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[innerD - 0.01, innerH]} />
        <meshStandardMaterial color="#1a222c" roughness={0.92} />
      </mesh>
      <mesh position={[innerW / 2 - 0.001, innerH / 2 + T, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[innerD - 0.01, innerH]} />
        <meshStandardMaterial color="#1a222c" roughness={0.92} />
      </mesh>
      {(
        [
          [0, D / 2 - T / 2, [W + 0.02, 0.028, T + 0.012]],
          [0, -(D / 2 - T / 2), [W + 0.02, 0.028, T + 0.012]],
          [-(W / 2 - T / 2), 0, [T + 0.012, 0.028, innerD]],
          [W / 2 - T / 2, 0, [T + 0.012, 0.028, innerD]],
        ] as const
      ).map(([x, z, args]) => (
        <mesh key={`rim-${x}-${z}`} position={[x, H - 0.01, z]} castShadow>
          <boxGeometry args={args} />
          <meshStandardMaterial {...plastic} />
        </mesh>
      ))}
      <group position={[0, H - 0.01, -D / 2 + T / 2]} rotation={[-2.25, 0, 0]}>
        <mesh position={[0, 0.02, D / 2 - T]} castShadow>
          <boxGeometry args={[W + 0.03, 0.03, D]} />
          <meshStandardMaterial {...plastic} />
        </mesh>
      </group>
      <mesh position={[0, H * 0.46, D / 2 + 0.004]}>
        <planeGeometry args={[0.3, 0.32]} />
        <meshBasicMaterial map={label} transparent />
      </mesh>
      {(
        [
          [-W / 2 + 0.07, D / 2 - 0.08],
          [W / 2 - 0.07, D / 2 - 0.08],
        ] as const
      ).map(([x, z]) => (
        <mesh key={`wheel-${x}`} position={[x, 0, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 14]} />
          <meshStandardMaterial color="#2C333A" roughness={0.55} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function DestinationModel({
  destination,
  position,
  rotation = [0, 0, 0],
  highlighted,
  selectedItemId,
  dropHandledRef,
  onDestination,
}: {
  destination: Destination;
  position: THREE.Vector3;
  rotation?: [number, number, number];
  highlighted: boolean;
  selectedItemId?: string;
  dropHandledRef: MutableRefObject<boolean>;
  onDestination: (itemId: string, destinationId: string) => void;
}) {
  const binColor = destination.color;
  const word = destination.shortLabel.toUpperCase();
  const faceColor = destination.id === 'sanitary-bin' ? '#6B5D00' : binColor;

  const binFace = useMemo(() => makeBinFaceTexture(word, faceColor), [word, faceColor]);

  useEffect(() => () => binFace.dispose(), [binFace]);
  useCursor(Boolean(selectedItemId));

  return (
    <group
      name={destination.id}
      position={position}
      rotation={rotation}
      scale={highlighted ? 1.08 : 1}
      onClick={(event) => {
        event.stopPropagation();
        if (dropHandledRef.current) {
          dropHandledRef.current = false;
          return;
        }
        if (selectedItemId) onDestination(selectedItemId, destination.id);
      }}
    >
      <HollowBin color={binColor} highlighted={highlighted} label={binFace} />
    </group>
  );
}

function SelectionHalo({
  radius = 0.28,
  ovalScale = [1, 1],
}: {
  radius?: number;
  ovalScale?: [number, number];
}) {
  const innerRadius = Math.max(0.04, radius - 0.035);
  return (
    <group position={[0, 0.014, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[ovalScale[0], ovalScale[1], 1]} renderOrder={2}>
        <ringGeometry args={[innerRadius, radius, 56]} />
        <meshBasicMaterial color="#0EA5A4" depthTest={false} transparent opacity={0.68} depthWrite={false} />
      </mesh>
    </group>
  );
}

function ItemHitTarget({ size }: { size?: [number, number, number] }) {
  const [width, height, depth] = size ?? [0.5, 0.22, 0.42];
  return (
    <mesh position={[0, height / 2 + 0.012, 0]}>
      <boxGeometry args={[width, height, depth]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function InteractiveWaste({
  item,
  sceneScale,
  origin,
  spotYaw,
  selected,
  completed,
  dragging,
  dragPoint,
  sortedSlot,
  variant,
  displayVariant,
  onDragStart,
  onHoverChange,
}: {
  item: WasteItem;
  sceneScale: number;
  origin: THREE.Vector3;
  spotYaw: number;
  selected: boolean;
  completed: boolean;
  dragging: boolean;
  dragPoint?: THREE.Vector3;
  sortedSlot?: THREE.Vector3;
  variant: WasteShapeVariant;
  displayVariant: ModelDisplayVariant;
  onDragStart: (event: ThreeEvent<PointerEvent>) => void;
  onHoverChange?: (hovered: boolean) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const display = getModelDisplay(item.model, displayVariant);

  const badge = useMemo(() => makeBadgeTexture(item.displayName), [item.displayName]);
  useEffect(() => () => badge.texture.dispose(), [badge]);

  useLayoutEffect(() => {
    groupRef.current?.position.copy(origin);
  }, [origin]);

  const target = useMemo(() => {
    if (completed && sortedSlot) return new THREE.Vector3(sortedSlot.x, binMetrics.interiorY, sortedSlot.z);
    return origin;
  }, [completed, origin, sortedSlot]);

  useCursor(hovered && !completed, 'grab');

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    if (dragging && dragPoint) {
      group.position.lerp(dragPoint, 0.45);
      group.scale.setScalar(1.15);
      return;
    }
    group.position.lerp(target, completed ? 0.16 : 0.2);
    group.scale.setScalar(completed ? 0.24 : selected ? 1.12 : 1);
  });

  return (
    <group
      name={`waste-${item.id}`}
      ref={groupRef}
      onPointerDown={(event) => {
        if (completed) return;
        onDragStart(event);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        if (onHoverChange) onHoverChange(true);
      }}
      onPointerOut={() => {
        setHovered(false);
        if (onHoverChange) onHoverChange(false);
      }}
    >
      <group rotation={[0, spotYaw, 0]}>
        <group
          position={display.offset}
          rotation={display.rotation}
          scale={1.12 * display.scale * sceneScale}
        >
          <WasteShape kind={item.model} color={completed ? '#AAB7A8' : undefined} variant={variant} />
        </group>
        <ItemHitTarget size={display.hitSize?.map((value) => value * sceneScale) as [number, number, number] | undefined} />
        {selected && !completed && <SelectionHalo radius={display.selectionRadius} ovalScale={display.selectionScale} />}
      </group>

      {/* Floating 3D item name badge on hover - billboarded to ALWAYS face camera horizontally */}
      {(hovered || selected) && !completed && (
        <Billboard position={[0, 0.32, 0]} follow={true}>
          <mesh>
            <planeGeometry args={[badge.width, 0.11]} />
            <meshBasicMaterial map={badge.texture} transparent depthTest={false} />
          </mesh>
        </Billboard>
      )}
    </group>
  );
}
