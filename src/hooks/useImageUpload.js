import { useState, useCallback, useRef } from 'react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;

export function useImageUpload(onLoad) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const processFile = useCallback((file) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported format. Use JPG, PNG, or WebP.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('File too large. Max 10MB.');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      onLoad(img, url, file);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError('Could not load image.');
    };
    img.src = url;
  }, [onLoad]);

  const onDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const onInputChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
    e.target.value = '';
  }, [processFile]);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return { isDragging, error, onDragEnter, onDragOver, onDragLeave, onDrop, onInputChange, openPicker, inputRef };
}
