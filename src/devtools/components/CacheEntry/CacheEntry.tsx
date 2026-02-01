import { Paper, Typography } from '@forgedevstack/bear';
import type { DevToolsQueryEntry } from '../../DevToolsPanel.types';
import type { QueryKey } from '../../../types';

export interface CacheEntryProps {
  query: DevToolsQueryEntry;
}

const formatQueryKey = (key: QueryKey): string => {
  if (typeof key === 'string') return key;
  return JSON.stringify(key);
};

export const CacheEntry = ({ query }: CacheEntryProps) => (
  <Paper className="Forge-Query__cache-entry">
    <Typography variant="body2" color="primary" className="Forge-Query__cache-key">
      {formatQueryKey(query.queryKey)}
    </Typography>
    <Paper className="Forge-Query__cache-code">
      <pre className="Forge-Query__pre">
        {String(JSON.stringify(query.state.data, null, 2)).slice(0, 200)}
      </pre>
    </Paper>
  </Paper>
);

export default CacheEntry;
