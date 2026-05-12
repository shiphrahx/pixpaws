const FONT_URL = 'https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2';
const CORAL = '#D85A30';
const BG = '#F5F0EB';
const DARK = '#1A1A2E';

let fontLoaded = false;
async function ensureFont() {
  if (fontLoaded) return;
  try {
    const font = new FontFace('Press Start 2P', `url(${FONT_URL})`);
    await font.load();
    document.fonts.add(font);
    fontLoaded = true;
  } catch (_) {
    // fallback to monospace if font fails
  }
}

function drawRoundedRect(ctx, x, y, w, h, r) {
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

function drawArrowH(ctx, cx, cy, size) {
  // Pixel-art style right arrow
  const s = Math.round(size);
  ctx.fillStyle = CORAL;
  // shaft
  ctx.fillRect(cx - s, cy - Math.round(s * 0.15), s * 2, Math.round(s * 0.3));
  // head
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.6, cy - s * 0.5);
  ctx.lineTo(cx + s * 1.4, cy);
  ctx.lineTo(cx + s * 0.6, cy + s * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawArrowV(ctx, cx, cy, size) {
  const s = Math.round(size);
  ctx.fillStyle = CORAL;
  ctx.fillRect(cx - Math.round(s * 0.15), cy - s, Math.round(s * 0.3), s * 2);
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.5, cy + s * 0.6);
  ctx.lineTo(cx, cy + s * 1.4);
  ctx.lineTo(cx + s * 0.5, cy + s * 0.6);
  ctx.closePath();
  ctx.fill();
}

function drawLogo(ctx, x, y, fontSize) {
  ctx.font = `${fontSize}px 'Press Start 2P', monospace`;
  ctx.fillStyle = DARK;
  ctx.fillText('pix', x, y);
  const pixW = ctx.measureText('pix').width;
  ctx.fillStyle = CORAL;
  ctx.fillText('paws', x + pixW, y);
}

export async function generateShareCard(originalCanvas, pixelCanvas, preset, gridSize, format) {
  await ensureFont();

  const landscape = format !== 'square';
  const W = landscape ? 1200 : 1080;
  const H = landscape ? 675 : 1080;
  const PAD = 48;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  const bottomBarH = 60;
  const innerH = H - PAD * 2 - bottomBarH;

  let origRect, pixRect, arrowX, arrowY;

  if (landscape) {
    const arrowW = 60;
    const imgW = (W - PAD * 2 - arrowW) / 2;
    const imgH = innerH;
    origRect = { x: PAD, y: PAD, w: imgW, h: imgH };
    pixRect  = { x: PAD + imgW + arrowW, y: PAD, w: imgW, h: imgH };
    arrowX = PAD + imgW + arrowW / 2;
    arrowY = PAD + imgH / 2;
  } else {
    const arrowH = 60;
    const imgH = (innerH - arrowH) / 2;
    const imgW = W - PAD * 2;
    origRect = { x: PAD, y: PAD, w: imgW, h: imgH };
    pixRect  = { x: PAD, y: PAD + imgH + arrowH, w: imgW, h: imgH };
    arrowX = W / 2;
    arrowY = PAD + imgH + arrowH / 2;
  }

  function drawImageInRect(src, rect) {
    const srcAspect = src.width / src.height;
    const rectAspect = rect.w / rect.h;
    let dw, dh, dx, dy;
    if (srcAspect > rectAspect) {
      dw = rect.w; dh = rect.w / srcAspect;
    } else {
      dh = rect.h; dw = rect.h * srcAspect;
    }
    dx = rect.x + (rect.w - dw) / 2;
    dy = rect.y + (rect.h - dh) / 2;

    ctx.save();
    drawRoundedRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, dx, dy, dw, dh);
    ctx.restore();

    // border
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.stroke();
  }

  drawImageInRect(originalCanvas, origRect);
  drawImageInRect(pixelCanvas, pixRect);

  if (landscape) {
    drawArrowH(ctx, arrowX, arrowY, 20);
  } else {
    drawArrowV(ctx, arrowX, arrowY, 20);
  }

  // Bottom bar
  const barY = H - PAD - bottomBarH + 20;
  const fontSize = Math.round(W * 0.014);
  drawLogo(ctx, PAD, barY + fontSize, fontSize);

  const infoText = `${preset.name} · ${gridSize}×${gridSize} grid`;
  ctx.font = `${Math.round(W * 0.012)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(26,26,46,0.5)';
  ctx.textAlign = 'right';
  ctx.fillText(infoText, W - PAD, barY + fontSize);
  ctx.textAlign = 'left';

  return canvas;
}
