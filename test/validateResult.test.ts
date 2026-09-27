import { validateResult, extractJsonString } from '../src/lib/validateResult';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('--- Running Defensive Validation Test Suite ---');

// Test 1: Markdown code block stripping
{
  const markdownWrapped = '```json\n{"cards":[{"front":"Q","back":"A"}]}\n```';
  const stripped = extractJsonString(markdownWrapped);
  assert(stripped === '{"cards":[{"front":"Q","back":"A"}]}', 'extractJsonString strips markdown code fences');
}

// Test 2: Malformed JSON syntax error
{
  const brokenJson = '{"summary": {"topic": "Math", "cards": [{"front": "2+2", "back": 4'; // missing closing braces
  const result = validateResult(brokenJson);
  assert(!result.success, 'Malformed JSON returns success: false');
  if (!result.success) {
    assert(result.error.type === 'MALFORMED_JSON', 'Malformed JSON error type is MALFORMED_JSON');
    assert(Boolean(result.error.details), 'Malformed JSON includes syntax error details');
  }
}

// Test 3: Empty string response
{
  const emptyString = '   ';
  const result = validateResult(emptyString);
  assert(!result.success, 'Empty string returns success: false');
  if (!result.success) {
    assert(result.error.type === 'EMPTY_RESPONSE', 'Empty response produces EMPTY_RESPONSE error type');
  }
}

// Test 4: Root array instead of object (Wrong Shape)
{
  const rootArray = '[{"front": "Q", "back": "A"}]';
  const result = validateResult(rootArray);
  assert(!result.success, 'Root array returns success: false');
  if (!result.success) {
    assert(result.error.type === 'WRONG_SHAPE', 'Root array produces WRONG_SHAPE error type');
  }
}

// Test 5: Missing cards array (Wrong Shape)
{
  const missingCards = '{"summary": {"topic": "Biology"}}';
  const result = validateResult(missingCards);
  assert(!result.success, 'Missing cards returns success: false');
  if (!result.success) {
    assert(result.error.type === 'WRONG_SHAPE', 'Missing cards produces WRONG_SHAPE error');
  }
}

// Test 6: Incomplete card item (missing back/answer)
{
  const incompleteCard = '{"cards": [{"front": "What is DNA?"}]}';
  const result = validateResult(incompleteCard);
  assert(!result.success, 'Incomplete card returns success: false');
  if (!result.success) {
    assert(result.error.type === 'WRONG_SHAPE', 'Incomplete card item produces WRONG_SHAPE error');
  }
}

// Test 7: Valid complete payload with question/answer normalization
{
  const validJson = JSON.stringify({
    summary: {
      topic: 'Photosynthesis',
      difficulty: 'intermediate',
      keyTakeaways: ['Light reactions occur in thylakoid membranes', 'Calvin cycle occurs in stroma'],
      estimatedStudyTimeMinutes: 10,
    },
    cards: [
      { question: 'Where does the Calvin cycle take place?', answer: 'In the stroma of chloroplasts.' },
      { front: 'What is the primary photosynthetic pigment?', back: 'Chlorophyll a.' },
    ],
    quiz: [
      {
        question: 'Which molecule provides electrons for photosystem II?',
        options: [
          { id: 'A', text: 'Water (H2O)' },
          { id: 'B', text: 'Carbon Dioxide (CO2)' },
          { id: 'C', text: 'Glucose' },
          { id: 'D', text: 'NADPH' },
        ],
        correctOptionId: 'A',
        explanation: 'Water photolysis splits H2O into oxygen, protons, and replacement electrons.',
      },
    ],
  });

  const result = validateResult(validJson);
  assert(result.success, 'Valid payload returns success: true');
  if (result.success) {
    assert(result.data.cards.length === 2, 'Parsed 2 cards correctly');
    assert(result.data.cards[0].front === 'Where does the Calvin cycle take place?', 'Normalized question -> front');
    assert(result.data.cards[0].back === 'In the stroma of chloroplasts.', 'Normalized answer -> back');
    assert(result.data.quiz.length === 1, 'Parsed 1 quiz question correctly');
    assert(result.data.quiz[0].correctOptionId === 'A', 'Preserved correct quiz option');
  }
}

console.log('🎉 All defensive validation tests passed successfully!');
