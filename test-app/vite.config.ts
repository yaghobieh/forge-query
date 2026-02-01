import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const forgeQueryRoot = path.resolve(__dirname, '..');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Forge Query subpaths (must be first)
      {
        find: '@forgedevstack/forge-query/devtools',
        replacement: path.resolve(forgeQueryRoot, 'src/devtools/index.ts'),
      },
      // Main forge-query package
      {
        find: '@forgedevstack/forge-query',
        replacement: path.resolve(forgeQueryRoot, 'src/index.ts'),
      },
      // Internal aliases used by forge-query source
      {
        find: '@constants',
        replacement: path.resolve(forgeQueryRoot, 'src/constants/index.ts'),
      },
      {
        find: '@types',
        replacement: path.resolve(forgeQueryRoot, 'src/types/index.ts'),
      },
      {
        find: '@utils',
        replacement: path.resolve(forgeQueryRoot, 'src/utils/index.ts'),
      },
      {
        find: '@core',
        replacement: path.resolve(forgeQueryRoot, 'src/core/index.ts'),
      },
      {
        find: '@cache',
        replacement: path.resolve(forgeQueryRoot, 'src/cache/index.ts'),
      },
      {
        find: '@hooks',
        replacement: path.resolve(forgeQueryRoot, 'src/hooks/index.ts'),
      },
      {
        find: '@devtools',
        replacement: path.resolve(forgeQueryRoot, 'src/devtools/index.ts'),
      },
    ],
  },
});
