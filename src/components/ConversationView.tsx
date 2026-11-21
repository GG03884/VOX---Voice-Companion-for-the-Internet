import React, { useRef, useEffect } from 'react';
import { Sparkles, Compass, Trash2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { AudioWaveform } from './AudioWaveform';
import type { ChatMessage as ChatMessageType } from '../types';

interface ConversationViewProps {
  messages: ChatMessageType[];
  isGenerating: boolean;
  onSpeak: (text: string) => void;
  onStopSpeak: () => void;
  speakingText: string | null;
  onSelectSuggestion: (prompt: string) => void;
  hasPageContext: boolean;
  onClearHistory?: () => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  messages,
  isGenerating,
  onSpeak,
  onStopSpeak,
  speakingText,
  onSelectSuggestion,
  hasPageContext,
  onClearHistory,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const suggestions = hasPageContext
    ? [
        'Teach me the important ideas on this page',
        'Give me a 2-minute spoken overview',
        'Explain the core concept like I’m five',
        'Quiz me on the main facts',
      ]
    : [
        'How does on-device Gemini Nano work?',
        'What is hybrid AI inference?',
        'Tell me how VOX works hands-free',
      ];

  if (messages.length === 0 && !isGenerating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-vox-100 to-indigo-100 dark:from-vox-950 dark:to-indigo-950 flex items-center justify-center text-vox-600 dark:text-vox-400 mb-3 shadow-inner">
          <Sparkles className="w-6 h-6 animate-pulse-slow" />
        </div>
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          What would you like to understand?
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[260px] mt-1 mb-6">
          Speak naturally or tap a suggestion below to explore and learn with hybrid AI.
        </p>

        <div className="w-full space-y-2 max-w-sm">
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            <Compass className="w-3 h-3" />
            <span>Suggested questions</span>
          </div>
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => onSelectSuggestion(sug)}
              className="w-full text-left text-xs px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-vox-500 hover:text-vox-600 dark:hover:text-vox-400 shadow-sm transition-all"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-1">
      {/* New chat / clear history — pinned to the top so it stays visible while scrolling */}
      {messages.length > 0 && onClearHistory && (
        <div className="sticky top-0 z-10 -mx-3.5 px-3.5 py-1.5 flex justify-end bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <button
            onClick={() => {
              if (window.confirm('Start a new chat? This deletes the current conversation history.')) {
                onClearHistory();
              }
            }}
            disabled={isGenerating}
            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:text-red-600 hover:border-red-300 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors px-2.5 py-1 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear the conversation and start afresh"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>New chat</span>
          </button>
        </div>
      )}
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          onSpeak={onSpeak}
          onStopSpeak={onStopSpeak}
          isCurrentlySpeaking={speakingText === msg.content}
        />
      ))}

      {/* Generating State */}
      {isGenerating && (
        <div className="my-3 flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 w-fit shadow-sm">
          <AudioWaveform isActive={true} size="sm" color="bg-vox-500" />
          <span>VOX is thinking & synthesizing...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
