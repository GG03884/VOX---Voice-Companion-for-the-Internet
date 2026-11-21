import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectCapabilities, isFirebaseConfigured } from '../utils/capabilities';

describe('Capability Detection Utilities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('detects online status honestly from navigator.onLine', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    expect(detectCapabilities().isOnline).toBe(true);

    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    expect(detectCapabilities().isOnline).toBe(false);
  });

  it('detects SpeechRecognition availability without crashing', () => {
    const caps = detectCapabilities();
    expect(typeof caps.hasSpeechRecognition).toBe('boolean');
  });

  it('validates Firebase configuration keys honestly', () => {
    expect(isFirebaseConfigured('AIzaSyMockKeyForFirebaseTesting123')).toBe(true);
    expect(isFirebaseConfigured('PLACEHOLDER_KEY')).toBe(false);
    expect(isFirebaseConfigured('YOUR_API_KEY')).toBe(false);
    expect(isFirebaseConfigured('')).toBe(false);
    expect(isFirebaseConfigured(undefined, 'AIzaSyUserDefinedKeyInSettings12345')).toBe(true);
  });
});
