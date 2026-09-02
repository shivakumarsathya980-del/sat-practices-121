import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PracticeModuleView } from './components/PracticeModuleView';
import { FlashcardsView } from './components/FlashcardsView';
import { NotesView } from './components/NotesView';
import { CoursesView } from './components/CoursesView';
import { AnalyticsView } from './components/AnalyticsView';
import { GeminiChatbotView } from './components/GeminiChatbotView';
import { LiveVoiceCoachView } from './components/LiveVoiceCoachView';
import { VeoVideoStudioView } from './components/VeoVideoStudioView';
import { AuthModal } from './components/AuthModal';
import { AnimatedLoginScreen } from './components/AnimatedLoginScreen';
import { GraphingCalculatorModal } from './components/GraphingCalculatorModal';
import { FormulaSheetModal } from './components/FormulaSheetModal';
import { ScratchpadModal } from './components/ScratchpadModal';
import { Difficulty, PracticeSessionResult, UserProfile, UserProgressData } from './types';

const INITIAL_PROFILE: UserProfile = {
  id: 'user_sat_scholar',
  name: 'Scholar',
  email: 'scholar@education.digital.online',
  avatar: '🎓',
  targetScore: 1550,
  testDate: '2026-10-03',
  dailyGoalQuestions: 25,
  streak: 5,
  lastActiveDate: new Date().toISOString(),
  unlimitedAccessGranted: true,
};

