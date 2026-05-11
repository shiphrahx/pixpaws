export default function Header() {
  return (
    <header className="w-full py-6 px-6 flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <PawIcon />
        <span className="font-pixel text-sm leading-none">
          <span style={{ color: 'var(--brand-dark)' }}>pix</span>
          <span style={{ color: 'var(--brand-coral)' }}>paws</span>
        </span>
      </div>
      <p className="font-pixel text-xs mt-1" style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>
        Your pet, but in pixels
      </p>
    </header>
  );
}

function PawIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="4" height="4" fill="#D85A30" />
      <rect x="10" y="2" width="4" height="4" fill="#D85A30" />
      <rect x="16" y="2" width="4" height="4" fill="#D85A30" />
      <rect x="20" y="6" width="4" height="4" fill="#D85A30" />
      <rect x="6" y="10" width="16" height="14" rx="4" fill="#D85A30" />
      <rect x="10" y="14" width="4" height="4" fill="#F5F0EB" />
      <rect x="16" y="14" width="4" height="4" fill="#F5F0EB" />
    </svg>
  );
}
