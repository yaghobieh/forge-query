import { 
  Box, 
  Badge, 
  Button, 
  Tooltip, 
  Typography, 
  Flex,
  BearIcons,
} from '@forgedevstack/bear';

const { RefreshIcon, ZapIcon, XIcon } = BearIcons;
import type { DevToolsQueryEntry } from '../../DevToolsPanel.types';
import { StatusBadge } from '../StatusBadge';
import { STATUS_COLORS } from '../../DevToolsPanel.const';
import type { QueryKey } from '../../../types';

export interface QueryRowProps {
  query: DevToolsQueryEntry;
  isSelected: boolean;
  onSelect: () => void;
  onRefetch: () => void;
  onInvalidate: () => void;
  onRemove: () => void;
}

const formatQueryKey = (key: QueryKey): string => {
  if (typeof key === 'string') return key;
  return JSON.stringify(key);
};

export const QueryRow = ({ 
  query, 
  isSelected,
  onSelect, 
  onRefetch, 
  onInvalidate, 
  onRemove,
}: QueryRowProps) => {
  const statusColor = STATUS_COLORS[query.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.idle;
  const time = query.lastFetchTime 
    ? new Date(query.lastFetchTime).toLocaleTimeString('en-US', { hour12: false })
    : '-';

  return (
    <Box 
      className={`Forge-Query__query-item ${isSelected ? 'Forge-Query__query-item--selected' : ''}`}
      onClick={onSelect}
    >
      <Box 
        className="Forge-Query__status-dot"
        style={{ backgroundColor: statusColor }}
      />
      
      <Typography 
        variant="body2" 
        className="Forge-Query__query-key"
        title={formatQueryKey(query.queryKey)}
      >
        {formatQueryKey(query.queryKey)}
      </Typography>
      
      <StatusBadge status={query.status} />
      
      <Badge 
        color={query.isActive ? 'primary' : 'default'}
        size="sm"
      >
        {query.observers}
      </Badge>
      
      <Typography variant="body2" color="secondary" className="Forge-Query__query-time">
        {time}
      </Typography>
      
      <Flex gap={4} className="Forge-Query__query-actions">
        <Tooltip content="Refetch">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onRefetch(); }}
          >
            <RefreshIcon size={12} />
          </Button>
        </Tooltip>
        <Tooltip content="Invalidate">
          <Button
            variant="ghost"
            size="sm"
            color="warning"
            onClick={(e) => { e.stopPropagation(); onInvalidate(); }}
          >
            <ZapIcon size={12} />
          </Button>
        </Tooltip>
        <Tooltip content="Remove">
          <Button
            variant="ghost"
            size="sm"
            color="danger"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          >
            <XIcon size={12} />
          </Button>
        </Tooltip>
      </Flex>
    </Box>
  );
};

export default QueryRow;
