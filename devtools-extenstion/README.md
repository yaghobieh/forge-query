# Forge Query DevTools Extension

<p align="center">
  <img src="./icons/icon-128.png" alt="Forge Query DevTools" width="80" />
</p>

A Chrome DevTools extension for inspecting [Forge Query](https://www.npmjs.com/package/@forgedevstack/forge-query) in your React applications.

## Features

- 📊 **Query Inspector** — View all queries, their status, data, and observers
- 📝 **Activity Logs** — Real-time logs with timestamps
- 💾 **Cache Stats** — Hit/miss ratios and cached data preview
- 🔄 **Query Actions** — Refetch, invalidate, or remove queries
- 🔍 **Search** — Filter queries by key

## Installation

### From Chrome Web Store

Coming soon!

### Manual Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Open Chrome and go to `chrome://extensions/`
5. Enable **Developer mode** (toggle in top right)
6. Click **Load unpacked**
7. Select the `devtools-extension` folder

## Usage

1. Open your React app that uses Forge Query
2. Open Chrome DevTools (F12 or Cmd+Option+I)
3. Click the **Forge Query** tab
4. Start inspecting your queries!

## Requirements

- Chrome 90+
- Your app must use `@forgedevstack/forge-query` with DevTools enabled:

```tsx
const queryClient = new QueryClient({
  devtools: {
    enabled: true,
  },
});
```

## Privacy

This extension:
- Does NOT collect any personal data
- Does NOT transmit data to external servers
- Only inspects the current tab's Forge Query state

See [PRIVACY.md](./PRIVACY.md) for full details.

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch mode (development)
npm run dev
```

## Screenshots

<p align="center">
  <img src="../docs/assets/extension-queries.png" alt="Queries Tab" width="600" />
</p>

<p align="center">
  <img src="../docs/assets/extension-cache.png" alt="Cache Tab" width="600" />
</p>

## License

MIT © [ForgeDevStack](https://forgedevstack.com)

