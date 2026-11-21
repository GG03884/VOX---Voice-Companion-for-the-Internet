import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationService } from '../services/conversation';

describe('Conversation Service', () => {
  let service: ConversationService;

  beforeEach(() => {
    service = new ConversationService();
    service.clear();
  });

  it('adds messages and preserves order and timestamps', () => {
    const msg = service.addMessage({
      role: 'user',
      content: 'Hello VOX',
      source: 'voice',
    });

    expect(msg.id).toBeDefined();
    expect(msg.content).toBe('Hello VOX');
    expect(msg.role).toBe('user');
    expect(msg.timestamp).toBeGreaterThan(0);
    expect(service.getHistory().length).toBe(1);
  });

  it('strictly bounds conversation history to prevent memory/context overflow', () => {
    for (let i = 0; i < 20; i++) {
      service.addMessage({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
      });
    }

    const history = service.getHistory();
    expect(history.length).toBeLessThanOrEqual(12);
    expect(history[history.length - 1].content).toBe('Message 19');
  });

  it('clears conversation history completely', () => {
    service.addMessage({ role: 'user', content: 'test' });
    expect(service.getHistory().length).toBe(1);
    service.clear();
    expect(service.getHistory().length).toBe(0);
  });

  it('returns prompt templates for preset actions', () => {
    expect(service.getPromptForPreset('TEACH_ME')).toContain('Teach me the most important ideas');
    expect(service.getPromptForPreset('OVERVIEW_2MIN')).toContain('two minutes to read aloud');
    expect(service.getPromptForPreset('EXPLAIN_SIMPLY')).toContain('Explain the main idea');
    expect(service.getPromptForPreset('KEY_TAKEAWAYS')).toContain('3–5 practical takeaways');
    expect(service.getPromptForPreset('EXPLAIN_TERM', 'quantum computing')).toContain('quantum computing');
  });
});
