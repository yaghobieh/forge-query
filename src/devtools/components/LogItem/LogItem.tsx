import { Box, Typography } from '@forgedevstack/bear';
import { formatTimestamp } from '../../../utils';
import { LOG_TYPE_COLORS } from '../../DevToolsPanel.const';

export interface LogItemProps {
  id: string;
  timestamp: number;
  type: string;
  message: string;
}

export const LogItem = ({ timestamp, type, message }: LogItemProps) => {
  const typeColor = LOG_TYPE_COLORS[type] || LOG_TYPE_COLORS.gc;

  return (
    <Box className="Forge-Query__log-item">
      <Typography variant="body2" color="secondary" className="Forge-Query__log-time">
        {formatTimestamp(timestamp)}
      </Typography>
      <Typography 
        variant="body2"
        className="Forge-Query__log-type"
        style={{ color: typeColor }}
      >
        {type}
      </Typography>
      <Typography variant="body2" className="Forge-Query__log-message">
        {message}
      </Typography>
    </Box>
  );
};

export default LogItem;
