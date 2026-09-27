import React, { useState } from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  FileCode, 
  Clock, 
  ServerCrash, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { AppError } from '../types/result';

interface ErrorStateProps {
  error: AppError;
  onRetry: () => void;
  onLoadFallback?: () => void;
  onResetPrompt?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onLoadFallback,
  onResetPrompt,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const getErrorIcon = () => {
    switch (error.type) {
      case 'MALFORMED_JSON':
        return <FileCode className="w-8 h-8 text-amber-500" />;
      case 'WRONG_SHAPE':
        return <ShieldAlert className="w-8 h-8 text-rose-500" />;
      case 'TIMEOUT':
        return <Clock className="w-8 h-8 text-blue-500" />;
      case 'SERVER_ERROR':
        return <ServerCrash className="w-8 h-8 text-rose-600" />;
      case 'EMPTY_RESPONSE':
        return <HelpCircle className="w-8 h-8 text-slate-400" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-amber-500" />;
    }
  };

  const getBadgeColor = () => {
    switch (error.type) {
      case 'MALFORMED_JSON':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'WRONG_SHAPE':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'TIMEOUT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'SERVER_ERROR':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm my-6 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
          {getErrorIcon()}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeColor()}`}>
              {error.type}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300">
              {new Date(error.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {error.title}
          </h3>
        </div>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
        {error.message}
      </p>

      {/* Rationale explanation of defensive handling */}
      <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 mb-6 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1.5">🛡️ Defensive Boundary Guard:</span>
        The application intercepted this failure before it could reach the component tree, preventing a blank screen or unhandled runtime crash.
      </div>

      {/* Collapsible technical details */}
      {(error.details || error.rawResponse) && (
        <div className="mb-6 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100/70 dark:bg-slate-800/50 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span>Technical Diagnostics & Raw Output</span>
            {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showTechnicalDetails && (
            <div className="p-4 bg-slate-950 text-slate-200 text-xs font-mono space-y-3 max-h-60 overflow-y-auto">
              {error.details && (
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Error Diagnostic:</div>
                  <div className="text-rose-400 whitespace-pre-wrap">{error.details}</div>
                </div>
              )}
              {error.rawResponse && (
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Raw Intercepted Payload:</div>
                  <pre className="text-slate-300 whitespace-pre-wrap bg-slate-900 p-2.5 rounded border border-slate-800 overflow-x-auto">
                    {error.rawResponse}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Request</span>
        </button>

        {onLoadFallback && (
          <button
            type="button"
            onClick={onLoadFallback}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Load Sample Study Set</span>
          </button>
        )}

        {onResetPrompt && (
          <button
            type="button"
            onClick={onResetPrompt}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-2 transition-colors ml-auto"
          >
            Edit Prompt
          </button>
        )}
      </div>
    </div>
  );
};
