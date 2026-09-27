import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Shuffle, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  BookOpen,
  Filter
} from 'lucide-react';
import { Flashcard } from '../types/result';

interface FlashcardDeckProps {
  cards: Flashcard[];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStatus, setCardStatus] = useState<Record<string, 'mastered' | 'review'>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'review_only'>('all');
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Filtered and optionally shuffled card array
  const activeDeck = useMemo(() => {
    let list = cards;
    if (filterMode === 'review_only') {
      list = cards.filter((c) => cardStatus[c.id] === 'review');
      if (list.length === 0) list = cards; // fallback if none marked
    }

    if (shuffleSeed > 0) {
      // Deterministic shuffle with seed
      list = [...list].sort(() => Math.sin(shuffleSeed) - 0.5);
    }
    return list;
  }, [cards, filterMode, cardStatus, shuffleSeed]);

  // Clamp index within bounds
  useEffect(() => {
    if (currentIndex >= activeDeck.length) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
    setShowHint(false);
  }, [activeDeck.length, filterMode]);

  const currentCard = activeDeck[currentIndex] || cards[0];

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % activeDeck.length);
  }, [activeDeck.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + activeDeck.length) % activeDeck.length);
  }, [activeDeck.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleMarkStatus = useCallback((status: 'mastered' | 'review') => {
    if (!currentCard) return;
    setCardStatus((prev) => ({
      ...prev,
      [currentCard.id]: status,
    }));
    handleNext();
  }, [currentCard, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        e.preventDefault();
        handleMarkStatus('review');
      } else if (e.key === '2') {
        e.preventDefault();
        handleMarkStatus('mastered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleMarkStatus]);

  const masteredCount = Object.values(cardStatus).filter((s) => s === 'mastered').length;
  const reviewCount = Object.values(cardStatus).filter((s) => s === 'review').length;
  const progressPercent = Math.round((masteredCount / Math.max(cards.length, 1)) * 100);

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        No flashcards available in this study set.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Deck Controls Header */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Card {currentIndex + 1} of {activeDeck.length}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-xs font-medium">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{masteredCount} Mastered</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{reviewCount} Review</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setFilterMode(filterMode === 'all' ? 'review_only' : 'all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filterMode === 'review_only'
                ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterMode === 'review_only' ? 'Reviewing Hard Cards' : 'All Cards'}</span>
          </button>

          {/* Shuffle button */}
          <button
            type="button"
            onClick={() => setShuffleSeed(Date.now())}
            title="Shuffle deck"
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-6 overflow-hidden">
        <div 
          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Flashcard Container */}
      <div 
        className="w-full max-w-xl h-80 sm:h-96 perspective-1000 cursor-pointer select-none"
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label="Flashcard - click or press space to flip"
      >
        <div 
          className={`relative w-full h-full duration-500 transform-style-preserve-3d transition-transform shadow-lg hover:shadow-xl rounded-3xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT OF CARD */}
          <div className="absolute inset-0 backface-hidden w-full h-full bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                {currentCard.tag || 'Concept'}
              </span>

              <div className="flex items-center gap-1 text-xs text-slate-400">
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Click or Space to flip</span>
              </div>
            </div>

            <div className="my-auto py-4 text-center">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                Question / Prompt
              </span>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {currentCard.front}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              {currentCard.hint ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(!showHint);
                  }}
                  className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? currentCard.hint : 'Need a hint?'}</span>
                </button>
              ) : (
                <div />
              )}

              <span className="text-[11px] text-slate-400">Card {currentIndex + 1} of {activeDeck.length}</span>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full bg-slate-900 text-white dark:bg-slate-950 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Answer & Explanation</span>
              </span>

              <span className="text-xs text-slate-400 flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Click to return to question</span>
              </span>
            </div>

            <div className="my-auto py-4 text-center overflow-y-auto max-h-48 px-2">
              <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                {currentCard.back}
              </p>
            </div>

            {/* Self-Rating Feedback Buttons */}
            <div 
              className="flex items-center justify-center gap-3 pt-3 border-t border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => handleMarkStatus('review')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-200 bg-amber-950/80 hover:bg-amber-900 border border-amber-800 transition-colors"
              >
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Need Review (1)</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkStatus('mastered')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Got It! (2)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-4 mt-6">
        <button
          type="button"
          onClick={handlePrev}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={handleFlip}
          className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all"
        >
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard Shortcuts Legend */}
      <div className="hidden sm:flex items-center gap-4 mt-6 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Space</kbd> Flip
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">← / →</kbd> Prev / Next
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">1</kbd> Review
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">2</kbd> Master
        </span>
      </div>
    </div>
  );
};
