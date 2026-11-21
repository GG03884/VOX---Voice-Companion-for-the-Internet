/**
 * VOX Background Service Worker (Manifest V3)
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[VOX] Extension installed successfully.');
  
  // Set default side panel behavior to open when user clicks the extension action icon
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
      console.warn('[VOX] Failed to set sidePanel behavior:', err);
    });
  }
});

// Listen for action click fallback (if sidePanel is not supported or popup toggled)
chrome.action.onClicked?.addListener((tab) => {
  if (tab.id && chrome.sidePanel && chrome.sidePanel.open) {
    chrome.sidePanel.open({ tabId: tab.id }).catch((err) => {
      console.warn('[VOX] Failed to open side panel:', err);
    });
  }
});
