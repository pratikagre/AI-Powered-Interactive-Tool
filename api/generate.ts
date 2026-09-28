import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  tag?: string;
}

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

interface StudySummary {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  keyTakeaways: string[];
  estimatedStudyTimeMinutes: number;
}

interface StudySetResult {
  summary: StudySummary;
  cards: Flashcard[];
  quiz: QuizQuestion[];
}

function generateRealisticMock(prompt: string, existingTopic?: string): StudySetResult {
  const cleanPrompt = prompt.trim();
  const topicTitle = existingTopic || cleanPrompt.slice(0, 45) || 'Computer Science Fundamentals';

  return {
    summary: {
      topic: topicTitle,
      difficulty: 'intermediate',
      keyTakeaways: [
        `Core principles and structural mechanics of "${topicTitle}".`,
        'Critical trade-offs, common misconceptions, and practical applications.',
        'Foundational terminology required for technical problem solving.',
      ],
      estimatedStudyTimeMinutes: 12,
    },
    cards: [
      {
        id: `c-mock-1-${Date.now()}`,
        front: `What is the core premise of ${topicTitle}?`,
        back: `The fundamental purpose is to establish a predictable, scalable framework for managing complexity in "${cleanPrompt.slice(0, 60)}".`,
        hint: 'Focus on primary architectural intent.',
        tag: 'Definition',
      },
      {
        id: `c-mock-2-${Date.now()}`,
        front: `What is the most frequent pitfall when working with ${topicTitle}?`,
        back: `Assuming immediate consistency or neglecting boundary cases (e.g. race conditions, unhandled failure modes, or stale references).`,
        hint: 'Think about what happens under unexpected or high-load conditions.',
        tag: 'Gotchas',
      },
      {
        id: `c-mock-3-${Date.now()}`,
        front: `How does defensive design apply to ${topicTitle}?`,
        back: `By validating all inputs at system boundaries before processing, and gracefully degrading when external services produce irregular output.`,
        hint: 'Never trust external inputs or model outputs without validation.',
        tag: 'Best Practices',
      },
      {
        id: `c-mock-4-${Date.now()}`,
        front: `What metric or indicator verifies optimal performance in ${topicTitle}?`,
        back: `High fault tolerance, sub-second response times, and minimal memory leakage across repetitive state transitions.`,
        hint: 'Consider both user experience and computational efficiency.',
        tag: 'Performance',
      },
      {
        id: `c-mock-5-${Date.now()}`,
        front: `How does ${topicTitle} evolve between beginner and advanced levels?`,
        back: `Beginners focus on surface syntax and happy paths; advanced practitioners anticipate edge cases, latency, and recovery lifecycles.`,
        hint: 'Active recall and testing failure modes distinguishes mastery.',
        tag: 'Mastery',
      },
    ],
    quiz: [
      {
        id: `q-mock-1-${Date.now()}`,
        question: `In the context of ${topicTitle}, which design choice minimizes runtime crashes?`,
        options: [
          { id: 'A', text: 'Assuming the external API always returns 100% compliant data' },
          { id: 'B', text: 'Defensively validating raw payloads against a typed contract before UI render' },
          { id: 'C', text: 'Suppressing all console logs so errors remain invisible' },
          { id: 'D', text: 'Hardcoding responses and disabling user input' },
        ],
        correctOptionId: 'B',
        explanation: 'Defensive validation ensures that malformed or incomplete payloads trigger managed error states rather than unhandled UI crashes.',
      },
      {
        id: `q-mock-2-${Date.now()}`,
        question: `When the external model returns an empty payload for "${topicTitle}", the application should:`,
        options: [
          { id: 'A', text: 'Render a completely blank screen indefinitely' },
          { id: 'B', text: 'Silently crash the React component tree' },
          { id: 'C', text: 'Display an informative empty/error state and offer a clear retry action' },
          { id: 'D', text: 'Reload the entire webpage in an infinite loop' },
        ],
        correctOptionId: 'C',
        explanation: 'Empty responses must be treated as explicit edge cases, providing users with context and an easy way to retry or refine their query.',
      },
      {
        id: `q-mock-3-${Date.now()}`,
        question: `Why is an incrementing request ID ref recommended for asynchronous requests?`,
        options: [
          { id: 'A', text: 'To encrypt data in transit' },
          { id: 'B', text: 'To ensure a slower earlier request cannot overwrite a faster, newer request' },
          { id: 'C', text: 'It is required by the HTTP 1.1 specification' },
          { id: 'D', text: 'To bypass browser Cross-Origin Resource Sharing (CORS)' },
        ],
        correctOptionId: 'B',
        explanation: 'Race conditions occur when a subsequent fast request finishes before an earlier slow request. Comparing request IDs prevents stale data from clobbering fresh state.',
      },
    ],
  };
}

const SYSTEM_INSTRUCTION = `You are an expert educational AI assistant.
Transform the provided notes, text, or topic into a structured study set.
You MUST output ONLY a valid JSON object matching the exact schema below.
NO markdown code fences, NO conversational text, NO preamble, NO postamble.

Schema:
{
  "summary": {
    "topic": "Concise subject or chapter name",
    "difficulty": "beginner" | "intermediate" | "advanced",
    "keyTakeaways": ["point 1", "point 2", "point 3"],
    "estimatedStudyTimeMinutes": 15
  },
  "cards": [
    {
      "id": "c1",
      "front": "Concise concept, term, or question",
      "back": "Clear, informative explanation or answer",
      "hint": "Optional short hint",
      "tag": "e.g. Core Concept, Definition, Formula, Gotchas"
    }
  ],
  "quiz": [
    {
      "id": "q1",
      "question": "Multiple choice question testing comprehension",
      "options": [
        { "id": "A", "text": "Option 1" },
        { "id": "B", "text": "Option 2" },
        { "id": "C", "text": "Option 3" },
        { "id": "D", "text": "Option 4" }
      ],
      "correctOptionId": "A",
      "explanation": "Why this option is correct and key learning principle"
    }
  ]
}
Generate between 5 to 8 high-quality flashcards and 3 to 5 challenging multiple-choice quiz questions.`;

