import { FlashcardDeck } from '../types';

export const initialDecks: FlashcardDeck[] = [
  {
    id: 'deck_vocab_top',
    title: 'Top 50 High-Frequency Digital SAT Vocab',
    description: 'Essential Tier 2 words that appear constantly in Craft & Structure reading passages.',
    category: 'Vocab',
    color: 'from-amber-500 to-orange-600',
    cards: [
      {
        id: 'v_1',
        deckId: 'deck_vocab_top',
        front: 'Anomaly',
        back: 'Noun: Something that deviates from what is standard, normal, or expected; an abnormality or irregularity.',
        category: 'Vocab',
        difficulty: 'Easy',
        mnemonic: 'A-nomaly = "A normal? No!"',
        example: 'The geneticist discovered a mitochondrial anomaly that challenged existing cellular models.'
      },
      {
        id: 'v_2',
        deckId: 'deck_vocab_top',
        front: 'Ubiquitous',
        back: 'Adjective: Present, appearing, or found everywhere; omnipresent.',
        category: 'Vocab',
        difficulty: 'Medium',
        mnemonic: 'U-bi-quit-ous = "You be everywhere, you can’t quit seeing it!"',
        example: 'Smartphones have become ubiquitous in modern urban environments.'
      },
      {
        id: 'v_3',
        deckId: 'deck_vocab_top',
        front: 'Ephemeral',
        back: 'Adjective: Lasting for a very short time; transient, fleeting.',
        category: 'Vocab',
        difficulty: 'Medium',
        mnemonic: 'Ephemeral sounds like "E-phantom", disappearing quickly.',
        example: 'Desert wildflowers produce an ephemeral bloom that vanishes within days of rainfall.'
      },
      {
        id: 'v_4',
        deckId: 'deck_vocab_top',
        front: 'Prosaic',
        back: 'Adjective: Having the style or diction of prose; lacking poetic beauty; commonplace or unromantic.',
        category: 'Vocab',
        difficulty: 'Hard',
        mnemonic: 'Prose vs Poetry = Prosaic is ordinary, everyday prose.',
        example: 'Despite the dramatic claims in the manifesto, the committee’s daily agenda was surprisingly prosaic.'
      },
      {
        id: 'v_5',
        deckId: 'deck_vocab_top',
        front: 'Fastidious',
        back: 'Adjective: Very attentive to and concerned about accuracy and detail; scrupulously meticulous.',
        category: 'Vocab',
        difficulty: 'Hard',
        mnemonic: 'Fastidious people are "fast to be tedious" over tiny errors.',
        example: 'The manuscript restorer worked with fastidious precision under polarized light.'
      },
      {
        id: 'v_6',
        deckId: 'deck_vocab_top',
        front: 'Circumspect',
        back: 'Adjective: Wary and unwilling to take risks; prudent, cautious.',
        category: 'Vocab',
        difficulty: 'Hard',
        mnemonic: 'Circum (around) + spect (look) = Looking all around before taking a step.',
        example: 'Diplomats remained circumspect in their statements until official treaty drafts were released.'
      },
      {
        id: 'v_7',
        deckId: 'deck_vocab_top',
        front: 'Sycophant',
        back: 'Noun: A person who acts obsequiously toward someone important in order to gain advantage; a flatterer.',
        category: 'Vocab',
        difficulty: 'Very Hard',
        mnemonic: 'Psycho fan = Sycophant flattering blindly.',
        example: 'The monarch surrounded himself with sycophants who rarely offered candid counsel.'
      },
      {
        id: 'v_8',
        deckId: 'deck_vocab_top',
        front: 'Equivocal',
        back: 'Adjective: Open to more than one interpretation; ambiguous, uncertain, or intentionally misleading.',
        category: 'Vocab',
        difficulty: 'Very Hard',
        mnemonic: 'Equi (equal) + vocal (voices) = Two equal opposing voices creating doubt.',
        example: 'The survey results were equivocal, showing equal support for both fiscal propositions.'
      }
    ]
  },
  {
    id: 'deck_math_formulas',
    title: 'SAT Math Must-Know Formulas & Shortcuts',
    description: 'Discriminants, vertex equations, circle standard forms, special triangles, and Vieta formulas.',
    category: 'Math',
    color: 'from-blue-600 to-indigo-700',
    cards: [
      {
        id: 'm_1',
        deckId: 'deck_math_formulas',
        front: 'Discriminant Formula & Root Meanings',
        back: 'Δ = b² - 4ac\n• Δ > 0: 2 distinct real solutions\n• Δ = 0: 1 real solution (tangent vertex)\n• Δ < 0: 0 real solutions (2 complex)',
        category: 'Math',
        difficulty: 'Medium',
        mnemonic: 'b² minus 4ac determines the fate of the parabolas!',
        example: 'For 2x² - 4x + c = 0 to have 1 solution: (-4)² - 4(2)(c) = 0 => 16 - 8c = 0 => c = 2.'
      },
      {
        id: 'm_2',
        deckId: 'deck_math_formulas',
        front: 'Vertex Form of a Quadratic',
        back: 'y = a(x - h)² + k\n• Vertex at (h, k)\n• If a > 0: Min value is k at x = h\n• If a < 0: Max value is k at x = h',
        category: 'Math',
        difficulty: 'Easy',
        mnemonic: 'Inside the parentheses (x - h) lies opposite sign; outside (+k) stays true.',
        example: 'f(x) = -5(x - 3)² + 14 has a maximum value of 14 at x = 3.'
      },
      {
        id: 'm_3',
        deckId: 'deck_math_formulas',
        front: "Vieta's Formulas for ax² + bx + c = 0",
        back: '• Sum of roots: r₁ + r₂ = -b/a\n• Product of roots: r₁ · r₂ = c/a',
        category: 'Math',
        difficulty: 'Hard',
        mnemonic: 'Negative b over a for the sum; c over a for the product.',
        example: 'If 3x² + 12x - 15 = 0, sum of roots is -12/3 = -4.'
      },
      {
        id: 'm_4',
        deckId: 'deck_math_formulas',
        front: 'Equation of a Circle & Completing the Square',
        back: '(x - h)² + (y - k)² = r²\n• Center: (h, k)\n• Radius: r (square root of the right side!)',
        category: 'Math',
        difficulty: 'Medium',
        mnemonic: 'Remember to take the square root of the number on the right!',
        example: '(x + 4)² + (y - 7)² = 36 has Center (-4, 7) and Radius = 6.'
      },
      {
        id: 'm_5',
        deckId: 'deck_math_formulas',
        front: 'Complementary Angle Trig Identity',
        back: 'sin(x) = cos(90° - x)\nIn radians: sin(x) = cos(π/2 - x)\nIf sin(A) = cos(B) in a right triangle, then A + B = 90°.',
        category: 'Math',
        difficulty: 'Hard',
        mnemonic: 'Sine and Cosine of complementary co-angles are identical twins!',
        example: 'If sin(3k) = cos(2k + 10), then 3k + 2k + 10 = 90 => 5k = 80 => k = 16.'
      },
      {
        id: 'm_6',
        deckId: 'deck_math_formulas',
        front: 'Arc Length & Sector Area (Radians)',
        back: 'When θ is in radians:\n• Arc Length: s = r · θ\n• Sector Area: A = (1/2) · r² · θ',
        category: 'Math',
        difficulty: 'Hard',
        mnemonic: 's = rθ is much faster than degree conversions!',
        example: 'With radius 10 and central angle π/5: s = 10 · (π/5) = 2π.'
      }
    ]
  },
  {
    id: 'deck_grammar_rules',
    title: 'Digital SAT Grammar Rules & Punctuation Hacks',
    description: 'Semicolons, colons, modifier placement, subject-verb agreement, and apostrophe traps.',
    category: 'Grammar',
    color: 'from-emerald-600 to-teal-700',
    cards: [
      {
        id: 'g_1',
        deckId: 'deck_grammar_rules',
        front: 'The Semicolon Rule',
        back: 'Must connect TWO INDEPENDENT CLAUSES (complete sentences) with no coordinating conjunction.\nFormula: [Complete Sentence] ; [Complete Sentence]',
        category: 'Grammar',
        difficulty: 'Easy',
        mnemonic: 'Semicolon = Period with a tail. If a period works, a semicolon works.',
        example: 'The experiment was a success; the researchers published the findings immediately.'
      },
      {
        id: 'g_2',
        deckId: 'deck_grammar_rules',
        front: 'The Colon Rule',
        back: 'MUST be preceded by a COMPLETE independent clause. The part AFTER the colon can be a list, an explanation, or a single noun/phrase.',
        category: 'Grammar',
        difficulty: 'Medium',
        mnemonic: 'Stop! Complete sentence before the colon gate.',
        example: 'She packed three essentials: water, a compass, and a thermal blanket.'
      },
      {
        id: 'g_3',
        deckId: 'deck_grammar_rules',
        front: 'Dangling Modifier Test',
        back: 'When a sentence opens with a descriptive phrase ("Having worked for hours,..."), the noun directly following the comma MUST be the person/thing performing the action.',
        category: 'Grammar',
        difficulty: 'Hard',
        mnemonic: 'Ask WHO is doing the action in the opening phrase!',
        example: '❌ Having analyzed the fossils, the discovery astonished Dr. Lee.\n✅ Having analyzed the fossils, Dr. Lee was astonished by the discovery.'
      },
      {
        id: 'g_4',
        deckId: 'deck_grammar_rules',
        front: "Its vs. It's vs. Its'",
        back: '• Its = Possessive (belonging to it, e.g. "its color")\n• It\'s = Contraction ("it is" or "it has")\n• Its\' = DOES NOT EXIST IN THE ENGLISH LANGUAGE (Always incorrect on SAT)',
        category: 'Grammar',
        difficulty: 'Easy',
        mnemonic: 'Replace with "it is". If it makes sense, use it\'s. Never pick its\'!',
        example: 'The telescope adjusted its aperture to capture the dim galaxy.'
      },
      {
        id: 'g_5',
        deckId: 'deck_grammar_rules',
        front: 'Em-Dash (—) Usage',
        back: 'Used in pairs to enclose parenthetical non-essential information, or as a single dash at the end of a sentence like a dramatic colon.',
        category: 'Grammar',
        difficulty: 'Medium',
        mnemonic: 'Dash in, dash out! If you open with a dash, close with a dash.',
        example: 'The lead astronaut—a veteran of three orbital missions—inspected the airlock.'
      }
    ]
  }
];
