/**
 * Numeric constants
 */
export const NUMBERS = {
  ZERO: 0,
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FIVE: 5,
  TEN: 10,
  HUNDRED: 100,
  THOUSAND: 1000,
} as const;

/**
 * Time constants in milliseconds
 */
export const TIME_MS = {
  SECOND: 1000,
  MINUTE: 60000,
  FIVE_MINUTES: 300000,
  TEN_MINUTES: 600000,
  HALF_HOUR: 1800000,
  HOUR: 3600000,
  DAY: 86400000,
} as const;

/**
 * Default configuration values
 */
export const DEFAULTS = {
  CACHE_TIME: TIME_MS.FIVE_MINUTES,
  STALE_TIME: NUMBERS.ZERO,
  RETRY_COUNT: NUMBERS.THREE,
  RETRY_DELAY: TIME_MS.SECOND,
  REFETCH_INTERVAL: NUMBERS.ZERO,
  GC_TIME: TIME_MS.FIVE_MINUTES,
} as const;

/**
 * HTTP Status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

