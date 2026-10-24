import { useEffect, useState } from 'react';

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  vRot: number;
  shape: 'star' | 'circle' | 'square';
};

const COLORS = ['#15803D', '#22C55E', '#1D4ED8', '#38BDF8', '#F59E0B', '#FBBF24', '#EC4899', '#EF4444'];

export function ConfettiBurst({ active, repeat = false }: { active: boolean; repeat?: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const spawn = (): Particle[] => Array.from({ length: 36 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 36 + (Math.random() - 0.5) * 0.4;
      const speed = 4 + Math.random() * 8;
      return {
        id: Math.random() + i,
        x: window.innerWidth * (repeat ? (i % 2 === 0 ? 0.15 : 0.85) : 0.35 + Math.random() * 0.3),
        y: window.innerHeight * (0.5 + Math.random() * 0.2),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6, // Upward initial explosion
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 16,
        shape: i % 3 === 0 ? 'star' : i % 2 === 0 ? 'circle' : 'square',
      };
    });

    setParticles(spawn());

    let animationFrame: number;
    let startTime = performance.now();
    let lastTime = startTime;

    const update = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed > 1400) {
        if (!repeat) { setParticles([]); return; }
        startTime = now;
        lastTime = now;
        setParticles(spawn());
        animationFrame = requestAnimationFrame(update);
        return;
      }
      const step = Math.min((now - lastTime) / (1000 / 60), 2);
      lastTime = now;

      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx * step,
          y: p.y + p.vy * step,
          vy: p.vy + 0.35 * step,
          rotation: p.rotation + p.vRot * step,
        })),
      );

      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [active, repeat]);

  if (particles.length === 0) return null;

  return (
    <div
      className="confetti-burst"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 100,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'star' ? '2px' : '3px',
            transform: `rotate(${p.rotation}deg)`,
            boxShadow: `0 0 6px ${p.color}`,
            opacity: Math.max(0, 1 - (p.y / window.innerHeight) * 0.4),
          }}
        />
      ))}
    </div>
  );
}
