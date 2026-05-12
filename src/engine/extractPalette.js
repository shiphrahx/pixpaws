function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function samplePixels(imageData, maxPixels = 10000) {
  const { data, width, height } = imageData;
  const total = width * height;
  const step = Math.max(1, Math.floor(total / maxPixels));
  const pixels = [];
  for (let i = 0; i < total; i += step) {
    const idx = i * 4;
    if (data[idx + 3] < 128) continue; // skip transparent
    pixels.push([data[idx], data[idx + 1], data[idx + 2]]);
  }
  return pixels;
}

function channelRange(pixels, ch) {
  let lo = 255, hi = 0;
  for (const p of pixels) { if (p[ch] < lo) lo = p[ch]; if (p[ch] > hi) hi = p[ch]; }
  return hi - lo;
}

function medianCut(pixels, depth) {
  if (depth === 0 || pixels.length === 0) return [pixels];

  // Find widest channel
  const ranges = [channelRange(pixels, 0), channelRange(pixels, 1), channelRange(pixels, 2)];
  const ch = ranges.indexOf(Math.max(...ranges));

  pixels.sort((a, b) => a[ch] - b[ch]);
  const mid = Math.floor(pixels.length / 2);

  return [
    ...medianCut(pixels.slice(0, mid), depth - 1),
    ...medianCut(pixels.slice(mid), depth - 1),
  ];
}

function averageBucket(bucket) {
  if (bucket.length === 0) return [0, 0, 0];
  const sum = [0, 0, 0];
  for (const p of bucket) { sum[0] += p[0]; sum[1] += p[1]; sum[2] += p[2]; }
  return sum.map(v => Math.round(v / bucket.length));
}

export function extractPalette(sourceImage, count) {
  // Downsample to 100×100
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(sourceImage, 0, 0, 100, 100);
  const imageData = ctx.getImageData(0, 0, 100, 100);

  const pixels = samplePixels(imageData);
  const depth = Math.ceil(Math.log2(count));
  const buckets = medianCut(pixels, depth).slice(0, count);

  return buckets.map(b => {
    const [r, g, b2] = averageBucket(b);
    return rgbToHex(r, g, b2);
  });
}
