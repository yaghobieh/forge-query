import { FC, useState } from 'react';
import { 
  QueryClient, 
  useQuery, 
  useMutation, 
  useQueryClient,
  QueryClientContext 
} from '@forgedevstack/forge-query';
import { ForgeQueryDevTools } from '@forgedevstack/forge-query/devtools';

// Create query client with DevTools enabled
const queryClient = new QueryClient({
  defaultOptions: {
    staleTime: 30000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  },
  devtools: {
    enabled: true, // Enable DevTools communication
    maxLogs: 100,
  },
});

// Mock API
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com' },
];

const mockPosts = [
  { id: 1, title: 'Hello World', userId: 1 },
  { id: 2, title: 'React Hooks', userId: 1 },
  { id: 3, title: 'TypeScript Tips', userId: 2 },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock fetch functions
const fetchUsers = async () => {
  await delay(800);
  return [...mockUsers];
};

const fetchPosts = async () => {
  await delay(600);
  return [...mockPosts];
};

const fetchUser = async (id: number) => {
  await delay(500);
  const user = mockUsers.find(u => u.id === id);
  if (!user) throw new Error('User not found');
  return user;
};

const createUser = async (data: { name: string; email: string }) => {
  await delay(500);
  const newUser = { id: mockUsers.length + 1, ...data };
  mockUsers.push(newUser);
  return newUser;
};

// Components
const UsersCard: FC = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  return (
    <div className="card">
      <h2>Users</h2>
      <p>Fetches list of users with caching</p>
      
      <div className="controls">
        <button onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
        {isLoading && <span className="status status-loading">Loading...</span>}
        {error && <span className="status status-error">Error</span>}
        {data && !isFetching && <span className="status status-success">Cached</span>}
      </div>

      {data && (
        <ul className="user-list">
          {data.map(user => (
            <li key={user.id}>
              <div className="user-avatar">{user.name[0]}</div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const PostsCard: FC = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: 60000, // Override default: 1 minute
  });

  return (
    <div className="card">
      <h2>Posts</h2>
      <p>Fetches posts with longer stale time (1 min)</p>
      
      <div className="controls">
        <button onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
        {isLoading && <span className="status status-loading">Loading...</span>}
        {error && <span className="status status-error">Error</span>}
        {data && !isFetching && <span className="status status-success">Cached</span>}
      </div>

      {data && (
        <div className="data-display">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

const SingleUserCard: FC = () => {
  const [userId, setUserId] = useState(1);
  
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  return (
    <div className="card">
      <h2>Single User</h2>
      <p>Fetch individual user by ID</p>
      
      <div className="controls">
        <button onClick={() => setUserId(1)} disabled={userId === 1}>User 1</button>
        <button onClick={() => setUserId(2)} disabled={userId === 2}>User 2</button>
        <button onClick={() => setUserId(3)} disabled={userId === 3}>User 3</button>
      </div>

      {(isLoading || isFetching) && <span className="status status-loading">Loading...</span>}
      {error && <span className="status status-error">{(error as Error).message}</span>}
      
      {data && (
        <div className="data-display">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

const CreateUserCard: FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isLoading, error, data: newUser } = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate users query to refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setName('');
      setEmail('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      mutate({ name, email });
    }
  };

  return (
    <div className="card">
      <h2>Create User</h2>
      <p>Mutation with cache invalidation</p>
      
      <form onSubmit={handleSubmit}>
        <div className="controls">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="controls">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="controls">
          <button type="submit" disabled={isLoading || !name || !email}>
            {isLoading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>

      {error && <span className="status status-error">{(error as Error).message}</span>}
      {newUser && <span className="status status-success">Created: {newUser.name}</span>}
    </div>
  );
};

export const App: FC = () => {
  return (
    <QueryClientContext.Provider value={queryClient}>
      <div className="container">
        <div className="header">
          <h1>🐍 Forge Query Test App</h1>
          <span className="badge">v1.0.0</span>
        </div>

        <div className="grid">
          <UsersCard />
          <PostsCard />
          <SingleUserCard />
          <CreateUserCard />
        </div>
      </div>
      
      {/* DevTools - shows in bottom-right corner */}
      <ForgeQueryDevTools position="bottom-right" />
    </QueryClientContext.Provider>
  );
};