const INITIAL_PROGRESS: UserProgressData = {
  questionsSolved: 42,
  questionsCorrect: 37,
  difficultyAccuracy: {
    Easy: { correct: 14, total: 15 },
    Medium: { correct: 13, total: 15 },
    Hard: { correct: 7, total: 8 },
    'Very Hard': { correct: 3, total: 4 },
  },
  domainMastery: {
    Algebra: 88,
    'Advanced Math': 82,
    'Problem Solving & Data Analysis': 90,
    'Geometry & Trigonometry': 79,
    'Craft & Structure': 85,
    'Information & Ideas': 84,
    'Standard English Conventions': 92,
    'Expression of Ideas': 86,
  },
  cardMastery: {
    fc_1: 'mastered',
    fc_2: 'learning',
    fc_3: 'mastered',
    fc_4: 'learning',
    fc_5: 'mastered',
    fc_6: 'review',
    fc_7: 'mastered',
  },
  sessionHistory: [
    {
      id: 'sess_1',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      moduleName: 'Medium Benchmark Practice (All Domains)',
      section: 'Mixed Practice',
      difficulty: 'Medium',
      totalQuestions: 15,
      correctCount: 13,
      scorePercentage: 87,
      timeSpentSeconds: 1240,
      estimatedScaledScore: 1470,
      questionsSummary: [],
    },
    {
      id: 'sess_2',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      moduleName: 'Hard Math Module (Advanced Math)',
      section: 'Math',
      difficulty: 'Hard',
      totalQuestions: 10,
      correctCount: 9,
      scorePercentage: 90,
      timeSpentSeconds: 890,
      estimatedScaledScore: 1510,
      questionsSummary: [],
    },
  ],
  courseProgress: {
    course_1600_masterclass: ['c1_m1_l1', 'c1_m1_l2'],
    course_math_mastery: ['c2_m1_l1'],
  },
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [practiceDifficulty, setPracticeDifficulty] = useState<Difficulty>('Medium');

  // Starting Animated Login State (Start at animated login screen)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem('sat_prep_session_active'));
  });

  // Persistence State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sat_prep_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PROFILE;
      }
    }
    return INITIAL_PROFILE;
  });

  const [hasCompletedInitialAuth, setHasCompletedInitialAuth] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('sat_prep_auth_completed'));
  });

  const [progressData, setProgressData] = useState<UserProgressData>(() => {
    const saved = localStorage.getItem('sat_prep_progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PROGRESS;
      }
    }
    return INITIAL_PROGRESS;
  });

  // Modal open states
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [calcModalOpen, setCalcModalOpen] = useState<boolean>(false);
  const [formulaModalOpen, setFormulaModalOpen] = useState<boolean>(false);
  const [scratchpadModalOpen, setScratchpadModalOpen] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('sat_prep_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('sat_prep_progress', JSON.stringify(progressData));
  }, [progressData]);

  // Auth completion handler from modal
  const handleAuthComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setHasCompletedInitialAuth(true);
    localStorage.setItem('sat_prep_auth_completed', 'true');
    setAuthModalOpen(false);
  };

  // Starting Animated Login Completion
  const handleStartingLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsLoggedIn(true);
    setHasCompletedInitialAuth(true);
    sessionStorage.setItem('sat_prep_session_active', 'true');
    localStorage.setItem('sat_prep_auth_completed', 'true');
  };

  // Log Out or Switch User -> Return to Animated Login Screen
  const handleOpenStartingLogin = () => {
    sessionStorage.removeItem('sat_prep_session_active');
    setIsLoggedIn(false);
  };

  // Launch practice with specified difficulty directly from cards
  const handleStartPracticeWithDifficulty = (difficulty: Difficulty) => {
    setPracticeDifficulty(difficulty);
    setCurrentTab('practice');
  };

  // Session completion updater
  const handleSessionComplete = (result: PracticeSessionResult) => {
    const newSolved = progressData.questionsSolved + result.totalQuestions;
    const newCorrect = progressData.questionsCorrect + result.correctCount;

    // Update difficulty accuracy
    const currentDiffStat = progressData.difficultyAccuracy[result.difficulty as Difficulty] || {
      correct: 0,
      total: 0,
    };
    const updatedDiffStat = {
      correct: currentDiffStat.correct + result.correctCount,
      total: currentDiffStat.total + result.totalQuestions,
    };

    // Update domain mastery based on question performance
    const updatedDomainMastery = { ...progressData.domainMastery };
    result.questionsSummary.forEach((q) => {
      if (q.domain && updatedDomainMastery[q.domain] !== undefined) {
        const delta = q.isCorrect ? 3 : -2;
        updatedDomainMastery[q.domain] = Math.max(
          40,
          Math.min(100, updatedDomainMastery[q.domain] + delta)
        );
      }
    });

    setProgressData({
      ...progressData,
      questionsSolved: newSolved,
      questionsCorrect: newCorrect,
      difficultyAccuracy: {
        ...progressData.difficultyAccuracy,
        [result.difficulty as Difficulty]: updatedDiffStat,
      },
      domainMastery: updatedDomainMastery,
      sessionHistory: [result, ...progressData.sessionHistory],
    });
  };

  // Flashcard spaced repetition updater
  const handleUpdateCardMastery = (
    cardId: string,
    status: 'learning' | 'review' | 'mastered'
  ) => {
    setProgressData((prev) => ({
      ...prev,
      cardMastery: {
        ...prev.cardMastery,
        [cardId]: status,
      },
    }));
  };

  // Course lesson completion
  const handleUpdateCourseProgress = (courseId: string, lessonId: string) => {
    setProgressData((prev) => {
      const currentLessons = prev.courseProgress[courseId] || [];
      if (!currentLessons.includes(lessonId)) {
        return {
          ...prev,
          courseProgress: {
            ...prev.courseProgress,
            [courseId]: [...currentLessons, lessonId],
          },
        };
      }
      return prev;
    });
  };

  // Calculate estimated scaled SAT score (out of 1600: Math out of 800, R&W out of 800)
  const mathDomains = [
    'Algebra',
    'Advanced Math',
    'Problem Solving & Data Analysis',
    'Geometry & Trigonometry',
  ];
  const rwDomains = [
    'Craft & Structure',
    'Information & Ideas',
    'Standard English Conventions',
    'Expression of Ideas',
  ];

  const avgMathMastery =
    mathDomains.reduce((acc, d) => acc + (progressData.domainMastery[d] || 75), 0) /
    mathDomains.length;

  const avgRwMastery =
    rwDomains.reduce((acc, d) => acc + (progressData.domainMastery[d] || 75), 0) /
    rwDomains.length;

  const estimatedMath = Math.round(200 + (avgMathMastery / 100) * 600);
  const estimatedRw = Math.round(200 + (avgRwMastery / 100) * 600);
  const estimatedTotal = estimatedMath + estimatedRw;

  const estimatedScore = {
    total: Math.min(1600, Math.max(400, Math.round(estimatedTotal / 10) * 10)),
    math: Math.min(800, Math.max(200, Math.round(estimatedMath / 10) * 10)),
    rw: Math.min(800, Math.max(200, Math.round(estimatedRw / 10) * 10)),
  };

  // If user is not logged in, show animated login portal with Education Digital.Online branding
  if (!isLoggedIn) {
    return (
      <AnimatedLoginScreen
        onLoginSuccess={handleStartingLoginSuccess}
        currentUser={userProfile}
      />
    );
  }

  return (
    <div id="sat-prep-app-root" className="min-h-screen bg-sat-light-grid text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        userProfile={userProfile}
        onOpenProfile={() => setAuthModalOpen(true)}
        onOpenStartingLogin={handleOpenStartingLogin}
        onOpenCalc={() => setCalcModalOpen(true)}
        onOpenFormula={() => setFormulaModalOpen(true)}
        onOpenScratchpad={() => setScratchpadModalOpen(true)}
        estimatedScore={estimatedScore}
      />

      {/* Main App Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            userProfile={userProfile}
            progressData={progressData}
            onNavigate={setCurrentTab}
            onStartPracticeWithDifficulty={handleStartPracticeWithDifficulty}
            onOpenCalc={() => setCalcModalOpen(true)}
            onOpenFormula={() => setFormulaModalOpen(true)}
            onOpenProfile={handleOpenStartingLogin}
            estimatedScore={estimatedScore}
          />
        )}

        {currentTab === 'chat' && <GeminiChatbotView />}

        {currentTab === 'voice' && <LiveVoiceCoachView />}

        {currentTab === 'veo-video' && <VeoVideoStudioView />}

        {currentTab === 'practice' && (
          <PracticeModuleView
            initialDifficulty={practiceDifficulty}
            onOpenCalc={() => setCalcModalOpen(true)}
            onOpenFormula={() => setFormulaModalOpen(true)}
            onOpenScratchpad={() => setScratchpadModalOpen(true)}
            onSessionComplete={handleSessionComplete}
            progressData={progressData}
          />
        )}

        {currentTab === 'flashcards' && (
          <FlashcardsView
            progressData={progressData}
            onUpdateCardMastery={handleUpdateCardMastery}
          />
        )}

        {currentTab === 'notes' && <NotesView />}

        {currentTab === 'courses' && (
          <CoursesView
            progressData={progressData}
            onUpdateCourseProgress={handleUpdateCourseProgress}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            userProfile={userProfile}
            progressData={progressData}
            onNavigate={setCurrentTab}
            onStartPracticeWithDifficulty={handleStartPracticeWithDifficulty}
            estimatedScore={estimatedScore}
          />
        )}
      </main>

      {/* Modals & Exam Tools */}
      <AuthModal
        isOpen={authModalOpen}
        onComplete={handleAuthComplete}
        onClose={() => setAuthModalOpen(false)}
      />

      <GraphingCalculatorModal
        isOpen={calcModalOpen}
        onClose={() => setCalcModalOpen(false)}
      />

      <FormulaSheetModal
        isOpen={formulaModalOpen}
        onClose={() => setFormulaModalOpen(false)}
      />

      <ScratchpadModal
        isOpen={scratchpadModalOpen}
        onClose={() => setScratchpadModalOpen(false)}
      />
    </div>
  );
}
