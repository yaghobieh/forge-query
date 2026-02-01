import { useState, useEffect, useCallback, createElement, Fragment } from 'react';
import { DevToolsPanel } from './DevToolsPanel';
import { SnakeLogo } from './SnakeLogo';
import { useQueryClient } from '../hooks/useQueryClient';
import type { DevToolsState, DevToolsConfig } from './DevToolsPanel.types';
import type { QueryKey } from '../types';
import { 
  CLASSES, 
  POSITION_STYLES, 
  DEFAULT_CONFIG,
  REFRESH_INTERVAL,
  STORAGE_KEYS,
} from './DevToolsPanel.const';

// Check if we're in production
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname !== 'localhost' && 
   window.location.hostname !== '127.0.0.1');

/**
 * Floating button styles
 */
const BUTTON_STYLES = {
  position: 'fixed' as const,
  zIndex: 99998,
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#ec4899',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.2s, box-shadow 0.2s',
};

/**
 * ForgeQueryDevTools - Visual DevTools component
 *
 * @example
 * ```tsx
 * import { ForgeQueryDevTools } from '@forgedevstack/forge-query/devtools';
 *
 * function App() {
 *   return (
 *     <>
 *       <YourApp />
 *       <ForgeQueryDevTools 
 *         position="bottom-right"
 *         initialOpen={false}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export const ForgeQueryDevTools = (config: DevToolsConfig = {}): JSX.Element | null => {
  const {
    enabled = DEFAULT_CONFIG.enabled,
    position = DEFAULT_CONFIG.position,
    initialOpen = DEFAULT_CONFIG.initialOpen,
    showInProduction = DEFAULT_CONFIG.showInProduction,
  } = config;

  // Don't render in production unless explicitly enabled
  if (isProduction && !showInProduction) {
    return null;
  }

  if (!enabled) {
    return null;
  }

  const queryClient = useQueryClient();
  
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return initialOpen;
    const stored = localStorage.getItem(STORAGE_KEYS.panelOpen);
    return stored ? stored === 'true' : initialOpen;
  });

  const [state, setState] = useState<DevToolsState>(() => queryClient.getDevToolsState());
  const [filter, setFilter] = useState('');
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);

  // Subscribe to client updates and poll for changes
  useEffect(() => {
    // Subscribe to explicit updates
    const unsubscribe = queryClient.subscribe(() => {
      setState(queryClient.getDevToolsState());
    });

    // Also poll for live updates
    const interval = setInterval(() => {
      setState(queryClient.getDevToolsState());
    }, REFRESH_INTERVAL);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [queryClient]);

  // Persist open state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.panelOpen, String(isOpen));
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleClear = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  const handleRefresh = useCallback(() => {
    queryClient.refetchQueries();
  }, [queryClient]);

  const handleFilter = useCallback((newFilter: string) => {
    setFilter(newFilter);
  }, []);

  const handleSelectQuery = useCallback((id: string | null) => {
    setSelectedQueryId(id);
  }, []);

  const handleInvalidateQuery = useCallback(
    (queryKey: QueryKey) => {
      queryClient.invalidateQueries({ queryKey, exact: true });
    },
    [queryClient]
  );

  const handleRefetchQuery = useCallback(
    (queryKey: QueryKey) => {
      queryClient.refetchQueries({ queryKey, exact: true });
    },
    [queryClient]
  );

  const handleRemoveQuery = useCallback(
    (queryKey: QueryKey) => {
      queryClient.removeQueries({ queryKey, exact: true });
    },
    [queryClient]
  );

  const positionStyle = POSITION_STYLES[position] || POSITION_STYLES['bottom-right'];

  if (!isOpen) {
    return createElement(
      'button',
      {
        className: `${CLASSES.button} ${CLASSES.buttonIcon}`,
        style: { ...BUTTON_STYLES, ...positionStyle },
        onClick: () => setIsOpen(true),
        title: 'Open Forge Query DevTools',
        'aria-label': 'Open Forge Query DevTools',
      },
      createElement(SnakeLogo, { size: 24, color: 'white' })
    );
  }

  return createElement(
    Fragment,
    null,
    createElement(DevToolsPanel, {
      state: { ...state, filter, selectedQueryId },
      onClose: handleClose,
      onClear: handleClear,
      onRefresh: handleRefresh,
      onFilter: handleFilter,
      onSelectQuery: handleSelectQuery,
      onInvalidateQuery: handleInvalidateQuery,
      onRefetchQuery: handleRefetchQuery,
      onRemoveQuery: handleRemoveQuery,
    })
  );
};

export default ForgeQueryDevTools;
