import type {
  QueryKey,
  QueryOptions,
  QueryState,
  QueryResult,
  QueryFunctionContext,
} from '../types';
import { QUERY_STATUS, DEFAULTS, NUMBERS } from '../constants';
import { hashQueryKey, now, isStale, shouldRetry, calculateRetryDelay, sleep, generateId } from '../utils';

type QueryListener<TData, TError> = (result: QueryResult<TData, TError>) => void;

/**
 * Query - manages a single query's lifecycle
 */
export class Query<TData = unknown, TError = Error, TKey extends QueryKey = QueryKey> {
  readonly id: string;
  readonly queryKey: TKey;
  readonly queryKeyHash: string;

  private state: QueryState<TData, TError>;
  private options: QueryOptions<TData, TError, TKey>;
  private listeners: Set<QueryListener<TData, TError>>;
  private abortController: AbortController | null;
  private fetchPromise: Promise<TData> | null;
  private gcTimeout: ReturnType<typeof setTimeout> | null;
  private refetchInterval: ReturnType<typeof setInterval> | null;

  constructor(options: QueryOptions<TData, TError, TKey>) {
    this.id = generateId();
    this.queryKey = options.queryKey;
    this.queryKeyHash = hashQueryKey(options.queryKey);
    this.options = options;
    this.listeners = new Set();
    this.abortController = null;
    this.fetchPromise = null;
    this.gcTimeout = null;
    this.refetchInterval = null;

    // Initialize state
    this.state = this.getInitialState();
  }

  /**
   * Get current query result
   */
  getResult(): QueryResult<TData, TError> {
    const { state } = this;

    return {
      data: state.data,
      error: state.error,
      isLoading: state.status === QUERY_STATUS.LOADING && state.fetchStatus === 'fetching',
      isError: state.status === QUERY_STATUS.ERROR,
      isSuccess: state.status === QUERY_STATUS.SUCCESS,
      isIdle: state.status === QUERY_STATUS.IDLE,
      isFetching: state.fetchStatus === 'fetching',
      isStale: this.isStale(),
      isPreviousData: false,
      status: state.status,
      fetchStatus: state.fetchStatus,
      dataUpdatedAt: state.dataUpdatedAt,
      errorUpdatedAt: state.errorUpdatedAt,
      failureCount: state.failureCount,
      refetch: () => this.fetch(),
      remove: () => this.destroy(),
    };
  }

  /**
   * Get current state
   */
  getState(): QueryState<TData, TError> {
    return { ...this.state };
  }

  /**
   * Subscribe to query updates
   */
  subscribe(listener: QueryListener<TData, TError>): () => void {
    this.listeners.add(listener);

    // Cancel GC when subscribed
    this.cancelGC();

    // Start refetch interval if configured
    this.startRefetchInterval();

    return () => {
      this.listeners.delete(listener);

      if (this.listeners.size === NUMBERS.ZERO) {
        // Schedule GC when no listeners
        this.scheduleGC();
        this.stopRefetchInterval();
      }
    };
  }

  /**
   * Fetch data
   */
  async fetch(): Promise<QueryResult<TData, TError>> {
    const { queryFn, retry = DEFAULTS.RETRY_COUNT, retryDelay = DEFAULTS.RETRY_DELAY } = this.options;

    if (!queryFn) {
      this.setState({
        status: QUERY_STATUS.ERROR,
        error: new Error('No query function provided') as TError,
        errorUpdatedAt: now(),
        fetchStatus: 'idle',
      });
      return this.getResult();
    }

    // If already fetching, return existing promise
    if (this.fetchPromise) {
      await this.fetchPromise;
      return this.getResult();
    }

    // Abort previous request
    this.abortController?.abort();
    this.abortController = new AbortController();

    // Update state to fetching
    this.setState({
      fetchStatus: 'fetching',
      ...(this.state.status === QUERY_STATUS.IDLE && { status: QUERY_STATUS.LOADING }),
    });

    const context: QueryFunctionContext<TKey> = {
      queryKey: this.queryKey,
      signal: this.abortController.signal,
      meta: this.options.meta,
    };

    let attempt = NUMBERS.ZERO;

    const executeFetch = async (): Promise<TData> => {
      try {
        const data = await queryFn(context);
        return data;
      } catch (error) {
        attempt++;
        const shouldRetryNow = shouldRetry(attempt, error as Error, retry as number | boolean | ((count: number, err: unknown) => boolean));

        if (shouldRetryNow) {
          const delay = typeof retryDelay === 'function'
            ? retryDelay(attempt, error as TError)
            : calculateRetryDelay(attempt, retryDelay);

          await sleep(delay);
          return executeFetch();
        }

        throw error;
      }
    };

    this.fetchPromise = executeFetch();

    try {
      const data = await this.fetchPromise;

      this.setState({
        data,
        dataUpdatedAt: now(),
        error: null,
        errorUpdatedAt: NUMBERS.ZERO,
        failureCount: NUMBERS.ZERO,
        failureReason: null,
        status: QUERY_STATUS.SUCCESS,
        fetchStatus: 'idle',
        isInvalidated: false,
      });

      this.options.onSuccess?.(data);
      this.options.onSettled?.(data, null);
    } catch (error) {
      this.setState({
        error: error as TError,
        errorUpdatedAt: now(),
        failureCount: this.state.failureCount + NUMBERS.ONE,
        failureReason: error as TError,
        status: QUERY_STATUS.ERROR,
        fetchStatus: 'idle',
      });

      this.options.onError?.(error as TError);
      this.options.onSettled?.(undefined, error as TError);
    } finally {
      this.fetchPromise = null;
    }

    return this.getResult();
  }

