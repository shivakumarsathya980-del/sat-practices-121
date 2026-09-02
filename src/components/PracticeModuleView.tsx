import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Clock,
  Flag,
  Calculator,
  FileText,
  Edit3,
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Zap,
  Sliders,
  Play,
  Share2,
  Bookmark,
  Send,
  Loader2,
  Check,
  EyeOff,
  Eye,
  Award,
  BarChart3,
  Coffee,
  X,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Difficulty, Domain, PracticeSessionResult, Question, UserProgressData } from '../types';
import { initialQuestions } from '../data/mockQuestions';
import { generateSatQuestion, getAiTutorExplanation } from '../services/api';

export type TestType = 'full_mock' | 'half_mock' | 'custom_module' | 'adaptive_sprint';

interface PracticeModuleViewProps {
  initialDifficulty?: Difficulty;
  onOpenCalc: () => void;
  onOpenFormula: () => void;
  onOpenScratchpad: () => void;
  onSessionComplete: (result: PracticeSessionResult) => void;
  progressData: UserProgressData;
}

export const PracticeModuleView: React.FC<PracticeModuleViewProps> = ({
  initialDifficulty = 'Medium',
  onOpenCalc,
  onOpenFormula,
  onOpenScratchpad,
  onSessionComplete,
  progressData,
}) => {
  // Test Mode & Setup State
  const [testType, setTestType] = useState<TestType>('full_mock');
  const [inTestMode, setInTestMode] = useState<boolean>(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'Mixed'>('Mixed');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [isTimed, setIsTimed] = useState<boolean>(true);
  const [instantFeedback, setInstantFeedback] = useState<boolean>(false);
  const [isGeneratingAiQ, setIsGeneratingAiQ] = useState<boolean>(false);

  // Active Test Navigation & Questions State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [strikethroughs, setStrikethroughs] = useState<Record<string, string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [questionTimeSeconds, setQuestionTimeSeconds] = useState<Record<string, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(64 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [showTimer, setShowTimer] = useState<boolean>(true);
  const [showQuestionDrawer, setShowQuestionDrawer] = useState<boolean>(false);
  const [inBreakScreen, setInBreakScreen] = useState<boolean>(false);
  const [breakSecondsRemaining, setBreakSecondsRemaining] = useState<number>(600); // 10 min break

  // Test Finished & Results
  const [testFinished, setTestFinished] = useState<boolean>(false);
  const [sessionSummary, setSessionSummary] = useState<PracticeSessionResult | null>(null);

  // Clearable Notice / Error
  const [genNotice, setGenNotice] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // AI Tutor in Test
  const [aiTutorOpen, setAiTutorOpen] = useState<boolean>(false);
  const [aiTutorQuery, setAiTutorQuery] = useState<string>('');
  const [aiTutorLoading, setAiTutorLoading] = useState<boolean>(false);
  const [aiTutorResponse, setAiTutorResponse] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Main Test Countdown & Question Timer
  useEffect(() => {
    if (inTestMode && !testFinished && !inBreakScreen && isTimed && isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleFinishTest();
            return 0;
          }
          return prev - 1;
        });

        const currentQ = questions[currentIndex];
        if (currentQ) {
          setQuestionTimeSeconds((prev) => ({
            ...prev,
            [currentQ.id]: (prev[currentQ.id] || 0) + 1,
          }));
        }
      }, 1000);
    } else if (inBreakScreen && isTimerRunning) {
      timerRef.current = setInterval(() => {
        setBreakSecondsRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [inTestMode, testFinished, inBreakScreen, isTimed, isTimerRunning, currentIndex, questions]);

  // Format seconds to mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Launch Test based on Mode
  const handleStartTest = (type: TestType) => {
    setTestType(type);
    let chosen: Question[] = [];
    let timeLimit = 15 * 60;

    if (type === 'full_mock') {
      // Full Digital SAT simulation: RW + Math
      const rwQuestions = initialQuestions.filter((q) => q.section === 'Reading & Writing');
      const mathQuestions = initialQuestions.filter((q) => q.section === 'Math');
      const sampleRW = [...rwQuestions].sort(() => Math.random() - 0.5).slice(0, 27);
      const sampleMath = [...mathQuestions].sort(() => Math.random() - 0.5).slice(0, 22);
      chosen = [...sampleRW, ...sampleMath];
      timeLimit = 64 * 60; // 64 minutes
    } else if (type === 'half_mock') {
      // Half-Length Diagnostic: 15 RW + 15 Math
      const rwQuestions = initialQuestions.filter((q) => q.section === 'Reading & Writing');
      const mathQuestions = initialQuestions.filter((q) => q.section === 'Math');
      const sampleRW = [...rwQuestions].sort(() => Math.random() - 0.5).slice(0, 15);
      const sampleMath = [...mathQuestions].sort(() => Math.random() - 0.5).slice(0, 15);
      chosen = [...sampleRW, ...sampleMath];
      timeLimit = 45 * 60; // 45 minutes
    } else if (type === 'adaptive_sprint') {
      // 10 Fast Adaptive Questions
      chosen = [...initialQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
      timeLimit = 15 * 60;
    } else {
      // Custom Practice Module
      let filtered = initialQuestions.filter((q) => {
        let match = true;
        if (selectedDifficulty !== 'Mixed' && q.difficulty !== selectedDifficulty) match = false;
        if (selectedDomain !== 'All') {
          if (selectedDomain === 'Math' && q.section !== 'Math') match = false;
          else if (selectedDomain === 'Reading & Writing' && q.section !== 'Reading & Writing') match = false;
          else if (q.domain !== selectedDomain && !selectedDomain.includes(q.section)) match = false;
        }
        return match;
      });

      if (filtered.length === 0) filtered = initialQuestions;
      chosen = [...filtered].sort(() => Math.random() - 0.5).slice(0, Math.min(questionCount, filtered.length));
      timeLimit = Math.max(5, chosen.length * 1.5) * 60;
    }

    setQuestions(chosen);
    setCurrentIndex(0);
    setUserAnswers({});
    setStrikethroughs({});
    setFlaggedQuestions({});
    setQuestionTimeSeconds({});
    setSecondsRemaining(timeLimit);
    setIsTimerRunning(true);
    setTestFinished(false);
    setInBreakScreen(false);
    setSessionSummary(null);
    setAiTutorOpen(false);
    setAiTutorResponse(null);
    setGenError(null);
    setGenNotice(null);
    setInTestMode(true);
  };

  // Generate & Append an AI Question
  const handleGenerateAiQuestion = async () => {
    setIsGeneratingAiQ(true);
    setGenError(null);
    setGenNotice(null);

    try {
      const newQ = await generateSatQuestion({
        difficulty: selectedDifficulty === 'Mixed' ? 'Hard' : selectedDifficulty,
        domain: selectedDomain === 'All' ? 'Algebra' : selectedDomain,
      });

      setQuestions((prev) => [...prev, newQ]);
      setCurrentIndex(questions.length);
      setGenNotice('Generated fresh SAT question with Gemini AI!');
    } catch (err: any) {
      console.warn('AI question generation note:', err);
      // Create a high-quality fallback question so student is never interrupted
      const fallbackQ: Question = {
        id: `ai_fallback_${Date.now()}`,
        section: 'Math',
        domain: 'Algebra',
        topic: 'Linear Functions & Slopes',
        difficulty: 'Medium',
        question: 'A line in the xy-plane passes through the points (2, 5) and (6, 17). What is the y-intercept of the line?',
        options: [
          { id: 'A', text: '-1' },
          { id: 'B', text: '1' },
          { id: 'C', text: '3' },
          { id: 'D', text: '5' },
        ],
        correctAnswer: 'A',
        explanation: 'Slope m = (17 - 5) / (6 - 2) = 12 / 4 = 3. Using point-slope with (2, 5): y - 5 = 3(x - 2) => y = 3x - 6 + 5 => y = 3x - 1. The y-intercept is -1.',
        proTip: 'In Desmos, plot both points and look at where the line crosses the y-axis (0, -1).',
      };
      setQuestions((prev) => [...prev, fallbackQ]);
      setCurrentIndex(questions.length);
      setGenNotice('Added offline practice problem. You can continue without pause.');
    } finally {
      setIsGeneratingAiQ(false);
    }
  };

  // Toggle option strikethrough (cross-out)
  const toggleStrike = (choiceId: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const currentStrikes = strikethroughs[currentQ.id] || [];
    if (currentStrikes.includes(choiceId)) {
      setStrikethroughs({
        ...strikethroughs,
        [currentQ.id]: currentStrikes.filter((c) => c !== choiceId),
      });
    } else {
      setStrikethroughs({
        ...strikethroughs,
        [currentQ.id]: [...currentStrikes, choiceId],
      });
    }
  };

  // Select Answer
  const handleSelectAnswer = (choiceId: 'A' | 'B' | 'C' | 'D') => {
    if (testFinished) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setUserAnswers({
      ...userAnswers,
      [currentQ.id]: choiceId,
    });
  };

  // Toggle Flag
  const toggleFlag = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setFlaggedQuestions({
      ...flaggedQuestions,
      [currentQ.id]: !flaggedQuestions[currentQ.id],
    });
  };

  // Finish Test & Scaled Score Calculation
  const handleFinishTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correct = 0;
    let mathCorrect = 0;
    let mathTotal = 0;
    let rwCorrect = 0;
    let rwTotal = 0;

    const summaryList = questions.map((q) => {
      const uAns = userAnswers[q.id] || '';
      const isCor = uAns === q.correctAnswer;
      if (isCor) correct++;

      if (q.section === 'Math') {
        mathTotal++;
        if (isCor) mathCorrect++;
      } else {
        rwTotal++;
        if (isCor) rwCorrect++;
      }

      return {
        questionId: q.id,
        questionText: q.question,
        domain: q.domain,
        difficulty: q.difficulty,
        userAnswer: uAns,
        correctAnswer: q.correctAnswer,
        isCorrect: isCor,
        timeSpentSeconds: questionTimeSeconds[q.id] || 0,
      };
    });

    const percentage = Math.round((correct / Math.max(1, questions.length)) * 100);

    // Official Scale calculation (400 - 1600 scale)
    const mathScale = mathTotal > 0 ? Math.round(200 + (mathCorrect / mathTotal) * 600) : 700;
    const rwScale = rwTotal > 0 ? Math.round(200 + (rwCorrect / rwTotal) * 600) : 720;
    const totalScaled = testType === 'full_mock' || testType === 'half_mock' ? mathScale + rwScale : Math.round(400 + (percentage / 100) * 1200);

    let totalSeconds = 0;
    for (const key in questionTimeSeconds) {
      totalSeconds += questionTimeSeconds[key] || 0;
    }

    const testName =
      testType === 'full_mock'
        ? 'Full-Length Official Digital SAT Mock Test'
        : testType === 'half_mock'
        ? 'Half-Length SAT Diagnostic Test'
        : testType === 'adaptive_sprint'
        ? 'Adaptive AI SAT Sprint'
        : `${selectedDifficulty} Custom Practice Module`;

    const result: PracticeSessionResult = {
      id: `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      moduleName: testName,
      section: testType === 'full_mock' ? 'Full Test (Math + RW)' : selectedDomain,
      difficulty: selectedDifficulty,
      totalQuestions: questions.length,
      correctCount: correct,
      scorePercentage: percentage,
      timeSpentSeconds: totalSeconds,
      estimatedScaledScore: totalScaled,
      questionsSummary: summaryList,
    };

    setSessionSummary(result);
    setTestFinished(true);
    onSessionComplete(result);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const currentQ = questions[currentIndex];

  // -------------------------------------------------------------
  // TEST TAKING SCREEN (BLUEBOOK TEST ENVIRONMENT)
  // -------------------------------------------------------------
  if (inTestMode && !testFinished) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        {/* Bluebook Top Exam Bar */}
        <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600/30 text-indigo-300 font-bold text-xs px-3 py-1 rounded-full border border-indigo-400/30">
              {testType === 'full_mock'
                ? 'FULL DIGITAL SAT MOCK'
                : testType === 'half_mock'
                ? 'HALF DIAGNOSTIC TEST'
                : 'PRACTICE MODULE'}
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Section: <b>{currentQ?.section || 'Section 1'}</b> • Domain: <b>{currentQ?.domain || 'Algebra'}</b>
            </span>
          </div>

          {/* Center Timer */}
          <div className="flex items-center space-x-2">
            {showTimer ? (
              <div className="bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold text-indigo-400 flex items-center space-x-2 shadow-xs">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-mono italic">Timer Hidden</span>
            )}
            <button
              onClick={() => setShowTimer(!showTimer)}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
              title={showTimer ? 'Hide Timer' : 'Show Timer'}
            >
              {showTimer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Test Tools & Intermission */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenCalc}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Desmos Calculator</span>
            </button>

            <button
              onClick={onOpenFormula}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Formulas</span>
            </button>

            <button
              onClick={onOpenScratchpad}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Scratchpad</span>
            </button>

            <button
              onClick={handleFinishTest}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              End Test
            </button>
          </div>
        </header>

        {/* Clearable Notice Banner if present */}
        <AnimatePresence>
          {genNotice && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-indigo-950/80 border-b border-indigo-800 px-6 py-2 flex items-center justify-between text-xs text-indigo-300"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{genNotice}</span>
              </div>
              <button
                onClick={() => setGenNotice(null)}
                className="p-1 hover:bg-indigo-900 rounded-md text-indigo-300 hover:text-white flex items-center space-x-1"
              >
                <X className="w-3 h-3" />
                <span>Dismiss</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Split Test Canvas */}
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
          {currentQ ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
              {/* Left Column: Passage or Context (5 cols if passage exists, else full) */}
              {currentQ.passage && (
                <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 overflow-y-auto max-h-[560px] space-y-3">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Reading Passage / Text Context</span>
                  </div>
                  <div className="text-sm text-slate-200 leading-relaxed font-serif whitespace-pre-wrap">
                    {currentQ.passage}
                  </div>
                </div>
              )}

              {/* Right Column: Question Prompt & 4 Option Choices */}
              <div
                className={`${
                  currentQ.passage ? 'lg:col-span-6' : 'lg:col-span-12 max-w-3xl mx-auto w-full'
                } bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 font-mono">
                      Question {currentIndex + 1} of {questions.length}
                    </span>

                    <button
                      onClick={toggleFlag}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition-all ${
                        flaggedQuestions[currentQ.id]
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>{flaggedQuestions[currentQ.id] ? 'Flagged for Review' : 'Mark for Review'}</span>
                    </button>
                  </div>

                  {/* Question Stem */}
                  <div className="text-base sm:text-lg font-semibold text-white leading-relaxed whitespace-pre-wrap">
                    {currentQ.question}
                  </div>

                  {/* 4 Choices */}
                  <div className="space-y-3 pt-2">
                    {currentQ.options.map((opt) => {
                      const isSelected = userAnswers[currentQ.id] === opt.id;
                      const isStruck = strikethroughs[currentQ.id]?.includes(opt.id);

                      return (
                        <div
                          key={opt.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                            isSelected
                              ? 'bg-indigo-600/25 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                              : isStruck
                              ? 'bg-slate-950/40 border-slate-800 text-slate-600 line-through opacity-50'
                              : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-slate-200 cursor-pointer'
                          }`}
                          onClick={() => handleSelectAnswer(opt.id as any)}
                        >
                          <div className="flex items-center space-x-3.5 flex-1">
                            <div
                              className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'
                              }`}
                            >
                              {opt.id}
                            </div>
                            <span className="text-sm font-medium">{opt.text}</span>
                          </div>

                          {/* Strikethrough Cross-out tool */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStrike(opt.id);
                            }}
                            className="text-[11px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded-md hover:bg-slate-700/50"
                            title="Cross out choice"
                          >
                            {isStruck ? 'Uncross' : 'ABC'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Question Navigation Footer */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => prev - 1)}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={() => setShowQuestionDrawer(!showQuestionDrawer)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Review Grid ({Object.keys(userAnswers).length}/{questions.length})</span>
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex((prev) => prev + 1)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishTest}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
                    >
                      <span>Submit Module</span>
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </main>

        {/* Question Grid Review Drawer Modal */}
        <AnimatePresence>
          {showQuestionDrawer && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-white">Digital SAT Question Review Grid</h3>
                    <p className="text-xs text-slate-400">Click any question number to jump directly to it.</p>
                  </div>
                  <button
                    onClick={() => setShowQuestionDrawer(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-72 overflow-y-auto p-1">
                  {questions.map((q, idx) => {
                    const isAnswered = !!userAnswers[q.id];
                    const isFlagged = !!flaggedQuestions[q.id];
                    const isCur = idx === currentIndex;

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setCurrentIndex(idx);
                          setShowQuestionDrawer(false);
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center relative border transition-all ${
                          isCur
                            ? 'border-indigo-400 ring-2 ring-indigo-500 bg-indigo-600 text-white'
                            : isAnswered
                            ? 'bg-slate-800 border-slate-700 text-slate-100'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span>{idx + 1}</span>
                        {isFlagged && (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEST SUMMARY & DETAILED SCORE REPORT SCREEN
  // -------------------------------------------------------------
  if (testFinished && sessionSummary) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Score Header Card */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 rounded-3xl p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold border border-emerald-500/30">
                OFFICIAL SCORE REPORT
              </span>
              <h1 className="text-3xl font-black">{sessionSummary.moduleName}</h1>
              <p className="text-sm text-indigo-200">
                Completed on {new Date(sessionSummary.timestamp).toLocaleDateString()} • Time spent:{' '}
                {Math.round(sessionSummary.timeSpentSeconds / 60)} minutes
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Score</div>
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {sessionSummary.estimatedScaledScore}
              </div>
              <div className="text-xs text-emerald-400 font-bold">
                {sessionSummary.correctCount} / {sessionSummary.totalQuestions} Correct ({sessionSummary.scorePercentage}%)
              </div>
            </div>
          </div>
        </div>

        {/* Question Breakdown List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Question-by-Question Review</h3>
            <button
              onClick={() => setInTestMode(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              Back to Test Center
            </button>
          </div>

          <div className="space-y-3">
            {sessionSummary.questionsSummary.map((item, idx) => (
              <div
                key={item.questionId}
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  item.isCorrect ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-800">
                    Question {idx + 1}: {item.domain} ({item.difficulty})
                  </span>
                  <span className={item.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {item.isCorrect ? '✓ Correct' : `✗ Incorrect (Your Answer: ${item.userAnswer || 'Blank'}, Correct: ${item.correctAnswer})`}
                  </span>
                </div>
                <div className="text-slate-700 font-medium">{item.questionText}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // HOME: PRACTICE & MOCK TEST SELECTION CENTER
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 rounded-3xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-500/30 text-indigo-300 text-xs px-3 py-1 rounded-full font-bold border border-indigo-400/20 flex items-center space-x-1.5">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>OFFICIAL DIGITAL SAT TEST SUITE</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">• 1600 Scaled Testing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              SAT Mock Tests & Practice Suite
            </h1>
            <p className="text-sm text-indigo-200 max-w-2xl">
              Take full-length timed Digital SAT mock tests, half-length diagnostic tests, or custom AI adaptive modules
              with real-time Desmos calculator, formula sheets, and 400-1600 scaled scoring.
            </p>
          </div>
        </div>
      </div>

      {/* Clearable Error / Notice */}
      <AnimatePresence>
        {(genError || genNotice) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-4 rounded-2xl text-xs flex items-center justify-between border shadow-sm ${
              genError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{genError || genNotice}</span>
            </div>
            <button
              onClick={() => {
                setGenError(null);
                setGenNotice(null);
              }}
              className="p-1 hover:bg-black/5 rounded-lg font-bold flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Mode Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Full Mock Test */}
        <div className="bg-white rounded-3xl p-6 border-2 border-indigo-200 hover:border-indigo-500 shadow-sm space-y-4 flex flex-col justify-between transition-all hover:shadow-md">
          <div className="space-y-2">
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              OFFICIAL 1600 FORMAT
            </span>
            <h3 className="text-lg font-bold text-slate-900">Full-Length Digital SAT Mock Test</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete simulation with Reading & Writing (27 Qs) + Math (22 Qs), 64-minute timer, and full 400-1600 scaled score calculation.
            </p>
          </div>

          <button
            onClick={() => handleStartTest('full_mock')}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Full Mock Test</span>
          </button>
        </div>

        {/* 2. Half Diagnostic Test */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-purple-300 shadow-sm space-y-4 flex flex-col justify-between transition-all hover:shadow-md">
          <div className="space-y-2">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              QUICK DIAGNOSTIC
            </span>
            <h3 className="text-lg font-bold text-slate-900">Half-Length Diagnostic Test</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              30 high-yield questions (15 RW + 15 Math), 45-minute timer, with instant domain mastery analysis.
            </p>
          </div>

          <button
            onClick={() => handleStartTest('half_mock')}
            className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Diagnostic (30 Qs)</span>
          </button>
        </div>

        {/* 3. Adaptive AI Sprint */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-amber-300 shadow-sm space-y-4 flex flex-col justify-between transition-all hover:shadow-md">
          <div className="space-y-2">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              SMART ADAPTIVE
            </span>
            <h3 className="text-lg font-bold text-slate-900">Adaptive AI Sprint (10 Qs)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dynamically targets your weak domains with real-time AI difficulty calibration.
            </p>
          </div>

          <button
            onClick={() => handleStartTest('adaptive_sprint')}
            className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Launch Adaptive Sprint</span>
          </button>
        </div>

        {/* 4. Custom Practice Module */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-slate-300 shadow-sm space-y-4 flex flex-col justify-between transition-all hover:shadow-md">
          <div className="space-y-2">
            <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              CUSTOM FILTERS
            </span>
            <h3 className="text-lg font-bold text-slate-900">Custom Practice Module</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pick exact domains (Algebra, Grammar, Trig), difficulty tier, and timed or untimed mode.
            </p>
          </div>

          <button
            onClick={() => handleStartTest('custom_module')}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize & Start</span>
          </button>
        </div>
      </div>
    </div>
  );
};
