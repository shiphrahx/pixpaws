import { useState, useEffect, useRef, useCallback } from 'react';
import { pixelate } from '../engine/pixelate';
import { presets } from '../presets';

export function usePixelEngine(sourceImage, activePresetId, gridSizeOverride, brightness, contrast, dithering = 'floyd-steinberg') {
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cacheRef = useRef({});
  const rafRef = useRef(null);
  const sourceImageRef = useRef(sourceImage);

  const settingsRef = useRef({ activePresetId, gridSizeOverride, brightness, contrast, dithering });
  useEffect(() => {
    settingsRef.current = { activePresetId, gridSizeOverride, brightness, contrast, dithering };
  }, [activePresetId, gridSizeOverride, brightness, contrast, dithering]);

  const run = useCallback(() => {
    if (!sourceImageRef.current) return;
    const preset = presets[activePresetId];
    const gridSize = gridSizeOverride ?? preset.defaultGrid;
    const cacheKey = `${activePresetId}-${gridSize}-${brightness}-${contrast}-${dithering}`;

    if (cacheRef.current[cacheKey]) {
      setResult(cacheRef.current[cacheKey]);
      return;
    }

    setIsProcessing(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const imageSnapshot = sourceImageRef.current;
    rafRef.current = requestAnimationFrame(() => {
      const out = pixelate(imageSnapshot, preset, gridSize, brightness, contrast, dithering);
      cacheRef.current[cacheKey] = out;
      setResult(out);
      setIsProcessing(false);
    });
  }, [activePresetId, gridSizeOverride, brightness, contrast, dithering]);

  useEffect(() => {
    sourceImageRef.current = sourceImage;
    cacheRef.current = {};
    setResult(null);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (sourceImage) {
      const { activePresetId: pid, gridSizeOverride: gso, brightness: br, contrast: co, dithering: di } = settingsRef.current;
      const preset = presets[pid];
      const gridSize = gso ?? preset.defaultGrid;
      setIsProcessing(true);
      rafRef.current = requestAnimationFrame(() => {
        const out = pixelate(sourceImage, preset, gridSize, br, co, di);
        const cacheKey = `${pid}-${gridSize}-${br}-${co}-${di}`;
        cacheRef.current[cacheKey] = out;
        setResult(out);
        setIsProcessing(false);
      });
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [sourceImage]);

  useEffect(() => {
    if (!sourceImageRef.current) return;
    run();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [run]);

  return { result, isProcessing };
}
