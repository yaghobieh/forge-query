/**
 * Forge Query DevTools Extension - DevTools Entry
 * v1.0.0
 * 
 * Creates the DevTools panel
 */

// Create the Forge Query panel in DevTools
chrome.devtools.panels.create(
  'Forge Query',
  'icons/icon-16.png',
  'panel.html',
  (panel) => {
    console.log('[Forge Query] DevTools panel created for tab:', chrome.devtools.inspectedWindow.tabId);

    // Panel shown callback
    panel.onShown.addListener((panelWindow) => {
      console.log('[Forge Query] Panel shown');
    });

    // Panel hidden callback
    panel.onHidden.addListener(() => {
      console.log('[Forge Query] Panel hidden');
    });
  }
);

console.log('[Forge Query] DevTools v1.0.0 initialized');
