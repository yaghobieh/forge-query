/**
 * Forge Query DevTools Panel Script
 * v1.0.0
 * 
 * Uses Tailwind CSS for styling
 */

interface QueryState {
  status: string;
  data?: unknown;
  error?: unknown;
  fetchStatus?: string;
  dataUpdatedAt?: number;
  errorUpdatedAt?: number;
}

interface QueryEntry {
  id: string;
  queryKey: unknown;
  queryKeyHash: string;
  state: QueryState;
  status: string;
  fetchCount: number;
  lastFetchTime: number | null;
  lastSuccessTime: number | null;
  lastErrorTime: number | null;
  observers: number;
  isStale: boolean;
  isActive: boolean;
}

interface LogEntry {
  id: string;
  timestamp: number;
  type: string;
  queryKey: unknown;
  message: string;
  data?: unknown;
  error?: unknown;
}

interface CacheStats {
  entries: number;
  hits: number;
  misses: number;
  hitRate: number;
  size?: number;
}

interface DevToolsState {
  queries: QueryEntry[];
  logs: LogEntry[];
  cacheStats: CacheStats;
  isConnected: boolean;
  isPaused: boolean;
  filter: string;
  selectedQueryId: string | null;
}

// State
let state: DevToolsState = {
  queries: [],
  logs: [],
  cacheStats: { entries: 0, hits: 0, misses: 0, hitRate: 0 },
  isConnected: false,
  isPaused: false,
  filter: '',
  selectedQueryId: null,
};

let activeTab = 'queries';
let searchFilter = '';
let selectedQueryId: string | null = null;

// Elements
const content = document.getElementById('content')!;
const tabs = document.querySelectorAll('.Bear-Tab');
const queriesCount = document.getElementById('queries-count')!;
const logsCount = document.getElementById('logs-count')!;
const cacheCount = document.getElementById('cache-count')!;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const refreshBtn = document.getElementById('refresh-btn')!;
const clearBtn = document.getElementById('clear-btn')!;
const connectionStatus = document.getElementById('connection-status')!;
const tabIdEl = document.getElementById('tab-id')!;
const lastUpdateEl = document.getElementById('last-update')!;

// Connect to background script
const backgroundPort = chrome.runtime.connect({ name: 'forge-query-devtools' });
const inspectedTabId = chrome.devtools.inspectedWindow.tabId;

// Update tab ID display
tabIdEl.textContent = String(inspectedTabId);

// Initialize connection
backgroundPort.postMessage({ type: 'init', tabId: inspectedTabId });