  /**
   * Invalidate query (mark as stale)
   */
  invalidate(): void {
    this.setState({ isInvalidated: true });
  }

  /**
   * Reset query to initial state
   */
  reset(): void {
    this.abortController?.abort();
    this.fetchPromise = null;
    this.state = this.getInitialState();
    this.notify();
  }

  /**
   * Update query options
   */
  setOptions(options: Partial<QueryOptions<TData, TError, TKey>>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Set data directly
   */
  setData(
    data: TData | ((oldData: TData | undefined) => TData)
  ): void {
    const newData = typeof data === 'function'
      ? (data as (oldData: TData | undefined) => TData)(this.state.data)
      : data;

    this.setState({
      data: newData,
      dataUpdatedAt: now(),
      status: QUERY_STATUS.SUCCESS,
    });
  }

  /**
   * Check if query is stale
   */
  isStale(): boolean {
    if (this.state.isInvalidated) {
      return true;
    }

    if (this.state.status !== QUERY_STATUS.SUCCESS) {
      return true;
    }

    const staleTime = this.options.staleTime ?? DEFAULTS.STALE_TIME;
    return isStale(this.state.dataUpdatedAt, staleTime);
  }

  /**
   * Check if query is active (has listeners)
   */
  isActive(): boolean {
    return this.listeners.size > NUMBERS.ZERO;
  }

  /**
   * Get observer count
   */
  getObserverCount(): number {
    return this.listeners.size;
  }

  /**
   * Destroy query
   */
  destroy(): void {
    this.abortController?.abort();
    this.cancelGC();
    this.stopRefetchInterval();
    this.listeners.clear();
    this.fetchPromise = null;
  }

  // Private methods

  private getInitialState(): QueryState<TData, TError> {
    const hasInitialData = 'initialData' in this.options;
    const initialData = hasInitialData
      ? typeof this.options.initialData === 'function'
        ? (this.options.initialData as () => TData)()
        : this.options.initialData
      : undefined;

    const initialDataUpdatedAt = hasInitialData
      ? typeof this.options.initialDataUpdatedAt === 'function'
        ? (this.options.initialDataUpdatedAt as () => number)()
        : this.options.initialDataUpdatedAt ?? now()
      : NUMBERS.ZERO;

    return {
      data: initialData as TData | undefined,
      dataUpdatedAt: initialDataUpdatedAt as number,
      error: null,
      errorUpdatedAt: NUMBERS.ZERO,
      failureCount: NUMBERS.ZERO,
      failureReason: null,
      fetchStatus: 'idle',
      isInvalidated: false,
      status: hasInitialData ? QUERY_STATUS.SUCCESS : QUERY_STATUS.IDLE,
    };
  }

  private setState(partial: Partial<QueryState<TData, TError>>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  private notify(): void {
    const result = this.getResult();
    this.listeners.forEach((listener) => {
      try {
        listener(result);
      } catch {
        // Ignore listener errors
      }
    });
  }

  private scheduleGC(): void {
    const gcTime = this.options.gcTime ?? DEFAULTS.GC_TIME;

    if (gcTime === Infinity) return;

    this.gcTimeout = setTimeout(() => {
      this.destroy();
    }, gcTime);
  }

  private cancelGC(): void {
    if (this.gcTimeout) {
      clearTimeout(this.gcTimeout);
      this.gcTimeout = null;
    }
  }

  private startRefetchInterval(): void {
    const interval = this.options.refetchInterval;

    // Only start interval if it's a positive number
    if (typeof interval !== 'number' || interval <= NUMBERS.ZERO) {
      return;
    }

    this.refetchInterval = setInterval(() => {
      if (this.isActive()) {
        this.fetch();
      }
    }, interval);
  }

  private stopRefetchInterval(): void {
    if (this.refetchInterval) {
      clearInterval(this.refetchInterval);
      this.refetchInterval = null;
    }
  }
}

