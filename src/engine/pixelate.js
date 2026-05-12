import { buildPaletteRgb, quantise } from './quantise';

const MAX_SOURCE_SIZE = 1000;

function applyBrightnessContrast(imageData, brightness, contrast) {
  if (brightness === 0 && contrast === 0) return imageData;
  const data = imageData.data;
  const b = brightness * 2.55;
  const c = (contrast / 50 + 1) ** 2;
  for (let i = 0; i < data.length; i += 4) {
    for (let ch = 0; ch < 3; ch++) {
      let v = data[i + ch];
      v = v * c - 128 * (c - 1) + b;
      data[i + ch] = Math.max(0, Math.min(255, v));
    }
  }
  return imageData;
}

export function pixelate(sourceImage, preset, gridSize, brightness, contrast, dithering = 'none', paletteOverride = null) {
  const paletteRgb = buildPaletteRgb(paletteOverride ?? preset.palette);

  let srcW = sourceImage.naturalWidth || sourceImage.width;
  let srcH = sourceImage.naturalHeight || sourceImage.height;

  if (srcW > MAX_SOURCE_SIZE || srcH > MAX_SOURCE_SIZE) {
    const scale = MAX_SOURCE_SIZE / Math.max(srcW, srcH);
    srcW = Math.round(srcW * scale);
    srcH = Math.round(srcH * scale);
  }

  const aspect = srcW / srcH;
  let gridW, gridH;
  if (aspect >= 1) {
    gridW = gridSize;
    gridH = Math.max(1, Math.round(gridSize / aspect));
  } else {
    gridH = gridSize;
    gridW = Math.max(1, Math.round(gridSize * aspect));
  }

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = gridW;
  srcCanvas.height = gridH;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) throw new Error('pixpaws: 2D canvas context unavailable');
  srcCtx.imageSmoothingEnabled = true;
  srcCtx.imageSmoothingQuality = 'high';
  srcCtx.drawImage(sourceImage, 0, 0, gridW, gridH);

  let imgData = srcCtx.getImageData(0, 0, gridW, gridH);
  imgData = applyBrightnessContrast(imgData, brightness, contrast);
  imgData = quantise(imgData, paletteRgb, dithering);
  srcCtx.putImageData(imgData, 0, 0);

  return { pixelCanvas: srcCanvas, gridW, gridH };
}

export function renderToCanvas(pixelCanvas, gridW, gridH, displayCanvas, preset) {
  const displayCtx = displayCanvas.getContext('2d');
  const dW = displayCanvas.width;
  const dH = displayCanvas.height;

  displayCtx.clearRect(0, 0, dW, dH);

  if (preset.bgFill) {
    displayCtx.fillStyle = preset.bgFill;
    displayCtx.fillRect(0, 0, dW, dH);
  }

  const fw = preset.frame?.width ?? 0;
  const innerW = dW - fw * 2;
  const innerH = dH - fw * 2;

  displayCtx.imageSmoothingEnabled = false;
  displayCtx.drawImage(pixelCanvas, fw, fw, innerW, innerH);

  if (fw > 0) {
    displayCtx.strokeStyle = preset.frame.color;
    displayCtx.lineWidth = fw;
    displayCtx.strokeRect(fw / 2, fw / 2, dW - fw, dH - fw);
  }
}
