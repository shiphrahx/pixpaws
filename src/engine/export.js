import { pixelate, renderToCanvas } from './pixelate';

const BASE_BLOCK = 8;

export function exportPng(pixelCanvas, gridW, gridH, preset, scale, filename) {
  const outCanvas = document.createElement('canvas');
  const blockSize = BASE_BLOCK * scale;
  outCanvas.width = gridW * blockSize + (preset.frame?.width ?? 0) * 2;
  outCanvas.height = gridH * blockSize + (preset.frame?.width ?? 0) * 2;
  renderToCanvas(pixelCanvas, gridW, gridH, outCanvas, preset);

  outCanvas.toBlob((blob) => {
    if (!blob) {
      console.error('pixpaws: export failed — toBlob returned null');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

export function makeFilename(presetId) {
  return `pixpaws-${presetId}-${Date.now()}.png`;
}
