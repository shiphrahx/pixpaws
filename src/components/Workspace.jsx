import { useState, useCallback, useRef, useEffect } from 'react';
import PresetBar from './PresetBar';
import ImageDisplay from './ImageDisplay';
import ActionBar from './ActionBar';
import { usePixelEngine } from '../hooks/usePixelEngine';
import { presets } from '../presets';

function useDebounced(initial, delay) {
  const [raw, setRaw] = useState(initial);
  const [debounced, setDebounced] = useState(initial);
  const timer = useRef(null);

  const set = useCallback((v) => {
    setRaw(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(v), delay);
  }, [delay]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return [raw, debounced, set];
}

export default function Workspace({ sourceImage, sourceUrl, onReset }) {
  const [activePresetId, setActivePresetId] = useState('gameboy');
  const [gridSizeOverride, setGridSizeOverride] = useState(null);
  const [rawBrightness, debouncedBrightness, setBrightness] = useDebounced(0, 150);
  const [rawContrast, debouncedContrast, setContrast] = useDebounced(0, 150);

  const preset = presets[activePresetId];

  const handlePresetChange = useCallback((id) => {
    setActivePresetId(id);
    setGridSizeOverride(null);
  }, []);

  const { result, isProcessing } = usePixelEngine(
    sourceImage,
    activePresetId,
    gridSizeOverride,
    debouncedBrightness,
    debouncedContrast
  );

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-8">
      <PresetBar activeId={activePresetId} onChange={handlePresetChange} />

      <div className="mt-2 relative">
        {isProcessing && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10 rounded-xl"
            style={{ background: 'rgba(245,240,235,0.6)', backdropFilter: 'blur(2px)' }}
          >
            <span className="font-pixel animate-pulse" style={{ color: 'var(--brand-coral)', fontSize: '9px' }}>
              Pixelating...
            </span>
          </div>
        )}
        <ImageDisplay
          sourceImage={sourceImage}
          sourceUrl={sourceUrl}
          engineResult={result}
          activePresetId={activePresetId}
          isProcessing={isProcessing}
        />
      </div>

      <ActionBar
        onReset={onReset}
        gridSize={gridSizeOverride}
        defaultGrid={preset.defaultGrid}
        brightness={rawBrightness}
        contrast={rawContrast}
        onGridSize={setGridSizeOverride}
        onBrightness={setBrightness}
        onContrast={setContrast}
        engineResult={result}
        activePresetId={activePresetId}
      />
    </div>
  );
}
