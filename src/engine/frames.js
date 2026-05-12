// ─── Colour constants matching the real DMG-01 ───
const COLORS = {
  shellLight: '#C8C4BE',
  shellMid: '#B0ACA6',
  shellDark: '#98948E',
  shellEdge: '#7A7672',
  panelDark: '#6B6760',
  panelBorder: '#555250',
  screenBezel: '#5C5550',
  screenInner: '#9bbc0f',
  textDark: '#3A3835',
  textLight: '#8A8680',
  textOnPanel: '#9A9690',
  dpadFace: '#1C1A18',
  dpadEdge: '#2C2A28',
  dpadShadow: '#101010',
  buttonFace: '#8B1A3A',
  buttonHighlight: '#A82050',
  buttonShadow: '#5A0E25',
  startSelectFace: '#6B6760',
  startSelectShadow: '#555250',
  grilleDark: '#555250',
  grilleLight: '#B0ACA6',
  ledLabel: '#8A8680',
  ledDot: '#3A6A3A',
};

function renderGameBoyFrame(pixelArtCanvas, options = {}) {
  const scale = options.scale || 1;
  const s = (v) => Math.round(v * scale);

  const BODY_W = s(320);
  const BODY_H = s(520);
  const BODY_RADIUS = s(12);

  const PANEL_X = s(12);
  const PANEL_Y = s(10);
  const PANEL_W = BODY_W - s(24);
  const PANEL_H = s(220);
  const PANEL_RADIUS = s(8);

  const SCREEN_BEZEL_X = s(48);
  const SCREEN_BEZEL_Y = s(32);
  const SCREEN_BEZEL_W = s(224);
  const SCREEN_BEZEL_H = s(180);
  const SCREEN_BEZEL_RADIUS = s(6);

  const SCREEN_X = s(68);
  const SCREEN_Y = s(52);
  const SCREEN_W = s(184);
  const SCREEN_H = s(164);

  const DOT_MATRIX_Y = s(24);
  const BATTERY_X = s(24);
  const BATTERY_Y = s(110);
  const LOGO_Y = s(248);

  const DPAD_CX = s(80);
  const DPAD_CY = s(340);
  const DPAD_ARM_W = s(28);
  const DPAD_ARM_H = s(38);
  const DPAD_RADIUS = s(3);

  const BTN_A_CX = s(258);
  const BTN_A_CY = s(320);
  const BTN_B_CX = s(212);
  const BTN_B_CY = s(348);
  const BTN_RADIUS = s(18);

  const SS_Y = s(410);
  const SELECT_CX = s(112);
  const START_CX = s(170);
  const SS_W = s(40);
  const SS_H = s(10);
  const SS_RADIUS = s(5);
  const SS_ANGLE = -25 * (Math.PI / 180);

  const GRILLE_X = s(210);
  const GRILLE_Y = s(430);
  const GRILLE_W = s(80);
  const GRILLE_H = s(60);

  const canvas = document.createElement('canvas');
  canvas.width = BODY_W + s(20);
  canvas.height = BODY_H + s(20);
  const ctx = canvas.getContext('2d');

  const ox = s(10);
  const oy = s(10);

  function roundRect(x, y, w, h, r) {
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
  }

  function fillRoundRect(x, y, w, h, r, color) {
    ctx.fillStyle = color;
    roundRect(x, y, w, h, r);
    ctx.fill();
  }

  function strokeRoundRect(x, y, w, h, r, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    roundRect(x, y, w, h, r);
    ctx.stroke();
  }

  // 1. Body shell
  fillRoundRect(ox + s(2), oy + s(2), BODY_W, BODY_H, BODY_RADIUS, COLORS.shellEdge);
  fillRoundRect(ox, oy, BODY_W, BODY_H, BODY_RADIUS, COLORS.shellLight);
  ctx.save();
  roundRect(ox, oy, BODY_W, s(60), BODY_RADIUS);
  ctx.clip();
  fillRoundRect(ox, oy, BODY_W, s(60), BODY_RADIUS, '#D0CCC6');
  ctx.restore();

  // 2. Top dark panel
  fillRoundRect(ox + PANEL_X, oy + PANEL_Y, PANEL_W, PANEL_H, PANEL_RADIUS, COLORS.panelDark);
  ctx.fillStyle = COLORS.panelBorder;
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(ox + PANEL_X + s(8), oy + PANEL_Y + s(3) + i * s(3), PANEL_W - s(16), s(1));
  }

  // DOT MATRIX text
  ctx.fillStyle = COLORS.textOnPanel;
  ctx.font = `${s(6)}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('DOT MATRIX WITH STEREO SOUND', ox + BODY_W / 2, oy + DOT_MATRIX_Y);

  // 3. Screen bezel
  fillRoundRect(
    ox + SCREEN_BEZEL_X, oy + SCREEN_BEZEL_Y,
    SCREEN_BEZEL_W, SCREEN_BEZEL_H,
    SCREEN_BEZEL_RADIUS, COLORS.screenBezel
  );
  strokeRoundRect(
    ox + SCREEN_X - s(2), oy + SCREEN_Y - s(2),
    SCREEN_W + s(4), SCREEN_H + s(4),
    s(2), '#3A3530', s(1.5)
  );

  // Screen / pixel art
  if (pixelArtCanvas) {
    ctx.save();
    roundRect(ox + SCREEN_X, oy + SCREEN_Y, SCREEN_W, SCREEN_H, s(1));
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(pixelArtCanvas, ox + SCREEN_X, oy + SCREEN_Y, SCREEN_W, SCREEN_H);
    ctx.restore();
  } else {
    fillRoundRect(ox + SCREEN_X, oy + SCREEN_Y, SCREEN_W, SCREEN_H, s(1), COLORS.screenInner);
  }

  // 4. Battery indicator
  ctx.fillStyle = COLORS.textOnPanel;
  ctx.font = `bold ${s(5)}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('BATTERY', ox + BATTERY_X + s(14), oy + BATTERY_Y);
  ctx.beginPath();
  ctx.arc(ox + BATTERY_X + s(14), oy + BATTERY_Y + s(10), s(4), 0, Math.PI * 2);
  ctx.fillStyle = COLORS.ledDot;
  ctx.fill();
  ctx.strokeStyle = '#2A4A2A';
  ctx.lineWidth = s(1);
  ctx.stroke();

  // 5. Screen line decorations
  ctx.fillStyle = COLORS.panelBorder;
  const lineY1 = oy + SCREEN_BEZEL_Y + SCREEN_BEZEL_H - s(30);
  const lineY2 = oy + SCREEN_BEZEL_Y + SCREEN_BEZEL_H - s(20);
  ctx.fillRect(ox + PANEL_X + s(4), lineY1, SCREEN_BEZEL_X - PANEL_X - s(8), s(1));
  ctx.fillRect(ox + PANEL_X + s(4), lineY2, SCREEN_BEZEL_X - PANEL_X - s(8), s(1));

  // 6. Nintendo GAME BOY logo
  ctx.fillStyle = COLORS.textDark;
  ctx.textAlign = 'center';
  ctx.save();
  ctx.font = `italic ${s(14)}px "Times New Roman", Georgia, serif`;
  ctx.fillText('Nintendo', ox + BODY_W / 2, oy + LOGO_Y);
  ctx.restore();
  ctx.font = `bold ${s(24)}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.fillText('GAME BOY', ox + BODY_W / 2, oy + LOGO_Y + s(26));
  ctx.font = `${s(7)}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('™', ox + BODY_W / 2 + s(68), oy + LOGO_Y + s(16));

  // 7. D-pad
  ctx.fillStyle = COLORS.dpadShadow;
  ctx.beginPath();
  ctx.arc(ox + DPAD_CX, oy + DPAD_CY + s(2), s(44), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.shellDark;
  ctx.beginPath();
  ctx.arc(ox + DPAD_CX, oy + DPAD_CY, s(44), 0, Math.PI * 2);
  ctx.fill();
  // vertical arm
  fillRoundRect(
    ox + DPAD_CX - DPAD_ARM_W / 2, oy + DPAD_CY - DPAD_ARM_H,
    DPAD_ARM_W, DPAD_ARM_H * 2, DPAD_RADIUS, COLORS.dpadFace
  );
  // horizontal arm
  fillRoundRect(
    ox + DPAD_CX - DPAD_ARM_H, oy + DPAD_CY - DPAD_ARM_W / 2,
    DPAD_ARM_H * 2, DPAD_ARM_W, DPAD_RADIUS, COLORS.dpadFace
  );
  ctx.beginPath();
  ctx.arc(ox + DPAD_CX, oy + DPAD_CY, s(6), 0, Math.PI * 2);
  ctx.fillStyle = COLORS.dpadEdge;
  ctx.fill();
  ctx.fillStyle = '#2A2825';
  drawTriangle(ctx, ox + DPAD_CX,        oy + DPAD_CY - s(24), s(6), 'up');
  drawTriangle(ctx, ox + DPAD_CX,        oy + DPAD_CY + s(24), s(6), 'down');
  drawTriangle(ctx, ox + DPAD_CX - s(24), oy + DPAD_CY,        s(6), 'left');
  drawTriangle(ctx, ox + DPAD_CX + s(24), oy + DPAD_CY,        s(6), 'right');

  // 8. A and B buttons
  drawButton(ctx, ox + BTN_A_CX, oy + BTN_A_CY, BTN_RADIUS, 'A', s);
  drawButton(ctx, ox + BTN_B_CX, oy + BTN_B_CY, BTN_RADIUS, 'B', s);
  ctx.fillStyle = COLORS.textDark;
  ctx.font = `bold ${s(10)}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('A', ox + BTN_A_CX + s(18), oy + BTN_A_CY - s(22));
  ctx.fillText('B', ox + BTN_B_CX - s(18), oy + BTN_B_CY + s(26));

  // 9. Select / Start
  function drawOval(cx) {
    ctx.save();
    ctx.translate(ox + cx, oy + SS_Y);
    ctx.rotate(SS_ANGLE);
    fillRoundRect(-SS_W / 2, -SS_H / 2, SS_W, SS_H, SS_RADIUS, COLORS.startSelectFace);
    ctx.strokeStyle = COLORS.startSelectShadow;
    ctx.lineWidth = s(1);
    roundRect(-SS_W / 2, -SS_H / 2, SS_W, SS_H, SS_RADIUS);
    ctx.stroke();
    ctx.restore();
  }
  drawOval(SELECT_CX);
  drawOval(START_CX);

  ctx.fillStyle = COLORS.textDark;
  ctx.font = `bold ${s(7)}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.save();
  ctx.translate(ox + SELECT_CX, oy + SS_Y + s(14));
  ctx.rotate(SS_ANGLE);
  ctx.fillText('SELECT', 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(ox + START_CX, oy + SS_Y + s(14));
  ctx.rotate(SS_ANGLE);
  ctx.fillText('START', 0, 0);
  ctx.restore();

  // 10. Speaker grille
  drawSpeakerGrille(ctx, ox + GRILLE_X, oy + GRILLE_Y, GRILLE_W, GRILLE_H, s);

  // 11. Bottom ridge
  ctx.fillStyle = COLORS.shellMid;
  ctx.fillRect(ox + s(20), oy + BODY_H - s(14), BODY_W - s(40), s(1));

  return canvas;
}

function drawTriangle(ctx, cx, cy, size, direction) {
  ctx.beginPath();
  switch (direction) {
    case 'up':
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx - size * 0.7, cy + size * 0.4);
      ctx.lineTo(cx + size * 0.7, cy + size * 0.4);
      break;
    case 'down':
      ctx.moveTo(cx, cy + size);
      ctx.lineTo(cx - size * 0.7, cy - size * 0.4);
      ctx.lineTo(cx + size * 0.7, cy - size * 0.4);
      break;
    case 'left':
      ctx.moveTo(cx - size, cy);
      ctx.lineTo(cx + size * 0.4, cy - size * 0.7);
      ctx.lineTo(cx + size * 0.4, cy + size * 0.7);
      break;
    case 'right':
      ctx.moveTo(cx + size, cy);
      ctx.lineTo(cx - size * 0.4, cy - size * 0.7);
      ctx.lineTo(cx - size * 0.4, cy + size * 0.7);
      break;
  }
  ctx.closePath();
  ctx.fill();
}

