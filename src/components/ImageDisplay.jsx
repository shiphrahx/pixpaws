import { useEffect, useRef, useState, useCallback } from 'react';
import { renderToCanvas } from '../engine/pixelate';
import { presets } from '../presets';

const DISPLAY_SIZE = 320;

export default function ImageDisplay({ sourceUrl, engineResult, activePresetId, isProcessing }) {
  const [pixelDataUrl, setPixelDataUrl] = useState(null);
  const [viewMode, setViewMode] = useState('sideBySide');
  const [scrambling, setScrambling] = useState(false);
  const prevPresetRef = useRef(activePresetId);

  useEffect(() => {
    if (!engineResult) return;
    const { pixelCanvas, gridW, gridH } = engineResult;
    const preset = presets[activePresetId];

    if (prevPresetRef.current !== activePresetId) {
      setScrambling(true);
      prevPresetRef.current = activePresetId;
      setTimeout(() => setScrambling(false), 400);
    }

    const canvas = document.createElement('canvas');
    const fw = preset.frame?.width ?? 0;
    canvas.width = DISPLAY_SIZE + fw * 2;
    canvas.height = Math.round(DISPLAY_SIZE * (gridH / gridW)) + fw * 2;
    renderToCanvas(pixelCanvas, gridW, gridH, canvas, preset);
    setPixelDataUrl(canvas.toDataURL());
  }, [engineResult, activePresetId]);

  const preset = presets[activePresetId];
  const dominantBg = preset.bgFill ? `${preset.bgFill}22` : 'rgba(26,26,46,0.04)';
  const animClass = [scrambling && 'animate-scramble', isProcessing && 'animate-pixel-crunch'].filter(Boolean).join(' ');
  const gridCount = engineResult ? `${engineResult.gridW}×${engineResult.gridH}` : null;

  return (
    <div>
      <div className="flex justify-end px-4 pt-3 pb-1">
        <ViewToggle viewMode={viewMode} onChange={setViewMode} />
      </div>

      {viewMode === 'sideBySide' ? (
        <SideBySide
          sourceUrl={sourceUrl}
          pixelDataUrl={pixelDataUrl}
          dominantBg={dominantBg}
          animClass={animClass}
          activePresetId={activePresetId}
          presetName={preset.name}
          paletteSize={preset.palette.length}
          gridCount={gridCount}
        />
      ) : (
        <SliderView
          sourceUrl={sourceUrl}
          pixelDataUrl={pixelDataUrl}
          animClass={animClass}
          activePresetId={activePresetId}
        />
      )}
    </div>
  );
}

function SideBySide({ sourceUrl, pixelDataUrl, dominantBg, animClass, activePresetId, presetName, paletteSize, gridCount }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left: Original — baseline alignment */}
      <div
        className="flex flex-col items-center"
        style={{ padding: '20px 16px 16px', borderRight: '0.5px solid var(--border)' }}
      >
        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-tertiary, #9B9BAA)', marginBottom: 12 }}>
          Original
        </span>
        <div
          style={{ width: '100%', aspectRatio: '4/3', borderRadius: 8, background: 'var(--bg-secondary, #F0EBE3)', overflow: 'hidden' }}
        >
          <img
            src={sourceUrl}
            alt="Original pet photo"
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        </div>
      </div>

      {/* Right: Pixelified */}
      <div
        className="flex flex-col items-center"
        style={{ padding: '20px 16px 16px' }}
      >
        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-tertiary, #9B9BAA)', marginBottom: 12 }}>
          Pixelified
        </span>
        <div
          style={{ width: '100%', aspectRatio: '4/3', borderRadius: 8, background: dominantBg, overflow: 'hidden' }}
        >
          {pixelDataUrl && (
            <img
              src={pixelDataUrl}
              alt={`Pixel art version of your pet in ${activePresetId} style`}
              className={animClass}
              style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated', display: 'block' }}
            />
          )}
        </div>
        {gridCount && (
          <span style={{ fontSize: 12, color: 'var(--text-tertiary, #9B9BAA)', marginTop: 8 }}>
            {presetName} · {paletteSize} colours, {gridCount}
          </span>
        )}
      </div>
    </div>
  );
}

function SliderView({ sourceUrl, pixelDataUrl, animClass, activePresetId }) {
  const [sliderX, setSliderX] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const updateSlider = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSliderX(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  const onMouseDown = useCallback((e) => { dragging.current = true; updateSlider(e.clientX); }, [updateSlider]);
  const onMouseMove = useCallback((e) => { if (dragging.current) updateSlider(e.clientX); }, [updateSlider]);
  const onMouseUp = useCallback(() => { dragging.current = false; }, []);
  const onTouchStart = useCallback((e) => { dragging.current = true; updateSlider(e.touches[0].clientX); }, [updateSlider]);
  const onTouchMove = useCallback((e) => { if (dragging.current) updateSlider(e.touches[0].clientX); }, [updateSlider]);
  const onTouchEnd = useCallback(() => { dragging.current = false; }, []);

  return (
    <div className="flex flex-col items-center gap-2 p-6">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl select-none cursor-col-resize"
        style={{ width: DISPLAY_SIZE, maxWidth: '100%', aspectRatio: '1/1' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {pixelDataUrl && (
          <img
            src={pixelDataUrl}
            alt={`Pixel art version of your pet in ${activePresetId} style`}
            className={`absolute inset-0 w-full h-full object-contain image-pixelated ${animClass}`}
            draggable={false}
          />
        )}

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderX}% 0 0)` }}
        >
          <img
            src={sourceUrl}
            alt="Original pet photo"
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />
        </div>

        <div
          className="absolute top-0 bottom-0 w-1 -translate-x-1/2 pointer-events-none"
          style={{ left: `${sliderX}%`, background: '#fff', boxShadow: '0 0 4px rgba(0,0,0,0.4)' }}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 7H10M4 7L2 5M4 7L2 9M10 7L12 5M10 7L12 9" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Drag to compare</p>
    </div>
  );
}

function ViewToggle({ viewMode, onChange }) {
  return (
    <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
      {['sideBySide', 'slider'].map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className="px-3 py-1.5 text-xs font-medium transition-all duration-150 outline-none focus-visible:ring-2"
          style={{
            background: viewMode === mode ? 'var(--brand-coral)' : 'var(--surface)',
            color: viewMode === mode ? '#fff' : 'var(--text-secondary)',
            '--tw-ring-color': 'var(--brand-coral)',
          }}
        >
          {mode === 'sideBySide' ? 'Side by side' : 'Slider'}
        </button>
      ))}
    </div>
  );
}
