function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

export function applyFrame(pixelCanvas, frameId) {
  if (!frameId || frameId === 'none') return pixelCanvas;
  switch (frameId) {
    case 'gameboy':   return frameGameBoy(pixelCanvas);
    case 'polaroid':  return framePolaroid(pixelCanvas);
    case 'arcade':    return frameArcade(pixelCanvas);
    case 'filmstrip': return frameFilmstrip(pixelCanvas);
    default:          return pixelCanvas;
  }
}

function frameGameBoy(pixelCanvas) {
  const pw = pixelCanvas.width;
  const ph = pixelCanvas.height;
  // Proportional shell padding: ~20% sides, 25% top, 35% bottom
  const padL = Math.round(pw * 0.22);
  const padR = Math.round(pw * 0.22);
  const padT = Math.round(ph * 0.28);
  const padB = Math.round(ph * 0.40);
  const W = pw + padL + padR;
  const H = ph + padT + padB;

  const canvas = makeCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Shell body — warm grey
  roundRect(ctx, 0, 0, W, H, Math.round(W * 0.12), '#C4CFA1', null);

  // Dark screen bezel
  const bx = padL - 6, by = padT - 8;
  const bw = pw + 12, bh = ph + 16;
  roundRect(ctx, bx, by, bw, bh, 6, '#4A4A4A', null);

  // Screen area
  roundRect(ctx, padL, padT, pw, ph, 3, '#9bbc0f', null);

  // Draw pixel art on screen
  ctx.drawImage(pixelCanvas, padL, padT);

  // "DOT MATRIX WITH STEREO SOUND" text
  ctx.fillStyle = '#4A4A4A';
  ctx.font = `${Math.max(7, Math.round(W * 0.018))}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('DOT MATRIX WITH STEREO SOUND', W / 2, padT + ph + 20);

  // Speaker dots (right side of lower half)
  const dotY = padT + ph + 38;
  for (let col = 0; col < 6; col++) {
    for (let row = 0; row < 3; row++) {
      ctx.beginPath();
      ctx.arc(W * 0.65 + col * 7, dotY + row * 7, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#4A4A4A';
      ctx.fill();
    }
  }

  return canvas;
}

function framePolaroid(pixelCanvas) {
  const pw = pixelCanvas.width;
  const ph = pixelCanvas.height;
  const side = Math.round(pw * 0.12);
  const top  = Math.round(ph * 0.12);
  const bot  = Math.round(ph * 0.30);
  const W = pw + side * 2;
  const H = ph + top + bot;

  const canvas = makeCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // White border with subtle shadow
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, 0, 0, W, H, 4, '#FFFFFF', null);
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  // Very subtle inner border
  ctx.strokeStyle = '#E0E0E0';
  ctx.lineWidth = 1;
  ctx.strokeRect(side - 2, top - 2, pw + 4, ph + 4);

  ctx.drawImage(pixelCanvas, side, top);

  return canvas;
}

function frameArcade(pixelCanvas) {
  const pw = pixelCanvas.width;
  const ph = pixelCanvas.height;
  const padX = Math.round(pw * 0.25);
  const padT = Math.round(ph * 0.30);
  const padB = Math.round(ph * 0.15);
  const W = pw + padX * 2;
  const H = ph + padT + padB;

  const canvas = makeCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1A1A2E';
  ctx.fillRect(0, 0, W, H);

  // Border stripes
  ctx.fillStyle = '#D85A30';
  ctx.fillRect(0, 0, W, 8);
  ctx.fillRect(0, H - 8, W, 8);
  ctx.fillRect(0, 0, 8, H);
  ctx.fillRect(W - 8, 0, 8, H);

  // Marquee top area
  ctx.fillStyle = '#F0E68C';
  ctx.font = `bold ${Math.max(10, Math.round(W * 0.04))}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('pixpaws', W / 2, padT * 0.6);

  // Stars & lightning in corners
  function drawStar(cx, cy, r) {
    ctx.fillStyle = '#F0E68C';
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
    }
  }
  drawStar(24, 24, 10);
  drawStar(W - 24, 24, 10);
  drawStar(24, H - 24, 10);
  drawStar(W - 24, H - 24, 10);

  // Screen bezel
  ctx.fillStyle = '#000';
  ctx.fillRect(padX - 4, padT - 4, pw + 8, ph + 8);

  ctx.drawImage(pixelCanvas, padX, padT);

  return canvas;
}

function frameFilmstrip(pixelCanvas) {
  const pw = pixelCanvas.width;
  const ph = pixelCanvas.height;
  const sprocketH = Math.round(ph * 0.12);
  const sprocketW = 12;
  const W = pw + 32; // side margins for strip label
  const H = ph + sprocketH * 2;

  const canvas = makeCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Film strip background
  ctx.fillStyle = '#1C1008';
  ctx.fillRect(0, 0, W, H);

  // Top sprocket holes row
  const holeW = 16, holeH = 10, holeR = 3;
  const holeCount = Math.floor(W / 24);
  const holeSpacing = W / holeCount;
  for (let i = 0; i < holeCount; i++) {
    const hx = i * holeSpacing + holeSpacing / 2 - holeW / 2;
    roundRect(ctx, hx, (sprocketH - holeH) / 2, holeW, holeH, holeR, '#000', null);
  }
  // Bottom sprocket holes row
  for (let i = 0; i < holeCount; i++) {
    const hx = i * holeSpacing + holeSpacing / 2 - holeW / 2;
    roundRect(ctx, hx, ph + sprocketH + (sprocketH - holeH) / 2, holeW, holeH, holeR, '#000', null);
  }

  // Pixel art frame
  ctx.drawImage(pixelCanvas, 16, sprocketH);

  return canvas;
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}

export const FRAME_OPTIONS = [
  { id: 'none',      label: 'None' },
  { id: 'gameboy',   label: 'Game Boy' },
  { id: 'polaroid',  label: 'Polaroid' },
  { id: 'arcade',    label: 'Arcade' },
  { id: 'filmstrip', label: 'Film Strip' },
];
