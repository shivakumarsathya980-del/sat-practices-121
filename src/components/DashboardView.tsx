import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Layers,
  BookMarked,
  GraduationCap,
  Calculator,
  Compass,
  Trophy,
  Zap,
  TrendingUp,
  Clock,
  LogIn,
  UserCheck,
  Bot,
  Radio,
  Film,
  Brain,
  Video,
  Mic,
} from 'lucide-react';
import { Difficulty, UserProfile, UserProgressData } from '../types';
import { NavTab } from './Navbar';

interface DashboardViewProps {
  userProfile: UserProfile;
  progressData: UserProgressData;
  onNavigate: (tab: NavTab) => void;
  onStartPracticeWithDifficulty: (difficulty: Difficulty) => void;
  onOpenCalc: () => void;
  onOpenFormula: () => void;
  onOpenProfile?: () => void;
  estimatedScore: { total: number; math: number; rw: number };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  progressData,
  onNavigate,
  onStartPracticeWithDifficulty,
  onOpenCalc,
  onOpenFormula,
  onOpenProfile,
  estimatedScore,
}) => {
  const dailyProgress = Math.min(
    100,
    Math.round((progressData.questionsSolved / Math.max(1, userProfile.dailyGoalQuestions)) * 100)
  );

  const targetDiff = userProfile.targetScore - estimatedScore.total;

  return (
    <div id="dashboard-view-container" className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-200">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Full Access Pass Active • No Limits</span>
              </div>
              {onOpenProfile && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenProfile}
                  className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1 rounded-full text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  <LogIn className="w-3 h-3 text-amber-300" />
                  <span>Switch Account / Login</span>
                </motion.button>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center space-x-2">
              <span>Welcome back, {userProfile.name}!</span>
              <span className="text-2xl sm:text-3xl">{userProfile.avatar}</span>
            </h1>
            <p className="text-indigo-100 text-xs sm:text-sm max-w-xl">
              Target Test Date: <span className="font-semibold text-white">{userProfile.testDate}</span>. Ready for your personalized Digital SAT prep session?
            </p>
          </div>

          {/* Quick Score Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-5 flex items-center space-x-6 shrink-0">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-indigo-200 font-semibold">Estimated Score</div>
              <div className="text-3xl font-black tracking-tight text-white flex items-baseline space-x-1 mt-0.5">
                <span>{estimatedScore.total}</span>
                <span className="text-sm text-indigo-300 font-normal">/ 1600</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-indigo-200 mt-1">
                <span>Math: <strong className="text-white font-semibold">{estimatedScore.math}</strong></span>
                <span>•</span>
                <span>R&W: <strong className="text-white font-semibold">{estimatedScore.rw}</strong></span>
              </div>
            </div>

            <div className="h-12 w-px bg-white/20" />

            <div>
              <div className="text-[11px] uppercase tracking-wider text-indigo-200 font-semibold">Target Goal</div>
              <div className="text-2xl font-bold text-amber-300 flex items-center space-x-1 mt-0.5">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>{userProfile.targetScore}</span>
              </div>
              <div className="text-[11px] text-indigo-200 mt-1 font-medium">
                {targetDiff <= 0 ? (
                  <span className="text-emerald-300 font-bold">Goal Achieved! 🎉</span>
                ) : (
                  <span>{targetDiff} pts to reach goal</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ultra-Adaptive Digital Prep Platform Manifesto Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                ULTRA-ADAPTIVE 1550+ DIGITAL ARCHITECTURE
              </span>
              <span className="text-xs text-indigo-300 font-mono hidden sm:inline">• Live Digital SAT Engine</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Full Desmos + AI Revision Active</span>
            </div>
          </div>

          <p className="text-sm sm:text-[15px] leading-relaxed text-indigo-100/95 font-normal max-w-5xl">
            Our platform delivers an <strong className="text-white font-bold bg-indigo-500/25 px-1.5 py-0.5 rounded border border-indigo-400/30">ultra-adaptive</strong> digital test prep experience engineered explicitly for students targeting elite 1550+ scores. Built with a clean, high-performance UI, the website features a strict section-based adaptive timer that perfectly mimics the live digital exam environment alongside a fully integrated, Desmos-like graphing calculator. Students can target their weaknesses using a deeply categorized question bank and a custom quiz filter builder, while every submission unlocks detailed, step-by-step modal explanations. To ensure continuous growth, an automated AI mistake journal seamlessly archives every incorrect answer, creating an <strong className="text-amber-300 font-bold">ultra-personalized</strong> revision pipeline that turns past errors into ultimate scoring precision.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-1">
              <div className="text-amber-400 font-bold flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Strict Section Timer</span>
              </div>
              <div className="text-[11px] text-slate-300">Adaptive exam environment</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-1">
              <div className="text-cyan-400 font-bold flex items-center space-x-1.5">
                <Calculator className="w-3.5 h-3.5" />
                <span>Desmos Graphing</span>
              </div>
              <div className="text-[11px] text-slate-300">Integrated interactive canvas</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-1">
              <div className="text-purple-400 font-bold flex items-center space-x-1.5">
                <BookMarked className="w-3.5 h-3.5" />
                <span>Categorized Bank</span>
              </div>
              <div className="text-[11px] text-slate-300">Custom quiz filter builder</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-1">
              <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Mistake Journal</span>
              </div>
              <div className="text-[11px] text-slate-300">Error-to-precision pipeline</div>
            </div>
          </div>
        </div>
      </div>

      {/* Next-Gen AI Learning Suite (Gemini Chat, Live Voice, Veo 3 Video) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-100 text-indigo-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Next-Gen AI Suite</span>
            </span>
            <h2 className="text-base font-bold text-slate-900">Gemini & Veo Interactive Tools</h2>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">Multiturn Chat • Live Voice API • Veo 3 Video</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Gemini Chatbot */}
          <div
            id="dash-launch-gemini-chat"
            onClick={() => onNavigate('chat')}
            className="group relative bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm hover:shadow-lg border border-indigo-800/80 cursor-pointer transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-2.5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/20">
                  gemini-3.5-flash / pro
                </span>
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-indigo-200 transition-colors">
                Multiturn AI SAT Chatbot
              </h3>
              <p className="text-xs text-indigo-200/80 leading-relaxed">
                Chat with specialized AI coaches for Math Desmos tricks, Reading & Writing grammar analysis, and scoring tactics with persistent history.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-semibold text-indigo-300 border-t border-white/10 mt-3 relative z-10">
              <span>Open AI Tutor Chat</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Live Voice Coach */}
          <div
            id="dash-launch-live-voice"
            onClick={() => onNavigate('voice')}
            className="group relative bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm hover:shadow-lg border border-blue-800/80 cursor-pointer transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-2.5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-600/40 border border-blue-400/30 flex items-center justify-center text-blue-300">
                  <Radio className="w-5 h-5 animate-pulse text-red-400" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/20">
                  gemini-3.1-flash-live
                </span>
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-blue-200 transition-colors">
                Real-Time Live Voice Coach
              </h3>
              <p className="text-xs text-blue-200/80 leading-relaxed">
                Direct low-latency bidirectional voice conversation via Live API. Practice explaining steps aloud and get verbal coaching with prebuilt voices.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-semibold text-blue-300 border-t border-white/10 mt-3 relative z-10">
              <span>Start Voice Call</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Veo 3 Video Generator */}
          <div
            id="dash-launch-veo-video"
            onClick={() => onNavigate('veo-video')}
            className="group relative bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm hover:shadow-lg border border-purple-800/80 cursor-pointer transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-2.5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-600/40 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <Film className="w-5 h-5 text-purple-300" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-400/20">
                  veo-3.1-fast (16:9 & 9:16)
                </span>
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-purple-200 transition-colors">
                Veo 3 AI Video Studio
              </h3>
              <p className="text-xs text-purple-200/80 leading-relaxed">
                Generate high-definition educational video animations of parabolas, unit circle rotations, and grammar dynamics in widescreen or mobile ratio.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-semibold text-purple-300 border-t border-white/10 mt-3 relative z-10">
              <span>Generate SAT Video</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Practice Module Launcher by Difficulty */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Practice Modules by Difficulty</h2>
            <p className="text-xs text-slate-500">Choose your challenge level or launch adaptive practice with the custom question generator.</p>
          </div>
          <button
            id="dash-view-all-practice-btn"
            onClick={() => onNavigate('practice')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>Custom Test Builder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Easy Card */}
          <div
            id="launch-module-easy-card"
            onClick={() => onStartPracticeWithDifficulty('Easy')}
            className="group relative bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-emerald-500 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  EASY
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Foundational</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">
                Core Principles & Standard Form
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                Linear algebra, basic quadratics, direct grammar rules, and straightforward passage details.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-semibold text-emerald-700 border-t border-slate-100 mt-4">
              <span>Start Module</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Medium Card */}
          <div
            id="launch-module-medium-card"
            onClick={() => onStartPracticeWithDifficulty('Medium')}
            className="group relative bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-blue-500 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                  MEDIUM
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Exam Benchmark</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                Official Digital SAT Standard
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                Multi-step systems, standard deviation, context clues, transitions, and rhetorical synthesis.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-semibold text-blue-700 border-t border-slate-100 mt-4">
              <span>Start Module</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Hard Card */}
          <div
            id="launch-module-hard-card"
            onClick={() => onStartPracticeWithDifficulty('Hard')}
            className="group relative bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-amber-500 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                  HARD
                </span>
                <span className="text-[11px] text-slate-400 font-mono">700+ Score Level</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">
                Advanced Analytical Reasoning
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                Tricky quadratics with discriminant roots, subtle vocabulary in context, dangling modifiers & cross-text.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-semibold text-amber-700 border-t border-slate-100 mt-4">
              <span>Start Module</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Very Hard Card */}
          <div
            id="launch-module-veryhard-card"
            onClick={() => onStartPracticeWithDifficulty('Very Hard')}
            className="group relative bg-white border-2 border-purple-300 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-purple-600 cursor-pointer transition-all flex flex-col justify-between bg-gradient-to-b from-purple-50/30 to-white"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                  VERY HARD
                </span>
                <span className="text-[11px] text-purple-600 font-mono font-bold">750-800 Tier</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-purple-700 transition-colors">
                Elite 800 Target Challenges
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                Complex polynomial synthesis, circle sectors & arc geometry, dual passage rhetoric, and advanced modeling.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-semibold text-purple-700 border-t border-purple-100 mt-4">
              <span>Start Module</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Study Utilities, Flashcards, Notes & Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Features & Shortcuts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Goal & Progress */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Today's Practice Target</h3>
              </div>
              <span className="text-xs font-semibold text-slate-600">
                {progressData.questionsSolved} / {userProfile.dailyGoalQuestions} questions
              </span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${dailyProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 text-[11px]">Total Solved</div>
                <div className="font-bold text-slate-800 text-base">{progressData.questionsSolved}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 text-[11px]">Accuracy</div>
                <div className="font-bold text-emerald-600 text-base">
                  {progressData.questionsSolved > 0
                    ? `${Math.round((progressData.questionsCorrect / progressData.questionsSolved) * 100)}%`
                    : '100%'}
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 text-[11px]">Study Streak</div>
                <div className="font-bold text-amber-600 text-base flex items-center justify-center space-x-1">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  <span>{userProfile.streak} days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Hub Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Flashcards Box */}
            <div
              id="dash-flashcards-box"
              onClick={() => onNavigate('flashcards')}
              className="bg-white border border-slate-200 hover:border-amber-400 rounded-xl p-5 shadow-xs cursor-pointer group transition-all"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">
                    Flashcards & Timer
                  </h4>
                  <p className="text-[11px] text-slate-500">Vocab, Math Formulas, Grammar</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Rapid interactive 3D cards with timed blitz mode and spaced-repetition mastery tracking.
              </p>
              <div className="flex items-center space-x-1 text-xs font-semibold text-amber-700">
                <span>Open Flashcards</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Notes & Formulas Box */}
            <div
              id="dash-notes-box"
              onClick={() => onNavigate('notes')}
              className="bg-white border border-slate-200 hover:border-indigo-400 rounded-xl p-5 shadow-xs cursor-pointer group transition-all"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                    SAT Notes & Cheat Sheets
                  </h4>
                  <p className="text-[11px] text-slate-500">Formulas, Grammar Rules & Hacks</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                High-yield formula vault, Desmos calculator tricks, grammar cheat sheets, and custom note generator.
              </p>
              <div className="flex items-center space-x-1 text-xs font-semibold text-indigo-700">
                <span>View Study Notes</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tools & Fast Launchers */}
        <div className="space-y-4">
          {/* Digital SAT Tools Quick Access */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Exam Practice Utilities</h3>

            <div className="space-y-2">
              <button
                onClick={onOpenCalc}
                className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-indigo-500 rounded-lg text-xs font-medium text-slate-800 shadow-2xs hover:bg-indigo-50/50 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  <span>Desmos Graphing Tool</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={onOpenFormula}
                className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-indigo-500 rounded-lg text-xs font-medium text-slate-800 shadow-2xs hover:bg-indigo-50/50 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <BookMarked className="w-4 h-4 text-emerald-600" />
                  <span>Official Formula Reference</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('courses')}
                className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-indigo-500 rounded-lg text-xs font-medium text-slate-800 shadow-2xs hover:bg-indigo-50/50 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <span>All SAT Video Courses</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Pro Tip of the Day */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs space-y-1.5">
            <div className="flex items-center space-x-1 text-amber-900 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Digital SAT 1600 Strategy Tip</span>
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              On Reading & Writing Rhetorical Synthesis questions (bullet points), read the question prompt first to identify the exact goal. 85% of incorrect choices introduce extraneous facts not requested by the prompt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
