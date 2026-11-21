import React, { useState } from 'react';
import { 
  GraduationCap, 
  Clock, 
  Sparkles, 
  ListOrdered, 
  HelpCircle, 
  RefreshCw,
  FileEdit
} from 'lucide-react';
import type { PageContext } from '../types';

interface QuickActionsProps {
  pageContext: PageContext | null;
  onSelectAction: (actionKey: 'TEACH_ME' | 'OVERVIEW_2MIN' | 'EXPLAIN_SIMPLY' | 'KEY_TAKEAWAYS' | 'QUIZ_ME') => void;
  onExplainTerm: (term: string) => void;
  onRefreshPage: () => void;
  onOpenManualPaste: () => void;
  isLoading: boolean;
  isExtractingPage: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  pageContext,
  onSelectAction,
  onExplainTerm,
  onRefreshPage,
  onOpenManualPaste,
  isLoading,
  isExtractingPage,
}) => {
  const [showTermInput, setShowTermInput] = useState(false);
  const [term, setTerm] = useState('');

  const handleTermSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      onExplainTerm(term.trim());
      setTerm('');
      setShowTermInput(false);
    }
  };

  return (
    <div className="px-3.5 py-2 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      {/* Top Page Context Bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2">
        <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400 dark:text-slate-500">
          Learning Actions {pageContext ? `(${pageContext.charCount} chars)` : ''}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRefreshPage}
            disabled={isExtractingPage}
            className="flex items-center gap-1 hover:text-vox-600 dark:hover:text-vox-400 transition-colors"
            title="Re-extract current tab content"
          >
            <RefreshCw className={`w-3 h-3 ${isExtractingPage ? 'animate-spin text-vox-500' : ''}`} />
            <span>{isExtractingPage ? 'Extracting...' : 'Sync Page'}</span>
          </button>
          <span>•</span>
          <button
            onClick={onOpenManualPaste}
            className="flex items-center gap-1 hover:text-vox-600 dark:hover:text-vox-400 transition-colors"
            title="Paste custom text manually"
          >
            <FileEdit className="w-3 h-3" />
            <span>Paste Text</span>
          </button>
        </div>
      </div>

      {/* Prominent Primary Action: Teach Me This Page */}
      <button
        onClick={() => onSelectAction('TEACH_ME')}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-vox-600 to-indigo-600 hover:from-vox-500 hover:to-indigo-500 text-white font-medium text-xs shadow-sm shadow-vox-600/20 active:scale-[0.99] transition-all disabled:opacity-50 mb-2"
      >
        <GraduationCap className="w-4 h-4" />
        <span>Teach me this page</span>
      </button>

      {/* Quick Action Chips */}
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <button
          onClick={() => onSelectAction('OVERVIEW_2MIN')}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-vox-500 hover:text-vox-600 dark:hover:text-vox-400 transition-all text-left shadow-2xs disabled:opacity-50"
        >
          <Clock className="w-3.5 h-3.5 text-vox-500 shrink-0" />
          <span className="truncate">2-min overview</span>
        </button>

        <button
          onClick={() => onSelectAction('EXPLAIN_SIMPLY')}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-vox-500 hover:text-vox-600 dark:hover:text-vox-400 transition-all text-left shadow-2xs disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Explain simply</span>
        </button>

        <button
          onClick={() => onSelectAction('KEY_TAKEAWAYS')}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-vox-500 hover:text-vox-600 dark:hover:text-vox-400 transition-all text-left shadow-2xs disabled:opacity-50"
        >
          <ListOrdered className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="truncate">Key takeaways</span>
        </button>

        <button
          onClick={() => onSelectAction('QUIZ_ME')}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-vox-500 hover:text-vox-600 dark:hover:text-vox-400 transition-all text-left shadow-2xs disabled:opacity-50"
        >
          <HelpCircle className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          <span className="truncate">Quiz me</span>
        </button>
      </div>

      {/* Explain term toggle */}
      <div className="mt-1.5">
        {!showTermInput ? (
          <button
            onClick={() => setShowTermInput(true)}
            className="w-full text-center text-[11px] text-slate-500 dark:text-slate-400 hover:text-vox-600 dark:hover:text-vox-400 py-0.5"
          >
            + Explain a specific term from page
          </button>
        ) : (
          <form onSubmit={handleTermSubmit} className="flex gap-1.5 mt-1">
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. quantum entanglement"
              autoFocus
              className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-vox-500 text-slate-800 dark:text-slate-200"
            />
            <button
              type="submit"
              disabled={!term.trim() || isLoading}
              className="px-2.5 py-1 bg-vox-600 hover:bg-vox-500 text-white rounded-lg text-xs font-medium disabled:opacity-50"
            >
              Explain
            </button>
            <button
              type="button"
              onClick={() => setShowTermInput(false)}
              className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
