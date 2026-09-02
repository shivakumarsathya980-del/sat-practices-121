import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PenTool,
  Eraser,
  Highlighter,
  Square,
  Circle as CircleIcon,
  ArrowRight,
  Minus,
  Type,
  Grid,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Check,
  Plus,
  Play,
  Pause,
  Cpu,
  BookOpen,
  Calculator,
  Compass,
  FileDown,
  Volume2,
  VolumeX,
  Activity,
  Zap,
  Palette,
  Eye,
  Sliders,
  Send,
  RefreshCw,
} from 'lucide-react';
import { TranscriptEntry } from '../types';

export type DrawingTool =
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'line'
  | 'arrow'
  | 'rect'
  | 'circle'
  | 'axes'
  | 'text';

export type BoardStyle = 'chalkboard' | 'whiteboard' | '3d_perspective' | '3d_isometric' | '3d_space';
export type GridType = '3d_perspective' | '3d_isometric' | '3d_space' | 'grid' | 'dots' | 'lines' | 'none';

export interface VisualStep {
  title: string;
  formula: string;
  explanation: string;
  diagramType:
    | 'parabola'
    | 'circle'
    | 'physics_fbd'
    | 'desmos_line'
    | 'calculus_tangent'
    | 'triangle'
    | 'sine_wave'
    | 'grammar_table'
    | '3d_parabola'
    | '3d_helix'
    | '3d_incline'
    | 'generic';
}

interface StrokeAction {
  type: 'line' | 'curve' | 'arc' | 'vector' | 'point' | 'text' | 'dashed' | 'box';
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  cx?: number;
  cy?: number;
  r?: number;
  startAngle?: number;
  endAngle?: number;
  color: string;
  width: number;
  text?: string;
  font?: string;
  formulaFn?: (x: number) => number;
  range?: [number, number];
  label?: string;
  labelOffset?: { x: number; y: number };
}

interface LiveExplanationWhiteboardProps {
  selectedDomain?: string;
  isVoiceActive?: boolean;
  activeSpeaker?: 'none' | 'user' | 'model';
  voiceName?: string;
  transcripts?: TranscriptEntry[];
  latestTranscript?: TranscriptEntry;
  onSendVoiceMessage?: (msg: string) => void;
  className?: string;
}

