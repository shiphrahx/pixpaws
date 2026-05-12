import { presetList } from '../presets';

export default function PresetBar({ activeId, onChange }) {
  return (
    <div style={{ position: 'relative', borderBottom: '0.5px solid var(--border)' }}>
      {/* Fade left */}
      <div
        aria-hidden
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 32, zIndex: 1,
          background: 'linear-gradient(to right, var(--surface), transparent)',
          pointerEvents: 'none',
        }}
      />
      {/* Fade right */}
      <div
        aria-hidden
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 32, zIndex: 1,
          background: 'linear-gradient(to left, var(--surface), transparent)',
          pointerEvents: 'none',
        }}
      />
      <div
        role="radiogroup"
        aria-label="Style preset"
        className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
      >
        <span style={{ fontSize: 12, color: 'var(--text-tertiary, #9B9BAA)', marginRight: 4, flexShrink: 0 }}>Style</span>
        {presetList.map((preset) => (
          <PresetButton
            key={preset.id}
            preset={preset}
            active={activeId === preset.id}
            onClick={() => onChange(preset.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PresetButton({ preset, active, onClick }) {
  return (
    <button
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className="shrink-0 outline-none focus-visible:ring-2 transition-all duration-150"
      style={{
        padding: '6px 14px',
        borderRadius: 8,
        background: active ? '#D85A30' : 'var(--bg-secondary, #F0EBE3)',
        color: active ? '#fff' : 'var(--text-secondary)',
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        border: 'none',
        cursor: 'pointer',
        '--tw-ring-color': 'var(--brand-coral)',
      }}
    >
      {preset.name}
    </button>
  );
}
