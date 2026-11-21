import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Square, AlertCircle, ClipboardPaste } from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';

interface VoiceComposerProps {
  onSendMessage: (text: string, source: 'voice' | 'text') => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  interimTranscript: string;
  isSttSupported: boolean;
  isLoading: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
  onOpenPaste?: () => void;
}

export const VoiceComposer: React.FC<VoiceComposerProps> = ({
  onSendMessage,
  isListening,
  onStartListening,
  onStopListening,
  isSpeaking,
  onStopSpeaking,
  interimTranscript,
  isSttSupported,
  isLoading,
  errorMessage,
  onClearError,
  onOpenPaste,
}) => {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync interim transcript into the text area for preview & editing
  useEffect(() => {
    if (interimTranscript) {
      setInputText(interimTranscript);
    }
  }, [interimTranscript]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    // If currently listening, stop first
    if (isListening) {
      onStopListening();
    }

    onSendMessage(trimmed, interimTranscript ? 'voice' : 'text');
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-3">
      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-[11px] text-red-600 dark:text-red-300 flex items-start justify-between gap-1">
          <div className="flex items-start gap-1.5 flex-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
            <span>{errorMessage}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onOpenPaste && (
              <button
                onClick={() => { onOpenPaste(); onClearError?.(); }}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/60 font-medium transition-colors"
                title="Paste text manually"
              >
                <ClipboardPaste className="w-3 h-3" />
                <span>Paste</span>
              </button>
            )}
            {onClearError && (
              <button onClick={onClearError} className="text-red-400 hover:text-red-600 dark:hover:text-red-200 text-xs">
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Live Waveform Indicator when Listening */}
      {isListening && (
        <div className="mb-2 p-2 bg-vox-50 dark:bg-vox-950/50 rounded-xl border border-vox-200 dark:border-vox-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-medium text-vox-700 dark:text-vox-300">Listening to your voice...</span>
          </div>
          <AudioWaveform isActive={true} size="sm" color="bg-vox-500" />
        </div>
      )}

      {/* Input Composer Box */}
      <div className="relative rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus-within:border-vox-500 focus-within:ring-1 focus-within:ring-vox-500 transition-all p-1.5">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening 
              ? 'Listening... speak now or edit transcript' 
              : isSttSupported 
                ? 'Ask VOX anything or tap the mic to speak...' 
                : 'Type a message (microphone unavailable)...'
          }
          rows={inputText.length > 60 ? 3 : 1}
          className="w-full bg-transparent resize-none px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
        />

        <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50 px-1">
          {/* Microphone Push-To-Talk Button */}
          <div className="flex items-center space-x-1.5">
            {isSttSupported ? (
              <button
                type="button"
                onClick={isListening ? onStopListening : onStartListening}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isListening
                    ? 'bg-red-500 text-white shadow-sm shadow-red-500/30 animate-pulse'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-vox-600 dark:hover:text-vox-400 border border-slate-200 dark:border-slate-600 shadow-2xs'
                }`}
                title={isListening ? 'Click to stop listening' : 'Click to speak (Push to talk)'}
              >
                <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce' : 'text-vox-500'}`} />
                <span>{isListening ? 'Stop' : 'Voice'}</span>
              </button>
            ) : (
              <span className="text-[10px] text-slate-400 flex items-center gap-1 px-1.5 py-0.5">
                <MicOff className="w-3 h-3" />
                <span>Mic unsupported</span>
              </span>
            )}

            {/* Stop Speaking button if TTS is speaking */}
            {isSpeaking && (
              <button
                type="button"
                onClick={onStopSpeaking}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                title="Stop spoken audio"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Mute Audio</span>
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!inputText.trim() || isLoading}
            className="p-1.5 rounded-full bg-vox-600 hover:bg-vox-500 active:scale-95 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
            title="Send prompt"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
