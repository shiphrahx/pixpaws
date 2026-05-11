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
    <div className="w-full max-w-4xl mx-auto" style={{ background: 'var(--bg-secondary, #F0EBE3)', borderRadius: 16, padding: '2rem' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <span style={{ fontSize: 28, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '-1px' }}>
            pix<span style={{ color: '#D85A30' }}>paws</span>
          </span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Your pet, but in pixels</p>
      </div>

      {/* Dashed upload zone */}
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
        className="cursor-pointer text-center transition-all duration-200 outline-none focus-visible:ring-2"
        style={{
          borderRadius: 12,
          border: `2px dashed ${isDragging ? '#D85A30' : 'var(--border)'}`,
          padding: '2rem',
          background: isDragging ? 'rgba(216,90,48,0.05)' : 'var(--surface)',
          boxShadow: isDragging ? '0 0 0 4px rgba(216,90,48,0.12)' : 'none',
          '--tw-ring-color': 'var(--brand-coral)',
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary, #9B9BAA)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Drag and drop your pet photo here</p>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary, #9B9BAA)', margin: 0 }}>or click to browse · JPG, PNG up to 10MB</p>
        {error && (
          <p className="mt-3 text-sm font-medium" style={{ color: '#dc2626' }}>{error}</p>
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
