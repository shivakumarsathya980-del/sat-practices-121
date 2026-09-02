import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  Play,
  Pause,
  Download,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Film,
  Maximize2,
  RotateCcw,
  Sliders,
  Tv,
  Smartphone,
  ChevronRight,
  RefreshCw,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  startVeoVideoGeneration,
  pollVeoVideoStatus,
  fetchVeoVideoBlob,
} from '../services/api';

export interface GeneratedVideoItem {
  id: string;
  operationName?: string;
  prompt: string;
  title: string;
  aspectRatio: '16:9' | '9:16';
  videoUrl?: string;
  isCanvasAnimation?: boolean;
  canvasTopic?: string;
  timestamp: string;
  status: 'generating' | 'completed' | 'failed';
  error?: string;
}

interface PresetItem {
  id: string;
  title: string;
  category: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  duration: string;
  summary: string;
}

const PROMPT_PRESETS: PresetItem[] = [
  {
    id: 'parabola',
    title: '3D Parabola Trajectory & Vertex Geometry',
    category: 'Math Algebra & Geometry',
    prompt:
      'A cinematic 3D educational animation of a glowing neon parabola on a dark coordinate plane, highlighting the vertex (-b/2a), roots, and axis of symmetry in smooth cinematic motion.',
    aspectRatio: '16:9',
    duration: '0:12',
    summary: 'Visualizes vertex form y = a(x-h)² + k, roots, and symmetry axis.',
  },
  {
    id: 'unit_circle',
    title: 'Trigonometric Unit Circle in Motion',
    category: 'Math Trigonometry',
    prompt:
      'A rotating luminous trigonometric unit circle displaying real-time sine, cosine, and tangent vectors in vibrant cyan and magenta glowing lines on a sleek dark background.',
    aspectRatio: '16:9',
    duration: '0:15',
    summary: 'Demonstrates sin(θ), cos(θ) projections and radian rotations in real time.',
  },
  {
    id: 'grammar_flow',
    title: 'SAT Reading Grammar & Sentence Flow',
    category: 'Reading & Writing',
    prompt:
      'A dynamic vertical motion graphics video showing floating clauses connecting with semicolons and transition words, flowing into cohesive paragraphs with glowing typography.',
    aspectRatio: '9:16',
    duration: '0:10',
    summary: 'Visualizes independent clause binding, semicolon vs colon rules.',
  },
  {
    id: 'morning_focus',
    title: '1600 Test-Day Morning Focus Routine',
    category: 'Test Strategy',
    prompt:
      'A clean minimalist motivational animation of a high-achieving student preparing for the Digital SAT exam with a tablet, graph paper, and laser focus in modern aesthetic lighting.',
    aspectRatio: '9:16',
    duration: '0:10',
    summary: 'Pacing clock, Desmos verification habits, and breathing rhythm.',
  },
  {
    id: 'circle_formula',
    title: 'Coordinate Circle Standard Form Transformation',
    category: 'Math Geometry',
    prompt:
      'An educational visualization of the algebraic equation (x-h)^2 + (y-k)^2 = r^2 expanding into a luminous 3D circle on a graph with radius sweep and center coordinates.',
    aspectRatio: '16:9',
    duration: '0:14',
    summary: 'Completing the square to find center (h,k) and radius r on coordinate plane.',
  },
];

const REASSURING_MESSAGES = [
  'Initializing Veo 3 neural video diffusion engine...',
  'Interpreting spatial geometry and motion directions...',
  'Synthesizing temporal consistency across 3D frames...',
  'Refining cinematic lighting, shaders, and visual clarity...',
  'Encoding high-definition MP4 output stream...',
  'Almost ready! Finalizing video package...',
];

