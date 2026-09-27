import { SavedSession, StudySetResult } from '../types/result';

const STORAGE_KEY = 'cortex_study_sessions_v1';

export function getSavedSessions(): SavedSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read saved sessions:', e);
    return [];
  }
}

export function saveSession(result: StudySetResult, promptSnippet: string): SavedSession {
  const sessions = getSavedSessions();
  const newSession: SavedSession = {
    id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    topic: result.summary.topic,
    timestamp: Date.now(),
    promptSnippet: promptSnippet.slice(0, 100),
    data: result,
  };

  // Limit to 20 most recent sessions
  const updated = [newSession, ...sessions.filter((s) => s.topic !== result.summary.topic)].slice(0, 20);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save session to localStorage:', e);
  }

  return newSession;
}

export function deleteSavedSession(id: string): SavedSession[] {
  const sessions = getSavedSessions().filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to update sessions after deletion:', e);
  }
  return sessions;
}
