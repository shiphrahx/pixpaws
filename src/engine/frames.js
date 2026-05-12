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

  // DMG body is ~1.55× wider and ~2.85× taller than the screen
  const W = Math.round(pw * 2.10);
  const H = Math.round(ph * 4.80);

  const canvas = makeCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // ── Helper: pill/rounded rect ──────────────────────────────────
  function rr(x, y, w, h, radius, fill, stroke, strokeW) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.arcTo(x + w, y,     x + w, y + radius,     radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
    ctx.lineTo(x + radius, y + h);
    ctx.arcTo(x, y + h, x, y + h - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y,     x + radius, y,             radius);
    ctx.closePath();
    if (fill)   { ctx.fillStyle = fill;     ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = strokeW || 1; ctx.stroke(); }
  }

  const bodyR = Math.round(W * 0.11);
  const bodyColour = '#BEBEBE';

  // ── Body shape (with bottom-left diagonal cut) ─────────────────
  const chamfer = Math.round(W * 0.20);
  ctx.beginPath();
  // top-left corner
  ctx.moveTo(bodyR, 0);
  // top edge → top-right
  ctx.lineTo(W - bodyR, 0);
  ctx.arcTo(W, 0, W, bodyR, bodyR);
  // right edge → bottom-right
  ctx.lineTo(W, H - bodyR);
  ctx.arcTo(W, H, W - bodyR, H, bodyR);
  // bottom edge → chamfer start
  ctx.lineTo(chamfer, H);
  // diagonal cut bottom-left
  ctx.lineTo(0, H - chamfer);
  // left edge → top-left
  ctx.lineTo(0, bodyR);
  ctx.arcTo(0, 0, bodyR, 0, bodyR);
  ctx.closePath();
  ctx.fillStyle = bodyColour;
  ctx.fill();

  // ── Purple/indigo stripe across top of screen area ─────────────
  const stripeH = Math.round(H * 0.028);
  const stripeY = Math.round(H * 0.10);
  const stripeX = Math.round(W * 0.06);
  const stripeW = W - stripeX * 2;
  rr(stripeX, stripeY, stripeW, stripeH, stripeH / 2, '#6B5B9A', null);

  // "DOT MATRIX WITH STEREO SOUND" on the stripe
  ctx.fillStyle = '#C8C0E0';
  const dotMatrixSize = Math.max(4, Math.round(H * 0.013));
  ctx.font = `${dotMatrixSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DOT MATRIX WITH STEREO SOUND', W / 2, stripeY + stripeH / 2);

  // ── Screen bezel (shallow inset, same grey but slightly darker) ─
  const screenX = Math.round((W - pw) / 2);
  const screenY = stripeY + stripeH + Math.round(H * 0.015);
  const bezelPad = Math.round(W * 0.045);
  const bezelX = screenX - bezelPad;
  const bezelY = screenY - bezelPad * 0.6;
  const bezelW = pw + bezelPad * 2;
  const bezelH = ph + bezelPad * 1.2;
  rr(bezelX, bezelY, bezelW, bezelH, 6, '#A8A8A8', null);

  // Battery LED (left of screen bezel, red dot)
  const ledX = bezelX - Math.round(W * 0.055);
  const ledY = bezelY + Math.round(bezelH * 0.25);
  ctx.beginPath();
  ctx.arc(ledX, ledY, Math.round(W * 0.018), 0, Math.PI * 2);
  ctx.fillStyle = '#CC0000';
  ctx.fill();
  // "BATTERY" label
  ctx.fillStyle = '#666';
  ctx.font = `${Math.max(4, Math.round(W * 0.030))}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('BATTERY', ledX, ledY + Math.round(W * 0.025));

  // Screen glass
  ctx.imageSmoothingEnabled = false;
  rr(screenX, screenY, pw, ph, 3, '#8BAC0F', null);
  ctx.drawImage(pixelCanvas, screenX, screenY, pw, ph);

  // ── "Nintendo GAME BOY™" logo ──────────────────────────────────
  const logoY = bezelY + bezelH + Math.round(H * 0.022);
  const nintendoSize = Math.round(W * 0.068);
  ctx.fillStyle = '#1A3099';
  ctx.font = `italic bold ${nintendoSize}px serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const nintendoX = Math.round(W * 0.08);
  ctx.fillText('Nintendo', nintendoX, logoY + nintendoSize);

  const gameboySize = Math.round(W * 0.115);
  ctx.font = `bold ${gameboySize}px sans-serif`;
  ctx.fillText('GAME BOY', nintendoX, logoY + nintendoSize + gameboySize * 1.05);

  // ™ superscript
  const tmSize = Math.round(gameboySize * 0.38);
  ctx.font = `${tmSize}px sans-serif`;
  const gbW = ctx.measureText('GAME BOY').width; // measure with previous font — re-measure
  ctx.font = `bold ${gameboySize}px sans-serif`;
  const gbMeasure = ctx.measureText('GAME BOY').width;
  ctx.font = `${tmSize}px sans-serif`;
  ctx.fillText('™', nintendoX + gbMeasure + 2, logoY + nintendoSize + gameboySize * 0.18);

  // ── Controls area ──────────────────────────────────────────────
  const ctrlTop = logoY + nintendoSize + gameboySize * 1.1 + Math.round(H * 0.025);

  // D-pad (left side, dark navy)
  const dpadCX = Math.round(W * 0.24);
  const dpadCY = ctrlTop + Math.round(H * 0.085);
  const arm = Math.round(W * 0.075);
  const thick = Math.round(W * 0.058);
  ctx.fillStyle = '#1A1A2E';
  // horizontal
  ctx.beginPath();
  rr(dpadCX - arm, dpadCY - thick / 2, arm * 2, thick, thick / 2 * 0.4, '#1A1A2E', null);
  // vertical
  rr(dpadCX - thick / 2, dpadCY - arm, thick, arm * 2, thick / 2 * 0.4, '#1A1A2E', null);

  // Arrows on d-pad (small triangles)
  ctx.fillStyle = '#333';
  function tri(ax, ay, bx, by, cx, cy) {
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.closePath(); ctx.fill();
  }
  const ta = Math.round(thick * 0.22);
  tri(dpadCX, dpadCY - arm + ta, dpadCX - ta, dpadCY - arm + ta * 2.2, dpadCX + ta, dpadCY - arm + ta * 2.2); // up
  tri(dpadCX, dpadCY + arm - ta, dpadCX - ta, dpadCY + arm - ta * 2.2, dpadCX + ta, dpadCY + arm - ta * 2.2); // down
  tri(dpadCX - arm + ta, dpadCY, dpadCX - arm + ta * 2.2, dpadCY - ta, dpadCX - arm + ta * 2.2, dpadCY + ta); // left
  tri(dpadCX + arm - ta, dpadCY, dpadCX + arm - ta * 2.2, dpadCY - ta, dpadCX + arm - ta * 2.2, dpadCY + ta); // right

  // A button (right, higher) — magenta/hot pink
  const btnR = Math.round(W * 0.075);
  const aBtnX = Math.round(W * 0.78);
  const aBtnY = ctrlTop + Math.round(H * 0.055);
  ctx.beginPath();
  ctx.arc(aBtnX, aBtnY, btnR, 0, Math.PI * 2);
  ctx.fillStyle = '#C8185A';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.round(btnR * 0.85)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', aBtnX, aBtnY + 1);

  // B button (left of A, lower)
  const bBtnX = Math.round(W * 0.62);
  const bBtnY = ctrlTop + Math.round(H * 0.100);
  ctx.beginPath();
  ctx.arc(bBtnX, bBtnY, btnR, 0, Math.PI * 2);
  ctx.fillStyle = '#C8185A';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText('B', bBtnX, bBtnY + 1);
  ctx.textBaseline = 'alphabetic';

  // ── SELECT / START (small oval dark buttons, angled) ───────────
  const smallY = ctrlTop + Math.round(H * 0.165);
  const smallW = Math.round(W * 0.11);
  const smallH = Math.round(H * 0.022);
  const smallR = smallH / 2;
  const labelSize = Math.max(5, Math.round(H * 0.018));

  // Slight rotation for the SELECT/START buttons (they angle upward to the right)
  function drawOvalBtn(cx, cy, label) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.18); // ~10° tilt
    rr(-smallW / 2, -smallH / 2, smallW, smallH, smallR, '#555', null);
    ctx.restore();
    ctx.fillStyle = '#666';
    ctx.font = `${labelSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, cx, cy + smallH / 2 + 4);
  }

  drawOvalBtn(Math.round(W * 0.36), smallY, 'SELECT');
  drawOvalBtn(Math.round(W * 0.54), smallY, 'START');

  // ── Speaker grille (diagonal slanted slots, bottom-right) ──────
  const grillX = Math.round(W * 0.60);
  const grillY = Math.round(H * 0.82);
  const slotCount = 6;
  const slotLen = Math.round(H * 0.038);
  const slotW = Math.round(W * 0.018);
  const slotGap = Math.round(W * 0.038);
  const slotAngle = -Math.PI / 4; // 45° diagonal

  for (let i = 0; i < slotCount; i++) {
    ctx.save();
    ctx.translate(grillX + i * slotGap, grillY);
    ctx.rotate(slotAngle);
    rr(-slotW / 2, -slotLen / 2, slotW, slotLen, slotW / 2, '#999', null);
    ctx.restore();
  }

  // ── "NINTENDO" at very bottom ──────────────────────────────────
  ctx.fillStyle = '#888';
  ctx.font = `${Math.max(5, Math.round(W * 0.036))}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('NINTENDO', W / 2, H - Math.round(H * 0.022));

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

  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, 0, 0, W, H, 4, '#FFFFFF', null);
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

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

  ctx.fillStyle = '#1A1A2E';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#D85A30';
  ctx.fillRect(0, 0, W, 8);
  ctx.fillRect(0, H - 8, W, 8);
  ctx.fillRect(0, 0, 8, H);
  ctx.fillRect(W - 8, 0, 8, H);

  ctx.fillStyle = '#F0E68C';
  ctx.font = `bold ${Math.max(10, Math.round(W * 0.04))}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('pixpaws', W / 2, padT * 0.6);

  function drawStar(cx, cy, r) {
    ctx.fillStyle = '#F0E68C';
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      ctx.fillRect(Math.round(cx + Math.cos(a) * r) - 2, Math.round(cy + Math.sin(a) * r) - 2, 4, 4);
    }
  }
  drawStar(24, 24, 10);
  drawStar(W - 24, 24, 10);
  drawStar(24, H - 24, 10);
  drawStar(W - 24, H - 24, 10);

  ctx.fillStyle = '#000';
  ctx.fillRect(padX - 4, padT - 4, pw + 8, ph + 8);

  ctx.drawImage(pixelCanvas, padX, padT);

  return canvas;
}

