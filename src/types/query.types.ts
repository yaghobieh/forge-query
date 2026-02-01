import { QUERY_STATUS, HTTP_METHODS } from '../constants';

/**
 * Query key types
 */
export type QueryKey = string | readonly unknown[];

/**
 * Query status type
 */
export type QueryStatus = typeof QUERY_STATUS[keyof typeof QUERY_STATUS];

/**
 * HTTP method type
 */
export type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];

/**
 * Query function signature
 */
export type QueryFunction<TData = unknown, TKey extends QueryKey = QueryKey> = (
  context: QueryFunctionContext<TKey>
) => TData | Promise<TData>;

/**
 * Query function context
 */
export interface QueryFunctionContext<TKey extends QueryKey = QueryKey> {
  queryKey: TKey;
  signal: AbortSignal;
  meta?: QueryMeta;
}

/**
 * Query metadata
 */
export interface QueryMeta {
  [key: string]: unknown;
}

/**
 * Query options
 */
export interface QueryOptions<
  TData = unknown,
  TError = Error,
  TKey extends QueryKey = QueryKey
> {
  /** Unique key for the query */
  queryKey: TKey;
  /** Function to fetch data */
  queryFn?: QueryFunction<TData, TKey>;
  /** Time in ms that data is considered fresh */
  staleTime?: number;
  /** Time in ms to cache data after component unmounts */
  cacheTime?: number;
  /** Time in ms before garbage collection */
  gcTime?: number;
  /** Number of retry attempts */
  retry?: number | boolean | ((failureCount: number, error: TError) => boolean);
  /** Delay between retries in ms */
  retryDelay?: number | ((attempt: number, error: TError) => number);
  /** Refetch interval in ms (0 = disabled) */
  refetchInterval?: number | false;
  /** Refetch when window gains focus */
  refetchOnWindowFocus?: boolean | 'always';
  /** Refetch when network reconnects */
  refetchOnReconnect?: boolean | 'always';
  /** Refetch on component mount */
  refetchOnMount?: boolean | 'always';
  /** Enable/disable query */
  enabled?: boolean;
  /** Select/transform data */
  select?: (data: TData) => TData;
  /** Keep previous data while fetching new */
  keepPreviousData?: boolean;
  /** Placeholder data while loading */
  placeholderData?: TData | (() => TData);
  /** Initial data */
  initialData?: TData | (() => TData);
  /** Initial data updated at timestamp */
  initialDataUpdatedAt?: number | (() => number);
  /** Callback on success */
  onSuccess?: (data: TData) => void;
  /** Callback on error */
  onError?: (error: TError) => void;
  /** Callback on settle (success or error) */
  onSettled?: (data: TData | undefined, error: TError | null) => void;
  /** Query metadata */
  meta?: QueryMeta;
  /** Suspense mode */
  suspense?: boolean;
  /** Network mode */
  networkMode?: 'online' | 'always' | 'offlineFirst';
}

/**
 * Query state
 */
export interface QueryState<TData = unknown, TError = Error> {
  data: TData | undefined;
  dataUpdatedAt: number;
  error: TError | null;
  errorUpdatedAt: number;
  failureCount: number;
  failureReason: TError | null;
  fetchStatus: 'fetching' | 'paused' | 'idle';
  isInvalidated: boolean;
  status: QueryStatus;
}

/**
 * Query result
 */
export interface QueryResult<TData = unknown, TError = Error> {
  data: TData | undefined;
  error: TError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isIdle: boolean;
  isFetching: boolean;
  isStale: boolean;
  isPreviousData: boolean;
  status: QueryStatus;
  fetchStatus: 'fetching' | 'paused' | 'idle';
  dataUpdatedAt: number;
  errorUpdatedAt: number;
  failureCount: number;
  refetch: () => Promise<QueryResult<TData, TError>>;
  remove: () => void;
}

/**
 * Query observer options
 */
export interface QueryObserverOptions<
  TData = unknown,
  TError = Error,
  TKey extends QueryKey = QueryKey
> extends QueryOptions<TData, TError, TKey> {
  /** Subscribe to updates */
  onUpdate?: (result: QueryResult<TData, TError>) => void;
}

