import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  Cpu, 
  Key, 
  Trash2, 
  ShieldCheck 
} from 'lucide-react';
import type { AppSettings, InferenceModePreference } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClearHistory: () => void;
  availableVoices: SpeechSynthesisVoice[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearHistory,
  availableVoices,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'inference' | 'voice' | 'firebase' | 'privacy'>('inference');
  const [clearedNotice, setClearedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your current conversation history?')) {
      onClearHistory();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">VOX Settings</h3>
            <span className="text-[10px] bg-vox-100 dark:bg-vox-950 text-vox-600 dark:text-vox-400 px-1.5 py-0.5 rounded font-mono">
              v1.0
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-medium px-2 bg-slate-50 dark:bg-slate-950">
          <button
            onClick={() => setActiveTab('inference')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'inference'
                ? 'border-vox-500 text-vox-600 dark:text-vox-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Hybrid AI</span>
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'voice'
                ? 'border-vox-500 text-vox-600 dark:text-vox-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voice & Audio</span>
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'firebase'
                ? 'border-vox-500 text-vox-600 dark:text-vox-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Firebase</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'privacy'
                ? 'border-vox-500 text-vox-600 dark:text-vox-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-600 dark:text-slate-300">
          {/* TAB: HYBRID AI */}
          {activeTab === 'inference' && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Inference Strategy
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Configures the official Firebase AI Logic SDK routing behavior.
                </p>
                <select
                  value={formData.inferenceMode}
                  onChange={(e) => setFormData({ ...formData, inferenceMode: e.target.value as InferenceModePreference })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="PREFER_ON_DEVICE">PREFER_ON_DEVICE (Recommended: Nano with Cloud Fallback)</option>
                  <option value="PREFER_IN_CLOUD">PREFER_IN_CLOUD (Prioritize Gemini Cloud)</option>
                  <option value="ONLY_ON_DEVICE">ONLY_ON_DEVICE (Strict Local Gemini Nano only)</option>
                  <option value="ONLY_IN_CLOUD">ONLY_IN_CLOUD (Strict Cloud Gemini only)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-200">How Hybrid Inference Works</p>
                <p>
                  When set to <strong>PREFER_ON_DEVICE</strong>, Firebase AI Logic checks if Chrome’s built-in Gemini Nano model is ready on your machine. If ready, inference is performed 100% locally with zero cloud egress. If missing, downloading, or unsupported, it falls back seamlessly to Gemini 2.5 Flash via Firebase.
                </p>
              </div>
            </div>
          )}

          {/* TAB: VOICE & AUDIO */}
          {activeTab === 'voice' && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Speech Recognition Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="en-US">English (United States)</option>
                  <option value="en-GB">English (United Kingdom)</option>
                  <option value="en-IN">English (India)</option>
                  <option value="en-AU">English (Australia)</option>
                  <option value="en-CA">English (Canada)</option>
                  <option value="es-ES">Spanish (Spain)</option>
                  <option value="fr-FR">French (France)</option>
                  <option value="de-DE">German (Germany)</option>
                  <option value="ja-JP">Japanese</option>
                </select>
              </div>

              {availableVoices.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Text-to-Speech Voice
                  </label>
                  <select
                    value={formData.voiceURI}
                    onChange={(e) => setFormData({ ...formData, voiceURI: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">Default System Voice</option>
                    {availableVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Speech Rate ({formData.speechRate}x)
                  </label>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.1"
                  value={formData.speechRate}
                  onChange={(e) => setFormData({ ...formData, speechRate: parseFloat(e.target.value) })}
                  className="w-full accent-vox-600"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoSpeakResponses}
                    onChange={(e) => setFormData({ ...formData, autoSpeakResponses: e.target.checked })}
                    className="rounded text-vox-600 focus:ring-vox-500"
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Auto-read assistant responses aloud
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB: FIREBASE & APP CHECK */}
          {activeTab === 'firebase' && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                You can configure Firebase directly here or through project <code className="text-vox-600">.env</code> variables.
              </p>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Firebase Web API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={formData.apiKey || ''}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Project ID
                </label>
                <input
                  type="text"
                  placeholder="your-firebase-project-id"
                  value={formData.projectId || ''}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  App ID
                </label>
                <input
                  type="text"
                  placeholder="1:1234567890:web:abcdef"
                  value={formData.appId || ''}
                  onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  reCAPTCHA / App Check Site Key (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Site key for App Check"
                  value={formData.recaptchaSiteKey || ''}
                  onChange={(e) => setFormData({ ...formData, recaptchaSiteKey: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB: PRIVACY & STORAGE */}
          {activeTab === 'privacy' && (
            <div className="space-y-3 text-[11px]">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 space-y-1">
                <p className="font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>VOX Privacy Commitment</span>
                </p>
                <p>• Zero audio recording: Voice input is transcribed in real-time in your browser and discarded.</p>
                <p>• Webpage text is untrusted reference data: extracted only when you trigger a learning action.</p>
                <p>• On-device inference: Runs completely offline on your hardware when Gemini Nano is enabled.</p>
              </div>

              <div className="pt-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Conversation Storage</p>
                <p className="text-slate-500 mb-3">
                  Your conversation history is stored locally in your browser to maintain multi-turn context.
                </p>
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Conversation History</span>
                </button>
                {clearedNotice && (
                  <span className="text-emerald-600 text-[10px] ml-2 font-medium">History cleared!</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-vox-600 hover:bg-vox-500 text-white text-xs font-medium shadow-sm transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
