/**
 * Speech Recognition Service using browser Web Speech API.
 * Provides push-to-talk, live interim transcript, and error management.
 */

// Define SpeechRecognition interface types for standard and webkit
interface IWindowWithSpeech extends Window {
  SpeechRecognition?: new () => ISpeechRecognition;
  webkitSpeechRecognition?: new () => ISpeechRecognition;
}

interface ISpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
}

export type SpeechCallback = (transcript: string, isFinal: boolean) => void;
export type ErrorCallback = (errorMessage: string) => void;
export type StateCallback = (isListening: boolean) => void;

export class SpeechRecognitionService {
  private recognition: ISpeechRecognition | null = null;
  private isListening = false;
  private onTranscript: SpeechCallback | null = null;
  private onError: ErrorCallback | null = null;
  private onStateChange: StateCallback | null = null;
  private language = 'en-US';

  constructor() {
    this.initRecognition();
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as IWindowWithSpeech;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  private initRecognition() {
    if (!this.isSupported()) return;

    try {
      const win = window as unknown as IWindowWithSpeech;
      const RecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (!RecognitionConstructor) return;

      this.recognition = new RecognitionConstructor();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStateChange?.(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onStateChange?.(false);
      };

      this.recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        const text = final || interim;
        if (text) {
          this.onTranscript?.(text, Boolean(final));
        }
      };

      this.recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
        let message = 'Speech recognition error';
        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            message = 'Microphone permission was denied. Please allow microphone access in Chrome settings.';
            break;
          case 'no-speech':
            message = 'No speech detected. Please speak closer to your microphone.';
            break;
          case 'audio-capture':
            message = 'No microphone was found on your device.';
            break;
          case 'network':
            message = 'Speech recognition network error. Web Speech API requires an internet connection in most browsers.';
            break;
          case 'aborted':
            message = 'Speech capture cancelled.';
            break;
          default:
            message = `Speech recognition error: ${event.error}`;
        }
        this.onError?.(message);
        this.isListening = false;
        this.onStateChange?.(false);
      };
    } catch (e) {
      console.warn('[VOX SpeechRecognition] Initialization failed:', e);
    }
  }

  public setLanguage(lang: string) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public start(
    onTranscript: SpeechCallback,
    onError: ErrorCallback,
    onStateChange: StateCallback
  ) {
    if (!this.isSupported()) {
      onError('Speech recognition is not supported in this browser. Please use the text input.');
      return;
    }

    this.onTranscript = onTranscript;
    this.onError = onError;
    this.onStateChange = onStateChange;

    if (!this.recognition) {
      this.initRecognition();
    }

    try {
      this.recognition?.start();
    } catch (err) {
      console.warn('[VOX SpeechRecognition] start error:', err);
      // Already running or busy
      this.recognition?.stop();
    }
  }

  public stop() {
    try {
      this.recognition?.stop();
    } catch (e) {
      // Ignore
    }
    this.isListening = false;
    this.onStateChange?.(false);
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
