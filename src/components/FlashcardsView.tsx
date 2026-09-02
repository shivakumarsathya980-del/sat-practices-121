import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Layers,
  Clock,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Volume2,
  Zap,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  BookOpen,
  Award,
  Star,
  Search,
  Filter,
  ArrowUpDown,
  Printer,
  HelpCircle,
  Sliders,
  Check,
  Flame,
  Lightbulb,
  VolumeX,
} from 'lucide-react';
import { Flashcard, FlashcardDeck, UserProgressData, Difficulty } from '../types';
import { initialDecks } from '../data/mockFlashcards';

interface FlashcardsViewProps {
  progressData: UserProgressData;
  onUpdateCardMastery: (cardId: string, status: 'learning' | 'review' | 'mastered') => void;
}

type StudyMode = 'flip' | 'quiz' | 'type' | 'slideshow';

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  progressData,
  onUpdateCardMastery,
}) => {
  const [decks, setDecks] = useState<FlashcardDeck[]>(initialDecks);
  const [selectedDeckId, setSelectedDeckId] = useState<string>(initialDecks[0].id);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Study Mode Options
  const [studyMode, setStudyMode] = useState<StudyMode>('flip');
  const [isReversedMode, setIsReversedMode] = useState<boolean>(false); // Show definition first
  const [starredCardIds, setStarredCardIds] = useState<Set<string>>(new Set());

  // Filter & Search Options
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [masteryFilter, setMasteryFilter] = useState<'All' | 'starred' | 'learning' | 'review' | 'mastered'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'az' | 'difficulty' | 'mastery'>('default');

  // Timer Configuration & State
  const [timerMode, setTimerMode] = useState<'untimed' | 'stopwatch' | 'blitz15' | 'blitz30' | 'challenge60'>('blitz30');
  const [timerSeconds, setTimerSeconds] = useState<number>(30);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  // Auto-Play Slideshow Settings
  const [slideshowSpeed, setSlideshowSpeed] = useState<number>(4); // seconds
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState<boolean>(false);
  const [autoSpeakAudio, setAutoSpeakAudio] = useState<boolean>(true);

  // Active Recall / Typing Mode State
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [typingFeedback, setTypingFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showMnemonicHint, setShowMnemonicHint] = useState<boolean>(false);

  // Quiz Mode State
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number; streak: number }>({
    correct: 0,
    total: 0,
    streak: 0,
  });
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Modals & Drawers
  const [newCardModalOpen, setNewCardModalOpen] = useState(false);
  const [printSheetOpen, setPrintSheetOpen] = useState(false);
  const [optionsDrawerOpen, setOptionsDrawerOpen] = useState(false);
  const [showAllDeckAnswers, setShowAllDeckAnswers] = useState<boolean>(false);

  // New Custom Card Form State
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newCategory, setNewCategory] = useState<'Vocab' | 'Math' | 'Grammar' | 'Strategy'>('Vocab');
  const [newMnemonic, setNewMnemonic] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('Medium');

  const currentDeck = decks.find((d) => d.id === selectedDeckId) || decks[0];

  // Star / Bookmark toggle
  const toggleStarCard = (cardId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStarredCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  // Filtered & Sorted Cards
  const processedCards = useMemo(() => {
    let list = [...currentDeck.cards];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.front.toLowerCase().includes(q) ||
          c.back.toLowerCase().includes(q) ||
          (c.mnemonic && c.mnemonic.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      list = list.filter((c) => c.category === categoryFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'All') {
      list = list.filter((c) => c.difficulty === difficultyFilter);
    }

    // Mastery / Starred filter
    if (masteryFilter === 'starred') {
      list = list.filter((c) => starredCardIds.has(c.id));
    } else if (masteryFilter !== 'All') {
      list = list.filter((c) => (progressData.cardMastery[c.id] || 'review') === masteryFilter);
    }

    // Sorting
    if (sortBy === 'az') {
      list.sort((a, b) => a.front.localeCompare(b.front));
    } else if (sortBy === 'difficulty') {
      const rank: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3, 'Very Hard': 4 };
      list.sort((a, b) => (rank[b.difficulty] || 0) - (rank[a.difficulty] || 0));
    } else if (sortBy === 'mastery') {
      const rank: Record<string, number> = { review: 1, learning: 2, mastered: 3 };
      list.sort((a, b) => {
        const ma = progressData.cardMastery[a.id] || 'review';
        const mb = progressData.cardMastery[b.id] || 'review';
        return rank[ma] - rank[mb];
      });
    }

    return list;
  }, [
    currentDeck.cards,
    searchQuery,
    categoryFilter,
    difficultyFilter,
    masteryFilter,
    sortBy,
    starredCardIds,
    progressData.cardMastery,
  ]);

  const activeCards = processedCards;
  const currentCard = activeCards[cardIndex] || activeCards[0] || null;

  // Reset index if out of bounds
  useEffect(() => {
    if (cardIndex >= activeCards.length) {
      setCardIndex(0);
    }
  }, [activeCards.length, cardIndex]);

  // Select Deck Handler
  const handleSelectDeck = (deck: FlashcardDeck) => {
    setSelectedDeckId(deck.id);
    setCardIndex(0);
    setIsFlipped(false);
    setTypedAnswer('');
    setTypingFeedback('idle');
    setShowMnemonicHint(false);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    resetTimerForMode(timerMode);
  };

  // Timer reset helper
  const resetTimerForMode = (mode: 'untimed' | 'stopwatch' | 'blitz15' | 'blitz30' | 'challenge60') => {
    if (mode === 'blitz15') setTimerSeconds(15);
    else if (mode === 'blitz30') setTimerSeconds(30);
    else if (mode === 'challenge60') setTimerSeconds(60);
    else setTimerSeconds(0);
    setIsTimerActive(false);
  };

  // Switch timer mode
  const handleTimerModeChange = (mode: 'untimed' | 'stopwatch' | 'blitz15' | 'blitz30' | 'challenge60') => {
    setTimerMode(mode);
    resetTimerForMode(mode);
  };

  // Timer execution
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && timerMode !== 'untimed') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (timerMode === 'stopwatch') {
            return prev + 1;
          } else {
            if (prev <= 1) {
              setIsTimerActive(false);
              return 0;
            }
            return prev - 1;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timerMode]);

  // Slideshow Auto-Play Runner
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isSlideshowPlaying && activeCards.length > 0) {
      timer = setInterval(() => {
        setIsFlipped((prev) => {
          if (!prev) {
            // Flip to back
            return true;
          } else {
            // Move to next card
            setCardIndex((c) => (c + 1) % activeCards.length);
            return false;
          }
        });
      }, (slideshowSpeed * 1000) / 2);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSlideshowPlaying, activeCards.length, slideshowSpeed]);

  // Next / Prev card
  const handleNextCard = () => {
    setIsFlipped(false);
    setTypedAnswer('');
    setTypingFeedback('idle');
    setShowMnemonicHint(false);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    if (activeCards.length > 0) {
      setCardIndex((prev) => (prev + 1) % activeCards.length);
    }
    if (timerMode === 'blitz15') setTimerSeconds(15);
    if (timerMode === 'blitz30') setTimerSeconds(30);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTypedAnswer('');
    setTypingFeedback('idle');
    setShowMnemonicHint(false);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    if (activeCards.length > 0) {
      setCardIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
    }
    if (timerMode === 'blitz15') setTimerSeconds(15);
    if (timerMode === 'blitz30') setTimerSeconds(30);
  };

  // Shuffle deck
  const handleShuffle = () => {
    const shuffledCards = [...currentDeck.cards].sort(() => Math.random() - 0.5);
    setDecks(decks.map((d) => (d.id === currentDeck.id ? { ...d, cards: shuffledCards } : d)));
    setCardIndex(0);
    setIsFlipped(false);
  };

  // Spaced repetition rating
  const handleRateCard = (status: 'learning' | 'review' | 'mastered') => {
    if (!currentCard) return;
    onUpdateCardMastery(currentCard.id, status);

    if (status === 'mastered') {
      confetti({
        particleCount: 35,
        spread: 45,
        origin: { y: 0.7 },
      });
    }

    handleNextCard();
  };

  // Text-To-Speech Pronunciation / Reader
  const handleSpeak = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Active Recall Verification
  const handleCheckTypedAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCard || !typedAnswer.trim()) return;

    const targetAnswer = (isReversedMode ? currentCard.front : currentCard.back).toLowerCase();
    const cleanTyped = typedAnswer.trim().toLowerCase();

    // Check inclusion or fuzzy match
    const isClose = targetAnswer.includes(cleanTyped) || cleanTyped.length > 3 && targetAnswer.includes(cleanTyped.slice(0, 4));

    if (isClose || cleanTyped === targetAnswer) {
      setTypingFeedback('correct');
      onUpdateCardMastery(currentCard.id, 'mastered');
      confetti({ particleCount: 25, spread: 40, origin: { y: 0.7 } });
    } else {
      setTypingFeedback('incorrect');
      onUpdateCardMastery(currentCard.id, 'review');
    }
    setIsFlipped(true);
  };

  // Dynamic Quiz Options Generator
  const quizOptions = useMemo(() => {
    if (!currentCard || currentDeck.cards.length < 2) return [];
    const correctOpt = isReversedMode ? currentCard.front : currentCard.back;
    const pool = currentDeck.cards
      .filter((c) => c.id !== currentCard.id)
      .map((c) => (isReversedMode ? c.front : c.back));

    const wrongOpts = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    return [correctOpt, ...wrongOpts].sort(() => Math.random() - 0.5);
  }, [currentCard, currentDeck.cards, isReversedMode]);

  // Quiz Option Click Handler
  const handleSelectQuizChoice = (option: string) => {
    if (quizSubmitted || !currentCard) return;
    setSelectedQuizOption(option);
    setQuizSubmitted(true);

    const correctOpt = isReversedMode ? currentCard.front : currentCard.back;
    const isCorrect = option === correctOpt;

    if (isCorrect) {
      setQuizScore((prev) => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
        streak: prev.streak + 1,
      }));
      onUpdateCardMastery(currentCard.id, 'mastered');
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
    } else {
      setQuizScore((prev) => ({
        correct: prev.correct,
        total: prev.total + 1,
        streak: 0,
      }));
      onUpdateCardMastery(currentCard.id, 'review');
    }
  };

  // Add custom card
  const handleAddCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: `custom_card_${Date.now()}`,
      deckId: selectedDeckId,
      front: newFront.trim(),
      back: newBack.trim(),
      category: newCategory,
      difficulty: newDifficulty,
      mnemonic: newMnemonic.trim() || undefined,
      example: newExample.trim() || undefined,
    };

    setDecks(
      decks.map((d) => (d.id === selectedDeckId ? { ...d, cards: [newCard, ...d.cards] } : d))
    );

    setNewFront('');
    setNewBack('');
    setNewMnemonic('');
    setNewExample('');
    setNewCardModalOpen(false);
    setCardIndex(0);
    setIsFlipped(false);
  };

  // Mastery percentage calculation
  const masteredCount = activeCards.filter(
    (c) => progressData.cardMastery[c.id] === 'mastered'
  ).length;
  const masteryPercentage = activeCards.length > 0
    ? Math.round((masteredCount / activeCards.length) * 100)
    : 0;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div id="flashcards-view-container" className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header & Deck Selector */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Digital SAT 1600 Flashcards & Active Recall</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">SAT Flashcards & Timer Arena</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              High-frequency vocabulary, essential math formulas, and grammar rules with interactive study options.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setPrintSheetOpen(true)}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Print Study Sheet"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Sheet</span>
            </button>

            <button
              id="add-custom-flashcard-btn"
              onClick={() => setNewCardModalOpen(true)}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Card</span>
            </button>
          </div>
        </div>

        {/* Deck selection pills */}
        <div className="flex gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
          {decks.map((deck) => {
            const isSelected = deck.id === selectedDeckId;
            return (
              <button
                key={deck.id}
                id={`deck-select-${deck.id}`}
                onClick={() => handleSelectDeck(deck)}
                className={`py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {deck.title} ({deck.cards.length})
              </button>
            );
          })}
        </div>
      </div>

      {/* Study Modes & Options Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Study Mode Selector Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl text-xs">
            <button
              onClick={() => setStudyMode('flip')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                studyMode === 'flip'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>3D Flip Mode</span>
            </button>

            <button
              onClick={() => setStudyMode('quiz')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                studyMode === 'quiz'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-purple-500" />
              <span>Quiz Mode</span>
            </button>

            <button
              onClick={() => setStudyMode('type')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                studyMode === 'type'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>Type / Recall</span>
            </button>

            <button
              onClick={() => setStudyMode('slideshow')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                studyMode === 'slideshow'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-500" />
              <span>Auto Slideshow</span>
            </button>
          </div>

          {/* Reversible Front/Back & Star Filter Quick Switches */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsReversedMode(!isReversedMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1 ${
                isReversedMode
                  ? 'bg-purple-50 border-purple-300 text-purple-800 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Reverse Front and Back of flashcards"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isReversedMode ? 'Reversed: Definition First' : 'Standard: Term First'}</span>
            </button>

            <button
              onClick={() => setOptionsDrawerOpen(!optionsDrawerOpen)}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1 ${
                optionsDrawerOpen
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Filters & Options"
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Drawer (Category, Difficulty, Mastery, Sort, Search) */}
        {optionsDrawerOpen && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Search */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Search Keywords</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search terms..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Vocab">Vocabulary</option>
                  <option value="Math">Math Formulas</option>
                  <option value="Grammar">Grammar Rules</option>
                  <option value="Strategy">Exam Strategy</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Difficulty</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Very Hard">Very Hard</option>
                </select>
              </div>

              {/* Mastery / Starred Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Status Filter</label>
                <select
                  value={masteryFilter}
                  onChange={(e: any) => setMasteryFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                >
                  <option value="All">All Cards</option>
                  <option value="starred">⭐ Starred Only ({starredCardIds.size})</option>
                  <option value="review">Need Review (1d)</option>
                  <option value="learning">Learning (3d)</option>
                  <option value="mastered">Mastered (7d)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/70">
              <span>Showing <strong>{activeCards.length}</strong> of {currentDeck.cards.length} cards in this deck</span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('All');
                  setDifficultyFilter('All');
                  setMasteryFilter('All');
                  setSortBy('default');
                }}
                className="text-amber-700 hover:text-amber-800 font-semibold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timer Bar & Controls */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Timer Mode Selection */}
        <div className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-2xl border border-slate-700 text-xs">
          <button
            onClick={() => handleTimerModeChange('blitz15')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              timerMode === 'blitz15' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            ⚡ 15s Speed
          </button>
          <button
            onClick={() => handleTimerModeChange('blitz30')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              timerMode === 'blitz30' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            🎯 30s Blitz
          </button>
          <button
            onClick={() => handleTimerModeChange('challenge60')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              timerMode === 'challenge60' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            🔥 60s Challenge
          </button>
          <button
            onClick={() => handleTimerModeChange('stopwatch')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              timerMode === 'stopwatch' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            ⏱️ Stopwatch
          </button>
          <button
            onClick={() => handleTimerModeChange('untimed')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              timerMode === 'untimed' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            ♾️ Unlimited
          </button>
        </div>

        {/* Live Timer Display & Shuffle */}
        <div className="flex items-center space-x-3">
          {timerMode !== 'untimed' && (
            <div className="flex items-center space-x-2">
              <div
                className={`text-xl sm:text-2xl font-mono font-bold tracking-wider px-3 py-1 rounded-xl ${
                  timerSeconds <= 5 && timerMode.startsWith('blitz')
                    ? 'bg-rose-500/30 text-rose-300 animate-pulse border border-rose-500/50'
                    : 'bg-slate-800 text-amber-300 border border-slate-700'
                }`}
              >
                {formatTimer(timerSeconds)}
              </div>
              <button
                onClick={() => setIsTimerActive(!isTimerActive)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors cursor-pointer"
                title={isTimerActive ? 'Pause Timer' : 'Start Timer'}
              >
                {isTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>
              <button
                onClick={() => resetTimerForMode(timerMode)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={handleShuffle}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
            title="Shuffle Deck"
          >
            <Shuffle className="w-4 h-4" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>
        </div>
      </div>

      {/* Main Flashcard Arena by Study Mode */}
      {currentCard ? (
        <div className="space-y-4">
          {/* Card Meta & Mastery Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold text-slate-700">
              Card {cardIndex + 1} of {activeCards.length}
            </span>
            <div className="flex items-center space-x-3">
              <span className="font-medium">Mastery: {masteryPercentage}%</span>
              <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${masteryPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MODE 1: 3D FLIP MODE / SLIDESHOW MODE */}
          {/* ========================================================================= */}
          {(studyMode === 'flip' || studyMode === 'slideshow') && (
            <div className="space-y-4">
              {/* Flashcard Flip Card */}
              <div
                id="active-flashcard-flip-card"
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative w-full h-84 sm:h-96 cursor-pointer select-none perspective-1000"
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  className="w-full h-full relative preserve-3d"
                >
                  {/* Front of Card */}
                  <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between hover:border-amber-400 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {currentCard.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        {/* Pronounce TTS */}
                        <button
                          type="button"
                          onClick={(e) => handleSpeak(isReversedMode ? currentCard.back : currentCard.front, e)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          title="Read Aloud (TTS)"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        {/* Star Card */}
                        <button
                          type="button"
                          onClick={(e) => toggleStarCard(currentCard.id, e)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            starredCardIds.has(currentCard.id)
                              ? 'text-amber-500 bg-amber-50'
                              : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                          }`}
                          title="Bookmark / Star Card"
                        >
                          <Star className={`w-4 h-4 ${starredCardIds.has(currentCard.id) ? 'fill-amber-500' : ''}`} />
                        </button>

                        <span className="text-xs text-slate-400 font-mono font-medium">
                          {currentCard.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="text-center my-auto space-y-4 px-4">
                      <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                        {isReversedMode ? currentCard.back : currentCard.front}
                      </h3>
                      
                      <div className="flex items-center justify-center gap-2">
                        <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-bold shadow-2xs hover:bg-amber-100 transition-colors">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Click card to reveal Answer Behind</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <span>{isReversedMode ? 'Definition prompt' : 'Term / Formula prompt'}</span>
                      {progressData.cardMastery[currentCard.id] === 'mastered' ? (
                        <span className="text-emerald-600 font-bold flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Mastered (7d interval)</span>
                        </span>
                      ) : (
                        <span>Needs Review</span>
                      )}
                    </div>
                  </div>

                  {/* Back of Card - Full Answer Behind The Card */}
                  <div
                    style={{ transform: 'rotateY(180deg)' }}
                    className="absolute inset-0 backface-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between border-2 border-indigo-500/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isReversedMode ? 'Target Word / Concept' : 'Answer Behind Flashcard'}</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => handleSpeak(isReversedMode ? currentCard.front : currentCard.back, e)}
                          className="p-2 text-indigo-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                          title="Read Aloud Answer"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-indigo-300 font-mono font-bold">
                          {isReversedMode ? currentCard.back.slice(0, 20) + '...' : currentCard.front}
                        </span>
                      </div>
                    </div>

                    <div className="my-auto space-y-3.5 text-center px-4 overflow-y-auto max-h-[65%] custom-scrollbar">
                      <div className="text-xs uppercase tracking-wider font-bold text-amber-300">
                        {isReversedMode ? 'Corresponding Concept:' : 'Accurate Definition & Breakdown:'}
                      </div>

                      <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed whitespace-pre-line max-w-xl mx-auto">
                        {isReversedMode ? currentCard.front : currentCard.back}
                      </p>

                      {currentCard.mnemonic && (
                        <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-medium max-w-md mx-auto flex items-center space-x-2 text-left">
                          <Lightbulb className="w-4 h-4 shrink-0 text-amber-400" />
                          <span><strong>Mnemonic Hook:</strong> {currentCard.mnemonic}</span>
                        </div>
                      )}

                      {currentCard.example && (
                        <div className="text-xs text-indigo-200 italic max-w-md mx-auto bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-800/40 text-left">
                          <strong className="text-indigo-300 not-italic">Example in Context: </strong>"{currentCard.example}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-indigo-300 border-t border-white/10 pt-2">
                      <span className="flex items-center space-x-1">
                        <RotateCcw className="w-3 h-3" />
                        <span>Click card to return to front</span>
                      </span>
                      <span className="text-amber-300/80 font-mono">
                        Difficulty: {currentCard.difficulty}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Slideshow Speed Controller */}
              {studyMode === 'slideshow' && (
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                      className="py-1.5 px-3 bg-amber-500 text-slate-950 font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                    >
                      {isSlideshowPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
                      <span>{isSlideshowPlaying ? 'Pause Slideshow' : 'Start Auto Slideshow'}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Flip Interval:</span>
                    {[3, 5, 8].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setSlideshowSpeed(sec)}
                        className={`px-2 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer ${
                          slideshowSpeed === sec
                            ? 'bg-purple-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating & Navigation Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevCard}
                    className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>

                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="p-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                    title="Flip Flashcard to Reveal or Hide Answer Behind"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{isFlipped ? 'Show Front Question' : 'Reveal Answer Behind'}</span>
                  </button>

                  <button
                    onClick={handleNextCard}
                    className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* SRS Spaced Repetition Rating Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRateCard('review')}
                    className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Need Review (1d)
                  </button>
                  <button
                    onClick={() => handleRateCard('learning')}
                    className="py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Getting It (3d)
                  </button>
                  <button
                    onClick={() => handleRateCard('mastered')}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Mastered! (7d) ★
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: MULTIPLE CHOICE QUIZ CHALLENGE */}
          {/* ========================================================================= */}
          {studyMode === 'quiz' && (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
              {/* Quiz Scoreboard Banner */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Rapid Choice Arena</h3>
                    <div className="text-xs text-slate-500">Pick the accurate match</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs font-semibold">
                  <span className="text-slate-600">
                    Score: <strong>{quizScore.correct}</strong> / {quizScore.total}
                  </span>
                  <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Streak: {quizScore.streak}</span>
                  </div>
                </div>
              </div>

              {/* Question Card */}
              <div className="p-6 bg-slate-900 text-white rounded-2xl text-center space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                  {isReversedMode ? 'Match Definition to Term:' : 'What is the definition of:'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {isReversedMode ? currentCard.back : currentCard.front}
                </h2>
              </div>

              {/* 4 Choices Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quizOptions.map((opt, idx) => {
                  const isCorrect = opt === (isReversedMode ? currentCard.front : currentCard.back);
                  const isChosen = selectedQuizOption === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizChoice(opt)}
                      disabled={quizSubmitted}
                      className={`p-4 rounded-2xl border text-left text-xs font-medium leading-relaxed transition-all cursor-pointer ${
                        quizSubmitted
                          ? isCorrect
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400'
                            : isChosen
                            ? 'bg-rose-50 border-rose-400 text-rose-900'
                            : 'border-slate-200 text-slate-400 opacity-60'
                          : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <span className="font-bold text-slate-400 mr-2">{String.fromCharCode(65 + idx)}.</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quiz Feedback & Next Button */}
              {quizSubmitted && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in">
                  <div className="text-xs">
                    {selectedQuizOption === (isReversedMode ? currentCard.front : currentCard.back) ? (
                      <span className="text-emerald-700 font-bold flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Spot on! Card marked as Mastered.</span>
                      </span>
                    ) : (
                      <span className="text-rose-700 font-semibold flex items-center space-x-1.5">
                        <AlertCircle className="w-4 h-4" />
                        <span>Incorrect. Card scheduled for 1-day review.</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleNextCard}
                    className="py-2 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Next Challenge</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 3: ACTIVE RECALL / TYPING MODE */}
          {/* ========================================================================= */}
          {studyMode === 'type' && (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Active Recall Prompt</h3>
                    <div className="text-xs text-slate-500">Type the exact term or formula</div>
                  </div>
                </div>

                <button
                  onClick={() => setShowMnemonicHint(!showMnemonicHint)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>{showMnemonicHint ? 'Hide Hint' : 'Reveal Hint'}</span>
                </button>
              </div>

              {/* Prompt Box */}
              <div className="p-6 bg-slate-900 text-white rounded-2xl text-center space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                  {isReversedMode ? 'Define this concept in your own words:' : 'Provide the definition / formula for:'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {isReversedMode ? currentCard.back : currentCard.front}
                </h2>
              </div>

              {/* Hint Box */}
              {showMnemonicHint && currentCard.mnemonic && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs animate-in fade-in">
                  💡 <strong>Memory Hook:</strong> {currentCard.mnemonic}
                </div>
              )}

              {/* Type Input Form */}
              <form onSubmit={handleCheckTypedAnswer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your Response:
                  </label>
                  <input
                    type="text"
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder="Type definition or word here..."
                    required
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Reveal Full Answer First
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Submit & Evaluate Answer
                  </button>
                </div>
              </form>

              {/* Typing Feedback */}
              {typingFeedback !== 'idle' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="text-xs">
                    {typingFeedback === 'correct' ? (
                      <span className="text-emerald-700 font-bold flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Great job! Your recall is accurate.</span>
                      </span>
                    ) : (
                      <span className="text-rose-700 font-semibold flex items-center space-x-1.5">
                        <AlertCircle className="w-4 h-4" />
                        <span>Keep practicing! Inspect the canonical definition below.</span>
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed">
                    <strong>Official Definition: </strong>
                    {isReversedMode ? currentCard.front : currentCard.back}
                  </div>

                  <button
                    onClick={handleNextCard}
                    className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer ml-auto"
                  >
                    <span>Next Card</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
          <p>No flashcards matched your filter criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('All');
              setDifficultyFilter('All');
              setMasteryFilter('All');
            }}
            className="py-2 px-4 bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Deck Answers Directory (Behind The Flashcards) */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/70 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                All Answers Behind Flashcards ({activeCards.length} Cards)
              </h3>
              <p className="text-xs text-slate-500">
                Browse, search, and verify all questions and corresponding answers in this deck
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAllDeckAnswers(!showAllDeckAnswers)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <span>{showAllDeckAnswers ? 'Hide Answers' : 'View All Answers Behind'}</span>
          </button>
        </div>

        {showAllDeckAnswers && (
          <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
              {activeCards.map((card, idx) => (
                <div
                  key={card.id}
                  onClick={() => {
                    setCardIndex(idx);
                    setIsFlipped(true);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    cardIndex === idx
                      ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-400/50 shadow-xs'
                      : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">
                      #{idx + 1} {card.front}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {card.category}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 text-slate-100 text-xs font-medium space-y-1">
                    <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                      Answer Behind Card:
                    </div>
                    <p className="leading-relaxed">{card.back}</p>
                  </div>

                  {card.mnemonic && (
                    <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 flex items-center space-x-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span><strong>Hook:</strong> {card.mnemonic}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {printSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Printable Study Sheet</h3>
                <p className="text-xs text-slate-500">{currentDeck.title} ({activeCards.length} cards)</p>
              </div>
              <button onClick={() => setPrintSheetOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {activeCards.map((card, i) => (
                  <div key={card.id} className="p-3 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{i + 1}. {card.front}</span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">{card.category}</span>
                    </div>
                    <p className="text-slate-600">{card.back}</p>
                    {card.mnemonic && (
                      <div className="text-[11px] text-amber-700 italic">Mnemonic: {card.mnemonic}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => setPrintSheetOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Deck</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Card Modal */}
      {newCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Create Custom Flashcard</h3>
              <button onClick={() => setNewCardModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddCustomCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Front (Term, Formula, or Word)</label>
                <input
                  type="text"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. Obsequious or Vertex of Parabola"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Back (Definition, Formula, or Explanation)</label>
                <textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. Obedient or attentive to an excessive degree..."
                  required
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="Vocab">Vocabulary</option>
                    <option value="Math">Math Formula</option>
                    <option value="Grammar">Grammar Rule</option>
                    <option value="Strategy">Exam Strategy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e: any) => setNewDifficulty(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Very Hard">Very Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mnemonic / Shortcut (Optional)</label>
                <input
                  type="text"
                  value={newMnemonic}
                  onChange={(e) => setNewMnemonic(e.target.value)}
                  placeholder="Memory hook..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewCardModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Add Card to Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
