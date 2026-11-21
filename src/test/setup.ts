// Test environment setup for Vitest
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock chrome extension APIs if not present in jsdom
if (typeof chrome === 'undefined') {
  (globalThis as unknown as { chrome: unknown }).chrome = {
    tabs: {
      query: vi.fn().mockResolvedValue([{ id: 1, title: 'Sample Page', url: 'https://example.com' }]),
      sendMessage: vi.fn().mockResolvedValue({
        title: 'Sample Article',
        url: 'https://example.com/article',
        text: 'This is the main content of the article.',
      }),
    },
    scripting: {
      executeScript: vi.fn().mockResolvedValue([
        { result: { title: 'Injected Page', url: 'https://example.com', text: 'Injected text' } }
      ]),
    },
    sidePanel: {
      setPanelBehavior: vi.fn().mockResolvedValue(undefined),
      open: vi.fn().mockResolvedValue(undefined),
    },
    runtime: {
      onInstalled: { addListener: vi.fn() },
      onMessage: { addListener: vi.fn() },
    },
    action: {
      onClicked: { addListener: vi.fn() },
    },
  };
}
