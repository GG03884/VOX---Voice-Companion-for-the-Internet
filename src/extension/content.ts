/**
 * VOX Content Script for Page Extraction
 * Extracts main readable content while stripping navigation, scripts, ads, and footers.
 */

function extractReadablePage() {
  const title = document.title || 'Untitled Page';
  const url = window.location.href || '';

  // Clone document body to safely manipulate DOM without altering page appearance
  const clone = document.body.cloneNode(true) as HTMLElement;

  // Selectors of unwanted elements
  const selectorsToRemove = [
    'script', 'style', 'noscript', 'iframe', 'svg', 'canvas',
    'nav', 'header', 'footer', 'aside',
    '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
    '.nav', '.navbar', '.menu', '.footer', '.sidebar', '.ad', '.ads', '.cookie-banner'
  ];

  selectorsToRemove.forEach((sel) => {
    const nodes = clone.querySelectorAll(sel);
    nodes.forEach((n) => n.remove());
  });

  // Prioritize semantic article / main
  const article = clone.querySelector('article') || clone.querySelector('main') || clone;
  const rawText = article.innerText || article.textContent || '';

  const cleanedText = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();

  return { title, url, text: cleanedText };
}

// Listen for messages from VOX Side Panel or Popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'EXTRACT_PAGE_CONTENT') {
    try {
      const data = extractReadablePage();
      sendResponse(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendResponse({ error: msg });
    }
  }
  return true; // Keep channel open for async response
});