// Helper functions
function formatQueryKey(key: unknown): string {
  if (typeof key === 'string') return key;
  return JSON.stringify(key);
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function getStatusClasses(status: string): { dot: string; badge: string } {
  const colors: Record<string, { dot: string; badge: string }> = {
    success: { dot: 'bg-green-500', badge: 'bg-green-500/20 text-green-400' },
    error: { dot: 'bg-red-500', badge: 'bg-red-500/20 text-red-400' },
    loading: { dot: 'bg-amber-500 animate-pulse-dot', badge: 'bg-amber-500/20 text-amber-400' },
    fetching: { dot: 'bg-blue-500 animate-pulse-dot', badge: 'bg-blue-500/20 text-blue-400' },
    idle: { dot: 'bg-gray-500', badge: 'bg-gray-500/20 text-gray-400' },
    stale: { dot: 'bg-purple-500', badge: 'bg-purple-500/20 text-purple-400' },
  };
  return colors[status] || colors.idle;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Render functions
function renderQueries(): string {
  const filteredQueries = searchFilter 
    ? state.queries.filter(q => formatQueryKey(q.queryKey).toLowerCase().includes(searchFilter.toLowerCase()))
    : state.queries;

  if (filteredQueries.length === 0) {
    return `
      <div class="flex-1 flex items-center justify-center text-gray-500">
        <div class="text-center">
          <div class="text-3xl mb-2">📭</div>
          <p>${state.queries.length === 0 ? 'No queries yet' : 'No matching queries'}</p>
        </div>
      </div>
    `;
  }

  // Main layout with query list and details panel
  const queryList = `
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Table header -->
      <div class="Forge-Query__table-header grid grid-cols-[24px_1fr_80px_50px_80px_90px] gap-2 px-4 py-2 bg-gray-800 border-b-2 border-gray-600 text-[10px] font-semibold text-gray-400 uppercase sticky top-0">
        <span></span>
        <span>Query Key</span>
        <span>Status</span>
        <span>Obs</span>
        <span>Updated</span>
        <span>Actions</span>
      </div>
      
      <!-- Query rows -->
      <div class="flex-1 overflow-y-auto">
        ${filteredQueries.map((query) => {
          const statusClasses = getStatusClasses(query.status);
          const updatedAt = query.lastFetchTime ? formatTime(query.lastFetchTime) : '-';
          const isSelected = query.id === selectedQueryId;
          
          return `
            <div 
              class="Forge-Query__table-row grid grid-cols-[24px_1fr_80px_50px_80px_90px] gap-2 px-4 py-2 border-b border-gray-700 cursor-pointer transition-colors hover:bg-gray-700/50 items-center ${isSelected ? 'bg-pink-500/10 border-l-2 border-l-pink-500' : ''}"
              data-query-id="${query.id}"
            >
              <div class="Forge-Query__status-dot w-2.5 h-2.5 rounded-full ${statusClasses.dot}"></div>
              <div class="Forge-Query__query-key font-mono text-[11px] truncate text-gray-200" title="${escapeHtml(formatQueryKey(query.queryKey))}">${escapeHtml(formatQueryKey(query.queryKey))}</div>
              <span class="Forge-Query__badge px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${statusClasses.badge}">${query.status}</span>
              <span class="Forge-Query__observers px-2 py-0.5 rounded text-[10px] font-medium text-center ${query.isActive ? 'bg-pink-500/20 text-pink-400' : 'bg-gray-600/50 text-gray-400'}">${query.observers}</span>
              <span class="Forge-Query__time text-[10px] text-gray-400 font-mono">${updatedAt}</span>
              <div class="Forge-Query__row-actions flex gap-1">
                <button class="Forge-Query__row-action p-1 rounded bg-gray-700 hover:bg-blue-500/20 text-blue-400 text-[11px] transition-colors" data-action="refetch" data-key='${JSON.stringify(query.queryKey)}' title="Refetch">↻</button>
                <button class="Forge-Query__row-action p-1 rounded bg-gray-700 hover:bg-amber-500/20 text-amber-400 text-[11px] transition-colors" data-action="invalidate" data-key='${JSON.stringify(query.queryKey)}' title="Invalidate">⚡</button>
                <button class="Forge-Query__row-action p-1 rounded bg-gray-700 hover:bg-red-500/20 text-red-400 text-[11px] transition-colors" data-action="remove" data-key='${JSON.stringify(query.queryKey)}' title="Remove">✕</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Details panel
  const selectedQuery = state.queries.find(q => q.id === selectedQueryId);
  const detailsPanel = `
    <div class="w-72 border-l border-gray-700 bg-gray-850 overflow-y-auto flex flex-col">
      <div class="px-3 py-2 border-b border-gray-700 bg-gray-800">
        <span class="text-gray-400 text-[10px] uppercase font-semibold">Query Details</span>
      </div>
      ${selectedQuery ? renderQueryDetails(selectedQuery) : `
        <div class="flex-1 flex items-center justify-center text-gray-500 p-4 text-center">
          <p class="text-[11px]">Select a query to view details</p>
        </div>
      `}
    </div>
  `;

  return queryList + detailsPanel;
}

function renderQueryDetails(query: QueryEntry): string {
  const dataStr = query.state.data ? JSON.stringify(query.state.data, null, 2) : null;
  const errorStr = query.state.error ? JSON.stringify(query.state.error, null, 2) : null;
  
  return `
    <div class="p-3 space-y-3">
      <div class="font-mono text-pink-400 text-[11px] break-all">${escapeHtml(formatQueryKey(query.queryKey))}</div>
      
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-gray-700 rounded p-2">
          <div class="text-gray-400 text-[9px] uppercase mb-1">Status</div>
          <span class="px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${getStatusClasses(query.status).badge}">${query.status}</span>
        </div>
        <div class="bg-gray-700 rounded p-2">
          <div class="text-gray-400 text-[9px] uppercase mb-1">Observers</div>
          <div class="text-white text-sm font-semibold">${query.observers}</div>
        </div>
        <div class="bg-gray-700 rounded p-2">
          <div class="text-gray-400 text-[9px] uppercase mb-1">Stale</div>
          <div class="${query.isStale ? 'text-amber-400' : 'text-green-400'} text-sm">${query.isStale ? 'Yes' : 'No'}</div>
        </div>
        <div class="bg-gray-700 rounded p-2">
          <div class="text-gray-400 text-[9px] uppercase mb-1">Active</div>
          <div class="${query.isActive ? 'text-green-400' : 'text-gray-400'} text-sm">${query.isActive ? 'Yes' : 'No'}</div>
        </div>
        <div class="bg-gray-700 rounded p-2">
          <div class="text-gray-400 text-[9px] uppercase mb-1">Fetch Count</div>
          <div class="text-white text-sm">${query.fetchCount}</div>
        </div>
        <div class="bg-gray-700 rounded p-2">
          <div class="text-gray-400 text-[9px] uppercase mb-1">Last Fetch</div>
          <div class="text-white text-[10px] font-mono">${query.lastFetchTime ? formatTime(query.lastFetchTime) : '-'}</div>
        </div>
      </div>
      
      ${dataStr ? `
        <div>
          <div class="text-gray-400 text-[9px] uppercase mb-1">Data</div>
          <pre class="bg-gray-900 rounded p-2 text-[9px] text-gray-300 overflow-auto max-h-32 font-mono whitespace-pre-wrap">${escapeHtml(dataStr.slice(0, 500))}${dataStr.length > 500 ? '...' : ''}</pre>
        </div>
      ` : ''}
      
      ${errorStr ? `
        <div>
          <div class="text-red-400 text-[9px] uppercase mb-1">Error</div>
          <pre class="bg-red-900/20 rounded p-2 text-[9px] text-red-300 overflow-auto max-h-32 font-mono whitespace-pre-wrap">${escapeHtml(errorStr)}</pre>
        </div>
      ` : ''}
    </div>
  `;
}

function renderLogs(): string {
  if (state.logs.length === 0) {
    return `
      <div class="flex-1 flex items-center justify-center text-gray-500">
        <div class="text-center">
          <div class="text-3xl mb-2">📋</div>
          <p>No logs yet</p>
        </div>
      </div>
    `;
  }

  const typeColors: Record<string, string> = {
    fetch: 'text-blue-400',
    success: 'text-green-400',
    error: 'text-red-400',
    cache: 'text-purple-400',
    invalidate: 'text-amber-400',
    remove: 'text-red-400',
    clear: 'text-gray-400',
  };

  return `
    <div class="flex-1 overflow-y-auto">
      ${state.logs.slice().reverse().map((log) => `
        <div class="Forge-Query__log-item grid grid-cols-[80px_70px_1fr] gap-3 px-4 py-2 border-b border-gray-700 text-[11px]">
          <span class="Forge-Query__log-time text-gray-500 font-mono">${formatTime(log.timestamp)}</span>
          <span class="Forge-Query__log-type font-semibold ${typeColors[log.type] || 'text-gray-400'}">${log.type}</span>
          <span class="Forge-Query__log-message text-gray-300">${escapeHtml(log.message)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderCache(): string {
  const { cacheStats, queries } = state;
  const cachedQueries = queries.filter(q => q.status === 'success' && q.state.data !== undefined);

  return `
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Stats grid -->
      <div class="Forge-Query__cache-stats grid grid-cols-4 gap-3 mb-6">
        <div class="Forge-Query__stat-card bg-gray-700 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-pink-400">${cacheStats.entries}</div>
          <div class="text-[9px] text-gray-400 uppercase mt-1">Entries</div>
        </div>
        <div class="Forge-Query__stat-card bg-gray-700 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-green-400">${(cacheStats.hitRate * 100).toFixed(0)}%</div>
          <div class="text-[9px] text-gray-400 uppercase mt-1">Hit Rate</div>
        </div>
        <div class="Forge-Query__stat-card bg-gray-700 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-blue-400">${cacheStats.hits}</div>
          <div class="text-[9px] text-gray-400 uppercase mt-1">Hits</div>
        </div>
        <div class="Forge-Query__stat-card bg-gray-700 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-amber-400">${cacheStats.misses}</div>
          <div class="text-[9px] text-gray-400 uppercase mt-1">Misses</div>
        </div>
      </div>
      
      <div class="border-t border-gray-700 pt-4">
        <h3 class="text-[10px] font-semibold text-gray-400 uppercase mb-3">Cached Data</h3>
        ${cachedQueries.length > 0 ? cachedQueries.map((query) => `
          <div class="Forge-Query__cache-entry bg-gray-700 rounded-lg p-3 mb-2">
            <div class="font-mono text-pink-400 text-[11px] mb-2 truncate" title="${escapeHtml(formatQueryKey(query.queryKey))}">${escapeHtml(formatQueryKey(query.queryKey))}</div>
            <pre class="bg-gray-800 rounded p-2 text-[9px] text-gray-300 overflow-auto max-h-24 font-mono whitespace-pre-wrap">${escapeHtml(JSON.stringify(query.state.data, null, 2)?.slice(0, 300) || '')}${JSON.stringify(query.state.data)?.length > 300 ? '...' : ''}</pre>
          </div>
        `).join('') : `
          <div class="text-center text-gray-500 py-8">No cached data yet</div>
        `}
      </div>
    </div>
  `;
}

function renderTimeline(): string {
  if (state.logs.length === 0) {
    return `
      <div class="flex-1 flex items-center justify-center text-gray-500">
        <div class="text-center">
          <div class="text-3xl mb-2">📊</div>
          <p>No activity yet</p>
        </div>
      </div>
    `;
  }

  // Group logs by query
  const queryLogs = new Map<string, LogEntry[]>();
  state.logs.forEach(log => {
    const key = formatQueryKey(log.queryKey);
    if (!queryLogs.has(key)) queryLogs.set(key, []);
    queryLogs.get(key)!.push(log);
  });

  return `
    <div class="flex-1 overflow-y-auto p-4">
      <h3 class="text-[10px] font-semibold text-gray-400 uppercase mb-3">Query Timeline</h3>
      ${Array.from(queryLogs.entries()).map(([key, logs]) => `
        <div class="mb-4 bg-gray-800 rounded-lg p-3">
          <div class="font-mono text-pink-400 text-[11px] mb-2 truncate">${escapeHtml(key)}</div>
          <div class="space-y-1">
            ${logs.slice(-5).map(log => {
              const typeColors: Record<string, string> = {
                fetch: 'bg-blue-500',
                success: 'bg-green-500',
                error: 'bg-red-500',
                cache: 'bg-purple-500',
                invalidate: 'bg-amber-500',
              };
              return `
                <div class="flex items-center gap-2 text-[10px]">
                  <span class="w-16 text-gray-500 font-mono">${formatTime(log.timestamp)}</span>
                  <span class="w-2 h-2 rounded-full ${typeColors[log.type] || 'bg-gray-500'}"></span>
                  <span class="text-gray-300">${log.type}: ${escapeHtml(log.message)}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function render(): void {
  // Update counts
  queriesCount.textContent = `(${state.queries.length})`;
  logsCount.textContent = `(${state.logs.length})`;
  cacheCount.textContent = `(${state.cacheStats.entries})`;
  
  // Update last update time
  lastUpdateEl.textContent = formatTime(Date.now());

  switch (activeTab) {
    case 'queries':
      content.innerHTML = renderQueries();
      break;
    case 'logs':
      content.innerHTML = renderLogs();
      break;
    case 'cache':
      content.innerHTML = renderCache();
      break;
    case 'timeline':
      content.innerHTML = renderTimeline();
      break;
  }
}

function updateConnectionStatus(connected: boolean): void {
  if (connected) {
    connectionStatus.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot"></span>
      <span class="text-green-400">Connected</span>
    `;
  } else {
    connectionStatus.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-gray-500"></span>
      <span class="text-gray-400">Waiting...</span>
    `;
  }
}

// Event handlers
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => {
      t.classList.remove('Bear-Tab--active');
    });
    tab.classList.add('Bear-Tab--active');
    activeTab = tab.getAttribute('data-tab') || 'queries';
    render();
  });
});

searchInput.addEventListener('input', (e) => {
  searchFilter = (e.target as HTMLInputElement).value;
  render();
});

refreshBtn.addEventListener('click', () => {
  backgroundPort.postMessage({ type: 'forge-query:get-state', tabId: inspectedTabId });
});

clearBtn.addEventListener('click', () => {
  backgroundPort.postMessage({ type: 'forge-query:clear', tabId: inspectedTabId });
  state.logs = [];
  render();
});

// Handle row clicks and actions
content.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  
  // Handle row action buttons
  if (target.classList.contains('Forge-Query__row-action')) {
    const action = target.getAttribute('data-action');
    const keyStr = target.getAttribute('data-key');
    if (action && keyStr) {
      const queryKey = JSON.parse(keyStr);
      backgroundPort.postMessage({ 
        type: `forge-query:${action}`, 
        tabId: inspectedTabId,
        queryKey 
      });
    }
    return;
  }
  
  // Handle row click for selection
  const row = target.closest('.Forge-Query__table-row') as HTMLElement;
  if (row) {
    const queryId = row.getAttribute('data-query-id');
    if (queryId) {
      selectedQueryId = selectedQueryId === queryId ? null : queryId;
      render();
    }
  }
});

// Listen for messages from background
backgroundPort.onMessage.addListener((message: { type: string; payload: DevToolsState; source?: string }) => {
  if (message.type === 'forge-query:devtools-update' && message.payload) {
    state = message.payload;
    updateConnectionStatus(true);
    render();
  }
});

// Poll for state periodically
setInterval(() => {
  backgroundPort.postMessage({ type: 'forge-query:get-state', tabId: inspectedTabId });
}, 1000);

// Initial render
render();

console.log('[Forge Query] DevTools panel v1.0.0 loaded for tab:', inspectedTabId);
