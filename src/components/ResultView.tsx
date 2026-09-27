import React, { useState } from 'react';
import { 
  Layers, 
  HelpCircle, 
  ListFilter, 
  Clock, 
  Sparkles, 
  Send, 
  Download, 
  Copy, 
  Check, 
  BookMarked,
  Flame,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { StudySetResult } from '../types/result';
import { FlashcardDeck } from './FlashcardDeck';
import { QuizView } from './QuizView';

interface ResultViewProps {
  data: StudySetResult;
  onRefinePrompt: (refinePrompt: string) => void;
  isRefining: boolean;
}

export const ResultView: React.FC<ResultViewProps> = ({
  data,
  onRefinePrompt,
  isRefining,
}) => {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz' | 'all_concepts'>('flashcards');
  const [showTakeaways, setShowTakeaways] = useState(false);
  const [refineText, setRefineText] = useState('');
  const [copied, setCopied] = useState(false);

  const { summary, cards, quiz } = data;

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineText.trim() || isRefining) return;
    onRefinePrompt(refineText.trim());
    setRefineText('');
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const mdContent = `# Study Guide: ${summary.topic}
Difficulty: ${summary.difficulty} | Estimated Time: ${summary.estimatedStudyTimeMinutes} mins

## Key Takeaways
${summary.keyTakeaways.map((t) => `- ${t}`).join('\n')}

---
## Flashcards (${cards.length})
${cards.map((c, i) => `### Card ${i + 1}: ${c.front}\n**Answer:** ${c.back}\n*Tag: ${c.tag || 'General'}*\n`).join('\n')}

---
## Practice Quiz (${quiz.length} Questions)
${quiz.map((q, i) => `### Q${i + 1}: ${q.question}
${q.options.map((o) => `- [${o.id}] ${o.text}`).join('\n')}
**Correct Option:** ${q.correctOptionId}
*Explanation:* ${q.explanation}
`).join('\n')}
`;
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_study_guide.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDifficultyBadge = () => {
    switch (summary.difficulty) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'intermediate':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Subject Header & Metadata Banner */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getDifficultyBadge()}`}>
                {summary.difficulty}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                <span>~{summary.estimatedStudyTimeMinutes} min session</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                <BookMarked className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                <span>{cards.length} Cards • {quiz.length} Quiz Qs</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {summary.topic}
            </h2>
          </div>

          {/* Quick Actions (Copy / Export) */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              type="button"
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Copy structured JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Download Markdown Study Guide"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Guide</span>
            </button>
          </div>
        </div>

        {/* Collapsible Key Takeaways */}
        {summary.keyTakeaways && summary.keyTakeaways.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowTakeaways(!showTakeaways)}
              className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Key Concepts & Principles ({summary.keyTakeaways.length})</span>
              </div>
              {showTakeaways ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showTakeaways && (
              <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pl-4 list-disc animate-fadeIn">
                {summary.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {takeaway}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl shadow-inner border border-slate-300/40 dark:border-slate-700/40">
          <button
            type="button"
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'flashcards'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Interactive Flashcards ({cards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'quiz'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Knowledge Quiz ({quiz.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all_concepts')}
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'all_concepts'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Summary List</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="w-full">
        {activeTab === 'flashcards' && (
          <FlashcardDeck cards={cards} />
        )}

        {activeTab === 'quiz' && (
          <QuizView questions={quiz} />
        )}

        {activeTab === 'all_concepts' && (
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              All Terms & Definitions in this Set
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map((card, idx) => (
                <div key={card.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Card #{idx + 1}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{card.tag || 'Concept'}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{card.front}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{card.back}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Refinement Loop (Stretch Goal: Section 9) */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Refinement Loop: Direct the AI to Adjust This Set
          </h4>
        </div>

        <form onSubmit={handleRefineSubmit} className="flex gap-2">
          <input
            type="text"
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            disabled={isRefining}
            placeholder='e.g. "Add 3 more advanced cards on edge cases", "Make explanations more concise", "Add formulas"...'
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={!refineText.trim() || isRefining}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
          >
            <span>{isRefining ? 'Refining...' : 'Refine'}</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
};
