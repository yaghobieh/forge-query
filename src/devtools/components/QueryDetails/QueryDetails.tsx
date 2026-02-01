import { Box, Badge, Typography, Paper, Flex } from '@forgedevstack/bear';
import type { DevToolsQueryEntry } from '../../DevToolsPanel.types';
import { StatusBadge } from '../StatusBadge';
import type { QueryKey } from '../../../types';

export interface QueryDetailsProps {
  query: DevToolsQueryEntry | undefined;
}

const formatQueryKey = (key: QueryKey): string => {
  if (typeof key === 'string') return key;
  return JSON.stringify(key);
};

export const QueryDetails = ({ query }: QueryDetailsProps) => {
  if (!query) {
    return (
      <Box className="Forge-Query__empty">
        <Typography variant="body2" color="secondary">
          Select a query to view details
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="Forge-Query__details-content">
      <Typography variant="body2" color="primary" className="Forge-Query__details-key">
        {formatQueryKey(query.queryKey)}
      </Typography>
      
      <Flex gap={8} wrap="wrap" className="Forge-Query__details-stats">
        <Paper className="Forge-Query__details-stat">
          <Typography variant="body2" color="secondary" className="Forge-Query__details-label">
            Status
          </Typography>
          <StatusBadge status={query.status} />
        </Paper>
        
        <Paper className="Forge-Query__details-stat">
          <Typography variant="body2" color="secondary" className="Forge-Query__details-label">
            Observers
          </Typography>
          <Typography variant="h6">{query.observers}</Typography>
        </Paper>
        
        <Paper className="Forge-Query__details-stat">
          <Typography variant="body2" color="secondary" className="Forge-Query__details-label">
            Stale
          </Typography>
          <Badge color={query.isStale ? 'warning' : 'success'} size="sm">
            {query.isStale ? 'Yes' : 'No'}
          </Badge>
        </Paper>
        
        <Paper className="Forge-Query__details-stat">
          <Typography variant="body2" color="secondary" className="Forge-Query__details-label">
            Active
          </Typography>
          <Badge color={query.isActive ? 'success' : 'default'} size="sm">
            {query.isActive ? 'Yes' : 'No'}
          </Badge>
        </Paper>
      </Flex>

      {query.state.data !== undefined && (
        <Box className="Forge-Query__details-data">
          <Typography variant="body2" color="secondary" className="Forge-Query__details-label">
            Data
          </Typography>
          <Paper className="Forge-Query__details-code">
            <pre className="Forge-Query__pre">
              {String(JSON.stringify(query.state.data, null, 2)).slice(0, 500)}
            </pre>
          </Paper>
        </Box>
      )}
      
      {query.state.error !== undefined && query.state.error !== null && (
        <Box className="Forge-Query__details-error">
          <Typography variant="body2" color="error" className="Forge-Query__details-label">
            Error
          </Typography>
          <Paper className="Forge-Query__details-code Forge-Query__details-code--error">
            <pre className="Forge-Query__pre Forge-Query__pre--error">
              {JSON.stringify(query.state.error, null, 2)}
            </pre>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default QueryDetails;
