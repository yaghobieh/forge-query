# Changelog

All notable changes to `@forgedevstack/forge-query` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-01

### 🎉 Initial Release

First stable release of Forge Query - a powerful data fetching and caching library for React.

### ✨ Features

#### Core Library
- **`useQuery`** - React hook for data fetching with automatic caching
- **`useMutation`** - Hook for data mutations with optimistic updates
- **`useQueries`** - Parallel queries execution
- **`useSuspenseQuery`** - Query with React Suspense support
- **`useIsFetching`** - Track number of fetching queries
- **`QueryClient`** - Central manager for all queries and cache
- **`QueryCache`** - Intelligent caching with LRU eviction

#### Query Features
- Automatic background refetching
- Stale-while-revalidate pattern
- Configurable cache and stale times
- Retry logic with exponential backoff
- Query invalidation and refetching
- Manual query data updates
- Query cancellation

#### DevTools
- **In-app DevTools panel** with:
  - Real-time query monitoring
  - Query details view (status, data, errors)
  - Cache statistics (hits, misses, hit rate)
  - Activity logs with timestamps
  - Search/filter queries
  - Actions: Refetch, Invalidate, Remove
  
- **Chrome DevTools Extension** with:
  - Dedicated "Forge Query" panel in DevTools
  - Same features as in-app panel
  - Timeline view for query activity
  - Connection status indicator
  - Tailwind CSS styling

#### UI Components (using @forgedevstack/bear)
- `ForgeQueryDevTools` - Floating DevTools button + panel
- `DevToolsPanel` - Full-featured panel component
- `SnakeLogo` - Brand icon (snake forming 'Q')

### 🔧 Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    staleTime: 5000,
    cacheTime: 300000,
    retry: 3,
    retryDelay: 1000,
  },
  devtools: {
    enabled: true,
    maxLogs: 100,
  },
});
```

### 📦 Installation

```bash
npm install @forgedevstack/forge-query
```

### 🔗 Dependencies
- `@forgedevstack/bear` - UI components
- `@forgedevstack/grid-table` - Table component
- `tailwindcss` - Styling

---

## [Unreleased]

### Planned Features
- Infinite queries support
- Prefetching utilities
- Mutation caching
- Offline support
- React Native compatibility
- Safari DevTools extension

