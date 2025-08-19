import React, { useState, useRef, useEffect } from 'react';

function Canvas() {
  const canvasRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#58a6ff');
  const [size, setSize] = useState(3);
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    redraw();
  }, [paths]);

  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bg = '#0d1117';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    paths.forEach(p => {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      p.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    });
  };

  const start = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setPaths(prev => [...prev, { color, size, points: [{ x, y }] }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPaths(prev => {
      const next = [...prev];
      next[next.length - 1].points.push({ x, y });
      return next;
    });
  };

  const stop = () => setIsDrawing(false);

  const clearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      setPaths([]);
    }
  };

  const undo = () => setPaths(prev => prev.slice(0, -1));

  return (
    <div className="canvas-view">
      <div className="canvas-toolbar">
        <div className="toolbar-section">
          <h4>🎨 Style</h4>
          <div className="style-controls">
            <div className="color-picker">
              <label>Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <div className="size-control">
              <label>Size: {size}px</label>
              <input
                type="range"
                min="1"
                max="20"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        
        <div className="toolbar-section">
          <h4>⚡ Actions</h4>
          <div className="tool-group">
            <button className="tool-btn" onClick={undo}>
              ↶ Undo
            </button>
            <button className="tool-btn danger" onClick={clearCanvas}>
              🗑️ Clear
            </button>
          </div>
        </div>
      </div>
      
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={1400}
          height={900}
          className="drawing-canvas"
          onMouseDown={start}
          onMouseMove={draw}
          onMouseUp={stop}
          onMouseLeave={stop}
        />
      </div>
    </div>
  );
}

export default Canvas;
