import React, { useState } from 'react';
import { 
  Cpu, 
  Cloud, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff, 
  Settings as SettingsIcon,
  HelpCircle,
  FileText
} from 'lucide-react';
import type { AppCapabilities, InferenceSource } from '../types';

interface CapabilityStripProps {
  capabilities: AppCapabilities;
  currentInferenceSource?: InferenceSource;
  activePageTitle?: string;
  onOpenSettings: () => void;
  isFirebaseReady: boolean;
}

export const CapabilityStrip: React.FC<CapabilityStripProps> = ({
  capabilities,
  currentInferenceSource,
  activePageTitle,
  onOpenSettings,
  isFirebaseReady,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  // Compute AI status badge
  let aiLabel = 'AI Cloud';
  let aiIcon = <Cloud className="w-3.5 h-3.5 text-blue-500" />;
  let aiBg = 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';

  if (!isFirebaseReady) {
    aiLabel = 'AI Not Ready';
    aiIcon = <Cloud className="w-3.5 h-3.5 text-amber-500" />;
    aiBg = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  } else if (currentInferenceSource === 'ON_DEVICE' || capabilities.localAiAvailable) {
    aiLabel = currentInferenceSource === 'ON_DEVICE' ? 'On-Device' : 'Hybrid (Nano)';
    aiIcon = <Cpu className="w-3.5 h-3.5 text-emerald-500" />;
    aiBg = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  }

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-20">
      {/* Top Brand Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-vox-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-vox-500/20 font-bold text-sm tracking-wider">
            V
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-slate-100">VOX</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                Hybrid AI
              </span>
            </div>
            {activePageTitle ? (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] flex items-center gap-1" title={activePageTitle}>
                <FileText className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{activePageTitle}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 dark:text-slate-500">No webpage loaded</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowInfo(!showInfo)}
            aria-label="Capabilities Info"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Capabilities Strip */}
      <div className="flex items-center justify-between px-3.5 py-1.5 text-[11px] bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center space-x-1.5">
          {/* AI Badge */}
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${aiBg}`}>
            {aiIcon}
            <span>{aiLabel}</span>
          </span>

          {/* Voice Input Badge */}
          <span 
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${
              capabilities.sttAvailable 
                ? 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' 
                : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900'
            }`}
            title={capabilities.sttAvailable ? 'Speech Recognition Available' : 'Speech Recognition Unsupported'}
          >
            {capabilities.sttAvailable ? <Mic className="w-3 h-3 text-emerald-500" /> : <MicOff className="w-3 h-3 text-red-400" />}
            <span>Mic</span>
          </span>

          {/* Voice Output Badge */}
          <span 
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${
              capabilities.ttsAvailable 
                ? 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' 
                : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title={capabilities.ttsAvailable ? 'Text-to-Speech Available' : 'Text-to-Speech Unsupported'}
          >
            {capabilities.ttsAvailable ? <Volume2 className="w-3 h-3 text-emerald-500" /> : <VolumeX className="w-3 h-3 text-slate-400" />}
            <span>Audio</span>
          </span>
        </div>

        {/* Network Badge */}
        <span 
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${
            capabilities.online 
              ? 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' 
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
          }`}
          title={capabilities.online ? 'Online' : 'Offline'}
        >
          {capabilities.online ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-amber-500" />}
          <span>{capabilities.online ? 'Online' : 'Offline'}</span>
        </span>
      </div>

      {/* Info Popover */}
      {showInfo && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
          <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-between">
            <span>Hybrid Architecture & Capabilities</span>
            <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
          </p>
          <p>
            • <strong>AI Inference:</strong> Powered by Firebase AI Logic. When supported on Chrome Desktop with Gemini Nano, inference runs locally on your machine. Otherwise, it automatically routes to Google Cloud Gemini.
          </p>
          <p>
            • <strong>Speech Recognition:</strong> Uses Chrome Web Speech API. Notice: browser speech-to-text may require internet access depending on your OS.
          </p>
          <p>
            • <strong>Speech Output:</strong> Uses browser speech synthesis with local voices when installed.
          </p>
        </div>
      )}
    </header>
  );
};
