export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  tag?: string;
}

export interface QuizOption {
  id: string; // e.g. "A", "B", "C", "D"
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface StudySummary {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  keyTakeaways: string[];
  estimatedStudyTimeMinutes: number;
}

export interface StudySetResult {
  summary: StudySummary;
  cards: Flashcard[];
  quiz: QuizQuestion[];
}

export type FailureMode = 
  | 'normal'
  | 'malformed_json'
  | 'wrong_shape'
  | 'empty'
  | 'slow_timeout'
  | 'server_error';

export type ErrorType = 
  | 'MALFORMED_JSON'
  | 'WRONG_SHAPE'
  | 'EMPTY_RESPONSE'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'ABORTED'
  | 'UNKNOWN';

export interface AppError {
  type: ErrorType;
  title: string;
  message: string;
  details?: string;
  rawResponse?: string;
  timestamp: number;
}

export interface ValidationSuccess {
  success: true;
  data: StudySetResult;
}

export interface ValidationFailure {
  success: false;
  error: AppError;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export interface SavedSession {
  id: string;
  topic: string;
  timestamp: number;
  promptSnippet: string;
  data: StudySetResult;
}