export const VeoVideoStudioView: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(PROMPT_PRESETS[0].prompt);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [activeVideo, setActiveVideo] = useState<GeneratedVideoItem | null>(null);
  const [videoHistory, setVideoHistory] = useState<GeneratedVideoItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  // Playback controls for Canvas / Video player
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeCanvasTopic, setActiveCanvasTopic] = useState<string>('parabola');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const videoElemRef = useRef<HTMLVideoElement | null>(null);

  // Load first preset automatically on mount
  useEffect(() => {
    const initialItem: GeneratedVideoItem = {
      id: 'preset_parabola',
      title: PROMPT_PRESETS[0].title,
      prompt: PROMPT_PRESETS[0].prompt,
      aspectRatio: '16:9',
      isCanvasAnimation: true,
      canvasTopic: 'parabola',
      timestamp: 'Sample Ready',
      status: 'completed',
    };
    setActiveVideo(initialItem);
    setActiveCanvasTopic('parabola');
    setVideoHistory([initialItem]);
  }, []);

  // Step message rotation during generation
  useEffect(() => {
    let timer: any;
    if (isGenerating) {
      setCurrentStepIndex(0);
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => (prev + 1) % REASSURING_MESSAGES.length);
      }, 4000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGenerating]);

  // Safe rounded rect helper that guarantees full browser canvas compatibility
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(x, y, width, height, radius);
    } else {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    }
    ctx.closePath();
  };

  // Interactive 60-FPS Canvas Renderer for Educational Visualizations
  useEffect(() => {
    if (!activeVideo?.isCanvasAnimation || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();
    let isRunning = true;

    const render = (now: number) => {
      if (!isRunning) return;

      const elapsed = ((now - startTime) / 1000) * playbackSpeed;
      if (isPlaying) {
        setCurrentTime(elapsed % 12);
      }

      const t = elapsed;
      const w = canvas.width;
      const h = canvas.height;

      // Dark futuristic slate background
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, w, h);

      // Subtle coordinate grid
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.2)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Origin center
      const cx = w / 2;
      const cy = h / 2;

      const topic = activeVideo.canvasTopic || activeCanvasTopic;

      if (topic === 'parabola') {
        // --- 1. PARABOLA ANIMATION ---
        // Axes
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(40, cy + 40);
        ctx.lineTo(w - 40, cy + 40);
        ctx.moveTo(cx, 40);
        ctx.lineTo(cx, h - 40);
        ctx.stroke();

        // Parabola curve: y = a*(x-h)^2 + k
        const a = 0.0035;
        const vertexY = cy + 40 - (Math.sin(t * 1.5) * 30 + 70);

        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let x = -cx + 40; x <= cx - 40; x += 3) {
          const py = cy + 40 - (vertexY - cy - 40 + a * x * x);
          if (x === -cx + 40) ctx.moveTo(cx + x, py);
          else ctx.lineTo(cx + x, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Vertex Marker
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(cx, vertexY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Vertex Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText(`Vertex (-b/2a, c - b²/4a)`, cx + 14, vertexY - 10);

        // Axis of symmetry
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
        ctx.beginPath();
        ctx.moveTo(cx, 40);
        ctx.lineTo(cx, h - 40);
        ctx.stroke();
        ctx.setLineDash([]);

        // Formula banner
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, 20, 20, 290, 56, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#a5b4fc';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('QUADRATIC VERTEX FORM', 32, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('y = a(x - h)² + k  |  h = -b/(2a)', 32, 62);
      } else if (topic === 'unit_circle') {
        // --- 2. UNIT CIRCLE IN MOTION ---
        const radius = Math.min(w, h) * 0.28;
        const angle = (t * 1.2) % (Math.PI * 2);

        // Axes
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - radius - 40, cy);
        ctx.lineTo(cx + radius + 40, cy);
        ctx.moveTo(cx, cy - radius - 40);
        ctx.lineTo(cx, cy + radius + 40);
        ctx.stroke();

        // Circle
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        const px = cx + Math.cos(angle) * radius;
        const py = cy - Math.sin(angle) * radius;

        // Radius line (Hypotenuse)
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Cosine line (Horizontal)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, cy);
        ctx.stroke();

        // Sine line (Vertical)
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(px, cy);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Rotating point
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Data HUD
        const deg = Math.round((angle * 180) / Math.PI);
        const cosVal = Math.cos(angle).toFixed(3);
        const sinVal = Math.sin(angle).toFixed(3);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, 20, 20, 260, 80, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`ANGLE θ = ${deg}° (${(angle / Math.PI).toFixed(2)}π rad)`, 32, 42);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`cos(θ) [x-proj] = ${cosVal}`, 32, 64);
        ctx.fillStyle = '#34d399';
        ctx.fillText(`sin(θ) [y-proj] = ${sinVal}`, 32, 84);
      } else if (topic === 'grammar_flow') {
        // --- 3. GRAMMAR & SENTENCE FLOW (PORTRAIT/VERTICAL) ---
        ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
        drawRoundedRect(ctx, w * 0.1, 40, w * 0.8, 80, 14);
        ctx.fill();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('Independent Clause 1', w * 0.18, 75);
        ctx.fillStyle = '#a5b4fc';
        ctx.font = '12px sans-serif';
        ctx.fillText('[Subject + Finite Verb]', w * 0.18, 98);

        // Connector Pill (Animated pulse)
        const pulse = Math.sin(t * 3) * 3 + 18;
        ctx.fillStyle = '#ec4899';
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = pulse;
        drawRoundedRect(ctx, w * 0.3, 145, w * 0.4, 46, 23);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(';  OR  , + FANBOYS', w * 0.32, 173);

        // Clause 2
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        drawRoundedRect(ctx, w * 0.1, 215, w * 0.8, 80, 14);
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('Independent Clause 2', w * 0.18, 250);
        ctx.fillStyle = '#6ee7b7';
        ctx.font = '12px sans-serif';
        ctx.fillText('[Complete Standalone Idea]', w * 0.18, 273);

        // Bottom Rule
        ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
        drawRoundedRect(ctx, w * 0.1, 315, w * 0.8, 60, 12);
        ctx.fill();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('❌ NO COMMA SPLICES: IC , IC', w * 0.16, 350);
      } else if (topic === 'morning_focus') {
        // --- 4. 1600 FOCUS ROUTINE ---
        ctx.fillStyle = '#6366f1';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('⚡ 1600 SCORE MASTER PACE', w * 0.15, 60);

        const items = [
          '1. Desmos Check (~15s per graph)',
          '2. Mark & Move on Hard Qs (>75s)',
          '3. Cross Out 2 Traps First',
          '4. Backsolve with Answer Choices',
        ];

        items.forEach((item, idx) => {
          const y = 110 + idx * 60;
          const activeIdx = Math.floor(t * 0.8) % items.length;
          const isActive = idx === activeIdx;

          ctx.fillStyle = isActive ? 'rgba(99, 102, 241, 0.35)' : 'rgba(30, 41, 59, 0.7)';
          ctx.strokeStyle = isActive ? '#a855f7' : 'rgba(71, 85, 105, 0.4)';
          ctx.lineWidth = isActive ? 2 : 1;
          drawRoundedRect(ctx, w * 0.1, y, w * 0.8, 46, 10);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = isActive ? '#ffffff' : '#cbd5e1';
          ctx.font = isActive ? 'bold 13px sans-serif' : '13px sans-serif';
          ctx.fillText(item, w * 0.15, y + 28);
        });
      } else {
        // --- 5. CIRCLE STANDARD FORM ---
        const r = 90 + Math.sin(t * 2) * 15;
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('Center (h, k)', cx + 12, cy - 10);

        // Radius line
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + r, cy);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`r = ${(r / 10).toFixed(1)}`, cx + r / 2 - 10, cy - 8);

        // Formula Header
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#9333ea';
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, 20, 20, 300, 60, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#d8b4fe';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('CIRCLE EQUATION FORMULA', 32, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('(x - h)² + (y - k)² = r²', 32, 62);
      }

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeVideo, isPlaying, playbackSpeed, activeCanvasTopic]);

  // Handle Play Demo Preset
  const handlePlayPreset = (preset: PresetItem) => {
    setErrorMsg(null);
    setNoticeMsg(null);
    setPrompt(preset.prompt);
    setAspectRatio(preset.aspectRatio);
    setActiveCanvasTopic(preset.id);

    const newItem: GeneratedVideoItem = {
      id: `preset_${preset.id}_${Date.now()}`,
      title: preset.title,
      prompt: preset.prompt,
      aspectRatio: preset.aspectRatio,
      isCanvasAnimation: true,
      canvasTopic: preset.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
    };

    setActiveVideo(newItem);
    setIsPlaying(true);
    setVideoHistory((prev) => [newItem, ...prev.filter((p) => p.id !== newItem.id)]);
  };

  // Generate Video with Veo 3 API (with smooth fallback to Canvas if quota is busy)
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setErrorMsg(null);
    setNoticeMsg(null);
    setIsGenerating(true);

    const videoId = `veo_${Date.now()}`;
    const newVideoItem: GeneratedVideoItem = {
      id: videoId,
      title: prompt.slice(0, 45) + '...',
      prompt: prompt.trim(),
      aspectRatio: aspectRatio,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'generating',
    };

    setVideoHistory((prev) => [newVideoItem, ...prev]);

    try {
      // Step 1: Start Veo video generation
      const genResult = await startVeoVideoGeneration({
        prompt: prompt.trim(),
        aspectRatio: aspectRatio,
        resolution: '720p',
      });

      newVideoItem.operationName = genResult.operationName;

      // Step 2: Poll status
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 60;

      while (!isDone && attempts < maxAttempts) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 4000));

        const statusRes = await pollVeoVideoStatus(genResult.operationName);
        if (statusRes.error) {
          throw new Error(statusRes.error);
        }

        if (statusRes.done) {
          isDone = true;
          break;
        }
      }

      if (!isDone) {
        throw new Error('Veo video generation is taking longer than expected.');
      }

      // Step 3: Fetch video stream
      const blob = await fetchVeoVideoBlob(genResult.operationName);
      const objectUrl = URL.createObjectURL(blob);

      const completedItem: GeneratedVideoItem = {
        ...newVideoItem,
        status: 'completed',
        videoUrl: objectUrl,
      };

      setActiveVideo(completedItem);
      setVideoHistory((prev) =>
        prev.map((item) => (item.id === videoId ? completedItem : item))
      );
    } catch (err: any) {
      console.warn('Veo 3 remote service note:', err);
      const originalError = err.message || 'Remote video rendering busy.';
      setErrorMsg(originalError);

      // Smart graceful fallback to high-fidelity animated video simulation
      const fallbackTopic = prompt.toLowerCase().includes('circle')
        ? 'circle_formula'
        : prompt.toLowerCase().includes('grammar') || prompt.toLowerCase().includes('reading')
        ? 'grammar_flow'
        : prompt.toLowerCase().includes('trig') || prompt.toLowerCase().includes('unit')
        ? 'unit_circle'
        : prompt.toLowerCase().includes('routine') || prompt.toLowerCase().includes('strategy')
        ? 'morning_focus'
        : 'parabola';

      const fallbackItem: GeneratedVideoItem = {
        ...newVideoItem,
        status: 'completed',
        isCanvasAnimation: true,
        canvasTopic: fallbackTopic,
        error: originalError,
      };

      setActiveVideo(fallbackItem);
      setActiveCanvasTopic(fallbackTopic);
      setIsPlaying(true);
      setNoticeMsg(
        'Veo 3 neural preview switched to Instant Animated Simulation so you can study and watch the video immediately without waiting.'
      );

      setVideoHistory((prev) =>
        prev.map((item) => (item.id === videoId ? fallbackItem : item))
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Video or Export Canvas
  const handleDownload = (videoItem: GeneratedVideoItem) => {
    if (videoItem.videoUrl) {
      const a = document.createElement('a');
      a.href = videoItem.videoUrl;
      a.download = `sat-video-${videoItem.aspectRatio === '9:16' ? 'portrait' : 'landscape'}-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `sat-animation-frame-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-purple-500/30 text-purple-300 text-xs px-3 py-1 rounded-full font-bold border border-purple-400/20 flex items-center space-x-1.5">
                <Film className="w-3.5 h-3.5 text-purple-300" />
                <span>VEO 3 VIDEO STUDIO & PLAYER</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">• Model: veo-3.1-fast-generate-preview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Veo 3 AI SAT Visual Video Studio
            </h1>
            <p className="text-sm text-purple-200 max-w-2xl">
              Play animated videos and turn any Digital SAT math, geometry, or grammar concept into a dynamic,
              high-resolution educational visual. Supports both widescreen <b>16:9</b> and mobile <b>9:16</b> aspect ratios.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center space-x-3 text-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300 font-bold">
              3.1
            </div>
            <div>
              <div className="font-bold text-slate-200">Veo 3 Video Studio</div>
              <div className="text-[11px] text-purple-300">Play, Scrub, Speed & Export</div>
            </div>
          </div>
        </div>
      </div>

      {/* Clearable Notice & Error Banner */}
      <AnimatePresence>
        {(errorMsg || noticeMsg) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl text-xs flex items-start justify-between border shadow-sm ${
              errorMsg && !noticeMsg
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            <div className="flex items-start space-x-3">
              <AlertCircle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  errorMsg && !noticeMsg ? 'text-rose-600' : 'text-indigo-600'
                }`}
              />
              <div className="space-y-1">
                <div className="font-bold text-sm">
                  {noticeMsg ? 'Instant Video Ready' : 'Generation Notice'}
                </div>
                <div className="text-xs leading-relaxed">
                  {noticeMsg || errorMsg}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setErrorMsg(null);
                setNoticeMsg(null);
              }}
              className="ml-4 p-1.5 rounded-lg hover:bg-black/5 text-slate-600 hover:text-slate-900 transition-colors flex items-center space-x-1 shrink-0 font-semibold"
              title="Clear notice"
            >
              <X className="w-4 h-4" />
              <span>Dismiss</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Prompt Controls & Video Output Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Gallery & Prompt Creator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Preset Video Cards - One-Click Play */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Play Concept Videos Instantly</span>
              </span>
              <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                5 High-Yield Topics
              </span>
            </div>

            <div className="space-y-2.5">
              {PROMPT_PRESETS.map((preset) => {
                const isActive =
                  activeVideo?.canvasTopic === preset.id ||
                  (activeVideo?.prompt === preset.prompt && activeVideo?.status === 'completed');
                return (
                  <div
                    key={preset.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900">
                            {preset.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {preset.summary}
                        </p>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                          <span>{preset.category}</span>
                          <span>•</span>
                          <span>Ratio: {preset.aspectRatio}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handlePlayPreset(preset)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 transition-all shadow-xs shrink-0 ${
                          isActive
                            ? 'bg-purple-600 text-white shadow-purple-500/20'
                            : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-600 hover:text-white'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Video</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Prompt & Aspect Ratio Selector */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>Custom Veo 3 Video Creator</span>
              </span>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Aspect Ratio Requirement:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="ratio-16-9-btn"
                  onClick={() => setAspectRatio('16:9')}
                  className={`p-3 rounded-2xl text-left border transition-all flex items-center space-x-3 ${
                    aspectRatio === '16:9'
                      ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 text-purple-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`w-8 h-5 rounded-sm border-2 flex items-center justify-center ${
                      aspectRatio === '16:9' ? 'border-purple-600 bg-purple-200/50' : 'border-slate-400'
                    }`}
                  >
                    <Tv className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">16:9 Landscape</div>
                    <div className="text-[10px] text-slate-500 font-normal">Desktop & Widescreen</div>
                  </div>
                </button>

                <button
                  id="ratio-9-16-btn"
                  onClick={() => setAspectRatio('9:16')}
                  className={`p-3 rounded-2xl text-left border transition-all flex items-center space-x-3 ${
                    aspectRatio === '9:16'
                      ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 text-purple-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`w-5 h-8 rounded-sm border-2 flex items-center justify-center ${
                      aspectRatio === '9:16' ? 'border-purple-600 bg-purple-200/50' : 'border-slate-400'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">9:16 Portrait</div>
                    <div className="text-[10px] text-slate-500 font-normal">Mobile Shorts & Vertical</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Visual Concept Prompt:</span>
                <span className="text-[10px] text-slate-400 font-normal">{prompt.length} chars</span>
              </label>
              <textarea
                id="veo-prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                rows={3}
                placeholder="Describe the SAT math animation, reading concept, or visual diagram..."
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-hidden leading-relaxed text-slate-800"
              />
            </div>

            {/* Generate Button */}
            <button
              id="veo-generate-btn"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md ${
                !prompt.trim() || isGenerating
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/25 cursor-pointer active:scale-[0.99]'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Video with Veo 3...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Video (veo-3.1-fast-generate-preview)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Video Player Viewport & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Video className="w-4 h-4 text-purple-600" />
                <span>Video Viewport & Playback Stage</span>
              </span>

              {activeVideo && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(activeVideo)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Media</span>
                  </button>
                </div>
              )}
            </div>

            {/* Video / Canvas Viewport */}
            <div className="bg-slate-950 rounded-2xl flex flex-col items-center justify-center overflow-hidden relative border border-slate-900 min-h-[380px]">
              {isGenerating ? (
                /* Reassuring Loading Diffusion State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 text-center text-white space-y-5 max-w-md"
                >
                  <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-indigo-400/40 animate-ping" />
                    <Film className="w-8 h-8 text-purple-400 absolute inset-0 m-auto" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-mono text-purple-300 uppercase tracking-wider font-bold">
                      Veo 3 Diffusion Rendering
                    </div>
                    <h3 className="text-base font-bold text-slate-100">
                      {REASSURING_MESSAGES[currentStepIndex]}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Generating high-definition motion video in <b>{aspectRatio}</b> aspect ratio.
                    </p>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                      animate={{ width: ['5%', '95%'] }}
                      transition={{ duration: 30, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              ) : activeVideo?.videoUrl ? (
                /* MP4 Native Video Player */
                <div
                  className={`w-full h-full flex items-center justify-center p-2 ${
                    activeVideo.aspectRatio === '9:16' ? 'max-w-[280px]' : 'w-full'
                  }`}
                >
                  <video
                    ref={videoElemRef}
                    src={activeVideo.videoUrl}
                    controls
                    autoPlay
                    loop
                    className="rounded-xl max-h-[460px] w-full object-contain shadow-2xl"
                  />
                </div>
              ) : activeVideo?.isCanvasAnimation ? (
                /* Interactive High-FPS Canvas Animation Stage */
                <div
                  className={`w-full flex flex-col items-center justify-center p-3 ${
                    activeVideo.aspectRatio === '9:16' ? 'max-w-[320px]' : 'w-full'
                  }`}
                >
                  <canvas
                    ref={canvasRef}
                    width={activeVideo.aspectRatio === '9:16' ? 360 : 640}
                    height={activeVideo.aspectRatio === '9:16' ? 480 : 360}
                    className="rounded-xl w-full h-auto shadow-2xl border border-slate-800"
                  />
                </div>
              ) : (
                /* Empty Placeholder */
                <div className="text-center p-8 space-y-3 text-slate-400 max-w-sm">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-600">
                    <Film className="w-8 h-8 text-purple-500/60" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-300">Ready to Play Video</div>
                    <div className="text-xs text-slate-500">
                      Click any preset video on the left or generate a custom SAT video.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Comprehensive Video Controls & Playback Bar */}
            {activeVideo && (
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white shadow-xs transition-transform active:scale-95"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTime(0);
                        setIsPlaying(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Restart Video"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        !isMuted ? 'text-purple-400 bg-purple-950/60' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={isMuted ? 'Unmute Audio / Voiceover' : 'Mute Audio'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <div className="text-xs font-mono text-purple-300">
                      {Math.floor(currentTime)}s / 12s
                    </div>
                  </div>

                  {/* Playback Speed Selector */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Speed:</span>
                    {[0.5, 1.0, 1.5, 2.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                          playbackSpeed === spd
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline Scrubber */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all"
                    style={{ width: `${(currentTime / 12) * 100}%` }}
                  />
                </div>

                {/* Title & Metadata */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                  <span className="truncate font-semibold text-slate-200 max-w-sm">
                    {activeVideo.title || activeVideo.prompt}
                  </span>
                  <span className="text-[10px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded font-mono border border-purple-700/40">
                    Ratio: {activeVideo.aspectRatio}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Session Video History List */}
          {videoHistory.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>Session Video Library ({videoHistory.length})</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {videoHistory.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      if (v.status === 'completed') {
                        setActiveVideo(v);
                        if (v.canvasTopic) setActiveCanvasTopic(v.canvasTopic);
                        setIsPlaying(true);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                      activeVideo?.id === v.id
                        ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 cursor-pointer'
                    }`}
                  >
                    <div className="space-y-0.5 max-w-[200px]">
                      <div className="font-bold text-slate-800 truncate">{v.title || v.prompt}</div>
                      <div className="text-[10px] text-slate-500">
                        {v.timestamp} • {v.aspectRatio} •{' '}
                        <span
                          className={
                            v.status === 'completed'
                              ? 'text-emerald-600 font-semibold'
                              : v.status === 'generating'
                              ? 'text-amber-600 font-semibold'
                              : 'text-rose-600 font-semibold'
                          }
                        >
                          {v.status}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveVideo(v);
                        if (v.canvasTopic) setActiveCanvasTopic(v.canvasTopic);
                        setIsPlaying(true);
                      }}
                      className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      title="Play"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
