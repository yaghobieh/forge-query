import { Query } from './Query';
import { QueryCache } from '../cache/QueryCache';
import type {
  QueryKey,
  QueryOptions,
  QueryResult,
  CacheConfig,
  DevToolsOptions,
  DevToolsState,
  DevToolsQueryEntry,
  DevToolsLogEntry,
} from '../types';
import { NUMBERS, EVENTS } from '../constants';
import { hashQueryKey, now, generateId, matchQueryKey } from '../utils';

/**
 * Query client options
 */
export interface QueryClientConfig {
  cache?: CacheConfig;
  defaultOptions?: Partial<QueryOptions>;
  devtools?: DevToolsOptions;
}

type QueryListener = () => void;

/**
 * QueryClient - central manager for all queries
 */
export class QueryClient {
  private queries: Map<string, Query>;
  private cache: QueryCache;
  private defaultOptions: Partial<QueryOptions>;
  private listeners: Set<QueryListener>;
  private devtoolsEnabled: boolean;
  private logs: DevToolsLogEntry[];
  private maxLogs: number;
  private cacheHits: number;
  private cacheMisses: number;

  constructor(config: QueryClientConfig = {}) {
    this.queries = new Map();
    this.cache = new QueryCache(config.cache);
    this.defaultOptions = config.defaultOptions ?? {};
    this.listeners = new Set();
    this.devtoolsEnabled = config.devtools?.enabled ?? false;
    this.logs = [];
    this.maxLogs = config.devtools?.maxLogs ?? NUMBERS.HUNDRED;
    this.cacheHits = NUMBERS.ZERO;
    this.cacheMisses = NUMBERS.ZERO;

    // Setup window focus/online listeners
    this.setupEventListeners();

    // Expose to window for DevTools extension
    if (typeof window !== 'undefined') {
      (window as unknown as { __FORGE_QUERY_CLIENT__: QueryClient }).__FORGE_QUERY_CLIENT__ = this;
    }

    // Notify devtools of connection
    if (this.devtoolsEnabled) {
      this.log('fetch', [], 'QueryClient initialized');
    }
  }

  /**
   * Get or create a query
   */
  getQuery<TData = unknown, TError = Error, TKey extends QueryKey = QueryKey>(
    options: QueryOptions<TData, TError, TKey>
  ): Query<TData, TError, TKey> {
    const hash = hashQueryKey(options.queryKey);
    let query = this.queries.get(hash) as Query<TData, TError, TKey> | undefined;

    if (!query) {
      const mergedOptions = {
        ...this.defaultOptions,
        ...options,
      } as QueryOptions<TData, TError, TKey>;

      query = new Query(mergedOptions);
      this.queries.set(hash, query as unknown as Query);
      this.cacheMisses++;

      this.log('cache', options.queryKey, 'Cache miss - Query created');

      // Subscribe to query changes to notify DevTools
      query.subscribe(() => {
        this.notify();
        this.broadcastToDevTools({
          id: query!.id,
          timestamp: now(),
          type: 'fetch',
          queryKey: options.queryKey,
          message: `Query ${query!.getState().status}`,
        });
      });
    } else {
      // Cache hit if query has data
      if (query.getState().data !== undefined) {
        this.cacheHits++;
        this.log('cache', options.queryKey, 'Cache hit');
      }
    }

    return query;
  }

  /**
   * Fetch a query
   */
  async fetchQuery<TData = unknown, TError = Error, TKey extends QueryKey = QueryKey>(
    options: QueryOptions<TData, TError, TKey>
  ): Promise<TData> {
    const query = this.getQuery(options);
    const startTime = now();

    this.log('fetch', options.queryKey, 'Fetching started');

    try {
      const result = await query.fetch();

      if (result.isError) {
        this.log('error', options.queryKey, 'Fetch failed', undefined, result.error as Error | null);
        throw result.error;
      }

      const duration = now() - startTime;
      this.log('success', options.queryKey, `Fetched in ${duration}ms`, result.data);

      return result.data as TData;
    } catch (error) {
      this.log('error', options.queryKey, 'Fetch error', undefined, error as Error);
      throw error;
    }
  }

