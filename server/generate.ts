import dotenv from 'dotenv';
import { generateRealisticMock } from '../src/data/mockData';

dotenv.config();

export interface GenerateServiceParams {
  prompt: string;
  mode?: 'new' | 'refine';
  existingTopic?: string;
  failureMode?: string;
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

export async function handleGenerateRequest(params: GenerateServiceParams): Promise<{ status: number; body: any }> {
  const { prompt, mode, existingTopic, failureMode } = params;

  // --- 1. SIMULATED FAILURE MODES (For testing & interview evaluation) ---
  if (failureMode && failureMode !== 'normal') {
    console.log(`[Proxy] Simulating failure mode: "${failureMode}"`);

    switch (failureMode) {
      case 'malformed_json':
        // Returns syntactically invalid JSON (unclosed quote, broken brackets)
        return {
          status: 200,
          body: {
            data: '{\n  "summary": {\n    "topic": "Quantum Computing",\n    "difficulty": "advanced",\n  // ERROR: Trailing comma and unclosed array\n  "cards": [\n    {"id": "c1", "front": "Superposition", "back": "A principle of quantum mechanics where... [TRUNCATED_TOKEN] \n',
          },
        };

      case 'wrong_shape':
        // Returns valid JSON, but missing required `cards` array and wrong types
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
        // Returns empty payload
        return {
          status: 200,
          body: {
            data: '',
          },
        };

      case 'slow_timeout':
        // Deliberately delay 30 seconds to trigger client AbortController timeout
        console.log('[Proxy] Simulating 30s delay to trigger client timeout...');
        await new Promise((resolve) => setTimeout(resolve, 30000));
        return {
          status: 200,
          body: {
            data: generateRealisticMock(prompt, existingTopic),
          },
        };

      case 'server_error':
        // Simulates 500 upstream outage
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

  // --- 2. ACTIVE LLM PROVIDER DETECTION ---
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  const userPrompt = mode === 'refine' && existingTopic
    ? `Topic context: ${existingTopic}\nUser refinement instruction: ${prompt}\nUpdate the study set accordingly, maintaining the exact JSON format.`
    : `Notes / Topic content:\n${prompt}`;

  // Provider A: Google Gemini
  if (geminiKey) {
    try {
      console.log('[Proxy] Dispatching request to Google Gemini API (gemini-1.5-flash)...');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${SYSTEM_INSTRUCTION}\n\n${userPrompt}` }
                ]
              }
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
        console.error('[Gemini API Error]', response.status, errorText);
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

      const geminiData = await response.json();
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

      return {
        status: 200,
        body: { data: rawText },
      };
    } catch (err: any) {
      console.error('[Gemini Request Exception]', err);
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

  // Provider B: Groq (Llama-3.3-70b)
  if (groqKey) {
    try {
      console.log('[Proxy] Dispatching request to Groq API (llama-3.3-70b-versatile)...');
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

      const groqData = await response.json();
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
      console.log('[Proxy] Dispatching request to OpenAI API (gpt-4o-mini)...');
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

      const openAiData = await response.json();
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

  // --- 3. ZERO-CONFIG LOCAL MOCK GENERATOR ---
  // When no API keys are provided in .env, seamlessly provide realistic dynamic study sets.
  console.log('[Proxy] No external API key provided in .env. Using high-fidelity local generator.');
  // Add a slight natural delay (800ms) to simulate real network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const mockSet = generateRealisticMock(prompt, existingTopic);
  return {
    status: 200,
    body: { data: JSON.stringify(mockSet) },
  };
}
