import React, { useEffect, useState } from 'react';
import { Loader2, XCircle, ShieldCheck, Sparkles, Server } from 'lucide-react';

interface LoadingStateProps {
  onCancel?: () => void;
  topicHint?: string;
}

const STAGES = [
  { icon: Server, text: 'Dispatching payload to secure backend proxy...' },
  { icon: Sparkles, text: 'Querying LLM with strict structured JSON schema...' },
  { icon: ShieldCheck, text: 'Defensively parsing and validating returned shape...' },
  { icon: Loader2, text: 'Assembling interactive stateful components...' },
];

export const LoadingState: React.FC<LoadingStateProps> = ({ onCancel, topicHint }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (elapsedSeconds < 2) setStageIndex(0);
    else if (elapsedSeconds < 5) setStageIndex(1);
    else if (elapsedSeconds < 8) setStageIndex(2);
    else setStageIndex(3);
  }, [elapsedSeconds]);

  const CurrentStageIcon = STAGES[stageIndex].icon;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-sm text-center flex flex-col items-center justify-center my-6 transition-all animate-fadeIn">
      {/* Animated icon ring */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <CurrentStageIcon className="w-8 h-8 animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
          <Loader2 className="w-3 h-3 text-white animate-spin" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        {topicHint ? `Synthesizing Study Set for "${topicHint}"` : 'Synthesizing Interactive Study Set'}
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 min-h-[1.5rem]">
        {STAGES[stageIndex].text}
      </p>

      {/* Progress pill & timer */}
      <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 px-4 py-1.5 rounded-full text-xs font-mono text-slate-600 dark:text-slate-300 mb-6">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
        <span>Stage {stageIndex + 1} of 4</span>
        <span className="text-slate-400 dark:text-slate-500">•</span>
        <span>Elapsed: {elapsedSeconds}s</span>
      </div>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancel Generation</span>
        </button>
      )}
    </div>
  );
};
