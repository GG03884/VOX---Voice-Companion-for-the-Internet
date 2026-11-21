export type InferenceSource = 'ON_DEVICE' | 'IN_CLOUD' | 'UNKNOWN';

export type InferenceModePreference = 
  | 'PREFER_ON_DEVICE' 
  | 'PREFER_IN_CLOUD' 
  | 'ONLY_ON_DEVICE' 
  | 'ONLY_IN_CLOUD';

export interface AppCapabilities {
  aiAvailable: boolean;
  localAiAvailable: boolean;
  sttAvailable: boolean;
  ttsAvailable: boolean;
  online: boolean;
}

export type SpeechRecognitionStatus = 'idle' | 'listening' | 'processing' | 'error';
export type SpeechSynthesisStatus = 'idle' | 'speaking' | 'paused';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  source?: 'voice' | 'text' | 'action';
  inferenceSource?: InferenceSource;
  inferenceReason?: string;
  pageGrounded?: boolean;
  pageTitle?: string;
  pageUrl?: string;
  latencyMs?: number;
}

export interface PageContext {
  title: string;
  url: string;
  content: string;
  truncated: boolean;
  charCount: number;
  extractedAt: number;
  error?: string;
}

export interface QuizState {
  active: boolean;
  currentQuestionIndex: number;
  questions: Array<{
    question: string;
    userAnswer?: string;
    feedback?: string;
    isCorrect?: boolean;
  }>;
}

export interface AppSettings {
  language: string;
  speechRate: number;
  speechPitch: number;
  voiceURI: string;
  autoSpeakResponses: boolean;
  inferenceMode: InferenceModePreference;
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  appId?: string;
  recaptchaSiteKey?: string;
}

export interface GenerationOptions {
  prompt: string;
  pageContext?: PageContext | null;
  history?: ChatMessage[];
  systemInstruction?: string;
  inferenceMode?: InferenceModePreference;
}

export interface GenerationResponse {
  text: string;
  inferenceSource: InferenceSource;
  inferenceReason: string;
  latencyMs: number;
}
