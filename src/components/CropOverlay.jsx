import { useRef, useState, useCallback, useEffect } from 'react';

const MIN_CROP = 32;
const HANDLE_HIT = 16;

// handles: corners + edge midpoints
const HANDLES = [
  { id: 'nw', cx: 0,   cy: 0   },
  { id: 'n',  cx: 0.5, cy: 0   },
  { id: 'ne', cx: 1,   cy: 0   },
  { id: 'e',  cx: 1,   cy: 0.5 },
  { id: 'se', cx: 1,   cy: 1   },
  { id: 's',  cx: 0.5, cy: 1   },
  { id: 'sw', cx: 0,   cy: 1   },
  { id: 'w',  cx: 0,   cy: 0.5 },
];

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export default function CropOverlay({ imageNaturalWidth, imageNaturalHeight, displayWidth, displayHeight, cropRect, onChange }) {
  // cropRect in image-space { x, y, width, height }
  const scaleX = displayWidth / imageNaturalWidth;
  const scaleY = displayHeight / imageNaturalHeight;

  // Convert to display-space for rendering
  const dr = {
    x:      cropRect.x      * scaleX,
    y:      cropRect.y      * scaleY,
    width:  cropRect.width  * scaleX,
    height: cropRect.height * scaleY,
  };

  const drag = useRef(null); // { type: 'move'|handleId, startX, startY, startRect }
  const overlayRef = useRef(null);

  const toImageSpace = useCallback((dx, dy) => ({
    x: dx / scaleX,
    y: dy / scaleY,
  }), [scaleX, scaleY]);

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    const rect = overlayRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Check handles first
    for (const h of HANDLES) {
      const hx = dr.x + h.cx * dr.width;
      const hy = dr.y + h.cy * dr.height;
      if (Math.abs(px - hx) <= HANDLE_HIT && Math.abs(py - hy) <= HANDLE_HIT) {
        drag.current = { type: h.id, startX: px, startY: py, startRect: { ...cropRect } };
        overlayRef.current.setPointerCapture(e.pointerId);
        return;
      }
    }

    // Check inside crop rect (move)
    if (px >= dr.x && px <= dr.x + dr.width && py >= dr.y && py <= dr.y + dr.height) {
      drag.current = { type: 'move', startX: px, startY: py, startRect: { ...cropRect } };
      overlayRef.current.setPointerCapture(e.pointerId);
    }
  }, [dr, cropRect]);

  const onPointerMove = useCallback((e) => {
    if (!drag.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const ddx = px - drag.current.startX;
    const ddy = py - drag.current.startY;
    const { x: idx, y: idy } = toImageSpace(ddx, ddy);
    const sr = drag.current.startRect;
    const W = imageNaturalWidth;
    const H = imageNaturalHeight;

    let nx = sr.x, ny = sr.y, nw = sr.width, nh = sr.height;
    const type = drag.current.type;

    if (type === 'move') {
      nx = clamp(sr.x + idx, 0, W - sr.width);
      ny = clamp(sr.y + idy, 0, H - sr.height);
    } else {
      // Resize based on handle
      if (type.includes('e')) { nw = clamp(sr.width + idx, MIN_CROP, W - sr.x); }
      if (type.includes('s')) { nh = clamp(sr.height + idy, MIN_CROP, H - sr.y); }
      if (type.includes('w')) {
        const proposed = clamp(sr.x + idx, 0, sr.x + sr.width - MIN_CROP);
        nw = sr.width + (sr.x - proposed);
        nx = proposed;
      }
      if (type.includes('n')) {
        const proposed = clamp(sr.y + idy, 0, sr.y + sr.height - MIN_CROP);
        nh = sr.height + (sr.y - proposed);
        ny = proposed;
      }
    }

    onChange({ x: nx, y: ny, width: nw, height: nh });
  }, [toImageSpace, imageNaturalWidth, imageNaturalHeight, onChange]);

  const onPointerUp = useCallback(() => {
    drag.current = null;
  }, []);

  return (
    <div
      ref={overlayRef}
      style={{ position: 'absolute', inset: 0, cursor: 'crosshair' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Dim outside crop */}
      <svg width={displayWidth} height={displayHeight} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <defs>
          <mask id="crop-mask">
            <rect width={displayWidth} height={displayHeight} fill="white" />
            <rect x={dr.x} y={dr.y} width={dr.width} height={dr.height} fill="black" />
          </mask>
        </defs>
        <rect width={displayWidth} height={displayHeight} fill="rgba(0,0,0,0.5)" mask="url(#crop-mask)" />
        {/* Crop border */}
        <rect x={dr.x} y={dr.y} width={dr.width} height={dr.height} fill="none" stroke="white" strokeWidth={2} />
        {/* Handles */}
        {HANDLES.map(h => (
          <rect
            key={h.id}
            x={dr.x + h.cx * dr.width - 4}
            y={dr.y + h.cy * dr.height - 4}
            width={8}
            height={8}
            fill="white"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth={1}
          />
        ))}
      </svg>
    </div>
  );
}
