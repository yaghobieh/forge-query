import type { QueryKey, QueryState, QueryMeta } from './query.types';

/**
 * Cache entry
 */
export interface CacheEntry<TData = unknown, TError = Error> {
  queryKey: QueryKey;
  state: QueryState<TData, TError>;
  meta?: QueryMeta;
  createdAt: number;
  updatedAt: number;
  accessedAt: number;
  accessCount: number;
  gcTimeout?: ReturnType<typeof setTimeout>;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Maximum number of entries */
  maxEntries?: number;
  /** Default cache time in ms */
  defaultCacheTime?: number;
  /** Default stale time in ms */
  defaultStaleTime?: number;
  /** Default GC time in ms */
  defaultGcTime?: number;
  /** Storage adapter */
  storage?: CacheStorage;
  /** Serialize function */
  serialize?: <T>(data: T) => string;
  /** Deserialize function */
  deserialize?: <T>(data: string) => T;
  /** Enable persistence */
  persist?: boolean;
  /** Persistence key */
  persistKey?: string;
}

/**
 * Cache storage interface
 */
export interface CacheStorage {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
  clear?: () => void | Promise<void>;
  keys?: () => string[] | Promise<string[]>;
}

/**
 * Cache event
 */
export interface CacheEvent<TData = unknown> {
  type: 'set' | 'get' | 'delete' | 'clear' | 'gc';
  key: QueryKey;
  data?: TData;
  timestamp: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  entries: number;
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

/**
 * Cache listener
 */
export type CacheListener = (event: CacheEvent) => void;

