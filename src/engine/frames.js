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

// ─────────────────────────────────────────────────────────────────
// Game Boy DMG frame
// Reference proportions (measured from real photo, W=160 H=255):
//   Screen top:    18% from top
//   Screen bottom: 52% from top  → screen h = 34% of body
//   Screen left:   20% from left
//   Screen right:  80% from left → screen w = 60% of body
//   Logo:          54%–63%
//   Controls:      64%–87%
//   Speaker:       74%–87%, right 55%–90%
//   Body ratio:    W:H = 1:1.59
// ─────────────────────────────────────────────────────────────────
function frameGameBoy(pixelCanvas) {
  const pw = pixelCanvas.width;
  const ph = pixelCanvas.height;

  // Screen is 60% of body width and 34% of body height
  // So body = screen / 0.60 wide, screen / 0.34 tall
  const W = Math.round(pw / 0.60);
  const H = Math.round(ph / 0.34);

  const canvas = makeCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // ── Helpers ────────────────────────────────────────────────────
  function rr(x, y, w, h, r, fill, strokeCol, strokeW) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y,     x + w, y + r,     r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r,         r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y,     x + r, y,             r);
    ctx.closePath();
    if (fill)      { ctx.fillStyle = fill;          ctx.fill(); }
    if (strokeCol) { ctx.strokeStyle = strokeCol; ctx.lineWidth = strokeW || 1; ctx.stroke(); }
  }

  // ── Body: rounded rect + bottom-left chamfer ───────────────────
  const bodyR = Math.round(W * 0.09);
  const chamfer = Math.round(W * 0.18);
  ctx.beginPath();
  ctx.moveTo(bodyR, 0);
  ctx.lineTo(W - bodyR, 0);
  ctx.arcTo(W, 0,   W, bodyR,         bodyR);
  ctx.lineTo(W, H - bodyR);
  ctx.arcTo(W, H,   W - bodyR, H,     bodyR);
  ctx.lineTo(chamfer, H);
  ctx.lineTo(0, H - chamfer);
  ctx.lineTo(0, bodyR);
  ctx.arcTo(0, 0,   bodyR, 0,         bodyR);
  ctx.closePath();
  ctx.fillStyle = '#C0C0C0';
  ctx.fill();

  // ── Screen area (18%–52% vertically, 20%–80% horizontally) ────
  const screenX = Math.round(W * 0.20);
  const screenY = Math.round(H * 0.18);
  // Screen should match pixelCanvas dimensions
  // (already computed: pw = W*0.60, ph = H*0.34)

  // Purple/violet stripe — thin bar just above screen
  const stripeH = Math.round(H * 0.025);
  const stripeY = screenY - stripeH - Math.round(H * 0.005);
  rr(screenX, stripeY, pw, stripeH, stripeH / 2, '#7B68B0', null);

  // "DOT MATRIX WITH STEREO SOUND" inside stripe
  const dmSize = Math.max(5, Math.round(stripeH * 0.55));
  ctx.fillStyle = '#D4CCF0';
  ctx.font = `${dmSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DOT MATRIX WITH STEREO SOUND', screenX + pw / 2, stripeY + stripeH / 2);

  // Screen bezel — very thin darker inset around screen
  const bpad = Math.round(W * 0.012);
  rr(screenX - bpad, screenY - bpad, pw + bpad * 2, ph + bpad * 2, 4, '#A0A0A0', null);

  // Battery LED — left of stripe, vertically centred on stripe
  const ledR = Math.round(W * 0.018);
  const ledX = screenX - Math.round(W * 0.08);
  const ledY = stripeY + stripeH / 2;
  ctx.beginPath();
  ctx.arc(ledX, ledY, ledR, 0, Math.PI * 2);
  ctx.fillStyle = '#DD0000';
  ctx.fill();
  // "BATTERY" label below LED
  ctx.fillStyle = '#555555';
  ctx.font = `${Math.max(4, Math.round(W * 0.028))}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('BATTERY', ledX, ledY + ledR + 2);

  // Screen glass
  ctx.imageSmoothingEnabled = false;
  rr(screenX, screenY, pw, ph, 3, '#8BAC0F', null);
  ctx.drawImage(pixelCanvas, screenX, screenY, pw, ph);

  // ── Nintendo GAME BOY™ logo ────────────────────────────────────
  // Positioned 53%–62% of body height
  const logoBaseY = Math.round(H * 0.625);
  const nintendoSize = Math.round(W * 0.072);
  const gameboySize  = Math.round(W * 0.130);

  ctx.fillStyle = '#1A2FA0';
  ctx.font = `italic bold ${nintendoSize}px Georgia, serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const logoLeft = Math.round(W * 0.10);
  ctx.fillText('Nintendo', logoLeft, logoBaseY);

  ctx.font = `bold ${gameboySize}px Arial Black, sans-serif`;
  ctx.fillText('GAME BOY', logoLeft, logoBaseY + gameboySize * 1.05);

  // ™ superscript
  ctx.font = `bold ${Math.round(gameboySize * 0.35)}px Arial, sans-serif`;
  ctx.textBaseline = 'top';
  const gbW = (() => {
    ctx.font = `bold ${gameboySize}px Arial Black, sans-serif`;
    const m = ctx.measureText('GAME BOY').width;
    ctx.font = `bold ${Math.round(gameboySize * 0.35)}px Arial, sans-serif`;
    return m;
  })();
  ctx.fillText('™', logoLeft + gbW + 2, logoBaseY - gameboySize * 0.75);
  ctx.textBaseline = 'alphabetic';

  // ── Controls (64%–87%) ─────────────────────────────────────────
  const ctrlMidY = Math.round(H * 0.755);

  // D-pad — left quarter of body, cross shape
  const dpadCX = Math.round(W * 0.235);
  const dpadCY = ctrlMidY;
  const arm    = Math.round(W * 0.085);
  const thick  = Math.round(W * 0.062);

  ctx.fillStyle = '#1A1A30';
  // horizontal bar
  rr(dpadCX - arm, dpadCY - thick / 2, arm * 2, thick, Math.round(thick * 0.15), '#1A1A30', null);
  // vertical bar
  rr(dpadCX - thick / 2, dpadCY - arm, thick, arm * 2, Math.round(thick * 0.15), '#1A1A30', null);

  // A button (right, higher) — hot pink
  const btnR = Math.round(W * 0.072);
  const aBtnX = Math.round(W * 0.785);
  const aBtnY = ctrlMidY - Math.round(H * 0.038);
  ctx.beginPath();
  ctx.arc(aBtnX, aBtnY, btnR, 0, Math.PI * 2);
  ctx.fillStyle = '#C41060';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.round(btnR * 0.80)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', aBtnX, aBtnY + 1);

  // B button (left of A, lower)
  const bBtnX = Math.round(W * 0.640);
  const bBtnY = ctrlMidY + Math.round(H * 0.020);
  ctx.beginPath();
  ctx.arc(bBtnX, bBtnY, btnR, 0, Math.PI * 2);
  ctx.fillStyle = '#C41060';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText('B', bBtnX, bBtnY + 1);
  ctx.textBaseline = 'alphabetic';

  // SELECT / START — small tilted ovals, centre of body
  const ssY    = Math.round(H * 0.845);
  const ssW    = Math.round(W * 0.110);
  const ssH    = Math.round(H * 0.020);
  const ssR    = ssH / 2;
  const selX   = Math.round(W * 0.355);
  const startX = Math.round(W * 0.530);
  const tilt   = -0.20; // radians

  function ovalBtn(cx, cy, label) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    rr(-ssW / 2, -ssH / 2, ssW, ssH, ssR, '#666666', null);
    ctx.restore();
    ctx.fillStyle = '#555555';
    ctx.font = `${Math.max(5, Math.round(H * 0.018))}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, cx, cy + ssH / 2 + 4);
  }

  ovalBtn(selX,   ssY, 'SELECT');
  ovalBtn(startX, ssY, 'START');

  // ── Speaker grille (diagonal slots, bottom-right) ───────────────
  // Real DMG: ~6 diagonal parallel slots, angled ~50° from horizontal
  const grillCX   = Math.round(W * 0.730);
  const grillCY   = Math.round(H * 0.835);
  const slotCount = 6;
  const slotLen   = Math.round(H * 0.060);
  const slotThick = Math.round(W * 0.020);
  const slotPitch = Math.round(W * 0.040); // spacing between slots
  const slotAngle = Math.PI * 0.30;         // ~54° — matches photo

  for (let i = 0; i < slotCount; i++) {
    const ox = (i - (slotCount - 1) / 2) * slotPitch;
    ctx.save();
    ctx.translate(grillCX + ox, grillCY);
    ctx.rotate(slotAngle);
    rr(-slotThick / 2, -slotLen / 2, slotThick, slotLen, slotThick / 2, '#9A9A9A', null);
    ctx.restore();
  }

  // ── "NINTENDO" tiny footer ─────────────────────────────────────
  ctx.fillStyle = '#888888';
  ctx.font = `${Math.max(5, Math.round(W * 0.038))}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('NINTENDO', W / 2, H - Math.round(H * 0.025));

  return canvas;
}

// ── Polaroid ───────────────────────────────────────────────────────
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

// ── Arcade ─────────────────────────────────────────────────────────
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
  drawStar(24, 24, 10); drawStar(W - 24, 24, 10);
  drawStar(24, H - 24, 10); drawStar(W - 24, H - 24, 10);

  ctx.fillStyle = '#000';
  ctx.fillRect(padX - 4, padT - 4, pw + 8, ph + 8);
  ctx.drawImage(pixelCanvas, padX, padT);

  return canvas;
}

// ── Film Strip ─────────────────────────────────────────────────────
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

  const holeW = 16, holeH = 10;
  const holeCount = Math.floor(W / 24);
  const holeSpacing = W / holeCount;
  for (let i = 0; i < holeCount; i++) {
    const hx = i * holeSpacing + holeSpacing / 2 - holeW / 2;
    roundRect(ctx, hx, (sprocketH - holeH) / 2, holeW, holeH, 3, '#000', null);
    roundRect(ctx, hx, ph + sprocketH + (sprocketH - holeH) / 2, holeW, holeH, 3, '#000', null);
  }

  ctx.drawImage(pixelCanvas, 16, sprocketH);
  return canvas;
}

// ── Shared util ────────────────────────────────────────────────────
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
  if (fill)   { ctx.fillStyle = fill;     ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}

export const FRAME_OPTIONS = [
  { id: 'none',      label: 'None' },
  { id: 'gameboy',   label: 'Game Boy' },
  { id: 'polaroid',  label: 'Polaroid' },
  { id: 'arcade',    label: 'Arcade' },
  { id: 'filmstrip', label: 'Film Strip' },
];
