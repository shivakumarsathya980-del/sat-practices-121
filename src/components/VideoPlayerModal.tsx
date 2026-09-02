import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Clock,
  Award,
  ChevronRight,
  ListOrdered,
  FileText,
  Edit3,
  Check,
  Zap,
  ExternalLink,
  HelpCircle,
  Share2,
  Layers,
  Activity,
  Sliders,
  Tv,
  ArrowRight,
  RefreshCw,
  PenTool,
  Eraser,
  Download,
  Flame,
  Settings,
  Compass,
  Cpu,
} from 'lucide-react';
import { CourseLesson, Course } from '../types';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  lesson: CourseLesson;
  onSelectLesson: (lesson: CourseLesson) => void;
  onCompleteLesson: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  course,
  lesson,
  onSelectLesson,
  onCompleteLesson,
}) => {
  // Player Playback States
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isAudioNarrating, setIsAudioNarrating] = useState<boolean>(false);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [videoQuality, setVideoQuality] = useState<'4k' | '1080p' | 'sim'>('4k');
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);

  // Sidebar Tabs State
  const [activeTab, setActiveTab] = useState<'chapters' | 'transcript' | 'notes' | 'quiz' | 'scratchpad'>('chapters');
  const [notesText, setNotesText] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<{ id: string; time: string; text: string }[]>([]);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [currentChapterIdx, setCurrentChapterIdx] = useState<number>(0);

  // Interactive Simulation Controls
  const [simSliderValue, setSimSliderValue] = useState<number>(3);
  const [simQuadA, setSimQuadA] = useState<number>(1);
  const [simQuadH, setSimQuadH] = useState<number>(2);
  const [simQuadK, setSimQuadK] = useState<number>(-4);
  const [simModule1Correct, setSimModule1Correct] = useState<number>(22);

  // Scratchpad Canvas Refs
  const scratchpadRef = useRef<HTMLCanvasElement | null>(null);
  const isScratchDrawing = useRef<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalDurationSec = 18 * 60; // 18 minutes normalized masterclass duration

  // Auto-play timer
  useEffect(() => {
    if (isOpen && isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= totalDurationSec) {
            setIsPlaying(false);
            return totalDurationSec;
          }
          return prev + 1 * playbackSpeed;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying, playbackSpeed, totalDurationSec]);

  // Update active chapter based on current time
  useEffect(() => {
    if (lesson.chapters && lesson.chapters.length > 0) {
      for (let i = lesson.chapters.length - 1; i >= 0; i--) {
        if (currentTimeSec >= (lesson.chapters[i].timeSeconds || 0)) {
          setCurrentChapterIdx(i);
          break;
        }
      }
    }
  }, [currentTimeSec, lesson.chapters]);

  // Handle Speech Narration
  const toggleSpeechNarration = () => {
    if (!('speechSynthesis' in window)) return;

    if (isAudioNarrating) {
      window.speechSynthesis.cancel();
      setIsAudioNarrating(false);
    } else {
      window.speechSynthesis.cancel();
      const currentChapter = lesson.chapters?.[currentChapterIdx];
      const activeTranscript = lesson.transcript?.[currentChapterIdx]?.text || lesson.summary;
      const textToSpeak = `${lesson.title}. Chapter: ${currentChapter?.title || 'Overview'}. ${activeTranscript}`;
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.02 * playbackSpeed;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsAudioNarrating(false);
      utterance.onerror = () => setIsAudioNarrating(false);

      window.speechSynthesis.speak(utterance);
      setIsAudioNarrating(true);
    }
  };

  // Clean up speech on close
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddNote = () => {
    if (!notesText.trim()) return;
    const timeMark = formatTime(currentTimeSec);
    setSavedNotes((prev) => [
      ...prev,
      { id: `note_${Date.now()}`, time: timeMark, text: notesText.trim() },
    ]);
    setNotesText('');
  };

  const handleExportNotes = () => {
    if (savedNotes.length === 0) return;
    const content = `MASTERCLASS LECTURE NOTES\nLesson: ${lesson.title}\nCourse: ${course.title}\n\n` +
      savedNotes.map((n) => `[${n.time}] ${n.text}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${lesson.title.replace(/[^a-zA-Z0-9]/g, '_')}_notes.txt`;
    link.click();
  };

  const handleSeek = (newSec: number) => {
    setCurrentTimeSec(Math.min(totalDurationSec, Math.max(0, newSec)));
  };

  const currentChapter = lesson.chapters?.[currentChapterIdx] || {
    title: 'Masterclass Theory & Problem Solving',
    timeDisplay: '00:00',
    timeSeconds: 0,
  };

  // Determine lesson visual topic
  const isAdaptiveScoring = lesson.id === 'l_1_1' || lesson.title.includes('Adaptive');
  const isDesmosLesson = lesson.id === 'l_1_2' || lesson.title.includes('Desmos');
  const isQuadraticsLesson = lesson.id === 'l_2_1' || lesson.title.includes('Vertex') || lesson.title.includes('Quadratic');
  const isCircleLesson = lesson.id === 'lm_1' || lesson.title.includes('Circle');

  // Scratchpad drawing handlers
  const startScratch = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = scratchpadRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    isScratchDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawScratch = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratchDrawing.current) return;
    const canvas = scratchpadRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopScratch = () => {
    isScratchDrawing.current = false;
  };

  const clearScratch = () => {
    const canvas = scratchpadRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
            isTheaterMode ? 'w-full max-w-7xl h-[95vh]' : 'w-full max-w-5xl h-[90vh]'
          }`}
        >
          {/* Top Masterclass Header Bar */}
          <div className="px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/40 text-white flex items-center justify-center shrink-0 shadow-md">
                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>STUDIO ULTRA-HD • 60FPS</span>
                  </span>
                  <span className="text-xs text-slate-400 truncate hidden sm:inline">{course.title}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">{lesson.title}</h3>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {/* Quality Switcher */}
              <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[11px]">
                <button
                  onClick={() => setVideoQuality('4k')}
                  className={`px-2 py-1 rounded font-bold transition-colors cursor-pointer ${
                    videoQuality === '4k' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  4K Studio
                </button>
                <button
                  onClick={() => setVideoQuality('1080p')}
                  className={`px-2 py-1 rounded font-bold transition-colors cursor-pointer ${
                    videoQuality === '1080p' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1080p 60FPS
                </button>
                <button
                  onClick={() => setVideoQuality('sim')}
                  className={`px-2 py-1 rounded font-bold transition-colors cursor-pointer ${
                    videoQuality === 'sim' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Interactive Sim
                </button>
              </div>

              {/* Theater Mode Toggle */}
              <button
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Toggle Theater Mode"
              >
                {isTheaterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isTheaterMode ? 'Standard' : 'Theater'}</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Main Video Arena: Left Video + Controls, Right Tabs Sidebar */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left: Video Player Embed & Interactive Simulation Stage */}
            <div className="flex-1 flex flex-col bg-black overflow-y-auto">
              {/* Responsive 16:9 Video Canvas / Stage */}
              <div className="relative w-full aspect-video bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none border-b border-slate-800">
                {/* Background Ambient Grid & Particles */}
                <div className="absolute inset-0 bg-sat-grid opacity-30 pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Lecture Overlay Header */}
                <div className="w-full flex items-center justify-between z-20">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                      Chapter {currentChapterIdx + 1}: {currentChapter.title}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Scratchpad Toggle Button */}
                    <button
                      onClick={() => setShowScratchpad(!showScratchpad)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                        showScratchpad
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                          : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title="Draw directly over video lecture"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>{showScratchpad ? 'Scratchpad ON' : 'Draw on Video'}</span>
                    </button>

                    {/* Speech Narration Button */}
                    <button
                      onClick={toggleSpeechNarration}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                        isAudioNarrating
                          ? 'bg-purple-600 text-white border-purple-400 shadow-sm animate-pulse'
                          : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title="Audio voice explanation"
                    >
                      {isAudioNarrating ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span>{isAudioNarrating ? 'Voice Active' : 'Listen Voice'}</span>
                    </button>

                    <div className="bg-slate-950/90 border border-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-mono text-purple-300 font-bold shadow-xs">
                      {formatTime(currentTimeSec)} / {formatTime(totalDurationSec)}
                    </div>
                  </div>
                </div>

                {/* Center Dynamic Visual Simulation per Lesson */}
                <div className="w-full max-w-2xl my-auto z-10">
                  {/* 1. Adaptive Scoring Branching Tree Simulation */}
                  {isAdaptiveScoring && (
                    <div className="bg-slate-950/85 border border-indigo-500/40 rounded-2xl p-5 backdrop-blur-md space-y-4 shadow-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Interactive Multistage Adaptive Routing Engine
                          </span>
                        </div>
                        <span className="text-xs font-mono text-indigo-300 font-bold bg-indigo-950 px-2 py-0.5 rounded border border-indigo-500/30">
                          Threshold: ≥ 18 / 27 Correct
                        </span>
                      </div>

                      {/* Interactive Routing Flowchart */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        {/* Module 1 Box */}
                        <div className="sm:col-span-5 bg-slate-900 border border-indigo-500/50 p-3.5 rounded-xl space-y-2 text-center shadow-md">
                          <div className="text-[11px] font-bold text-indigo-300 uppercase">Module 1 (27 Questions)</div>
                          <div className="text-xl font-black text-white">{simModule1Correct} / 27 Correct</div>
                          <input
                            type="range"
                            min="0"
                            max="27"
                            value={simModule1Correct}
                            onChange={(e) => setSimModule1Correct(Number(e.target.value))}
                            className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                          />
                          <div className="text-[10px] text-slate-400">Drag slider to test adaptive routing</div>
                        </div>

                        <div className="sm:col-span-2 flex justify-center">
                          <ArrowRight className="w-6 h-6 text-indigo-400 animate-pulse hidden sm:block" />
                        </div>

                        {/* Module 2 Routing Outcome */}
                        <div className="sm:col-span-5 space-y-2">
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              simModule1Correct >= 18
                                ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/30 text-white shadow-lg'
                                : 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span>HARD Module 2 (Target 800)</span>
                              <span className="text-emerald-400 font-mono">600–800 Score</span>
                            </div>
                            <div className="text-[11px] text-slate-300 mt-1">
                              {simModule1Correct >= 18 ? '✓ UNLOCKED (Eligible for 750+ score)' : 'Requires ≥ 18 correct'}
                            </div>
                          </div>

                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              simModule1Correct < 18
                                ? 'bg-amber-950/70 border-amber-500 ring-2 ring-amber-500/30 text-white shadow-lg'
                                : 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span>EASY Module 2 (Capped)</span>
                              <span className="text-amber-400 font-mono">200–590 Cap</span>
                            </div>
                            <div className="text-[11px] text-slate-300 mt-1">
                              {simModule1Correct < 18 ? '⚠️ Scaled score capped near 590' : 'Bypassed with high accuracy'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Desmos & Linear Equations Simulation */}
                  {isDesmosLesson && (
                    <div className="bg-slate-950/85 border border-purple-500/40 rounded-2xl p-5 backdrop-blur-md space-y-3 shadow-2xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Desmos Parameter Slider: y = 2x + {simSliderValue}</span>
                        </span>
                        <span className="text-xs font-mono text-amber-300 font-bold bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30">
                          Intercept (0, {simSliderValue})
                        </span>
                      </div>

                      <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex items-center justify-center h-36 relative overflow-hidden">
                        {/* Simulated coordinate plane */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-slate-700" />
                          <div className="h-full w-0.5 bg-slate-700 absolute" />
                        </div>
                        {/* Dynamic Line */}
                        <motion.div
                          className="w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-400 to-amber-400 absolute"
                          style={{
                            transform: `rotate(-25deg) translateY(${-simSliderValue * 8}px)`,
                          }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        />
                        <div className="z-10 bg-slate-950/90 border border-purple-500/40 px-3 py-1.5 rounded-xl text-xs font-mono text-white shadow-md">
                          Intersection Point: (0, {simSliderValue}) • Slope m = 2
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-[11px] text-slate-400">Parameter Slider (b):</span>
                        <input
                          type="range"
                          min="-5"
                          max="10"
                          value={simSliderValue}
                          onChange={(e) => setSimSliderValue(Number(e.target.value))}
                          className="flex-1 accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. Quadratic Vertex & Discriminant Simulation */}
                  {isQuadraticsLesson && (
                    <div className="bg-slate-950/85 border border-emerald-500/40 rounded-2xl p-5 backdrop-blur-md space-y-3 shadow-2xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                          Parabola Vertex & Discriminant Form: y = a(x - h)² + k
                        </span>
                        <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                          Vertex: ({simQuadH}, {simQuadK})
                        </span>
                      </div>

                      <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex items-center justify-center h-36 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-slate-700" />
                          <div className="h-full w-0.5 bg-slate-700 absolute" />
                        </div>
                        {/* Dynamic Parabola Visual Curve */}
                        <svg className="w-full h-full absolute inset-0">
                          <path
                            d={`M 40 20 Q ${160 + simQuadH * 15} ${120 - simQuadK * 10}, ${280 + simQuadH * 15} 20`}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3.5"
                          />
                        </svg>
                        <div className="z-10 bg-slate-950/90 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-mono text-white shadow-md">
                          Vertex (h, k) = ({simQuadH}, {simQuadK}) • Axis of Symmetry: x = {simQuadH}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-slate-400">Shift h:</span>
                          <input
                            type="range"
                            min="-4"
                            max="4"
                            value={simQuadH}
                            onChange={(e) => setSimQuadH(Number(e.target.value))}
                            className="flex-1 accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-slate-400">Shift k:</span>
                          <input
                            type="range"
                            min="-6"
                            max="6"
                            value={simQuadK}
                            onChange={(e) => setSimQuadK(Number(e.target.value))}
                            className="flex-1 accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. Circle Equation Simulation */}
                  {isCircleLesson && (
                    <div className="bg-slate-950/85 border border-amber-500/40 rounded-2xl p-5 backdrop-blur-md space-y-3 shadow-2xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          Circle Standard Form: (x - 3)² + (y + 4)² = {simSliderValue * simSliderValue}
                        </span>
                        <span className="text-xs font-mono text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                          Radius r = {Math.abs(simSliderValue)}
                        </span>
                      </div>

                      <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex items-center justify-center h-36 relative overflow-hidden">
                        <motion.div
                          className="rounded-full border-3 border-amber-400 bg-amber-500/20 flex items-center justify-center text-xs font-mono text-amber-200 shadow-lg shadow-amber-500/10"
                          style={{
                            width: `${Math.max(30, Math.abs(simSliderValue) * 22)}px`,
                            height: `${Math.max(30, Math.abs(simSliderValue) * 22)}px`,
                          }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          Center (3, -4)
                        </motion.div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-[11px] text-slate-400">Radius Scale (r):</span>
                        <input
                          type="range"
                          min="1"
                          max="6"
                          value={simSliderValue}
                          onChange={(e) => setSimSliderValue(Number(e.target.value))}
                          className="flex-1 accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Default Lesson Overview Card */}
                  {!isAdaptiveScoring && !isDesmosLesson && !isQuadraticsLesson && !isCircleLesson && (
                    <div className="bg-slate-950/85 border border-purple-500/40 rounded-2xl p-5 backdrop-blur-md space-y-3 shadow-2xl">
                      <div className="flex items-center space-x-2 text-xs font-bold text-purple-300">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Core Digital SAT High-Yield Concept Breakdown</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {lesson.summary}
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {lesson.keyTakeaways?.slice(0, 2).map((takeaway, idx) => (
                          <div key={idx} className="bg-slate-900 p-2.5 rounded-xl text-[11px] text-slate-300 border border-slate-800 flex items-center space-x-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{takeaway}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Scratchpad Overlay Canvas */}
                {showScratchpad && (
                  <div className="absolute inset-0 z-30 pointer-events-auto bg-slate-950/40">
                    <canvas
                      ref={scratchpadRef}
                      width={800}
                      height={450}
                      onMouseDown={startScratch}
                      onMouseMove={drawScratch}
                      onMouseUp={stopScratch}
                      onMouseLeave={stopScratch}
                      className="w-full h-full cursor-crosshair"
                    />
                    <div className="absolute bottom-16 right-4 z-40 flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700">
                      <span className="text-[10px] text-amber-400 font-bold px-1.5">Scratchpad Pen</span>
                      <button
                        onClick={clearScratch}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold cursor-pointer"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setShowScratchpad(false)}
                        className="px-2 py-1 bg-slate-800 text-slate-300 hover:text-white rounded text-[10px] cursor-pointer"
                      >
                        Hide
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Timeline Scrubber & Player Bar */}
                <div className="w-full space-y-2 z-20">
                  {/* Scrubber Slider */}
                  <div className="relative flex items-center group">
                    <input
                      type="range"
                      min="0"
                      max={totalDurationSec}
                      value={currentTimeSec}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer shadow-md"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                      </button>

                      <button
                        onClick={() => handleSeek(0)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                        title="Restart Lecture"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <span className="font-mono text-xs font-bold text-slate-200">
                        {formatTime(currentTimeSec)} / {formatTime(totalDurationSec)}
                      </span>
                    </div>

                    {/* Speed Controls */}
                    <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
                      <span className="text-[10px] text-slate-400 px-1 font-semibold">Speed:</span>
                      {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold transition-colors cursor-pointer ${
                            playbackSpeed === spd
                              ? 'bg-purple-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Quick Control Bar & Instructor Info */}
              <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Instructor Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/40 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      🎓
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <span>{lesson.instructor?.name || 'Dr. Evelyn Hayes'}</span>
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 font-semibold px-1.5 py-0.2 rounded border border-amber-400/30">
                          {lesson.instructor?.score || '1600 Scorer'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {lesson.instructor?.role || 'Senior SAT Curriculum Architect • Harvard M.Ed'}
                      </div>
                    </div>
                  </div>

                  {/* Mark Completed Button */}
                  <button
                    onClick={onCompleteLesson}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-950 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete & Next Lesson</span>
                  </button>
                </div>

                {/* Strategy Focus Summary */}
                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>High-Yield Masterclass Strategy Focus</span>
                    </span>
                    <span className="text-xs text-purple-300 font-mono font-semibold">
                      {lesson.duration} Studio HD
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{lesson.summary}</p>
                </div>
              </div>
            </div>

            {/* Right Side: Interactive Chapters, Transcripts, Synced Notes & Checkpoint Quiz */}
            <div className="w-full lg:w-88 xl:w-96 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0">
              {/* Tab Navigation */}
              <div className="flex bg-slate-950 p-1 border-b border-slate-800 text-xs">
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`flex-1 py-2 px-1.5 rounded-lg font-bold transition-all flex items-center justify-center space-x-1 ${
                    activeTab === 'chapters'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Chapters</span>
                </button>

                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`flex-1 py-2 px-1.5 rounded-lg font-bold transition-all flex items-center justify-center space-x-1 ${
                    activeTab === 'transcript'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Transcript</span>
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 py-2 px-1.5 rounded-lg font-bold transition-all flex items-center justify-center space-x-1 ${
                    activeTab === 'notes'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Notes ({savedNotes.length})</span>
                </button>

                {lesson.checkpointQuiz && (
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className={`flex-1 py-2 px-1.5 rounded-lg font-bold transition-all flex items-center justify-center space-x-1 ${
                      activeTab === 'quiz'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Quiz</span>
                  </button>
                )}
              </div>

              {/* Tab Content Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {/* 1. CHAPTERS VIEW */}
                {activeTab === 'chapters' && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Video Chapters & Key Moments</span>
                      <span className="text-purple-400 font-mono text-[11px]">
                        {lesson.chapters?.length || 0} Sections
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {(lesson.chapters || [
                        { timeSeconds: 0, timeDisplay: '00:00', title: 'Video Overview & Foundational Theory' },
                        { timeSeconds: 300, timeDisplay: '05:00', title: 'College Board Problem Demonstration' },
                        { timeSeconds: 600, timeDisplay: '10:00', title: 'Desmos & Shortcut Speed Run' },
                        { timeSeconds: 900, timeDisplay: '15:00', title: 'Trap Answer Elimination Tactics' },
                      ]).map((chap, idx) => {
                        const isCurrent = currentChapterIdx === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setCurrentChapterIdx(idx);
                              handleSeek(chap.timeSeconds);
                            }}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start space-x-2.5 ${
                              isCurrent
                                ? 'bg-purple-950/70 border-purple-500 text-white shadow-sm ring-1 ring-purple-500/50'
                                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                              {chap.timeDisplay}
                            </span>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-200">{chap.title}</div>
                            </div>
                            <Play className={`w-3 h-3 shrink-0 mt-0.5 ${isCurrent ? 'text-purple-400 fill-purple-400' : 'text-slate-600'}`} />
                          </div>
                        );
                      })}
                    </div>

                    {/* Lesson Key Takeaways Box */}
                    {lesson.keyTakeaways && (
                      <div className="pt-2 border-t border-slate-800 space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Key Takeaways</span>
                        </div>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {lesson.keyTakeaways.map((point, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-purple-400 font-bold">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. TRANSCRIPT VIEW */}
                {activeTab === 'transcript' && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Synchronized Lecture Transcript
                    </div>
                    {(lesson.transcript || [
                      {
                        time: '00:15',
                        speaker: 'Instructor',
                        text: 'Welcome to this masterclass! In this session, we break down core Digital SAT concepts, Desmos shortcuts, and trap elimination strategies.',
                      },
                      {
                        time: '04:20',
                        speaker: 'Instructor',
                        text: 'Notice how the official College Board question sets up an algebraic trap. Using Desmos sliders, we can verify the answer in under 15 seconds.',
                      },
                    ]).map((line, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-purple-400 font-mono font-bold">
                          <span>{line.speaker}</span>
                          <span>{line.time}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{line.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. NOTES VIEW */}
                {activeTab === 'notes' && (
                  <div className="space-y-3 flex flex-col h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Synchronized Study Notes
                      </span>
                      {savedNotes.length > 0 && (
                        <button
                          onClick={handleExportNotes}
                          className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export .txt</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        placeholder={`Take notes at timestamp ${formatTime(currentTimeSec)}...`}
                        className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={handleAddNote}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Save Timestamped Note ({formatTime(currentTimeSec)})
                      </button>
                    </div>

                    <div className="space-y-2 pt-2">
                      {savedNotes.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-500">
                          No notes saved yet. Write key concepts as you study.
                        </div>
                      ) : (
                        savedNotes.map((n) => (
                          <div key={n.id} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1">
                            <div className="text-[10px] font-mono text-amber-400 font-bold">{n.time}</div>
                            <p className="text-slate-200">{n.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 4. CHECKPOINT QUIZ VIEW */}
                {activeTab === 'quiz' && lesson.checkpointQuiz && (
                  <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Checkpoint Mastery Quiz</span>
                    </div>

                    <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                      <div className="text-xs font-bold text-white leading-relaxed">
                        {lesson.checkpointQuiz.question}
                      </div>

                      <div className="space-y-2">
                        {lesson.checkpointQuiz.options.map((opt, idx) => {
                          const isSelected = selectedQuizOption === opt;
                          const isCorrect = opt === lesson.checkpointQuiz?.answer;

                          let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850';
                          if (quizSubmitted) {
                            if (isCorrect) btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                            else if (isSelected && !isCorrect) btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                          } else if (isSelected) {
                            btnStyle = 'bg-purple-950/80 border-purple-500 text-white font-bold ring-1 ring-purple-500';
                          }

                          return (
                            <button
                              key={idx}
                              disabled={quizSubmitted}
                              onClick={() => setSelectedQuizOption(opt)}
                              className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {!quizSubmitted ? (
                        <button
                          disabled={!selectedQuizOption}
                          onClick={() => setQuizSubmitted(true)}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Submit Answer
                        </button>
                      ) : (
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1">
                          <div className="font-bold text-purple-300">Explanation:</div>
                          <p className="text-slate-300 leading-relaxed text-[11px]">
                            {lesson.checkpointQuiz.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
