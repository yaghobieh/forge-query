import type {
  QueryKey,
  QueryState,
  CacheEntry,
  CacheConfig,
  CacheListener,
  CacheEvent,
  CacheStats,
} from '../types';
import { DEFAULTS, NUMBERS } from '../constants';
import { hashQueryKey, now } from '../utils';

/**
 * Query cache - stores and manages query data
 */
export class QueryCache {
  private cache: Map<string, CacheEntry>;
  private listeners: Set<CacheListener>;
  private config: Required<CacheConfig>;
  private stats: { hits: number; misses: number };

  constructor(config: CacheConfig = {}) {
    this.cache = new Map();
    this.listeners = new Set();
    this.stats = { hits: NUMBERS.ZERO, misses: NUMBERS.ZERO };

    this.config = {
      maxEntries: config.maxEntries ?? NUMBERS.THOUSAND,
      defaultCacheTime: config.defaultCacheTime ?? DEFAULTS.CACHE_TIME,
      defaultStaleTime: config.defaultStaleTime ?? DEFAULTS.STALE_TIME,
      defaultGcTime: config.defaultGcTime ?? DEFAULTS.GC_TIME,
      storage: config.storage ?? null as unknown as NonNullable<CacheConfig['storage']>,
      serialize: config.serialize ?? JSON.stringify,
      deserialize: config.deserialize ?? JSON.parse,
      persist: config.persist ?? false,
      persistKey: config.persistKey ?? 'forge-query-cache',
    };

    if (this.config.persist && this.config.storage) {
      this.loadFromStorage();
    }
  }

  /**
   * Get a cache entry
   */
  get<TData = unknown, TError = Error>(
    queryKey: QueryKey
  ): CacheEntry<TData, TError> | undefined {
    const hash = hashQueryKey(queryKey);
    const entry = this.cache.get(hash) as CacheEntry<TData, TError> | undefined;

    if (entry) {
      this.stats.hits++;
      entry.accessedAt = now();
      entry.accessCount++;
      this.notify({ type: 'get', key: queryKey, data: entry.state.data, timestamp: now() });
    } else {
      this.stats.misses++;
    }

    return entry;
  }

  /**
   * Set a cache entry
   */
  set<TData = unknown, TError = Error>(
    queryKey: QueryKey,
    state: QueryState<TData, TError>,
    options: { gcTime?: number } = {}
  ): void {
    const hash = hashQueryKey(queryKey);
    const currentTime = now();
    // gcTime can be used for scheduling garbage collection
    const _gcTime = options.gcTime ?? this.config.defaultGcTime;
    void _gcTime; // Intentionally unused for now

    // Clear existing GC timeout
    const existingEntry = this.cache.get(hash);
    if (existingEntry?.gcTimeout) {
      clearTimeout(existingEntry.gcTimeout);
    }

    // Evict if at max capacity
    if (this.cache.size >= this.config.maxEntries && !this.cache.has(hash)) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CacheEntry<TData, TError> = {
      queryKey,
      state,
      createdAt: existingEntry?.createdAt ?? currentTime,
      updatedAt: currentTime,
      accessedAt: currentTime,
      accessCount: existingEntry ? existingEntry.accessCount + NUMBERS.ONE : NUMBERS.ONE,
    };

    this.cache.set(hash, entry as CacheEntry);
    this.notify({ type: 'set', key: queryKey, data: state.data, timestamp: currentTime });

    if (this.config.persist && this.config.storage) {
      this.saveToStorage();
    }
  }

  /**
   * Delete a cache entry
   */
  delete(queryKey: QueryKey): boolean {
    const hash = hashQueryKey(queryKey);
    const entry = this.cache.get(hash);

    if (entry?.gcTimeout) {
      clearTimeout(entry.gcTimeout);
    }

    const deleted = this.cache.delete(hash);

    if (deleted) {
      this.notify({ type: 'delete', key: queryKey, timestamp: now() });

      if (this.config.persist && this.config.storage) {
        this.saveToStorage();
      }
    }

    return deleted;
  }

