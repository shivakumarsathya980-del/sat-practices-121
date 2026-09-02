import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  PhoneCall,
  PhoneOff,
  Sparkles,
  Bot,
  User,
  Zap,
  Activity,
  Headphones,
  Settings,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  PenTool,
  Eraser,
  Download,
  Trash2,
  BookOpen,
  GraduationCap,
  Calculator,
  Atom,
  Code,
  Globe,
  Compass,
  FileText,
  Maximize2,
  Minimize2,
  Check,
  Plus,
} from 'lucide-react';
import { LiveAudioPlayer, float32ToPcmBase64 } from '../services/liveAudio';
import { LiveExplanationWhiteboard } from './LiveExplanationWhiteboard';

export interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'model';
  text: string;
  timestamp: string;
}

export type SubjectDomain =
  | 'universal'
  | 'sat_act'
  | 'math_calculus'
  | 'science_physics'
  | 'admissions_essays'
  | 'coding_cs'
  | 'humanities_history'
  | 'productivity_life';

export interface BoardCard {
  id: string;
  title: string;
  domain: string;
  formulaOrHeader: string;
  steps: string[];
  proTip?: string;
}

const PRESET_BOARD_CARDS: Record<SubjectDomain, BoardCard[]> = {
  universal: [
    {
      id: 'u_1',
      title: 'First Principles Thinking & Problem Solving',
      domain: 'Universal Strategy',
      formulaOrHeader: 'Deconstruct -> Fundamental Truths -> Rebuild Reason',
      steps: [
        '1. Clarify and identify core assumptions.',
        '2. Break the problem into its most fundamental physics/axioms.',
        '3. Reconstruct a novel, foolproof solution from scratch.',
      ],
      proTip: 'Used by Feynman, Einstein, and top Olympiad thinkers to bypass standard mental blocks.',
    },
    {
      id: 'u_2',
      title: 'Feynman Technique for Fast Concept Mastery',
      domain: 'Learning Science',
      formulaOrHeader: 'Learn -> Teach a Child -> Find Gap -> Simplify',
      steps: [
        '1. Choose any concept in Math, Science, or Humanities.',
        '2. Explain it in plain spoken words without technical jargon.',
        '3. Revisit source material to fill gaps, then create intuitive visual analogies.',
      ],
      proTip: 'If you cannot explain it simply, you do not understand it well enough.',
    },
  ],
  sat_act: [
    {
      id: 'sat_1',
      title: 'Digital SAT Multistage Adaptive Routing',
      domain: 'SAT / ACT Prep',
      formulaOrHeader: 'Module 1 Score ≥ 18 / 27  =>  Hard Module 2 (Unlocks 800)',
      steps: [
        '1. Module 1: Standard difficulty (27 Qs). Target at least 18+ correct.',
        '2. High accuracy unlocks Hard Module 2 where 600–800 score range lives.',
        '3. Dropping into Easy Module 2 caps your maximum score near 590.',
      ],
      proTip: 'Never rush the first 10 questions of Module 1; careless errors destroy routing.',
    },
    {
      id: 'sat_2',
      title: 'Desmos Regression Shortcut for SAT Curves',
      domain: 'Math Power Tactics',
      formulaOrHeader: 'Type:  y1 ~ ax1² + bx1 + c  or  y1 ~ mx1 + b',
      steps: [
        '1. Insert a 2-column table with the coordinates from the problem.',
        '2. Type the regression formula using the tilde (~) symbol.',
        '3. Desmos instantly calculates exact values for a, b, c, or slope m.',
      ],
      proTip: 'Saves 2+ minutes on parabolic modeling and linear regression questions.',
    },
  ],
  math_calculus: [
    {
      id: 'math_1',
      title: 'Parabola Vertex & Discriminant Power Formula',
      domain: 'Advanced Algebra',
      formulaOrHeader: 'Vertex:  h = -b / (2a),   k = f(h)   |   Δ = b² - 4ac',
      steps: [
        '1. Standard Form: y = ax² + bx + c -> Vertex Form: y = a(x - h)² + k.',
        '2. Discriminant Δ > 0: Two real distinct roots (2 x-intercepts).',
        '3. Discriminant Δ = 0: Tangent line / exactly one real root (vertex on x-axis).',
        '4. Discriminant Δ < 0: Zero real roots (entire parabola above/below x-axis).',
      ],
      proTip: 'When a line intersects a parabola once, set them equal and apply b² - 4ac = 0.',
    },
    {
      id: 'math_2',
      title: 'Calculus Derivatives & Chain Rule',
      domain: 'AP Calculus',
      formulaOrHeader: 'Power Rule:  d/dx [xⁿ] = n·xⁿ⁻¹   |   Chain:  d/dx [f(g(x))] = f\'(g(x))·g\'(x)',
      steps: [
        '1. Product Rule: (u·v)\' = u\'v + u·v\'',
        '2. Quotient Rule: (u/v)\' = (u\'v - u·v\') / v²',
        '3. Integration by Parts: ∫ u dv = uv - ∫ v du',
      ],
      proTip: 'Always differentiate outer function first, then multiply by internal derivative.',
    },
  ],
  science_physics: [
    {
      id: 'sci_1',
      title: "Newton's 2nd Law & Work-Energy Theorem",
      domain: 'Physics Mechanics',
      formulaOrHeader: 'ΣF = m·a   |   W = ΔK = ½·m·v_f² - ½·m·v_i²',
      steps: [
        '1. Draw a Free Body Diagram (FBD) isolating all normal, gravity, and friction vectors.',
        '2. Split forces into perpendicular axes: ΣF_x = m·a_x and ΣF_y = m·a_y.',
        '3. Conservative Forces: Mechanical Energy is conserved (E_initial = E_final).',
      ],
      proTip: 'Work done by normal force is always 0 when displacement is perpendicular.',
    },
    {
      id: 'sci_2',
      title: 'Ideal Gas Law & Stoichiometry Equations',
      domain: 'Chemistry',
      formulaOrHeader: 'P·V = n·R·T   |   pH = -log₁₀[H⁺]   |   Kw = [H⁺][OH⁻] = 1.0 × 10⁻¹⁴',
      steps: [
        '1. P in atm, V in Liters, n in moles, T in Kelvin (T = °C + 273.15).',
        '2. Gas constant R = 0.08206 L·atm/(mol·K).',
        '3. At STP (1 atm, 0°C), 1 mole of any ideal gas occupies exactly 22.4 Liters.',
      ],
      proTip: 'Always balance chemical equations before calculating molar mass conversion ratios.',
    },
  ],
  admissions_essays: [
    {
      id: 'adm_1',
      title: 'Ivy League Common App Essay 4-Part Narrative Hook',
      domain: 'Admissions Strategy',
      formulaOrHeader: 'Micro-Scene Hook -> Vulnerability Turn -> Intellectual Spike -> Global Vision',
      steps: [
        '1. In Media Res: Open inside a vivid, sensory-rich miniature moment.',
        '2. The Pivot: Reveal an authentic internal conflict, unexpected insight, or failure.',
        '3. The Growth: Demonstrate intellectual curiosity and concrete leadership action.',
        '4. The Forward Anchor: Connect your character trait to how you will contribute on campus.',
      ],
      proTip: 'Show, do not tell. Replace abstract adjectives with concrete verbs and specific scenes.',
    },
    {
      id: 'adm_2',
      title: 'The STAR Method for College & Interview Mastery',
      domain: 'Interview Prep',
      formulaOrHeader: 'Situation -> Task -> Action -> Result & Reflection',
      steps: [
        '1. Situation: Set context in 15 seconds.',
        '2. Task: State the specific challenge or goal you owned.',
        '3. Action: Detail your exact initiative, decisions, and collaboration.',
        '4. Result: Quantify measurable impact and share how it shaped your values.',
      ],
      proTip: 'Spend 70% of your time on Action and Reflection, not background setup.',
    },
  ],
  coding_cs: [
    {
      id: 'cs_1',
      title: 'Binary Search & Big-O Time Complexity',
      domain: 'Computer Science',
      formulaOrHeader: 'Time: O(log N)   |   Space: O(1)   |   Condition: Sorted Array',
      steps: [
        '1. Initialize low = 0, high = len(arr) - 1.',
        '2. Calculate mid = low + (high - low) // 2 to prevent integer overflow.',
        '3. If arr[mid] == target: return mid. Else if arr[mid] < target: low = mid + 1, else high = mid - 1.',
      ],
      proTip: 'Halving the search space on each step allows searching 1,000,000 items in ~20 operations.',
    },
    {
      id: 'cs_2',
      title: 'Dynamic Programming (DP) Memoization Pattern',
      domain: 'Algorithms',
      formulaOrHeader: 'Optimal Substructure + Overlapping Subproblems -> Cache Results',
      steps: [
        '1. Write brute-force recursive state transition: dp(n).',
        '2. Add a hash map or array cache to store already computed values.',
        '3. Check cache at start of function: if n in memo: return memo[n].',
      ],
      proTip: 'Converts exponential O(2^N) Fibonacci or Knapsack into linear O(N) execution.',
    },
  ],
  humanities_history: [
    {
      id: 'hum_1',
      title: 'Rhetorical Analysis: Ethos, Pathos, Logos & Purpose',
      domain: 'Literature & AP Rhetoric',
      formulaOrHeader: 'Speaker + Audience + Exigence -> Rhetorical Moves -> Authorial Intent',
      steps: [
        '1. Exigence: What real-world urgency prompted the author to write?',
        '2. Ethos (Credibility), Pathos (Emotional resonance), Logos (Deductive logic).',
        '3. Diction, Syntax, and Juxtaposition: Connect stylistic devices directly to persuasive impact.',
      ],
      proTip: 'Never just name a device; always explain *how* that device shifts the listener\'s mind.',
    },
    {
      id: 'hum_2',
      title: 'Historical Causation & Synthesizing APDBQ Prompts',
      domain: 'World & US History',
      formulaOrHeader: 'Contextualization (3-4 sentences) + Defensible Thesis with Line of Reasoning',
      steps: [
        '1. Situate the topic within broader national/global trends.',
        '2. Thesis: "Although [Counterclaim X], because [Reason A] and [Reason B], [Main Argument Y]."',
        '3. Evidence: Source at least 4 documents (HIPP: Historical context, Intended audience, Purpose, POV).',
      ],
      proTip: 'A complex thesis that acknowledges nuance earns the complexity point automatically.',
    },
  ],
  productivity_life: [
    {
      id: 'life_1',
      title: 'Ultradian Rhythm & Deep Work Pacing',
      domain: 'Focus & Cognitive Science',
      formulaOrHeader: '90-Min Focused Sprint  +  15-Min Optic Defocus Rest',
      steps: [
        '1. Eliminate all phone notifications and context switching before starting.',
        '2. Single-task on high-cognitive load material for 90 minutes.',
        '3. 15-minute panoramic visual rest (walk outside, hydrate, zero screen input).',
      ],
      proTip: 'Deep work produces 3x higher memory consolidation than continuous distracted study.',
    },
    {
      id: 'life_2',
      title: 'Spaced Repetition & Forgetting Curve Reset',
      domain: 'Memory Science',
      formulaOrHeader: 'Intervals: Day 1 -> Day 3 -> Day 7 -> Day 16 -> Day 35',
      steps: [
        '1. Review flashcards just as recall effort begins to feel slightly difficult.',
        '2. Hard recall triggers myelin sheath reinforcement in neural pathways.',
        '3. Shifts ephemeral short-term memory into permanent long-term schema.',
      ],
      proTip: 'Active recall (testing yourself) beats passive re-reading by over 400%.',
    },
  ],
};

