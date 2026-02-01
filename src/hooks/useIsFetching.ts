import { useState, useEffect } from 'react';
import { QueryClient } from '../core/QueryClient';
import { useQueryClient } from './useQueryClient';
import type { QueryKey } from '../types';
import { hashQueryKey, matchQueryKey } from '../utils';

/**
 * useIsFetching - Track number of fetching queries
 *
 * @example
 * ```tsx
 * // All queries
 * const isFetching = useIsFetching();
 *
 * // Specific query key
 * const isFetchingUsers = useIsFetching({ queryKey: ['users'] });
 * ```
 */
export function useIsFetching(filters?: {
  queryKey?: QueryKey;
  client?: QueryClient;
}): number {
  const contextClient = useQueryClient();
  const client = filters?.client ?? contextClient;
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      const state = client.getDevToolsState();
      const fetchingQueries = state.queries.filter((query) => {
        const isFetching = query.state.fetchStatus === 'fetching';

        if (filters?.queryKey) {
          return isFetching && matchQueryKey(query.queryKey, filters.queryKey);
        }

        return isFetching;
      });

      setCount(fetchingQueries.length);
    };

    const unsubscribe = client.subscribe(updateCount);
    updateCount();

    return unsubscribe;
  }, [client, filters?.queryKey ? hashQueryKey(filters.queryKey) : null]);

  return count;
}

/**
 * useIsMutating - Track number of active mutations
 */
export function useIsMutating(_filters?: {
  mutationKey?: QueryKey;
}): number {
  // For now, return 0 - would need mutation tracking
  void _filters; // Intentionally unused for now
  return 0;
}

export default useIsFetching;

