import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  CheckCircle,
  Layers,
  BookMarked,
  GraduationCap,
  BarChart3,
  Calculator,
  FileText,
  Edit3,
  Flame,
  User,
  Sparkles,
  LogIn,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Zap,
  Bot,
  Radio,
  Film,
} from 'lucide-react';
import { UserProfile } from '../types';
import { AppLogo } from './AppLogo';

export type NavTab =
  | 'dashboard'
  | 'chat'
  | 'voice'
  | 'veo-video'
  | 'practice'
  | 'flashcards'
  | 'notes'
  | 'courses'
  | 'analytics';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onOpenStartingLogin?: () => void;
  onOpenCalc: () => void;
  onOpenFormula: () => void;
  onOpenScratchpad: () => void;
  estimatedScore: { total: number; math: number; rw: number };
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  userProfile,
  onOpenProfile,
  onOpenStartingLogin,
  onOpenCalc,
  onOpenFormula,
  onOpenScratchpad,
  estimatedScore,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: Compass },
    { id: 'chat' as NavTab, label: 'AI Gemini Chat', icon: Bot, badge: 'Pro' },
    { id: 'voice' as NavTab, label: 'Live Voice', icon: Radio, badge: 'Live' },
    { id: 'veo-video' as NavTab, label: 'Veo 3 Video', icon: Film, badge: 'Veo' },
    { id: 'practice' as NavTab, label: 'Practice', icon: CheckCircle },
    { id: 'flashcards' as NavTab, label: 'Flashcards', icon: Layers },
    { id: 'notes' as NavTab, label: 'Notes', icon: BookMarked },
    { id: 'courses' as NavTab, label: 'Courses', icon: GraduationCap },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
  ];


  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <AppLogo
            size="md"
            variant="light"
            onClick={() => onTabChange('dashboard')}
          />

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'text-indigo-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl shadow-2xs"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools & Animated Login Option */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Digital Exam Tools */}
            <div className="hidden sm:flex items-center space-x-1 bg-slate-100 border border-slate-200/80 rounded-lg p-1">
              <button
                id="header-desmos-btn"
                onClick={onOpenCalc}
                title="Desmos Graphing Calculator"
                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-md transition-colors text-xs flex items-center space-x-1"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Desmos</span>
              </button>

              <button
                id="header-formula-btn"
                onClick={onOpenFormula}
                title="SAT Formula Sheet"
                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-md transition-colors text-xs flex items-center space-x-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Formulas</span>
              </button>

              <button
                id="header-scratchpad-btn"
                onClick={onOpenScratchpad}
                title="Scratchpad & Notes"
                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-md transition-colors text-xs flex items-center space-x-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Scratchpad</span>
              </button>
            </div>

            {/* Streak Counter */}
            <div
              title={`${userProfile.streak} Day Study Streak`}
              className="flex items-center space-x-1 bg-amber-50 border border-amber-200/80 text-amber-800 px-2.5 py-1 rounded-xl text-xs font-semibold shadow-2xs"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{userProfile.streak}d</span>
            </div>

            {/* Estimated Score Badge */}
            <div
              onClick={() => onTabChange('analytics')}
              className="cursor-pointer hidden md:flex items-center space-x-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-xl shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-bold">{estimatedScore.total}</span>
              <span className="text-[10px] text-indigo-200 font-medium">/ 1600</span>
            </div>

            {/* Prominent Animated Login / Account Switcher Button */}
            <div className="relative">
              <motion.button
                id="header-login-account-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                }}
                className="flex items-center space-x-2 py-1.5 px-2.5 sm:px-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl shadow-sm border border-slate-800 hover:shadow-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600/80 border border-indigo-400/40 flex items-center justify-center text-sm shadow-inner group-hover:scale-105 transition-transform">
                  {userProfile.avatar || '🎓'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-100 max-w-[110px] truncate leading-tight">
                    {userProfile.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-indigo-300 font-mono leading-none">
                    Target: {userProfile.targetScore}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-300 group-hover:text-white transition-colors" />
              </motion.button>

              {/* Animated Profile & Login Dropdown */}
              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden text-xs"
                    >
                      {/* User Info Header */}
                      <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{userProfile.avatar}</span>
                          <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/20 font-semibold">
                            PRO SCHOLAR
                          </span>
                        </div>
                        <div className="font-bold text-sm text-slate-100 truncate">{userProfile.name}</div>
                        <div className="text-[11px] text-indigo-200 truncate">{userProfile.email}</div>
                        <div className="pt-2 flex items-center justify-between text-[11px] text-indigo-300 border-t border-white/10">
                          <span>Target: {userProfile.targetScore}</span>
                          <span>Streak: {userProfile.streak}d 🔥</span>
                        </div>
                      </div>

                      {/* Menu Actions */}
                      <div className="p-2 space-y-1 bg-white">
                        <button
                          id="dropdown-open-login-modal"
                          onClick={() => {
                            setDropdownOpen(false);
                            if (onOpenStartingLogin) {
                              onOpenStartingLogin();
                            } else {
                              onOpenProfile();
                            }
                          }}
                          className="w-full text-left p-2.5 hover:bg-indigo-50 rounded-xl flex items-center space-x-2.5 text-slate-700 hover:text-indigo-700 transition-colors font-semibold"
                        >
                          <LogIn className="w-4 h-4 text-indigo-600" />
                          <div>
                            <div>Log In / Switch Account</div>
                            <div className="text-[10px] text-slate-400 font-normal">Open animated login screen</div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenProfile();
                          }}
                          className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-center space-x-2.5 text-slate-700 transition-colors"
                        >
                          <Zap className="w-4 h-4 text-amber-500" />
                          <div>
                            <div className="font-semibold">Customize Target & Goals</div>
                            <div className="text-[10px] text-slate-400">Update score goal & test date</div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onTabChange('analytics');
                          }}
                          className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-center space-x-2.5 text-slate-700 transition-colors"
                        >
                          <BarChart3 className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div className="font-semibold">View Full Analytics</div>
                            <div className="text-[10px] text-slate-400">Score prediction & domain mastery</div>
                          </div>
                        </button>

                        <div className="border-t border-slate-100 my-1" />

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            if (onOpenStartingLogin) {
                              onOpenStartingLogin();
                            } else {
                              onOpenProfile();
                            }
                          }}
                          className="w-full text-left p-2.5 hover:bg-rose-50 text-rose-600 rounded-xl flex items-center space-x-2.5 transition-colors font-semibold"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Log Out / Change Profile</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-100 gap-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`whitespace-nowrap flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  isActive ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