  /**
   * Prefetch a query
   */
  async prefetchQuery<TData = unknown, TError = Error, TKey extends QueryKey = QueryKey>(
    options: QueryOptions<TData, TError, TKey>
  ): Promise<void> {
    try {
      await this.fetchQuery(options);
    } catch {
      // Silently ignore prefetch errors
    }
  }

  /**
   * Get query data from cache
   */
  getQueryData<TData = unknown>(queryKey: QueryKey): TData | undefined {
    const hash = hashQueryKey(queryKey);
    const query = this.queries.get(hash);

    if (query) {
      const entry = this.cache.get(queryKey);
      return entry?.state.data as TData | undefined;
    }

    return undefined;
  }

  /**
   * Set query data in cache
   */
  setQueryData<TData = unknown>(
    queryKey: QueryKey,
    data: TData | ((oldData: TData | undefined) => TData)
  ): void {
    const hash = hashQueryKey(queryKey);
    let query = this.queries.get(hash);

    if (!query) {
      query = new Query({ queryKey, queryFn: undefined });
      this.queries.set(hash, query);
    }

    query.setData(data);
    this.log('cache', queryKey, 'Data updated manually');
    this.notify();
  }

  /**
   * Invalidate queries
   */
  invalidateQueries(filters?: {
    queryKey?: QueryKey;
    predicate?: (query: Query) => boolean;
    exact?: boolean;
  }): void {
    const { queryKey, predicate, exact = false } = filters ?? {};

    this.queries.forEach((query) => {
      let shouldInvalidate = true;

      if (queryKey) {
        if (exact) {
          shouldInvalidate = matchQueryKey(query.queryKey, queryKey);
        } else {
          shouldInvalidate = hashQueryKey(query.queryKey).startsWith(hashQueryKey(queryKey));
        }
      }

      if (predicate) {
        shouldInvalidate = shouldInvalidate && predicate(query);
      }

      if (shouldInvalidate) {
        query.invalidate();
        this.log('invalidate', query.queryKey, 'Query invalidated');
      }
    });

    this.notify();
  }

  /**
   * Refetch queries
   */
  async refetchQueries(filters?: {
    queryKey?: QueryKey;
    predicate?: (query: Query) => boolean;
    exact?: boolean;
  }): Promise<void> {
    const { queryKey, predicate, exact = false } = filters ?? {};

    const promises: Promise<QueryResult>[] = [];

    this.queries.forEach((query) => {
      let shouldRefetch = query.isActive();

      if (queryKey) {
        if (exact) {
          shouldRefetch = shouldRefetch && matchQueryKey(query.queryKey, queryKey);
        } else {
          shouldRefetch = shouldRefetch && hashQueryKey(query.queryKey).startsWith(hashQueryKey(queryKey));
        }
      }

      if (predicate) {
        shouldRefetch = shouldRefetch && predicate(query);
      }

      if (shouldRefetch) {
        promises.push(query.fetch());
      }
    });

    await Promise.all(promises);
  }

  /**
   * Remove queries
   */
  removeQueries(filters?: {
    queryKey?: QueryKey;
    predicate?: (query: Query) => boolean;
    exact?: boolean;
  }): void {
    const { queryKey, predicate, exact = false } = filters ?? {};

    const toRemove: string[] = [];

    this.queries.forEach((query, hash) => {
      let shouldRemove = true;

      if (queryKey) {
        if (exact) {
          shouldRemove = matchQueryKey(query.queryKey, queryKey);
        } else {
          shouldRemove = hashQueryKey(query.queryKey).startsWith(hashQueryKey(queryKey));
        }
      }

      if (predicate) {
        shouldRemove = shouldRemove && predicate(query);
      }

      if (shouldRemove) {
        toRemove.push(hash);
      }
    });

    toRemove.forEach((hash) => {
      const query = this.queries.get(hash);
      if (query) {
        query.destroy();
        this.queries.delete(hash);
        this.cache.delete(query.queryKey);
      }
    });

    this.notify();
  }

