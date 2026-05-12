import { useRef, useState } from 'react';
import { extractPalette } from '../engine/extractPalette';
import { presetList } from '../presets';

const MAX_COLOURS = 32;
const MIN_COLOURS = 2;
const EXTRACT_COUNTS = [4, 8, 16, 32];

function randomHex() {
  const h = Math.random() * 360;
  return hslToHex(h, 60 + Math.random() * 20, 45 + Math.random() * 20);
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function goldenRatioPalette(count) {
  const startHue = Math.random() * 360;
  return Array.from({ length: count }, (_, i) => {
    const h = (startHue + i * 137.508) % 360;
    const s = 50 + (i % 3) * 10;
    const l = 40 + (i % 2) * 15;
    return hslToHex(h, s, l);
  });
}

export default function PaletteBuilder({ palette, onChange, sourceImage }) {
  const inputRefs = useRef({});
  const [extractCount, setExtractCount] = useState(8);
  const [showExtractPop, setShowExtractPop] = useState(false);
  const [showImportDrop, setShowImportDrop] = useState(false);

  function openPicker(idx) {
    inputRefs.current[idx]?.click();
  }

  function handleColourChange(idx, hex) {
    const next = [...palette];
    next[idx] = hex;
    onChange(next);
  }

  function removeColour(idx) {
    if (palette.length <= MIN_COLOURS) return;
    onChange(palette.filter((_, i) => i !== idx));
  }

  function addColour() {
    if (palette.length >= MAX_COLOURS) return;
    onChange([...palette, randomHex()]);
  }

  function handleExtract() {
    if (!sourceImage) return;
    const extracted = extractPalette(sourceImage, extractCount);
    onChange(extracted);
    setShowExtractPop(false);
  }

  function importPreset(presetId) {
    const found = presetList.find(p => p.id === presetId);
    if (found) onChange([...found.palette]);
    setShowImportDrop(false);
  }

  function randomise() {
    onChange(goldenRatioPalette(palette.length));
  }

  return (
    <div style={{ borderBottom: '0.5px solid var(--border)', padding: '12px 16px', background: 'var(--bg-secondary, #F0EBE3)' }}>
      {/* Colour slots */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        {palette.map((hex, idx) => (
          <div key={idx} style={{ position: 'relative' }}>
            <button
              onClick={() => openPicker(idx)}
              title={hex}
              style={{
                width: 28, height: 28, borderRadius: '50%', background: hex,
                border: '2px solid rgba(0,0,0,0.15)', cursor: 'pointer', display: 'block',
              }}
            />
            <button
              onClick={() => removeColour(idx)}
              title="Remove colour"
              style={{
                position: 'absolute', top: -6, right: -6,
                width: 14, height: 14, borderRadius: '50%',
                background: '#1A1A2E', color: '#fff', border: 'none',
                cursor: 'pointer', fontSize: 9, lineHeight: '14px', textAlign: 'center',
                display: palette.length <= MIN_COLOURS ? 'none' : 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
            <input
              ref={el => { inputRefs.current[idx] = el; }}
              type="color"
              value={hex}
              onChange={e => handleColourChange(idx, e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              tabIndex={-1}
            />
          </div>
        ))}

        {palette.length < MAX_COLOURS && (
          <button
            onClick={addColour}
            style={{
              padding: '4px 10px', borderRadius: 8, fontSize: 12,
              border: '1px dashed var(--border)', background: 'none',
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          >
            + Add colour
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap items-center">
        {/* Extract from image */}
        <div style={{ position: 'relative' }}>
          <SmallButton onClick={() => setShowExtractPop(v => !v)} disabled={!sourceImage}>
            Extract from image
          </SmallButton>
          {showExtractPop && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 12px', zIndex: 30, minWidth: 180,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>Colours to extract</p>
              <div className="flex gap-1 mb-3">
                {EXTRACT_COUNTS.map(n => (
                  <button
                    key={n}
                    onClick={() => setExtractCount(n)}
                    style={{
                      padding: '3px 8px', borderRadius: 6, fontSize: 12, border: 'none',
                      background: extractCount === n ? '#D85A30' : 'var(--bg-secondary, #F0EBE3)',
                      color: extractCount === n ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >{n}</button>
                ))}
              </div>
              <button
                onClick={handleExtract}
                style={{
                  width: '100%', padding: '6px', borderRadius: 6, fontSize: 12,
                  background: '#D85A30', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500,
                }}
              >
                Extract
              </button>
            </div>
          )}
        </div>

        {/* Import from preset */}
        <div style={{ position: 'relative' }}>
          <SmallButton onClick={() => setShowImportDrop(v => !v)}>
            Import from preset
          </SmallButton>
          {showImportDrop && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '6px', zIndex: 30, minWidth: 160,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxHeight: 200, overflowY: 'auto',
            }}>
              {presetList.filter(p => !p.isCustom).map(p => (
                <button
                  key={p.id}
                  onClick={() => importPreset(p.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '6px 10px', borderRadius: 6, fontSize: 12,
                    border: 'none', background: 'none', color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary, #F0EBE3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <SmallButton onClick={randomise}>Randomise</SmallButton>
      </div>
    </div>
  );
}

function SmallButton({ onClick, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '4px 10px', borderRadius: 8, fontSize: 12,
        border: '0.5px solid var(--border)', background: 'var(--surface)',
        color: disabled ? 'var(--text-tertiary)' : 'var(--text-secondary)',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}
