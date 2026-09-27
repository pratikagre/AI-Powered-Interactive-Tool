import { Flashcard, QuizOption, QuizQuestion, ValidationResult } from '../types/result';

/**
 * Strips markdown code fences (```json ... ``` or ``` ...) if present,
 * and extracts the core JSON string.
 */
export function extractJsonString(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();

  // If wrapped in ```json ... ``` or ``` ... ```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }

  return cleaned;
}

/**
 * Defensively parses and validates raw model output against the StudySetResult contract.
 * Guarantees that only strictly valid, normalized data reaches the React UI.
 * Any parsing issue, missing field, or malformed data produces a structured AppError.
 */
export function validateResult(rawInput: unknown): ValidationResult {
  const timestamp = Date.now();

  // 1. Check for empty or non-existent input
  if (rawInput === undefined || rawInput === null) {
    return {
      success: false,
      error: {
        type: 'EMPTY_RESPONSE',
        title: 'Empty Response',
        message: 'The model returned an empty or null payload.',
        details: 'Expected a JSON object containing cards and quiz questions.',
        timestamp,
      },
    };
  }

  let parsed: unknown;

  // 2. Parse if input is a string
  if (typeof rawInput === 'string') {
    const cleanedString = extractJsonString(rawInput);

    if (cleanedString.length === 0) {
      return {
        success: false,
        error: {
          type: 'EMPTY_RESPONSE',
          title: 'Empty Response Content',
          message: 'Received an empty string with no parseable content.',
          details: 'The AI generated blank output or whitespace.',
          timestamp,
        },
      };
    }

    try {
      parsed = JSON.parse(cleanedString);
    } catch (parseError) {
      const err = parseError as Error;
      return {
        success: false,
        error: {
          type: 'MALFORMED_JSON',
          title: 'Malformed JSON Output',
          message: 'The model generated invalid JSON that could not be parsed.',
          details: err.message,
          rawResponse: cleanedString.length > 500 ? cleanedString.slice(0, 500) + '...' : cleanedString,
          timestamp,
        },
      };
    }
  } else if (typeof rawInput === 'object') {
    parsed = rawInput;
  } else {
    return {
      success: false,
      error: {
        type: 'WRONG_SHAPE',
        title: 'Unexpected Data Type',
        message: `Expected JSON object or string, but received: ${typeof rawInput}`,
        timestamp,
      },
    };
  }

  // 3. Structural validation: Must be a non-null object (and not an array)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      success: false,
      error: {
        type: 'WRONG_SHAPE',
        title: 'Invalid Root Structure',
        message: 'Root JSON payload must be an object with "cards" and "summary" fields.',
        details: Array.isArray(parsed) ? 'Received a root array instead of an object.' : `Received ${typeof parsed}`,
        rawResponse: JSON.stringify(parsed, null, 2),
        timestamp,
      },
    };
  }

  const rawObj = parsed as Record<string, unknown>;

  // 4. Validate and normalize Flashcards
  if (!('cards' in rawObj)) {
    return {
      success: false,
      error: {
        type: 'WRONG_SHAPE',
        title: 'Missing "cards" Array',
        message: 'The generated data does not contain a "cards" field.',
        details: 'The AI model missed the required cards array in its JSON schema.',
        rawResponse: JSON.stringify(rawObj, null, 2),
        timestamp,
      },
    };
  }

  if (!Array.isArray(rawObj.cards)) {
    return {
      success: false,
      error: {
        type: 'WRONG_SHAPE',
        title: 'Invalid "cards" Type',
        message: 'The "cards" property must be an array of flashcard items.',
        details: `Expected array, received: ${typeof rawObj.cards}`,
        rawResponse: JSON.stringify(rawObj, null, 2),
        timestamp,
      },
    };
  }

  if (rawObj.cards.length === 0) {
    return {
      success: false,
      error: {
        type: 'EMPTY_RESPONSE',
        title: 'Zero Cards Generated',
        message: 'The model returned an empty list of flashcards.',
        details: 'Try providing more specific notes or a richer topic description.',
        rawResponse: JSON.stringify(rawObj, null, 2),
        timestamp,
      },
    };
  }

  const normalizedCards: Flashcard[] = [];
  for (let i = 0; i < rawObj.cards.length; i++) {
    const rawCard = rawObj.cards[i];
    if (!rawCard || typeof rawCard !== 'object') {
      return {
        success: false,
        error: {
          type: 'WRONG_SHAPE',
          title: 'Invalid Flashcard Item',
          message: `Flashcard at index ${i} is not a valid object.`,
          details: `Found: ${JSON.stringify(rawCard)}`,
          timestamp,
        },
      };
    }

    const cardObj = rawCard as Record<string, unknown>;
    
    // Support model variations: front/back or question/answer
    const front = typeof cardObj.front === 'string' ? cardObj.front.trim() : 
                  typeof cardObj.question === 'string' ? cardObj.question.trim() : '';
    const back = typeof cardObj.back === 'string' ? cardObj.back.trim() : 
                 typeof cardObj.answer === 'string' ? cardObj.answer.trim() : '';

    if (!front || !back) {
      return {
        success: false,
        error: {
          type: 'WRONG_SHAPE',
          title: 'Incomplete Flashcard Fields',
          message: `Flashcard at index ${i} is missing a valid front (question) or back (answer).`,
          details: `Card contents: ${JSON.stringify(cardObj)}`,
          timestamp,
        },
      };
    }

    normalizedCards.push({
      id: typeof cardObj.id === 'string' && cardObj.id.length > 0 ? cardObj.id : `card-${i + 1}-${Date.now()}`,
      front,
      back,
      hint: typeof cardObj.hint === 'string' ? cardObj.hint.trim() : undefined,
      tag: typeof cardObj.tag === 'string' ? cardObj.tag.trim() : 'Key Concept',
    });
  }

  // 5. Validate and normalize Quiz questions (if present, or gracefully degrade)
  const normalizedQuiz: QuizQuestion[] = [];
  if (Array.isArray(rawObj.quiz)) {
    for (let qIdx = 0; qIdx < rawObj.quiz.length; qIdx++) {
      const rawQ = rawObj.quiz[qIdx];
      if (!rawQ || typeof rawQ !== 'object') continue;

      const qObj = rawQ as Record<string, unknown>;
      const questionText = typeof qObj.question === 'string' ? qObj.question.trim() : '';
      if (!questionText) continue;

      // Validate options
      const rawOptions = Array.isArray(qObj.options) ? qObj.options : [];
      const normalizedOptions: QuizOption[] = [];

      for (let oIdx = 0; oIdx < rawOptions.length; oIdx++) {
        const rawOpt = rawOptions[oIdx];
        if (typeof rawOpt === 'string' && rawOpt.trim()) {
          const letter = String.fromCharCode(65 + oIdx); // A, B, C, D
          normalizedOptions.push({ id: letter, text: rawOpt.trim() });
        } else if (rawOpt && typeof rawOpt === 'object') {
          const optObj = rawOpt as Record<string, unknown>;
          const text = typeof optObj.text === 'string' ? optObj.text.trim() : '';
          const id = typeof optObj.id === 'string' ? optObj.id.trim() : String.fromCharCode(65 + oIdx);
          if (text) {
            normalizedOptions.push({ id, text });
          }
        }
      }

      // If we have at least 2 options, include in quiz
      if (normalizedOptions.length >= 2) {
        const correctId = typeof qObj.correctOptionId === 'string' 
          ? qObj.correctOptionId.trim() 
          : normalizedOptions[0].id;

        const explanation = typeof qObj.explanation === 'string' && qObj.explanation.trim()
          ? qObj.explanation.trim()
          : 'Review the key flashcards for this topic to master the reasoning.';

        normalizedQuiz.push({
          id: typeof qObj.id === 'string' ? qObj.id : `quiz-${qIdx + 1}`,
          question: questionText,
          options: normalizedOptions,
          correctOptionId: correctId,
          explanation,
        });
      }
    }
  }

  // 6. Validate and normalize Summary
  const rawSummary = (rawObj.summary && typeof rawObj.summary === 'object') 
    ? (rawObj.summary as Record<string, unknown>) 
    : {};

  const topic = typeof rawSummary.topic === 'string' && rawSummary.topic.trim()
    ? rawSummary.topic.trim()
    : normalizedCards[0]?.front.slice(0, 40) || 'Study Session';

  const validDifficulties: Array<'beginner' | 'intermediate' | 'advanced'> = ['beginner', 'intermediate', 'advanced'];
  const difficulty = validDifficulties.includes(rawSummary.difficulty as any)
    ? (rawSummary.difficulty as 'beginner' | 'intermediate' | 'advanced')
    : 'intermediate';

  const keyTakeaways: string[] = Array.isArray(rawSummary.keyTakeaways)
    ? rawSummary.keyTakeaways.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    : [
        `Mastered ${normalizedCards.length} core concepts across the subject.`,
        'Active recall reinforces long-term memory and retention.',
      ];

  const estimatedStudyTimeMinutes = typeof rawSummary.estimatedStudyTimeMinutes === 'number' && rawSummary.estimatedStudyTimeMinutes > 0
    ? Math.min(rawSummary.estimatedStudyTimeMinutes, 120)
    : Math.max(3, Math.ceil(normalizedCards.length * 1.5));

  // 7. Successful validation and return of pristine shape
  return {
    success: true,
    data: {
      summary: {
        topic,
        difficulty,
        keyTakeaways,
        estimatedStudyTimeMinutes,
      },
      cards: normalizedCards,
      quiz: normalizedQuiz,
    },
  };
}
