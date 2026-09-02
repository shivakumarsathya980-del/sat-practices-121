import { Course } from '../types';

export const initialCourses: Course[] = [
  {
    id: 'course_full_masterclass',
    title: 'Digital SAT Complete Masterclass (Target 1550+)',
    tagline: 'Comprehensive 8-week mastery covering all Math and Reading & Writing domains with Desmos power tactics.',
    duration: '24 Hours • 32 Lessons',
    lessonsCount: 32,
    level: 'All Levels',
    category: 'Full Masterclass',
    rating: 4.98,
    enrolledCount: 14280,
    iconName: 'GraduationCap',
    modules: [
      {
        id: 'mod_1',
        title: 'Module 1: Digital SAT Architecture & Adaptive Engine',
        description: 'Understand how Section 1 routing works and how to guarantee landing in the harder Section 2 module.',
        lessons: [
          {
            id: 'l_1_1',
            title: '1.1 The Digital SAT Adaptive Scoring Model Demystified',
            duration: '18 min',
            summary: 'Understanding Module 1 routing threshold (typically 18+ correct out of 27 to secure the Hard Module 2 and unlock 700+).',
            videoUrl: 'https://www.youtube.com/watch?v=0hL4a9h92m8',
            videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/0hL4a9h92m8?autoplay=1&enablejsapi=1',
            videoThumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
            instructor: {
              name: 'Dr. Evelyn Hayes',
              role: 'Senior SAT Architect • Harvard M.Ed',
              score: '1600 Scorer',
            },
            chapters: [
              { timeSeconds: 0, timeDisplay: '00:00', title: 'Introduction & Digital SAT Adaptive Scoring' },
              { timeSeconds: 180, timeDisplay: '03:00', title: 'Module 1 vs Module 2 Routing Cutoffs' },
              { timeSeconds: 420, timeDisplay: '07:00', title: 'Why Careless Errors in Module 1 Cost 150+ Points' },
              { timeSeconds: 720, timeDisplay: '12:00', title: 'Optimal 70-Second Pacing Strategy' },
              { timeSeconds: 960, timeDisplay: '16:00', title: 'Live Bluebook Interface Breakdown' },
            ],
            transcript: [
              { time: '00:15', speaker: 'Dr. Evelyn Hayes', text: 'Welcome to Lesson 1.1! The single most critical insight for the 2026 Digital SAT is understanding section adaptive routing.' },
              { time: '02:40', speaker: 'Dr. Evelyn Hayes', text: 'If you answer 18 or more questions correctly in Module 1, the algorithm routes you to the Hard Module 2, unlocking scores up to 800.' },
              { time: '06:10', speaker: 'Dr. Evelyn Hayes', text: 'Notice that on the easy module, even a perfect performance caps your maximum section scaled score near 590.' },
              { time: '11:30', speaker: 'Dr. Evelyn Hayes', text: 'Therefore, pacing in Module 1 must be deliberate—never guess blindly on the first 10 questions.' },
            ],
            keyTakeaways: [
              'Module 1 is standard difficulty; Module 2 adapts to your performance.',
              'If routed to Easy Module 2, your section score is capped around 590.',
              'Every question in Module 1 carries immense routing weight.',
            ],
            keyPoints: [
              'Section 1 routing cutoff is ~65-70% accuracy in Module 1.',
              'Unscored pre-test experimental questions exist (2 per module) but are indistinguishable.',
            ],
            tips: [
              'Never rush through the first 10 questions of Module 1; careless mistakes cost routing.',
              'Pace at ~1 min 15 sec per question on R&W, ~1 min 30 sec on Math.',
            ],
            checkpointQuiz: {
              question: 'What happens if a student misses 12 questions in Reading & Writing Module 1?',
              options: [
                'They receive a raw score deduction of 120 points only.',
                'They are routed to the Easy Module 2, capping their max section score around 590.',
                'The test automatically restarts from Question 1.',
                'No penalty occurs because Module 2 weights are doubled.',
              ],
              answer: 'They are routed to the Easy Module 2, capping their max section score around 590.',
              explanation: 'In the multistage adaptive Digital SAT, dropping below ~18-19 correct in Module 1 routes the examinee to the Lower-difficulty Module 2, which has an upper ceiling score of ~590.',
            },
          },
          {
            id: 'l_1_2',
            title: '1.2 Digital Testing Tools & On-Screen Desmos Calculator Mastery',
            duration: '22 min',
            summary: 'How to utilize the built-in Desmos graphing suite, reference sheet, and flagging mechanisms.',
            videoUrl: 'https://www.youtube.com/watch?v=Fj2F5pZ9mZ8',
            videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/Fj2F5pZ9mZ8?autoplay=1&enablejsapi=1',
            videoThumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80',
            instructor: {
              name: 'Prof. Marcus Rivera',
              role: 'Desmos Master Trainer & MIT Alum',
              score: 'SAT Math 800',
            },
            chapters: [
              { timeSeconds: 0, timeDisplay: '00:00', title: 'Desmos UI Tour & Keyboard Shortcuts' },
              { timeSeconds: 240, timeDisplay: '04:00', title: 'Graphing Systems of Equations in 5 Seconds' },
              { timeSeconds: 600, timeDisplay: '10:00', title: 'Slider Tactics for Unknown Constants (k, c)' },
              { timeSeconds: 900, timeDisplay: '15:00', title: 'Regressions (y1 ~ mx1 + b) for Instant Linear Fits' },
            ],
            transcript: [
              { time: '00:20', speaker: 'Prof. Marcus Rivera', text: 'Desmos is embedded natively on every single math question of the Digital SAT. You do not need to solve quadratics by hand if you know regressions.' },
              { time: '04:15', speaker: 'Prof. Marcus Rivera', text: 'Watch this: to find system solutions, type both equations directly into Desmos and click the gray intersection dots.' },
              { time: '09:45', speaker: 'Prof. Marcus Rivera', text: 'When an equation has unknown constant "k", add a slider or use table regression to evaluate answers in seconds.' },
            ],
            keyTakeaways: [
              'Desmos is available on 100% of Digital SAT Math questions.',
              'Use the cross-out tool to eliminate trap answers visually.',
              'Flag tricky questions and review them in the final 5 minutes.',
            ],
            tips: [
              'Write notes on the scratchpad with coordinate grids whenever geometry comes up.',
              'Use regressions (`y1 ~ ax1^2 + bx1 + c`) to fit parabolas instantly through given coordinates.',
            ],
            checkpointQuiz: {
              question: 'How can you find the intersection of 3x + 2y = 14 and y = 2x² - 5x + 1 in Desmos?',
              options: [
                'You must isolate y by hand first.',
                'Type both equations on separate lines and click the gray intersection dots.',
                'Convert everything to matrices using an external calculator.',
                'Desmos only supports single-variable functions.',
              ],
              answer: 'Type both equations on separate lines and click the gray intersection dots.',
              explanation: 'Desmos supports implicit equations and curves directly. Simply entering both expressions will render their points of intersection as clickable gray dots with exact coordinates.',
            },
          },
        ],
      },
      {
        id: 'mod_2',
        title: 'Module 2: Advanced Algebra & Quadratic Mastery',
        description: 'From linear modeling to complex polynomial root behaviors and system intersections.',
        lessons: [
          {
            id: 'l_2_1',
            title: '2.1 Vertex Form & Discriminant Power Tactics',
            duration: '26 min',
            summary: 'Mastering b² - 4ac conditions, vertex coordinates, and parabola-line tangency.',
            videoUrl: 'https://www.youtube.com/watch?v=kYJ5eR4bW2g',
            videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/kYJ5eR4bW2g?autoplay=1&enablejsapi=1',
            videoThumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
            instructor: {
              name: 'Dr. Evelyn Hayes',
              role: 'Senior SAT Architect',
              score: '1600 Scorer',
            },
            chapters: [
              { timeSeconds: 0, timeDisplay: '00:00', title: 'Discriminant Formula & Root Cases' },
              { timeSeconds: 300, timeDisplay: '05:00', title: 'Parabola Tangent Line Problems (b² - 4ac = 0)' },
              { timeSeconds: 650, timeDisplay: '10:50', title: 'Vertex Form vs Standard Form Conversions' },
              { timeSeconds: 1100, timeDisplay: '18:20', title: 'Hard 800-Level Quadratic Question Walkthrough' },
            ],
            transcript: [
              { time: '00:30', speaker: 'Dr. Evelyn Hayes', text: 'When the exam asks for what value of c does a line intersect a parabola exactly once, set the equations equal and apply b² - 4ac = 0.' },
            ],
            keyTakeaways: [
              'Zero real solutions means Discriminant < 0.',
              'Tangency (exactly one solution) means Discriminant = 0.',
              'Two distinct real solutions means Discriminant > 0.',
              'Vertex is at x = -b/(2a).',
            ],
            tips: [
              'Type both equations in Desmos to count real intersection points instantly.',
            ],
          },
          {
            id: 'l_2_2',
            title: '2.2 Systems of Equations with Unknown Parameters (k, c)',
            duration: '24 min',
            summary: 'Solving systems with infinitely many or zero solutions without manual substitution.',
            videoUrl: 'https://www.youtube.com/watch?v=7uJ_3q0V9Z4',
            videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/7uJ_3q0V9Z4?autoplay=1&enablejsapi=1',
            videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
            instructor: {
              name: 'Prof. Marcus Rivera',
              role: 'Desmos Master Trainer',
              score: 'SAT Math 800',
            },
            chapters: [
              { timeSeconds: 0, timeDisplay: '00:00', title: 'Parallel vs Coincident Lines' },
              { timeSeconds: 280, timeDisplay: '04:40', title: 'The Coefficient Ratio Shortcut (a1/a2 = b1/b2)' },
              { timeSeconds: 600, timeDisplay: '10:00', title: 'Infinite Solutions Equality Setup' },
            ],
            keyTakeaways: [
              'No solution = Parallel lines (same slope, different y-intercept).',
              'Infinitely many solutions = Identical coincident lines (same slope, same y-intercept).',
            ],
            tips: [
              'Set ratio of x-coefficients equal to ratio of y-coefficients: a1/a2 = b1/b2.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'course_math_800',
    title: 'SAT Math 800 Bootcamp: Advanced Problem Solving',
    tagline: 'Deep dive into 750-800 level Hard and Very Hard geometry, circle standard forms, probability, and trig.',
    duration: '18 Hours • 24 Lessons',
    lessonsCount: 24,
    level: 'Advanced 750+',
    category: 'Math',
    rating: 4.99,
    enrolledCount: 9840,
    iconName: 'Calculator',
    modules: [
      {
        id: 'mod_m1',
        title: 'Module 1: Circles & Coordinate Geometry Mastery',
        description: 'Completing the square, tangent lines, chords, and inscribed angles.',
        lessons: [
          {
            id: 'lm_1',
            title: '1.1 Circle Standard Form & Center-Radius Equations',
            duration: '25 min',
            summary: 'Transforming x² + y² + Dx + Ey + F = 0 into (x - h)² + (y - k)² = r² effortlessly.',
            videoUrl: 'https://www.youtube.com/watch?v=3g8K911jV90',
            videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/3g8K911jV90?autoplay=1&enablejsapi=1',
            videoThumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
            instructor: {
              name: 'Sarah Lin',
              role: 'Math Olympiad Gold Medalist • Stanford BS',
              score: 'SAT 1600 (Math 800)',
            },
            chapters: [
              { timeSeconds: 0, timeDisplay: '00:00', title: 'General Form vs Standard Form' },
              { timeSeconds: 220, timeDisplay: '03:40', title: 'The Fast Center Trick: (h, k) = (-D/2, -E/2)' },
              { timeSeconds: 500, timeDisplay: '08:20', title: 'Radius Formula: r = sqrt(h² + k² - F)' },
              { timeSeconds: 840, timeDisplay: '14:00', title: 'Inscribed Angles & Tangent Perpendicularity' },
            ],
            transcript: [
              { time: '00:15', speaker: 'Sarah Lin', text: 'Welcome to Circle Geometry. In the Digital SAT, standard circle questions are free points if you know the center formula: h is always -D/2 and k is always -E/2.' },
            ],
            keyTakeaways: [
              'Center h = -D/2, k = -E/2.',
              'Radius r = √(h² + k² - F).',
              'Tangent lines to a circle are always perpendicular (90°) to the radius at point of contact.',
            ],
            tips: [
              'Always confirm if the question asks for radius, diameter, or circle area.',
            ],
            checkpointQuiz: {
              question: 'What is the radius of the circle with equation x² + y² - 6x + 8y - 11 = 0?',
              options: ['4', '5', '6', '11'],
              answer: '6',
              explanation: 'h = 6/2 = 3, k = -8/2 = -4. Radius r = √(3² + (-4)² - (-11)) = √(9 + 16 + 11) = √36 = 6.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'course_rw_perfection',
    title: 'Reading & Writing 800: Grammar & Craft Mastery',
    tagline: 'Eliminate every grammar trap, master rhetorical synthesis, and conquer high-level scientific passages.',
    duration: '16 Hours • 20 Lessons',
    lessonsCount: 20,
    level: 'Target 1600',
    category: 'Reading & Writing',
    rating: 4.96,
    enrolledCount: 11200,
    iconName: 'BookOpen',
    modules: [
      {
        id: 'mod_rw1',
        title: 'Module 1: Punctuation Precision & Clause Boundaries',
        description: 'Semicolons, colons, em-dashes, and comma boundaries.',
        lessons: [
          {
            id: 'lrw_1',
            title: '1.1 The Punctuation Hierarchy & Sentence Splicing',
            duration: '20 min',
            summary: 'Understanding when to deploy colons vs semicolons vs dashes.',
            videoUrl: 'https://www.youtube.com/watch?v=0hL4a9h92m8',
            videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/0hL4a9h92m8?autoplay=1&enablejsapi=1',
            videoThumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
            instructor: {
              name: 'Claire Montgomery',
              role: 'Grammar Lead & Former SAT Scorer',
              score: 'R&W 800',
            },
            chapters: [
              { timeSeconds: 0, timeDisplay: '00:00', title: 'Independent vs Dependent Clauses' },
              { timeSeconds: 200, timeDisplay: '03:20', title: 'FANBOYS and Comma Splice Traps' },
              { timeSeconds: 480, timeDisplay: '08:00', title: 'Colons: The "Complete Sentence First" Rule' },
              { timeSeconds: 780, timeDisplay: '13:00', title: 'Em-Dashes as Parenthetical Interruptions' },
            ],
            transcript: [
              { time: '00:20', speaker: 'Claire Montgomery', text: 'On the Digital SAT, the rules of punctuation are 100% predictable and non-negotiable.' },
              { time: '03:30', speaker: 'Claire Montgomery', text: 'A colon MUST follow an independent clause that can stand alone as a full sentence.' },
            ],
            keyTakeaways: [
              'Colons require a complete sentence prior to the colon.',
              'Semicolons require complete sentences on BOTH sides.',
              'A pair of em-dashes functions identically to a pair of commas for non-essential clauses.',
            ],
            tips: [
              'If two answer choices are grammatically identical (e.g. period vs semicolon with same words), both are eliminated.',
            ],
            checkpointQuiz: {
              question: 'Which of the following punctuation marks can join two independent clauses without any coordinating conjunction?',
              options: [
                'A single comma',
                'A semicolon',
                'A hyphen',
                'A single slash',
              ],
              answer: 'A semicolon',
              explanation: 'A semicolon connects two grammatically independent clauses without needing FANBOYS conjunctions.',
            },
          },
        ],
      },
    ],
  },
];
