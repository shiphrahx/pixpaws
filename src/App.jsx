import { useState, useCallback, useRef } from 'react';
import UploadZone from './components/UploadZone';
import Workspace from './components/Workspace';
import Footer from './components/Footer';

export default function App() {
  const [sourceImage, setSourceImage] = useState(null);
  const [sourceUrl, setSourceUrl] = useState(null);
  const prevUrlRef = useRef(null);

  const handleImageLoad = useCallback((img, url) => {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    prevUrlRef.current = url;
    setSourceImage(img);
    setSourceUrl(url);
  }, []);

  const handleReset = useCallback(() => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
    setSourceImage(null);
    setSourceUrl(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <main className="flex-1 flex flex-col items-center w-full px-4 py-8">
        {sourceImage ? (
          <Workspace sourceImage={sourceImage} sourceUrl={sourceUrl} onReset={handleReset} onImageLoad={handleImageLoad} />
        ) : (
          <UploadZone onImageLoad={handleImageLoad} />
        )}
      </main>
      <Footer />
    </div>
  );
}
