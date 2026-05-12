import { useState, useEffect, useRef, useCallback } from 'react';
import { pixelate } from '../engine/pixelate';
import { presets } from '../presets';

export function usePixelEngine(sourceImage, activePresetId, gridSizeOverride, brightness, contrast) {
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cacheRef = useRef({});
  const rafRef = useRef(null);

  const run = useCallback(() => {
    if (!sourceImage) return;
    const preset = presets[activePresetId];
    const gridSize = gridSizeOverride ?? preset.defaultGrid;
    const cacheKey = `${activePresetId}-${gridSize}-${brightness}-${contrast}`;

    if (cacheRef.current[cacheKey]) {
      setResult(cacheRef.current[cacheKey]);
      return;
    }

    setIsProcessing(true);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const out = pixelate(sourceImage, preset, gridSize, brightness, contrast);
      cacheRef.current[cacheKey] = out;
      setResult(out);
      setIsProcessing(false);
    });
  }, [sourceImage, activePresetId, gridSizeOverride, brightness, contrast]);

  useEffect(() => {
    run();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [run]);

  useEffect(() => {
    cacheRef.current = {};
    setResult(null);
  }, [sourceImage]);

  return { result, isProcessing };
}
