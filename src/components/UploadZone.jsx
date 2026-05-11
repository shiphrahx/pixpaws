import { useCallback } from 'react';
import { useImageUpload } from '../hooks/useImageUpload';

export default function UploadZone({ onImageLoad }) {
  const { isDragging, error, onDragEnter, onDragOver, onDragLeave, onDrop, onInputChange, openPicker, inputRef } =
    useImageUpload(onImageLoad);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  }, [openPicker]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload pet photo drop zone"
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        className="w-full max-w-lg cursor-pointer rounded-2xl p-12 flex flex-col items-center gap-6 transition-all duration-200 outline-none focus-visible:ring-4"
        style={{
          border: `3px dashed ${isDragging ? 'var(--brand-coral)' : 'var(--border)'}`,
          background: isDragging ? 'rgba(216,90,48,0.05)' : 'var(--surface)',
          boxShadow: isDragging ? '0 0 0 4px rgba(216,90,48,0.12)' : 'none',
          '--tw-ring-color': 'var(--brand-coral)',
        }}
      >
        <LargePawIllustration />
        <div className="text-center">
          <p className="font-pixel text-sm mb-2" style={{ color: 'var(--text-primary)', fontSize: '11px' }}>
            Drop your pet photo here
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            or click to browse
          </p>
          <p className="mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            JPG, PNG, WebP · max 10MB
          </p>
        </div>
        {error && (
          <p className="text-sm font-medium" style={{ color: '#dc2626' }}>{error}</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onInputChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}

function LargePawIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="12" height="12" rx="2" fill="#D85A30" opacity="0.3" />
      <rect x="24" y="4" width="12" height="12" rx="2" fill="#D85A30" opacity="0.5" />
      <rect x="44" y="4" width="12" height="12" rx="2" fill="#D85A30" opacity="0.5" />
      <rect x="60" y="8" width="12" height="12" rx="2" fill="#D85A30" opacity="0.3" />
      <rect x="16" y="28" width="48" height="44" rx="12" fill="#D85A30" opacity="0.15" />
      <rect x="16" y="28" width="48" height="44" rx="12" stroke="#D85A30" strokeWidth="3" strokeOpacity="0.4" />
      <rect x="28" y="42" width="10" height="10" rx="2" fill="#D85A30" opacity="0.6" />
      <rect x="42" y="42" width="10" height="10" rx="2" fill="#D85A30" opacity="0.6" />
    </svg>
  );
}
