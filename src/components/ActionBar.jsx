import { useState, useCallback } from 'react';
import AdjustPanel from './AdjustPanel';
import { exportPng, makeFilename } from '../engine/export';
import { presets } from '../presets';

export default function ActionBar({ onReset, gridSize, defaultGrid, brightness, contrast, onGridSize, onBrightness, onContrast, engineResult, activePresetId }) {
  const [showAdjust, setShowAdjust] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const doExport = useCallback(() => {
    if (!engineResult) return;
    setDownloading(true);
    const preset = presets[activePresetId];
    const { pixelCanvas, gridW, gridH } = engineResult;
    exportPng(pixelCanvas, gridW, gridH, preset, 4, makeFilename(activePresetId));
    setTimeout(() => setDownloading(false), 800);
  }, [engineResult, activePresetId]);

  return (
    <div
      className="flex items-center justify-between px-4 py-3 relative"
      style={{ borderTop: '0.5px solid var(--border)' }}
    >
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

      <div className="flex gap-2">
        <OutlineButton onClick={onReset}>
          <UploadIcon /> Upload new photo
        </OutlineButton>
        <OutlineButton
          onClick={() => setShowAdjust((v) => !v)}
          active={showAdjust}
        >
          <AdjustIcon /> Adjust grid
        </OutlineButton>
      </div>

      <div>
        <button
          onClick={doExport}
          disabled={!engineResult}
          className="flex items-center gap-1.5 outline-none focus-visible:ring-2 disabled:opacity-40 transition-all duration-150"
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            background: downloading ? 'var(--success, #2D8B4E)' : '#D85A30',
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            border: 'none',
            cursor: engineResult ? 'pointer' : 'default',
            animation: downloading ? 'bounceScale 0.35s ease-in-out' : 'none',
            '--tw-ring-color': 'var(--brand-coral)',
          }}
        >
          <DownloadIcon />
          {downloading ? '✓ Saved!' : 'Download PNG'}
        </button>
      </div>
    </div>
  );
}

function OutlineButton({ onClick, children, active }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm outline-none focus-visible:ring-2 transition-all duration-150"
      style={{
        padding: '6px 12px',
        borderRadius: 8,
        border: `0.5px solid ${active ? 'var(--brand-coral)' : 'var(--border)'}`,
        color: active ? 'var(--brand-coral)' : 'var(--text-secondary)',
        background: 'var(--surface)',
        fontSize: 13,
        cursor: 'pointer',
        '--tw-ring-color': 'var(--brand-coral)',
      }}
    >
      {children}
    </button>
  );
}

function UploadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function AdjustIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
