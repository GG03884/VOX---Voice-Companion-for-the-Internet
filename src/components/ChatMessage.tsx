import React, { useState } from 'react';
import { 
  Cpu, 
  Cloud, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RotateCcw, 
  HelpCircle,
  FileText
} from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onSpeak: (text: string) => void;
  onStopSpeak: () => void;
  isCurrentlySpeaking: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSpeak,
  onStopSpeak,
  isCurrentlySpeaking,
}) => {
  const [copied, setCopied] = useState(false);
  const [showReason, setShowReason] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-3">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-vox-600 text-white px-4 py-2.5 shadow-sm text-sm">
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-vox-100 opacity-80">
            {message.source === 'voice' && <span>🎤 Spoken</span>}
            {message.source === 'action' && <span>⚡ Quick Action</span>}
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message
  const isOnDevice = message.inferenceSource === 'ON_DEVICE';
  const isCloud = message.inferenceSource === 'IN_CLOUD';

  return (
    <div className="my-3 space-y-1">
      <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 px-4 py-3 shadow-sm text-sm text-slate-800 dark:text-slate-100">
        {/* Page Grounded Tag */}
        {message.pageGrounded && (
          <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-700/60 text-[11px] text-vox-600 dark:text-vox-400 font-medium">
            <FileText className="w-3 h-3 shrink-0" />
            <span className="truncate">Grounded in: {message.pageTitle || 'Active Webpage'}</span>
          </div>
        )}

        {/* Content */}
        <div className="whitespace-pre-wrap leading-relaxed text-[13.5px]">
          {message.content}
        </div>

        {/* Action Controls & Source Strip */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px]">
          {/* Inference Source Badge */}
          <div className="flex items-center gap-1.5">
            {isOnDevice && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium text-[10px]">
                <Cpu className="w-3 h-3 text-emerald-600" />
                <span>On-Device (Nano)</span>
              </span>
            )}
            {isCloud && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium text-[10px]">
                <Cloud className="w-3 h-3 text-blue-600" />
                <span>Cloud Fallback</span>
              </span>
            )}
            {!isOnDevice && !isCloud && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px]">
                Source unavailable
              </span>
            )}

            {/* Why am I seeing this? */}
            <button
              onClick={() => setShowReason(!showReason)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
              title="Why am I seeing this source?"
            >
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
              title="Copy text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {isCurrentlySpeaking ? (
              <button
                onClick={onStopSpeak}
                className="p-1 text-red-500 hover:text-red-600 rounded transition-colors flex items-center gap-1 bg-red-50 dark:bg-red-950/30 px-1.5"
                title="Stop speaking"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium">Stop</span>
              </button>
            ) : (
              <button
                onClick={() => onSpeak(message.content)}
                className="p-1 text-slate-400 hover:text-vox-600 dark:hover:text-vox-400 rounded transition-colors"
                title="Speak response"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onSpeak(message.content)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
              title="Replay speech"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Why Reason Collapsible */}
        {showReason && (
          <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900/60 rounded text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Inference Details</p>
            <p>{message.inferenceReason || 'Resolved dynamically via Firebase AI Logic hybrid routing.'}</p>
            {message.latencyMs && (
              <p className="mt-1 text-[10px] text-slate-400">Response time: {message.latencyMs}ms</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
