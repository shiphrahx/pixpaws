import { useEffect, useRef } from 'react';

export default function AdjustPanel({ gridSize, defaultGrid, brightness, contrast, onGridSize, onBrightness, onContrast, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);

    // Delay outside-click listener by one frame so the opening click doesn't immediately close the panel
    let handler;
    const timer = setTimeout(() => {
      handler = (e) => {
        if (e.target.closest('[data-adjust-toggle]')) return;
        if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
      };
      document.addEventListener('mousedown', handler);
    }, 0);

    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(timer);
      if (handler) document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Adjust settings"
      className="absolute top-full mt-2 left-0 rounded-2xl shadow-xl p-5 z-20 w-72"
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
