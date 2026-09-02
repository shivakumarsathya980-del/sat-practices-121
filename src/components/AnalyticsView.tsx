import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Flame,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Difficulty, Domain, PracticeSessionResult, UserProfile, UserProgressData } from '../types';
import { NavTab } from './Navbar';

interface AnalyticsViewProps {
  userProfile: UserProfile;
  progressData: UserProgressData;
  onNavigate: (tab: NavTab) => void;
  onStartPracticeWithDifficulty: (difficulty: Difficulty) => void;
  estimatedScore: { total: number; math: number; rw: number };
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  userProfile,
  progressData,
  onNavigate,
  onStartPracticeWithDifficulty,
  estimatedScore,
}) => {
  const totalSolved = progressData.questionsSolved;
  const totalCorrect = progressData.questionsCorrect;
  const overallAccuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 100;

  // Domain accuracy mapping
  const domains: Domain[] = [
    'Algebra',
    'Advanced Math',
    'Problem Solving & Data Analysis',
    'Geometry & Trigonometry',
    'Craft & Structure',
    'Information & Ideas',
    'Standard English Conventions',
    'Expression of Ideas',
  ];

  // Difficulty accuracy list
  const difficultyStats = (['Easy', 'Medium', 'Hard', 'Very Hard'] as Difficulty[]).map((diff) => {
    const stat = progressData.difficultyAccuracy[diff] || { correct: 0, total: 0 };
    const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 100;
    return {
      difficulty: diff,
      correct: stat.correct,
      total: stat.total,
      accuracy: pct,
    };
  });

  return (
    <div id="analytics-view-container" className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Digital SAT Analytics & Diagnostics</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Comprehensive Progress Tracking</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time score estimation, domain-level diagnostics, and difficulty accuracy breakdowns.
            </p>
          </div>

          {/* Quick Score Metrics Badge */}
          <div className="flex items-center space-x-4 bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shrink-0">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Predicted Score</div>
              <div className="text-3xl font-black text-amber-300 flex items-baseline space-x-1">
                <span>{estimatedScore.total}</span>
                <span className="text-xs text-slate-400 font-normal">/ 1600</span>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <div className="text-xs space-y-0.5">
              <div>Math: <strong className="text-emerald-400">{estimatedScore.math}</strong></div>
              <div>R&W: <strong className="text-blue-400">{estimatedScore.rw}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-medium">Questions Attempted</div>
          <div className="text-2xl font-bold text-slate-900">{totalSolved}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Across all modules</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-medium">Overall Accuracy</div>
          <div className="text-2xl font-bold text-emerald-600">{overallAccuracy}%</div>
          <div className="text-[11px] text-slate-500">{totalCorrect} correct answers</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-medium">Flashcard Mastery</div>
          <div className="text-2xl font-bold text-amber-600">
            {Object.values(progressData.cardMastery).filter((s) => s === 'mastered').length}
          </div>
          <div className="text-[11px] text-slate-500">Cards mastered</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="text-slate-400 text-xs font-medium">Study Streak</div>
          <div className="text-2xl font-bold text-indigo-600 flex items-center space-x-1">
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
            <span>{userProfile.streak} days</span>
          </div>
          <div className="text-[11px] text-slate-500">Consistency multiplier</div>
        </div>
      </div>

      {/* Progress By Difficulty (Easy, Medium, Hard, Very Hard) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Accuracy by Starting Difficulty</h3>
            <p className="text-xs text-slate-500">Detailed performance across each difficulty tier.</p>
          </div>
          <button
            onClick={() => onNavigate('practice')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>Practice Test Builder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {difficultyStats.map((item) => {
            const isVeryHard = item.difficulty === 'Very Hard';
            return (
              <div
                key={item.difficulty}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
                    {item.difficulty}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{item.accuracy}%</span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.difficulty === 'Easy'
                        ? 'bg-emerald-500'
                        : item.difficulty === 'Medium'
                        ? 'bg-blue-500'
                        : item.difficulty === 'Hard'
                        ? 'bg-amber-500'
                        : 'bg-purple-600'
                    }`}
                    style={{ width: `${item.accuracy}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{item.correct} / {item.total} Solved</span>
                  <button
                    onClick={() => onStartPracticeWithDifficulty(item.difficulty)}
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    Train {item.difficulty} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Domain Mastery Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">SAT Domain & Skill Mastery</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domains.map((dom) => {
            const mastery = progressData.domainMastery[dom] || 75;
            const isWeak = mastery < 70;
            return (
              <div key={dom} className="p-3.5 rounded-xl border border-slate-200 space-y-2 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{dom}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isWeak ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {mastery}%
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isWeak ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${mastery}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Practice Sessions History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Practice Module Session History</h3>

        {progressData.sessionHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Module Name</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {progressData.sessionHistory.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{sess.moduleName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
                        {sess.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-600">{sess.estimatedScaledScore} pts</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-600">{sess.scorePercentage}%</span>{' '}
                      ({sess.correctCount}/{sess.totalQuestions})
                    </td>
                    <td className="py-3 px-4 text-slate-500">{Math.round(sess.timeSpentSeconds / 60)}m</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(sess.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
            No completed practice sessions yet. Launch a practice module to record your first score!
          </div>
        )}
      </div>
    </div>
  );
};
