import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ShieldCheck,
  Target,
  Zap,
  CheckCircle2,
  User,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Flame,
  Globe,
  Key,
  X,
  GraduationCap,
  Award,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { UserProfile } from '../types';
import { AppLogo } from './AppLogo';

interface AuthModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
  onClose?: () => void;
  initialMode?: 'login' | 'signup' | 'demo';
}

const AVATARS = ['🎓', '⚡', '🦉', '🚀', '🧠', '🌟', '🏆', '🎯'];

interface DemoUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  targetScore: number;
  testDate: string;
  dailyGoalQuestions: number;
  streak: number;
  levelTitle: string;
  badgeColor: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    id: 'user_track_ivy',
    name: 'Scholar Track 1550+',
    email: 'scholar1550@education.digital.online',
    avatar: '🎓',
    targetScore: 1550,
    testDate: '2026-10-03',
    dailyGoalQuestions: 25,
    streak: 7,
    levelTitle: 'Ivy League Track (1550+)',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'user_track_1600',
    name: 'Perfect 1600 Sprint',
    email: 'scholar1600@education.digital.online',
    avatar: '⚡',
    targetScore: 1600,
    testDate: '2026-11-07',
    dailyGoalQuestions: 40,
    streak: 14,
    levelTitle: 'Perfect 1600 Sprint (Math 800)',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'user_track_honors',
    name: 'Honors Tier 1480+',
    email: 'scholar1480@education.digital.online',
    avatar: '🧠',
    targetScore: 1480,
    testDate: '2026-12-05',
    dailyGoalQuestions: 20,
    streak: 4,
    levelTitle: 'R&W Honors Target (1480+)',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'user_track_foundations',
    name: 'Adaptive Foundations',
    email: 'scholar1400@education.digital.online',
    avatar: '🚀',
    targetScore: 1400,
    testDate: '2026-10-03',
    dailyGoalQuestions: 15,
    streak: 3,
    levelTitle: 'Foundational Climber (1400+)',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onComplete,
  onClose,
  initialMode = 'login',
}) => {
  const [authTab, setAuthTab] = useState<'login' | 'signup' | 'social'>('login');
  
  // Login fields - no autofill
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up fields
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [avatar, setAvatar] = useState('🎓');
  const [targetScore, setTargetScore] = useState(1550);
  const [testDate, setTestDate] = useState('2026-10-03');
  const [dailyGoalQuestions, setDailyGoalQuestions] = useState(25);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotToast, setShowForgotToast] = useState(false);

  if (!isOpen) return null;

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'Enter password', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score === 1) return { score: 25, text: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, text: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, text: 'Good (Strong)', color: 'bg-blue-500' };
    return { score: 100, text: 'Excellent (1600-Ready)', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(signupPassword);

  const triggerCelebration = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
    });
  };

  // Perform animated login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your student email address.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Authenticating credentials...');

    setTimeout(() => {
      setLoadingMessage('Verifying unlimited student access pass...');
      setTimeout(() => {
        setIsLoading(false);
        setLoginSuccess(true);
        triggerCelebration();

        const profile: UserProfile = {
          id: `user_${Date.now()}`,
          name: loginEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'SAT Scholar',
          email: loginEmail,
          avatar: '🎓',
          targetScore: 1550,
          testDate: '2026-10-03',
          dailyGoalQuestions: 25,
          streak: 5,
          lastActiveDate: new Date().toISOString(),
          unlimitedAccessGranted: true,
        };

        setTimeout(() => {
          onComplete(profile);
        }, 600);
      }, 700);
    }, 600);
  };

  // Handle Quick Demo Login
  const handleSelectDemoUser = (demo: DemoUser) => {
    setLoginEmail(demo.email);
    setLoginPassword('DigitalSAT2026!');
    setIsLoading(true);
    setLoadingMessage(`Logging in as ${demo.name}...`);

    setTimeout(() => {
      setIsLoading(false);
      setLoginSuccess(true);
      triggerCelebration();

      const profile: UserProfile = {
        id: demo.id,
        name: demo.name,
        email: demo.email,
        avatar: demo.avatar,
        targetScore: demo.targetScore,
        testDate: demo.testDate,
        dailyGoalQuestions: demo.dailyGoalQuestions,
        streak: demo.streak,
        lastActiveDate: new Date().toISOString(),
        unlimitedAccessGranted: true,
      };

      setTimeout(() => {
        onComplete(profile);
      }, 500);
    }, 750);
  };

  // Handle Sign Up
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim()) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMessage('Password should be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Creating your Digital SAT Scholar profile...');

    setTimeout(() => {
      setIsLoading(false);
      setLoginSuccess(true);
      triggerCelebration();

      const newProfile: UserProfile = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        email: signupEmail.trim(),
        avatar,
        targetScore,
        testDate,
        dailyGoalQuestions,
        streak: 1,
        lastActiveDate: new Date().toISOString(),
        unlimitedAccessGranted: true,
      };

      setTimeout(() => {
        onComplete(newProfile);
      }, 600);
    }, 900);
  };

  // Handle Google / Social 1-Click Login
  const handleSocialAuth = (provider: string) => {
    setIsLoading(true);
    setLoadingMessage(`Connecting to ${provider} Secure Auth...`);

    setTimeout(() => {
      setLoadingMessage('Syncing SAT diagnostic score data...');
      setTimeout(() => {
        setIsLoading(false);
        setLoginSuccess(true);
        triggerCelebration();

        const profile: UserProfile = {
          id: `social_${Date.now()}`,
          name: provider === 'Google' ? 'Google Scholar' : 'Verified Student',
          email: provider === 'Google' ? 'student@gmail.com' : 'student@school.edu',
          avatar: '🌟',
          targetScore: 1580,
          testDate: '2026-10-03',
          dailyGoalQuestions: 30,
          streak: 6,
          lastActiveDate: new Date().toISOString(),
          unlimitedAccessGranted: true,
        };

        setTimeout(() => {
          onComplete(profile);
        }, 500);
      }, 600);
    }, 700);
  };

  // Instant Guest Access
  const handleGuestAccess = () => {
    triggerCelebration();
    const guestProfile: UserProfile = {
      id: `guest_${Date.now()}`,
      name: 'Guest Scholar',
      email: 'guest@satprep.io',
      avatar: '🚀',
      targetScore: 1550,
      testDate: '2026-10-03',
      dailyGoalQuestions: 25,
      streak: 3,
      lastActiveDate: new Date().toISOString(),
      unlimitedAccessGranted: true,
    };
    onComplete(guestProfile);
  };

  return (
    <AnimatePresence>
      <div
        id="auth-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
      >
        {/* Animated Background Glow Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.55, 0.35],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none -top-12 -left-12"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute w-96 h-96 bg-blue-500/25 rounded-full blur-3xl pointer-events-none -bottom-12 -right-12"
        />

        {/* Modal Window */}
        <motion.div
          id="auth-modal-card"
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden relative z-10 my-auto"
        >
          {/* Close button if optional */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Header Banner with Animated Gradient & Badge */}
          <div className="relative bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 px-6 pt-7 pb-6 text-white text-center overflow-hidden">
            {/* Ambient pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none" />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 260 }}
              className="inline-flex items-center space-x-1.5 bg-white/15 border border-white/25 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider text-indigo-100 mb-2.5 shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Digital SAT 2026 • Full Access Unlocked</span>
            </motion.div>

            <div className="flex justify-center mb-2">
              <AppLogo
                size="md"
                variant="dark"
                showSubtitle={false}
              />
            </div>
            <p className="text-indigo-100 text-xs mt-1 max-w-sm mx-auto font-normal">
              Sign in or choose an instant profile to sync practice scores, flashcards & courses.
            </p>

            {/* Mode Tabs with Animated Slider */}
            <div className="mt-5 flex items-center justify-center bg-black/20 p-1 rounded-2xl backdrop-blur-md max-w-md mx-auto border border-white/10">
              <button
                id="auth-tab-login"
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setErrorMessage('');
                }}
                className={`relative flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 ${
                  authTab === 'login' ? 'text-slate-900' : 'text-indigo-100 hover:text-white'
                }`}
              >
                {authTab === 'login' && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center space-x-1">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </span>
              </button>

              <button
                id="auth-tab-signup"
                type="button"
                onClick={() => {
                  setAuthTab('signup');
                  setErrorMessage('');
                }}
                className={`relative flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 ${
                  authTab === 'signup' ? 'text-slate-900' : 'text-indigo-100 hover:text-white'
                }`}
              >
                {authTab === 'signup' && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center space-x-1">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </span>
              </button>

              <button
                id="auth-tab-social"
                type="button"
                onClick={() => {
                  setAuthTab('social');
                  setErrorMessage('');
                }}
                className={`relative flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 ${
                  authTab === 'social' ? 'text-slate-900' : 'text-indigo-100 hover:text-white'
                }`}
              >
                {authTab === 'social' && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fast Login</span>
                </span>
              </button>
            </div>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-30 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4"
            >
              <div className="relative w-16 h-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center text-xl">🎓</div>
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">{loadingMessage}</h4>
                <p className="text-xs text-slate-500">Preparing your personalized SAT preparation dashboard...</p>
              </div>
            </motion.div>
          )}

          {/* Success Overlay */}
          {loginSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl shadow-sm"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h3 className="text-lg font-bold text-slate-900">Welcome to SAT Prep Master!</h3>
              <p className="text-xs text-slate-600 max-w-xs">
                Unlimited questions, full flashcard timers, and all courses are unlocked.
              </p>
            </motion.div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Forgot Password Helper Toast */}
          <AnimatePresence>
            {showForgotToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-6 mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-800 text-xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Demo Mode Active: Click any 1-click student card below to login instantly!</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotToast(false)}
                  className="text-indigo-600 hover:text-indigo-900 font-bold ml-2"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Body Content Container */}
          <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* TAB 1: LOG IN */}
            {authTab === 'login' && (
              <motion.div
                key="tab-login"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Student Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-email-input"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="scholar@satprep.io"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowForgotToast(true)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-password-input"
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me & instant bypass */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>Remember on this device</span>
                    </label>

                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>256-bit Encrypted</span>
                    </span>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    id="submit-login-btn"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer"
                  >
                    <span>Log In to SAT Prep Master</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </form>

                {/* 1-Click Demo Profiles Section */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Or 1-Click Demo Student Logins</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Click to test instant login</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {DEMO_USERS.map((demo) => (
                      <motion.div
                        key={demo.id}
                        id={`demo-user-card-${demo.id}`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectDemoUser(demo)}
                        className="p-3 bg-slate-50/80 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl cursor-pointer transition-all space-y-1.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{demo.avatar}</span>
                            <div>
                              <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {demo.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">Goal: {demo.targetScore}</div>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${demo.badgeColor}`}>
                            {demo.streak}d 🔥
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>{demo.levelTitle}</span>
                          <span className="text-indigo-600 font-semibold group-hover:underline">Select →</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: SIGN UP */}
            {authTab === 'signup' && (
              <motion.div
                key="tab-signup"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  {/* Avatar Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Choose Scholar Avatar</label>
                    <div className="flex flex-wrap gap-2">
                      {AVATARS.map((av) => (
                        <motion.button
                          key={av}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setAvatar(av)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border transition-all ${
                            avatar === av
                              ? 'border-indigo-600 bg-indigo-50 shadow-xs ring-2 ring-indigo-500/20'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {av}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Full Name</label>
                      <input
                        id="signup-name-input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Taylor"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Email Address</label>
                      <input
                        id="signup-email-input"
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Password & Live Strength */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Create Password</label>
                    <input
                      id="signup-password-input"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />

                    {signupPassword && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Security: {strength.text}</span>
                          <span className="font-bold text-slate-700">{strength.score}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${strength.score}%` }}
                            className={`h-full ${strength.color} transition-all duration-300`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Target Score & Test Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Target SAT Score</label>
                      <select
                        value={targetScore}
                        onChange={(e) => setTargetScore(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      >
                        <option value={1600}>1600 (Perfect Score Goal)</option>
                        <option value={1550}>1550+ (Ivy League Tier)</option>
                        <option value={1500}>1500+ (Top 25 Tier)</option>
                        <option value={1400}>1400+ (Competitive Honors)</option>
                        <option value={1300}>1300+ (Foundational Goal)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Exam Test Date</label>
                      <input
                        type="date"
                        value={testDate}
                        onChange={(e) => setTestDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Daily Goal */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Daily Practice Commitment</label>
                    <select
                      value={dailyGoalQuestions}
                      onChange={(e) => setDailyGoalQuestions(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    >
                      <option value={15}>15 Questions / day (Light Pacing)</option>
                      <option value={25}>25 Questions / day (Recommended Standard)</option>
                      <option value={40}>40 Questions / day (Intensive 1550+ Prep)</option>
                      <option value={60}>60 Questions / day (Target 1600 Sprint)</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    id="submit-signup-btn"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>Create Free Scholar Account & Start</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* TAB 3: SOCIAL / 1-CLICK INSTANT ACCESS */}
            {authTab === 'social' && (
              <motion.div
                key="tab-social"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-center">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto text-lg">
                    ⚡
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Instant One-Click Sign In</h4>
                  <p className="text-xs text-slate-500">
                    Choose any connected provider or instant guest pass to bypass credentials and start testing right away.
                  </p>
                </div>

                {/* Google SSO */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleSocialAuth('Google')}
                  className="w-full py-3 px-4 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-3 shadow-2xs transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google Student Account</span>
                </motion.button>

                {/* Apple / Clever */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleSocialAuth('School SSO')}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-amber-300" />
                  <span>Sign In with School District / Clever SSO</span>
                </motion.button>

                {/* Instant Guest Scholar Pass */}
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleGuestAccess}
                    className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <span>Instant Guest Pass (No Registration Needed)</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer note */}
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Digital SAT Diagnostic Suite</span>
            </span>
            <span className="font-semibold text-indigo-600">Free & Unrestricted</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
