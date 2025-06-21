# Shogun Create ⛺

A comprehensive utility library for creating and configuring Gun.js instances with pre-configured setups for rapid development across Node.js and browser environments.

## Features

- 🚀 **Rapid Setup** - Pre-configured instances for different scenarios
- 🏪 **Multiple Storage Options** - localStorage, IndexedDB, File System, In-Memory
- 🌐 **WebSocket Enabled** - Real-time synchronization across all instances
- ⚡ **Performance Optimized** - Tuned configurations for different use cases
- 🎯 **Environment Auto-Detection** - Automatically chooses optimal configuration
- 🛠️ **Developer Friendly** - One-line setup for development environments
- 📦 **Type Validation** - Built-in parameter validation with mityli
- 🎨 **Preset System** - Quick configuration templates

## Installation

```bash
npm install shogun-create
```

## Quick Start

```javascript
const { createAutoClient, createDevSetup } = require('shogun-create');

// Auto-detect environment and create optimal instance
const client = createAutoClient(['http://localhost:8765/gun']);

// Complete development setup (server + client)
const { server, client: devClient } = createDevSetup(8765);
```

## API Reference

### Pre-configured Client Instances

#### `createLocalStorageClient(peers)`
Browser client optimized for localStorage storage.

```javascript
const { createLocalStorageClient } = require('shogun-create');

const client = createLocalStorageClient(['http://localhost:8765/gun']);
// Uses: localStorage + WebSocket, optimized chunks (1000)
```

#### `createIndexedDBClient(peers, dbName)`
Browser client using IndexedDB via Radisk for large datasets.

```javascript
const { createIndexedDBClient } = require('shogun-create');

const client = createIndexedDBClient(['http://localhost:8765/gun'], 'myapp-db');
// Uses: IndexedDB + WebSocket, larger chunks (2000)
```

#### `createFileSystemClient(peers, dataPath)`
Node.js client optimized for file system persistence.

```javascript
const { createFileSystemClient } = require('shogun-create');

const client = createFileSystemClient(['http://localhost:8765/gun'], './data');
// Uses: File system + WebSocket, large chunks (5000)
```

#### `createInMemoryClient(peers)`
Fast in-memory client for testing and demos.

```javascript
const { createInMemoryClient } = require('shogun-create');

const client = createInMemoryClient(['http://localhost:8765/gun']);
// Uses: Memory only + WebSocket, minimal chunks (100)
```

#### `createRealtimeClient(peers)`
Optimized for real-time collaboration with WebRTC support.

```javascript
const { createRealtimeClient } = require('shogun-create');

const client = createRealtimeClient(['http://localhost:8765/gun']);
// Uses: localStorage + IndexedDB + WebSocket + WebRTC, fast timeouts
```

#### `createOfflineFirstClient(peers, options)`
Designed for offline-first applications with configurable storage.

```javascript
const { createOfflineFirstClient } = require('shogun-create');

const client = createOfflineFirstClient(['http://localhost:8765/gun'], {
  storageQuota: 100, // MB
  syncInterval: 30000 // ms
});
// Uses: localStorage + IndexedDB + WebSocket, extended timeouts
```

### Utility Functions

#### `createAutoClient(peers, options)`
Auto-detects environment and creates optimal instance.

```javascript
const { createAutoClient } = require('shogun-create');

// Browser: uses localStorage or IndexedDB based on preference
const browserClient = createAutoClient(['http://localhost:8765/gun'], {
  preferIndexedDB: true,
  dbName: 'myapp'
});

// Node.js: uses file system
const nodeClient = createAutoClient(['http://localhost:8765/gun'], {
  dataPath: './mydata'
});
```

#### `createPresetClient(preset, peers, overrides)`
Uses predefined configuration presets.

```javascript
const { createPresetClient, PRESETS } = require('shogun-create');

// Available presets: FAST, RELIABLE, MINIMAL, COLLABORATIVE
const fastClient = createPresetClient('FAST', ['http://localhost:8765/gun']);

// With custom overrides
const customClient = createPresetClient('RELIABLE', ['http://localhost:8765/gun'], {
  chunk: 3000 // Override default chunk size
});
```

#### `createDevSetup(port)`
Complete development environment setup.

```javascript
const { createDevSetup } = require('shogun-create');

const { server, client } = createDevSetup(8765);
// Creates server on port 8765 + optimized client connected to it
```

### Original Functions (Enhanced)

#### `createNodeClient(peers, options)`
Enhanced Node.js client with WebSocket support.

```javascript
const { createNodeClient } = require('shogun-create');

const client = createNodeClient(['http://localhost:8765/gun'], {
  useRadisk: true,
  radiskPath: 'mydata'
});
```

#### `createBrowserClient(peers, options)`
Enhanced browser client with WebSocket support.

```javascript
const { createBrowserClient } = require('shogun-create');

const client = createBrowserClient(['http://localhost:8765/gun'], {
  useLocalStorage: true,
  useRadisk: true,
  radiskPath: 'myapp-data'
});
```

#### `createNodeServer(port, peers, options)`
Enhanced Node.js server with WebSocket enabled.

```javascript
const { createNodeServer } = require('shogun-create');

const server = createNodeServer(8765, ['http://localhost:8765/gun'], {
  useRadisk: true,
  radiskPath: 'server-data'
});
```

## Configuration Presets

### PRESETS Object

```javascript
const { PRESETS } = require('shogun-create');

console.log(PRESETS);
// {
//   FAST: { chunk: 100, until: 9, localStorage: true, radisk: false, ws: true },
//   RELIABLE: { chunk: 2000, until: 199, localStorage: true, radisk: true, ws: true },
//   MINIMAL: { chunk: 50, until: 1, localStorage: false, radisk: false, ws: true },
//   COLLABORATIVE: { chunk: 500, until: 29, localStorage: true, radisk: true, ws: true }
// }
```

