import { describe, it, expect } from 'vitest';
import { normalizeTextForSpeech, sanitizePlainText, truncateContent } from '../utils/sanitize';

describe('Sanitization & Speech Normalization Utilities', () => {
  it('normalizes markdown and URLs for speech synthesis', () => {
    const raw = '# Heading 1\nHere is a **bold** and *italic* concept with [link](https://example.com/foo) and `code`.';
    const normalized = normalizeTextForSpeech(raw);

    expect(normalized).not.toContain('#');
    expect(normalized).not.toContain('**');
    expect(normalized).not.toContain('*');
    expect(normalized).not.toContain('https://');
    expect(normalized).toContain('bold and italic concept');
    expect(normalized).toContain('code');
  });

  it('omits raw code blocks from speech output gracefully', () => {
    const raw = 'Before code.\n```javascript\nconst x = 42;\n```\nAfter code.';
    const normalized = normalizeTextForSpeech(raw);

    expect(normalized).toContain('Code snippet omitted for speech.');
    expect(normalized).not.toContain('const x = 42');
  });

  it('converts bullet lists into natural speech pauses', () => {
    const raw = '- First point\n- Second point\n* Third point';
    const normalized = normalizeTextForSpeech(raw);

    expect(normalized).toContain('. First point');
    expect(normalized).toContain('. Second point');
    expect(normalized).toContain('. Third point');
  });

  it('sanitizes script and style elements from plain text', () => {
    const dirty = 'Safe text <script>alert("hack")</script> and <style>.bad{}</style> continue.';
    const sanitized = sanitizePlainText(dirty);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
    expect(sanitized).not.toContain('<style>');
    expect(sanitized).toBe('Safe text and continue.');
  });

  it('truncates text intelligently without cutting mid-sentence when possible', () => {
    const longText = 'Sentence one. Sentence two is very informative. Sentence three wraps up the discussion.';
    const { content, truncated, originalLength } = truncateContent(longText, 45);

    expect(truncated).toBe(true);
    expect(originalLength).toBe(longText.length);
    expect(content.length).toBeLessThanOrEqual(45);
    expect(content.endsWith('.')).toBe(true);
  });
});
