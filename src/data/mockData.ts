import { StudySetResult } from '../types/result';

export const SAMPLE_TOPICS_MOCK: Record<string, StudySetResult> = {
  default: {
    summary: {
      topic: 'React Hooks & State Architecture',
      difficulty: 'intermediate',
      keyTakeaways: [
        'Hooks allow functional components to encapsulate state and side effects.',
        'The Dependency Array in useEffect dictates effect lifecycle and prevents stale closures.',
        'Custom hooks extract reusable stateful logic without changing component hierarchy.',
      ],
      estimatedStudyTimeMinutes: 15,
    },
    cards: [
      {
        id: 'c1',
        front: 'What problem does the useCallback hook solve?',
        back: 'It memoizes a callback function instance between renders, preventing unnecessary re-renders of child components that rely on reference equality.',
        hint: 'Think about referential equality in JavaScript objects & functions.',
        tag: 'Optimization',
      },
      {
        id: 'c2',
        front: 'Why must Hooks only be called at the top level of a component?',
        back: 'React relies on the deterministic call order of hooks across renders to pair internal state cells with their respective hook calls.',
        hint: 'Rules of Hooks: no loops, conditions, or nested functions.',
        tag: 'Core Rules',
      },
      {
        id: 'c3',
        front: 'What is a "stale closure" in React, and how do you prevent it?',
        back: 'A function capturing state/prop values from an older render cycle. Prevented by correctly listing all dependencies in hook arrays or using functional state updates (prev => prev + 1).',
        hint: 'Happens frequently inside setInterval or async callbacks.',
        tag: 'Gotchas',
      },
      {
        id: 'c4',
        front: 'When should you reach for useReducer instead of useState?',
        back: 'When state logic involves multiple sub-values, complex transitions, or when the next state depends on multiple previous states.',
        hint: 'Similar to Redux reducer pattern: state + action => new state.',
        tag: 'State Design',
      },
      {
        id: 'c5',
        front: 'What is the purpose of the useRef hook beyond DOM references?',
        back: 'It holds any mutable value that persists across renders without triggering a re-render when mutated (e.g. timers, previous values, request IDs).',
        hint: 'Useful for guarding against stale async responses!',
        tag: 'Advanced',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which of the following will cause a React component using useEffect to run its cleanup function?',
        options: [
          { id: 'A', text: 'Only when the entire browser tab is closed' },
          { id: 'B', text: 'Before the component unmounts, and before re-running the effect on subsequent renders when dependencies change' },
          { id: 'C', text: 'Only when a JavaScript syntax error occurs' },
          { id: 'D', text: 'Every time the parent component evaluates a conditional statement' },
        ],
        correctOptionId: 'B',
        explanation: 'React runs the cleanup function returned by useEffect before unmounting, as well as before executing the next effect iteration when dependencies change.',
      },
      {
        id: 'q2',
        question: 'Why does mutating a `useRef` object not trigger a component re-render?',
        options: [
          { id: 'A', text: 'Because refs are stored in localStorage' },
          { id: 'B', text: 'useRef is just a plain JavaScript object with a .current property, and React does not observe mutations to it' },
          { id: 'C', text: 'Because React freezes all objects created by hooks' },
          { id: 'D', text: 'Refs only update during asynchronous network requests' },
        ],
        correctOptionId: 'B',
        explanation: 'A ref is a stable plain JS container. Mutating `.current` does not notify React or trigger a reconciliation pass, which makes it ideal for values like request IDs or timer IDs.',
      },
      {
        id: 'q3',
        question: 'What is the recommended solution if two concurrent async requests could arrive out of order and overwrite state?',
        options: [
          { id: 'A', text: 'Disable all async calls in React' },
          { id: 'B', text: 'Track an incrementing request ID in a ref or use an AbortController to ignore/cancel stale responses' },
          { id: 'C', text: 'Wrap the component in a try/catch block' },
          { id: 'D', text: 'Use Math.random() in the dependency array' },
        ],
        correctOptionId: 'B',
        explanation: 'Comparing an incrementing request ID in a ref ensures only the most recent request updates state, while AbortController actively cancels pending network requests.',
      },
    ],
  },
};

export function generateRealisticMock(prompt: string, existingTopic?: string): StudySetResult {
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
