import type { CSSProperties } from 'react';

interface SnakeLogoProps {
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Forge Query Logo - A stylized 'Q' formed by a snake
 * Professional design with the snake's body forming the letter Q
 */
export const SnakeLogo = ({
  size = 32,
  color = '#ec4899',
  className = '',
  style,
}: SnakeLogoProps) => (
  <svg
    viewBox="0 0 48 48"
    width={size}
    height={size}
    fill="none"
    className={className}
    style={style}
    aria-label="Forge Query"
  >
    <defs>
      <linearGradient id="forgeQueryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    
    <circle
      cx="24"
      cy="22"
      r="16"
      stroke="url(#forgeQueryGradient)"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    
    <path
      d="M32 30 L42 42"
      stroke="url(#forgeQueryGradient)"
      strokeWidth="4"
      strokeLinecap="round"
    />
    
    <circle cx="12" cy="16" r="3" fill={color} />
    <circle cx="11" cy="15" r="1" fill="#1f2937" />
    
    <path
      d="M8 16 Q6 14 8 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

/**
 * Smaller icon version for buttons and compact spaces
 */
export const SnakeIcon = ({
  size = 16,
  color = '#ec4899',
  className = '',
  style,
}: SnakeLogoProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    className={className}
    style={style}
  >
    <circle
      cx="11"
      cy="10"
      r="7"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M15 14 L20 20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="6" cy="8" r="1.5" fill={color} />
  </svg>
);

export default SnakeLogo;
