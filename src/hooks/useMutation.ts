import { useState, useCallback, useRef } from 'react';
import { QueryClient } from '../core/QueryClient';
import type { QueryKey } from '../types';
import { NUMBERS } from '../constants';
import { now } from '../utils';

/**
 * Mutation function type
 */
export type MutationFunction<TData = unknown, TVariables = void> = (
  variables: TVariables
) => Promise<TData>;

/**
 * Mutation options
 */
export interface MutationOptions<TData = unknown, TError = Error, TVariables = void, TContext = unknown> {
  /** Mutation function */
  mutationFn: MutationFunction<TData, TVariables>;
  /** Mutation key */
  mutationKey?: QueryKey;
  /** Callback before mutation */
  onMutate?: (variables: TVariables) => TContext | Promise<TContext>;
  /** Callback on success */
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void | Promise<void>;
  /** Callback on error */
  onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void | Promise<void>;
  /** Callback on settle */
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context: TContext | undefined) => void | Promise<void>;
  /** Retry count */
  retry?: number | boolean;
  /** Retry delay */
  retryDelay?: number;
  /** Custom QueryClient */
  client?: QueryClient;
}

/**
 * Mutation state
 */
export interface MutationState<TData = unknown, TError = Error, TVariables = void> {
  data: TData | undefined;
  error: TError | null;
  variables: TVariables | undefined;
  status: 'idle' | 'loading' | 'success' | 'error';
  submittedAt: number;
  failureCount: number;
}

/**
 * Mutation result
 */
export interface MutationResult<TData = unknown, TError = Error, TVariables = void> {
  data: TData | undefined;
  error: TError | null;
  variables: TVariables | undefined;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  status: 'idle' | 'loading' | 'success' | 'error';
  mutate: (variables: TVariables, options?: MutateOptions<TData, TError, TVariables>) => void;
  mutateAsync: (variables: TVariables, options?: MutateOptions<TData, TError, TVariables>) => Promise<TData>;
  reset: () => void;
}

/**
 * Options for individual mutate call
 */
export interface MutateOptions<TData = unknown, TError = Error, TVariables = void> {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: TError, variables: TVariables) => void | Promise<void>;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void | Promise<void>;
}

/**
 * useMutation - React hook for mutations
 *
 * @example
 * ```tsx
 * const { mutate, isLoading } = useMutation({
 *   mutationFn: (newUser) => fetch('/api/users', {
 *     method: 'POST',
 *     body: JSON.stringify(newUser),
 *   }).then(res => res.json()),
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({ queryKey: ['users'] });
 *   },
 * });
 *
 * // Call mutation
 * mutate({ name: 'John', email: 'john@example.com' });
 * ```
 */
export function useMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  options: MutationOptions<TData, TError, TVariables, TContext>
): MutationResult<TData, TError, TVariables> {
  const [state, setState] = useState<MutationState<TData, TError, TVariables>>({
    data: undefined,
    error: null,
    variables: undefined,
    status: 'idle',
    submittedAt: NUMBERS.ZERO,
    failureCount: NUMBERS.ZERO,
  });

  const contextRef = useRef<TContext | undefined>(undefined);
  const isMounted = useRef(true);

  const reset = useCallback(() => {
    setState({
      data: undefined,
      error: null,
      variables: undefined,
      status: 'idle',
      submittedAt: NUMBERS.ZERO,
      failureCount: NUMBERS.ZERO,
    });
    contextRef.current = undefined;
  }, []);

  const mutateAsync = useCallback(
    async (
      variables: TVariables,
      mutateOptions?: MutateOptions<TData, TError, TVariables>
    ): Promise<TData> => {
      setState((prev) => ({
        ...prev,
        status: 'loading',
        variables,
        submittedAt: now(),
        error: null,
      }));

      try {
        // Call onMutate
        contextRef.current = await options.onMutate?.(variables);

        // Execute mutation
        const data = await options.mutationFn(variables);

        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            data,
            status: 'success',
            error: null,
          }));
        }

        // Call success handlers
        await options.onSuccess?.(data, variables, contextRef.current as TContext);
        await mutateOptions?.onSuccess?.(data, variables);
        await options.onSettled?.(data, null, variables, contextRef.current);
        await mutateOptions?.onSettled?.(data, null, variables);

        return data;
      } catch (error) {
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            error: error as TError,
            status: 'error',
            failureCount: prev.failureCount + NUMBERS.ONE,
          }));
        }

        // Call error handlers
        await options.onError?.(error as TError, variables, contextRef.current);
        await mutateOptions?.onError?.(error as TError, variables);
        await options.onSettled?.(undefined, error as TError, variables, contextRef.current);
        await mutateOptions?.onSettled?.(undefined, error as TError, variables);

        throw error;
      }
    },
    [options]
  );

  const mutate = useCallback(
    (variables: TVariables, mutateOptions?: MutateOptions<TData, TError, TVariables>) => {
      mutateAsync(variables, mutateOptions).catch(() => {
        // Error handled in mutateAsync
      });
    },
    [mutateAsync]
  );

  return {
    data: state.data,
    error: state.error,
    variables: state.variables,
    isIdle: state.status === 'idle',
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    status: state.status,
    mutate,
    mutateAsync,
    reset,
  };
}

export default useMutation;

