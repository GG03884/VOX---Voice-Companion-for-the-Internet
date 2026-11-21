import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpeechRecognitionService } from '../services/speechRecognition';
import { SpeechSynthesisService } from '../services/speechSynthesis';

describe('Speech Services (STT & TTS)', () => {
  describe('SpeechRecognitionService', () => {
    let stt: SpeechRecognitionService;

    beforeEach(() => {
      stt = new SpeechRecognitionService();
    });

    it('reports isSupported cleanly based on window presence', () => {
      expect(typeof stt.isSupported()).toBe('boolean');
    });

    it('handles start gracefully when API is unsupported with honest error', () => {
      vi.spyOn(stt, 'isSupported').mockReturnValue(false);
      const onError = vi.fn();
      const onTranscript = vi.fn();
      const onState = vi.fn();

      stt.start(onTranscript, onError, onState);
      expect(onError).toHaveBeenCalledWith(expect.stringContaining('not supported in this browser'));
      expect(stt.getIsListening()).toBe(false);
    });
  });

  describe('SpeechSynthesisService', () => {
    let tts: SpeechSynthesisService;

    beforeEach(() => {
      tts = new SpeechSynthesisService();
    });

    it('reports isSupported based on window.speechSynthesis', () => {
      expect(typeof tts.isSupported()).toBe('boolean');
    });

    it('handles stop cleanly without throwing errors', () => {
      expect(() => tts.stop()).not.toThrow();
      expect(tts.getStatus()).toBe('idle');
    });
  });
});
