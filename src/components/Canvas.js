import React, { useState, useRef, useEffect } from 'react';

function Canvas({ onClose }) {
  const canvasRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#007acc');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    redrawCanvas();
  }, [elements]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    elements.forEach(element => {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.strokeWidth;
      ctx.lineCap = 'round';
      
      if (element.type === 'path') {
        ctx.beginPath();
        element.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      } else if (element.type === 'text') {
        ctx.fillStyle = element.color;
        ctx.font = `${element.fontSize || 16}px Arial`;
        ctx.fillText(element.text, element.x, element.y);
      } else if (element.type === 'note') {
        ctx.fillStyle = element.backgroundColor || '#2d2d2d';
        ctx.fillRect(element.x, element.y, element.width, element.height);
        ctx.strokeStyle = element.borderColor || '#404040';
        ctx.strokeRect(element.x, element.y, element.width, element.height);
        
        ctx.fillStyle = element.textColor || '#e0e0e0';
        ctx.font = '14px Arial';
        const lines = element.text.split('\n');
        lines.forEach((line, index) => {
          ctx.fillText(line, element.x + 10, element.y + 20 + (index * 18));
        });
      }
    });
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    
    if (tool === 'pen') {
      setIsDrawing(true);
      const newElement = {
        type: 'path',
        points: [pos],
        color: color,
        strokeWidth: strokeWidth
      };
      setElements(prev => [...prev, newElement]);
    } else if (tool === 'text') {
      setTextPosition(pos);
      setShowTextModal(true);
    }
  };

  const draw = (e) => {
    if (!isDrawing || tool !== 'pen') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setElements(prev => {
      const newElements = [...prev];
      const currentPath = newElements[newElements.length - 1];
      if (currentPath && currentPath.type === 'path') {
        currentPath.points.push({ x, y });
      }
      return newElements;
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const addText = () => {
    if (textInput.trim()) {
      setElements(prev => [...prev, {
        type: 'text',
        text: textInput,
        x: textPosition.x,
        y: textPosition.y,
        color,
        size: brushSize,
        id: Date.now()
      }]);
      setTextInput('');
      setShowTextModal(false);
    }
  };

  const addShape = (shape) => {
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    setElements(prev => [...prev, {
      type: 'shape',
      shape,
      x: centerX,
      y: centerY,
      width: 100,
      height: 60,
      radius: 40,
      color,
      size: brushSize,
      id: Date.now()
    }]);
  };

  const clearCanvas = () => {
    setElements([]);
  };

  const undoLast = () => {
    setElements(prev => prev.slice(0, -1));
  };

  return (
    <div className="canvas-view">
      <div className="canvas-toolbar">
        <div className="toolbar-section">
          <h4>🎨 Drawing Tools</h4>
          <div className="tool-group">
            <button 
              className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
              onClick={() => setTool('pen')}
            >
              ✏️ Draw
            </button>
            <button 
              className={`tool-btn ${tool === 'text' ? 'active' : ''}`}
              onClick={() => setTool('text')}
            >
              📝 Text
            </button>
            <button 
              className={`tool-btn ${tool === 'select' ? 'active' : ''}`}
              onClick={() => setTool('select')}
            >
              👆 Select
            </button>
          </div>
        </div>
        
        <div className="toolbar-section">
          <h4>🎯 Shapes</h4>
          <div className="tool-group">
            <button className="tool-btn" onClick={() => addShape('circle')}>
              ⭕ Circle
            </button>
            <button className="tool-btn" onClick={() => addShape('rectangle')}>
              ⬜ Box
            </button>
            <button className="tool-btn" onClick={() => addShape('arrow')}>
              ➡️ Arrow
            </button>
          </div>
        </div>
        
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
              <label>Size: {brushSize}px</label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        
        <div className="toolbar-section">
          <h4>⚡ Actions</h4>
          <div className="tool-group">
            <button className="tool-btn" onClick={undoLast}>
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
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        
        {selectedElement && (
          <div className="element-properties">
            <h4>Element Properties</h4>
            <p>Type: {selectedElement.type}</p>
            <button onClick={() => setSelectedElement(null)}>Delete</button>
          </div>
        )}
      </div>

      {showTextModal && (
        <div className="text-modal">
          <div className="text-modal-content">
            <h4>Add Text</h4>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter your text..."
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && addText()}
            />
            <div className="text-modal-actions">
              <button onClick={addText}>Add</button>
              <button onClick={() => setShowTextModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Canvas;
