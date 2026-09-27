import React, { useState } from 'react';
import { Sparkles, CornerDownLeft, BookOpen, Trash2 } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

const PRESET_TOPICS = [
  {
    label: 'React Hooks & State Architecture',
    text: 'React Hooks in-depth: useState, useEffect lifecycle and dependency arrays, useCallback vs useMemo memoization, useRef for persistent mutable values, and guarding against race conditions/stale closures in async operations.',
  },
  {
    label: 'Cellular Respiration & ATP',
    text: 'Cellular respiration in eukaryotes: Glycolysis in the cytoplasm, the Krebs (Citric Acid) Cycle in the mitochondrial matrix, and the Electron Transport Chain (Oxidative Phosphorylation) producing ATP across the inner mitochondrial membrane.',
  },
  {
    label: 'Distributed Systems & CAP Theorem',
    text: 'Distributed Systems design: The CAP Theorem (Consistency, Availability, Partition Tolerance), Paxos and Raft consensus algorithms, vector clocks, and consistent hashing for horizontal data partitioning.',
  },
  {
    label: 'Quantum Computing Fundamentals',
    text: 'Quantum computing principles: Qubits vs classical bits, quantum superposition, entanglement, quantum decoherence, and Shor vs Grover quantum algorithms.',
  },
];

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading, initialValue = '' }) => {
  const [prompt, setPrompt] = useState(initialValue);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectPreset = (text: string) => {
    setPrompt(text);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-700">
      <div className="flex items-center justify-between mb-3">
        <label htmlFor="study-prompt" className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>Source Notes / Study Topic</span>
        </label>
        {prompt && (
          <button
            type="button"
            onClick={() => setPrompt('')}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors disabled:opacity-50"
            title="Clear text"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
          <textarea
            id="study-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={4}
            placeholder="Paste your lecture notes, textbook excerpt, or type any subject (e.g. Mitochondria, Distributed Systems, Calculus, Roman Republic)..."
            className="w-full resize-y rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-60"
          />
        </div>

        {/* Preset quick test chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium mr-1">Quick prompts:</span>
          {PRESET_TOPICS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset.text)}
              disabled={isLoading}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-slate-700/80 transition-colors disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-700">
              Ctrl+Enter
            </kbd>
            <span>{prompt.trim().length > 0 ? `${prompt.trim().split(/\s+/).length} words` : 'Free-form text input'}</span>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
            <span>{isLoading ? 'Processing with AI...' : 'Generate Interactive Study Set'}</span>
            <CornerDownLeft className="w-3.5 h-3.5 text-indigo-200 hidden sm:inline-block" />
          </button>
        </div>
      </form>
    </div>
  );
};
