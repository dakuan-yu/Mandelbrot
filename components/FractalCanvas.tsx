
import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { ViewPort, FractalConfig } from '../types';
import { interpolateColor } from '../utils/colorUtils';
import { PALETTES } from '../constants';

interface Props {
  view: ViewPort;
  onViewChange: (newView: ViewPort) => void;
  config: FractalConfig;
}

const FractalCanvas: React.FC<Props> = ({ view, onViewChange, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // JIT Compile the entire pixel loop for max performance
  const compiledRenderer = useMemo(() => {
    try {
      const functionBody = `
        const scale = zoom / Math.min(width, height);
        const paletteArray = palette;
        
        for (let py = 0; py < height; py++) {
          for (let px = 0; px < width; px++) {
            const x0 = centerX + (px - width / 2) * scale;
            const y0 = centerY + (py - height / 2) * scale;

            let x = 0;
            let y = 0;
            let iteration = 0;
            let x2 = 0;
            let y2 = 0;

            while (x2 + y2 <= 4 && iteration < maxIterations) {
              const nextX = ${config.realEquation};
              const nextY = ${config.imagEquation};
              x = nextX;
              y = nextY;
              x2 = x * x;
              y2 = y * y;
              iteration++;
            }

            let r = 0, g = 0, b = 0;
            if (iteration < maxIterations) {
              const log_zn = Math.log(x2 + y2) / 2;
              const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
              const t = (iteration + 1 - nu) / maxIterations;
              const col = interpolateColor(paletteArray, Math.pow(t, 0.5) % 1);
              r = col.r; g = col.g; b = col.b;
            }

            const idx = (py * width + px) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = 255;
          }
        }
      `;
      return new Function('data', 'width', 'height', 'centerX', 'centerY', 'zoom', 'maxIterations', 'palette', 'interpolateColor', functionBody);
    } catch (e) {
      console.error("Equation Compilation Error:", e);
      return null;
    }
  }, [config.realEquation, config.imagEquation]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !compiledRenderer) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    const { centerX, centerY, zoom } = view;
    const { maxIterations, colorPalette } = config;
    const palette = PALETTES[colorPalette as keyof typeof PALETTES] || PALETTES['Electric Blue'];

    const imageData = ctx.createImageData(width, height);
    
    try {
      compiledRenderer(imageData.data, width, height, centerX, centerY, zoom, maxIterations, palette, interpolateColor);
      ctx.putImageData(imageData, 0, 0);
    } catch (e) {
      console.error("Execution Error:", e);
    }
  }, [dimensions, view, config, compiledRenderer]);

  useEffect(() => {
    const id = requestAnimationFrame(render);
    return () => cancelAnimationFrame(id);
  }, [render]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const scale = view.zoom / Math.min(dimensions.width, dimensions.height);
    const worldX = view.centerX + (mouseX - dimensions.width / 2) * scale;
    const worldY = view.centerY + (mouseY - dimensions.height / 2) * scale;
    const newZoom = view.zoom * zoomFactor;
    const newScale = newZoom / Math.min(dimensions.width, dimensions.height);
    const newCenterX = worldX - (mouseX - dimensions.width / 2) * newScale;
    const newCenterY = worldY - (mouseY - dimensions.height / 2) * newScale;
    onViewChange({ centerX: newCenterX, centerY: newCenterY, zoom: newZoom });
  };

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    const scale = view.zoom / Math.min(dimensions.width, dimensions.height);
    onViewChange({ ...view, centerX: view.centerX - dx * scale, centerY: view.centerY - dy * scale });
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => isDragging.current = false}
      onMouseLeave={() => isDragging.current = false}
      className="cursor-move"
    />
  );
};

export default FractalCanvas;
