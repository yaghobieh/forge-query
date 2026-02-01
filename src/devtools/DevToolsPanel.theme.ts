import type { BearThemeOverride, BearColorScale } from '@forgedevstack/bear';

/**
 * Forge Query pink color palette
 */
const forgeQueryPink: BearColorScale = {
  50: '#fdf2f8',
  100: '#fce7f3',
  200: '#fbcfe8',
  300: '#f9a8d4',
  400: '#f472b6',
  500: '#ec4899',
  600: '#db2777',
  700: '#be185d',
  800: '#9d174d',
  900: '#831843',
  950: '#500724',
};

/**
 * Forge Query DevTools Theme Override
 * Uses pink as the primary color
 */
export const forgeQueryTheme: BearThemeOverride = {
  colors: {
    primary: forgeQueryPink,
    background: {
      primary: '#111827',
      secondary: '#1f2937',
      tertiary: '#374151',
    },
    text: {
      primary: '#f9fafb',
      secondary: '#9ca3af',
      muted: '#6b7280',
      inverted: '#111827',
    },
    border: {
      default: '#374151',
      subtle: '#1f2937',
      strong: '#4b5563',
    },
  },
};

export default forgeQueryTheme;

