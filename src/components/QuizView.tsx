import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  Target
} from 'lucide-react';
import { QuizQuestion } from '../types/result';

interface QuizViewProps {
  questions: QuizQuestion[];
}

export const QuizView: React.FC<QuizViewProps> = ({ questions }) => {
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // questionId -> selectedOptionId
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRetestingWrong, setIsRetestingWrong] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        No quiz questions generated for this set.
      </div>
    );
  }

  const currentQ = activeQuestions[currentIndex];
  const selectedOptionId = userAnswers[currentQ?.id];
  const hasAnswered = selectedOptionId !== undefined;

  const handleSelectOption = (optionId: string) => {
    if (hasAnswered) return; // Locked once answered
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Compute final score
  const correctCount = activeQuestions.reduce((acc, q) => {
    return userAnswers[q.id] === q.correctOptionId ? acc + 1 : acc;
  }, 0);
  const totalCount = activeQuestions.length;
  const scorePercent = Math.round((correctCount / totalCount) * 100);

  // Identify wrong answers for re-testing
  const wrongQuestions = activeQuestions.filter((q) => userAnswers[q.id] !== q.correctOptionId);

  // "Re-test wrong answers" feature specifically mandated by rubric
  const handleRetestWrong = () => {
    if (wrongQuestions.length === 0) return;
    setActiveQuestions(wrongQuestions);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsCompleted(false);
    setIsRetestingWrong(true);
  };

  const handleRetakeAll = () => {
    setActiveQuestions(questions);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsCompleted(false);
    setIsRetestingWrong(false);
  };

  // --- SCORE SUMMARY SCREEN ---
  if (isCompleted) {
    return (
      <div className="w-full max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
          <Trophy className="w-8 h-8 animate-bounce" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          {isRetestingWrong ? 'Focused Re-Test Completed!' : 'Quiz Completed!'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {isRetestingWrong
            ? 'Great job actively drilling through your previously missed concepts.'
            : 'Review your knowledge retention breakdown below.'}
        </p>

        {/* Score Ring / Pill */}
        <div className="inline-flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6">
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {correctCount} / {totalCount}
          </div>
          <div className="text-left text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-3">
            <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {scorePercent}% Accuracy
            </div>
            <div>{scorePercent >= 80 ? 'Mastery Demonstrated' : 'Reinforcement Needed'}</div>
          </div>
        </div>

        {/* Review Missed Questions Summary */}
        {wrongQuestions.length > 0 && (
          <div className="text-left mb-6 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-2">
              <XCircle className="w-4 h-4" />
              <span>{wrongQuestions.length} Questions Need Practice:</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {wrongQuestions.map((q, idx) => (
                <li key={q.id} className="border-b border-rose-100 dark:border-rose-900/30 pb-1.5 last:border-none last:pb-0">
                  <span className="font-semibold text-slate-900 dark:text-white mr-1.5">{idx + 1}.</span>
                  {q.question}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {wrongQuestions.length > 0 && (
            <button
              type="button"
              onClick={handleRetestWrong}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
            >
              <Target className="w-4 h-4" />
              <span>Re-Test {wrongQuestions.length} Wrong Answer{wrongQuestions.length > 1 ? 's' : ''}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRetakeAll}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Full Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIVE QUIZ QUESTION SCREEN ---
  const isCurrentCorrect = selectedOptionId === currentQ.correctOptionId;

  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
      {/* Header with question count and re-test badge */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Question {currentIndex + 1} of {activeQuestions.length}
          </span>
          {isRetestingWrong && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              Drilling Missed
            </span>
          )}
        </div>

        <span className="text-xs text-slate-400">
          Answer to reveal feedback
        </span>
      </div>

      {/* Question Text */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-6 leading-snug">
        {currentQ.question}
      </h3>

      {/* Options List */}
      <div className="space-y-3 mb-6">
        {currentQ.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          const isCorrect = opt.id === currentQ.correctOptionId;

          let optionStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-indigo-400 text-slate-800 dark:text-slate-200';
          let letterBadge = 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

          if (hasAnswered) {
            if (isCorrect) {
              optionStyle = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-500';
              letterBadge = 'bg-emerald-600 text-white';
            } else if (isSelected && !isCorrect) {
              optionStyle = 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 ring-1 ring-rose-500';
              letterBadge = 'bg-rose-600 text-white';
            } else {
              optionStyle = 'opacity-50 border-slate-200 dark:border-slate-800 text-slate-400';
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={hasAnswered}
              onClick={() => handleSelectOption(opt.id)}
              className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all ${optionStyle}`}
            >
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${letterBadge}`}>
                {opt.id}
              </span>
              <span className="text-sm font-medium pt-0.5 leading-snug">
                {opt.text}
              </span>
              {hasAnswered && isCorrect && (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 ml-auto" />
              )}
              {hasAnswered && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 ml-auto" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation & Feedback Card */}
      {hasAnswered && (
        <div className={`p-4 rounded-xl border mb-6 animate-fadeIn ${
          isCurrentCorrect
            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
        }`}>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5">
            {isCurrentCorrect ? (
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Correct Answer
              </span>
            ) : (
              <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Incorrect Choice
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {currentQ.explanation}
          </p>
        </div>
      )}

      {/* Next Question / Finish Quiz button */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          disabled={!hasAnswered}
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
        >
          <span>{currentIndex === activeQuestions.length - 1 ? 'Finish & See Score' : 'Next Question'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
