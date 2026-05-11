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

export function quantiseImageData(imageData, paletteRgb) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const [nr, ng, nb] = nearestColor(data[i], data[i + 1], data[i + 2], paletteRgb);
    data[i] = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
  }
  return imageData;
}
