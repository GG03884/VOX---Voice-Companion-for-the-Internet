import type { ChatMessage } from '../types';

export const PROMPT_PRESETS = {
  TEACH_ME: 
    'Teach me the most important ideas from this webpage. Start with a short overview, then explain the 3–5 most useful concepts in simple language. Use only the supplied page content for claims about this page. If information is missing, say so. End by asking whether I want an example or a quiz.',
  
  OVERVIEW_2MIN:
    'Give me a concise spoken overview of this webpage that would take approximately two minutes to read aloud. Focus on the main argument, key evidence, and conclusion. Do not invent details.',
  
  EXPLAIN_SIMPLY:
    'Explain the main idea of this page as if I am new to the topic. Use a simple analogy if helpful. Stay grounded in the supplied content.',
  
  KEY_TAKEAWAYS:
    'Give me 3–5 practical takeaways from this page. Keep each takeaway short and explain why it matters.',
  
  QUIZ_ME:
    'Ask me one question at a time based on the supplied page to test my understanding. Wait for my answer. Then give brief feedback grounded in the page and ask the next question.',
  
  EXPLAIN_TERM: (term: string) => 
    `Explain the term or concept "${term}" in the context of this webpage. Define it simply and provide a short example from the page if available.`
};

const STORAGE_KEY = 'vox_conversation_history';

export class ConversationService {
  private history: ChatMessage[] = [];
  private maxTurns = 12;

  constructor() {
    this.loadFromStorage();
  }

  public getHistory(): ChatMessage[] {
    return [...this.history];
  }

  public addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const fullMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    this.history.push(fullMessage);

    // Keep bounded history
    if (this.history.length > this.maxTurns) {
      this.history = this.history.slice(-this.maxTurns);
    }

    this.saveToStorage();
    return fullMessage;
  }

  public clear(): void {
    this.history = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
      } catch {
        // Local storage full or unavailable
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          this.history = JSON.parse(saved);
        }
      } catch {
        this.history = [];
      }
    }
  }

  public getPromptForPreset(presetKey: keyof typeof PROMPT_PRESETS, term?: string): string {
    if (presetKey === 'EXPLAIN_TERM' && term) {
      return PROMPT_PRESETS.EXPLAIN_TERM(term);
    }
    const val = PROMPT_PRESETS[presetKey];
    return typeof val === 'string' ? val : '';
  }
}

export const conversationService = new ConversationService();