  /**
   * Check if cache has entry
   */
  has(queryKey: QueryKey): boolean {
    return this.cache.has(hashQueryKey(queryKey));
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    // Clear all GC timeouts
    this.cache.forEach((entry) => {
      if (entry.gcTimeout) {
        clearTimeout(entry.gcTimeout);
      }
    });

    this.cache.clear();
    this.stats = { hits: NUMBERS.ZERO, misses: NUMBERS.ZERO };
    this.notify({ type: 'clear', key: [], timestamp: now() });

    if (this.config.persist && this.config.storage) {
      this.config.storage.removeItem(this.config.persistKey);
    }
  }

  /**
   * Get all cache entries
   */
  getAll(): CacheEntry[] {
    return Array.from(this.cache.values());
  }

  /**
   * Find entries matching a predicate
   */
  find<TData = unknown, TError = Error>(
    predicate: (entry: CacheEntry<TData, TError>) => boolean
  ): CacheEntry<TData, TError>[] {
    return (Array.from(this.cache.values()) as CacheEntry<TData, TError>[]).filter(predicate);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = this.getAll();
    const totalHits = this.stats.hits;
    const totalMisses = this.stats.misses;
    const totalRequests = totalHits + totalMisses;

    let oldestEntry: number | null = null;
    let newestEntry: number | null = null;

    entries.forEach((entry) => {
      if (oldestEntry === null || entry.createdAt < oldestEntry) {
        oldestEntry = entry.createdAt;
      }
      if (newestEntry === null || entry.createdAt > newestEntry) {
        newestEntry = entry.createdAt;
      }
    });

    return {
      entries: entries.length,
      hits: totalHits,
      misses: totalMisses,
      hitRate: totalRequests > NUMBERS.ZERO ? totalHits / totalRequests : NUMBERS.ZERO,
      size: this.calculateSize(),
      oldestEntry,
      newestEntry,
    };
  }

  /**
   * Subscribe to cache events
   */
  subscribe(listener: CacheListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Schedule garbage collection for an entry
   */
  scheduleGC(queryKey: QueryKey, gcTime: number): void {
    const hash = hashQueryKey(queryKey);
    const entry = this.cache.get(hash);

    if (!entry) return;

    if (entry.gcTimeout) {
      clearTimeout(entry.gcTimeout);
    }

    entry.gcTimeout = setTimeout(() => {
      this.delete(queryKey);
      this.notify({ type: 'gc', key: queryKey, timestamp: now() });
    }, gcTime);
  }

  /**
   * Cancel garbage collection for an entry
   */
  cancelGC(queryKey: QueryKey): void {
    const hash = hashQueryKey(queryKey);
    const entry = this.cache.get(hash);

    if (entry?.gcTimeout) {
      clearTimeout(entry.gcTimeout);
      entry.gcTimeout = undefined;
    }
  }

  // Private methods

  private notify(event: CacheEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch {
        // Ignore listener errors
      }
    });
  }

  private evictLeastRecentlyUsed(): void {
    let oldestHash: string | null = null;
    let oldestAccessedAt: number = Infinity;

    this.cache.forEach((entry, hash) => {
      if (entry.accessedAt < oldestAccessedAt) {
        oldestHash = hash;
        oldestAccessedAt = entry.accessedAt;
      }
    });

    if (oldestHash !== null) {
      const entry = this.cache.get(oldestHash);
      if (entry) {
        this.delete(entry.queryKey);
      }
    }
  }

  private calculateSize(): number {
    let size = NUMBERS.ZERO;
    this.cache.forEach((entry) => {
      try {
        size += JSON.stringify(entry.state.data).length;
      } catch {
        // Ignore non-serializable data
      }
    });
    return size;
  }

  private async loadFromStorage(): Promise<void> {
    if (!this.config.storage) return;

    try {
      const stored = await this.config.storage.getItem(this.config.persistKey);
      if (stored) {
        const data = this.config.deserialize<Array<[string, CacheEntry]>>(stored);
        data.forEach(([hash, entry]) => {
          this.cache.set(hash, entry);
        });
      }
    } catch {
      // Ignore storage errors
    }
  }

  private async saveToStorage(): Promise<void> {
    if (!this.config.storage) return;

    try {
      const data = Array.from(this.cache.entries()).map(([hash, entry]) => {
        // Remove non-serializable properties
        const { gcTimeout, ...rest } = entry;
        return [hash, rest];
      });
      await this.config.storage.setItem(
        this.config.persistKey,
        this.config.serialize(data)
      );
    } catch {
      // Ignore storage errors
    }
  }
}

