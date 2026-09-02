import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, RotateCcw, HelpCircle, Eye, EyeOff } from 'lucide-react';

interface EquationItem {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

const COLOR_PALETTE = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2'];

export const GraphingCalculatorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [equations, setEquations] = useState<EquationItem[]>([
    { id: 'eq_1', expression: 'y = 2x + 1', color: '#2563eb', visible: true },
    { id: 'eq_2', expression: 'y = x^2 - 4', color: '#dc2626', visible: true },
  ]);
  const [activeInputIndex, setActiveInputIndex] = useState<number>(0);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState<number>(30); // pixels per unit
  const [originOffset, setOriginOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Add equation
  const addEquation = () => {
    const nextColor = COLOR_PALETTE[equations.length % COLOR_PALETTE.length];
    const newEq: EquationItem = {
      id: `eq_${Date.now()}`,
      expression: '',
      color: nextColor,
      visible: true,
    };
    setEquations([...equations, newEq]);
    setActiveInputIndex(equations.length);
  };

  // Remove equation
  const removeEquation = (id: string) => {
    if (equations.length <= 1) {
      setEquations([{ id: 'eq_1', expression: '', color: '#2563eb', visible: true }]);
      return;
    }
    setEquations(equations.filter((e) => e.id !== id));
  };

  // Update expression text
  const updateExpression = (id: string, text: string) => {
    setEquations(equations.map((e) => (e.id === id ? { ...e, expression: text } : e)));
  };

  // Toggle equation visibility
  const toggleVisibility = (id: string) => {
    setEquations(equations.map((e) => (e.id === id ? { ...e, visible: !e.visible } : e)));
  };

  // Insert token to current active expression
  const insertToken = (token: string) => {
    if (equations.length === 0) return;
    const current = equations[activeInputIndex] || equations[0];
    const updated = current.expression + token;
    updateExpression(current.id, updated);
  };

  // Preset loaders
  const loadPreset = (type: 'linear' | 'parabola_line' | 'circle' | 'trig') => {
    if (type === 'linear') {
      setEquations([
        { id: '1', expression: 'y = 3x - 2', color: '#2563eb', visible: true },
        { id: '2', expression: 'y = -x + 6', color: '#dc2626', visible: true },
      ]);
    } else if (type === 'parabola_line') {
      setEquations([
        { id: '1', expression: 'y = x^2 - 3', color: '#2563eb', visible: true },
        { id: '2', expression: 'y = 2x + 1', color: '#dc2626', visible: true },
      ]);
    } else if (type === 'circle') {
      setEquations([
        { id: '1', expression: '(x-1)^2 + (y-2)^2 = 16', color: '#9333ea', visible: true },
        { id: '2', expression: 'y = 2', color: '#16a34a', visible: true },
      ]);
    } else if (type === 'trig') {
      setEquations([
        { id: '1', expression: 'y = 2*sin(x)', color: '#2563eb', visible: true },
        { id: '2', expression: 'y = cos(x)', color: '#ea580c', visible: true },
      ]);
    }
  };

  // Graph renderer
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2 + originOffset.x;
    const centerY = height / 2 + originOffset.y;

    // Clear background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    const step = scale; // pixels per 1 unit
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;

    // Minor grid
    const startX = centerX % step;
    for (let x = startX; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    const startY = centerY % step;
    for (let y = startY; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    // Y Axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Axis numbers
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const minUnitX = Math.floor(-centerX / step);
    const maxUnitX = Math.ceil((width - centerX) / step);
    const unitStep = scale < 20 ? 5 : scale < 40 ? 2 : 1;

    for (let u = minUnitX; u <= maxUnitX; u++) {
      if (u === 0 || u % unitStep !== 0) continue;
      const px = centerX + u * step;
      ctx.fillText(u.toString(), px, centerY + 4);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const minUnitY = Math.floor((centerY - height) / step);
    const maxUnitY = Math.ceil(centerY / step);

    for (let u = minUnitY; u <= maxUnitY; u++) {
      if (u === 0 || u % unitStep !== 0) continue;
      const py = centerY - u * step;
      ctx.fillText(u.toString(), centerX - 6, py);
    }

    // Function evaluation helper
    const parseAndEval = (expr: string, xVal: number): number | null => {
      try {
        let clean = expr.trim().toLowerCase();
        if (clean.startsWith('y=')) clean = clean.substring(2);
        else if (clean.startsWith('y =')) clean = clean.substring(3);
        clean = clean.replace(/\s+/g, '');

        // Standard math replacements
        clean = clean.replace(/(\d+)x/g, '$1*x');
        clean = clean.replace(/x\^2/g, '(x*x)');
        clean = clean.replace(/x\^3/g, '(x*x*x)');
        clean = clean.replace(/\^/g, '**');
        clean = clean.replace(/sin\(/g, 'Math.sin(');
        clean = clean.replace(/cos\(/g, 'Math.cos(');
        clean = clean.replace(/tan\(/g, 'Math.tan(');
        clean = clean.replace(/sqrt\(/g, 'Math.sqrt(');
        clean = clean.replace(/abs\(/g, 'Math.abs(');
        clean = clean.replace(/pi/g, 'Math.PI');

        const fn = new Function('x', `return ${clean};`);
        const res = fn(xVal);
        return typeof res === 'number' && !isNaN(res) && isFinite(res) ? res : null;
      } catch {
        return null;
      }
    };

    // Plot equations
    equations.forEach((eq) => {
      if (!eq.visible || !eq.expression.trim()) return;

      const expr = eq.expression.trim().toLowerCase();

      // Check if it's circle: (x-h)^2 + (y-k)^2 = r^2
      const circleMatch = expr.match(/\(x\s*([+-]\s*\d+)?\)\^2\s*\+\s*\(y\s*([+-]\s*\d+)?\)\^2\s*=\s*(\d+(\.\d+)?)/);
      if (circleMatch) {
        try {
          const h = circleMatch[1] ? -parseFloat(circleMatch[1].replace(/\s+/g, '')) : 0;
          const k = circleMatch[2] ? -parseFloat(circleMatch[2].replace(/\s+/g, '')) : 0;
          const rSq = parseFloat(circleMatch[3]);
          const r = Math.sqrt(rSq);

          ctx.strokeStyle = eq.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(centerX + h * step, centerY - k * step, r * step, 0, Math.PI * 2);
          ctx.stroke();
          return;
        } catch {
          // ignore
        }
      }

      // Standard explicit function y = f(x)
      ctx.strokeStyle = eq.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      let isDrawing = false;
      for (let px = 0; px <= width; px += 2) {
        const xUnit = (px - centerX) / step;
        const yUnit = parseAndEval(expr, xUnit);

        if (yUnit !== null) {
          const py = centerY - yUnit * step;
          if (py >= -100 && py <= height + 100) {
            if (!isDrawing) {
              ctx.moveTo(px, py);
              isDrawing = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            isDrawing = false;
          }
        } else {
          isDrawing = false;
        }
      }
      ctx.stroke();
    });

    // Draw hover coordinate point if any
    if (hoverCoord) {
      const px = centerX + hoverCoord.x * step;
      const py = centerY - hoverCoord.y * step;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();

      // Tooltip box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(px + 8, py - 24, 80, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`(${hoverCoord.x.toFixed(2)}, ${hoverCoord.y.toFixed(2)})`, px + 12, py - 10);
    }
  }, [isOpen, equations, scale, originOffset, hoverCoord]);

  // Handle canvas mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (isDragging) {
      setOriginOffset({
        x: originOffset.x + (clientX - dragStart.x),
        y: originOffset.y + (clientY - dragStart.y),
      });
      setDragStart({ x: clientX, y: clientY });
      return;
    }

    const centerX = canvas.width / 2 + originOffset.x;
    const centerY = canvas.height / 2 + originOffset.y;
    const unitX = (clientX - centerX) / scale;
    const unitY = (centerY - clientY) / scale;
    setHoverCoord({ x: unitX, y: unitY });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setScale((prev) => Math.max(10, Math.min(120, prev * zoomFactor)));
  };

  if (!isOpen) return null;

  return (
    <div id="desmos-calc-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <h2 className="text-base font-semibold text-slate-800">Digital SAT Desmos Graphing Calculator</h2>
            <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">100% Exam Permitted</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1">
              <span className="font-semibold text-slate-500">Preset Hacks:</span>
              <button onClick={() => loadPreset('linear')} className="hover:text-indigo-600 px-1.5 py-0.5 rounded hover:bg-slate-100">Linear System</button>
              <button onClick={() => loadPreset('parabola_line')} className="hover:text-indigo-600 px-1.5 py-0.5 rounded hover:bg-slate-100">Parabola & Line</button>
              <button onClick={() => loadPreset('circle')} className="hover:text-indigo-600 px-1.5 py-0.5 rounded hover:bg-slate-100">Circle</button>
              <button onClick={() => loadPreset('trig')} className="hover:text-indigo-600 px-1.5 py-0.5 rounded hover:bg-slate-100">Trig</button>
            </div>
            <button
              onClick={() => {
                setScale(30);
                setOriginOffset({ x: 0, y: 0 });
              }}
              title="Reset View"
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body (Left: Expression inputs & keypad, Right: Graphing Canvas) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Panel: Equation editor */}
          <div className="w-full md:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Equations & Expressions</span>
              <button
                onClick={addEquation}
                className="flex items-center space-x-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-white border border-indigo-200 px-2.5 py-1 rounded-md shadow-2xs hover:bg-indigo-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Expression</span>
              </button>
            </div>

            {/* List of expressions */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
              {equations.map((eq, idx) => (
                <div
                  key={eq.id}
                  onClick={() => setActiveInputIndex(idx)}
                  className={`p-2.5 rounded-lg border bg-white shadow-2xs flex items-center space-x-2 transition-all ${
                    activeInputIndex === idx ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(eq.id);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title={eq.visible ? 'Hide Curve' : 'Show Curve'}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2"
                      style={{
                        backgroundColor: eq.visible ? eq.color : 'transparent',
                        borderColor: eq.color,
                      }}
                    />
                  </button>

                  <input
                    type="text"
                    value={eq.expression}
                    onChange={(e) => updateExpression(eq.id, e.target.value)}
                    placeholder="e.g. y = 2x + 3"
                    className="flex-1 text-xs font-mono bg-transparent border-none outline-none text-slate-800"
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEquation(eq.id);
                    }}
                    className="p-1 text-slate-300 hover:text-red-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Scientific Math Keypad */}
            <div className="p-3 border-t border-slate-200 bg-white">
              <div className="grid grid-cols-5 gap-1.5 text-xs font-mono">
                {['x', 'y', '^2', '^', 'sqrt('].map((tok) => (
                  <button
                    key={tok}
                    onClick={() => insertToken(tok)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium text-center"
                  >
                    {tok}
                  </button>
                ))}
                {['sin(', 'cos(', 'tan(', '(', ')'].map((tok) => (
                  <button
                    key={tok}
                    onClick={() => insertToken(tok)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium text-center"
                  >
                    {tok}
                  </button>
                ))}
                {['+', '-', '*', '/', '='].map((tok) => (
                  <button
                    key={tok}
                    onClick={() => insertToken(tok === '*' ? '*' : tok === '/' ? '/' : tok)}
                    className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded font-semibold text-center"
                  >
                    {tok}
                  </button>
                ))}
                {['7', '8', '9', 'pi', 'abs('].map((tok) => (
                  <button
                    key={tok}
                    onClick={() => insertToken(tok)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium text-center"
                  >
                    {tok}
                  </button>
                ))}
                {['4', '5', '6', '1', '2'].map((tok) => (
                  <button
                    key={tok}
                    onClick={() => insertToken(tok)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium text-center"
                  >
                    {tok}
                  </button>
                ))}
                {['3', '0', '.', 'Clear', 'Back'].map((tok) => (
                  <button
                    key={tok}
                    onClick={() => {
                      if (tok === 'Clear') {
                        if (equations[activeInputIndex]) {
                          updateExpression(equations[activeInputIndex].id, '');
                        }
                      } else if (tok === 'Back') {
                        if (equations[activeInputIndex]) {
                          const exp = equations[activeInputIndex].expression;
                          updateExpression(equations[activeInputIndex].id, exp.slice(0, -1));
                        }
                      } else {
                        insertToken(tok);
                      }
                    }}
                    className={`p-1.5 rounded font-medium text-center ${
                      tok === 'Clear' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {tok}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Interactive Canvas Graph */}
          <div className="flex-1 relative flex items-center justify-center bg-white p-2 overflow-hidden select-none">
            <canvas
              ref={canvasRef}
              width={640}
              height={520}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              className="cursor-crosshair w-full h-full object-contain rounded-lg border border-slate-100"
            />

            {/* Quick controls badge */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xs border border-slate-200 shadow-md rounded-lg px-3 py-1.5 text-[11px] text-slate-600 flex items-center space-x-3">
              <span>Zoom: Scroll wheel</span>
              <span>Pan: Drag canvas</span>
              <span className="text-indigo-600 font-semibold">{scale}px/unit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
