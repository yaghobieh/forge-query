# Forge Query

<p align="center">
  <img src="./docs/assets/logo.svg" alt="Forge Query Logo" width="120" />
</p>

<p align="center">
  <strong>Powerful data fetching and caching library for React</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@forgedevstack/forge-query">
    <img src="https://img.shields.io/npm/v/@forgedevstack/forge-query.svg" alt="npm version" />
  </a>
  <a href="https://github.com/forgedevstack/forge-query/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/@forgedevstack/forge-query.svg" alt="license" />
  </a>
  <a href="https://www.npmjs.com/package/@forgedevstack/forge-query">
    <img src="https://img.shields.io/npm/dm/@forgedevstack/forge-query.svg" alt="downloads" />
  </a>
</p>

---

## Why Forge Query?

| Feature | Forge Query | Others |
|---------|-------------|--------|
| **Bundle Size** | ~12KB | 30KB+ |
| **DevTools** | Built-in + Chrome Extension | Separate package |
| **Setup** | 2 lines | 10+ lines |
| **Learning Curve** | Minimal | Steep |
| **TypeScript** | First-class | Added later |

## Features

- **Simple API** — Just `useQuery` and `useMutation`
- **Smart Caching** — Automatic with configurable stale/cache times
- **Background Sync** — Auto-refetch on focus, reconnect, and intervals
- **Optimistic Updates** — Instant UI feedback
- **DevTools** — In-app panel + Chrome extension
- **Tiny** — ~12KB gzipped
- **Flexible** — Works with fetch, axios, graphql, or any async function

---

## Quick Start

### 1. Install

```bash
npm install @forgedevstack/forge-query
```

### 2. Setup

```tsx
import { QueryClient, QueryClientContext } from '@forgedevstack/forge-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientContext.Provider value={queryClient}>
      <YourApp />
    </QueryClientContext.Provider>
  );
}
```

### 3. Fetch Data

```tsx
import { useQuery } from '@forgedevstack/forge-query';

function UserProfile({ userId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  
  return <Profile user={data} />;
}
```

### 4. Mutate Data

```tsx
import { useMutation, useQueryClient } from '@forgedevstack/forge-query';

function CreateTodo() {
  const queryClient = useQueryClient();
  
  const { mutate, isLoading } = useMutation({
    mutationFn: (todo) => fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify(todo),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return (
    <button onClick={() => mutate({ title: 'New Todo' })} disabled={isLoading}>
      Add Todo
    </button>
  );
}
```

---

## DevTools

### In-App Panel

Add the DevTools component to see all queries, logs, and cache in real-time:

```tsx
import { ForgeQueryDevTools } from '@forgedevstack/forge-query/devtools';

function App() {
  return (
    <QueryClientContext.Provider value={queryClient}>
      <YourApp />
      <ForgeQueryDevTools />
    </QueryClientContext.Provider>
  );
}
```

### Chrome Extension

Get a dedicated DevTools panel in Chrome:

1. Download from [Chrome Web Store](#) (coming soon)
2. Or build from source:
   ```bash
   cd devtools-extension
   npm install
   npm run build
   ```
3. Load in Chrome: Extensions → Developer Mode → Load Unpacked

**Features:**
- View all queries and their status
- Activity logs with timestamps
- Cache statistics and data preview
- Refetch, invalidate, or remove queries

<p align="center">
  <img src="./docs/assets/devtools-screenshot.png" alt="DevTools Screenshot" width="600" />
</p>

---

## API Reference

### useQuery

```tsx
const {
  data,         // The fetched data
  error,        // Error if failed
  isLoading,    // Initial loading state
  isFetching,   // Any fetching (including background)
  isError,      // Error state
  isSuccess,    // Success state
  refetch,      // Manual refetch function
} = useQuery({
  queryKey: ['users'],        // Unique cache key
  queryFn: fetchUsers,        // Async function
  staleTime: 60000,           // Time until stale (ms)
  cacheTime: 300000,          // Cache retention (ms)
  retry: 3,                   // Retry attempts
  enabled: true,              // Enable/disable
  refetchOnMount: true,       // Refetch on mount
  refetchOnWindowFocus: true, // Refetch on focus
  refetchInterval: false,     // Auto-refetch interval
});
```

### useMutation

```tsx
const {
  mutate,       // Trigger mutation
  mutateAsync,  // Returns promise
  data,         // Result data
  error,        // Error if failed
  isLoading,    // Loading state
  reset,        // Reset state
} = useMutation({
  mutationFn: (data) => createItem(data),
  onMutate: (variables) => { /* Before mutation */ },
  onSuccess: (data) => { /* On success */ },
  onError: (error) => { /* On error */ },
  onSettled: () => { /* Always runs */ },
});
```

### QueryClient

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    retry: 3,
  },
});

// Methods
queryClient.getQueryData(['users']);           // Get cached data
queryClient.setQueryData(['users'], newData);  // Set cache
queryClient.invalidateQueries(['users']);      // Mark stale & refetch
queryClient.refetchQueries(['users']);         // Force refetch
queryClient.removeQueries(['users']);          // Remove from cache
queryClient.clear();                           // Clear all
```

---

## Examples

### Dependent Queries

```tsx
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: fetchUser,
});

const { data: posts } = useQuery({
  queryKey: ['posts', user?.id],
  queryFn: () => fetchPosts(user.id),
  enabled: !!user, // Wait for user
});
```

### Optimistic Updates

```tsx
const { mutate } = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries(['todos']);
    const previous = queryClient.getQueryData(['todos']);
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo]);
    return { previous };
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previous);
  },
});
```

### With TypeScript

```tsx
interface User {
  id: number;
  name: string;
}

const { data } = useQuery<User, Error>({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
});
// data is User | undefined
```

---

## Configuration

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    staleTime: 0,              // Data is stale immediately
    cacheTime: 5 * 60 * 1000,  // 5 minutes
    retry: 3,
    retryDelay: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  devtools: {
    enabled: process.env.NODE_ENV === 'development',
    maxLogs: 100,
  },
});
```

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 90+     |
| Firefox | 90+     |
| Safari  | 14+     |
| Edge    | 90+     |

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © [ForgeDevStack](https://forgedevstack.com)

---

<p align="center">
  Part of the <a href="https://forgedevstack.com">ForgeDevStack</a> ecosystem
</p>
