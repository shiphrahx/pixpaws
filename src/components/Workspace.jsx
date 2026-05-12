import { useState, useCallback, useRef, useEffect } from 'react';
import PresetBar from './PresetBar';
import ImageDisplay from './ImageDisplay';
import ActionBar from './ActionBar';
import CropOverlay from './CropOverlay';
import PaletteBuilder from './PaletteBuilder';
import ShareModal from './ShareModal';
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
  const [activeFrame, setActiveFrame] = useState('none');
  const [customPalette, setCustomPalette] = useState(
    ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']
  );
  const [shareOpen, setShareOpen] = useState(false);

  // Crop state
  const [isCropping, setIsCropping] = useState(false);
  const [cropRegion, setCropRegion] = useState(null); // { x, y, width, height } in source image coords
  const [pendingCrop, setPendingCrop] = useState(null); // crop rect being edited in crop mode
  const [workingImage, setWorkingImage] = useState(sourceImage); // cropped or full
  const [workingUrl, setWorkingUrl] = useState(sourceUrl);
  const cropImageRef = useRef(null); // offscreen canvas for cropped source

  // When sourceImage changes (new upload), reset crop
  useEffect(() => {
    setWorkingImage(sourceImage);
    setWorkingUrl(sourceUrl);
    setCropRegion(null);
    cropImageRef.current = null;
  }, [sourceImage, sourceUrl]);

  const preset = presets[activePresetId];

  const handlePresetChange = useCallback((id) => {
    setActivePresetId(id);
    setGridSizeOverride(null);
  }, []);

  const paletteOverride = activePresetId === 'custom' ? customPalette : null;
  const { result, isProcessing } = usePixelEngine(
    workingImage,
    activePresetId,
    gridSizeOverride,
    debouncedBrightness,
    debouncedContrast,
    dithering,
    paletteOverride
  );

  const { isDragging, onDragEnter, onDragOver, onDragLeave, onDrop, onInputChange, openPicker, inputRef } =
    useImageUpload(onImageLoad);

  // Enter crop mode: initialise pendingCrop at 80% centred
  const handleCropOpen = useCallback(() => {
    const w = sourceImage.naturalWidth || sourceImage.width;
    const h = sourceImage.naturalHeight || sourceImage.height;
    const cw = Math.round(w * 0.8);
    const ch = Math.round(h * 0.8);
    setPendingCrop({ x: Math.round((w - cw) / 2), y: Math.round((h - ch) / 2), width: cw, height: ch });
    setIsCropping(true);
  }, [sourceImage]);

  const handleCropCancel = useCallback(() => {
    setIsCropping(false);
    setPendingCrop(null);
  }, []);

  const handleCropApply = useCallback(() => {
    if (!pendingCrop) return;
    const { x, y, width, height } = pendingCrop;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceImage, x, y, width, height, 0, 0, width, height);

    // Build a new Image from the cropped canvas so usePixelEngine can use it
    const url = canvas.toDataURL();
    const img = new Image();
    img.onload = () => {
      cropImageRef.current = canvas;
      setWorkingImage(img);
      setWorkingUrl(url);
      setCropRegion(pendingCrop);
      setIsCropping(false);
      setPendingCrop(null);
    };
    img.src = url;
  }, [pendingCrop, sourceImage]);

  const handleCropReset = useCallback(() => {
    setWorkingImage(sourceImage);
    setWorkingUrl(sourceUrl);
    setCropRegion(null);
    cropImageRef.current = null;
  }, [sourceImage, sourceUrl]);

  if (isCropping) {
    return <CropView
      sourceImage={sourceImage}
      sourceUrl={sourceUrl}
      pendingCrop={pendingCrop}
      onCropChange={setPendingCrop}
      onApply={handleCropApply}
      onCancel={handleCropCancel}
    />;
  }

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

        {activePresetId === 'custom' && (
          <PaletteBuilder
            palette={customPalette}
            onChange={setCustomPalette}
            sourceImage={workingImage}
          />
        )}

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
            sourceUrl={workingUrl}
            engineResult={result}
            activePresetId={activePresetId}
            activeFrame={activeFrame}
            isProcessing={isProcessing}
          />
        </div>

        <ActionBar
          onReset={onReset}
          onCrop={handleCropOpen}
          cropActive={!!cropRegion}
          onCropReset={handleCropReset}
          onShare={() => setShareOpen(true)}
          gridSize={gridSizeOverride}
          defaultGrid={preset.defaultGrid}
          brightness={rawBrightness}
          contrast={rawContrast}
          onGridSize={setGridSizeOverride}
          onBrightness={setBrightness}
          onContrast={setContrast}
          dithering={dithering}
          onDithering={setDithering}
          activeFrame={activeFrame}
          onFrame={setActiveFrame}
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

      {shareOpen && (
        <ShareModal
          sourceImage={workingImage}
          engineResult={result}
          activePresetId={activePresetId}
          activeFrame={activeFrame}
          customPalette={customPalette}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}

function CropView({ sourceImage, sourceUrl, pendingCrop, onCropChange, onApply, onCancel }) {
  const containerRef = useRef(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  const natW = sourceImage.naturalWidth || sourceImage.width;
  const natH = sourceImage.naturalHeight || sourceImage.height;

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      const cw = entry.contentRect.width;
      const aspect = natW / natH;
      const ch = cw / aspect;
      setDisplaySize({ width: Math.round(cw), height: Math.round(ch) });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [natW, natH]);

  return (
    <div className="w-full max-w-4xl mx-auto" style={{ background: 'var(--bg-secondary, #F0EBE3)', borderRadius: 16, padding: '2rem' }}>
      <div className="text-center mb-6">
        <span style={{ fontSize: 40, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '-1px' }}>
          pix<span style={{ color: '#D85A30' }}>paws</span>
        </span>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0 0' }}>Crop your photo</p>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 12, border: '0.5px solid var(--border)', padding: '1.5rem' }}>
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
          <img
            src={sourceUrl}
            alt="Source"
            style={{ width: '100%', display: 'block', userSelect: 'none', draggable: false }}
            draggable={false}
          />
          {displaySize.width > 0 && pendingCrop && (
            <CropOverlay
              imageNaturalWidth={natW}
              imageNaturalHeight={natH}
              displayWidth={displaySize.width}
              displayHeight={displaySize.height}
              cropRect={pendingCrop}
              onChange={onCropChange}
            />
          )}
        </div>

        <div className="flex gap-3 mt-4 justify-center">
          <button
            onClick={onApply}
            style={{
              padding: '8px 20px', borderRadius: 8, background: '#D85A30', color: '#fff',
              fontWeight: 500, fontSize: 14, border: 'none', cursor: 'pointer',
            }}
          >
            Apply crop
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 20px', borderRadius: 8, background: 'var(--bg-secondary, #F0EBE3)',
              color: 'var(--text-secondary)', fontSize: 14, border: '0.5px solid var(--border)', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
