import type { QueryKey } from '../types';

/**
 * Format query key for display
 */
export const formatQueryKey = (key: QueryKey): string => {
  if (typeof key === 'string') return key;
  return JSON.stringify(key);
};

/**
 * Format timestamp to time string
 */
export const formatTime = (timestamp: number | null): string => {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });
};

/**
 * Get status color class based on status
 */
export const getStatusDotClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    success: 'bg-status-success',
    error: 'bg-status-error',
    loading: 'bg-status-warning',
    fetching: 'bg-status-info',
    idle: 'bg-status-idle',
    stale: 'bg-status-stale',
  };
  return statusMap[status] || 'bg-status-idle';
};

/**
 * Get badge color class based on status
 */
export const getBadgeColorClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    success: 'bg-status-success/20 text-status-success',
    error: 'bg-status-error/20 text-status-error',
    loading: 'bg-status-warning/20 text-status-warning',
    fetching: 'bg-status-info/20 text-status-info',
    idle: 'bg-gray-500/20 text-gray-400',
    stale: 'bg-status-stale/20 text-status-stale',
  };
  return statusMap[status] || 'bg-gray-500/20 text-gray-400';
};

/**
 * Get log type color class
 */
export const getLogTypeColorClass = (type: string): string => {
  const typeMap: Record<string, string> = {
    fetch: 'text-status-info',
    success: 'text-status-success',
    error: 'text-status-error',
    cache: 'text-status-stale',
    invalidate: 'text-status-warning',
    gc: 'text-gray-400',
    info: 'text-status-info',
  };
  return typeMap[type] || 'text-gray-400';
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Safe JSON stringify with truncation
 */
export const safeStringify = (data: unknown, maxLength = 500): string => {
  try {
    const str = JSON.stringify(data, null, 2);
    return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
  } catch {
    return String(data);
  }
};

