import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Flame,
  ArrowRight,
  GraduationCap,
  Calculator,
  Layers,
  BookOpen,
  Award,
  ChevronRight,
  TrendingUp,
  Check,
  Star,
  Activity,
  Compass,
} from 'lucide-react';
import { UserProfile } from '../types';
import { AppLogo } from './AppLogo';

interface AnimatedLoginScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
  currentUser?: UserProfile;
}

const AVATARS = ['🎓', '⚡', '🦉', '🚀', '🧠', '🌟', '🏆', '🎯'];

interface DemoProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  targetScore: number;
  testDate: string;
  dailyGoalQuestions: number;
  streak: number;
  badge: string;
  tagline: string;
  accent: string;
}

const DEMO_PROFILES: DemoProfile[] = [
  {
    id: 'user_track_ivy',
    name: 'Scholar Track 1550+',
    email: 'scholar1550@education.digital.online',
    avatar: '🎓',
    targetScore: 1550,
    testDate: '2026-10-03',
    dailyGoalQuestions: 25,
    streak: 7,
    badge: 'Ivy League Track',
    tagline: 'Advanced Math, Desmos & Reading Conventions',
    accent: 'from-indigo-600 to-blue-600',
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
    badge: '1600 Perfect Score',
    tagline: 'Math 800 Specialist • Hard Module Mastery',
    accent: 'from-purple-600 to-indigo-600',
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
    badge: '1480+ Honors Tier',
    tagline: 'R&W Expression of Ideas & Rhetorical Synthesis',
    accent: 'from-blue-600 to-teal-600',
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
    badge: 'Foundational Jump',
    tagline: 'Easy-to-Hard Adaptive Progression & Timing',
    accent: 'from-emerald-600 to-green-600',
  },
];

const FLOATING_FORMULAS = [
  { text: 'x = (-b ± √(b² - 4ac)) / 2a', top: '12%', left: '8%', delay: 0 },
  { text: 'A = πr² • (θ / 360°)', top: '22%', right: '10%', delay: 1.2 },
  { text: 'sin²(θ) + cos²(θ) = 1', bottom: '18%', left: '12%', delay: 2.4 },
  { text: 'y = mx + b', top: '70%', right: '14%', delay: 0.8 },
  { text: 'Target 1600 🎯', top: '45%', left: '5%', delay: 1.8 },
  { text: 'education digital . online', bottom: '32%', right: '8%', delay: 2.0 },
];