export async function processGenerate(params: {
  prompt: string;
  mode?: 'new' | 'refine';
  existingTopic?: string;
  failureMode?: string;
}): Promise<{ status: number; body: any }> {
  const { prompt, mode, existingTopic, failureMode } = params;

  // 1. Simulated Failure Modes
  if (failureMode && failureMode !== 'normal') {
    switch (failureMode) {
      case 'malformed_json':
        return {
          status: 200,
          body: {
            data: '{\n  "summary": {\n    "topic": "Quantum Computing",\n    "difficulty": "advanced",\n  // ERROR: Trailing comma and unclosed array\n  "cards": [\n    {"id": "c1", "front": "Superposition", "back": "A principle of quantum mechanics where... [TRUNCATED_TOKEN] \n',
          },
        };

      case 'wrong_shape':
        return {
          status: 200,
          body: {
            data: {
              summary: {
                topic: 'Irrelevant Document Summary',
                difficulty: 'unknown_level',
              },
              unrelatedNotes: 'This object is completely missing the required "cards" array.',
              randomCount: 42,
            },
          },
        };

      case 'empty':
        return {
          status: 200,
          body: {
            data: '',
          },
        };

      case 'slow_timeout':
        await new Promise((resolve) => setTimeout(resolve, 30000));
        return {
          status: 200,
          body: {
            data: generateRealisticMock(prompt, existingTopic),
          },
        };

      case 'server_error':
        return {
          status: 500,
          body: {
            error: {
              type: 'SERVER_ERROR',
              title: 'Upstream Provider Outage (500)',
              message: 'The AI model service encountered an internal error and could not complete the request.',
              details: 'Simulated 500 Internal Server Error for evaluation.',
            },
          },
        };
    }
  }

  // 2. Active LLM Provider Detection
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  const userPrompt = mode === 'refine' && existingTopic
    ? `Topic context: ${existingTopic}\nUser refinement instruction: ${prompt}\nUpdate the study set accordingly, maintaining the exact JSON format.`
    : `Notes / Topic content:\n${prompt}`;

  // Provider A: Google Gemini
  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.4,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 502,
          body: {
            error: {
              type: 'SERVER_ERROR',
              title: 'Gemini API Error',
              message: `Gemini API returned status ${response.status}`,
              details: errorText,
            },
          },
        };
      }

      const geminiData: any = await response.json();
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

      return {
        status: 200,
        body: { data: rawText },
      };
    } catch (err: any) {
      return {
        status: 500,
        body: {
          error: {
            type: 'SERVER_ERROR',
            title: 'Gemini Connection Exception',
            message: err.message,
          },
        },
      };
    }
  }

  // Provider B: Groq
  if (groqKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return {
          status: 502,
          body: {
            error: {
              type: 'SERVER_ERROR',
              title: 'Groq API Error',
              message: `Groq returned ${response.status}`,
              details: errText,
            },
          },
        };
      }

      const groqData: any = await response.json();
      const content = groqData.choices?.[0]?.message?.content;
      return {
        status: 200,
        body: { data: content },
      };
    } catch (err: any) {
      return {
        status: 500,
        body: {
          error: {
            type: 'SERVER_ERROR',
            title: 'Groq Connection Error',
            message: err.message,
          },
        },
      };
    }
  }

  // Provider C: OpenAI
  if (openAiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return {
          status: 502,
          body: {
            error: {
              type: 'SERVER_ERROR',
              title: 'OpenAI API Error',
              message: `OpenAI returned ${response.status}`,
              details: errText,
            },
          },
        };
      }

      const openAiData: any = await response.json();
      const content = openAiData.choices?.[0]?.message?.content;
      return {
        status: 200,
        body: { data: content },
      };
    } catch (err: any) {
      return {
        status: 500,
        body: {
          error: {
            type: 'SERVER_ERROR',
            title: 'OpenAI Connection Error',
            message: err.message,
          },
        },
      };
    }
  }

  // Provider D: Zero-Config Realistic Local Generator
  await new Promise((resolve) => setTimeout(resolve, 800));
  const mockSet = generateRealisticMock(prompt, existingTopic);
  return {
    status: 200,
    body: { data: JSON.stringify(mockSet) },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      error: {
        type: 'SERVER_ERROR',
        title: 'Method Not Allowed',
        message: 'Only POST requests are supported on /api/generate.',
      },
    });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }

    const { prompt, mode, existingTopic, failureMode } = body || {};

    if (!prompt && failureMode !== 'server_error') {
      res.status(400).json({
        error: {
          type: 'EMPTY_RESPONSE',
          title: 'Missing Prompt',
          message: 'A text prompt is required to generate study materials.',
        },
      });
      return;
    }

    const result = await processGenerate({
      prompt: typeof prompt === 'string' ? prompt : '',
      mode,
      existingTopic,
      failureMode,
    });

    res.status(result.status).json(result.body);
  } catch (error: any) {
    console.error('[Vercel Serverless Error in /api/generate]:', error);
    res.status(500).json({
      error: {
        type: 'SERVER_ERROR',
        title: 'Serverless Function Error',
        message: error.message || 'An unexpected server error occurred.',
      },
    });
  }
}
