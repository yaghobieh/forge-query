import type { QueryKey } from '../types';
import { CACHE_KEYS } from '../constants';

/**
 * Hash a query key to a stable string
 */
export const hashQueryKey = (queryKey: QueryKey): string => {
  if (typeof queryKey === 'string') {
    return `${CACHE_KEYS.PREFIX}${CACHE_KEYS.SEPARATOR}${queryKey}`;
  }

  return `${CACHE_KEYS.PREFIX}${CACHE_KEYS.SEPARATOR}${JSON.stringify(queryKey, (_, val) =>
    isPlainObject(val)
      ? Object.keys(val)
          .sort()
          .reduce((result, key) => {
            result[key] = val[key];
            return result;
          }, {} as Record<string, unknown>)
      : val
  )}`;
};

/**
 * Check if a value is a plain object
 */
export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
};

/**
 * Compare two query keys for equality
 */
export const matchQueryKey = (a: QueryKey, b: QueryKey): boolean => {
  return hashQueryKey(a) === hashQueryKey(b);
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
};

