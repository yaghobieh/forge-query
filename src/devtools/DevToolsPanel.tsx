import { useState, useMemo } from 'react';
import '@forgedevstack/bear/styles.css';
import './DevToolsPanel.css';
import { 
  BearProvider,
  Button,
  Badge,
  Input,
  Typography,
  Box,
  Card,
  Divider,
  StatCard,
  Flex,
  BearIcons,
} from '@forgedevstack/bear';

const { RefreshIcon, DeleteIcon, XIcon } = BearIcons;
import type { DevToolsPanelProps } from './DevToolsPanel.types';
import { forgeQueryTheme } from './DevToolsPanel.theme';
import { SnakeLogo } from './SnakeLogo';
import { QueryRow, QueryDetails, LogItem, CacheEntry } from './components';
import { VERSION } from './DevToolsPanel.const';

type TabId = 'queries' | 'logs' | 'cache';

const TABS: { id: TabId; label: string }[] = [
  { id: 'queries', label: 'Queries' },
  { id: 'logs', label: 'Logs' },
  { id: 'cache', label: 'Cache' },
];

export const DevToolsPanel = ({
  state,
  onClose,
  onClear,
  onRefresh,
  onFilter,
  onSelectQuery,
  onInvalidateQuery,
  onRefetchQuery,
  onRemoveQuery,
}: DevToolsPanelProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<TabId>('queries');

  const filteredQueries = useMemo(() => {
    if (!state.filter) return state.queries;
    const lowerFilter = state.filter.toLowerCase();
    return state.queries.filter((query) =>
      JSON.stringify(query.queryKey).toLowerCase().includes(lowerFilter)
    );
  }, [state.queries, state.filter]);

  const selectedQuery = useMemo(() => {
    return state.queries.find(q => q.id === state.selectedQueryId);
  }, [state.queries, state.selectedQueryId]);

  const cachedQueries = useMemo(() => {
    return state.queries.filter(q => q.state.data !== undefined);
  }, [state.queries]);

  const getTabCount = (tab: TabId): number => {
    switch (tab) {
      case 'queries': return state.queries.length;
      case 'logs': return state.logs.length;
      case 'cache': return state.cacheStats.entries;
    }
  };

  return (
    <BearProvider defaultMode="dark" theme={forgeQueryTheme}>
      <Card>
        <Box className="Forge-Query__header">
          <Flex align="center" gap={10}>
            <SnakeLogo size={24} />
            <Typography variant="h6">Forge Query</Typography>
            <Badge color="primary" size="sm">v{VERSION}</Badge>
          </Flex>
          
          <Flex align="center" gap={8}>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshIcon size={14} /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={onClear}>
              <DeleteIcon size={14} /> Clear
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XIcon size={16} />
            </Button>
          </Flex>
        </Box>
        
        <Box className="Forge-Query__tabs">
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label} ({getTabCount(tab.id)})
            </Button>
          ))}
        </Box>
        
        <Box className="Forge-Query__content">
          {activeTab === 'queries' && (
            <>
              <Box className="Forge-Query__queries-list">
                <Box className="Forge-Query__search-container">
                  <Input
                    placeholder="Search queries by key..."
                    value={state.filter}
                    onChange={(e) => onFilter(e.target.value)}
                    size="sm"
                  />
                </Box>
                
                <Box className="Forge-Query__table-header">
                  <span></span>
                  <span>Key</span>
                  <span>Status</span>
                  <span>Obs</span>
                  <span>Updated</span>
                  <span>Actions</span>
                </Box>
                
                <Box className="Forge-Query__table-body">
                  {filteredQueries.length === 0 ? (
                    <Box className="Forge-Query__empty">
                      <Typography variant="body2" color="secondary">
                        {state.queries.length === 0 ? 'No queries yet' : 'No matching queries'}
                      </Typography>
                    </Box>
                  ) : (
                    filteredQueries.map((query) => (
                      <QueryRow
                        key={query.id}
                        query={query}
                        isSelected={query.id === state.selectedQueryId}
                        onSelect={() => onSelectQuery(query.id)}
                        onRefetch={() => onRefetchQuery(query.queryKey)}
                        onInvalidate={() => onInvalidateQuery(query.queryKey)}
                        onRemove={() => onRemoveQuery(query.queryKey)}
                      />
                    ))
                  )}
                </Box>
              </Box>
              
              <Box className="Forge-Query__details-panel">
                <Box className="Forge-Query__details-header">Query Details</Box>
                <QueryDetails query={selectedQuery} />
              </Box>
            </>
          )}
          
          {activeTab === 'logs' && (
            <Box className="Forge-Query__logs-list">
              {state.logs.length === 0 ? (
                <Box className="Forge-Query__empty">
                  <Typography variant="body2" color="secondary">No logs yet</Typography>
                </Box>
              ) : (
                state.logs.slice().reverse().map((log) => (
                  <LogItem
                    key={log.id}
                    id={log.id}
                    timestamp={log.timestamp}
                    type={log.type}
                    message={log.message}
                  />
                ))
              )}
            </Box>
          )}
          
          {activeTab === 'cache' && (
            <Box className="Forge-Query__cache-container">
              <Flex gap={12} wrap="wrap" className="Forge-Query__cache-stats">
                <StatCard title="Entries" value={state.cacheStats.entries} />
                <StatCard title="Hit Rate" value={`${(state.cacheStats.hitRate * 100).toFixed(0)}%`} />
                <StatCard title="Hits" value={state.cacheStats.hits} />
                <StatCard title="Misses" value={state.cacheStats.misses} />
              </Flex>
              
              <Divider />
              
              <Typography variant="body2" color="secondary" className="Forge-Query__details-label">
                Cached Data
              </Typography>
              
              {cachedQueries.length === 0 ? (
                <Box className="Forge-Query__empty">
                  <Typography variant="body2" color="secondary">No cached data</Typography>
                </Box>
              ) : (
                cachedQueries.map((query) => (
                  <CacheEntry key={query.id} query={query} />
                ))
              )}
            </Box>
          )}
        </Box>
      </Card>
    </BearProvider>
  );
};

export default DevToolsPanel;