  /**
   * Cancel queries
   */
  cancelQueries(filters?: { queryKey?: QueryKey }): void {
    this.queries.forEach((query) => {
      if (!filters?.queryKey || matchQueryKey(query.queryKey, filters.queryKey)) {
        query.reset();
      }
    });
  }

  /**
   * Clear all queries and cache
   */
  clear(): void {
    this.queries.forEach((query) => {
      query.destroy();
    });
    this.queries.clear();
    this.cache.clear();
    this.logs = [];
    this.notify();
  }

  /**
   * Get the cache
   */
  getCache(): QueryCache {
    return this.cache;
  }

  /**
   * Subscribe to client updates
   */
  subscribe(listener: QueryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get DevTools state
   */
  getDevToolsState(): DevToolsState {
    const queries: DevToolsQueryEntry[] = Array.from(this.queries.values()).map((query) => ({
      id: query.id,
      queryKey: query.queryKey,
      queryKeyHash: query.queryKeyHash,
      state: query.getState(),
      status: query.getState().status,
      fetchCount: NUMBERS.ZERO,
      lastFetchTime: query.getState().dataUpdatedAt || null,
      lastSuccessTime: query.getState().status === 'success' ? query.getState().dataUpdatedAt : null,
      lastErrorTime: query.getState().status === 'error' ? query.getState().errorUpdatedAt : null,
      observers: query.getObserverCount(),
      isStale: query.isStale(),
      isActive: query.isActive(),
    }));

    // Calculate cache stats from queries (since queries manage their own state)
    const successQueries = queries.filter(q => q.status === 'success');
    const cacheStats = {
      entries: successQueries.length,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: (this.cacheHits + this.cacheMisses) > NUMBERS.ZERO 
        ? this.cacheHits / (this.cacheHits + this.cacheMisses) 
        : NUMBERS.ZERO,
      size: NUMBERS.ZERO,
      oldestEntry: null,
      newestEntry: null,
    };

    return {
      queries,
      logs: [...this.logs],
      cacheStats,
      isConnected: this.devtoolsEnabled,
      isPaused: false,
      filter: '',
      selectedQueryId: null,
    };
  }

  // Private methods

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // Ignore listener errors
      }
    });
  }

  private log(
    type: DevToolsLogEntry['type'],
    queryKey: QueryKey,
    message: string,
    data?: unknown,
    error?: Error | null
  ): void {
    if (!this.devtoolsEnabled) return;

    const entry: DevToolsLogEntry = {
      id: generateId(),
      timestamp: now(),
      type,
      queryKey,
      message,
      data,
      error,
    };

    this.logs.push(entry);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Broadcast to devtools
    this.broadcastToDevTools(entry);
  }

  private broadcastToDevTools(_entry: DevToolsLogEntry): void {
    if (typeof window !== 'undefined') {
      // Send full state to DevTools extension
      window.postMessage(
        {
          type: EVENTS.DEVTOOLS_UPDATE,
          payload: this.getDevToolsState(),
          source: 'forge-query',
        },
        '*'
      );
    }
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Refetch on window focus
    window.addEventListener('focus', () => {
      this.queries.forEach((query) => {
        const refetchOnFocus = this.defaultOptions.refetchOnWindowFocus ?? true;
        if (refetchOnFocus && query.isActive() && query.isStale()) {
          query.fetch();
        }
      });
    });

    // Refetch on network reconnect
    window.addEventListener('online', () => {
      this.queries.forEach((query) => {
        const refetchOnReconnect = this.defaultOptions.refetchOnReconnect ?? true;
        if (refetchOnReconnect && query.isActive()) {
          query.fetch();
        }
      });
    });
  }
}

// Default client instance
let defaultClient: QueryClient | null = null;

/**
 * Get or create the default QueryClient
 */
export const getDefaultQueryClient = (): QueryClient => {
  if (!defaultClient) {
    defaultClient = new QueryClient();
  }
  return defaultClient;
};

/**
 * Set the default QueryClient
 */
export const setDefaultQueryClient = (client: QueryClient): void => {
  defaultClient = client;
};

