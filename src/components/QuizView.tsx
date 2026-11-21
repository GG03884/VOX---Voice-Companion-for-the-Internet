import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, ArrowRight, X, Volume2, Mic } from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';

export interface QuizQuestionData {
  question: string;
  userAnswer?: string;
  feedback?: string;
  isCorrect?: boolean;
}

interface QuizViewProps {
  questions: QuizQuestionData[];
  currentQuestionIndex: number;
  onAnswerSubmit: (answer: string) => void;
  onNextQuestion: () => void;
  onExitQuiz: () => void;
  onSpeak: (text: string) => void;
  isEvaluating: boolean;
  isListening: boolean;
  onToggleVoice: () => void;
  interimTranscript: string;
}

export const QuizView: React.FC<QuizViewProps> = ({
  questions,
  currentQuestionIndex,
  onAnswerSubmit,
  onNextQuestion,
  onExitQuiz,
  onSpeak,
  isEvaluating,
  isListening,
  onToggleVoice,
  interimTranscript,
}) => {
  const [answerInput, setAnswerInput] = useState('');

  const currentQ = questions[currentQuestionIndex];
  const hasFeedback = Boolean(currentQ?.feedback);

  React.useEffect(() => {
    if (interimTranscript) {
      setAnswerInput(interimTranscript);
    }
  }, [interimTranscript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answerInput.trim() && !isEvaluating) {
      onAnswerSubmit(answerInput.trim());
      setAnswerInput('');
    }
  };

  if (!currentQ) {
    return (
      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-xs">
        <p className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Quiz Finished!</p>
        <button
          onClick={onExitQuiz}
          className="px-3 py-1.5 rounded-lg bg-vox-600 text-white font-medium hover:bg-vox-500"
        >
          Return to Conversation
        </button>
      </div>
    );
  }

  return (
    <div className="m-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-purple-200 dark:border-purple-900 shadow-sm text-xs">
      {/* Quiz Header */}
      <div className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-purple-900/60 mb-3">
        <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-semibold">
          <HelpCircle className="w-4 h-4" />
          <span>Interactive Spoken Quiz</span>
          <span className="text-[10px] bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded font-mono">
            Q{currentQuestionIndex + 1}
          </span>
        </div>
        <button
          onClick={onExitQuiz}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
          title="Exit Quiz"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Question Prompt */}
      <div className="bg-purple-50/60 dark:bg-purple-950/30 p-3 rounded-xl border border-purple-100 dark:border-purple-900/40 mb-3">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-slate-800 dark:text-slate-100 text-sm leading-snug">
            {currentQ.question}
          </p>
          <button
            onClick={() => onSpeak(currentQ.question)}
            className="p-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 shrink-0"
            title="Read question aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Answer Area or Feedback */}
      {!hasFeedback ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Your Spoken or Typed Answer:
          </label>
          <div className="relative">
            <textarea
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              placeholder="Speak your answer or type here..."
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
            />
            {isListening && (
              <div className="absolute right-2 bottom-2">
                <AudioWaveform isActive={true} size="sm" color="bg-purple-500" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onToggleVoice}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isListening ? 'Stop' : 'Speak Answer'}</span>
            </button>

            <button
              type="submit"
              disabled={!answerInput.trim() || isEvaluating}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs disabled:opacity-40 shadow-xs"
            >
              {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
            </button>
          </div>
        </form>
      ) : (
        /* Feedback Card */
        <div className="space-y-3">
          <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
            currentQ.isCorrect
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
          }`}>
            <div className="flex items-center gap-1.5 font-semibold mb-1">
              {currentQ.isCorrect ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-amber-600" />
                  <span>Needs refinement:</span>
                </>
              )}
            </div>
            <p>{currentQ.feedback}</p>
          </div>

          <button
            onClick={onNextQuestion}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-xs"
          >
            <span>Next Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
