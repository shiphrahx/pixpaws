import { presetList } from '../presets';

export default function PresetBar({ activeId, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Style preset"
      className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
    >
      {presetList.map((preset) => (
        <PresetButton
          key={preset.id}
          preset={preset}
          active={activeId === preset.id}
          onClick={() => onChange(preset.id)}
        />
      ))}
    </div>
  );
}

function PresetButton({ preset, active, onClick }) {
  return (
    <button
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-150 shrink-0 outline-none focus-visible:ring-2"
      style={{
        background: active ? 'var(--brand-coral)' : 'var(--surface)',
        borderColor: active ? 'var(--brand-coral)' : 'var(--border)',
        color: active ? '#fff' : 'var(--text-secondary)',
        minWidth: '80px',
        '--tw-ring-color': 'var(--brand-coral)',
      }}
    >
      <span className="font-pixel whitespace-nowrap" style={{ fontSize: '7px' }}>
        {preset.name}
      </span>
      <SwatchStrip palette={preset.palette} />
    </button>
  );
}

function SwatchStrip({ palette }) {
  const shown = palette.slice(0, 8);
  const w = 56;
  const h = 6;
  const sw = w / shown.length;
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {shown.map((color, i) => (
        <rect key={i} x={i * sw} y={0} width={sw} height={h} fill={color} />
      ))}
    </svg>
  );
}