### Preset Use Cases

- **FAST** - Maximum speed, minimal persistence (testing, demos)
- **RELIABLE** - Balanced performance and data safety (production apps)
- **MINIMAL** - Lightweight setup (embedded systems, minimal apps)
- **COLLABORATIVE** - Optimized for real-time collaboration (chat, collaborative editing)

## Usage Examples

### Real-time Chat Application

```javascript
const { createRealtimeClient } = require('shogun-create');

const gun = createRealtimeClient(['wss://my-gun-server.com/gun']);

// Setup real-time messaging
const messages = gun.get('chat').get('messages');

// Send message
messages.set({ text: 'Hello!', user: 'Alice', timestamp: Date.now() });

// Listen for new messages
messages.map().on((message, key) => {
  console.log(`${message.user}: ${message.text}`);
});
```

### Offline-First Mobile App

```javascript
const { createOfflineFirstClient } = require('shogun-create');

const gun = createOfflineFirstClient(['https://api.myapp.com/gun'], {
  storageQuota: 50, // 50MB local storage
  syncInterval: 60000 // Sync every minute when online
});

// Works offline, syncs when connection available
gun.get('user').get('profile').put({
  name: 'John Doe',
  lastActive: Date.now()
});
```

### Development Environment

```javascript
const { createDevSetup } = require('shogun-create');

// Start development server and client
const { server, client } = createDevSetup(3000);

console.log('Gun server running on http://localhost:3000/gun');

// Use client for development
client.get('dev').get('test').put('Hello Development!');
```

### Production Deployment

```javascript
const { createNodeServer, createPresetClient } = require('shogun-create');

// Production server
const server = createNodeServer(process.env.PORT || 8765, [], {
  useRadisk: true,
  radiskPath: process.env.DATA_PATH || '/var/lib/gundb'
});

// Production client
const client = createPresetClient('RELIABLE', [
  'wss://primary.myapp.com/gun',
  'wss://backup.myapp.com/gun'
]);
```

### Auto-Detection for Universal Apps

```javascript
const { createAutoClient } = require('shogun-create');

// Works in both Node.js and browser
const gun = createAutoClient(['https://api.myapp.com/gun'], {
  preferIndexedDB: true, // Browser preference
  dataPath: './data',    // Node.js preference
  dbName: 'myapp-db'     // IndexedDB name
});

// Universal code
gun.get('app').get('config').once(config => {
  console.log('App config loaded:', config);
});
```

## Storage Comparison

| Instance Type | Environment | Storage | Performance | Use Case |
|---------------|-------------|---------|-------------|----------|
| `createLocalStorageClient` | Browser | localStorage | Fast | Small to medium data |
| `createIndexedDBClient` | Browser | IndexedDB | Medium | Large datasets |
| `createFileSystemClient` | Node.js | File System | High | Server applications |
| `createInMemoryClient` | Both | Memory | Very Fast | Testing, temporary data |
| `createRealtimeClient` | Both | localStorage + IndexedDB | Medium | Real-time collaboration |
| `createOfflineFirstClient` | Both | localStorage + IndexedDB | Medium | Offline-capable apps |

## Advanced Configuration

### Custom Chunk Sizes

```javascript
const { createPresetClient } = require('shogun-create');

// Override default chunk size for large files
const client = createPresetClient('RELIABLE', peers, {
  chunk: 10000 // Larger chunks for file uploads
});
```

### Connection Timeouts

```javascript
const { createBrowserClient } = require('shogun-create');

const client = createBrowserClient(peers, {
  useLocalStorage: true,
  useRadisk: true
});

// The 'until' parameter is set automatically based on the function used
// FAST: 9ms, RELIABLE: 199ms, COLLABORATIVE: 29ms
```

### WebSocket Configuration

All instances automatically include `ws: true` for real-time synchronization. WebSocket connections enable:

- Instant data synchronization
- Bi-directional communication
- Efficient peer-to-peer networking
- Real-time collaboration features

## Environment Detection

The library automatically detects the runtime environment:

```javascript
// Browser detection
if (typeof window !== 'undefined') {
  // Browser-specific optimizations
  // - localStorage or IndexedDB
  // - WebSocket for real-time sync
}

// Node.js detection
if (typeof window === 'undefined') {
  // Node.js-specific optimizations
  // - File system persistence
  // - Server capabilities
}
```

## Error Handling

All functions include built-in validation:

```javascript
const { createLocalStorageClient } = require('shogun-create');

try {
  // This will throw an error if peers is not an array
  const client = createLocalStorageClient('invalid-peers');
} catch (error) {
  console.error('Configuration error:', error.message);
}
```

## Performance Tips

1. **Choose the right instance type** for your use case
2. **Use IndexedDB for large datasets** in browsers
3. **Enable Radisk for persistence** in production
4. **Use FAST preset for prototyping** and RELIABLE for production
5. **Consider offline-first** for mobile applications
6. **Use real-time client** only when needed to avoid overhead

## Migration from Basic Gun

### Before (Basic Gun):
```javascript
const Gun = require('gun');
require('gun/sea');

const gun = Gun({
  peers: ['http://localhost:8765/gun'],
  localStorage: true
});
```

### After (Shogun Create):
```javascript
const { createAutoClient } = require('shogun-create');

const gun = createAutoClient(['http://localhost:8765/gun']);
// Automatically optimized with WebSocket, proper chunking, and validation
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT

## Related Projects

- [Gun.js](https://gun.eco/) - The decentralized database
- [shogun-core](https://github.com/scobru/shogun-core) - Authentication and core utilities
- [mityli](https://github.com/scobru/mityli) - Type validation library

---

**Made with ❤️ by the Shogun Team**
