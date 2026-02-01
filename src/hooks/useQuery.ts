import { useState, useEffect, useRef, useMemo } from 'react';
import { QueryClient } from '../core/QueryClient';
import { useQueryClient } from './useQueryClient';
import type { QueryKey, QueryOptions, QueryResult } from '../types';
import { QUERY_STATUS } from '../constants';

/**
 * useQuery hook options
 */
export interface UseQueryOptions<
  TData = unknown,
  TError = Error,
  TKey extends QueryKey = QueryKey
> extends QueryOptions<TData, TError, TKey> {
  /** Custom QueryClient */
  client?: QueryClient;
}

/**
 * useQuery - React hook for data fetching
 *
 * Works with both modern and legacy React patterns.
 *
 * @example
 * ```tsx
 * // Functional component
 * const { data, isLoading, error } = useQuery({
 *   queryKey: ['users'],
 *   queryFn: () => fetch('/api/users').then(res => res.json())
 * });
 *
 * // With options
 * const { data } = useQuery({
 *   queryKey: ['user', userId],
 *   queryFn: ({ queryKey }) => fetchUser(queryKey[1]),
 *   staleTime: 5 * 60 * 1000, // 5 minutes
 *   cacheTime: 10 * 60 * 1000, // 10 minutes
 *   retry: 3,
 * });
 * ```
 */
export function useQuery<
  TData = unknown,
  TError = Error,
  TKey extends QueryKey = QueryKey
>(options: UseQueryOptions<TData, TError, TKey>): QueryResult<TData, TError> {
  const contextClient = useQueryClient();
  const client = options.client ?? contextClient;
  const query = useMemo(() => client.getQuery(options), [client, JSON.stringify(options.queryKey)]);

  const [result, setResult] = useState<QueryResult<TData, TError>>(() => query.getResult());

  // Track if component is mounted
  const isMounted = useRef(true);

  // Subscribe to query updates
  useEffect(() => {
    isMounted.current = true;

    const unsubscribe = query.subscribe((newResult) => {
      if (isMounted.current) {
        setResult(newResult);
      }
    });

    // Initial fetch if enabled
    const enabled = options.enabled ?? true;
    if (enabled) {
      const shouldFetch =
        query.getState().status === QUERY_STATUS.IDLE ||
        (options.refetchOnMount && query.isStale());

      if (shouldFetch) {
        query.fetch();
      }
    }

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, [query, options.enabled, options.refetchOnMount]);

  // Update options when they change
  useEffect(() => {
    query.setOptions(options);
  }, [query, options.staleTime, options.cacheTime, options.retry, options.retryDelay]);

  return result;
}

/**
 * useQueries - Parallel queries hook
 */
export function useQueries<T extends UseQueryOptions[]>(
  queries: T
): QueryResult[] {
  const client = useQueryClient();

  const results = queries.map((options) => {
    const query = client.getQuery(options);
    const [result, setResult] = useState<QueryResult>(() => query.getResult());

    useEffect(() => {
      const unsubscribe = query.subscribe(setResult);

      if (options.enabled ?? true) {
        query.fetch();
      }

      return unsubscribe;
    }, [query, options.enabled]);

    return result;
  });

  return results;
}

/**
 * useSuspenseQuery - Query with Suspense support
 */
export function useSuspenseQuery<
  TData = unknown,
  TError = Error,
  TKey extends QueryKey = QueryKey
>(options: UseQueryOptions<TData, TError, TKey>): QueryResult<TData, TError> {
  const contextClient = useQueryClient();
  const client = options.client ?? contextClient;
  const query = client.getQuery({ ...options, suspense: true });

  // Throw promise for Suspense
  if (query.getState().status === QUERY_STATUS.IDLE || query.getState().status === QUERY_STATUS.LOADING) {
    throw query.fetch();
  }

  // Throw error for ErrorBoundary
  if (query.getState().status === QUERY_STATUS.ERROR) {
    throw query.getState().error;
  }

  return query.getResult();
}

export default useQuery;

