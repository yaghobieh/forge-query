/**
 * Forge Query DevTools Extension - Background Script
 * v1.0.0
 * 
 * Handles communication between DevTools panels and inspected pages
 */

interface ForgeQueryMessage {
  type: string;
  payload?: unknown;
  source?: string;
  tabId?: number;
  queryKey?: unknown;
}

// Store connections to DevTools panels by tab ID
const panelConnections: Map<number, chrome.runtime.Port> = new Map();

// Store last known state for each tab
const tabStates: Map<number, unknown> = new Map();

/**
 * Handle connections from DevTools panels
 */
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'forge-query-devtools') {
    return;
  }

  console.log('[Forge Query] DevTools panel connected');

  let connectedTabId: number | undefined;

  // Handle messages from DevTools panel
  port.onMessage.addListener((message: ForgeQueryMessage) => {
    const tabId = message.tabId || connectedTabId;

    if (message.type === 'init' && message.tabId) {
      connectedTabId = message.tabId;
      panelConnections.set(message.tabId, port);
      console.log('[Forge Query] Panel connected to tab:', message.tabId);
      
      // Send any cached state
      const cachedState = tabStates.get(message.tabId);
      if (cachedState) {
        port.postMessage({
          type: 'forge-query:devtools-update',
          payload: cachedState,
        });
      }
      return;
    }

    if (!tabId) {
      console.warn('[Forge Query] No tab ID for message:', message.type);
      return;
    }

    // Forward messages to content script
    chrome.tabs.sendMessage(tabId, {
      type: message.type,
      queryKey: message.queryKey,
      source: 'forge-query-devtools-bg',
    }).catch((err) => {
      console.warn('[Forge Query] Failed to send to tab:', err.message);
    });
  });

  // Handle disconnect
  port.onDisconnect.addListener(() => {
    if (connectedTabId) {
      panelConnections.delete(connectedTabId);
      console.log('[Forge Query] Panel disconnected from tab:', connectedTabId);
    }
  });
});

/**
 * Handle messages from content scripts
 */
chrome.runtime.onMessage.addListener((message: ForgeQueryMessage, sender) => {
  const tabId = sender.tab?.id;

  if (!tabId) {
    return;
  }

  if (message.source !== 'forge-query') {
    return;
  }

  // Store state for this tab
  if (message.type === 'forge-query:devtools-update') {
    tabStates.set(tabId, message.payload);
  }

  // Forward to DevTools panel if connected
  const panelPort = panelConnections.get(tabId);
  if (panelPort) {
    try {
      panelPort.postMessage({
        type: message.type,
        payload: message.payload,
      });
    } catch (error) {
      console.warn('[Forge Query] Failed to forward to panel:', error);
      panelConnections.delete(tabId);
    }
  }
});

/**
 * Clean up when tabs are closed
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  panelConnections.delete(tabId);
  tabStates.delete(tabId);
});

console.log('[Forge Query] Background script v1.0.0 loaded');
