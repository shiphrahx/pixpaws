import { useState, useRef, useCallback } from 'react';
import AdjustPanel from './AdjustPanel';
import { exportPng, makeFilename } from '../engine/export';
import { presets } from '../presets';

export default function ActionBar({ onReset, gridSize, defaultGrid, brightness, contrast, onGridSize, onBrightness, onContrast, engineResult, activePresetId }) {
  const [showAdjust, setShowAdjust] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloading4x, setDownloading4x] = useState(false);

  const doExport = useCallback((scale, setFlag) => {
    if (!engineResult) return;
    setFlag(true);
    const preset = presets[activePresetId];
    const { pixelCanvas, gridW, gridH } = engineResult;
    exportPng(pixelCanvas, gridW, gridH, preset, scale, makeFilename(activePresetId));
    setTimeout(() => setFlag(false), 800);
  }, [engineResult, activePresetId]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-4 relative">
      {showAdjust && (
        <AdjustPanel
          gridSize={gridSize}
          defaultGrid={defaultGrid}
          brightness={brightness}
          contrast={contrast}
          onGridSize={onGridSize}
          onBrightness={onBrightness}
          onContrast={onContrast}
          onClose={() => setShowAdjust(false)}
        />
      )}

      <button
        onClick={onReset}
        className="px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2"
        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--surface)', '--tw-ring-color': 'var(--brand-coral)' }}
      >
        Upload new photo
      </button>

      <button
        onClick={() => setShowAdjust((v) => !v)}
        className="px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2"
        style={{ borderColor: showAdjust ? 'var(--brand-coral)' : 'var(--border)', color: showAdjust ? 'var(--brand-coral)' : 'var(--text-secondary)', background: 'var(--surface)', '--tw-ring-color': 'var(--brand-coral)' }}
        aria-expanded={showAdjust}
      >
        Adjust
      </button>

      <DownloadButton
        label="Download PNG"
        active={downloading}
        onClick={() => doExport(1, setDownloading)}
        disabled={!engineResult}
      />

      <DownloadButton
        label="Download 4×"
        active={downloading4x}
        onClick={() => doExport(4, setDownloading4x)}
        disabled={!engineResult}
        secondary
      />
    </div>
  );
}

function DownloadButton({ label, active, onClick, disabled, secondary }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 disabled:opacity-40"
      style={{
        background: secondary ? 'transparent' : (active ? 'var(--success)' : 'var(--brand-coral)'),
        color: secondary ? 'var(--brand-coral)' : '#fff',
        border: secondary ? '2px solid var(--brand-coral)' : 'none',
        '--tw-ring-color': 'var(--brand-coral)',
        animation: active ? 'bounceScale 0.35s ease-in-out' : 'none',
      }}
    >
      {active ? '✓ Saved!' : label}
    </button>
  );
}
