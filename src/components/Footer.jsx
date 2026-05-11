export default function Footer() {
  return (
    <footer className="py-8 px-6 flex flex-col items-center gap-2 mt-auto">
      <p className="font-pixel text-center" style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>
        Made with pixels and love
      </p>
      <div className="flex gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline outline-none focus-visible:ring-2 rounded"
          style={{ '--tw-ring-color': 'var(--brand-coral)' }}
        >
          GitHub
        </a>
      </div>
      <p className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
        No upload. No server. All in your browser.
      </p>
    </footer>
  );
}