export const AnimatedLoginScreen: React.FC<AnimatedLoginScreenProps> = ({
  onLoginSuccess,
  currentUser,
}) => {
  // Default to clean email login tab (not auto-filling)
  const [activeTab, setActiveTab] = useState<'email' | 'signup' | 'quick'>('email');

  // Form states - completely blank (no auto-fill!)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('🎓');
  const [fullName, setFullName] = useState('');
  const [targetScore, setTargetScore] = useState(1550);
  const [testDate, setTestDate] = useState('2026-10-03');
  const [dailyGoal, setDailyGoal] = useState(25);

  // Animation & Transition states
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatusText, setAuthStatusText] = useState('');
  const [isSuccessPortal, setIsSuccessPortal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const triggerConfettiExplosion = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
    });
  };

  const executeLoginAnimation = (profile: UserProfile) => {
    setIsAuthenticating(true);
    setAuthStatusText(`Authenticating ${profile.name}...`);

    setTimeout(() => {
      setAuthStatusText('Unlocking Digital SAT 2026 Full Master Suite...');
      setTimeout(() => {
        setIsAuthenticating(false);
        setIsSuccessPortal(true);
        triggerConfettiExplosion();

        setTimeout(() => {
          onLoginSuccess(profile);
        }, 850);
      }, 700);
    }, 600);
  };

  // Quick 1-Click Profile Login
  const handleQuickLogin = (demo: DemoProfile) => {
    setErrorMessage('');
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
    executeLoginAnimation(profile);
  };

  // Standard Email / Password Login
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your student email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    const userName = email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const profile: UserProfile = {
      id: `user_${Date.now()}`,
      name: userName || 'SAT Scholar',
      email: email.trim(),
      avatar: '🎓',
      targetScore: 1550,
      testDate: '2026-10-03',
      dailyGoalQuestions: 25,
      streak: 5,
      lastActiveDate: new Date().toISOString(),
      unlimitedAccessGranted: true,
    };
    executeLoginAnimation(profile);
  };

  // Sign Up / New Scholar Creation
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter a valid student email.');
      return;
    }

    const profile: UserProfile = {
      id: `user_${Date.now()}`,
      name: fullName.trim(),
      email: email.trim(),
      avatar: selectedAvatar,
      targetScore: targetScore,
      testDate: testDate,
      dailyGoalQuestions: dailyGoal,
      streak: 1,
      lastActiveDate: new Date().toISOString(),
      unlimitedAccessGranted: true,
    };
    executeLoginAnimation(profile);
  };

  // Instant Guest Bypass
  const handleInstantGuest = () => {
    const guest: UserProfile = {
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
    executeLoginAnimation(guest);
  };

  return (
    <div
      id="animated-starting-login-root"
      className="min-h-screen relative flex items-center justify-center bg-slate-950 text-slate-100 overflow-hidden font-sans p-4 sm:p-6 md:p-8 selection:bg-indigo-500 selection:text-white"
    >
      {/* Dynamic Animated Ambient Background Glows */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-blue-500/30 rounded-full blur-[140px] pointer-events-none -top-24 -left-24"
      />
      <motion.div
        animate={{
          scale: [1.1, 0.9, 1.1],
          opacity: [0.25, 0.45, 0.25],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute w-[650px] h-[650px] bg-gradient-to-bl from-blue-600/30 via-indigo-600/20 to-emerald-500/20 rounded-full blur-[150px] pointer-events-none -bottom-24 -right-24"
      />

      {/* Floating Animated SAT Formulas in the Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        {FLOATING_FORMULAS.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 5 + idx,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
            style={{
              position: 'absolute',
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
            }}
            className="text-xs font-mono font-bold bg-white/5 border border-white/10 text-indigo-200/80 px-3 py-1.5 rounded-full backdrop-blur-xs shadow-sm"
          >
            {item.text}
          </motion.div>
        ))}
      </div>

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={
          isSuccessPortal
            ? { opacity: 0, scale: 1.1, y: -40 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-4xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Left Side: Brand Identity & Feature Highlights (Desktop) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900/60 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Light */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="space-y-4">
            <AppLogo
              size="lg"
              variant="dark"
              showSubtitle={false}
            />

            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Adaptive practice from <strong className="text-emerald-400">Easy</strong> to <strong className="text-purple-400">Very Hard (800)</strong>, Desmos graphing tools, timed flashcards, and video masterclasses.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center space-x-3 text-xs text-slate-300 bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/40 text-indigo-300 flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200">Built-in Desmos & Formulas</div>
                  <div className="text-[11px] text-slate-400">Official College Board graphing & reference</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-300 bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-600/40 text-amber-300 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200">Rapid Flashcards & Timers</div>
                  <div className="text-[11px] text-slate-400">30s Blitz, 60s Challenge & No Limits</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-300 bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/40 text-emerald-300 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200">Predicted Score Simulator</div>
                  <div className="text-[11px] text-slate-400">Real-time scaled score tracking (400-1600)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Access Pass Unlocked</span>
            </span>
            <span className="font-mono text-indigo-300 font-semibold">100% Free</span>
          </div>
        </div>

        {/* Right Side: Interactive Animated Login & Auth Interface */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-slate-900/60 relative">
          {/* Loading Animation Overlay */}
          <AnimatePresence>
            {isAuthenticating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4"
              >
                <div className="relative w-16 h-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xl">🎓</div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">{authStatusText}</h4>
                  <p className="text-xs text-indigo-300">Loading personalized preparation dashboard...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Portal Entry Celebration Screen */}
          <AnimatePresence>
            {isSuccessPortal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-30 bg-indigo-950/95 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-center space-y-3"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-20 h-20 bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 rounded-full flex items-center justify-center text-3xl shadow-lg"
                >
                  <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                <h3 className="text-2xl font-black text-white">Login Successful!</h3>
                <p className="text-xs text-indigo-200 max-w-xs">
                  Entering your Digital SAT Workspace... Unlimited practice & courses ready.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-5">
            {/* Top Tabs Switcher */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Student Login Portal</h2>
                <p className="text-xs text-slate-400">Choose instant profile or enter your credentials</p>
              </div>

              {/* Instant Guest Pill */}
              <button
                type="button"
                onClick={handleInstantGuest}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800/80 px-2.5 py-1 rounded-full flex items-center space-x-1 transition-all cursor-pointer"
              >
                <span>Guest Pass</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mode Segmented Controls */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                id="login-tab-email"
                type="button"
                onClick={() => {
                  setActiveTab('email');
                  setErrorMessage('');
                }}
                className={`relative flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeTab === 'email' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === 'email' && (
                  <motion.div
                    layoutId="startingTabPill"
                    className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center space-x-1">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </span>
              </button>

              <button
                id="login-tab-signup"
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMessage('');
                }}
                className={`relative flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeTab === 'signup' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === 'signup' && (
                  <motion.div
                    layoutId="startingTabPill"
                    className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center space-x-1">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>New Account</span>
                </span>
              </button>

              <button
                id="login-tab-quick"
                type="button"
                onClick={() => {
                  setActiveTab('quick');
                  setErrorMessage('');
                }}
                className={`relative flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeTab === 'quick' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === 'quick' && (
                  <motion.div
                    layoutId="startingTabPill"
                    className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Track Profiles</span>
                </span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2"
              >
                <span>⚠️ {errorMessage}</span>
              </motion.div>
            )}

            {/* TAB 1: QUICK 1-CLICK PROFILES (ANIMATED CARDS) */}
            {activeTab === 'quick' && (
              <motion.div
                key="tab-quick-view"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Select any pre-configured student to launch instantly:</span>
                  <span className="text-amber-400 font-mono text-[11px] font-semibold">1-Click Launch</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEMO_PROFILES.map((demo) => (
                    <motion.div
                      key={demo.id}
                      id={`starting-demo-profile-${demo.id}`}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleQuickLogin(demo)}
                      className="p-3.5 bg-slate-800/80 hover:bg-indigo-950/70 border border-slate-700/80 hover:border-indigo-500 rounded-2xl cursor-pointer transition-all space-y-2 group shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-lg shadow-inner group-hover:scale-105 transition-transform">
                            {demo.avatar}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {demo.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">Goal: {demo.targetScore}</div>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                          <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{demo.streak}d</span>
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 line-clamp-1">{demo.tagline}</div>

                      <div className="pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-indigo-400 font-semibold">{demo.badge}</span>
                        <span className="text-xs text-white font-bold group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                          <span>Enter</span>
                          <ArrowRight className="w-3 h-3 text-indigo-400" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 2: EMAIL & PASSWORD LOGIN */}
            {activeTab === 'email' && (
              <motion.form
                key="tab-email-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleEmailLogin}
                className="space-y-4"
              >
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Student Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="starting-login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scholar@satprep.io"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300">Password</label>
                    <span className="text-[11px] text-indigo-400 hover:underline cursor-pointer" onClick={() => setActiveTab('quick')}>
                      Need Demo Pass?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="starting-login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <motion.button
                  id="starting-login-submit-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer mt-2"
                >
                  <span>Log In & Enter Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.form>
            )}

            {/* TAB 3: NEW SCHOLAR REGISTRATION */}
            {activeTab === 'signup' && (
              <motion.form
                key="tab-signup-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignupSubmit}
                className="space-y-3.5"
              >
                {/* Avatar Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Select Scholar Avatar</label>
                  <div className="flex flex-wrap gap-2">
                    {AVATARS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all ${
                          selectedAvatar === av
                            ? 'border-indigo-500 bg-indigo-600/40 shadow-xs ring-2 ring-indigo-500/30 text-white'
                            : 'border-slate-800 bg-slate-950 hover:bg-slate-800'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@education.digital.online"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Target Score & Test Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">Target SAT Score</label>
                    <select
                      value={targetScore}
                      onChange={(e) => setTargetScore(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value={1600}>1600 (Perfect Score)</option>
                      <option value={1550}>1550+ (Ivy League)</option>
                      <option value={1500}>1500+ (Top 25)</option>
                      <option value={1400}>1400+ (Honors)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">Exam Test Date</label>
                    <input
                      type="date"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer mt-2"
                >
                  <span>Create Account & Start Prepping</span>
                  <CheckCircle2 className="w-4 h-4" />
                </motion.button>
              </motion.form>
            )}
          </div>

          {/* Quick Footer Links */}
          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Digital SAT Diagnostic Engine</span>
            </span>
            <button
              onClick={handleInstantGuest}
              className="text-indigo-400 hover:underline font-semibold"
            >
              Continue as Guest →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
