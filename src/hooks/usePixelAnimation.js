import { useState, useRef, useCallback } from 'react';
import { pixelate } from '../engine/pixelate';

const STEP_DELAY_MS = 80;

export function usePixelAnimation() {
  const [animFrame, setAnimFrame] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const cancelRef = useRef(false);

  const animate = useCallback(async (sourceImage, preset, targetGrid, dithering, paletteOverride) => {
    cancelRef.current = true; // cancel any in-flight animation
    await new Promise(r => setTimeout(r, 0)); // yield so state settles
    cancelRef.current = false;
    setIsAnimating(true);

    const gridSteps    = [200, 100, 50, targetGrid, targetGrid];
    const ditherSteps  = ['none', 'none', 'none', 'none', dithering];
    const effectivePalette = paletteOverride ?? preset.palette;
    const effectivePreset  = paletteOverride ? { ...preset, palette: effectivePalette } : preset;

    for (let i = 0; i < gridSteps.length; i++) {
      if (cancelRef.current) { setIsAnimating(false); return; }
      const g = gridSteps[i];
      const d = ditherSteps[i];
      const { pixelCanvas } = pixelate(sourceImage, effectivePreset, g, 0, 0, d, paletteOverride);
      setAnimFrame(pixelCanvas);
      await new Promise(r => requestAnimationFrame(() => setTimeout(r, STEP_DELAY_MS)));
    }

    setIsAnimating(false);
    setAnimFrame(null); // signal animation complete — caller uses engine result
  }, []);

  const cancel = useCallback(() => {
    cancelRef.current = true;
    setIsAnimating(false);
    setAnimFrame(null);
  }, []);

  return { animFrame, isAnimating, animate, cancel };
}
