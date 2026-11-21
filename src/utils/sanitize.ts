/**
 * Utility functions for text sanitization, speech normalization, and intelligent truncation.
 */

/**
 * Normalizes text so that SpeechSynthesis speaks naturally without reading out
 * markdown syntax, URLs, bullets, code blocks, or asterisks.
 */
export function normalizeTextForSpeech(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // Remove code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, 'Code snippet omitted for speech.');

  // Remove inline code
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Remove URLs
  cleaned = cleaned.replace(/https?:\/\/\S+/gi, 'link');

  // Remove markdown headers (#, ##, ###)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // Remove markdown bold/italics
  cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
  cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');

  // Convert bullet points to natural pauses
  cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, '. ');
  cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, '. ');

  // Remove blockquotes
  cleaned = cleaned.replace(/^>\s+/gm, '');

  // Clean extra punctuation and excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\.{2,}/g, '.');

  return cleaned.trim();
}

/**
 * Strips script tags, style tags, and dangerous markup from extracted HTML text.
 */
export function sanitizePlainText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Truncates page content to fit safely within model token/character limits,
 * preserving complete sentences or paragraphs where possible.
 */
export function truncateContent(
  text: string, 
  maxChars = 6000
): { content: string; truncated: boolean; originalLength: number } {
  const originalLength = text.length;
  if (originalLength <= maxChars) {
    return { content: text, truncated: false, originalLength };
  }

  const slice = text.slice(0, maxChars);
  // Match the longest sequence ending with a sentence boundary (. ! ?) followed by space or end
  const match = slice.match(/^[\s\S]*[.!?](?=\s|$)/);

  let content = '';
  if (match && match[0].trim().length >= maxChars * 0.4) {
    content = match[0].trim();
  } else {
    const lastSpace = slice.lastIndexOf(' ');
    content = (lastSpace > maxChars * 0.5 ? slice.slice(0, lastSpace) : slice).trim() + '...';
  }

  return {
    content,
    truncated: true,
    originalLength
  };
}
