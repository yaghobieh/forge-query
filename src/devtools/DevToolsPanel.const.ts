/**
 * DevTools Panel Constants
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const VERSION = '1.0.0';

/**
 * CSS class prefix for BEM naming
 */
export const CLASS_PREFIX = 'Forge-Query';

/**
 * CSS class names following BEM convention
 */
export const CLASSES = {
  // Root
  root: `${CLASS_PREFIX}__devtools`,
  
  // Panel
  panel: `${CLASS_PREFIX}__panel`,
  panelHeader: `${CLASS_PREFIX}__panel-header`,
  panelTitle: `${CLASS_PREFIX}__panel-title`,
  panelContent: `${CLASS_PREFIX}__panel-content`,
  panelClose: `${CLASS_PREFIX}__panel-close`,
  
  // Button
  button: `${CLASS_PREFIX}__button`,
  buttonPrimary: `${CLASS_PREFIX}__button--primary`,
  buttonGhost: `${CLASS_PREFIX}__button--ghost`,
  buttonIcon: `${CLASS_PREFIX}__button-icon`,
  
  // Tabs
  tabs: `${CLASS_PREFIX}__tabs`,
  tab: `${CLASS_PREFIX}__tab`,
  tabActive: `${CLASS_PREFIX}__tab--active`,
  
  // Table
  table: `${CLASS_PREFIX}__table`,
  tableHeader: `${CLASS_PREFIX}__table-header`,
  tableRow: `${CLASS_PREFIX}__table-row`,
  tableCell: `${CLASS_PREFIX}__table-cell`,
  
  // Query
  queryList: `${CLASS_PREFIX}__query-list`,
  queryItem: `${CLASS_PREFIX}__query-item`,
  queryKey: `${CLASS_PREFIX}__query-key`,
  queryStatus: `${CLASS_PREFIX}__query-status`,
  queryObservers: `${CLASS_PREFIX}__query-observers`,
  queryTime: `${CLASS_PREFIX}__query-time`,
  
  // Status
  statusDot: `${CLASS_PREFIX}__status-dot`,
  statusSuccess: `${CLASS_PREFIX}__status-dot--success`,
  statusError: `${CLASS_PREFIX}__status-dot--error`,
  statusLoading: `${CLASS_PREFIX}__status-dot--loading`,
  statusIdle: `${CLASS_PREFIX}__status-dot--idle`,
  
  // Badge
  badge: `${CLASS_PREFIX}__badge`,
  badgeSuccess: `${CLASS_PREFIX}__badge--success`,
  badgeError: `${CLASS_PREFIX}__badge--error`,
  badgeWarning: `${CLASS_PREFIX}__badge--warning`,
  badgeInfo: `${CLASS_PREFIX}__badge--info`,
  
  // Logs
  logList: `${CLASS_PREFIX}__log-list`,
  logItem: `${CLASS_PREFIX}__log-item`,
  logTime: `${CLASS_PREFIX}__log-time`,
  logType: `${CLASS_PREFIX}__log-type`,
  logMessage: `${CLASS_PREFIX}__log-message`,
  
  // Cache
  cacheStats: `${CLASS_PREFIX}__cache-stats`,
  cacheStat: `${CLASS_PREFIX}__cache-stat`,
  cacheStatValue: `${CLASS_PREFIX}__cache-stat-value`,
  cacheStatLabel: `${CLASS_PREFIX}__cache-stat-label`,
  cacheData: `${CLASS_PREFIX}__cache-data`,
  cacheEntry: `${CLASS_PREFIX}__cache-entry`,
  
  // Empty state
  empty: `${CLASS_PREFIX}__empty`,
  
  // Logo
  logo: `${CLASS_PREFIX}__logo`,
  
  // Search
  search: `${CLASS_PREFIX}__search`,
  searchInput: `${CLASS_PREFIX}__search-input`,
  
  // Query actions
  queryActions: `${CLASS_PREFIX}__query-actions`,
} as const;

/**
 * Panel styles
 */
export const PANEL_STYLES = {
  panel: {
    position: 'fixed' as const,
    zIndex: 99999,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '12px',
    lineHeight: '1.4',
    color: '#e5e7eb',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#111827',
    borderBottom: '1px solid #374151',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 600,
    fontSize: '13px',
  },
  logo: {
    width: '20px',
    height: '20px',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
  },
  tab: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 500,
    transition: 'background-color 0.15s',
  },
  tabActive: {
    backgroundColor: '#ec4899',
    color: 'white',
  },
  tabInactive: {
    backgroundColor: 'transparent',
    color: '#9ca3af',
  },
  content: {
    height: '300px',
    overflowY: 'auto' as const,
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#6b7280',
  },
  closeButton: {
    padding: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
} as const;

/**
 * Status colors
 */
export const STATUS_COLORS = {
  success: '#22c55e',
  error: '#ef4444',
  loading: '#f59e0b',
  fetching: '#3b82f6',
  idle: '#6b7280',
  stale: '#a855f7',
} as const;

/**
 * Log type colors
 */
export const LOG_TYPE_COLORS: Record<string, string> = {
  fetch: '#3b82f6',
  success: '#22c55e',
  error: '#ef4444',
  cache: '#a855f7',
  invalidate: '#f59e0b',
  gc: '#6b7280',
};

/**
 * Position styles for floating button
 */
export const POSITION_STYLES: Record<string, { bottom?: string; top?: string; left?: string; right?: string }> = {
  'bottom-right': { bottom: '16px', right: '16px' },
  'bottom-left': { bottom: '16px', left: '16px' },
  'top-right': { top: '16px', right: '16px' },
  'top-left': { top: '16px', left: '16px' },
};

/**
 * Default configuration
 */
export const DEFAULT_CONFIG = {
  enabled: true,
  position: 'bottom-right' as const,
  initialOpen: false,
  maxLogs: 100,
  showInProduction: false,
  panelWidth: 420,
  panelHeight: 350,
  classPrefix: CLASS_PREFIX,
};

/**
 * Tab configuration
 */
export const TABS = [
  { id: 'queries', label: 'Queries' },
  { id: 'logs', label: 'Logs' },
  { id: 'cache', label: 'Cache' },
] as const;

/**
 * Table columns for queries
 */
export const QUERY_TABLE_COLUMNS = [
  { id: 'status', label: '', width: '24px' },
  { id: 'key', label: 'Key', width: '1fr' },
  { id: 'state', label: 'Status', width: '70px' },
  { id: 'observers', label: 'Obs', width: '50px' },
  { id: 'updated', label: 'Updated', width: '80px' },
] as const;

/**
 * Refresh interval for polling (ms)
 */
export const REFRESH_INTERVAL = 500;

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  panelOpen: 'forge-query-devtools-open',
  panelPosition: 'forge-query-devtools-position',
  activeTab: 'forge-query-devtools-tab',
} as const;

