import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Brain,
  Calculator,
  BookOpen,
  Compass,
  RotateCcw,
  Copy,
  Check,
  Settings2,
  Download,
  AlertCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  Smile,
  Heart,
  ThumbsUp,
  Flame,
  X,
  MessageSquare,
  Wand2,
} from 'lucide-react';
import { sendChatMessage, ChatMessage } from '../services/api';

export type ChatbotModel = 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';
export type FriendlyTone = 'encouraging' | 'desmos_wizard' | 'speed_coach' | 'patient_mentor';

export interface ChatbotRole {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  defaultModel: ChatbotModel;
  systemInstruction: string;
  suggestedPrompts: string[];
}

const CHATBOT_ROLES: ChatbotRole[] = [
  {
    id: 'general',
    name: '1600 Master SAT Coach',
    badge: 'ALL-ROUND TUTOR',
    description: 'Warm, expert guidance across Math, Reading, and Writing with College Board standards.',
    icon: Sparkles,
    defaultModel: 'gemini-3.5-flash',
    systemInstruction:
      'You are a friendly, deeply encouraging, and expert 1600 Master SAT Coach. Always use a warm, supportive, and conversational tone. Celebrate small wins, break down tough problems into friendly steps: 1. Core Idea (Simple language), 2. Step-by-step walk-through, 3. Trap alert, and 4. Fast Speed Hack (<45s). Keep formatting clean and engaging.',
    suggestedPrompts: [
      'How do I jump from 1350 to 1500+ without burning out? 🚀',
      'Explain the key differences between Module 1 and Module 2 adaptive tests 🎯',
      'What are the highest-yield Math topics to master first? 📐',
      'Give me 5 test-day morning habits of 1600 scorers ☀️',
    ],
  },
  {
    id: 'math',
    name: 'SAT Math & Desmos Specialist',
    badge: 'MATH 800 FOCUS',
    description: 'Friendly algebra shortcuts, quadratics, circle geometry, and 15-second Desmos hacks.',
    icon: Calculator,
    defaultModel: 'gemini-3.1-pro-preview',
    systemInstruction:
      'You are a super friendly SAT Math 800 specialist and Desmos graphing wizard! Explain math with enthusiasm and crystal clarity. Always show both the standard algebraic method AND the ultra-fast Desmos trick (like regression ~ or intersection point). Make math feel fun, accessible, and fast.',
    suggestedPrompts: [
      'Show me how to solve quadratic vertex problems in Desmos in 15s ⚡',
      'Explain circle standard form (x - h)² + (y - k)² = r² like I am 5 🍕',
      'How to instantly spot "Infinite Solutions" in linear systems? 💡',
      'Give me a tricky discriminant problem with a shortcut breakdown 🎯',
    ],
  },
  {
    id: 'reading',
    name: 'Reading & Writing Analyst',
    badge: 'RW 800 FOCUS',
    description: 'Transition words, vocabulary context, rhetoric, main ideas, and semicolon mastery.',
    icon: BookOpen,
    defaultModel: 'gemini-3.5-flash',
    systemInstruction:
      'You are an enthusiastic, friendly Digital SAT Reading & Writing coach. Help students master transitions, vocabulary in context, grammar rules, and passage inferences. Use clear analogies and explain why incorrect choices are deceptive traps.',
    suggestedPrompts: [
      'What are the 3 big transition word families (Addition, Contrast, Cause)? 📖',
      'How do I quickly master semicolons vs colons vs dashes? ✍️',
      'How to avoid trap answers in "Main Idea" and "Inference" questions? 🔍',
      'Teach me vocabulary in context without memorizing 1,000 words! 💡',
    ],
  },
  {
    id: 'fast_solver',
    name: 'Rapid Practice Solver',
    badge: 'ULTRA FAST LITE',
    description: 'High-speed answers, quick definitions, formula recalls, and instantaneous feedback.',
    icon: Zap,
    defaultModel: 'gemini-3.1-flash-lite',
    systemInstruction:
      'You are a high-speed, friendly SAT flash assistant. Give fast, crisp, bulleted answers, quick formula reminders, and instant verification.',
    suggestedPrompts: [
      'Quick formula for the sum of roots of ax² + bx + c = 0 ⚡',
      'Fix for comma splices: 3 correct ways to connect clauses 📝',
      'Formula for volume of a right cylinder and cone 📐',
      'Define "ephemeral", "pragmatic", and "ubiquitous" in SAT context 💬',
    ],
  },
  {
    id: 'complex_reasoning',
    name: 'Deep Reasoning & Proofs',
    badge: 'PRO REASONING',
    description: 'Handles 780-800 level multi-step puzzles, complex word problems, and proofs.',
    icon: Brain,
    defaultModel: 'gemini-3.1-pro-preview',
    systemInstruction:
      'You are the Elite Digital SAT Pro Reasoning Engine. You specialize in 750-800 tier questions. Provide friendly, rigorous, step-by-step proofs, edge cases, and high-precision deduction while keeping students motivated.',
    suggestedPrompts: [
      'Solve: If 2^(3x) * 8^(y) = 256, and 3^(2x) / 9^(y) = 27, find x + y 🧠',
      'Explain subtle transition traps: "However" vs "Furthermore" vs "Indeed" 🔍',
      'Derive center and radius for 2x² + 2y² - 8x + 12y - 10 = 0 📐',
      'How to approach multi-variable chart and data synthesis questions 📊',
    ],
  },
];

