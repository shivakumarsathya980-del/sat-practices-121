export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard';

export type Section = 'Math' | 'Reading & Writing';

export type MathDomain = 
  | 'Algebra' 
  | 'Advanced Math' 
  | 'Problem Solving & Data Analysis' 
  | 'Geometry & Trigonometry';

export type RWDomain = 
  | 'Craft & Structure' 
  | 'Information & Ideas' 
  | 'Standard English Conventions' 
  | 'Expression of Ideas';

export type Domain = MathDomain | RWDomain;

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface Question {
  id: string;
  section: Section;
  domain: Domain;
  topic: string;
  difficulty: Difficulty;
  passage?: string;
  question: string;
  options: QuestionOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  proTip?: string;
  mathDiagramType?: 'coordinate_plane' | 'circle' | 'triangle' | 'table' | 'box_plot' | 'graph';
  mathDiagramData?: any;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  category: 'Vocab' | 'Math' | 'Grammar' | 'Strategy';
  difficulty: Difficulty;
  mnemonic?: string;
  example?: string;
  isStarred?: boolean;
  tags?: string[];
  masteryStatus?: 'learning' | 'review' | 'mastered';
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  category: 'Vocab' | 'Math' | 'Grammar' | 'Strategy';
  color: string;
  cards: Flashcard[];
}

export interface NoteItem {
  id: string;
  title: string;
  category: 'Formulas' | 'Grammar Rules' | 'Reading Strategies' | 'Desmos Hacks' | 'Desmos Tricks' | 'High Yield Concepts' | 'Math Formulas';
  tags: string[];
  summary: string;
  content: string;
  section?: Section;
  keyFormulas?: string[];
  examples?: { prompt: string; solution: string }[];
  isBookmarked?: boolean;
}

export interface VideoChapter {
  timeSeconds: number;
  timeDisplay: string;
  title: string;
}

export interface VideoTranscriptLine {
  time: string;
  speaker: string;
  text: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
  summary: string;
  videoUrl?: string;
  videoEmbedUrl?: string;
  videoThumbnail?: string;
  instructor?: {
    name: string;
    role: string;
    score: string;
  };
  chapters?: VideoChapter[];
  transcript?: VideoTranscriptLine[];
  keyTakeaways?: string[];
  keyPoints?: string[];
  tips?: string[];
  practiceQuestionIds?: string[];
  checkpointQuiz?: {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  tagline?: string;
  duration: string;
  lessonsCount?: number;
  level: 'All Levels' | 'Foundational' | 'Advanced 750+' | 'Target 1600' | 'All Levels / Benchmark';
  category: 'Full Masterclass' | 'Math' | 'Reading & Writing' | 'Strategy' | 'Digital SAT Mastery';
  rating: number;
  enrollments?: number;
  enrolledCount?: number;
  iconName?: string;
  modules: CourseModule[];
}

export interface PracticeSessionResult {
  id: string;
  timestamp: string;
  moduleName: string;
  section: Section | 'Mixed Practice';
  difficulty: Difficulty | 'Mixed';
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  estimatedScaledScore: number;
  questionsSummary: {
    questionId: string;
    questionText: string;
    domain: string;
    difficulty: Difficulty;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timeSpentSeconds: number;
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  targetScore: number;
  testDate: string;
  targetMajor?: string;
  dailyGoalQuestions: number;
  streak: number;
  lastActiveDate: string;
  unlimitedAccessGranted: boolean;
}

export interface UserProgressData {
  questionsSolved: number;
  questionsCorrect: number;
  difficultyAccuracy: Record<Difficulty, { correct: number; total: number }>;
  domainMastery: Record<string, number>;
  cardMastery: Record<string, 'learning' | 'review' | 'mastered'>;
  sessionHistory: PracticeSessionResult[];
  courseProgress: Record<string, string[]>;
}
