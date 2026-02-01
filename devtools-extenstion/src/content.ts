/**
 * Forge Query DevTools Extension - Content Script
 * v1.0.0
 * 
 * Bridges communication between the page and the extension
 */

interface ForgeQueryMessage {
  type: string;
  payload?: unknown;
  source?: string;
  queryKey?: unknown;
}

/**
 * Listen for messages from the page (via window.postMessage)
 */
window.addEventListener('message', (event) => {
  if (event.source !== window) {
    return;
  }

  const message = event.data as ForgeQueryMessage;

  // Only handle messages from Forge Query
  if (message.source !== 'forge-query') {
    return;
  }

  // Forward to background script
  chrome.runtime.sendMessage(message).catch(() => {
    // Extension might not be ready yet
  });
});

/**
 * Listen for messages from the background script
 */
chrome.runtime.onMessage.addListener((message: ForgeQueryMessage) => {
  if (message.source === 'forge-query-devtools-bg') {
    // Forward actions to the page
    window.postMessage({
      ...message,
      source: 'forge-query-devtools',
    }, '*');
  }
});

/**
 * Inject a script to set up the global hook for the page to communicate with DevTools
 */
function injectGlobalHook(): void {
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      if (typeof window === 'undefined' || window.__FORGE_QUERY_DEVTOOLS_GLOBAL_HOOK__) {
        return;
      }

      // Create global hook for communication
      window.__FORGE_QUERY_DEVTOOLS_GLOBAL_HOOK__ = {
        isConnected: true,
        version: '1.0.0',
        
        // Send state to DevTools
        send: function(type, payload) {
          window.postMessage({
            type: type,
            payload: payload,
            source: 'forge-query',
            timestamp: Date.now()
          }, '*');
        },
        
        // Receive actions from DevTools
        onAction: null,
      };

      // Listen for actions from DevTools
      window.addEventListener('message', function(event) {
        if (event.source !== window) return;
        
        var message = event.data;
        if (message.source !== 'forge-query-devtools') return;
        
        // Handle actions
        if (window.__FORGE_QUERY_CLIENT__ && window.__FORGE_QUERY_DEVTOOLS_GLOBAL_HOOK__.onAction) {
          window.__FORGE_QUERY_DEVTOOLS_GLOBAL_HOOK__.onAction(message);
        }
        
        // Handle specific actions
        var client = window.__FORGE_QUERY_CLIENT__;
        if (!client) return;
        
        switch(message.type) {
          case 'forge-query:refetch':
            if (message.queryKey) {
              client.refetchQueries({ queryKey: message.queryKey, exact: true });
            }
            break;
          case 'forge-query:invalidate':
            if (message.queryKey) {
              client.invalidateQueries({ queryKey: message.queryKey, exact: true });
            }
            break;
          case 'forge-query:remove':
            if (message.queryKey) {
              client.removeQueries({ queryKey: message.queryKey, exact: true });
            }
            break;
          case 'forge-query:clear':
            client.clear();
            break;
          case 'forge-query:get-state':
            // Request fresh state
            var state = client.getDevToolsState ? client.getDevToolsState() : null;
            if (state) {
              window.__FORGE_QUERY_DEVTOOLS_GLOBAL_HOOK__.send('forge-query:devtools-update', state);
            }
            break;
        }
      });

      console.log('[Forge Query] DevTools hook v1.0.0 installed');
    })();
  `;

  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

// Inject immediately
injectGlobalHook();

console.log('[Forge Query] Content script v1.0.0 loaded');
