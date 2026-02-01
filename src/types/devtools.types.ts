import type { QueryKey, QueryState, QueryStatus } from './query.types';
import type { CacheStats } from './cache.types';

/**
 * DevTools query entry
 */
export interface DevToolsQueryEntry {
  id: string;
  queryKey: QueryKey;
  queryKeyHash: string;
  state: QueryState;
  status: QueryStatus;
  fetchCount: number;
  lastFetchTime: number | null;
  lastSuccessTime: number | null;
  lastErrorTime: number | null;
  observers: number;
  isStale: boolean;
  isActive: boolean;
}

/**
 * DevTools log entry
 */
export interface DevToolsLogEntry {
  id: string;
  timestamp: number;
  type: 'fetch' | 'success' | 'error' | 'cache' | 'invalidate' | 'gc';
  queryKey: QueryKey;
  message: string;
  data?: unknown;
  error?: Error | null;
  duration?: number;
  headers?: Record<string, string>;
  body?: unknown;
}

/**
 * DevTools state
 */
export interface DevToolsState {
  queries: DevToolsQueryEntry[];
  logs: DevToolsLogEntry[];
  cacheStats: CacheStats;
  isConnected: boolean;
  isPaused: boolean;
  filter: string;
  selectedQueryId: string | null;
}

/**
 * DevTools message (for extension communication)
 */
export interface DevToolsMessage {
  type: 'init' | 'update' | 'query' | 'log' | 'stats';
  payload: unknown;
  timestamp: number;
  source: 'page' | 'devtools' | 'background';
}

/**
 * DevTools options
 */
export interface DevToolsOptions {
  /** Enable DevTools */
  enabled?: boolean;
  /** Position on screen */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Initial open state */
  initialOpen?: boolean;
  /** Max log entries */
  maxLogs?: number;
  /** Panel width */
  panelWidth?: number;
  /** Panel height */
  panelHeight?: number;
  /** Button size */
  buttonSize?: number;
  /** Show in production */
  showInProduction?: boolean;
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