const SUBJECT_LIST: { id: SubjectDomain; label: string; icon: any; desc: string }[] = [
  { id: 'universal', label: 'Universal Polymath', icon: Globe, desc: 'Ask about any topic, concept, question, or life wisdom' },
  { id: 'sat_act', label: 'Digital SAT & ACT', icon: GraduationCap, desc: '1600 Pacing, Desmos speed hacks, Reading & Grammar rules' },
  { id: 'math_calculus', label: 'Math & AP Calculus', icon: Calculator, desc: 'Algebra, Geometry, Trig, Integrals, and Linear Algebra' },
  { id: 'science_physics', label: 'Science & Physics', icon: Atom, desc: 'Mechanics, Chemistry equilibrium, Biology genetics, and circuits' },
  { id: 'admissions_essays', label: 'College Admissions', icon: BookOpen, desc: 'Common App essays, Ivy League strategy, and interview prep' },
  { id: 'coding_cs', label: 'Computer Science', icon: Code, desc: 'Algorithms, Python, Data structures, and AI engineering' },
  { id: 'humanities_history', label: 'History & Literature', icon: FileText, desc: 'Rhetorical analysis, AP essays, Philosophy, and World History' },
  { id: 'productivity_life', label: 'Life & Productivity', icon: Compass, desc: 'Deep work focus, memory science, habit systems, and speaking' },
];