function drawButton(ctx, cx, cy, radius, label, s) {
  ctx.beginPath();
  ctx.arc(cx, cy + s(2), radius + s(2), 0, Math.PI * 2);
  ctx.fillStyle = COLORS.buttonShadow;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.buttonFace;
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.beginPath();
  ctx.arc(cx, cy - s(6), radius - s(2), 0, Math.PI * 2);
  ctx.fillStyle = COLORS.buttonHighlight;
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, radius - s(1), 0, Math.PI * 2);
  ctx.strokeStyle = COLORS.buttonShadow;
  ctx.lineWidth = s(0.5);
  ctx.stroke();
}

function drawSpeakerGrille(ctx, x, y, w, h, s) {
  const slotCount = 6;
  const slotWidth = s(4);
  const gap = (w - slotCount * slotWidth) / (slotCount + 1);
  const angle = -25 * (Math.PI / 180);

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(angle);

  for (let i = 0; i < slotCount; i++) {
    const sx = -w / 2 + gap + i * (slotWidth + gap);
    const slotH = h - s(8);
    const r = slotWidth / 2;
    ctx.fillStyle = COLORS.grilleDark;
    ctx.beginPath();
    ctx.moveTo(sx + r, -slotH / 2);
    ctx.lineTo(sx + slotWidth - r, -slotH / 2);
    ctx.arcTo(sx + slotWidth, -slotH / 2, sx + slotWidth, -slotH / 2 + r, r);
    ctx.lineTo(sx + slotWidth, slotH / 2 - r);
    ctx.arcTo(sx + slotWidth, slotH / 2, sx + slotWidth - r, slotH / 2, r);
    ctx.lineTo(sx + r, slotH / 2);
    ctx.arcTo(sx, slotH / 2, sx, slotH / 2 - r, r);
    ctx.lineTo(sx, -slotH / 2 + r);
    ctx.arcTo(sx, -slotH / 2, sx + r, -slotH / 2, r);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// ── Other frames ────────────────────────────────────────────────────

function framePolaroid(pixelCanvas) {
  const pw = pixelCanvas.width;
  const ph = pixelCanvas.height;
  const side = Math.round(pw * 0.12);
  const top  = Math.round(ph * 0.12);
  const bot  = Math.round(ph * 0.30);
  const W = pw + side * 2;
  const H = ph + top + bot;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillRect(0, 0, W, H);
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
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1A1A2E';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#D85A30';
  ctx.fillRect(0, 0, W, 8); ctx.fillRect(0, H - 8, W, 8);
  ctx.fillRect(0, 0, 8, H); ctx.fillRect(W - 8, 0, 8, H);
  ctx.fillStyle = '#F0E68C';
  ctx.font = `bold ${Math.max(10, Math.round(W * 0.04))}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('pixpaws', W / 2, padT * 0.6);
  function star(cx, cy, r) {
    ctx.fillStyle = '#F0E68C';
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      ctx.fillRect(Math.round(cx + Math.cos(a) * r) - 2, Math.round(cy + Math.sin(a) * r) - 2, 4, 4);
    }
  }
  star(24, 24, 10); star(W - 24, 24, 10); star(24, H - 24, 10); star(W - 24, H - 24, 10);
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
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1C1008';
  ctx.fillRect(0, 0, W, H);
  const holeW = 16, holeH = 10, holeR = 3;
  const holeCount = Math.floor(W / 24);
  const sp = W / holeCount;
  for (let i = 0; i < holeCount; i++) {
    const hx = i * sp + sp / 2 - holeW / 2;
    [0, ph + sprocketH].forEach(hy => {
      ctx.beginPath();
      ctx.moveTo(hx + holeR, hy + (sprocketH - holeH) / 2);
      ctx.lineTo(hx + holeW - holeR, hy + (sprocketH - holeH) / 2);
      ctx.arcTo(hx + holeW, hy + (sprocketH - holeH) / 2, hx + holeW, hy + (sprocketH - holeH) / 2 + holeR, holeR);
      ctx.lineTo(hx + holeW, hy + (sprocketH + holeH) / 2 - holeR);
      ctx.arcTo(hx + holeW, hy + (sprocketH + holeH) / 2, hx + holeW - holeR, hy + (sprocketH + holeH) / 2, holeR);
      ctx.lineTo(hx + holeR, hy + (sprocketH + holeH) / 2);
      ctx.arcTo(hx, hy + (sprocketH + holeH) / 2, hx, hy + (sprocketH + holeH) / 2 - holeR, holeR);
      ctx.lineTo(hx, hy + (sprocketH - holeH) / 2 + holeR);
      ctx.arcTo(hx, hy + (sprocketH - holeH) / 2, hx + holeR, hy + (sprocketH - holeH) / 2, holeR);
      ctx.closePath();
      ctx.fillStyle = '#000';
      ctx.fill();
    });
  }
  ctx.drawImage(pixelCanvas, 16, sprocketH);
  return canvas;
}

// ── Public API ───────────────────────────────────────────────────────

export function applyFrame(pixelCanvas, frameId) {
  if (!frameId || frameId === 'none') return pixelCanvas;
  switch (frameId) {
    case 'gameboy':   return renderGameBoyFrame(pixelCanvas);
    case 'polaroid':  return framePolaroid(pixelCanvas);
    case 'arcade':    return frameArcade(pixelCanvas);
    case 'filmstrip': return frameFilmstrip(pixelCanvas);
    default:          return pixelCanvas;
  }
}

export const FRAME_OPTIONS = [
  { id: 'none',      label: 'None' },
  { id: 'gameboy',   label: 'Game Boy' },
  { id: 'polaroid',  label: 'Polaroid' },
  { id: 'arcade',    label: 'Arcade' },
  { id: 'filmstrip', label: 'Film Strip' },
];
