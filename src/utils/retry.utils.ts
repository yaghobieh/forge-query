import { DEFAULTS, NUMBERS } from '../constants';

/**
 * Calculate retry delay with exponential backoff
 */
export const calculateRetryDelay = (
  attempt: number,
  baseDelay: number = DEFAULTS.RETRY_DELAY
): number => {
  // Exponential backoff: delay * 2^attempt with jitter
  const exponentialDelay = baseDelay * Math.pow(NUMBERS.TWO, attempt);
  const jitter = Math.random() * DEFAULTS.RETRY_DELAY;
  return Math.min(exponentialDelay + jitter, DEFAULTS.RETRY_DELAY * NUMBERS.TEN);
};

/**
 * Check if should retry
 */
export const shouldRetry = (
  failureCount: number,
  error: unknown,
  retry: number | boolean | ((count: number, err: unknown) => boolean)
): boolean => {
  if (typeof retry === 'boolean') {
    return retry && failureCount < DEFAULTS.RETRY_COUNT;
  }
  if (typeof retry === 'number') {
    return failureCount < retry;
  }
  if (typeof retry === 'function') {
    return retry(failureCount, error);
  }
  return failureCount < DEFAULTS.RETRY_COUNT;
};

/**
 * Sleep for a duration
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Create an abortable promise
 */
export const createAbortablePromise = <T>(
  promise: Promise<T>,
  signal: AbortSignal
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const abortHandler = () => {
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (signal.aborted) {
      abortHandler();
      return;
    }

    signal.addEventListener('abort', abortHandler, { once: true });

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => {
        signal.removeEventListener('abort', abortHandler);
      });
  });
};

