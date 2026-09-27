import { FailureMode, ValidationResult } from '../types/result';
import { validateResult } from './validateResult';

export interface GenerateRequestOptions {
  prompt: string;
  mode?: 'new' | 'refine';
  existingTopic?: string;
  failureMode?: FailureMode;
  signal?: AbortSignal;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 25000; // 25 seconds timeout

/**
 * Calls the backend proxy to generate structured study data.
 * Notice: This function NEVER calls an LLM directly; it calls the backend proxy route `/api/generate`.
 * Handles network failures, timeout via AbortController, and delegates raw response to validateResult.
 */
export async function callGenerateApi(options: GenerateRequestOptions): Promise<ValidationResult> {
  const {
    prompt,
    mode = 'new',
    existingTopic,
    failureMode = 'normal',
    signal: userSignal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  // Composite AbortController to support both manual abort and automatic timeout
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort(new Error('REQUEST_TIMEOUT'));
  }, timeoutMs);

  // Link user abort signal if provided
  if (userSignal) {
    userSignal.addEventListener('abort', () => {
      timeoutController.abort(userSignal.reason);
    });
  }

  const timestamp = Date.now();

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        mode,
        existingTopic,
        failureMode, // Allows interactive testing of all failure modes requested in Section 7
      }),
      signal: timeoutController.signal,
    });

    clearTimeout(timeoutId);

    // If server returned non-200 HTTP status
    if (!response.ok) {
      let serverErrorText = '';
      try {
        const errorJson = await response.json();
        serverErrorText = errorJson.message || errorJson.error || response.statusText;
      } catch {
        serverErrorText = await response.text();
      }

      return {
        success: false,
        error: {
          type: 'SERVER_ERROR',
          title: `Server Error (${response.status})`,
          message: serverErrorText || `The backend proxy returned HTTP ${response.status}`,
          details: `Check server logs or verify your backend configuration.`,
          timestamp,
        },
      };
    }

    const payload = await response.json();

    // Check if the server proxy specifically returned an error object
    if (payload && payload.error) {
      return {
        success: false,
        error: {
          type: payload.error.type || 'SERVER_ERROR',
          title: payload.error.title || 'API Proxy Error',
          message: payload.error.message || 'An error occurred during LLM generation',
          details: payload.error.details,
          rawResponse: payload.error.rawResponse,
          timestamp,
        },
      };
    }

    // Pass the raw AI payload through our strict defensive validator
    const rawAiOutput = payload.data !== undefined ? payload.data : payload;
    return validateResult(rawAiOutput);

  } catch (err: unknown) {
    clearTimeout(timeoutId);

    const isAbort = (err as Error)?.name === 'AbortError' || 
                    timeoutController.signal.aborted;

    if (isAbort) {
      if (timeoutController.signal.reason?.message === 'REQUEST_TIMEOUT') {
        return {
          success: false,
          error: {
            type: 'TIMEOUT',
            title: 'Request Timed Out',
            message: `The AI model took longer than ${timeoutMs / 1000}s to respond.`,
            details: 'Model providers may experience latency under heavy traffic. Try again or test with a shorter prompt.',
            timestamp,
          },
        };
      }

      return {
        success: false,
        error: {
          type: 'ABORTED',
          title: 'Request Cancelled',
          message: 'The request was cancelled because a newer request was started.',
          timestamp,
        },
      };
    }

    // Generic network or fetch failure
    const errorObj = err as Error;
    return {
      success: false,
      error: {
        type: 'SERVER_ERROR',
        title: 'Connection Failed',
        message: 'Could not connect to the backend proxy service at /api/generate.',
        details: `${errorObj.message || 'Network error'}. Ensure the backend server is running on port 3001.`,
        timestamp,
      },
    };
  }
}
