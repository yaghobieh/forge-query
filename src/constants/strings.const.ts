/**
 * Query status strings
 */
export const QUERY_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  FETCHING: 'fetching',
  STALE: 'stale',
} as const;

/**
 * Cache keys
 */
export const CACHE_KEYS = {
  PREFIX: 'forge-query',
  SEPARATOR: ':',
  METADATA: '_meta',
} as const;

/**
 * Event names
 */
export const EVENTS = {
  QUERY_START: 'forge-query:start',
  QUERY_SUCCESS: 'forge-query:success',
  QUERY_ERROR: 'forge-query:error',
  CACHE_HIT: 'forge-query:cache-hit',
  CACHE_MISS: 'forge-query:cache-miss',
  CACHE_UPDATE: 'forge-query:cache-update',
  CACHE_INVALIDATE: 'forge-query:cache-invalidate',
  DEVTOOLS_CONNECT: 'forge-query:devtools-connect',
  DEVTOOLS_UPDATE: 'forge-query:devtools-update',
} as const;

/**
 * HTTP Methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  DEVTOOLS_ENABLED: 'forge-query-devtools-enabled',
  DEVTOOLS_POSITION: 'forge-query-devtools-position',
  DEVTOOLS_EXPANDED: 'forge-query-devtools-expanded',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network request failed',
  TIMEOUT_ERROR: 'Request timed out',
  PARSE_ERROR: 'Failed to parse response',
  INVALID_KEY: 'Invalid query key provided',
  NO_QUERY_FN: 'No query function provided',
  CACHE_FULL: 'Cache storage is full',
} as const;

