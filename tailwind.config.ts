import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './test-app/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Forge Query brand colors
        'forge': {
          pink: {
            DEFAULT: '#ec4899',
            50: 'rgba(236, 72, 153, 0.05)',
            100: 'rgba(236, 72, 153, 0.1)',
            200: 'rgba(236, 72, 153, 0.2)',
            300: 'rgba(236, 72, 153, 0.3)',
            hover: '#db2777',
          },
          purple: '#a855f7',
        },
        // Status colors
        'status': {
          success: '#22c55e',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
          idle: '#6b7280',
          stale: '#a855f7',
        },
        // Panel colors
        'panel': {
          bg: '#111827',
          secondary: '#1f2937',
          tertiary: '#374151',
          border: '#374151',
        },
      },
      fontFamily: {
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;

