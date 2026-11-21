import { normalizeTextForSpeech } from '../utils/sanitize';

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  lang?: string;
}

export type TTSStatusCallback = (status: 'speaking' | 'paused' | 'idle') => void;

export class SpeechSynthesisService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onStatusChange: TTSStatusCallback | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking = false;
  private isPaused = false;
  private lastSpokenText = '';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.synth);
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  public speak(
    text: string, 
    options: TTSOptions = {}, 
    onStatusChange?: TTSStatusCallback
  ): void {
    if (!this.synth) {
      onStatusChange?.('idle');
      return;
    }

    // Stop any existing utterance first
    this.stop();

    if (onStatusChange) {
      this.onStatusChange = onStatusChange;
    }

    const cleanText = normalizeTextForSpeech(text);
    if (!cleanText) {
      this.onStatusChange?.('idle');
      return;
    }

    this.lastSpokenText = text;

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.lang = options.lang ?? 'en-US';

      if (options.voiceURI) {
        const found = this.voices.find(v => v.voiceURI === options.voiceURI);
        if (found) {
          utterance.voice = found;
        }
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        this.onStatusChange?.('speaking');
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.onStatusChange?.('idle');
      };

      utterance.onerror = (e) => {
        console.warn('[VOX TTS] SpeechSynthesis error:', e);
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.onStatusChange?.('idle');
      };

      utterance.onpause = () => {
        this.isPaused = true;
        this.onStatusChange?.('paused');
      };

      utterance.onresume = () => {
        this.isPaused = false;
        this.onStatusChange?.('speaking');
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (err) {
      console.error('[VOX TTS] speak error:', err);
      this.isSpeaking = false;
      this.onStatusChange?.('idle');
    }
  }

  public pause(): void {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth && this.isPaused) {
      this.synth.resume();
    }
  }

  public stop(): void {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // Ignore
      }
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.onStatusChange?.('idle');
  }

  public replay(options: TTSOptions = {}, onStatusChange?: TTSStatusCallback): void {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, options, onStatusChange);
    }
  }

  public getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }

  public getStatus(): 'speaking' | 'paused' | 'idle' {
    if (this.isSpeaking) return this.isPaused ? 'paused' : 'speaking';
    return 'idle';
  }
}

export const speechSynthesisService = new SpeechSynthesisService();
