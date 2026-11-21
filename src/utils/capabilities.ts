/**
 * Capability detection utilities for VOX.
 * Truthfully inspects browser APIs, network, and AI availability without guessing.
 */

export interface DetectedCapabilities {
  hasSpeechRecognition: boolean;
  hasSpeechSynthesis: boolean;
  hasWindowAiPrompt: boolean;
  isOnline: boolean;
  availableVoicesCount: number;
}

export function detectCapabilities(): DetectedCapabilities {
  const hasSpeechRecognition = typeof window !== 'undefined' && 
    Boolean(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition || 
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );

  const hasSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const hasWindowAiPrompt = typeof window !== 'undefined' && 
    Boolean(
      (window as unknown as { LanguageModel?: unknown }).LanguageModel ||
      (window as unknown as { ai?: { languageModel?: unknown } }).ai?.languageModel
    );

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const availableVoicesCount = (hasSpeechSynthesis && window.speechSynthesis.getVoices)
    ? window.speechSynthesis.getVoices().length
    : 0;

  return {
    hasSpeechRecognition,
    hasSpeechSynthesis,
    hasWindowAiPrompt,
    isOnline,
    availableVoicesCount
  };
}

/**
 * Checks whether Firebase configuration environment variables or user settings are populated.
 */
export function isFirebaseConfigured(envApiKey?: string, userApiKey?: string): boolean {
  const key = userApiKey || envApiKey;
  return Boolean(key && key.trim().length > 10 && !key.includes('PLACEHOLDER') && !key.includes('YOUR_'));
}
