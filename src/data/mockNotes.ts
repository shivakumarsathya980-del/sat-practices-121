import { NoteItem } from '../types';

export const initialNotes: NoteItem[] = [
  {
    id: 'note_math_1',
    title: 'Essential Digital SAT Math Formulas & Invariant Theorems',
    category: 'Math Formulas',
    tags: ['Math', 'Formulas', 'Algebra', 'High-Yield'],
    summary: 'Must-know algebraic identities, quadratic vertex forms, circle equations, and exponent properties.',
    content: `### 1. Quadratic Core Formulas
- **Standard Form:** $y = ax^2 + bx + c$
  - Vertex x-coordinate: $x_v = -\\frac{b}{2a}$
  - Vertex y-coordinate: $y_v = c - \\frac{b^2}{4a}$
  - Discriminant $\\Delta = b^2 - 4ac$:
    - $\\Delta > 0 \\implies$ 2 distinct real solutions
    - $\\Delta = 0 \\implies$ 1 distinct real solution (vertex touches x-axis)
    - $\\Delta < 0 \\implies$ 0 real solutions (2 complex roots)
- **Vertex Form:** $y = a(x - h)^2 + k$, vertex at $(h, k)$
  - If $a > 0$: minimum value is $k$ at $x = h$
  - If $a < 0$: maximum value is $k$ at $x = h$
- **Factored Form:** $y = a(x - r_1)(x - r_2)$, roots at $r_1, r_2$
  - Vertex $h = \\frac{r_1 + r_2}{2}$

### 2. Vieta's Formulas (Speed Shortcut)
For quadratic $ax^2 + bx + c = 0$:
- **Sum of roots:** $r_1 + r_2 = -\\frac{b}{a}$
- **Product of roots:** $r_1 \\cdot r_2 = \\frac{c}{a}$

### 3. Circles in Coordinate Geometry
- **Standard Form:** $(x - h)^2 + (y - k)^2 = r^2$
  - Center: $(h, k)$
  - Radius: $r$
- **General Equation:** $x^2 + y^2 + Dx + Ey + F = 0$
  - Center: $\\left(-\\frac{D}{2}, -\\frac{E}{2}\\right)$
  - Radius: $r = \\sqrt{h^2 + k^2 - F}$`,
    keyFormulas: [
      'Vertex: x = -b / (2a)',
      'Discriminant: Δ = b² - 4ac',
      'Sum of Roots: -b/a',
      'Product of Roots: c/a',
      'Circle: (x - h)² + (y - k)² = r²'
    ],
    examples: [
      {
        prompt: 'Find the maximum value of f(x) = -3x² + 12x - 5.',
        solution: 'x = -12 / (2 * -3) = 2. Maximum value = f(2) = -3(4) + 12(2) - 5 = -12 + 24 - 5 = 7.'
      }
    ]
  },
  {
    id: 'note_grammar_1',
    title: 'The 10 Non-Negotiable Digital SAT Grammar & Punctuation Rules',
    category: 'Grammar Rules',
    tags: ['Reading & Writing', 'Grammar', 'Punctuation', 'Conventions'],
    summary: 'The ultimate rules for semicolons, colons, em-dashes, comma splices, and dangling modifiers.',
    content: `### Rule 1: The Semicolon (;)
- Connects two independent clauses (complete sentences) without a coordinating conjunction.
- **Formula:** [Independent Clause] ; [Independent Clause]
- On the SAT, a semicolon is grammatically identical to a period. If both a period and semicolon are presented with identical wording, both are usually eliminated!

### Rule 2: The Colon (:)
- **Must be preceded by a complete independent clause.**
- The clause AFTER a colon does NOT have to be complete—it can be a list, an explanation, a single word, or a clause that clarifies the preceding thought.

### Rule 3: Em-Dashes (—)
- Used in pairs to enclose non-essential parenthetical information (like commas or parentheses).
- **Rule:** If an appositive opens with an em-dash, it MUST close with an em-dash (never mix a comma with an em-dash).
- Single em-dash at the end of a sentence functions exactly like a colon.

### Rule 4: Comma Splice Trap
- Two independent clauses CANNOT be joined with just a comma:
  - ❌ *The scientist completed the trial, the results were conclusive.* (Splice)
  - ✅ *The scientist completed the trial; the results were conclusive.*
  - ✅ *The scientist completed the trial, and the results were conclusive.* (FANBOYS)

### Rule 5: Dangling Modifiers
- An introductory participial or descriptive phrase MUST be followed immediately by the noun it logically describes.
  - ❌ *Having analyzed the sample data, the hypothesis was confirmed by Dr. Watson.*
  - ✅ *Having analyzed the sample data, Dr. Watson confirmed the hypothesis.*`,
    keyFormulas: [
      'Ind. Clause + ; + Ind. Clause',
      'Ind. Clause + : + Explanation/List',
      'FANBOYS = For, And, Nor, But, Or, Yet, So',
      'Intro Modifier, [Logical Subject Performing Action]...'
    ],
    examples: [
      {
        prompt: 'Spot the error: "Running toward the platform, the train doors closed before Maya arrived."',
        solution: 'The train doors were not running; Maya was. Correct: "Running toward the platform, Maya saw the train doors close before she arrived."'
      }
    ]
  },
  {
    id: 'note_desmos_1',
    title: 'Digital SAT Desmos Graphing Calculator Hacks & Power Moves',
    category: 'Desmos Tricks',
    tags: ['Desmos', 'Calculator', 'Math Speed', 'Shortcuts'],
    summary: 'How to score 750+ on SAT Math by solving systems, inequalities, and functions in under 20 seconds.',
    content: `### 1. Solving Any System of Equations in 5 Seconds
- Type both equations exactly as written (e.g. \`3x - 4y = 12\` and \`y = 2x^2 - 5\`).
- Desmos plots both automatically.
- Hover and click on the intersection gray dots to read the exact $(x, y)$ coordinates.

### 2. Solving Single-Variable Equations with Multiple Steps
- Instead of algebraic rearrangements:
  - Left side: \`y = 4(2x - 3) + 7\`
  - Right side: \`y = 5x - 19\`
- Look for the intersection point; the $x$-coordinate is your answer!

### 3. Finding Equivalent Expressions
- Question: "Which expression is equivalent to $\\frac{x^2 - 16}{x + 4}$?"
- Type the original expression as \`y_1 = ...\`
- Type each option (A, B, C, D) as \`y_2\`.
- The option whose graph perfectly overlaps the original line/curve across all values is the correct answer.

### 4. Sliders for Unknown Constants ($k$, $c$, $p$)
- Type equations with unknown constants like \`y = 2x^2 + kx + 8\`.
- Click "Add slider for k".
- Slide $k$ until the condition (e.g. tangent to x-axis, passes through $(3, 2)$) is visually met!

### 5. Table Feature for Regressions & Points
- Click "+" -> Table to enter given data points $(x_1, y_1)$.
- Desmos calculates best-fit lines (\`y_1 ~ m x_1 + b\`) or quadratics (\`y_1 ~ a x_1^2 + b x_1 + c\`) instantly!`,
    keyFormulas: [
      'Intersection of y = f(x) and y = g(x) gives solutions',
      'Slider "k" to visually discover parameter values',
      'Table + Regression: y1 ~ m x1 + b'
    ]
  },
  {
    id: 'note_rw_strategy_1',
    title: 'Digital SAT Reading Heuristics & Transition Hierarchy',
    category: 'Reading Strategies',
    tags: ['Reading', 'Transitions', 'Inference', 'Evidence'],
    summary: 'Categorized transition words, rhetorical synthesis 3-step method, and inference traps.',
    content: `### 1. The 4 Categories of Transitions
1. **Continuation / Addition:**
   - *Words:* Furthermore, Moreover, Additionally, In addition, In fact, Indeed.
   - *Usage:* Sentence 2 builds directly upon Sentence 1 in the same direction.
2. **Contrast / Pivot:**
   - *Words:* However, Nevertheless, Nonetheless, In contrast, Conversely, Despite this.
   - *Usage:* Sentence 2 contradicts, limits, or presents a drawback/alternative to Sentence 1.
3. **Causation / Result:**
   - *Words:* Consequently, Therefore, Thus, As a result, Accordingly.
   - *Usage:* Sentence 2 is the direct consequence of Sentence 1.
4. **Exemplification / Clarification:**
   - *Words:* For example, For instance, Specifically, In particular, To illustrate.
   - *Usage:* Sentence 2 provides a concrete case study or detailed instantiation.

### 2. The 3-Step Rhetorical Synthesis Hack
- **Step 1:** Read the question stem FIRST and underline the exact GOAL (e.g., "The student wants to emphasize the contrast between...", "introduce the artist to an unfamiliar audience").
- **Step 2:** DO NOT read the entire bullet list if you already know the goal.
- **Step 3:** Evaluate choices based solely on whether they fulfill all parts of the goal without adding unrequested tangents.

### 3. Inference Question Rules
- The correct inference is ALWAYS a modest, conservative logical step from the text.
- ❌ Avoid choices with extreme words: *always, never, entirely, exclusively, impossible, definitively*.
- ✅ Favor choices with tempered language: *may reflect, suggests that, partially contributes, is consistent with*.`,
    keyFormulas: [
      'Read Question Goal BEFORE reading bullet points',
      'Rule out extreme absolute qualifiers (all, none, proved beyond doubt)',
      'Classify transitions into 4 buckets: + / - / -> / Ex'
    ]
  },
  {
    id: 'note_high_yield_1',
    title: 'Trigonometry, Circles & 3D Geometry Reference Vault',
    category: 'High Yield Concepts',
    tags: ['Math', 'Geometry', 'Trigonometry', 'Circles'],
    summary: 'Radian conversions, complementary angle identities, sector formulas, and special triangles.',
    content: `### 1. Degree to Radian Conversion
- **Formula:** $\\text{Radians} = \\text{Degrees} \\times \\frac{\\pi}{180^\\circ}$
- **Quick Equivalents:**
  - $30^\\circ = \\frac{\\pi}{6}$, $45^\\circ = \\frac{\\pi}{4}$, $60^\\circ = \\frac{\\pi}{3}$, $90^\\circ = \\frac{\\pi}{2}$, $180^\\circ = \\pi$, $360^\\circ = 2\\pi$

### 2. Complementary Trigonometry Identity
- In any right triangle with acute angles $A$ and $B$ (where $A + B = 90^\\circ$ or $\\frac{\\pi}{2}$):
  $$\\sin(A) = \\cos(B) \\iff \\sin(x) = \\cos(90^\\circ - x)$$
  $$\\tan(x) = \\frac{1}{\\tan(90^\\circ - x)}$$

### 3. Circles: Arc Length and Sector Area
When central angle $\\theta$ is in **radians**:
- **Arc Length:** $s = r\\theta$
- **Sector Area:** $A = \\frac{1}{2}r^2\\theta$

When central angle $\\theta$ is in **degrees**:
- **Arc Length:** $s = 2\\pi r \\left(\\frac{\\theta}{360^\\circ}\\right)$
- **Sector Area:** $A = \\pi r^2 \\left(\\frac{\\theta}{360^\\circ}\\right)$

### 4. Special Right Triangles
- **$45^\\circ-45^\\circ-90^\\circ$:** Side ratio is $x : x : x\\sqrt{2}$ (hypotenuse $= x\\sqrt{2}$)
- **$30^\\circ-60^\\circ-90^\\circ$:** Side ratio is $x : x\\sqrt{3} : 2x$ (hypotenuse $= 2x$, long leg opposite $60^\\circ = x\\sqrt{3}$)`,
    keyFormulas: [
      'Arc Length (rad): s = r · θ',
      'Sector Area (rad): A = 1/2 · r² · θ',
      'sin(x) = cos(90° - x)',
      '30-60-90: x, x√3, 2x',
      '45-45-90: x, x, x√2'
    ]
  }
];
