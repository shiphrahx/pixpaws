import { useState, useEffect, useRef, useCallback } from 'react';
import { pixelate } from '../engine/pixelate';
import { presets } from '../presets';

export function usePixelEngine(sourceImage, activePresetId, gridSizeOverride, brightness, contrast) {
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cacheRef = useRef({});
  const rafRef = useRef(null);
  const sourceImageRef = useRef(sourceImage);

  const run = useCallback(() => {
    if (!sourceImageRef.current) return;
    const preset = presets[activePresetId];
    const gridSize = gridSizeOverride ?? preset.defaultGrid;
    const cacheKey = `${activePresetId}-${gridSize}-${brightness}-${contrast}`;

    if (cacheRef.current[cacheKey]) {
      setResult(cacheRef.current[cacheKey]);
      return;
    }

    setIsProcessing(true);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const imageSnapshot = sourceImageRef.current;
    rafRef.current = requestAnimationFrame(() => {
      const out = pixelate(imageSnapshot, preset, gridSize, brightness, contrast);
      cacheRef.current[cacheKey] = out;
      setResult(out);
      setIsProcessing(false);
    });
  }, [activePresetId, gridSizeOverride, brightness, contrast]);

  // When source image changes: clear cache, clear result, then re-run
  useEffect(() => {
    sourceImageRef.current = sourceImage;
    cacheRef.current = {};
    setResult(null);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (sourceImage) {
      setIsProcessing(true);
      const preset = presets[activePresetId];
      const gridSize = gridSizeOverride ?? preset.defaultGrid;
      const imageSnapshot = sourceImage;
      rafRef.current = requestAnimationFrame(() => {
        const out = pixelate(imageSnapshot, preset, gridSize, brightness, contrast);
        const cacheKey = `${activePresetId}-${gridSize}-${brightness}-${contrast}`;
        cacheRef.current[cacheKey] = out;
        setResult(out);
        setIsProcessing(false);
      });
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [sourceImage]); // eslint-disable-line react-hooks/exhaustive-deps

  // When settings change (but not image): use cache or re-run
  useEffect(() => {
    if (!sourceImageRef.current) return;
    run();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [run]);

  return { result, isProcessing };
}