export const LiveVoiceCoachView: React.FC = () => {
  // Live Voice Connection States
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir'>('Zephyr');
  const [selectedDomain, setSelectedDomain] = useState<SubjectDomain>('universal');
  const [activeSpeaker, setActiveSpeaker] = useState<'none' | 'user' | 'model'>('none');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Unlimited Time Counter
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio References
  const wsRef = useRef<WebSocket | null>(null);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const isMicMutedRef = useRef<boolean>(false);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Keep ref in sync
  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Handle Domain Change
  const handleSelectDomain = (domain: SubjectDomain) => {
    setSelectedDomain(domain);
  };

  // Session Duration Counter (Unlimited)
  useEffect(() => {
    if (isConnected) {
      sessionTimerRef.current = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    }

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [isConnected]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnectLiveSession();
    };
  }, []);

  const formatDuration = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Connect to Live Audio Session (Unlimited Duration)
  const connectLiveSession = async () => {
    setErrorMessage(null);
    setIsConnecting(true);

    try {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new LiveAudioPlayer();
      }
      audioPlayerRef.current.setMute(isSpeakerMuted);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const personaParam =
        selectedDomain === 'sat_act'
          ? 'sat_coach'
          : selectedDomain === 'math_calculus'
          ? 'math_coach'
          : selectedDomain === 'science_physics'
          ? 'science_coach'
          : selectedDomain === 'admissions_essays'
          ? 'admissions_coach'
          : selectedDomain === 'coding_cs'
          ? 'coding_coach'
          : selectedDomain === 'humanities_history'
          ? 'humanities_coach'
          : selectedDomain === 'productivity_life'
          ? 'life_coach'
          : 'universal_coach';

      const wsUrl = `${protocol}//${window.location.host}/live?voice=${selectedVoice}&persona=${personaParam}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setSessionSeconds(0);

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const inputCtx = new AudioContextClass({ sampleRate: 16000 });
        inputAudioCtxRef.current = inputCtx;

        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(2048, 1, 1);
        scriptProcessorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (isMicMutedRef.current) return;
          if (ws.readyState !== WebSocket.OPEN) return;

          const inputData = e.inputBuffer.getChannelData(0);

          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += Math.abs(inputData[i]);
          }
          const avg = sum / inputData.length;
          setAudioLevel(Math.min(1, avg * 5));

          if (avg > 0.02) {
            setActiveSpeaker('user');
          } else if (activeSpeaker === 'user') {
            setActiveSpeaker('none');
          }

          const base64 = float32ToPcmBase64(inputData);
          ws.send(JSON.stringify({ type: 'audio', audio: base64 }));
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'audio' && data.audio) {
            setActiveSpeaker('model');
            audioPlayerRef.current?.playChunk(data.audio);
          } else if (data.type === 'transcript') {
            const newEntry: TranscriptEntry = {
              id: `trans_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              speaker: data.speaker || 'model',
              text: data.text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setTranscripts((prev) => [...prev, newEntry]);
          } else if (data.type === 'interrupted') {
            audioPlayerRef.current?.stopAll();
            setActiveSpeaker('none');
          } else if (data.type === 'turnComplete') {
            setActiveSpeaker('none');
          } else if (data.type === 'error') {
            setErrorMessage(data.error || 'Live API voice error occurred.');
          }
        } catch (e) {
          console.error('Error handling WS message:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket Live Error:', err);
        setErrorMessage('Failed to connect to Live API session.');
        disconnectLiveSession();
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };
    } catch (err: any) {
      console.error('Error starting live voice session:', err);
      setErrorMessage(err.message || 'Microphone access denied or connection failed.');
      setIsConnecting(false);
      disconnectLiveSession();
    }
  };

  const disconnectLiveSession = () => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }

    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch (e) {}
      scriptProcessorRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch (e) {}
      inputAudioCtxRef.current = null;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.close();
      audioPlayerRef.current = null;
    }

    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }

    setIsConnected(false);
    setIsConnecting(false);
    setActiveSpeaker('none');
    setAudioLevel(0);
  };

  const toggleSpeakerMute = () => {
    const next = !isSpeakerMuted;
    setIsSpeakerMuted(next);
    audioPlayerRef.current?.setMute(next);
  };

  const handleSendVoiceTextMessage = (text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text: text,
        })
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 rounded-3xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-purple-500/30 text-purple-300 text-xs px-3 py-1 rounded-full font-bold border border-purple-400/20 flex items-center space-x-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>UNLIMITED REAL-TIME VOICE TUTOR</span>
              </span>
              <span className="text-xs text-amber-300 font-mono font-bold">
                • ♾️ Unlimited Session Duration • All Subjects
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Universal Live Voice Master Tutor & Smart Chalkboard
            </h1>
            <p className="text-sm text-purple-200 max-w-2xl">
              Talk directly with Gemini Live Voice with <b>unlimited conversation time</b>. Ask about SAT, Math,
              Calculus, Physics, Chemistry, College Essays, Coding, or History while the <b>Smart Chalkboard</b> visually
              draws formulas and derivations in real-time.
            </p>
          </div>

          {/* Session Timer & Status Badge */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3.5 text-xs shadow-lg">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-all ${
                isConnected
                  ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-200 flex items-center space-x-2">
                <span>{isConnected ? 'Live Voice Active' : isConnecting ? 'Connecting...' : 'Ready to Connect'}</span>
                {isConnected && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {formatDuration(sessionSeconds)}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-purple-300 mt-0.5">
                {isConnected ? `Voice: ${selectedVoice} • Unlimited Time ♾️` : 'Click to start continuous call'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Subject Domain Selector Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>Select Universal Subject Focus (Ask About Anything):</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium">8 Knowledge Domains Available</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {SUBJECT_LIST.map((subj) => {
            const IconComponent = subj.icon;
            const isSel = selectedDomain === subj.id;
            return (
              <button
                key={subj.id}
                onClick={() => handleSelectDomain(subj.id)}
                className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                  isSel
                    ? 'bg-gradient-to-b from-indigo-600 to-purple-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
                title={subj.desc}
              >
                <IconComponent className={`w-4 h-4 ${isSel ? 'text-white' : 'text-indigo-600'}`} />
                <span className="text-[11px] text-center leading-tight truncate w-full">{subj.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Grid: Left Voice Hub (5 cols), Right Interactive Smart Chalkboard (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voice Orb, Controls, Settings & Transcripts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Voice Orb Call Stage */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div
              className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
                isConnected
                  ? activeSpeaker === 'model'
                    ? 'bg-gradient-to-b from-purple-500/10 via-indigo-500/5 to-transparent'
                    : activeSpeaker === 'user'
                    ? 'bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent'
                    : 'bg-gradient-to-b from-slate-100/50 to-transparent'
                  : 'bg-transparent'
              }`}
            />

            {/* Top Status Header */}
            <div className="w-full flex items-center justify-between z-10 mb-4">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isConnected
                      ? 'bg-emerald-500 animate-pulse'
                      : isConnecting
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="text-xs font-bold text-slate-700">
                  {isConnected
                    ? activeSpeaker === 'model'
                      ? 'Tutor is Speaking...'
                      : activeSpeaker === 'user'
                      ? 'Listening to you...'
                      : 'Live Connected — Speak freely'
                    : isConnecting
                    ? 'Establishing Live WebSocket...'
                    : 'Call Ready'}
                </span>
              </div>

              {isConnected && (
                <div className="flex items-center space-x-1.5 text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-mono font-bold">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>Unlimited Session ♾️</span>
                </div>
              )}
            </div>

            {/* Glowing Interactive Voice Orb */}
            <div className="relative my-6 flex items-center justify-center">
              {isConnected && (
                <>
                  <motion.div
                    className="absolute w-48 h-48 rounded-full border border-purple-400/30"
                    animate={{
                      scale: activeSpeaker === 'model' ? [1, 1.25, 1] : [1, 1.08, 1],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute w-64 h-64 rounded-full border border-indigo-400/20"
                    animate={{
                      scale: activeSpeaker === 'model' ? [1, 1.35, 1] : [1, 1.15, 1],
                      opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{ repeat: Infinity, duration: 3.0, ease: 'easeInOut' }}
                  />
                </>
              )}

              <motion.div
                className={`w-36 h-36 rounded-full flex items-center justify-center shadow-2xl transition-all relative z-10 ${
                  isConnected
                    ? activeSpeaker === 'model'
                      ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 shadow-purple-500/40'
                      : activeSpeaker === 'user'
                      ? 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-blue-600 shadow-emerald-500/40'
                      : 'bg-gradient-to-tr from-slate-800 to-purple-900 shadow-slate-900/30'
                    : 'bg-gradient-to-tr from-slate-200 to-slate-300 shadow-slate-300/40'
                }`}
                animate={{
                  scale:
                    isConnected && activeSpeaker === 'model'
                      ? [1, 1.1, 1.04, 1.08]
                      : isConnected && activeSpeaker === 'user'
                      ? 1 + audioLevel * 0.4
                      : 1,
                }}
                transition={{
                  repeat: isConnected && activeSpeaker === 'model' ? Infinity : 0,
                  duration: 1.8,
                  ease: 'easeInOut',
                }}
              >
                {isConnected ? (
                  activeSpeaker === 'model' ? (
                    <Bot className="w-14 h-14 text-white animate-pulse" />
                  ) : activeSpeaker === 'user' ? (
                    <Mic className="w-14 h-14 text-white" />
                  ) : (
                    <Headphones className="w-14 h-14 text-white/80" />
                  )
                ) : (
                  <PhoneOff className="w-14 h-14 text-slate-500" />
                )}
              </motion.div>
            </div>

            {/* Voice Control Buttons & Actions */}
            <div className="z-10 mt-4 flex flex-wrap items-center justify-center gap-3">
              {!isConnected ? (
                <button
                  id="live-voice-connect-btn"
                  onClick={connectLiveSession}
                  disabled={isConnecting}
                  className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center space-x-2.5 transition-all cursor-pointer active:scale-98"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Connecting to Live Voice...</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-4 h-4" />
                      <span>Start Unlimited Live Voice (All Subjects)</span>
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`p-3 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all shadow-xs cursor-pointer ${
                      isMicMuted
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {isMicMuted ? <MicOff className="w-4 h-4 text-amber-600" /> : <Mic className="w-4 h-4 text-purple-600" />}
                    <span>{isMicMuted ? 'Muted' : 'Mic On'}</span>
                  </button>

                  <button
                    onClick={toggleSpeakerMute}
                    className={`p-3 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all shadow-xs cursor-pointer ${
                      isSpeakerMuted
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {isSpeakerMuted ? <VolumeX className="w-4 h-4 text-amber-600" /> : <Volume2 className="w-4 h-4 text-purple-600" />}
                    <span>{isSpeakerMuted ? 'Muted' : 'Speaker'}</span>
                  </button>

                  <button
                    id="live-voice-disconnect-btn"
                    onClick={disconnectLiveSession}
                    className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-rose-600/30 flex items-center space-x-2 transition-all cursor-pointer active:scale-98"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>End Call</span>
                  </button>
                </>
              )}
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2 z-10">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Real-Time Live Transcript Feed */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col h-[280px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span>Live Spoken Conversation Log</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{transcripts.length} turns</span>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 text-xs">
              {transcripts.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-slate-400 p-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-500">Live Transcript Ready</p>
                    <p className="text-[11px]">
                      Start speaking freely on any subject—Math, Physics, Essays, or SAT. Live voice answers appear here.
                    </p>
                  </div>
                </div>
              ) : (
                transcripts.map((t) => {
                  const isUser = t.speaker === 'user';
                  return (
                    <div
                      key={t.id}
                      className={`p-2.5 rounded-xl border space-y-1 ${
                        isUser
                          ? 'bg-slate-50 border-slate-200 text-slate-800 ml-4'
                          : 'bg-purple-50/60 border-purple-200/80 text-purple-950 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-75 font-semibold">
                        <span>{isUser ? 'You (Spoken Input)' : `Tutor (${selectedVoice})`}</span>
                        <span>{t.timestamp}</span>
                      </div>
                      <p className="text-xs leading-relaxed">{t.text}</p>
                    </div>
                  );
                })
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>

        {/* Right Column: INTERACTIVE STUDENT EXPLANATION WHITEBOARD (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <LiveExplanationWhiteboard
            selectedDomain={selectedDomain}
            isVoiceActive={isConnected}
            activeSpeaker={activeSpeaker}
            voiceName={selectedVoice}
            transcripts={transcripts}
            latestTranscript={transcripts[transcripts.length - 1]}
            onSendVoiceMessage={handleSendVoiceTextMessage}
          />
        </div>
      </div>
    </div>
  );
};
