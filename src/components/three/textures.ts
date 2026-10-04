import * as THREE from 'three';

function canvasTexture(width: number, height: number, paint: (context: CanvasRenderingContext2D, width: number, height: number) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  if (context) paint(context, width, height);
  texture.needsUpdate = true;
  return texture;
}

function shade(hex: string, amount: number) {
  const color = new THREE.Color(hex);
  color.offsetHSL(0, 0, amount);
  return `#${color.getHexString()}`;
}

export function createWoodTexture(base = '#C9844A', planks = 4) {
  const texture = canvasTexture(512, 512, (context, size) => {
    context.fillStyle = shade(base, -0.08);
    context.fillRect(0, 0, size, size);
    const plankH = size / planks;
    for (let index = 0; index < planks; index += 1) {
      context.fillStyle = shade(base, index % 2 === 0 ? 0.04 : -0.03);
      context.fillRect(6, index * plankH + 5, size - 12, plankH - 10);
      for (let grain = 0; grain < 18; grain += 1) {
        const y = index * plankH + 12 + grain * (plankH / 20);
        context.strokeStyle = `rgba(90, 42, 12, ${0.05 + (grain % 3) * 0.03})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(10, y);
        context.bezierCurveTo(140, y + 4, 280, y - 5, size - 12, y + 2);
        context.stroke();
      }
      context.fillStyle = 'rgba(255, 236, 210, 0.18)';
      context.fillRect(8, index * plankH + 8, size - 16, 3);
    }
  });
  texture.repeat.set(2.4, 2.4);
  return texture;
}

export function createFabricTexture(base: string) {
  return canvasTexture(256, 256, (context, size) => {
    context.fillStyle = base;
    context.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 4) {
      context.fillStyle = y % 8 === 0 ? 'rgba(255,255,255,0.07)' : 'rgba(40, 16, 8, 0.05)';
      context.fillRect(0, y, size, 1);
    }
    for (let x = 0; x < size; x += 5) {
      context.fillStyle = 'rgba(40, 16, 8, 0.035)';
      context.fillRect(x, 0, 1, size);
    }
    for (let index = 0; index < 80; index += 1) {
      context.fillStyle = 'rgba(255,255,255,0.05)';
      context.fillRect(Math.random() * size, Math.random() * size, 8, 2);
    }
  });
}

export function createPaintTexture(base: string) {
  return canvasTexture(256, 256, (context, size) => {
    context.fillStyle = base;
    context.fillRect(0, 0, size, size);
    for (let index = 0; index < 420; index += 1) {
      const light = Math.random() > 0.5;
      context.fillStyle = light ? 'rgba(255,255,255,0.035)' : 'rgba(30, 20, 10, 0.03)';
      context.fillRect(Math.random() * size, Math.random() * size, 10 + Math.random() * 18, 2);
    }
  });
}

export function createTileTexture() {
  const texture = canvasTexture(256, 256, (context, size) => {
    context.fillStyle = '#D7E2EA';
    context.fillRect(0, 0, size, size);
    context.fillStyle = '#F7FBFD';
    context.fillRect(3, 3, size - 6, size / 2 - 6);
    context.fillRect(3, size / 2 + 3, size - 6, size / 2 - 6);
    context.fillStyle = 'rgba(255,255,255,0.55)';
    context.fillRect(8, 8, size - 16, 6);
    context.fillRect(8, size / 2 + 8, size - 16, 6);
  });
  texture.repeat.set(6, 2.2);
  return texture;
}

export function createPaperTexture() {
  return canvasTexture(512, 512, (context, size) => {
    // Warm off-white paper base
    context.fillStyle = '#FAF9F5';
    context.fillRect(0, 0, size, size);

    // Subtle paper grain
    for (let i = 0; i < 400; i += 1) {
      context.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.015)' : 'rgba(255,255,255,0.04)';
      context.fillRect(Math.random() * size, Math.random() * size, 3 + Math.random() * 4, 1);
    }

    // Horizontal blue ruled lines
    context.strokeStyle = 'rgba(147, 197, 253, 0.75)';
    context.lineWidth = 1.5;
    for (let y = 60; y < size - 20; y += 26) {
      context.beginPath();
      context.moveTo(30, y);
      context.lineTo(size - 24, y);
      context.stroke();
    }

    // Header line at top
    context.strokeStyle = 'rgba(147, 197, 253, 0.9)';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(30, 48);
    context.lineTo(size - 24, 48);
    context.stroke();

    // Red left margin line
    context.strokeStyle = 'rgba(248, 113, 113, 0.85)';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(76, 16);
    context.lineTo(76, size - 16);
    context.stroke();

    // 3 binder punch holes on left margin
    const holeY = [90, size / 2, size - 90];
    holeY.forEach((y) => {
      // Outer subtle shadow
      context.fillStyle = 'rgba(148, 163, 184, 0.45)';
      context.beginPath();
      context.arc(42, y, 9, 0, Math.PI * 2);
      context.fill();

      // Inner hole cutout
      context.fillStyle = '#EDE9DE';
      context.beginPath();
      context.arc(42, y, 7.5, 0, Math.PI * 2);
      context.fill();
    });
  });
}

export function createCardboardTexture() {
  return canvasTexture(512, 512, (context, size) => {
    // Rich natural kraft cardboard base
    context.fillStyle = '#C08146';
    context.fillRect(0, 0, size, size);

    // Corrugation ribbing and fiber streaks
    for (let y = 0; y < size; y += 4) {
      const isRidge = y % 8 === 0;
      context.fillStyle = isRidge ? 'rgba(74, 38, 10, 0.12)' : 'rgba(255, 235, 195, 0.08)';
      context.fillRect(0, y, size, 2);
    }

    // Natural pulp specks
    for (let i = 0; i < 350; i += 1) {
      context.fillStyle = Math.random() > 0.4 ? 'rgba(60, 28, 8, 0.08)' : 'rgba(255, 240, 210, 0.1)';
      context.fillRect(Math.random() * size, Math.random() * size, 2 + Math.random() * 5, 1.5);
    }

    // Recyclable Corrugated Packaging Symbol on front face
    context.save();
    context.translate(size * 0.5, size * 0.55);
    context.fillStyle = 'rgba(50, 25, 8, 0.45)';
    context.strokeStyle = 'rgba(50, 25, 8, 0.45)';
    context.lineWidth = 5;

    // Draw 3-arrow chasing recycling triangle
    for (let a = 0; a < 3; a += 1) {
      context.save();
      context.rotate((a * 2 * Math.PI) / 3);
      context.beginPath();
      context.moveTo(-36, -42);
      context.lineTo(36, -42);
      context.stroke();

      // Arrow head
      context.beginPath();
      context.moveTo(32, -50);
      context.lineTo(46, -42);
      context.lineTo(32, -34);
      context.closePath();
      context.fill();
      context.restore();
    }

    // "PAP 20" recycling classification text
    context.font = 'bold 18px sans-serif';
    context.textAlign = 'center';
    context.fillText('PAP 20', 0, 8);
    context.font = '12px sans-serif';
    context.fillText('RECYCLABLE', 0, 24);
    context.restore();

    // Packing tape stripe across bottom
    context.fillStyle = 'rgba(235, 195, 130, 0.38)';
    context.fillRect(0, size - 46, size, 36);
    context.strokeStyle = 'rgba(180, 130, 70, 0.25)';
    context.lineWidth = 1;
    context.strokeRect(0, size - 46, size, 36);
  });
}

export function createBottleLabelTexture() {
  return canvasTexture(512, 256, (context, width, height) => {
    // Clear/glossy light cyan wrapper
    context.fillStyle = 'rgba(230, 248, 255, 0.92)';
    context.fillRect(0, 0, width, height);

    // Aqua fresh wave accents
    const gradient = context.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#0284C7');
    gradient.addColorStop(0.5, '#38BDF8');
    gradient.addColorStop(1, '#0284C7');
    context.fillStyle = gradient;

    context.beginPath();
    context.moveTo(0, height * 0.45);
    context.bezierCurveTo(width * 0.25, height * 0.35, width * 0.75, height * 0.55, width, height * 0.45);
    context.lineTo(width, height * 0.85);
    context.bezierCurveTo(width * 0.75, height * 0.95, width * 0.25, height * 0.75, 0, height * 0.85);
    context.closePath();
    context.fill();

    // Brand and recycle text
    context.fillStyle = '#FFFFFF';
    context.font = 'bold 22px sans-serif';
    context.textAlign = 'center';
    context.fillText('PURE SPRING', width * 0.5, height * 0.65);

    context.font = '12px sans-serif';
    context.fillText('100% RECYCLABLE BOTTLE', width * 0.5, height * 0.78);

    // Green recycling emblem
    context.fillStyle = '#16A34A';
    context.font = 'bold 20px sans-serif';
    context.fillText('♻ 1 PET', width * 0.84, height * 0.28);

    // Barcode block on the side
    context.fillStyle = '#FFFFFF';
    context.fillRect(24, 20, 72, height - 40);
    context.fillStyle = '#1E293B';
    for (let x = 32; x < 88; x += 4) {
      if (Math.random() > 0.3) {
        context.fillRect(x, 28, 2, height - 60);
      }
    }
  });
}

export function createBananaTexture() {
  return canvasTexture(512, 512, (context, size) => {
    // Ripe banana yellow background
    const gradient = context.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#84CC16'); // green tint near stem
    gradient.addColorStop(0.12, '#EAB308');
    gradient.addColorStop(0.85, '#FACC15');
    gradient.addColorStop(1, '#CA8A04'); // warmer golden tip
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    // Subtle longitudinal faceted ridge stripes
    context.fillStyle = 'rgba(180, 120, 10, 0.08)';
    context.fillRect(size * 0.22, 0, size * 0.06, size);
    context.fillRect(size * 0.72, 0, size * 0.06, size);

    // Fine organic brown sugar spots (ripe banana freckles)
    for (let i = 0; i < 90; i += 1) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 1 + Math.random() * 2.8;
      context.fillStyle = 'rgba(113, 63, 18, 0.45)';
      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2);
      context.fill();
    }
  });
}

export function createEggshellTexture() {
  return canvasTexture(512, 512, (context, size) => {
    // Warm natural country-egg cream tone
    const gradient = context.createRadialGradient(size * 0.4, size * 0.4, 40, size * 0.5, size * 0.5, size * 0.6);
    gradient.addColorStop(0, '#F5DEC8');
    gradient.addColorStop(0.7, '#E5BCA0');
    gradient.addColorStop(1, '#D8A88A');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    // Natural delicate eggshell freckling / micro-speckles
    for (let i = 0; i < 300; i += 1) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 0.8 + Math.random() * 1.6;
      context.fillStyle = 'rgba(140, 75, 45, 0.22)';
      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2);
      context.fill();
    }
  });
}

export function createOnionTexture() {
  return canvasTexture(256, 256, (context, size) => {
    // Deep red-purple onion skin gradient
    const gradient = context.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#9D174D');
    gradient.addColorStop(0.5, '#BE185D');
    gradient.addColorStop(1, '#831843');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    // Delicate translucent fibrous veins
    context.strokeStyle = 'rgba(253, 232, 240, 0.35)';
    context.lineWidth = 1;
    for (let x = 8; x < size; x += 10) {
      context.beginPath();
      context.moveTo(x, 0);
      context.bezierCurveTo(x + (Math.random() - 0.5) * 8, size * 0.5, x, size, x, size);
      context.stroke();
    }
  });
}