function frameFilmstrip(pixelCanvas) {
  const pw = pixelCanvas.width;
  const ph = pixelCanvas.height;
  const sprocketH = Math.round(ph * 0.12);
  const W = pw + 32;
  const H = ph + sprocketH * 2;

  const canvas = makeCanvas(W, H);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1C1008';
  ctx.fillRect(0, 0, W, H);

  const holeW = 16, holeH = 10, holeR = 3;
  const holeCount = Math.floor(W / 24);
  const holeSpacing = W / holeCount;
  for (let i = 0; i < holeCount; i++) {
    const hx = i * holeSpacing + holeSpacing / 2 - holeW / 2;
    roundRect(ctx, hx, (sprocketH - holeH) / 2, holeW, holeH, holeR, '#000', null);
    roundRect(ctx, hx, ph + sprocketH + (sprocketH - holeH) / 2, holeW, holeH, holeR, '#000', null);
  }

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
  if (fill)   { ctx.fillStyle = fill;   ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}

export const FRAME_OPTIONS = [
  { id: 'none',      label: 'None' },
  { id: 'gameboy',   label: 'Game Boy' },
  { id: 'polaroid',  label: 'Polaroid' },
  { id: 'arcade',    label: 'Arcade' },
  { id: 'filmstrip', label: 'Film Strip' },
];
