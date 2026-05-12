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

  // DMG proportions: screen is roughly 38% of total height, sits ~22% from top
  // We derive the body size from the screen size
  const W = Math.round(pw * 2.0);      // body width ~2× screen width
  const H = Math.round(ph * 4.2);      // body height ~4.2× screen height

  // Screen position: horizontally centred, ~20% from top
  const screenX = Math.round((W - pw) / 2);
  const screenY = Math.round(H * 0.10);

  const canvas = makeCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const r = Math.round(W * 0.10); // body corner radius

  // ── Shell body ──────────────────────────────────────────────────
  // Main body (lighter grey, DMG colour)
  roundRect(ctx, 0, 0, W, H, r, '#C8C8C8', null);

  // Bottom chamfer: the DMG has an angled bottom-left cut
  ctx.fillStyle = '#C8C8C8';
  const chamfer = Math.round(W * 0.18);
  ctx.beginPath();
  ctx.moveTo(0, H - chamfer);
  ctx.lineTo(chamfer, H);
  ctx.lineTo(W, H);
  ctx.lineTo(W, H - r);
  ctx.arcTo(W, H, W - r, H, r);
  ctx.closePath();
  ctx.fill();
  // Re-draw bottom-right round corner properly
  roundRect(ctx, 0, 0, W, H, r, '#C8C8C8', null);

  // ── Screen area ─────────────────────────────────────────────────
  // Outer bezel (dark grey inset)
  const bezelPad = Math.round(pw * 0.10);
  const bezelX = screenX - bezelPad;
  const bezelY = screenY - bezelPad * 1.4;
  const bezelW = pw + bezelPad * 2;
  const bezelH = ph + bezelPad * 2.8;
  roundRect(ctx, bezelX, bezelY, bezelW, bezelH, 8, '#3A3A3A', null);

  // "DOT MATRIX WITH STEREO SOUND" label strip above screen
  const labelY = bezelY + 6;
  ctx.fillStyle = '#888';
  ctx.font = `${Math.max(5, Math.round(W * 0.022))}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('· DOT MATRIX WITH STEREO SOUND ·', W / 2, labelY + Math.round(W * 0.022));

  // Screen glass (green tint)
  roundRect(ctx, screenX, screenY, pw, ph, 4, '#8BAC0F', null);

  // Draw pixel art
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(pixelCanvas, screenX, screenY, pw, ph);

  // Power LED (top-left of bezel)
  ctx.beginPath();
  ctx.arc(bezelX + 10, bezelY + bezelH - 10, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#CC0000';
  ctx.fill();

  // ── Controls area ────────────────────────────────────────────────
  const ctrlY = screenY + ph + bezelPad * 2 + Math.round(H * 0.04);

  // D-pad (left side)
  const dpadCX = Math.round(W * 0.25);
  const dpadCY = ctrlY + Math.round(H * 0.07);
  const dpadArm = Math.round(W * 0.065);
  const dpadThick = Math.round(W * 0.055);
  ctx.fillStyle = '#222';
  // Horizontal arm
  ctx.fillRect(dpadCX - dpadArm, dpadCY - dpadThick / 2, dpadArm * 2, dpadThick);
  // Vertical arm
  ctx.fillRect(dpadCX - dpadThick / 2, dpadCY - dpadArm, dpadThick, dpadArm * 2);
  // Centre square
  ctx.fillRect(dpadCX - dpadThick / 2, dpadCY - dpadThick / 2, dpadThick, dpadThick);

  // A button (right, larger)
  const btnRightCX = Math.round(W * 0.76);
  const btnRightCY = ctrlY + Math.round(H * 0.05);
  const btnR = Math.round(W * 0.055);
  ctx.beginPath();
  ctx.arc(btnRightCX, btnRightCY, btnR, 0, Math.PI * 2);
  ctx.fillStyle = '#8B1A1A';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.round(btnR * 0.9)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', btnRightCX, btnRightCY + 1);

  // B button (left of A, slightly lower)
  const btnLeftCX = Math.round(W * 0.63);
  const btnLeftCY = ctrlY + Math.round(H * 0.09);
  ctx.beginPath();
  ctx.arc(btnLeftCX, btnLeftCY, btnR, 0, Math.PI * 2);
  ctx.fillStyle = '#8B1A1A';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText('B', btnLeftCX, btnLeftCY + 1);
  ctx.textBaseline = 'alphabetic';

  // Select / Start buttons (centre, small oval)
  const smallBtnY = ctrlY + Math.round(H * 0.10);
  const smallBtnW = Math.round(W * 0.08);
  const smallBtnH = Math.round(H * 0.018);
  const smallBtnR = smallBtnH / 2;

  // Select
  const selX = Math.round(W * 0.36);
  roundRect(ctx, selX - smallBtnW / 2, smallBtnY - smallBtnH / 2, smallBtnW, smallBtnH, smallBtnR, '#555', null);
  ctx.fillStyle = '#aaa';
  ctx.font = `${Math.max(5, Math.round(H * 0.016))}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SELECT', selX, smallBtnY + smallBtnH + 5);

  // Start
  const startX = Math.round(W * 0.52);
  roundRect(ctx, startX - smallBtnW / 2, smallBtnY - smallBtnH / 2, smallBtnW, smallBtnH, smallBtnR, '#555', null);
  ctx.fillText('START', startX, smallBtnY + smallBtnH + 5);
  ctx.textBaseline = 'alphabetic';

  // ── Speaker grille (bottom-right, diagonal dots) ─────────────────
  const spkX = Math.round(W * 0.60);
  const spkY = Math.round(H * 0.78);
  const spkCols = 6, spkRows = 4;
  const spkSpacingX = Math.round(W * 0.038);
  const spkSpacingY = Math.round(H * 0.022);
  for (let col = 0; col < spkCols; col++) {
    for (let row = 0; row < spkRows; row++) {
      // diagonal offset
      const ox = row * spkSpacingX * 0.3;
      ctx.beginPath();
      ctx.arc(spkX + col * spkSpacingX + ox, spkY + row * spkSpacingY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#999';
      ctx.fill();
    }
  }

  // ── Nintendo wordmark ────────────────────────────────────────────
  ctx.fillStyle = '#555';
  ctx.font = `bold ${Math.round(W * 0.038)}px serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Nintendo', W / 2, Math.round(H * 0.94));

  // ── GAME BOY logo below screen ───────────────────────────────────
  const logoY = bezelY + bezelH + Math.round(H * 0.015);
  ctx.fillStyle = '#1A1A6E';
  ctx.font = `bold ${Math.round(W * 0.052)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('GAME BOY', W / 2, logoY + Math.round(W * 0.052));

  // Trademark ™
  ctx.fillStyle = '#555';
  ctx.font = `${Math.round(W * 0.022)}px sans-serif`;
  ctx.fillText('™', W / 2 + ctx.measureText('GAME BOY').width / 2 + 8, logoY + Math.round(W * 0.04));

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
