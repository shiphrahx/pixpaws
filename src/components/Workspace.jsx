import { useState, useCallback } from 'react';
import PresetBar from './PresetBar';
import ImageDisplay from './ImageDisplay';
import ActionBar from './ActionBar';
import { usePixelEngine } from '../hooks/usePixelEngine';
import { useImageUpload } from '../hooks/useImageUpload';
import { useDebounced } from '../hooks/useDebounced';
import { presets } from '../presets';

export default function Workspace({ sourceImage, sourceUrl, onReset, onImageLoad }) {
  const [activePresetId, setActivePresetId] = useState('gameboy');
  const [gridSizeOverride, setGridSizeOverride] = useState(null);
  const [rawBrightness, debouncedBrightness, setBrightness] = useDebounced(0, 150);
  const [rawContrast, debouncedContrast, setContrast] = useDebounced(0, 150);
  const [dithering, setDithering] = useState('floyd-steinberg');

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
    debouncedContrast,
    dithering
  );

  const { isDragging, onDragEnter, onDragOver, onDragLeave, onDrop, onInputChange, openPicker, inputRef } =
    useImageUpload(onImageLoad);

  return (
    <div className="w-full max-w-4xl mx-auto" style={{ background: 'var(--bg-secondary, #F0EBE3)', borderRadius: 16, padding: '2rem' }}>
      {/* Header inside card */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <span style={{ fontSize: 40, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '-1px' }}>
            pix<span style={{ color: '#D85A30' }}>paws</span>
          </span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Your pet, but in pixels</p>
      </div>

      {/* Main card */}
      <div style={{ background: 'var(--surface)', borderRadius: 12, border: '0.5px solid var(--border)' }}>
        <PresetBar activeId={activePresetId} onChange={handlePresetChange} />

        <div className="relative">
          {isProcessing && (
            <div
              className="absolute inset-0 flex items-center justify-center z-10"
              style={{ background: 'rgba(245,240,235,0.6)', backdropFilter: 'blur(2px)' }}
            >
              <span className="font-pixel animate-pulse" style={{ color: 'var(--brand-coral)', fontSize: '9px' }}>
                Pixelating...
              </span>
            </div>
          )}
          <ImageDisplay
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
          dithering={dithering}
          onDithering={setDithering}
          engineResult={result}
          activePresetId={activePresetId}
        />
      </div>

      {/* Secondary upload hint */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a different pet photo"
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={openPicker}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker(); } }}
        className="mt-6 cursor-pointer text-center transition-all duration-200 outline-none focus-visible:ring-2"
        style={{
          borderRadius: 12,
          border: `2px dashed ${isDragging ? '#D85A30' : 'var(--border)'}`,
          padding: '2rem',
          background: isDragging ? 'rgba(216,90,48,0.05)' : 'var(--surface)',
          '--tw-ring-color': 'var(--brand-coral)',
        }}
      >
        <div style={{ fontSize: 28, color: 'var(--text-tertiary, #9B9BAA)', marginBottom: 8 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Drag and drop your pet photo here</p>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary, #9B9BAA)', margin: 0 }}>or click to browse · JPG, PNG up to 10MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onInputChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
