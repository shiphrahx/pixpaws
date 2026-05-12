import { useEffect, useRef, useState, useCallback } from 'react';
import { presets } from '../presets';
import { renderToCanvas } from '../engine/pixelate';
import { applyFrame } from '../engine/frames';

export default function ShareModal({ engineResult, activePresetId, activeFrame, customPalette, onClose }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageCanvas, setImageCanvas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const backdropRef = useRef(null);

  const preset = presets[activePresetId];
  const effectivePalette = activePresetId === 'custom' && customPalette ? customPalette : preset.palette;
  const effectivePreset = activePresetId === 'custom' ? { ...preset, palette: effectivePalette } : preset;

  useEffect(() => {
    if (!engineResult) return;
    setLoading(true);

    const { pixelCanvas, gridW, gridH } = engineResult;
    const dispCanvas = document.createElement('canvas');
    const fw = effectivePreset.frame?.width ?? 0;
    dispCanvas.width = 512 + fw * 2;
    dispCanvas.height = Math.round(512 * (gridH / gridW)) + fw * 2;
    renderToCanvas(pixelCanvas, gridW, gridH, dispCanvas, effectivePreset);
    const framed = applyFrame(dispCanvas, activeFrame);

    setImageCanvas(framed);
    setImageUrl(framed.toDataURL('image/png'));
    setLoading(false);
  }, [engineResult, effectivePreset, activeFrame]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const download = useCallback(() => {
    if (!imageCanvas) return;
    const a = document.createElement('a');
    a.href = imageCanvas.toDataURL('image/png');
    a.download = `pixpaws-${activePresetId}.png`;
    a.click();
  }, [imageCanvas, activePresetId]);

  const copyToClipboard = useCallback(async () => {
    if (!imageCanvas) return;
    try {
      const blob = await new Promise(res => imageCanvas.toBlob(res, 'image/png'));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      download();
    }
  }, [imageCanvas, download]);

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share pixel art"
        style={{
          background: 'var(--surface)',
          borderRadius: 16,
          padding: '1.5rem',
          width: '100%',
          maxWidth: 480,
          position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
            color: 'var(--text-secondary)', lineHeight: 1,
          }}
          aria-label="Close"
        >×</button>

        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
          Share your pixel art
        </h2>

        <div style={{ borderRadius: 8, overflow: 'hidden', background: 'var(--bg-secondary, #F0EBE3)', marginBottom: 16, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loading ? (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Generating…</span>
          ) : (
            <img src={imageUrl} alt="Pixel art" style={{ maxWidth: '100%', display: 'block', imageRendering: 'pixelated' }} />
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={download}
            disabled={loading}
            style={{
              flex: 1, padding: '8px 16px', borderRadius: 8, background: '#D85A30',
              color: '#fff', fontSize: 13, fontWeight: 500, border: 'none',
              cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.5 : 1,
            }}
          >
            Download
          </button>
          <button
            onClick={copyToClipboard}
            disabled={loading}
            style={{
              flex: 1, padding: '8px 16px', borderRadius: 8,
              background: 'var(--bg-secondary, #F0EBE3)',
              color: 'var(--text-secondary)', fontSize: 13, border: '0.5px solid var(--border)',
              cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.5 : 1,
            }}
          >
            {copied ? '✓ Copied!' : 'Copy to clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