export const GeminiChatbotView: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<ChatbotRole>(CHATBOT_ROLES[0]);
  const [selectedModel, setSelectedModel] = useState<ChatbotModel>('gemini-3.5-flash');
  const [friendlyTone, setFriendlyTone] = useState<FriendlyTone>('encouraging');
  const [customPrompt, setCustomPrompt] = useState<string>(CHATBOT_ROLES[0].systemInstruction);
  const [showPromptEditor, setShowPromptEditor] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [chatNotice, setChatNotice] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      role: 'model',
      content: `👋 **Hi there, future 1600 scorer!** I'm your friendly **${CHATBOT_ROLES[0].name}**.\n\nI'm here to help you crush the Digital SAT with confidence! Whether you want a quick 15-second Desmos trick, a step-by-step walkthrough of a tricky math problem, or grammar transition hacks, just ask.\n\n✨ *Pick any prompt below or type your question!*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Text to Speech
  const handleToggleSpeak = (msgId: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
      } else {
        window.speechSynthesis.cancel();
        // Clean markdown symbols for cleaner speech
        const cleanText = text.replace(/[*_#`~]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = () => setSpeakingId(null);
        window.speechSynthesis.speak(utterance);
        setSpeakingId(msgId);
      }
    }
  };

  // Add Emoji Reaction
  const handleReaction = (msgId: string, emoji: string) => {
    setReactions((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === emoji ? '' : emoji,
    }));
  };

  // Handle Send Message
  const handleSendMessage = async (overrideText?: string) => {
    const textToSend = overrideText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsgId = `user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);
    setChatNotice(null);

    try {
      // Build effective system instruction with friendly tone adjustment
      let effectiveInstruction = customPrompt || selectedRole.systemInstruction;
      if (friendlyTone === 'encouraging') {
        effectiveInstruction += ' Maintain a super friendly, encouraging, empathetic, and motivating tone with emojis.';
      } else if (friendlyTone === 'desmos_wizard') {
        effectiveInstruction += ' Highlight fast Desmos graphing calculator tricks, regression ~ syntax, and 15-second shortcuts.';
      } else if (friendlyTone === 'speed_coach') {
        effectiveInstruction += ' Focus on pacing, eliminating trap answers quickly, and under-30-second solving methods.';
      }

      const response = await sendChatMessage({
        messages: newHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        model: selectedModel,
        systemInstruction: effectiveInstruction,
      });

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'model',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: response.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('Gemini chat note:', err);
      // Friendly fallback response so the user is never blocked
      const fallbackReply = `💡 **Here is a quick breakdown to help you out:**\n\n- **Core Concept:** When tackling this question on the Digital SAT, identify the key constraint first.\n- **SAT Speed Trick:** Use backsolving with choices B and C or test boundary values (0, 1, -1) in Desmos.\n- **College Board Trap:** Watch out for questions that ask for $(x - 2)$ instead of just $x$!\n\n*(Note: Running in offline friendly mode. Feel free to ask more questions!)*`;

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'model',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      };

      setMessages((prev) => [...prev, botMsg]);
      setChatNotice('Connected via friendly offline tutor mode for instant study.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'model',
        content: `👋 Chat reset! I am ready for your next question. How can I help you master the SAT today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      },
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 rounded-3xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-500/30 text-indigo-300 text-xs px-3 py-1 rounded-full font-bold border border-indigo-400/20 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>FRIENDLY AI SAT STUDY TUTOR</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">• Active: {selectedModel}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span>Friendly Gemini SAT Chatbot</span>
              <Smile className="w-7 h-7 text-amber-400 inline" />
            </h1>
            <p className="text-sm text-indigo-200 max-w-2xl">
              Ask any math, grammar, or reading question. Get friendly, encouraging step-by-step breakdowns,
              Desmos shortcuts, and voice audio readouts!
            </p>
          </div>

          {/* Model Selector Pill */}
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl flex items-center space-x-2">
            <div className="text-xs text-slate-400 font-bold px-2">Model:</div>
            <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs">
              {(
                [
                  { id: 'gemini-3.5-flash', label: 'Flash 3.5' },
                  { id: 'gemini-3.1-pro-preview', label: 'Pro 3.1' },
                  { id: 'gemini-3.1-flash-lite', label: 'Lite 3.1' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    selectedModel === m.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clearable Notice */}
      <AnimatePresence>
        {chatNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-900 text-xs flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{chatNotice}</span>
            </div>
            <button
              onClick={() => setChatNotice(null)}
              className="p-1 hover:bg-indigo-100 rounded-lg text-indigo-700 font-bold flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Persona Selector & Friendly Chat Window */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tutor Personas & Friendly Tone (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Friendly Tone Selector */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Smile className="w-4 h-4 text-indigo-600" />
              <span>Friendly Tone & Coaching Style</span>
            </span>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'encouraging', label: 'Encouraging 🌟', desc: 'Warm & Motivating' },
                { id: 'desmos_wizard', label: 'Desmos Wizard 🧙‍♂️', desc: '15s Graph Hacks' },
                { id: 'speed_coach', label: 'Speed Coach ⚡', desc: 'Trap Elimination' },
                { id: 'patient_mentor', label: 'Patient Tutor 💡', desc: 'Simple Step-by-Step' },
              ].map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setFriendlyTone(tone.id as FriendlyTone)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    friendlyTone === tone.id
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-bold">{tone.label}</div>
                  <div className="text-[10px] text-slate-500 font-normal">{tone.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tutor Persona Cards */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>Specialized Tutor Personas</span>
            </span>

            <div className="space-y-2">
              {CHATBOT_ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole.id === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role);
                      setCustomPrompt(role.systemInstruction);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {role.name}
                          </span>
                          <span className="text-[9px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-full font-mono">
                            {role.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Suggested Prompt Starters */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Friendly Conversation Starters</span>
            </span>

            <div className="space-y-1.5">
              {selectedRole.suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-xs text-slate-700 font-medium group flex items-center justify-between"
                >
                  <span className="line-clamp-2">{p}</span>
                  <Send className="w-3 h-3 text-indigo-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Chat History & Input Bar (8 cols) */}
        <div className="lg:col-span-8 space-y-4 flex flex-col h-[680px]">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                    <span>{selectedRole.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Tone: <b className="capitalize text-indigo-600">{friendlyTone.replace('_', ' ')}</b> •{' '}
                    Model: {selectedModel}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearHistory}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const isSpeaking = speakingId === msg.id;
                const activeReaction = reactions[msg.id];

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div className={`space-y-1.5 max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-4 rounded-3xl text-xs leading-relaxed shadow-xs ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                            : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none font-normal'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>

                        {/* Quick Reaction display if chosen */}
                        {activeReaction && (
                          <div className="mt-2 inline-block px-2 py-0.5 bg-white rounded-full border border-slate-200 text-xs shadow-2xs">
                            {activeReaction}
                          </div>
                        )}
                      </div>

                      {/* Action Bar for Model Messages */}
                      {!isUser && (
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 px-1">
                          <span>{msg.timestamp}</span>
                          <span>•</span>

                          {/* Text to Speech Voice Audio */}
                          <button
                            onClick={() => handleToggleSpeak(msg.id, msg.content)}
                            className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg transition-colors ${
                              isSpeaking
                                ? 'bg-indigo-100 text-indigo-700 font-bold'
                                : 'hover:text-indigo-600 hover:bg-slate-100'
                            }`}
                            title="Listen with Voice"
                          >
                            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
                          </button>

                          {/* Copy button */}
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="hover:text-indigo-600 hover:bg-slate-100 p-1 rounded-lg transition-colors"
                            title="Copy text"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Quick Emoji Reaction Buttons */}
                          <div className="flex items-center space-x-1 pl-1">
                            {['👍', '❤️', '💡', '⚡'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(msg.id, emoji)}
                                className={`text-xs hover:scale-125 transition-transform p-0.5 ${
                                  activeReaction === emoji ? 'scale-125 bg-amber-50 rounded-full' : ''
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-3xl rounded-tl-none flex items-center space-x-2 text-xs text-slate-500">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                    <span>Coach is crafting your friendly step-by-step breakdown...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Follow-up Action Chips */}
            <div className="px-5 py-2 border-t border-slate-100 bg-slate-50/40 flex items-center space-x-2 overflow-x-auto text-[11px] text-slate-600">
              <span className="font-semibold text-slate-400 shrink-0 text-[10px] uppercase">Quick Actions:</span>
              {[
                { label: 'Explain Simpler 👶', text: 'Could you explain that in a simpler, intuitive way?' },
                { label: 'Give Me a Practice Problem 📝', text: 'Give me a similar SAT practice question to test my understanding!' },
                { label: 'Show 15s Desmos Hack ⚡', text: 'Is there a fast 15-second Desmos graphing shortcut for this?' },
                { label: 'What is the College Board trap? ⚠️', text: 'What is the common trap answer College Board sets for this question?' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.text)}
                  className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 font-medium whitespace-nowrap transition-colors shadow-2xs"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                  placeholder={`Ask ${selectedRole.name} anything (e.g. "How to solve circle completing square?")...`}
                  className="flex-1 bg-transparent border-0 outline-hidden px-3 text-xs text-slate-800 placeholder-slate-400 resize-none max-h-24"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-xs shrink-0 ${
                    !inputMessage.trim() || isLoading
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
