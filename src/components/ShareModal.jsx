import { useEffect, useRef, useState, useCallback } from 'react';
import { generateShareCard } from '../engine/shareCard';
import { presets } from '../presets';
import { renderToCanvas } from '../engine/pixelate';
import { applyFrame } from '../engine/frames';

const FORMATS = [
  { value: 'landscape', label: 'Landscape (Twitter)' },
  { value: 'square',    label: 'Square (Instagram)' },
];

export default function ShareModal({ sourceImage, engineResult, activePresetId, activeFrame, customPalette, onClose }) {
  const [format, setFormat] = useState('landscape');
  const [cardUrl, setCardUrl] = useState(null);
  const [cardCanvas, setCardCanvas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const backdropRef = useRef(null);

  const preset = presets[activePresetId];
  const effectivePalette = activePresetId === 'custom' && customPalette ? customPalette : preset.palette;
  const effectivePreset = activePresetId === 'custom' ? { ...preset, palette: effectivePalette } : preset;

  const buildCard = useCallback(async () => {
    if (!sourceImage || !engineResult) return;
    setLoading(true);

    // Draw original image to a canvas
    const origCanvas = document.createElement('canvas');
    origCanvas.width = sourceImage.naturalWidth || sourceImage.width;
    origCanvas.height = sourceImage.naturalHeight || sourceImage.height;
    const origCtx = origCanvas.getContext('2d');
    origCtx.drawImage(sourceImage, 0, 0);

    // Build framed pixel canvas
    const { pixelCanvas, gridW, gridH } = engineResult;
    const dispCanvas = document.createElement('canvas');
    const fw = effectivePreset.frame?.width ?? 0;
    dispCanvas.width = 512 + fw * 2;
    dispCanvas.height = Math.round(512 * (gridH / gridW)) + fw * 2;
    renderToCanvas(pixelCanvas, gridW, gridH, dispCanvas, effectivePreset);
    const framedDisp = applyFrame(dispCanvas, activeFrame);

    const card = await generateShareCard(origCanvas, framedDisp, effectivePreset, gridW, format);
    setCardCanvas(card);
    setCardUrl(card.toDataURL('image/png'));
    setLoading(false);
  }, [sourceImage, engineResult, effectivePreset, format]);

  useEffect(() => { buildCard(); }, [buildCard]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const download = useCallback(() => {
    if (!cardCanvas) return;
    const a = document.createElement('a');
    a.href = cardCanvas.toDataURL('image/png');
    a.download = `pixpaws-share-${activePresetId}-${format}.png`;
    a.click();
  }, [cardCanvas, activePresetId, format]);

  const copyToClipboard = useCallback(async () => {
    if (!cardCanvas) return;
    try {
      const blob = await new Promise(res => cardCanvas.toBlob(res, 'image/png'));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      // Fallback: just download
      download();
    }
  }, [cardCanvas, download]);

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
        aria-label="Share card"
        style={{
          background: 'var(--surface)',
          borderRadius: 16,
          padding: '1.5rem',
          width: '100%',
          maxWidth: 640,
          position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
            color: 'var(--text-secondary)', lineHeight: 1,
          }}
          aria-label="Close"
        >×</button>

        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
          Share your pixel art
        </h2>

        {/* Format toggle */}
        <div className="flex rounded-lg overflow-hidden mb-4" style={{ border: '0.5px solid var(--border)', display: 'inline-flex' }}>
          {FORMATS.map(f => (
            <button
              key={f.value}
              onClick={() => setFormat(f.value)}
              style={{
                padding: '6px 14px', fontSize: 12, border: 'none', cursor: 'pointer',
                background: format === f.value ? '#D85A30' : 'var(--bg-secondary, #F0EBE3)',
                color: format === f.value ? '#fff' : 'var(--text-secondary)',
                fontWeight: format === f.value ? 500 : 400,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Card preview */}
        <div style={{ borderRadius: 8, overflow: 'hidden', background: 'var(--bg-secondary, #F0EBE3)', marginBottom: 16, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loading ? (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Generating card…</span>
          ) : (
            <img src={cardUrl} alt="Share card preview" style={{ width: '100%', display: 'block', borderRadius: 8 }} />
          )}
        </div>

        {/* Actions */}
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
            Download card
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
