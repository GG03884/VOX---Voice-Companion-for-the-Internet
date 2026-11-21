import type { PageContext } from '../types';
import { truncateContent } from '../utils/sanitize';

export interface ExtractionResult {
  success: boolean;
  pageContext?: PageContext;
  error?: string;
  isRestricted?: boolean;
}

/**
 * Checks if a URL cannot be scripted by Chrome extensions due to security policies.
 */
export function isRestrictedUrl(url?: string): boolean {
  if (!url) return true;
  const lower = url.toLowerCase();
  return (
    lower.startsWith('chrome://') ||
    lower.startsWith('chrome-extension://') ||
    lower.startsWith('edge://') ||
    lower.startsWith('about:') ||
    lower.startsWith('view-source:') ||
    lower.includes('chrome.google.com/webstore') ||
    lower.endsWith('.pdf')
  );
}

/**
 * Requests the current active tab and extracts its readable text via content script messaging.
 */
export async function extractActiveTabContent(maxChars = 6000): Promise<ExtractionResult> {
  // Check if Chrome extension APIs are available
  if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) {
    return {
      success: false,
      error: 'Chrome extension APIs are not active (running outside extension). You can paste text manually.',
      isRestricted: false,
    };
  }

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];

    if (!activeTab || !activeTab.id) {
      return {
        success: false,
        error: 'No active webpage found in the current window.',
      };
    }

    // Only block when we actually know the URL is restricted. An unknown URL is
    // still attempted — Chrome will reject the injection itself if it is not allowed.
    if (activeTab.url && isRestrictedUrl(activeTab.url)) {
      return {
        success: false,
        isRestricted: true,
        error: `Cannot read "${activeTab.url || 'this page'}" because Chrome restricts extension access to system, PDF, and Web Store pages. You can paste the text manually.`,
      };
    }

    const buildContext = (res: { title?: string; text: string; url?: string }): ExtractionResult => {
      const { content, truncated } = truncateContent(res.text, maxChars);
      return {
        success: true,
        pageContext: {
          title: res.title || activeTab.title || 'Untitled Webpage',
          url: activeTab.url || res.url || '',
          content,
          truncated,
          charCount: content.length,
          extractedAt: Date.now(),
        },
      };
    };

    // 1) Ask the already-loaded content script
    try {
      const response = await chrome.tabs.sendMessage(activeTab.id, { action: 'EXTRACT_PAGE_CONTENT' });
      if (response && response.text) {
        return buildContext(response);
      }
    } catch {
      // Content script not present (e.g. tab was open before the extension was installed/reloaded)
    }

    // 2) Fallback: inject the extractor directly into the page
    let injectionError: string | null = null;
    if (chrome.scripting && chrome.scripting.executeScript) {
      try {
        const injected = await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: extractDocumentContentInTab,
        });
        const res = injected?.[0]?.result as { title: string; text: string; url: string } | undefined;
        if (res && res.text) {
          return buildContext(res);
        }
      } catch (err: unknown) {
        injectionError = err instanceof Error ? err.message : String(err);
      }
    }

    if (injectionError) {
      return {
        success: false,
        isRestricted: true,
        error: `Chrome did not allow VOX to read this page (${injectionError}). Try reloading the tab, or paste the text manually.`,
      };
    }

    return {
      success: false,
      error: 'Could not extract text from this webpage. It may still be loading or has no readable text.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Failed to extract page context: ${message}`,
    };
  }
}

/**
 * Content extractor function executed in the context of the webpage.
 */
export function extractDocumentContentInTab(): { title: string; url: string; text: string } {
  const title = document.title || '';
  const url = window.location.href || '';

  // Clone document body to avoid mutating the live page
  const clone = document.body.cloneNode(true) as HTMLElement;

  // Remove scripts, styles, iframes, navigation, headers, footers, svg, and audio/video
  const selectorsToRemove = [
    'script', 'style', 'noscript', 'iframe', 'svg', 'canvas',
    'nav', 'header', 'footer', 'aside',
    '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
    '.nav', '.navbar', '.menu', '.footer', '.sidebar', '.ad', '.ads', '.cookie-banner'
  ];

  selectorsToRemove.forEach(selector => {
    const elements = clone.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  // Prefer article or main tags if present
  const article = clone.querySelector('article') || clone.querySelector('main') || clone;
  const rawText = article.innerText || article.textContent || '';

  // Clean extra whitespace
  const text = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();

  return { title, url, text };
}
