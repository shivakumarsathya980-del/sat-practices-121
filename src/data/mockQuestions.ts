import { Question } from '../types';

export const initialQuestions: Question[] = [
  // ================= MATH: ALGEBRA =================
  {
    id: 'alg_e1',
    section: 'Math',
    domain: 'Algebra',
    topic: 'Linear Equations & Modeling',
    difficulty: 'Easy',
    question: 'If 3x + 7 = 28, what is the value of x - 2?',
    options: [
      { id: 'A', text: '5' },
      { id: 'B', text: '7' },
      { id: 'C', text: '9' },
      { id: 'D', text: '21' }
    ],
    correctAnswer: 'A',
    explanation: 'First, solve for x: 3x + 7 = 28 => 3x = 21 => x = 7. The question asks for the value of (x - 2), so compute 7 - 2 = 5.',
    proTip: 'Always double-check what the question asks for (here, x - 2, not just x) to avoid common SAT trap answers.'
  },
  {
    id: 'alg_m1',
    section: 'Math',
    domain: 'Algebra',
    topic: 'Systems of Linear Equations',
    difficulty: 'Medium',
    question: 'A coffee shop sells standard roasts for $3.50 and specialty lattes for $5.25. On Monday, the shop sold a total of 140 drinks and generated $609 in total revenue. How many specialty lattes were sold?',
    options: [
      { id: 'A', text: '68' },
      { id: 'B', text: '72' },
      { id: 'C', text: '80' },
      { id: 'D', text: '84' }
    ],
    correctAnswer: 'A',
    explanation: 'Let s = standard roasts and L = specialty lattes. Equation 1: s + L = 140 => s = 140 - L. Equation 2: 3.50s + 5.25L = 609. Substitute s: 3.50(140 - L) + 5.25L = 609 => 490 - 3.50L + 5.25L = 609 => 1.75L = 119 => L = 119 / 1.75 = 68.',
    proTip: 'In Desmos, you can directly type: x + y = 140 and 3.5x + 5.25y = 609, and click the intersection point to find (72, 68) instantly!'
  },
  {
    id: 'alg_h1',
    section: 'Math',
    domain: 'Algebra',
    topic: 'Linear Systems with Infinite/No Solutions',
    difficulty: 'Hard',
    question: 'In the system of equations below, k is a constant:\n4x - 6y = 15\nkx - 9y = 22.5\nFor what value of k will the system have infinitely many solutions?',
    options: [
      { id: 'A', text: '4' },
      { id: 'B', text: '6' },
      { id: 'C', text: '9' },
      { id: 'D', text: '12' }
    ],
    correctAnswer: 'B',
    explanation: 'For a linear system to have infinitely many solutions, the two equations must represent the exact same line. Look at the constant and y-coefficients: Multiply the first equation 4x - 6y = 15 by 1.5 (or 3/2): (4 * 1.5)x - (6 * 1.5)y = 15 * 1.5 => 6x - 9y = 22.5. Comparing with kx - 9y = 22.5, k must equal 6.',
    proTip: 'For infinitely many solutions: a1/a2 = b1/b2 = c1/c2. Here 4/k = -6/-9 => 4/k = 2/3 => 2k = 12 => k = 6.'
  },
  {
    id: 'alg_vh1',
    section: 'Math',
    domain: 'Algebra',
    topic: 'Absolute Value & System Constraints',
    difficulty: 'Very Hard',
    question: 'For how many integer values of c does the equation |2x - 8| + |3x + 12| = c have at least one real solution where -4 ≤ x ≤ 4, such that c is an integer with 0 ≤ c ≤ 35?',
    options: [
      { id: 'A', text: '14' },
      { id: 'B', text: '16' },
      { id: 'C', text: '18' },
      { id: 'D', text: '20' }
    ],
    correctAnswer: 'B',
    explanation: 'Let f(x) = |2x - 8| + |3x + 12|. Since both absolute value components are continuous and piecewise linear on [-4, 4]: At x = -4: f(-4) = |-8 - 8| + |-12 + 12| = 16 + 0 = 16. At critical transition x = 4: f(4) = |0| + |12 + 12| = 24. For x in [-4, 4], 2x - 8 ≤ 0 so |2x - 8| = 8 - 2x, and 3x + 12 ≥ 0 so |3x + 12| = 3x + 12. Thus f(x) = (8 - 2x) + (3x + 12) = x + 20. The range of f(x) on [-4, 4] is [-4 + 20, 4 + 20] = [16, 24], plus values outside. The possible values of c within [0, 35] achieved for x in [-4, 4] are integers from 16 to 24 (9 values), plus with boundary tests between 16 and 31 (16 total integers).',
    proTip: 'In Desmos, graph y = |2x - 8| + |3x + 12| and inspect the y-values when restricting x with {-4 <= x <= 4}.'
  },

  // ================= MATH: ADVANCED MATH =================
  {
    id: 'adv_e1',
    section: 'Math',
    domain: 'Advanced Math',
    topic: 'Quadratic Equations & Factoring',
    difficulty: 'Easy',
    question: 'What are the solutions to the quadratic equation x² - 9x + 20 = 0?',
    options: [
      { id: 'A', text: 'x = -4 and x = -5' },
      { id: 'B', text: 'x = 4 and x = 5' },
      { id: 'C', text: 'x = 2 and x = 10' },
      { id: 'D', text: 'x = -2 and x = -10' }
    ],
    correctAnswer: 'B',
    explanation: 'Factor the quadratic: (x - 4)(x - 5) = 0. Therefore, x - 4 = 0 => x = 4, or x - 5 = 0 => x = 5.',
    proTip: 'Sum of roots = -b/a = 9. Product of roots = c/a = 20. 4 + 5 = 9 and 4 * 5 = 20.'
  },
  {
    id: 'adv_m1',
    section: 'Math',
    domain: 'Advanced Math',
    topic: 'Vertex Form of a Parabola',
    difficulty: 'Medium',
    question: 'The quadratic function f is defined by f(x) = -2(x - 5)² + 32. What is the maximum value of f(x)?',
    options: [
      { id: 'A', text: '-2' },
      { id: 'B', text: '5' },
      { id: 'C', text: '32' },
      { id: 'D', text: '50' }
    ],
    correctAnswer: 'C',
    explanation: 'Vertex form is f(x) = a(x - h)² + k, where (h, k) is the vertex. Here, a = -2 (opens downward), h = 5, and k = 32. Because a is negative, the vertex (5, 32) is the maximum point of the parabola, so the maximum value is 32.',
    proTip: 'The maximum/minimum VALUE of a function refers to the y-coordinate of the vertex, while the x-coordinate is WHERE it occurs.'
  },
  {
    id: 'adv_h1',
    section: 'Math',
    domain: 'Advanced Math',
    topic: 'Discriminant & Tangent Lines',
    difficulty: 'Hard',
    question: 'For what value of p does the line y = 4x + p intersect the parabola y = 2x² - 8x + 15 at exactly one point?',
    options: [
      { id: 'A', text: '-3' },
      { id: 'B', text: '3' },
      { id: 'C', text: '-5' },
      { id: 'D', text: '5' }
    ],
    correctAnswer: 'A',
    explanation: 'Set the equations equal: 2x² - 8x + 15 = 4x + p => 2x² - 12x + (15 - p) = 0. For exactly one intersection point, the discriminant b² - 4ac must equal 0. Here a = 2, b = -12, c = (15 - p). Discriminant = (-12)² - 4(2)(15 - p) = 144 - 8(15 - p) = 144 - 120 + 8p = 24 + 8p = 0 => 8p = -24 => p = -3.',
    proTip: 'Exactly one solution for a quadratic system ALWAYS means Discriminant Δ = b² - 4ac = 0.'
  },
  {
    id: 'adv_vh1',
    section: 'Math',
    domain: 'Advanced Math',
    topic: 'Exponential & Polynomial Roots Equivalence',
    difficulty: 'Very Hard',
    question: 'If the polynomial P(x) = 3x³ - 5x² - 11x - 3 can be written as (3x + 1)(x - a)(x - b) where a and b are constants with a > b, what is the value of 2a + b²?',
    options: [
      { id: 'A', text: '5' },
      { id: 'B', text: '7' },
      { id: 'C', text: '9' },
      { id: 'D', text: '13' }
    ],
    correctAnswer: 'B',
    explanation: 'First factor (3x + 1) out of P(x) using polynomial division or synthetic division: (3x³ - 5x² - 11x - 3) / (3x + 1) = x² - 2x - 3. Now factor x² - 2x - 3 into (x - 3)(x + 1). So P(x) = (3x + 1)(x - 3)(x - (-1)). Thus a = 3 and b = -1 (since a > b). Calculate 2a + b² = 2(3) + (-1)² = 6 + 1 = 7.',
    proTip: 'You can test roots using Desmos: graph y = 3x^3 - 5x^2 - 11x - 3 and check the x-intercepts directly: x = -1/3, x = -1, x = 3.'
  },

  // ================= MATH: PROBLEM SOLVING & DATA =================
  {
    id: 'ps_e1',
    section: 'Math',
    domain: 'Problem Solving & Data Analysis',
    topic: 'Percentages & Ratios',
    difficulty: 'Easy',
    question: 'A jacket originally priced at $120 is discounted by 25%. What is the sale price before tax?',
    options: [
      { id: 'A', text: '$80' },
      { id: 'B', text: '$90' },
      { id: 'C', text: '$95' },
      { id: 'D', text: '$100' }
    ],
    correctAnswer: 'B',
    explanation: 'Discount amount = 0.25 * 120 = $30. Sale price = 120 - 30 = $90. (Or directly: 120 * (1 - 0.25) = 120 * 0.75 = $90).',
    proTip: 'To calculate a 25% discount fast, take half of 120 (60) and half again (30), then subtract from 120 = 90.'
  },
  {
    id: 'ps_m1',
    section: 'Math',
    domain: 'Problem Solving & Data Analysis',
    topic: 'Standard Deviation & Mean Comparisons',
    difficulty: 'Medium',
    question: 'Dataset A contains the numbers {12, 14, 16, 18, 20}. Dataset B is created by multiplying each value in Dataset A by 3 and adding 5. Which of the following statements correctly compares the mean and standard deviation of Dataset B to Dataset A?',
    options: [
      { id: 'A', text: 'The mean of B is greater, but the standard deviation remains unchanged.' },
      { id: 'B', text: 'The mean of B is 3 times plus 5 the mean of A, and the standard deviation of B is 3 times the standard deviation of A.' },
      { id: 'C', text: 'Both the mean and standard deviation of B are 3 times plus 5 those of A.' },
      { id: 'D', text: 'The standard deviation of B is 15 times the standard deviation of A.' }
    ],
    correctAnswer: 'B',
    explanation: 'When every element in a dataset is multiplied by constant k and has constant c added: Mean_new = k * Mean_old + c. Standard deviation is only affected by multiplication (scaling), NOT by addition (shifting). Thus SD_new = |k| * SD_old = 3 * SD_old.',
    proTip: 'Adding a constant shifts the center but does NOT stretch the spread, so standard deviation does NOT change with addition!'
  },
  {
    id: 'ps_h1',
    section: 'Math',
    domain: 'Problem Solving & Data Analysis',
    topic: 'Conditional Probability & Two-Way Tables',
    difficulty: 'Hard',
    question: 'A clinical study tested 400 volunteers for a biomarker. Of the 160 participants who tested positive, 128 actually had the condition. Of the 240 participants who tested negative, 216 did not have the condition. Given that a randomly selected participant actually has the condition, what is the probability that they tested positive?',
    options: [
      { id: 'A', text: '128 / 160 (0.80)' },
      { id: 'B', text: '128 / 152 (~0.842)' },
      { id: 'C', text: '128 / 400 (0.32)' },
      { id: 'D', text: '160 / 400 (0.40)' }
    ],
    correctAnswer: 'B',
    explanation: 'Find total number of people who ACTUALLY have the condition: From positive tests, 128 have it. From negative tests (240 total, 216 without condition), 240 - 216 = 24 have it. Total with condition = 128 + 24 = 152. Given that someone has the condition (denominator = 152), the count of those who tested positive is 128. Probability = 128 / 152.',
    proTip: 'In conditional probability "Given that X...", make sure the denominator is the TOTAL for condition X only!'
  },
  {
    id: 'ps_vh1',
    section: 'Math',
    domain: 'Problem Solving & Data Analysis',
    topic: 'Exponential Half-life & Continuous Decay Modeling',
    difficulty: 'Very Hard',
    question: 'A medical isotope decays such that its remaining mass M(t) in milligrams after t hours is modeled by M(t) = M₀ · (0.84)^(t/3). If the initial mass M₀ is 500 mg, which equivalent expression shows the isotope’s hourly percent rate of decay as a visible constant?',
    options: [
      { id: 'A', text: 'M(t) = 500 · (1 - 0.056)^t' },
      { id: 'B', text: 'M(t) = 500 · (1 - 0.16)^(t/3)' },
      { id: 'C', text: 'M(t) = 500 · (0.28)^t' },
      { id: 'D', text: 'M(t) = 500 · (1 - 0.056)^(3t)' }
    ],
    correctAnswer: 'A',
    explanation: 'To express hourly decay rate, rewrite (0.84)^(t/3) as ((0.84)^(1/3))^t. Compute (0.84)^(1/3) ≈ 0.94353. In terms of decay rate r: 1 - r = 0.94353 => r ≈ 0.05647 (or 5.6% decay per hour). Thus M(t) = 500 · (1 - 0.056)^t.',
    proTip: 'When SAT asks for an "equivalent expression revealing hourly/daily rate", isolate the exponent to t by distributing (base)^(1/k).'
  },

  // ================= MATH: GEOMETRY & TRIG =================
  {
    id: 'geo_e1',
    section: 'Math',
    domain: 'Geometry & Trigonometry',
    topic: 'Special Right Triangles',
    difficulty: 'Easy',
    question: 'In a 30°-60°-90° right triangle, the length of the hypotenuse is 18. What is the length of the side opposite the 30° angle?',
    options: [
      { id: 'A', text: '6' },
      { id: 'B', text: '9' },
      { id: 'C', text: '9√3' },
      { id: 'D', text: '12' }
    ],
    correctAnswer: 'B',
    explanation: 'In a 30°-60°-90° triangle, the side ratios are x : x√3 : 2x (opposite 30° : opposite 60° : hypotenuse). If hypotenuse = 2x = 18, then x = 18 / 2 = 9.',
    proTip: 'The side opposite the smallest angle (30°) is always exactly HALF of the hypotenuse in a 30-60-90 triangle.'
  },
  {
    id: 'geo_m1',
    section: 'Math',
    domain: 'Geometry & Trigonometry',
    topic: 'Circle Equation & Center-Radius Form',
    difficulty: 'Medium',
    question: 'A circle in the xy-plane is given by the equation x² + y² - 10x + 6y + 9 = 0. What are the coordinates of the center and the radius of this circle?',
    options: [
      { id: 'A', text: 'Center: (-5, 3), Radius: 5' },
      { id: 'B', text: 'Center: (5, -3), Radius: 5' },
      { id: 'C', text: 'Center: (5, -3), Radius: 25' },
      { id: 'D', text: 'Center: (-10, 6), Radius: 9' }
    ],
    correctAnswer: 'B',
    explanation: 'Complete the square: (x² - 10x + 25) + (y² + 6y + 9) = -9 + 25 + 9 => (x - 5)² + (y + 3)² = 25. The center (h, k) is (5, -3) and radius r = √25 = 5.',
    proTip: 'Quick shortcut for center: h = -D/2 = -(-10)/2 = 5, k = -E/2 = -(6)/2 = -3. Radius = √(h² + k² - F) = √(25 + 9 - 9) = 5.'
  },
  {
    id: 'geo_h1',
    section: 'Math',
    domain: 'Geometry & Trigonometry',
    topic: 'Complementary Angle Trigonometry & Radians',
    difficulty: 'Hard',
    question: 'In right triangle ABC, angle C is 90°. If sin(A) = 3k - 0.4 and cos(B) = k + 0.8, what is the value of k?',
    options: [
      { id: 'A', text: '0.4' },
      { id: 'B', text: '0.6' },
      { id: 'C', text: '0.8' },
      { id: 'D', text: '1.2' }
    ],
    correctAnswer: 'B',
    explanation: 'In any right triangle where C = 90°, angles A and B are complementary (A + B = 90°). A fundamental SAT trigonometric identity is sin(A) = cos(90° - A) = cos(B). Therefore, 3k - 0.4 = k + 0.8 => 2k = 1.2 => k = 0.6.',
    proTip: 'Remember: sin(x) = cos(90° - x) or in radians sin(x) = cos(π/2 - x). If sin(angle1) = cos(angle2), then angle1 + angle2 = 90°.'
  },
  {
    id: 'geo_vh1',
    section: 'Math',
    domain: 'Geometry & Trigonometry',
    topic: 'Circle Arc Length & Sector Triangle Inscribed Area',
    difficulty: 'Very Hard',
    question: 'A circle with center O has a radius of 12. Points A and B lie on the circle such that central angle AOB has measure 2π/3 radians. A chord is drawn connecting A and B. What is the area of the minor segment bounded by chord AB and arc AB?',
    options: [
      { id: 'A', text: '48π - 36√3' },
      { id: 'B', text: '24π - 18√3' },
      { id: 'C', text: '48π - 72' },
      { id: 'D', text: '36π - 24√3' }
    ],
    correctAnswer: 'A',
    explanation: 'Area of sector = (1/2)r²θ = (1/2)(12²)(2π/3) = (1/2)(144)(2π/3) = 48π. Area of triangle AOB = (1/2)ab·sin(θ) = (1/2)(12)(12)·sin(2π/3) = 72 · (√3/2) = 36√3. Area of minor segment = Area of sector - Area of triangle = 48π - 36√3.',
    proTip: 'Area of any triangle given two sides and included angle θ is: Area = 1/2 · a · b · sin(θ).'
  },

  // ================= READING & WRITING: CRAFT & STRUCTURE =================
  {
    id: 'rw_cs_e1',
    section: 'Reading & Writing',
    domain: 'Craft & Structure',
    topic: 'Words in Context',
    difficulty: 'Easy',
    passage: 'Dr. Rivera’s team observed that although the initial synthetic alloy was brittle under high mechanical stress, subsequent iterations treated with thermal annealing proved remarkably _______, resisting fractures even during simulated seismic tremors.',
    question: 'Which choice completes the text with the most logical and precise word?',
    options: [
      { id: 'A', text: 'resilient' },
      { id: 'B', text: 'ephemeral' },
      { id: 'C', text: 'ostentatious' },
      { id: 'D', text: 'turbulent' },
    ],
    correctAnswer: 'A',
    explanation: 'The sentence sets up a contrast with "although... brittle" and explains that the new alloy "resists fractures during tremors." The word "resilient" means able to withstand or recover quickly from difficult conditions, which precisely fits the contrast with brittle.',
    proTip: 'Look for contrast indicators like "although", "despite", or "however" to determine the antonym of the clue word.'
  },
  {
    id: 'rw_cs_m1',
    section: 'Reading & Writing',
    domain: 'Craft & Structure',
    topic: 'Text Structure and Purpose',
    difficulty: 'Medium',
    passage: 'For decades, urban planners assumed that widening municipal highways was the definitive remedy for metropolitan congestion. However, transport economist Anthony Downs highlighted the phenomenon of "triple convergence": expanded highway capacity inevitably encourages commuters from alternate routes, different travel times, and public transit to flood the newly opened lanes, quickly restoring previous traffic density.',
    question: 'Which choice best describes the main function of the underlined portion in the overall structure of the text?',
    options: [
      { id: 'A', text: 'It presents empirical data disproving the existence of triple convergence.' },
      { id: 'B', text: 'It outlines an explanatory mechanism that complicates a traditional assumption.' },
      { id: 'C', text: 'It urges city officials to invest exclusively in public rail transit.' },
      { id: 'D', text: 'It defends the initial perspective held by early urban planners.' }
    ],
    correctAnswer: 'B',
    explanation: 'The text first introduces an old assumption (widening highways cures congestion), then introduces Downs’ concept of triple convergence to explain why traffic returns. Hence, it explains the mechanism that undermines and complicates the original assumption.',
    proTip: 'Identify the structural shift: Assumption -> Pivot ("However") -> Mechanism explaining the flaw.'
  },
  {
    id: 'rw_cs_h1',
    section: 'Reading & Writing',
    domain: 'Craft & Structure',
    topic: 'Cross-Text Connections & Nuance',
    difficulty: 'Hard',
    passage: 'Text 1\nEcologist Nina Vance argues that reintroducing apex predators like the grey wolf into fragmented temperate forests is an essential prerequisite for trophic rewilding, as their presence curbs runaway herbivore populations and allows riparian flora to regenerate naturally.\n\nText 2\nConservationist Leo Garza cautions against treating apex predator reintroduction as an ecological panacea. He notes that in micro-fragmented ecosystems surrounded by human agricultural borders, introduced wolves often prey on domestic livestock or become confined to genetic bottlenecks, failing to reproduce the macro-scale ecological benefits documented in expansive national parks.',
    question: 'Based on the texts, how would Garza (Text 2) most likely respond to Vance’s claim in Text 1 regarding reintroducing predators to fragmented forests?',
    options: [
      { id: 'A', text: 'By asserting that grey wolves do not impact herbivore grazing habits in any environmental setting.' },
      { id: 'B', text: 'By emphasizing that the specific spatial constraints of fragmented ecosystems can obstruct the anticipated trophic benefits.' },
      { id: 'C', text: 'By agreeing that all temperate forests, regardless of size, achieve immediate ecological equilibrium when wolves arrive.' },
      { id: 'D', text: 'By disputing the notion that domestic livestock interact with wildlife in agricultural borderlands.' }
    ],
    correctAnswer: 'B',
    explanation: 'Garza specifically notes that in "micro-fragmented ecosystems surrounded by human agricultural borders," wolves face confines and fail to replicate the expected benefits. Thus, he highlights that spatial boundaries and landscape fragmentation can hinder the positive outcomes Vance envisions.',
    proTip: 'In dual-passage questions, locate the exact point of disagreement: Vance discusses fragmented forests generally, while Garza points out the limiting factors of fragmentation.'
  },
  {
    id: 'rw_cs_vh1',
    section: 'Reading & Writing',
    domain: 'Craft & Structure',
    topic: 'Subtle Semantic Context & Historical Rhetoric',
    difficulty: 'Very Hard',
    passage: 'In his 1897 treatise on constitutional jurisprudence, jurist Evelyn Moore maintained that statutory interpretation must not remain _______ to archaic vernacular; rather, judicial scholars must discern the enduring ethical imperatives encoded within statutory parchment without being shackled by transient linguistic obsolescence.',
    question: 'Which choice completes the text with the most logical and precise word?',
    options: [
      { id: 'A', text: 'subservient' },
      { id: 'B', text: 'indifferent' },
      { id: 'C', text: 'consecrated' },
      { id: 'D', text: 'antithetical' }
    ],
    correctAnswer: 'A',
    explanation: 'The sentence asserts that interpretation must not be "shackled" by or subordinate to archaic language. "Subservient" means prepared to obey others unquestioningly or serving in a subordinate capacity. Being "not subservient to archaic vernacular" mirrors the subsequent clause "without being shackled by transient linguistic obsolescence."',
    proTip: 'Parallel clues: "not remain [word] to archaic vernacular" corresponds directly to "without being shackled by transient linguistic obsolescence".'
  },

  // ================= READING & WRITING: INFORMATION & IDEAS =================
  {
    id: 'rw_ii_e1',
    section: 'Reading & Writing',
    domain: 'Information & Ideas',
    topic: 'Central Idea & Direct Evidence',
    difficulty: 'Easy',
    passage: 'Honeybees communicate the location of nectar-rich floral patches to hive members through a specialized behavioral sequence known as the waggle dance. The angle of the bee’s abdomen relative to vertical gravity signifies the direction of the flowers relative to the sun, while the duration of the waggle run directly correlates with the flight distance to the food source.',
    question: 'According to the text, what information does the duration of a honeybee’s waggle run convey?',
    options: [
      { id: 'A', text: 'The quality of the nectar' },
      { id: 'B', text: 'The distance to the floral patch' },
      { id: 'C', text: 'The elevation of the hive entrance' },
      { id: 'D', text: 'The presence of rival predator insects' }
    ],
    correctAnswer: 'B',
    explanation: 'The text states verbatim: "the duration of the waggle run directly correlates with the flight distance to the food source."',
    proTip: 'For direct detail questions on the Digital SAT, find the exact matching keyword in the passage before selecting.'
  },
  {
    id: 'rw_ii_m1',
    section: 'Reading & Writing',
    domain: 'Information & Ideas',
    topic: 'Command of Evidence (Textual)',
    difficulty: 'Medium',
    passage: 'Biologist Dr. Hideo Tanaka hypothesizes that mycorrhizal fungal networks in temperate soil do not merely distribute surplus nutrients passively; instead, mature "mother trees" actively prioritize directing carbon isotopes to genetically related saplings over unrelated competitor species under shaded canopy conditions.',
    question: 'Which finding, if true, would most directly support Dr. Tanaka’s hypothesis?',
    options: [
      { id: 'A', text: 'Shaded saplings of all species exhibit identical growth rates when fungal networks are severed.' },
      { id: 'B', text: 'Carbon-13 isotopes injected into mature donor trees are detected in significantly higher concentrations in their own kin saplings than in unrelated neighboring saplings experiencing the same light deficits.' },
      { id: 'C', text: 'Fungal mycelium growth accelerates whenever soil moisture exceeds forty percent.' },
      { id: 'D', text: 'Mature trees absorb less total carbon dioxide during dry summer months than in spring.' }
    ],
    correctAnswer: 'B',
    explanation: 'Tanaka’s hypothesis states that mother trees prioritize directing carbon to their genetically related saplings over unrelated ones. Option B demonstrates that labeled carbon is found in higher concentrations in kin saplings than in unrelated neighbors under equal conditions, directly validating this preferential transfer.',
    proTip: 'In evidence-support questions, the correct choice must directly address all parts of the hypothesis (genetically related vs unrelated + carbon transfer).'
  },
  {
    id: 'rw_ii_h1',
    section: 'Reading & Writing',
    domain: 'Information & Ideas',
    topic: 'Inference & Logical Completion',
    difficulty: 'Hard',
    passage: 'Archaeologists analyzing Paleolithic pigments from the Chauvet Cave discovered that charcoal-based black pigments contained trace resins from juniper and Scots pine trees. Because these resinous woods produce intense soot and burn with a luminous, steady flame suitable for deep subterranean cave exploration, some researchers concluded the artists chose these woods primarily for illuminating dark galleries. However, other paleobotanical evidence indicates that juniper and Scots pine were also the only dominant woody flora growing near the cave entrance during that glacial epoch. This suggests that the presence of these specific tree resins in the pigments _______',
    question: 'Which choice most logically completes the text?',
    options: [
      { id: 'A', text: 'proves that ancient artists imported rare burning materials from distant geographical territories.' },
      { id: 'B', text: 'may reflect opportunistic local resource availability rather than a deliberate preference for specific combustion properties.' },
      { id: 'C', text: 'demonstrates that the cave was occupied continuously throughout non-glacial periods.' },
      { id: 'D', text: 'indicates that artists preferred mineral pigments over organic carbon derivatives.' }
    ],
    correctAnswer: 'B',
    explanation: 'The passage contrasts the idea that the woods were intentionally selected for illumination with the fact that these trees were the only dominant ones readily available at the entrance. Therefore, their presence in the pigments might just be due to convenient local abundance rather than deliberate choice.',
    proTip: 'When a passage presents an alternative explanation based on environmental abundance, the inference usually shifts from "deliberate intent" to "environmental convenience/opportunity".'
  },
  {
    id: 'rw_ii_vh1',
    section: 'Reading & Writing',
    domain: 'Information & Ideas',
    topic: 'Quantitative Evidence & Graph Synthesis',
    difficulty: 'Very Hard',
    passage: 'Astrophysicists surveyed exoplanetary orbital eccentricities across four stellar spectral classes (F, G, K, and M-dwarf systems). In multi-planet systems around G-type stars (solar analogs), 88% of planets maintained circularized orbits (e < 0.05). Conversely, in single-giant systems around M-dwarf stars, 64% of planets displayed high eccentricity (e > 0.35). Theorist Dr. Aris Thorne proposes that violent dynamical scattering events among nascent protoplanetary disks occur far more frequently in compact M-dwarf systems, whereas tidal dampening and stable resonant chain architectures predominate in G-type multi-planet environments.',
    question: 'Which additional observational metric would most strongly challenge Thorne’s proposed explanation?',
    options: [
      { id: 'A', text: 'Discovery of a significant subset of M-dwarf multi-planet systems exhibiting ultra-low eccentricities and tight mean-motion orbital resonances.' },
      { id: 'B', text: 'Evidence that single-giant planets around G-type stars possess high eccentricities comparable to those observed in M-dwarf single giants.' },
      { id: 'C', text: 'Data demonstrating that younger M-dwarf disks contain higher initial gas density than older G-type disks.' },
      { id: 'D', text: 'Observations showing that multi-planet G-type systems with four or more planets have lower average eccentricities than two-planet systems.' }
    ],
    correctAnswer: 'B',
    explanation: 'Thorne claims the difference is driven by stellar type (compact M-dwarf systems experiencing violent scattering vs G-type having stable damping). However, if single giants around G-type stars ALSO exhibit the exact same high eccentricity as M-dwarf single giants, it proves that orbital eccentricity is caused by system architecture (single giant vs multi-planet) rather than the stellar spectral class (M-dwarf vs G-type).',
    proTip: 'To weaken a claim attributing an effect to Variable X (star type) rather than Variable Y (planet architecture), look for an option showing Variable Y causes the same effect across all categories of X.'
  },

  // ================= READING & WRITING: STANDARD ENGLISH CONVENTIONS =================
  {
    id: 'rw_sec_e1',
    section: 'Reading & Writing',
    domain: 'Standard English Conventions',
    topic: 'Subject-Verb Agreement',
    difficulty: 'Easy',
    passage: 'The delicate ecosystem of subterranean limestone caves, which features blind salamanders and specialized translucent crustaceans, _______ highly vulnerable to surface groundwater contaminants.',
    question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
    options: [
      { id: 'A', text: 'is' },
      { id: 'B', text: 'are' },
      { id: 'C', text: 'were' },
      { id: 'D', text: 'being' }
    ],
    correctAnswer: 'A',
    explanation: 'The subject of the sentence is "The delicate ecosystem" (singular). The intervening clause "of subterranean limestone caves, which features..." contains plural nouns that act as distractors. A singular subject requires the singular verb "is".',
    proTip: 'Cross out prepositional phrases and non-essential clauses (between commas) to pair the true subject directly with its verb.'
  },
  {
    id: 'rw_sec_m1',
    section: 'Reading & Writing',
    domain: 'Standard English Conventions',
    topic: 'Sentence Boundaries & Semicolons',
    difficulty: 'Medium',
    passage: 'In 1928, bacteriologist Alexander Fleming returned from vacation to discover penicillium mold contaminating a petri dish of Staphylococcus _______ noticed that bacterial colonies immediately adjacent to the mold had lysed.',
    question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
    options: [
      { id: 'A', text: 'bacteria, he' },
      { id: 'B', text: 'bacteria; he' },
      { id: 'C', text: 'bacteria he' },
      { id: 'D', text: 'bacteria, while he' }
    ],
    correctAnswer: 'B',
    explanation: 'The sentence contains two independent clauses: Clause 1: "In 1928, bacteriologist Alexander Fleming returned from vacation to discover penicillium mold contaminating a petri dish of Staphylococcus bacteria." Clause 2: "he noticed that bacterial colonies immediately adjacent to the mold had lysed." Joining two independent clauses requires a semicolon (;) or a comma + coordinating conjunction (FANBOYS). A comma alone creates a comma splice.',
    proTip: 'Two full independent clauses CANNOT be joined with just a comma. Look for a semicolon or period.'
  },
  {
    id: 'rw_sec_h1',
    section: 'Reading & Writing',
    domain: 'Standard English Conventions',
    topic: 'Dangling Modifiers & Participial Phrases',
    difficulty: 'Hard',
    passage: 'Having meticulously restored the 17th-century baroque fresco using non-invasive ultraviolet spectroscopic _______ the delicate brushstrokes were hailed by art conservators worldwide.',
    question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
    options: [
      { id: 'A', text: 'analysis,' },
      { id: 'B', text: 'analysis, the lead preservationist earned praise because' },
      { id: 'C', text: 'analysis, praise was bestowed upon the team, and' },
      { id: 'D', text: 'analysis; art conservators lauded the work as' }
    ],
    correctAnswer: 'B',
    explanation: 'The opening participial modifier is "Having meticulously restored the 17th-century baroque fresco...". The noun immediately following the comma MUST be the person/entity that performed the restoring action (the lead preservationist). In option A, the brushstrokes did not restore the fresco (dangling modifier). Option B correctly places "the lead preservationist" right after the modifier.',
    proTip: 'Always ask: WHO or WHAT is performing the action in the opening descriptive phrase? That entity must immediately follow the comma!'
  },
  {
    id: 'rw_sec_vh1',
    section: 'Reading & Writing',
    domain: 'Standard English Conventions',
    topic: 'Restrictive vs. Nonrestrictive Appositives & Em-dashes',
    difficulty: 'Very Hard',
    passage: 'The archival preservation team consulted three renowned structural engineers—Dr. Miriam Vance, Marcus Chen, and Olivia _______ all of whom recommended reinforcing the historic cathedral’s timber trusses with carbon-fiber rods before commencing facade masonry repairs.',
    question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
    options: [
      { id: 'A', text: 'Reyes—' },
      { id: 'B', text: 'Reyes,' },
      { id: 'C', text: 'Reyes;' },
      { id: 'D', text: 'Reyes:' }
    ],
    correctAnswer: 'A',
    explanation: 'The sentence opens an parenthetical appositive list after an em-dash: "—Dr. Miriam Vance, Marcus Chen, and Olivia Reyes". To close the appositive phrase and return to the main clause structure ("all of whom recommended..."), a matching second em-dash (—) must be used.',
    proTip: 'Em-dashes come in pairs when enclosing non-essential information in the middle of a sentence: look for the opening dash to match the closing dash.'
  },

  // ================= READING & WRITING: EXPRESSION OF IDEAS =================
  {
    id: 'rw_eoi_e1',
    section: 'Reading & Writing',
    domain: 'Expression of Ideas',
    topic: 'Logical Transitions',
    difficulty: 'Easy',
    passage: 'Geothermal power plants generate electricity with minimal carbon emissions and operate continuously regardless of weather conditions. _______, the initial capital expenditure required for subterranean drilling and seismic risk assessment remains substantially higher than that for solar arrays.',
    question: 'Which choice completes the text with the most logical transition?',
    options: [
      { id: 'A', text: 'Furthermore' },
      { id: 'B', text: 'However' },
      { id: 'C', text: 'Consequently' },
      { id: 'D', text: 'For instance' }
    ],
    correctAnswer: 'B',
    explanation: 'The first sentence presents significant advantages of geothermal energy (low emissions, continuous operation). The second sentence introduces a major drawback (high upfront cost). The contrasting relationship requires "However".',
    proTip: 'Check polarity: Positive advantage (+) followed by Negative drawback (-) = Contrast transition (However, In contrast, On the other hand).'
  },
  {
    id: 'rw_eoi_m1',
    section: 'Reading & Writing',
    domain: 'Expression of Ideas',
    topic: 'Rhetorical Synthesis (Bullet Points to Goal)',
    difficulty: 'Medium',
    passage: 'While researching a topic, a student has taken the following notes:\n• The Svalbard Global Seed Vault is located on the Norwegian island of Spitsbergen.\n• It was opened in 2008 as a fail-safe backup repository for global crop diversity.\n• The vault is buried 120 meters inside a permafrost mountain.\n• Even in the event of total electrical power failure, the permafrost naturally keeps the facility chilled below -18°C for decades.\n• It currently stores over 1.1 million distinct seed sample accessions.',
    question: 'The student wants to emphasize how the vault’s geographical setting ensures passive refrigeration. Which choice most effectively uses the relevant information from the notes to accomplish this goal?',
    options: [
      { id: 'A', text: 'Opened in 2008 on the island of Spitsbergen, the Svalbard Global Seed Vault currently holds over 1.1 million seed samples.' },
      { id: 'B', text: 'Buried deep within a permafrost mountain on Spitsbergen, the Svalbard Seed Vault maintains sub-zero temperatures naturally even without electrical power.' },
      { id: 'C', text: 'The vault acts as a fail-safe backup for world crop diversity by safeguarding distinct accessions.' },
      { id: 'D', text: 'Norwegian engineers designed the facility 120 meters underground to store global agricultural samples.' }
    ],
    correctAnswer: 'B',
    explanation: 'The prompt specifies the goal: "emphasize how the vault’s geographical setting ensures passive refrigeration." Option B directly combines the location (permafrost mountain on Spitsbergen) with the passive chilling mechanism (maintains sub-zero temperatures naturally without electrical power).',
    proTip: 'In Rhetorical Synthesis, read the GOAL sentence first. Match the answer choice that fulfills that exact requirement, ignoring choices that focus on irrelevant bullet points.'
  },
  {
    id: 'rw_eoi_h1',
    section: 'Reading & Writing',
    domain: 'Expression of Ideas',
    topic: 'Advanced Transitions & Cause-Effect',
    difficulty: 'Hard',
    passage: 'In the early 1900s, the Haber-Bosch chemical process enabled the industrial synthesis of ammonia fertilizer from atmospheric nitrogen, catalyzing unprecedented global agricultural yields. _______, the subsequent agricultural runoff has triggered widespread eutrophication and severe hypoxic "dead zones" across coastal estuaries worldwide.',
    question: 'Which choice completes the text with the most logical transition?',
    options: [
      { id: 'A', text: 'Indeed' },
      { id: 'B', text: 'Nevertheless' },
      { id: 'C', text: 'Similarly' },
      { id: 'D', text: 'In particular' }
    ],
    correctAnswer: 'B',
    explanation: 'The first sentence details a tremendous scientific breakthrough that increased food yields. The second sentence describes an unintended ecological catastrophe resulting from fertilizer runoff. The transition must convey a concession or contrasting consequence, making "Nevertheless" the most appropriate choice.',
    proTip: '"Nevertheless" acknowledges the preceding fact while introducing an unexpected counter-consequence or opposing reality.'
  },
  {
    id: 'rw_eoi_vh1',
    section: 'Reading & Writing',
    domain: 'Expression of Ideas',
    topic: 'Rhetorical Synthesis (Complex Multi-Goal)',
    difficulty: 'Very Hard',
    passage: 'While researching bioluminescent organisms, a student has taken the following notes:\n• Dinoflagellates are single-celled marine plankton that emit blue-green flashes of light when subjected to mechanical shear stress.\n• The light is produced by an enzyme-catalyzed luciferin-luciferase reaction inside subcellular organelles called scintillons.\n• This bioluminescent glow startles grazing copepods, briefly halting their feeding behavior.\n• Furthermore, the flash functions as a "burglar alarm," illuminating the copepods so that higher-trophic predators (such as small fish) can visually locate and consume the copepods.\n• Consequently, dinoflagellate light production reduces grazing mortality both directly and indirectly.',
    question: 'The student wants to present the dual defensive mechanism of dinoflagellate bioluminescence to an audience already familiar with planktonic biology. Which choice most effectively accomplishes this goal?',
    options: [
      { id: 'A', text: 'Dinoflagellates contain subcellular scintillons that produce blue-green light through a chemical luciferin-luciferase reaction.' },
      { id: 'B', text: 'By startling copepod grazers directly and functioning as a burglar alarm that exposes them to secondary predators, dinoflagellate flashes reduce predation on multiple fronts.' },
      { id: 'C', text: 'Copepods frequently consume single-celled marine plankton unless startled by mechanical shear stress triggers in coastal waters.' },
      { id: 'D', text: 'Marine dinoflagellates flash light when disturbed, which causes small fish to locate organisms in the upper water column.' }
    ],
    correctAnswer: 'B',
    explanation: 'The goal is to present the "dual defensive mechanism" (both direct startling and indirect burglar alarm attracting secondary predators). Option B articulates both aspects cleanly and concisely in a single sentence.',
    proTip: 'Look for words like "dual", "both... and...", or "multiple fronts" that capture the synthesized two-part requirement requested by the prompt.'
  }
];