export const LiveExplanationWhiteboard: React.FC<LiveExplanationWhiteboardProps> = ({
  selectedDomain = 'universal',
  isVoiceActive = false,
  activeSpeaker = 'none',
  voiceName = 'Zephyr',
  transcripts = [],
  latestTranscript,
  onSendVoiceMessage,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Settings
  const [boardStyle, setBoardStyle] = useState<BoardStyle>('chalkboard');
  const [activeTool, setActiveTool] = useState<DrawingTool>('pen');
  const [color, setColor] = useState<string>('#fde047');
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [gridType, setGridType] = useState<GridType>('grid');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Animation and Writing States
  const [isLiveWriting, setIsLiveWriting] = useState<boolean>(false);
  const [chalkTipPos, setChalkTipPos] = useState<{ x: number; y: number } | null>(null);
  const [autoWriteVoice, setAutoWriteVoice] = useState<boolean>(true);
  const [activeConceptTitle, setActiveConceptTitle] = useState<string>('Parabola Vertex & Roots');
  const [currentSpeakingText, setCurrentSpeakingText] = useState<string>('');
  const [drawingProgress, setDrawingProgress] = useState<number>(0);

  // Manual Drawing State
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState<string>('');

  // Feed of Written Steps
  const [writtenSteps, setWrittenSteps] = useState<VisualStep[]>([
    {
      title: '1. Standard Quadratic Form',
      formula: 'f(x) = ax² + bx + c',
      explanation: 'Parabola vertex and roots analysis with axis of symmetry.',
      diagramType: 'parabola',
    },
    {
      title: '2. Vertex Coordinates',
      formula: 'x_v = -b / (2a),  y_v = f(x_v)',
      explanation: 'Extreme turning point of the curve.',
      diagramType: 'parabola',
    },
    {
      title: '3. College Board Trap Warning',
      formula: 'Discriminant: Δ = b² - 4ac',
      explanation: 'If Δ = 0, exactly one real root (tangent to x-axis).',
      diagramType: 'parabola',
    },
  ]);

  // Prompt Input
  const [studentQuestion, setStudentQuestion] = useState<string>('');
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState<boolean>(false);

  // Colors
  const CHALK_COLORS = ['#fde047', '#38bdf8', '#34d399', '#f43f5e', '#c084fc', '#ffffff', '#fb923c'];
  const WHITEBOARD_COLORS = ['#1e293b', '#2563eb', '#059669', '#dc2626', '#7c3aed', '#ea580c', '#0284c7'];
  const currentColorPalette = boardStyle === 'chalkboard' ? CHALK_COLORS : WHITEBOARD_COLORS;

  // -------------------------------------------------------------
  // Web Audio Chalk Scratch Sound Generator
  // -------------------------------------------------------------
  const playChalkSound = (durationMs = 80) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx?.resume();
      }
      if (!ctx) return;

      // Soft high-frequency filtered noise mimicking chalk on slate
      const bufferSize = Math.floor(ctx.sampleRate * (durationMs / 1000));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800 + Math.random() * 800;
      filter.Q.value = 3.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {
      // Audio not permitted yet or unavailable
    }
  };

  // -------------------------------------------------------------
  // Canvas Sizing & Background
  // -------------------------------------------------------------
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const newWidth = Math.max(300, Math.floor(rect.width));
    const newHeight = isFullscreen ? Math.max(400, Math.floor(window.innerHeight * 0.74)) : 440;

    canvas.width = newWidth;
    canvas.height = newHeight;

    drawBackgroundAndGrid(canvas, canvas.getContext('2d'));
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [boardStyle, gridType, isFullscreen]);

  useEffect(() => {
    if (boardStyle === 'chalkboard') {
      setColor('#fde047');
    } else if (boardStyle === '3d_perspective' || boardStyle === '3d_space') {
      setColor('#38bdf8');
    } else if (boardStyle === '3d_isometric') {
      setColor('#a855f7');
    } else {
      setColor('#2563eb');
    }
  }, [boardStyle]);

  const drawBackgroundAndGrid = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D | null) => {
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    const is3D =
      boardStyle === '3d_perspective' ||
      boardStyle === '3d_isometric' ||
      boardStyle === '3d_space' ||
      gridType === '3d_perspective' ||
      gridType === '3d_isometric' ||
      gridType === '3d_space';

    if (boardStyle === 'whiteboard') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    } else if (boardStyle === '3d_perspective' || gridType === '3d_perspective') {
      // --- 3D PERSPECTIVE VANISHING PLANE BACKGROUND ---
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#020617'); // Dark cosmic space
      grad.addColorStop(0.35, '#071026'); // Horizon level
      grad.addColorStop(0.38, '#0b193d'); // Glowing horizon line
      grad.addColorStop(1, '#050a18'); // Floor depth
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Horizon line
      const horizonY = h * 0.36;
      const vpX = w * 0.5;

      // Glowing horizon glow
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.stroke();

      // Radiating 3D floor perspective lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.lineWidth = 1;
      const rayCount = 18;
      for (let i = -rayCount; i <= rayCount; i++) {
        const bottomX = vpX + i * (w / (rayCount * 0.85));
        ctx.beginPath();
        ctx.moveTo(vpX, horizonY);
        ctx.lineTo(bottomX, h);
        ctx.stroke();
      }

      // Horizontal depth rings (logarithmic perspective spacing)
      for (let step = 1; step <= 12; step++) {
        const t = Math.pow(step / 12, 1.8);
        const y = horizonY + t * (h - horizonY);
        const alpha = 0.08 + t * 0.18;
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Floating 3D Star/Data particles
      ctx.fillStyle = 'rgba(199, 210, 254, 0.5)';
      for (let i = 0; i < 35; i++) {
        const px = ((i * 197) % w);
        const py = ((i * 83) % (horizonY - 10));
        const size = (i % 3) * 0.8 + 0.8;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3D Coordinate Axis Compass in Corner
      const compassX = 55;
      const compassY = h - 55;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;

      // X Axis
      ctx.beginPath();
      ctx.moveTo(compassX, compassY);
      ctx.lineTo(compassX + 35, compassY + 12);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('+X (î)', compassX + 38, compassY + 15);

      // Y Axis (Depth)
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.moveTo(compassX, compassY);
      ctx.lineTo(compassX - 25, compassY + 14);
      ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.fillText('+Y (ĵ)', compassX - 48, compassY + 18);

      // Z Axis (Up)
      ctx.strokeStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(compassX, compassY);
      ctx.lineTo(compassX, compassY - 35);
      ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      ctx.fillText('+Z (k̂)', compassX - 10, compassY - 40);

      // Origin Point
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(compassX, compassY, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (boardStyle === '3d_isometric' || gridType === '3d_isometric') {
      // --- 3D ISOMETRIC DIAMOND CAD LATTICE ---
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#09081a');
      grad.addColorStop(0.5, '#120d2d');
      grad.addColorStop(1, '#080517');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 30 degree and 150 degree isometric lattice lines
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.12)';
      ctx.lineWidth = 1;
      const isoStep = 32;
      const diag = Math.sqrt(w * w + h * h);

      for (let offset = -diag; offset < diag; offset += isoStep) {
        // Line at 30 deg
        ctx.beginPath();
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset + h * 1.732, h);
        ctx.stroke();

        // Line at -30 deg (150 deg)
        ctx.beginPath();
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset - h * 1.732, h);
        ctx.stroke();
      }

      // Vertical lines
      for (let x = 0; x < w; x += isoStep * 1.732) {
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // 3D Isometric Coordinate Triad
      ctx.fillStyle = 'rgba(216, 180, 254, 0.7)';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('3D ISOMETRIC PROJECTION GRID [∠30°]', 20, 25);

    } else if (boardStyle === '3d_space' || gridType === '3d_space') {
      // --- 3D DEEP SPACE NEURAL COORDINATES ---
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 50, w * 0.5, h * 0.5, Math.max(w, h));
      grad.addColorStop(0, '#101530');
      grad.addColorStop(0.6, '#080c1d');
      grad.addColorStop(1, '#02040b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Floating 3D Depth Grid Cubes in Background
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 1;
      const step = 45;
      for (let x = step; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = step; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 3D Spatial Box Outline at Center
      const boxSize = Math.min(w, h) * 0.35;
      const bcX = w * 0.5;
      const bcY = h * 0.5;
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(bcX - boxSize * 0.5, bcY - boxSize * 0.5, boxSize, boxSize);
      ctx.strokeRect(bcX - boxSize * 0.5 + 20, bcY - boxSize * 0.5 - 20, boxSize, boxSize);
      ctx.beginPath();
      ctx.moveTo(bcX - boxSize * 0.5, bcY - boxSize * 0.5);
      ctx.lineTo(bcX - boxSize * 0.5 + 20, bcY - boxSize * 0.5 - 20);
      ctx.moveTo(bcX + boxSize * 0.5, bcY - boxSize * 0.5);
      ctx.lineTo(bcX + boxSize * 0.5 + 20, bcY - boxSize * 0.5 - 20);
      ctx.moveTo(bcX - boxSize * 0.5, bcY + boxSize * 0.5);
      ctx.lineTo(bcX - boxSize * 0.5 + 20, bcY + boxSize * 0.5 - 20);
      ctx.moveTo(bcX + boxSize * 0.5, bcY + boxSize * 0.5);
      ctx.lineTo(bcX + boxSize * 0.5 + 20, bcY + boxSize * 0.5 - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('3D SPATIAL VECTOR DOMAIN R³', 20, 25);

    } else {
      // --- SLATE CHALKBOARD ---
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#09131f');
      grad.addColorStop(1, '#060d17');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle chalk dust grain texture
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let i = 0; i < 30; i++) {
        const x = (i * 127) % w;
        const y = (i * 73) % h;
        ctx.fillRect(x, y, 40, 20);
      }
    }

    // Classic 2D Grid overlays if not already in 3D background mode
    if (!is3D) {
      if (gridType === 'grid') {
        ctx.strokeStyle = boardStyle === 'chalkboard' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
        ctx.lineWidth = 1;
        const step = 28;
        for (let x = step; x < w; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = step; y < h; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      } else if (gridType === 'dots') {
        ctx.fillStyle = boardStyle === 'chalkboard' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
        const step = 24;
        for (let x = step; x < w; x += step) {
          for (let y = step; y < h; y += step) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (gridType === 'lines') {
        ctx.strokeStyle = boardStyle === 'chalkboard' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(37, 99, 235, 0.07)';
        ctx.lineWidth = 1;
        const step = 26;
        for (let y = step; y < h; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }
    }
  };

  // -------------------------------------------------------------
  // REAL-TIME AUTO-DRAWING & STROKE ANIMATION ENGINE
  // -------------------------------------------------------------
  const executeStrokeSequence = (actions: StrokeAction[], onComplete?: () => void) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }

    drawBackgroundAndGrid(canvas, ctx);
    setIsLiveWriting(true);
    setDrawingProgress(0);

    let actionIndex = 0;
    let stepProgress = 0;
    const totalActions = actions.length;

    const renderStep = () => {
      if (actionIndex >= actions.length) {
        setIsLiveWriting(false);
        setChalkTipPos(null);
        setDrawingProgress(100);
        if (onComplete) onComplete();
        return;
      }

      const action = actions[actionIndex];
      const speed = action.type === 'curve' ? 0.05 : action.type === 'text' ? 0.2 : 0.08;
      stepProgress += speed;

      const overall = Math.min(100, Math.floor(((actionIndex + Math.min(stepProgress, 1)) / totalActions) * 100));
      setDrawingProgress(overall);

      // Chalk sound ticks
      if (Math.random() < 0.35) {
        playChalkSound(45);
      }

      // Execute current action incrementally
      if (action.type === 'line' && action.x1 !== undefined && action.y1 !== undefined && action.x2 !== undefined && action.y2 !== undefined) {
        const curX = action.x1 + (action.x2 - action.x1) * Math.min(stepProgress, 1);
        const curY = action.y1 + (action.y2 - action.y1) * Math.min(stepProgress, 1);

        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(action.x1, action.y1);
        ctx.lineTo(curX, curY);
        ctx.stroke();

        setChalkTipPos({ x: curX, y: curY });

        if (stepProgress >= 1 && action.label) {
          ctx.fillStyle = action.color;
          ctx.font = action.font || 'bold 12px sans-serif';
          const lx = action.x2 + (action.labelOffset?.x || 8);
          const ly = action.y2 + (action.labelOffset?.y || 4);
          ctx.fillText(action.label, lx, ly);
        }
      } else if (action.type === 'vector' && action.x1 !== undefined && action.y1 !== undefined && action.x2 !== undefined && action.y2 !== undefined) {
        const curX = action.x1 + (action.x2 - action.x1) * Math.min(stepProgress, 1);
        const curY = action.y1 + (action.y2 - action.y1) * Math.min(stepProgress, 1);

        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(action.x1, action.y1);
        ctx.lineTo(curX, curY);
        ctx.stroke();

        setChalkTipPos({ x: curX, y: curY });

        if (stepProgress >= 1) {
          // Draw Arrowhead
          const angle = Math.atan2(action.y2 - action.y1, action.x2 - action.x1);
          ctx.fillStyle = action.color;
          ctx.beginPath();
          ctx.moveTo(action.x2, action.y2);
          ctx.lineTo(action.x2 - 10 * Math.cos(angle - Math.PI / 6), action.y2 - 10 * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(action.x2 - 10 * Math.cos(angle + Math.PI / 6), action.y2 - 10 * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();

          if (action.label) {
            ctx.font = action.font || 'bold 12px sans-serif';
            ctx.fillStyle = action.color;
            ctx.fillText(action.label, action.x2 + (action.labelOffset?.x || 8), action.y2 + (action.labelOffset?.y || 4));
          }
        }
      } else if (action.type === 'curve' && action.formulaFn && action.range) {
        const [minX, maxX] = action.range;
        const totalDist = maxX - minX;
        const targetX = minX + totalDist * Math.min(stepProgress, 1);

        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.width;
        ctx.beginPath();
        let first = true;
        let lastPt = { x: minX, y: action.formulaFn(minX) };

        for (let x = minX; x <= targetX; x += 3) {
          const y = action.formulaFn(x);
          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
          lastPt = { x, y };
        }
        ctx.stroke();
        setChalkTipPos(lastPt);
      } else if (action.type === 'arc' && action.cx !== undefined && action.cy !== undefined && action.r !== undefined) {
        const sA = action.startAngle || 0;
        const eA = action.endAngle || Math.PI * 2;
        const curAngle = sA + (eA - sA) * Math.min(stepProgress, 1);

        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.width;
        ctx.beginPath();
        ctx.arc(action.cx, action.cy, action.r, sA, curAngle);
        ctx.stroke();

        const tipX = action.cx + Math.cos(curAngle) * action.r;
        const tipY = action.cy + Math.sin(curAngle) * action.r;
        setChalkTipPos({ x: tipX, y: tipY });
      } else if (action.type === 'point' && action.cx !== undefined && action.cy !== undefined && action.r !== undefined) {
        ctx.fillStyle = action.color;
        ctx.beginPath();
        ctx.arc(action.cx, action.cy, action.r, 0, Math.PI * 2);
        ctx.fill();

        // Pulsating outer glow
        ctx.strokeStyle = action.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(action.cx, action.cy, action.r + 4, 0, Math.PI * 2);
        ctx.stroke();

        if (action.label) {
          ctx.font = action.font || 'bold 12px monospace';
          ctx.fillStyle = action.color;
          ctx.fillText(action.label, action.cx + (action.labelOffset?.x || 10), action.cy + (action.labelOffset?.y || 4));
        }
        setChalkTipPos({ x: action.cx, y: action.cy });
      } else if (action.type === 'dashed' && action.x1 !== undefined && action.y1 !== undefined && action.x2 !== undefined && action.y2 !== undefined) {
        const curX = action.x1 + (action.x2 - action.x1) * Math.min(stepProgress, 1);
        const curY = action.y1 + (action.y2 - action.y1) * Math.min(stepProgress, 1);

        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.width;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(action.x1, action.y1);
        ctx.lineTo(curX, curY);
        ctx.stroke();
        ctx.setLineDash([]);

        setChalkTipPos({ x: curX, y: curY });
      } else if (action.type === 'text' && action.text && action.x1 !== undefined && action.y1 !== undefined) {
        const charsToShow = Math.floor(action.text.length * Math.min(stepProgress, 1));
        const partialText = action.text.slice(0, charsToShow);

        ctx.fillStyle = action.color;
        ctx.font = action.font || 'bold 14px monospace';
        ctx.fillText(partialText, action.x1, action.y1);

        const textMetrics = ctx.measureText(partialText);
        setChalkTipPos({ x: action.x1 + textMetrics.width + 4, y: action.y1 });
      } else if (action.type === 'box' && action.x1 !== undefined && action.y1 !== undefined && action.x2 !== undefined && action.y2 !== undefined) {
        const w = action.x2;
        const h = action.y2;
        ctx.fillStyle = action.color + '1a';
        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.width;
        ctx.fillRect(action.x1, action.y1, w, h);
        ctx.strokeRect(action.x1, action.y1, w, h);

        if (action.label) {
          ctx.fillStyle = action.color;
          ctx.font = action.font || 'bold 13px sans-serif';
          ctx.fillText(action.label, action.x1 + 12, action.y1 + 22);
        }
        setChalkTipPos({ x: action.x1 + w, y: action.y1 + h });
      }

      if (stepProgress >= 1) {
        actionIndex++;
        stepProgress = 0;
      }

      animFrameIdRef.current = requestAnimationFrame(renderStep);
    };

    animFrameIdRef.current = requestAnimationFrame(renderStep);
  };

  // -------------------------------------------------------------
  // ANIMATION PRESETS
  // -------------------------------------------------------------

  // 1. Parabola & Vertex Live Animation
  const animateParabola = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const isChalk = boardStyle === 'chalkboard';

    const mainColor = isChalk ? '#38bdf8' : '#2563eb';
    const accentColor = isChalk ? '#fde047' : '#ea580c';
    const textColor = isChalk ? '#ffffff' : '#0f172a';
    const subColor = isChalk ? '#94a3b8' : '#64748b';

    const originX = w * 0.45;
    const originY = h * 0.62;
    const vertexX = originX + 40;
    const vertexY = originY - 90;

    setActiveConceptTitle('Parabola Vertex & Roots: f(x) = a(x - h)² + k');

    const actions: StrokeAction[] = [
      // Title
      {
        type: 'text',
        text: 'f(x) = a(x - h)² + k   [Standard Vertex Form]',
        x1: 40,
        y1: 45,
        color: textColor,
        width: 1,
        font: 'bold 15px monospace',
      },
      // X Axis
      {
        type: 'vector',
        x1: 40,
        y1: originY,
        x2: w * 0.88,
        y2: originY,
        color: isChalk ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
        width: 2,
        label: 'x',
        font: 'bold 13px sans-serif',
      },
      // Y Axis
      {
        type: 'vector',
        x1: originX,
        y1: h - 35,
        x2: originX,
        y2: 45,
        color: isChalk ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
        width: 2,
        label: 'y',
        labelOffset: { x: -18, y: 0 },
        font: 'bold 13px sans-serif',
      },
      // Origin label
      {
        type: 'point',
        cx: originX,
        cy: originY,
        r: 3,
        color: subColor,
        width: 1,
        label: '(0,0)',
        labelOffset: { x: -30, y: 16 },
      },
      // Parabola Curve
      {
        type: 'curve',
        formulaFn: (px) => {
          const dx = (px - vertexX) * 0.045;
          return vertexY + dx * dx * 28;
        },
        range: [originX - 140, originX + 220],
        color: mainColor,
        width: 3.5,
      },
      // Axis of Symmetry dashed line
      {
        type: 'dashed',
        x1: vertexX,
        y1: 50,
        x2: vertexX,
        y2: h - 40,
        color: accentColor,
        width: 2,
      },
      // Vertex point
      {
        type: 'point',
        cx: vertexX,
        cy: vertexY,
        r: 6,
        color: accentColor,
        width: 2,
        label: 'Vertex (h, k)',
        labelOffset: { x: -40, y: -16 },
      },
      // Root x1
      {
        type: 'point',
        cx: vertexX - 56,
        cy: originY,
        r: 4,
        color: '#34d399',
        width: 1.5,
        label: 'Root x₁',
        labelOffset: { x: -25, y: 20 },
      },
      // Root x2
      {
        type: 'point',
        cx: vertexX + 56,
        cy: originY,
        r: 4,
        color: '#34d399',
        width: 1.5,
        label: 'Root x₂',
        labelOffset: { x: -10, y: 20 },
      },
      // Discriminant Formula
      {
        type: 'text',
        text: 'Roots: x = (-b ± √[b² - 4ac]) / (2a)   |   Δ = b² - 4ac',
        x1: 40,
        y1: h - 25,
        color: accentColor,
        width: 1,
        font: 'bold 13px monospace',
      },
    ];

    executeStrokeSequence(actions);
  };

  // 2. Circle Geometry & Standard Equation Live Animation
  const animateCircle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const isChalk = boardStyle === 'chalkboard';

    const mainColor = isChalk ? '#38bdf8' : '#2563eb';
    const accentColor = isChalk ? '#fde047' : '#ea580c';
    const textColor = isChalk ? '#ffffff' : '#0f172a';
    const subColor = isChalk ? '#94a3b8' : '#64748b';

    const centerX = w * 0.48;
    const centerY = h * 0.55;
    const radius = Math.min(w, h) * 0.26;

    setActiveConceptTitle('Circle Standard Equation: (x - h)² + (y - k)² = r²');

    const actions: StrokeAction[] = [
      // Title
      {
        type: 'text',
        text: '(x - h)² + (y - k)² = r²   [Center (h,k), Radius r]',
        x1: 40,
        y1: 45,
        color: textColor,
        width: 1,
        font: 'bold 15px monospace',
      },
      // Axes
      {
        type: 'vector',
        x1: 40,
        y1: centerY,
        x2: w * 0.88,
        y2: centerY,
        color: isChalk ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
        width: 2,
        label: 'x',
      },
      {
        type: 'vector',
        x1: centerX,
        y1: h - 35,
        x2: centerX,
        y2: 45,
        color: isChalk ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
        width: 2,
        label: 'y',
        labelOffset: { x: -18, y: 0 },
      },
      // Circle Stroke
      {
        type: 'arc',
        cx: centerX,
        cy: centerY,
        r: radius,
        startAngle: 0,
        endAngle: Math.PI * 2,
        color: mainColor,
        width: 3.5,
      },
      // Center Point
      {
        type: 'point',
        cx: centerX,
        cy: centerY,
        r: 5,
        color: accentColor,
        width: 2,
        label: 'Center (h, k)',
        labelOffset: { x: -35, y: -14 },
      },
      // Radius vector
      {
        type: 'vector',
        x1: centerX,
        y1: centerY,
        x2: centerX + radius * Math.cos(Math.PI / 4),
        y2: centerY - radius * Math.sin(Math.PI / 4),
        color: accentColor,
        width: 2.5,
        label: 'r (radius)',
        labelOffset: { x: 5, y: -5 },
      },
      // Tangent line at top
      {
        type: 'line',
        x1: centerX - radius - 20,
        y1: centerY - radius,
        x2: centerX + radius + 20,
        y2: centerY - radius,
        color: '#f43f5e',
        width: 2,
        label: 'Tangent Line (⊥ to radius)',
        labelOffset: { x: -80, y: -10 },
      },
      // SAT Pro Tip
      {
        type: 'text',
        text: 'Completing the Square: x² + y² + Ax + By + C = 0  ->  (x - h)² + (y - k)² = r²',
        x1: 40,
        y1: h - 25,
        color: accentColor,
        width: 1,
        font: 'bold 13px monospace',
      },
    ];

    executeStrokeSequence(actions);
  };

  // 3. Physics Free-Body Diagram (FBD) Live Animation
  const animatePhysicsFBD = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const isChalk = boardStyle === 'chalkboard';

    const mainColor = isChalk ? '#38bdf8' : '#2563eb';
    const accentColor = isChalk ? '#fde047' : '#ea580c';
    const textColor = isChalk ? '#ffffff' : '#0f172a';

    const blockX = w * 0.45;
    const blockY = h * 0.52;
    const blockW = 80;
    const blockH = 60;
    const cx = blockX + blockW / 2;
    const cy = blockY + blockH / 2;

    setActiveConceptTitle('Physics Free Body Diagram (FBD): ΣF = ma');

    const actions: StrokeAction[] = [
      // Title
      {
        type: 'text',
        text: 'Newton\'s Second Law:  ΣF = m·a   [Free Body Diagram]',
        x1: 40,
        y1: 45,
        color: textColor,
        width: 1,
        font: 'bold 15px monospace',
      },
      // Ground Surface
      {
        type: 'line',
        x1: 40,
        y1: blockY + blockH,
        x2: w * 0.88,
        y2: blockY + blockH,
        color: isChalk ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
        width: 3,
        label: 'Frictional Surface (μ)',
      },
      // Mass Box
      {
        type: 'box',
        x1: blockX,
        y1: blockY,
        x2: blockW,
        y2: blockH,
        color: mainColor,
        width: 2.5,
        label: 'Mass m',
      },
      // Gravity Force Fg (Downward)
      {
        type: 'vector',
        x1: cx,
        y1: cy,
        x2: cx,
        y2: cy + 100,
        color: '#f43f5e',
        width: 3,
        label: 'F_g = m·g (Gravity)',
        labelOffset: { x: 8, y: 0 },
      },
      // Normal Force Fn (Upward)
      {
        type: 'vector',
        x1: cx,
        y1: cy,
        x2: cx,
        y2: cy - 100,
        color: '#34d399',
        width: 3,
        label: 'F_N (Normal Force)',
        labelOffset: { x: 8, y: 0 },
      },
      // Applied Force F_pull (Rightward)
      {
        type: 'vector',
        x1: cx,
        y1: cy,
        x2: cx + 110,
        y2: cy,
        color: accentColor,
        width: 3,
        label: 'F_applied (Pull)',
        labelOffset: { x: 8, y: 4 },
      },
      // Friction Force F_friction (Leftward)
      {
        type: 'vector',
        x1: cx,
        y1: cy,
        x2: cx - 80,
        y2: cy,
        color: '#c084fc',
        width: 3,
        label: 'f_k = μ_k · F_N',
        labelOffset: { x: -90, y: 4 },
      },
      // Formula Summary
      {
        type: 'text',
        text: 'ΣF_x = F_applied - f_k = m·a_x   |   ΣF_y = F_N - m·g = 0',
        x1: 40,
        y1: h - 25,
        color: accentColor,
        width: 1,
        font: 'bold 13px monospace',
      },
    ];

    executeStrokeSequence(actions);
  };

  // 4. Desmos Linear Slope & Intercept Live Animation
  const animateLinearSlope = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const isChalk = boardStyle === 'chalkboard';

    const mainColor = isChalk ? '#38bdf8' : '#2563eb';
    const accentColor = isChalk ? '#fde047' : '#ea580c';
    const textColor = isChalk ? '#ffffff' : '#0f172a';

    const originX = w * 0.42;
    const originY = h * 0.65;
    const p1 = { x: originX + 30, y: originY - 40 };
    const p2 = { x: originX + 130, y: originY - 140 };

    setActiveConceptTitle('Linear Slope & Intercept: y = mx + b');

    const actions: StrokeAction[] = [
      // Title
      {
        type: 'text',
        text: 'y = mx + b   [Slope m = Δy/Δx, y-intercept (0, b)]',
        x1: 40,
        y1: 45,
        color: textColor,
        width: 1,
        font: 'bold 15px monospace',
      },
      // Axes
      {
        type: 'vector',
        x1: 40,
        y1: originY,
        x2: w * 0.88,
        y2: originY,
        color: isChalk ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
        width: 2,
        label: 'x',
      },
      {
        type: 'vector',
        x1: originX,
        y1: h - 35,
        x2: originX,
        y2: 45,
        color: isChalk ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
        width: 2,
        label: 'y',
        labelOffset: { x: -18, y: 0 },
      },
      // Linear Line
      {
        type: 'line',
        x1: originX - 100,
        y1: originY + 90,
        x2: originX + 220,
        y2: originY - 230,
        color: mainColor,
        width: 3.5,
      },
      // Y-intercept point
      {
        type: 'point',
        cx: originX,
        cy: originY - 10,
        r: 5,
        color: '#f43f5e',
        width: 2,
        label: 'y-intercept (0, b)',
        labelOffset: { x: 10, y: 4 },
      },
      // Triangle Run Δx
      {
        type: 'line',
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p1.y,
        color: accentColor,
        width: 2,
        label: 'Run (Δx = x₂ - x₁)',
        labelOffset: { x: -50, y: 18 },
      },
      // Triangle Rise Δy
      {
        type: 'line',
        x1: p2.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        color: accentColor,
        width: 2,
        label: 'Rise (Δy = y₂ - y₁)',
        labelOffset: { x: 8, y: -20 },
      },
      // Points p1 and p2
      {
        type: 'point',
        cx: p1.x,
        cy: p1.y,
        r: 5,
        color: '#34d399',
        width: 2,
        label: '(x₁, y₁)',
        labelOffset: { x: -45, y: -8 },
      },
      {
        type: 'point',
        cx: p2.x,
        cy: p2.y,
        r: 5,
        color: '#34d399',
        width: 2,
        label: '(x₂, y₂)',
        labelOffset: { x: 10, y: 4 },
      },
      // Formula Footer
      {
        type: 'text',
        text: 'Desmos Hack: Table Regression  y₁ ~ mx₁ + b  calculates slope & intercept in 1 sec!',
        x1: 40,
        y1: h - 25,
        color: accentColor,
        width: 1,
        font: 'bold 13px monospace',
      },
    ];

    executeStrokeSequence(actions);
  };

  // 5. Calculus Derivative & Tangent Slope Animation
  const animateCalculus = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const isChalk = boardStyle === 'chalkboard';

    const mainColor = isChalk ? '#38bdf8' : '#2563eb';
    const accentColor = isChalk ? '#fde047' : '#ea580c';
    const textColor = isChalk ? '#ffffff' : '#0f172a';

    const originX = w * 0.38;
    const originY = h * 0.68;
    const tangentPointX = originX + 70;
    const tangentPointY = originY - 80;

    setActiveConceptTitle('Calculus Derivative & Tangent Line: f\'(x)');

    const actions: StrokeAction[] = [
      // Title
      {
        type: 'text',
        text: 'f\'(x) = lim_{h→0} [f(x+h) - f(x)] / h   [Instantaneous Rate of Change]',
        x1: 40,
        y1: 45,
        color: textColor,
        width: 1,
        font: 'bold 15px monospace',
      },
      // Axes
      {
        type: 'vector',
        x1: 40,
        y1: originY,
        x2: w * 0.88,
        y2: originY,
        color: isChalk ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
        width: 2,
        label: 'x',
      },
      {
        type: 'vector',
        x1: originX,
        y1: h - 35,
        x2: originX,
        y2: 45,
        color: isChalk ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
        width: 2,
        label: 'y',
        labelOffset: { x: -18, y: 0 },
      },
      // Cubic Polynomial Curve: y = f(x)
      {
        type: 'curve',
        formulaFn: (px) => {
          const dx = (px - originX) * 0.015;
          return originY - (dx * dx * dx * 18 - dx * 30);
        },
        range: [originX - 60, originX + 180],
        color: mainColor,
        width: 3.5,
      },
      // Tangent Line at Point
      {
        type: 'line',
        x1: tangentPointX - 110,
        y1: tangentPointY + 80,
        x2: tangentPointX + 110,
        y2: tangentPointY - 80,
        color: '#f43f5e',
        width: 2.5,
        label: 'Tangent Line: Slope = f\'(x₀)',
        labelOffset: { x: -40, y: -15 },
      },
      // Tangent Point of Contact
      {
        type: 'point',
        cx: tangentPointX,
        cy: tangentPointY,
        r: 6,
        color: accentColor,
        width: 2,
        label: 'Point (x₀, f(x₀))',
        labelOffset: { x: 12, y: 4 },
      },
      // Power Rule Note
      {
        type: 'text',
        text: 'Power Rule: d/dx [xⁿ] = n·xⁿ⁻¹   |   Chain Rule: d/dx [f(g(x))] = f\'(g(x)) · g\'(x)',
        x1: 40,
        y1: h - 25,
        color: accentColor,
        width: 1,
        font: 'bold 13px monospace',
      },
    ];

    executeStrokeSequence(actions);
  };

  // 6. Right Triangle & Trigonometry Live Animation
  const animateTriangle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const isChalk = boardStyle === 'chalkboard';

    const mainColor = isChalk ? '#38bdf8' : '#2563eb';
    const accentColor = isChalk ? '#fde047' : '#ea580c';
    const textColor = isChalk ? '#ffffff' : '#0f172a';

    const pA = { x: w * 0.35, y: h * 0.68 };
    const pB = { x: w * 0.68, y: h * 0.68 };
    const pC = { x: w * 0.68, y: h * 0.28 };

    setActiveConceptTitle('Right Triangle Trigonometry: a² + b² = c²');

    const actions: StrokeAction[] = [
      // Title
      {
        type: 'text',
        text: 'Pythagorean Theorem: a² + b² = c²   |   SOH - CAH - TOA',
        x1: 40,
        y1: 45,
        color: textColor,
        width: 1,
        font: 'bold 15px monospace',
      },
      // Adjacent Side a
      {
        type: 'line',
        x1: pA.x,
        y1: pA.y,
        x2: pB.x,
        y2: pB.y,
        color: mainColor,
        width: 3.5,
        label: 'Adjacent (a)',
        labelOffset: { x: -80, y: 22 },
      },
      // Opposite Side b
      {
        type: 'line',
        x1: pB.x,
        y1: pB.y,
        x2: pC.x,
        y2: pC.y,
        color: mainColor,
        width: 3.5,
        label: 'Opposite (b)',
        labelOffset: { x: 12, y: -20 },
      },
      // Hypotenuse c
      {
        type: 'line',
        x1: pA.x,
        y1: pA.y,
        x2: pC.x,
        y2: pC.y,
        color: accentColor,
        width: 4,
        label: 'Hypotenuse (c)',
        labelOffset: { x: -100, y: -15 },
      },
      // Right Angle Square Marker
      {
        type: 'line',
        x1: pB.x - 20,
        y1: pB.y,
        x2: pB.x - 20,
        y2: pB.y - 20,
        color: '#f43f5e',
        width: 2,
      },
      {
        type: 'line',
        x1: pB.x - 20,
        y1: pB.y - 20,
        x2: pB.x,
        y2: pB.y - 20,
        color: '#f43f5e',
        width: 2,
      },
      // Angle Theta Arc at A
      {
        type: 'arc',
        cx: pA.x,
        cy: pA.y,
        r: 32,
        startAngle: -Math.PI / 6,
        endAngle: 0,
        color: accentColor,
        width: 2,
      },
      {
        type: 'text',
        text: 'θ',
        x1: pA.x + 36,
        y1: pA.y - 8,
        color: accentColor,
        width: 1,
        font: 'bold 15px sans-serif',
      },
      // Formula Footer
      {
        type: 'text',
        text: 'sin θ = Opp / Hyp   |   cos θ = Adj / Hyp   |   tan θ = Opp / Adj',
        x1: 40,
        y1: h - 25,
        color: accentColor,
        width: 1,
        font: 'bold 13px monospace',
      },
    ];

    executeStrokeSequence(actions);
  };

  // 7. Grammar & Sentence Boundary Animation
  const animateGrammar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const isChalk = boardStyle === 'chalkboard';

    const mainColor = isChalk ? '#38bdf8' : '#2563eb';
    const accentColor = isChalk ? '#fde047' : '#ea580c';
    const textColor = isChalk ? '#ffffff' : '#0f172a';

    setActiveConceptTitle('Digital SAT Rhetoric & Grammar Architecture');

    const actions: StrokeAction[] = [
      // Title
      {
        type: 'text',
        text: 'SAT Sentence Boundaries & Punctuation Logic',
        x1: 40,
        y1: 45,
        color: textColor,
        width: 1,
        font: 'bold 15px monospace',
      },
      // Clause 1 Box
      {
        type: 'box',
        x1: 40,
        y1: 85,
        x2: w * 0.36,
        y2: 70,
        color: mainColor,
        width: 2,
        label: 'Independent Clause (Subject + Verb)',
      },
      // Connector
      {
        type: 'text',
        text: ', and / ; / .',
        x1: 40 + w * 0.36 + 15,
        y1: 125,
        color: accentColor,
        width: 1,
        font: 'bold 18px monospace',
      },
      // Clause 2 Box
      {
        type: 'box',
        x1: w * 0.58,
        y1: 85,
        x2: w * 0.36,
        y2: 70,
        color: mainColor,
        width: 2,
        label: 'Independent Clause (Complete Thought)',
      },
      // Trap Box
      {
        type: 'box',
        x1: 40,
        y1: 185,
        x2: w - 80,
        y2: 80,
        color: '#f43f5e',
        width: 2,
        label: '⚠️ Common Trap: Comma Splice (Joining 2 Clauses with only a comma)',
      },
      // Rule Solution
      {
        type: 'text',
        text: 'Solution: 1. Period (.)  2. Semicolon (;)  3. Comma + FANBOYS  4. Subordinate Clause',
        x1: 60,
        y1: 235,
        color: isChalk ? '#ffffff' : '#0f172a',
        width: 1,
        font: 'bold 13px sans-serif',
      },
      // Footer
      {
        type: 'text',
        text: 'Transition Words: Therefore (Cause), However (Contrast), Furthermore (Addition)',
        x1: 40,
        y1: h - 25,
        color: accentColor,
        width: 1,
        font: 'bold 13px monospace',
      },
    ];

    executeStrokeSequence(actions);
  };

  // 8. 3D Parabola Trajectory in Coordinate Space
  const animate3DParabola = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    setBoardStyle('3d_perspective');
    setActiveConceptTitle('3D Projectile Trajectory & Space Coordinate Parabola');

    const originX = w * 0.48;
    const originY = h * 0.72;

    const actions: StrokeAction[] = [
      {
        type: 'text',
        text: '3D Projectile Trajectory: r⃗(t) = ⟨v₀ cos θ · t, v₀ sin θ · t - ½gt²⟩',
        x1: 40,
        y1: 45,
        color: '#38bdf8',
        width: 1,
        font: 'bold 15px monospace',
      },
      // 3D Spatial Grid Ground Shadow Curve
      {
        type: 'curve',
        formulaFn: (px) => {
          const dx = (px - originX) * 0.035;
          return originY + 25 + dx * 14;
        },
        range: [originX - 160, originX + 160],
        color: 'rgba(56, 189, 248, 0.35)',
        width: 2,
        label: 'Ground Projection Shadow',
        labelOffset: { x: -80, y: 18 },
      },
      // 3D Parabola Flight Curve in Altitude
      {
        type: 'curve',
        formulaFn: (px) => {
          const dx = (px - originX) * 0.028;
          return originY - 140 + dx * dx * 45;
        },
        range: [originX - 150, originX + 150],
        color: '#facc15',
        width: 4,
      },
      // 3D Vertex in Space
      {
        type: 'point',
        cx: originX,
        cy: originY - 140,
        r: 7,
        color: '#f43f5e',
        width: 2,
        label: 'Peak Vertex (h, k, z_max)',
        labelOffset: { x: -65, y: -18 },
      },
      // Height Altitude Vector (Drop line to shadow)
      {
        type: 'dashed',
        x1: originX,
        y1: originY - 140,
        x2: originX,
        y2: originY + 25,
        color: '#ec4899',
        width: 2,
        label: 'Max Height: H = v_y² / (2g)',
        labelOffset: { x: 12, y: -60 },
      },
      // Launch Velocity Vector Arrow
      {
        type: 'vector',
        x1: originX - 150,
        y1: originY - 140 + (-150 * 0.028) * (-150 * 0.028) * 45,
        x2: originX - 100,
        y2: originY - 140 + (-100 * 0.028) * (-100 * 0.028) * 45 - 35,
        color: '#34d399',
        width: 3,
        label: 'Initial Velocity Vector v⃗₀',
        labelOffset: { x: -140, y: -12 },
      },
      // Footer Formula
      {
        type: 'text',
        text: 'Time of Flight: T = 2v₀ sin θ / g   |   Range: R = v₀² sin(2θ) / g',
        x1: 40,
        y1: h - 25,
        color: '#facc15',
        width: 1,
        font: 'bold 13px monospace',
      },
    ];

    executeStrokeSequence(actions);
  };

  // 9. 3D Trigonometric Helix & Spiral Wave
  const animate3DHelix = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    setBoardStyle('3d_perspective');
    setActiveConceptTitle('3D Trigonometric Helix: r⃗(t) = ⟨cos t, sin t, c·t⟩');

    const startX = w * 0.18;
    const centerY = h * 0.58;

    const actions: StrokeAction[] = [
      {
        type: 'text',
        text: '3D Spatial Wave & Helix: x = R cos(t), y = R sin(t), z = c·t',
        x1: 40,
        y1: 45,
        color: '#a855f7',
        width: 1,
        font: 'bold 15px monospace',
      },
      // Center Axis of Helix
      {
        type: 'dashed',
        x1: startX - 20,
        y1: centerY,
        x2: w * 0.85,
        y2: centerY,
        color: 'rgba(255, 255, 255, 0.4)',
        width: 2,
        label: 'Central Propagation Axis +Z',
        labelOffset: { x: -140, y: -10 },
      },
      // 3D Helix Curve
      {
        type: 'curve',
        formulaFn: (px) => {
          const t = (px - startX) * 0.045;
          const amp = 55 + Math.sin(t * 0.3) * 10;
          return centerY + Math.sin(t) * amp;
        },
        range: [startX, w * 0.82],
        color: '#38bdf8',
        width: 3.5,
      },
      // Helix Orthogonal Wave
      {
        type: 'curve',
        formulaFn: (px) => {
          const t = (px - startX) * 0.045;
          return centerY + Math.cos(t) * 35;
        },
        range: [startX, w * 0.82],
        color: '#f43f5e',
        width: 2.5,
      },
      // Tangent Velocity Vector
      {
        type: 'vector',
        x1: startX + 180,
        y1: centerY - 45,
        x2: startX + 235,
        y2: centerY - 75,
        color: '#facc15',
        width: 3,
        label: 'Velocity Vector v⃗ = dr⃗/dt',
        labelOffset: { x: -30, y: -15 },
      },
      {
        type: 'text',
        text: 'Arc Length: s = t · √(R² + c²)   |   Curvature: κ = R / (R² + c²)',
        x1: 40,
        y1: h - 25,
        color: '#38bdf8',
        width: 1,
        font: 'bold 13px monospace',
      },
    ];

    executeStrokeSequence(actions);
  };

  // 10. 3D Incline & Force Mechanics
  const animate3DPhysicsIncline = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    setBoardStyle('3d_perspective');
    setActiveConceptTitle('3D Inclined Ramp & Vector Equilibrium');

    const rampBaseX = w * 0.25;
    const rampBaseY = h * 0.72;
    const rampTopX = w * 0.75;
    const rampTopY = h * 0.38;

    const blockX = rampBaseX + (rampTopX - rampBaseX) * 0.45;
    const blockY = rampBaseY + (rampTopY - rampBaseY) * 0.45;

    const actions: StrokeAction[] = [
      {
        type: 'text',
        text: '3D Incline Dynamics: F_net = m·g·sin(θ) - f_k = m·a',
        x1: 40,
        y1: 45,
        color: '#34d399',
        width: 1,
        font: 'bold 15px monospace',
      },
      // Ramp Incline Surface
      {
        type: 'line',
        x1: rampBaseX,
        y1: rampBaseY,
        x2: rampTopX,
        y2: rampTopY,
        color: '#38bdf8',
        width: 4,
        label: 'Incline Surface (Angle θ = 30°)',
        labelOffset: { x: -140, y: -20 },
      },
      // Ramp Base Horizontal
      {
        type: 'line',
        x1: rampBaseX,
        y1: rampBaseY,
        x2: rampTopX,
        y2: rampBaseY,
        color: 'rgba(255, 255, 255, 0.4)',
        width: 2,
      },
      // Ramp Vertical Wall
      {
        type: 'line',
        x1: rampTopX,
        y1: rampBaseY,
        x2: rampTopX,
        y2: rampTopY,
        color: 'rgba(255, 255, 255, 0.4)',
        width: 2,
        label: 'Height h',
        labelOffset: { x: 10, y: -60 },
      },
      // Block on Incline
      {
        type: 'box',
        x1: blockX - 25,
        y1: blockY - 25,
        x2: 50,
        y2: 30,
        color: '#a855f7',
        width: 3,
        label: 'Mass (m)',
      },
      // Gravity Force Vector W = mg (Straight down)
      {
        type: 'vector',
        x1: blockX,
        y1: blockY,
        x2: blockX,
        y2: blockY + 85,
        color: '#f43f5e',
        width: 3,
        label: 'Gravity W = mg',
        labelOffset: { x: 8, y: -20 },
      },
      // Normal Force Vector N (Perpendicular to ramp)
      {
        type: 'vector',
        x1: blockX,
        y1: blockY,
        x2: blockX - 45,
        y2: blockY - 65,
        color: '#facc15',
        width: 3,
        label: 'Normal Force N = mg cos θ',
        labelOffset: { x: -130, y: -10 },
      },
      // Friction Force f_k (Up the ramp)
      {
        type: 'vector',
        x1: blockX,
        y1: blockY,
        x2: blockX + 55,
        y2: blockY - 38,
        color: '#fb923c',
        width: 3,
        label: 'Friction f_k = μ_k · N',
        labelOffset: { x: 10, y: -12 },
      },
      {
        type: 'text',
        text: 'Parallel: mg sin θ - f_k = ma   |   Perpendicular: N - mg cos θ = 0',
        x1: 40,
        y1: h - 25,
        color: '#34d399',
        width: 1,
        font: 'bold 13px monospace',
      },
    ];

    executeStrokeSequence(actions);
  };

  // -------------------------------------------------------------
  // TRIGGER ANIMATION ON LIVE VOICE / TRANSCRIPT STREAM
  // -------------------------------------------------------------
  useEffect(() => {
    if (!autoWriteVoice || !latestTranscript) return;

    const isModel = latestTranscript.speaker === 'model';
    if (!isModel || latestTranscript.text.length < 5) return;

    const lower = latestTranscript.text.toLowerCase();
    setCurrentSpeakingText(latestTranscript.text);

    // Auto-detect topic from speech and trigger real-time animated chalkboard drawing
    if (lower.includes('quadratic') || lower.includes('parabola') || lower.includes('vertex') || lower.includes('discriminant')) {
      animateParabola();
      addWrittenStep('Parabola & Vertex Analysis', 'f(x) = ax² + bx + c', latestTranscript.text, 'parabola');
    } else if (lower.includes('circle') || lower.includes('radius') || lower.includes('center')) {
      animateCircle();
      addWrittenStep('Circle Standard Form', '(x - h)² + (y - k)² = r²', latestTranscript.text, 'circle');
    } else if (lower.includes('force') || lower.includes('physics') || lower.includes('friction') || lower.includes('gravity') || lower.includes('newton')) {
      animatePhysicsFBD();
      addWrittenStep('Free Body Diagram (FBD)', 'ΣF = m·a', latestTranscript.text, 'physics_fbd');
    } else if (lower.includes('linear') || lower.includes('slope') || lower.includes('intercept') || lower.includes('desmos')) {
      animateLinearSlope();
      addWrittenStep('Linear Rate of Change', 'y = mx + b', latestTranscript.text, 'desmos_line');
    } else if (lower.includes('derivative') || lower.includes('calculus') || lower.includes('tangent') || lower.includes('rate of change')) {
      animateCalculus();
      addWrittenStep('Calculus Tangent & Derivative', 'f\'(x) = lim Δy/Δx', latestTranscript.text, 'calculus_tangent');
    } else if (lower.includes('triangle') || lower.includes('pythagor') || lower.includes('trigonometry') || lower.includes('sine') || lower.includes('cosine')) {
      animateTriangle();
      addWrittenStep('Trigonometry & Hypotenuse', 'a² + b² = c²', latestTranscript.text, 'triangle');
    } else if (lower.includes('grammar') || lower.includes('comma') || lower.includes('clause') || lower.includes('punctuation') || lower.includes('sentence')) {
      animateGrammar();
      addWrittenStep('Sentence Boundary Rule', 'Indep. Clause + [ , FANBOYS ] + Indep. Clause', latestTranscript.text, 'grammar_table');
    } else {
      // Dynamic chalk text writing for generic speech
      animateGenericSpeechText(latestTranscript.text);
    }
  }, [latestTranscript, autoWriteVoice]);

  const addWrittenStep = (title: string, formula: string, explanation: string, diagramType: VisualStep['diagramType']) => {
    setWrittenSteps((prev) => [
      {
        title,
        formula,
        explanation,
        diagramType,
      },
      ...prev.slice(0, 5),
    ]);
  };

  const animateGenericSpeechText = (speechText: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const isChalk = boardStyle === 'chalkboard';

    const textColor = isChalk ? '#ffffff' : '#0f172a';
    const accentColor = isChalk ? '#fde047' : '#ea580c';

    const words = speechText.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      if ((currentLine + ' ' + word).length > 55) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      }
    });
    if (currentLine) lines.push(currentLine);

    const actions: StrokeAction[] = [
      {
        type: 'text',
        text: 'Live AI Tutor Spoken Concept:',
        x1: 40,
        y1: 50,
        color: accentColor,
        width: 1,
        font: 'bold 15px sans-serif',
      },
    ];

    lines.slice(0, 6).forEach((line, idx) => {
      actions.push({
        type: 'text',
        text: line,
        x1: 45,
        y1: 90 + idx * 30,
        color: textColor,
        width: 1,
        font: '14px monospace',
      });
    });

    executeStrokeSequence(actions);
  };

  // -------------------------------------------------------------
  // STUDENT PROMPT TO WHITEBOARD HANDLER
  // -------------------------------------------------------------
  const handleStudentExplainRequest = async (overridePrompt?: string) => {
    const query = overridePrompt || studentQuestion;
    if (!query.trim()) return;

    setIsGeneratingExplanation(true);
    const lower = query.toLowerCase();

    // If live voice callback is available, send to AI tutor voice
    if (onSendVoiceMessage) {
      onSendVoiceMessage(`Explain and draw on the whiteboard: ${query}`);
    }

    // Simultaneously trigger matching animated drawing
    if (lower.includes('quadratic') || lower.includes('parabola') || lower.includes('vertex') || lower.includes('roots')) {
      animateParabola();
      addWrittenStep('Parabola Vertex & Roots', 'f(x) = ax² + bx + c', `Analyzing: ${query}`, 'parabola');
    } else if (lower.includes('circle') || lower.includes('radius') || lower.includes('center')) {
      animateCircle();
      addWrittenStep('Circle Standard Form', '(x - h)² + (y - k)² = r²', `Analyzing: ${query}`, 'circle');
    } else if (lower.includes('physics') || lower.includes('force') || lower.includes('friction') || lower.includes('newton')) {
      animatePhysicsFBD();
      addWrittenStep('Free Body Forces', 'ΣF = m·a', `Analyzing: ${query}`, 'physics_fbd');
    } else if (lower.includes('linear') || lower.includes('slope') || lower.includes('desmos')) {
      animateLinearSlope();
      addWrittenStep('Linear Rate of Change', 'y = mx + b', `Analyzing: ${query}`, 'desmos_line');
    } else if (lower.includes('derivative') || lower.includes('calculus') || lower.includes('tangent')) {
      animateCalculus();
      addWrittenStep('Calculus Tangent & Derivative', 'f\'(x) = lim Δy/Δx', `Analyzing: ${query}`, 'calculus_tangent');
    } else if (lower.includes('triangle') || lower.includes('pythagor') || lower.includes('trig')) {
      animateTriangle();
      addWrittenStep('Pythagorean Geometry', 'a² + b² = c²', `Analyzing: ${query}`, 'triangle');
    } else if (lower.includes('grammar') || lower.includes('clause') || lower.includes('comma')) {
      animateGrammar();
      addWrittenStep('Sentence Boundary Rule', 'Indep. Clause + [ , FANBOYS ] + Indep. Clause', `Analyzing: ${query}`, 'grammar_table');
    } else {
      animateParabola();
      addWrittenStep('Mathematical Derivation', 'Formula Analysis', `Explaining: ${query}`, 'generic');
    }

    setStudentQuestion('');
    setIsGeneratingExplanation(false);
  };

  // -------------------------------------------------------------
  // MANUAL DRAWING HANDLERS
  // -------------------------------------------------------------
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const saveToUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setUndoStack((prev) => [...prev.slice(-15), data]);
      setRedoStack([]);
    } catch (e) {}
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setRedoStack((prev) => [...prev, currentData]);

      const prevData = undoStack[undoStack.length - 1];
      setUndoStack((prev) => prev.slice(0, -1));
      ctx.putImageData(prevData, 0, 0);
    } catch (e) {}
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setUndoStack((prev) => [...prev, currentData]);

      const nextData = redoStack[redoStack.length - 1];
      setRedoStack((prev) => prev.slice(0, -1));
      ctx.putImageData(nextData, 0, 0);
    } catch (e) {}
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    if (activeTool === 'text') {
      setTextInputPos({ x, y });
      return;
    }

    saveToUndo();
    setIsDrawing(true);
    setStartPos({ x, y });

    try {
      setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    } catch (err) {}

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === 'eraser') {
      ctx.strokeStyle = boardStyle === 'chalkboard' ? '#0f172a' : '#ffffff';
      ctx.lineWidth = lineWidth * 6;
    } else if (activeTool === 'highlighter') {
      ctx.strokeStyle = color + '55';
      ctx.lineWidth = lineWidth * 4;
      ctx.lineCap = 'square';
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    playChalkSound(60);
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
      if (Math.random() < 0.2) playChalkSound(35);
    } else if (snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.fillStyle = color + '22';

      if (activeTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (activeTool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        const angle = Math.atan2(y - startPos.y, x - startPos.x);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 12 * Math.cos(angle - Math.PI / 6), y - 12 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x - 12 * Math.cos(angle + Math.PI / 6), y - 12 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (activeTool === 'rect') {
        ctx.fillRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else if (activeTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (activeTool === 'axes') {
        ctx.beginPath();
        ctx.moveTo(startPos.x - 120, startPos.y);
        ctx.lineTo(startPos.x + 120, startPos.y);
        ctx.moveTo(startPos.x, startPos.y - 120);
        ctx.lineTo(startPos.x, startPos.y + 120);
        ctx.stroke();
      }
    }
  };

  const endDraw = () => {
    setIsDrawing(false);
    setSnapshot(null);
  };

  const handlePlaceText = () => {
    if (!textInputPos || !textInputValue.trim()) {
      setTextInputPos(null);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveToUndo();
    ctx.fillStyle = color;
    ctx.font = 'bold 16px monospace';
    ctx.fillText(textInputValue, textInputPos.x, textInputPos.y);

    playChalkSound(90);
    setTextInputValue('');
    setTextInputPos(null);
  };

  const handleClearBoard = () => {
    saveToUndo();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawBackgroundAndGrid(canvas, ctx);
  };

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `whiteboard_lesson_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden ${
        isFullscreen ? 'fixed inset-4 z-50' : 'w-full'
      } ${className}`}
    >
      {/* Top Header & Live Speech Status Bar */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 border border-amber-400/40 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Live Whiteboard & Voice Auto-Drawing
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Synchronized Voice & Canvas</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-md">
              {activeConceptTitle}
            </p>
          </div>
        </div>

        {/* Live Speaking Indicator */}
        <div className="flex items-center space-x-2">
          {isLiveWriting && (
            <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/90 text-amber-300 border border-amber-500/60 flex items-center space-x-1.5 shadow-md shadow-amber-500/20 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Auto-Drawing: {drawingProgress}%</span>
            </div>
          )}

          {isVoiceActive ? (
            <div
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 border transition-all ${
                activeSpeaker === 'model'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-sm'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  activeSpeaker === 'model' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                }`}
              />
              <span>
                {activeSpeaker === 'model'
                  ? `AI Voice Speaking (${voiceName})`
                  : 'Voice Connected • Listening'}
              </span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>Voice Ready</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={soundEnabled ? 'Chalk Sound On' : 'Chalk Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Auto-Write Live Voice Toggle */}
          <button
            onClick={() => setAutoWriteVoice(!autoWriteVoice)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 border transition-colors cursor-pointer ${
              autoWriteVoice
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Automatically write formulas & draw diagrams on board when tutor speaks"
          >
            <Zap className={`w-3 h-3 ${autoWriteVoice ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>Auto-Write & Draw {autoWriteVoice ? 'ON' : 'OFF'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Fullscreen Canvas"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Board Arena */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950">
        {/* Left: Interactive Canvas & Toolbar */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Top Canvas Toolbar */}
          <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-10">
            {/* Theme & Tools */}
            <div className="flex items-center space-x-1.5">
              {/* Board Style Switch */}
              <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setBoardStyle('3d_perspective')}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
                    boardStyle === '3d_perspective'
                      ? 'bg-sky-500 text-slate-950 shadow'
                      : 'text-sky-300 hover:text-white'
                  }`}
                  title="3D Perspective Vanishing Plane & Space Grid"
                >
                  <Compass className="w-3 h-3" />
                  <span>3D Plane</span>
                </button>
                <button
                  onClick={() => setBoardStyle('3d_isometric')}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
                    boardStyle === '3d_isometric'
                      ? 'bg-purple-500 text-slate-950 shadow'
                      : 'text-purple-300 hover:text-white'
                  }`}
                  title="3D Isometric CAD Mesh Grid"
                >
                  <span>3D Isometric</span>
                </button>
                <button
                  onClick={() => setBoardStyle('3d_space')}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
                    boardStyle === '3d_space'
                      ? 'bg-indigo-500 text-slate-950 shadow'
                      : 'text-indigo-300 hover:text-white'
                  }`}
                  title="3D Cosmic Spatial Domain"
                >
                  <span>3D Space</span>
                </button>
                <button
                  onClick={() => setBoardStyle('chalkboard')}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
                    boardStyle === 'chalkboard'
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-amber-300 hover:text-white'
                  }`}
                  title="Classic Slate Chalkboard"
                >
                  <span>Chalk</span>
                </button>
                <button
                  onClick={() => setBoardStyle('whiteboard')}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
                    boardStyle === 'whiteboard'
                      ? 'bg-white text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Clean Smart Whiteboard"
                >
                  <span>Whiteboard</span>
                </button>
              </div>

              {/* Grid Selector */}
              <button
                onClick={() => {
                  const next: GridType =
                    gridType === 'grid'
                      ? '3d_perspective'
                      : gridType === '3d_perspective'
                      ? '3d_isometric'
                      : gridType === '3d_isometric'
                      ? 'dots'
                      : gridType === 'dots'
                      ? 'lines'
                      : gridType === 'lines'
                      ? 'none'
                      : 'grid';
                  setGridType(next);
                }}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 border border-slate-700 cursor-pointer"
                title="Toggle Canvas Grid / 3D Grid Projection"
              >
                <Grid className="w-3.5 h-3.5 text-sky-400" />
                <span className="capitalize text-[11px]">{gridType}</span>
              </button>
            </div>

            {/* Drawing Tools Icons */}
            <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTool('pen')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTool === 'pen' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Chalk / Pen"
              >
                <PenTool className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTool('highlighter')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTool === 'highlighter' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Highlighter"
              >
                <Highlighter className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTool('eraser')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTool === 'eraser' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Eraser"
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTool('line')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTool === 'line' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Straight Line"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTool('arrow')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTool === 'arrow' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Vector Arrow"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTool('rect')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTool === 'rect' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Rectangle"
              >
                <Square className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTool('circle')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTool === 'circle' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Circle"
              >
                <CircleIcon className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTool('axes')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTool === 'axes' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Cartesian Axes"
              >
                <Calculator className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTool('text')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTool === 'text' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Click to Type Formula"
              >
                <Type className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Colors & Actions */}
            <div className="flex items-center space-x-1.5">
              <div className="flex items-center space-x-1">
                {currentColorPalette.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                      color === c ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="h-4 w-px bg-slate-800 mx-1" />

              <button
                onClick={handleUndo}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Undo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleRedo}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Redo"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleClearBoard}
                className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors cursor-pointer"
                title="Clear Board"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleDownloadPNG}
                className="p-1 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 transition-colors cursor-pointer"
                title="Save Whiteboard PNG"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="relative flex-1 bg-black flex items-center justify-center select-none overflow-hidden min-h-[380px]">
            <canvas
              ref={canvasRef}
              onMouseDown={startDraw}
              onMouseMove={drawMove}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={drawMove}
              onTouchEnd={endDraw}
              className="w-full h-full cursor-crosshair touch-none"
            />

            {/* Glowing Moving Chalk Tip Indicator during Live Writing */}
            {isLiveWriting && chalkTipPos && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  left: chalkTipPos.x,
                  top: chalkTipPos.y,
                  transform: 'translate(-50%, -50%)',
                }}
                className="pointer-events-none z-20"
              >
                <div className="w-5 h-5 rounded-full bg-amber-400/80 shadow-lg shadow-amber-400 animate-ping absolute inset-0" />
                <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-400 shadow-md relative" />
              </motion.div>
            )}

            {/* Text Tool Modal Overlay */}
            {textInputPos && (
              <div
                style={{
                  position: 'absolute',
                  left: Math.min(textInputPos.x, (canvasRef.current?.width || 400) - 220),
                  top: Math.min(textInputPos.y, (canvasRef.current?.height || 400) - 80),
                }}
                className="z-30 bg-slate-900 border border-amber-400/60 p-2 rounded-xl shadow-2xl flex items-center space-x-2"
              >
                <input
                  type="text"
                  autoFocus
                  value={textInputValue}
                  onChange={(e) => setTextInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePlaceText()}
                  placeholder="Type math formula..."
                  className="bg-slate-950 text-white font-mono text-xs px-2 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handlePlaceText}
                  className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Place
                </button>
                <button
                  onClick={() => setTextInputPos(null)}
                  className="text-slate-400 hover:text-white text-xs px-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Quick Auto-Draw & Write Presets Bar */}
          <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto text-xs">
            <span className="text-[10px] uppercase font-bold text-amber-400 shrink-0 flex items-center space-x-1">
              <Play className="w-3 h-3 fill-current" />
              <span>Live Auto-Draw:</span>
            </span>

            <button
              onClick={animate3DParabola}
              className="px-2.5 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-400/60 shrink-0 font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-sm"
            >
              <Compass className="w-3 h-3 text-sky-400" />
              <span>3D Trajectory in Space</span>
            </button>

            <button
              onClick={animate3DHelix}
              className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-400/60 shrink-0 font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>3D Helix Wave</span>
            </button>

            <button
              onClick={animate3DPhysicsIncline}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-400/60 shrink-0 font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-sm"
            >
              <span>3D Incline Dynamics</span>
            </button>

            <button
              onClick={animateParabola}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-sky-950/60 text-sky-300 border border-sky-500/40 shrink-0 font-medium flex items-center space-x-1 transition-all cursor-pointer hover:border-sky-400"
            >
              <span>Parabola & Vertex</span>
            </button>

            <button
              onClick={animateCircle}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-950/60 text-amber-300 border border-amber-500/40 shrink-0 font-medium flex items-center space-x-1 transition-all cursor-pointer hover:border-amber-400"
            >
              <span>Circle Standard Form</span>
            </button>

            <button
              onClick={animatePhysicsFBD}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shrink-0 font-medium flex items-center space-x-1 transition-all cursor-pointer hover:border-emerald-400"
            >
              <span>Physics FBD Forces</span>
            </button>

            <button
              onClick={animateLinearSlope}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-950/60 text-purple-300 border border-purple-500/40 shrink-0 font-medium flex items-center space-x-1 transition-all cursor-pointer hover:border-purple-400"
            >
              <span>Desmos Linear Line</span>
            </button>

            <button
              onClick={animateCalculus}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-rose-300 border border-rose-500/40 shrink-0 font-medium flex items-center space-x-1 transition-all cursor-pointer hover:border-rose-400"
            >
              <span>Calculus Derivative</span>
            </button>

            <button
              onClick={animateTriangle}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-teal-950/60 text-teal-300 border border-teal-500/40 shrink-0 font-medium flex items-center space-x-1 transition-all cursor-pointer hover:border-teal-400"
            >
              <span>Right Triangle Trig</span>
            </button>

            <button
              onClick={animateGrammar}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-950/60 text-indigo-300 border border-indigo-500/40 shrink-0 font-medium flex items-center space-x-1 transition-all cursor-pointer hover:border-indigo-400"
            >
              <span>Grammar Clauses</span>
            </button>
          </div>
        </div>

        {/* Right Side: Step-by-Step Mathematical Derivation Feed & Prompt to Board */}
        <div className="w-full lg:w-80 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Derivation & Formulas Feed</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Live Chalk Sync
            </span>
          </div>

          {/* Student Prompt to Board Input */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400">
              Tell AI Tutor to Draw / Explain Any Concept:
            </div>
            <div className="flex space-x-1.5">
              <input
                type="text"
                value={studentQuestion}
                onChange={(e) => setStudentQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStudentExplainRequest()}
                placeholder="e.g. Draw parabola vertex proof..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => handleStudentExplainRequest()}
                disabled={isGeneratingExplanation || !studentQuestion.trim()}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 shadow-sm"
              >
                Auto-Draw
              </button>
            </div>
          </div>

          {/* Written Steps List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[300px] lg:max-h-none">
            {writtenSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1.5 shadow-sm text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-amber-400 font-bold text-[11px]">
                  <span>{step.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Step {idx + 1}</span>
                </div>

                <div className="p-1.5 bg-slate-900/90 border border-slate-800 rounded-lg font-mono text-purple-300 text-[11px]">
                  {step.formula}
                </div>

                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {step.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
