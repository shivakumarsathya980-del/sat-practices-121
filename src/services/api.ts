import { Difficulty, Domain, NoteItem, Question, Section } from '../types';
import { initialQuestions } from '../data/mockQuestions';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export async function sendChatMessage(params: {
  messages: { role: string; content: string }[];
  model?: 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';
  role?: string;
  systemInstruction?: string;
}): Promise<{ text: string; modelUsed: string }> {
  const response = await fetch('/api/chat/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned error ${response.status}`);
  }

  const data = await response.json();
  return {
    text: data.text || '',
    modelUsed: data.modelUsed || params.model || 'gemini-3.5-flash',
  };
}

export interface VeoGenerationResult {
  operationName: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
}

export async function startVeoVideoGeneration(params: {
  prompt: string;
  aspectRatio?: '16:9' | '9:16';
  resolution?: '720p' | '1080p';
}): Promise<VeoGenerationResult> {
  const response = await fetch('/api/veo/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Veo video generation failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    operationName: data.operationName,
    prompt: data.prompt || params.prompt,
    aspectRatio: data.aspectRatio || params.aspectRatio || '16:9',
  };
}

export async function pollVeoVideoStatus(operationName: string): Promise<{
  done: boolean;
  error?: string | null;
  hasVideo: boolean;
  videoUri?: string | null;
}> {
  const response = await fetch('/api/veo/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to check status: ${response.status}`);
  }

  return await response.json();
}

export async function fetchVeoVideoBlob(operationName: string): Promise<Blob> {
  const response = await fetch('/api/veo/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to download video: ${response.status}`);
  }

  return await response.blob();
}

export interface GenerateQuestionParams {
  domain?: Domain | string;
  difficulty?: Difficulty;
  topic?: string;
}

export async function generateSatQuestion(params: GenerateQuestionParams): Promise<Question> {
  try {
    const response = await fetch('/api/sat/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.question) {
      return data.question;
    }
  } catch (err) {
    console.warn('AI question generator endpoint fallback to curated pool:', err);
  }

  // Fallback to local curated pool matching criteria or random
  let matched = initialQuestions.filter((q) => {
    let match = true;
    if (params.difficulty && q.difficulty !== params.difficulty) match = false;
    if (params.domain && q.domain !== params.domain && !params.domain.includes(q.section)) match = false;
    return match;
  });

  if (matched.length === 0) {
    matched = initialQuestions.filter((q) => !params.difficulty || q.difficulty === params.difficulty);
  }
  if (matched.length === 0) {
    matched = initialQuestions;
  }

  const selected = matched[Math.floor(Math.random() * matched.length)];
  // Clone with unique ID so it counts as a fresh practice item
  return {
    ...selected,
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };
}

export async function getAiTutorExplanation(params: {
  questionText: string;
  passage?: string;
  options: { id: string; text: string }[];
  userAnswer?: string;
  correctAnswer: string;
  userQuery?: string;
}): Promise<string> {
  try {
    const response = await fetch('/api/sat/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.explanation) {
        return data.explanation;
      }
    }
  } catch (err) {
    console.warn('AI tutor explanation fallback:', err);
  }

  // Smart local explanation breakdown
  return `### SAT Master Tutor Breakdown
**Correct Answer: Choice ${params.correctAnswer}**

1. **Core Concept Tested**: This question evaluates precision in mathematical modeling or textual comprehension on the Digital SAT.
2. **Key Execution Step**: Notice the specific constraints specified in the prompt. Eliminate choices that misinterpret operations or distort the textual context.
3. **Trap Avoidance**: Distractors often tempt test-takers who perform only the first step or who confuse terms. Always confirm what the question explicitly asks to calculate.
4. **1600 Speed Shortcut**: On Math questions, utilize Desmos to plot the equations or sliders; on Reading & Writing, isolate the key subject and verb before analyzing answer choices.`;
}

export async function generateStudyNotes(params: {
  topic: string;
  section?: Section;
  category?: string;
}): Promise<NoteItem> {
  let text = '';
  try {
    const response = await fetch('/api/sat/generate-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.content) {
        text = data.content;
      }
    }
  } catch (err) {
    console.warn('AI study note generator fallback:', err);
  }

  if (!text) {
    text = `### ${params.topic} - Digital SAT Strategy Vault
1. Fundamental Definition: Master the formal College Board rule for ${params.topic}.
2. High-Frequency Traps: Watch out for sign errors, misidentified subjects, and tempting distractors.
3. Pro Shortcut: Verify results using elimination or by graphing boundary values.`;
  }

  return {
    id: `ai_note_${Date.now()}`,
    title: params.topic,
    section: params.section || 'Math',
    category: params.section === 'Math' ? 'Formulas' : 'Grammar Rules',
    tags: [params.topic.toLowerCase().replace(/\s+/g, '_'), 'ai_generated', 'high_yield'],
    summary: `AI-synthesized high-yield cheat sheet and breakdown for ${params.topic}.`,
    content: text,
    isBookmarked: true,
  };
}
