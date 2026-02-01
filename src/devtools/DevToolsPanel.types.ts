import type { QueryKey } from '../types';

/**
 * Query entry for DevTools display
 */
export interface DevToolsQueryEntry {
  id: string;
  queryKey: QueryKey;
  queryKeyHash: string;
  state: {
    status: string;
    data?: unknown;
    error?: unknown;
    fetchStatus?: string;
  };
  status: string;
  fetchCount: number;
  lastFetchTime: number | null;
  lastSuccessTime: number | null;
  lastErrorTime: number | null;
  observers: number;
  isStale: boolean;
  isActive: boolean;
}

/**
 * Log entry for DevTools
 */
export interface DevToolsLogEntry {
  id: string;
  timestamp: number;
  type: 'fetch' | 'success' | 'error' | 'cache' | 'invalidate' | 'gc';
  queryKey: QueryKey;
  message: string;
  data?: unknown;
  error?: unknown;
}

/**
 * Cache statistics
 */
export interface DevToolsCacheStats {
  entries: number;
  hits: number;
  misses: number;
  hitRate: number;
  size?: number;
  oldestEntry?: number | null;
  newestEntry?: number | null;
}

/**
 * DevTools state
 */
export interface DevToolsState {
  queries: DevToolsQueryEntry[];
  logs: DevToolsLogEntry[];
  cacheStats: DevToolsCacheStats;
  isConnected: boolean;
  isPaused: boolean;
  filter: string;
  selectedQueryId: string | null;
}

/**
 * DevTools panel props
 */
export interface DevToolsPanelProps {
  state: DevToolsState;
  onClose: () => void;
  onClear: () => void;
  onRefresh: () => void;
  onFilter: (filter: string) => void;
  onSelectQuery: (id: string | null) => void;
  onInvalidateQuery: (queryKey: QueryKey) => void;
  onRefetchQuery: (queryKey: QueryKey) => void;
  onRemoveQuery: (queryKey: QueryKey) => void;
}

/**
 * DevTools configuration options
 */
export interface DevToolsConfig {
  /** Enable DevTools (default: true in development) */
  enabled?: boolean;
  /** Position of the DevTools button */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Initial open state */
  initialOpen?: boolean;
  /** Maximum number of logs to keep */
  maxLogs?: number;
  /** Show in production (default: false) */
  showInProduction?: boolean;
  /** Panel width */
  panelWidth?: number;
  /** Panel height */
  panelHeight?: number;
  /** Custom class name prefix (default: 'Forge-Query') */
  classPrefix?: string;
}

/**
 * Tab types
 */
export type DevToolsTab = 'queries' | 'logs' | 'cache' | 'settings';

