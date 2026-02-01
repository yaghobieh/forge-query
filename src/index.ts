/**
 * Forge Query - Data fetching and caching library
 * 
 * @packageDocumentation
 */

// Core
export { Query } from './core/Query';
export { QueryClient, getDefaultQueryClient, setDefaultQueryClient } from './core/QueryClient';
export type { QueryClientConfig } from './core/QueryClient';

// Cache
export { QueryCache } from './cache/QueryCache';

// Hooks
export {
  useQuery,
  useQueries,
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  useIsFetching,
  useIsMutating,
  QueryClientContext,
} from './hooks';
export type { UseQueryOptions, MutationOptions, MutationResult, MutateOptions } from './hooks';

// Types
export type {
  QueryKey,
  QueryStatus,
  QueryFunction,
  QueryFunctionContext,
  QueryMeta,
  QueryOptions,
  QueryState,
  QueryResult,
  QueryObserverOptions,
  CacheEntry,
  CacheConfig,
  CacheStorage,
  CacheEvent,
  CacheStats,
  CacheListener,
  DevToolsOptions,
  DevToolsState,
  DevToolsQueryEntry,
  DevToolsLogEntry,
  DevToolsMessage,
  DevToolsPanelProps,
} from './types';

// Constants
export { QUERY_STATUS, HTTP_METHODS, HTTP_STATUS, TIME_MS, DEFAULTS } from './constants';

// Utils
export { hashQueryKey, matchQueryKey, isStale, now, formatDuration, formatTimestamp } from './utils';

