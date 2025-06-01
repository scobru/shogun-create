# Shogun Create ⛺

A utility library for creating and configuring Gun.js instances for both Node.js and browser environments.

## Features

- Simple API for creating Gun.js instances
- Support for different environments (Node.js client, Node.js server, browser)
- Configurable persistence options (localStorage, Radisk)
- Type validation for configuration parameters
- Sensible defaults with clear warnings

## Installation

```bash
npm install shogun-create
```

## Usage

### Creating a Node.js Client

```javascript
const { createNodeClient } = require('shogun-create');

// Simple client with default configuration
const client = createNodeClient(['http://localhost:8765/gun']);

// Client with Radisk persistence
const persistentClient = createNodeClient(['http://localhost:8765/gun'], {
  useRadisk: true,
  radiskPath: 'my-data'
});
```

### Creating a Browser Client

```javascript
const { createBrowserClient } = require('shogun-create');

// Default browser client (uses localStorage)
const browserClient = createBrowserClient(['http://localhost:8765/gun']);

// Browser client with customized storage options
const customBrowserClient = createBrowserClient(['http://localhost:8765/gun'], {
  useLocalStorage: true,  // Uses localStorage (default)
  useRadisk: true,        // Also enables Radisk
  radiskPath: 'my-app-data'
});

// In-memory only client (no persistence)
const inMemoryClient = createBrowserClient(['http://localhost:8765/gun'], {
  useLocalStorage: false,
  useRadisk: false
});
```

### Creating a Node.js Server

```javascript
const { createNodeServer } = require('shogun-create');

// Create a Gun server on port 8765
const server = createNodeServer(8765, ['http://localhost:8765/gun']);

// Server with custom persistence path
const customServer = createNodeServer(8765, ['http://localhost:8765/gun'], {
  useRadisk: true,  // Enables persistence (default)
  radiskPath: 'my-data'
})

// In-memory only server
const inMemoryServer = createNodeServer(8765, ['http://localhost:8765/gun'], {
  useRadisk: false
});
```

## API Reference

### `createNodeClient(peers, options)`

Creates a Gun client instance for Node.js environments.

**Parameters:**
- `peers` (string[]): Array of peer URLs
- `options` (object, optional):
  - `useRadisk` (boolean): Whether to enable Radisk persistence (default: `false`)
  - `radiskPath` (string): Path for Radisk data store if useRadisk is true (default: `''`)

**Returns:** A Gun instance

### `createBrowserClient(peers, options)`

Creates a Gun client instance for Browser environments.

**Parameters:**
- `peers` (string[]): Array of peer URLs
- `options` (object, optional):
  - `useLocalStorage` (boolean): Whether to enable localStorage persistence (default: `true`)
  - `useRadisk` (boolean): Whether to enable Radisk persistence (default: `false`)
  - `radiskPath` (string): Name/path for Radisk store if useRadisk is true (default: `''`)

**Returns:** A Gun instance

### `createNodeServer(port, peers, options)`

Creates a Gun server instance for Node.js environments, attaching Gun to an HTTP server.

**Parameters:**
- `port` (number): The port for the HTTP server
- `peers` (string[]): Array of peer URLs for meshing
- `options` (object, optional):
  - `persistencePath` (string): Path for file-based persistence (default: `''`)
  - `enableRadisk` (boolean): Controls Radisk persistence (default: `true`)

**Returns:** A Gun instance

## Examples

### Basic Browser Usage

```javascript
const { createBrowserClient } = require('shogun-create');

const client = createBrowserClient(['http://localhost:8765/gun'], {
  useLocalStorage: true,
  useRadisk: true,
  radiskPath: 'radata',
});

// Store data
client.get('hello').put({data: 'world'});

// Retrieve data
client.get('hello').once((data) => {
  console.log(data);  // Outputs: {data: 'world'}
});
```

### Creating a Node.js Server

```javascript
const { createNodeServer } = require('shogun-create');

// Start a server on port 8765
const server = createNodeServer(8765, [], {
  persistencePath: './my-data'
});

// Use the server instance
server.get('app').get('users').set({
  name: 'John',
  role: 'admin'
});

console.log('Gun server running on port 8765');
```

## Notes on Persistence

- **Node.js Clients/Servers**: Persistence is file-based when Radisk is enabled
- **Browser Clients**: Persistence uses localStorage by default, can be extended with Radisk
- **In-memory only**: Disable both localStorage and Radisk for transient data

## License

MIT
