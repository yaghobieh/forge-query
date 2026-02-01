/**
 * Get current timestamp in milliseconds
 */
export const now = (): number => Date.now();

/**
 * Check if data is stale
 */
export const isStale = (updatedAt: number, staleTime: number): boolean => {
  if (staleTime === Infinity) {
    return false;
  }
  return now() - updatedAt > staleTime;
};

/**
 * Format duration for display
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  if (ms < 3600000) {
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
};

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Throttle function execution
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    const currentTime = now();
    const timeSinceLastCall = currentTime - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = currentTime;
      fn(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = now();
        timeout = null;
        fn(...args);
      }, delay - timeSinceLastCall);
    }
  };
};

/**
 * Debounce function execution
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

