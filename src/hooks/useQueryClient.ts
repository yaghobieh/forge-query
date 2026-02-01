import { useContext, createContext } from 'react';
import { QueryClient, getDefaultQueryClient } from '../core/QueryClient';

/**
 * QueryClient context
 */
export const QueryClientContext = createContext<QueryClient | null>(null);

/**
 * useQueryClient - Get the QueryClient instance
 *
 * @example
 * ```tsx
 * const queryClient = useQueryClient();
 *
 * // Invalidate queries
 * queryClient.invalidateQueries({ queryKey: ['users'] });
 *
 * // Set data
 * queryClient.setQueryData(['user', id], newUserData);
 * ```
 */
export function useQueryClient(): QueryClient {
  const contextClient = useContext(QueryClientContext);
  return contextClient ?? getDefaultQueryClient();
}

export default useQueryClient;

