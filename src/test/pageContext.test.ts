import { describe, it, expect } from 'vitest';
import { isRestrictedUrl, extractDocumentContentInTab } from '../services/pageContext';

describe('Page Context Extraction & Restriction Handling', () => {
  it('correctly identifies restricted browser URLs that cannot be scripted', () => {
    expect(isRestrictedUrl('chrome://settings')).toBe(true);
    expect(isRestrictedUrl('chrome://extensions')).toBe(true);
    expect(isRestrictedUrl('chrome-extension://abcdefg/popup.html')).toBe(true);
    expect(isRestrictedUrl('edge://flags')).toBe(true);
    expect(isRestrictedUrl('about:blank')).toBe(true);
    expect(isRestrictedUrl('https://chrome.google.com/webstore/detail/123')).toBe(true);
    expect(isRestrictedUrl('https://example.com/document.pdf')).toBe(true);

    expect(isRestrictedUrl('https://en.wikipedia.org/wiki/Artificial_intelligence')).toBe(false);
    expect(isRestrictedUrl('https://news.ycombinator.com/item?id=123')).toBe(false);
    expect(isRestrictedUrl('http://localhost:3000/docs')).toBe(false);
  });

  it('strips nav, scripts, styles, and footer in extractDocumentContentInTab', () => {
    // Setup jsdom document with clutter
    document.title = 'Test Article Page';
    document.body.innerHTML = `
      <header><nav><a href="/">Home</a><a href="/about">About</a></nav></header>
      <script>console.log("bad script");</script>
      <style>body { color: red; }</style>
      <main>
        <article>
          <h1>Deep Learning Overview</h1>
          <p>Neural networks learn representations from data.</p>
        </article>
      </main>
      <aside class="sidebar">Ads and unrelated links</aside>
      <footer>Copyright 2026 Example Corp. All rights reserved.</footer>
    `;

    const extracted = extractDocumentContentInTab();

    expect(extracted.title).toBe('Test Article Page');
    expect(extracted.text).toContain('Deep Learning Overview');
    expect(extracted.text).toContain('Neural networks learn representations from data.');
    expect(extracted.text).not.toContain('bad script');
    expect(extracted.text).not.toContain('Ads and unrelated links');
    expect(extracted.text).not.toContain('Copyright 2026');
  });
});
