import React from 'react';
import { Bug, Info } from 'lucide-react';
import { FailureMode } from '../types/result';

interface FailureSimulatorProps {
  currentMode: FailureMode;
  onModeChange: (mode: FailureMode) => void;
}

const MODES: { id: FailureMode; label: string; desc: string; color: string }[] = [
  { id: 'normal', label: 'Normal (Production)', desc: 'Standard reliable execution via LLM or realistic generator', color: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'malformed_json', label: 'Malformed JSON', desc: 'Simulates syntax errors, unclosed brackets, or markdown prose in payload', color: 'text-amber-600 dark:text-amber-400' },
  { id: 'wrong_shape', label: 'Wrong Shape / Missing Fields', desc: 'Simulates valid JSON missing required cards/questions schema', color: 'text-rose-600 dark:text-rose-400' },
  { id: 'empty', label: 'Empty Response', desc: 'Simulates blank string or null output from AI provider', color: 'text-purple-600 dark:text-purple-400' },
  { id: 'slow_timeout', label: 'Slow Timeout (>25s)', desc: 'Simulates heavy upstream latency triggering client AbortController', color: 'text-blue-600 dark:text-blue-400' },
  { id: 'server_error', label: 'Server 500 Outage', desc: 'Simulates HTTP 500 upstream provider failure', color: 'text-red-600 dark:text-red-400' },
];

export const FailureSimulator: React.FC<FailureSimulatorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="w-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 mb-6 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
            <Bug className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Evaluator Test Controls: Test Realistic Failure Modes
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-300">
              Verify Section 7 failure handling live without modifying code
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={currentMode}
            onChange={(e) => onModeChange(e.target.value as FailureMode)}
            className="w-full sm:w-auto text-xs font-medium py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentMode !== 'normal' && (
        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>
            Active failure injection: <strong>{MODES.find(m => m.id === currentMode)?.desc}</strong>. Submit any prompt above to observe defensive interception.
          </span>
        </div>
      )}
    </div>
  );
};
