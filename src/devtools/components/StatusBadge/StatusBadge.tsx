import { Badge } from '@forgedevstack/bear';
import type { BadgeProps } from '@forgedevstack/bear';

export interface StatusBadgeProps {
  status: string;
}

const STATUS_BADGE_MAP: Record<string, BadgeProps['color']> = {
  success: 'success',
  error: 'danger',
  loading: 'warning',
  fetching: 'info',
  idle: 'default',
  stale: 'warning',
};

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <Badge color={STATUS_BADGE_MAP[status] || 'default'} size="sm">
    {status}
  </Badge>
);

export default StatusBadge;
