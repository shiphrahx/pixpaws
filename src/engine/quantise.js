function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function weightedDistance(r1, g1, b1, r2, g2, b2) {
  return 2 * (r1 - r2) ** 2 + 4 * (g1 - g2) ** 2 + 3 * (b1 - b2) ** 2;
}

export function buildPaletteRgb(palette) {
  return palette.map(hexToRgb);
}

export function nearestColor(r, g, b, paletteRgb) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < paletteRgb.length; i++) {
    const [pr, pg, pb] = paletteRgb[i];
    const d = weightedDistance(r, g, b, pr, pg, pb);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return paletteRgb[best];
}

export function quantiseNone(imageData, paletteRgb) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const [nr, ng, nb] = nearestColor(data[i], data[i + 1], data[i + 2], paletteRgb);
    data[i] = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
  }
  return imageData;
}

// Legacy alias used by V1 callers
export const quantiseImageData = quantiseNone;

export function quantiseFloydSteinberg(imageData, paletteRgb) {
  const { width, height } = imageData;
  const src = imageData.data;

  // Work in floats to preserve precision across error diffusion
  const buf = new Float32Array(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    buf[i * 3]     = src[i * 4];
    buf[i * 3 + 1] = src[i * 4 + 1];
    buf[i * 3 + 2] = src[i * 4 + 2];
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      const or = Math.max(0, Math.min(255, buf[idx]));
      const og = Math.max(0, Math.min(255, buf[idx + 1]));
      const ob = Math.max(0, Math.min(255, buf[idx + 2]));

      const [nr, ng, nb] = nearestColor(or, og, ob, paletteRgb);

      buf[idx]     = nr;
      buf[idx + 1] = ng;
      buf[idx + 2] = nb;

      const er = or - nr;
      const eg = og - ng;
      const eb = ob - nb;

      function addErr(dx, dy, frac) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= width || ny >= height) return;
        const ni = (ny * width + nx) * 3;
        buf[ni]     += er * frac;
        buf[ni + 1] += eg * frac;
        buf[ni + 2] += eb * frac;
      }

      addErr(1,  0, 7 / 16);
      addErr(-1, 1, 3 / 16);
      addErr(0,  1, 5 / 16);
      addErr(1,  1, 1 / 16);
    }
  }

  for (let i = 0; i < width * height; i++) {
    src[i * 4]     = Math.max(0, Math.min(255, Math.round(buf[i * 3])));
    src[i * 4 + 1] = Math.max(0, Math.min(255, Math.round(buf[i * 3 + 1])));
    src[i * 4 + 2] = Math.max(0, Math.min(255, Math.round(buf[i * 3 + 2])));
  }

  return imageData;
}

const BAYER_4X4 = [
   0,  8,  2, 10,
  12,  4, 14,  6,
   3, 11,  1,  9,
  15,  7, 13,  5,
];
const BAYER_SPREAD = 64;

export function quantiseOrdered(imageData, paletteRgb) {
  const { width, height } = imageData;
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const threshold = (BAYER_4X4[(y % 4) * 4 + (x % 4)] / 16 - 0.5) * BAYER_SPREAD;
      const r = Math.max(0, Math.min(255, data[i]     + threshold));
      const g = Math.max(0, Math.min(255, data[i + 1] + threshold));
      const b = Math.max(0, Math.min(255, data[i + 2] + threshold));
      const [nr, ng, nb] = nearestColor(r, g, b, paletteRgb);
      data[i]     = nr;
      data[i + 1] = ng;
      data[i + 2] = nb;
    }
  }

  return imageData;
}

export function quantiseAtkinson(imageData, paletteRgb) {
  const { width, height } = imageData;
  const src = imageData.data;

  const buf = new Float32Array(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    buf[i * 3]     = src[i * 4];
    buf[i * 3 + 1] = src[i * 4 + 1];
    buf[i * 3 + 2] = src[i * 4 + 2];
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      const or = Math.max(0, Math.min(255, buf[idx]));
      const og = Math.max(0, Math.min(255, buf[idx + 1]));
      const ob = Math.max(0, Math.min(255, buf[idx + 2]));

      const [nr, ng, nb] = nearestColor(or, og, ob, paletteRgb);

      buf[idx]     = nr;
      buf[idx + 1] = ng;
      buf[idx + 2] = nb;

      const er = (or - nr) / 8;
      const eg = (og - ng) / 8;
      const eb = (ob - nb) / 8;

      function addErr(dx, dy) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) return;
        const ni = (ny * width + nx) * 3;
        buf[ni]     += er;
        buf[ni + 1] += eg;
        buf[ni + 2] += eb;
      }

      addErr(1,  0);
      addErr(2,  0);
      addErr(-1, 1);
      addErr(0,  1);
      addErr(1,  1);
      addErr(0,  2);
    }
  }

  for (let i = 0; i < width * height; i++) {
    src[i * 4]     = Math.max(0, Math.min(255, Math.round(buf[i * 3])));
    src[i * 4 + 1] = Math.max(0, Math.min(255, Math.round(buf[i * 3 + 1])));
    src[i * 4 + 2] = Math.max(0, Math.min(255, Math.round(buf[i * 3 + 2])));
  }

  return imageData;
}

export function quantise(imageData, paletteRgb, mode) {
  switch (mode) {
    case 'floyd-steinberg': return quantiseFloydSteinberg(imageData, paletteRgb);
    case 'ordered':         return quantiseOrdered(imageData, paletteRgb);
    case 'atkinson':        return quantiseAtkinson(imageData, paletteRgb);
    default:                return quantiseNone(imageData, paletteRgb);
  }
}
