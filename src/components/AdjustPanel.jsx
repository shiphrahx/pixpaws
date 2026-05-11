import { useEffect, useRef } from 'react';

export default function AdjustPanel({ gridSize, defaultGrid, brightness, contrast, onGridSize, onBrightness, onContrast, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    function onOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Adjust settings"
      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-2xl shadow-xl p-5 z-20 w-72"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <h3 className="font-pixel mb-4 text-center" style={{ fontSize: '9px', color: 'var(--text-primary)' }}>
        Adjust
      </h3>
      <Slider
        label="Grid size"
        value={gridSize ?? defaultGrid}
        min={16}
        max={256}
        step={4}
        display={`${gridSize ?? defaultGrid}×${gridSize ?? defaultGrid}`}
        onChange={onGridSize}
      />
      <Slider
        label="Brightness"
        value={brightness}
        min={-50}
        max={50}
        step={1}
        display={brightness > 0 ? `+${brightness}` : String(brightness)}
        onChange={onBrightness}
      />
      <Slider
        label="Contrast"
        value={contrast}
        min={-50}
        max={50}
        step={1}
        display={contrast > 0 ? `+${contrast}` : String(contrast)}
        onChange={onContrast}
      />
    </div>
  );
}

function Slider({ label, value, min, max, step, display, onChange }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{label}</label>
        <span className="text-xs font-pixel" style={{ fontSize: '8px', color: 'var(--brand-coral)' }}>{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: 'var(--brand-coral)' }}
      />
    </div>
  );
}
