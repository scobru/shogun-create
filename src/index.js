const { parse, inferSchema, validate } = require("mityli");

// common.js
const Gun = require("gun");

require("gun/sea");
require("gun/lib/then");
require("gun/lib/radisk");
require("gun/lib/store");
require("gun/lib/wire");
require("gun/lib/stats");
require("gun/lib/server");
require("gun/lib/yson");
require("gun/lib/rindexed");
require("gun/lib/webrtc");

// For Node.js server with Radisk file persistence, Gun typically auto-loads necessary modules.
// If issues arise, you might need to explicitly require them:
// e.g., require('gun/lib/radisk'); require('gun/lib/store'); require('gun/lib/rfs');

const portStruct = 8765;

const peersStructRaw = [""];

const optionsRadiskRaw = {
  useRadisk: true,
  radiskPath: "radata",
};

const optionsLocalstorageRaw = {
  useRadisk: false,
  radiskPath: "",
  useLocalStorage: true,
};

const schemaOptionsRadisk = inferSchema(parse(optionsRadiskRaw));
const schemaOptionsLocalstorage = inferSchema(parse(optionsLocalstorageRaw));
const schemaPeers = inferSchema(parse(peersStructRaw));
const schemaPort = inferSchema(parse(portStruct));

/**
 * Presets predefiniti per diversi scenari
 */
const PRESETS = {
  // Configurazioni rapide basate sulla documentazione GunDB
  FAST: {
    chunk: 100,
    until: 9,
    localStorage: true,
    radisk: false,
    ws: true
  },
  
  RELIABLE: {
    chunk: 2000,
    until: 199,
    localStorage: true,
    radisk: true,
    ws: true
  },
  
  MINIMAL: {
    chunk: 50,
    until: 1,
    localStorage: false,
    radisk: false,
    ws: true
  },
  
  COLLABORATIVE: {
    chunk: 500,
    until: 29,
    localStorage: true,
    radisk: true,
    ws: true
  }
};

/** 
 * Creates a Gun client instance for Node.js environments.
 * @param {string[]} peers - Array of peer URLs.
 * @param {object} [options={}] - Configuration options.
 * @param {boolean} [options.useRadisk=false] - Whether to enable Radisk persistence.
 * @param {string} [options.radiskPath=''] - Path for Radisk data store if useRadisk is true.
 *                                           If empty and useRadisk is true, Gun's default ('radata') is used and a warning is issued.
 *                                           In Node.js, this translates to a file/directory path.
 * @returns {Gun} A Gun instance.
 */
function createNodeClient(peers, options = {}) {
  validate(schemaPeers, peers);
  validate(schemaOptionsRadisk, options);

  const { useRadisk = false, radiskPath = "" } = options;
  const config = {
    peers,
    localStorage: false, // localStorage is not available/used in Node.js
    radisk: useRadisk,
    ws: true, // Abilita WebSocket per comunicazione peer-to-peer
  };
  if (useRadisk) {
    if (!radiskPath) {
      console.warn(
        'NodeClient: useRadisk is true, but radiskPath is not provided. Using Gun default path (e.g., "radata").'
      );
      config.file = "radata"; // Gun's default for client-side Radisk if path is not specified
    } else {
      config.file = radiskPath; // In Node.js, 'file' option configures Radisk path
    }
  }
  return Gun(config);
}

/**
 * Creates a Gun client instance for Browser environments.
 * @param {string[]} peers - Array of peer URLs.
 * @param {object} [options={}] - Configuration options.
 * @param {boolean} [options.useLocalStorage=true] - Whether to enable localStorage persistence. Gun uses this by default in browsers.
 * @param {boolean} [options.useRadisk=false] - Whether to enable Radisk persistence.
 * @param {string} [options.radiskPath=''] - Name/path for Radisk store if useRadisk is true.
 *                                           If empty and useRadisk is true, Radisk uses its default name (e.g., 'radata').
 *                                           In browsers, Radisk often uses localStorage or IndexedDB.
 * @returns {Gun} A Gun instance.
 */
function createBrowserClient(peers, options = {}) {
  validate(schemaPeers, peers);
  validate(schemaOptionsLocalstorage, options);

  const {
    useLocalStorage = true,
    useRadisk = false,
    radiskPath = "",
  } = options;

  const config = {
    peers,
    localStorage: useLocalStorage,
    radisk: useRadisk,
    ws: true, // Abilita WebSocket per sincronizzazione real-time
  };

  if (useRadisk) {
    // In browsers, if 'file' is set, Radisk uses it as a namespace/key for its storage.
    // If radiskPath is empty, Radisk will use its default behavior (e.g. 'radata' in localStorage).
    if (radiskPath) {
      config.file = radiskPath;
    }
    // If radiskPath is not provided but useRadisk is true, Gun's Radisk will use its default naming (often 'radata').
  }
  // Note: If useLocalStorage is false and useRadisk is true, Radisk will attempt to use IndexedDB or other means if available.
  // If both useLocalStorage and useRadisk are false, data is in-memory for the session.
  return Gun(config);
}

/**
 * Creates a Gun server instance for Node.js environments.
 * Attaches Gun to an HTTP server.
 * @param {number} port - The port for the HTTP server.
 * @param {string[]} peers - Array of peer URLs for meshing.
 * @param {object} [options={}] - Configuration options.
 * @param {string} [options.radiskPath=''] - Path for file-based persistence.
 * @param {boolean} [options.useRadisk=true] - Controls whether Radisk persistence is enabled.
 * @returns {Gun} A Gun instance.
 */
function createNodeServer(port, peers, options = {}) {
  validate(schemaPeers, peers);
  validate(schemaOptionsRadisk, options);
  validate(schemaPort, port);

  const http = require("http");
  const { radiskPath = "", useRadisk = true } = options;

  // Create an HTTP server instance and start listening.
  // Gun will attach its WebSocket handlers to this server.
  const server = http.createServer().listen(port);
  // Gun itself will log messages like "Relay on port XXXX" or "Server listening..."

  const config = {
    web: server, // Attach Gun to the HTTP server
    peers,
    localStorage: false, // Not applicable for Node.js server
    radisk: useRadisk,
    ws:true,
  };

  if (useRadisk) {
    if (!radiskPath) {
      console.warn(
        `NodeServer on port ${port}: Radisk is enabled but no persistencePath is provided. Using Gun default path (e.g., "data").`
      );
      config.file = "data"; // Gun's default for server-side persistence if path is not specified
    } else {
      config.file = radiskPath; // 'file' option enables Radisk with file system storage
    }
  }
  // If useRadisk is false, config.file is not set, so file-based persistence is disabled.
  // Gun will operate in-memory unless other persistence options are configured.

  return Gun(config);
}

/**
 * Istanza browser ottimizzata per localStorage
 * @param {string[]} peers - Array di peer URLs
 * @returns {Gun} Istanza Gun ottimizzata per localStorage
 */
function createLocalStorageClient(peers = []) {
  validate(schemaPeers, peers);
  
  return Gun({
    peers,
    localStorage: true,
    radisk: false,
    ws: true, // Abilita WebSocket per sync real-time
    // Ottimizzazioni specifiche per localStorage
    chunk: 1000, // Dimensione chunk per localStorage
  });
}

/**
 * Istanza browser con IndexedDB via Radisk
 * @param {string[]} peers - Array di peer URLs
 * @param {string} dbName - Nome del database IndexedDB
 * @returns {Gun} Istanza Gun con IndexedDB
 */
function createIndexedDBClient(peers = [], dbName = 'gundb') {
  validate(schemaPeers, peers);
  
  return Gun({
    peers,
    localStorage: false, // Disabilita localStorage
    radisk: true,        // Abilita Radisk che userà IndexedDB automaticamente
    file: dbName,        // Nome/namespace per IndexedDB
    ws: true,            // Abilita WebSocket per sync real-time
    // Configurazioni specifiche per IndexedDB
    chunk: 2000,
  });
}

/**
 * Istanza Node.js ottimizzata per Radisk file system
 * @param {string[]} peers - Array di peer URLs
 * @param {string} dataPath - Percorso per i dati
 * @returns {Gun} Istanza Gun con file system
 */
function createFileSystemClient(peers = [], dataPath = 'radata') {
  validate(schemaPeers, peers);
  
  return Gun({
    peers,
    localStorage: false,
    radisk: true,
    file: dataPath,
    ws: true, // Abilita WebSocket per sync real-time
    // Ottimizzazioni per file system
    chunk: 5000,
    until: 99, // Timeout per operazioni
  });
}

/**
 * Istanza in-memory per testing/demo rapidi
 * @param {string[]} peers - Array di peer URLs
 * @returns {Gun} Istanza Gun solo in memoria
 */
function createInMemoryClient(peers = []) {
  validate(schemaPeers, peers);
  
  return Gun({
    peers,
    localStorage: false,
    radisk: false,
    ws: true, // Abilita WebSocket per sync real-time
    // Configurazione per massima velocità
    chunk: 100,
  });
}

/**
 * Istanza ottimizzata per real-time collaboration
 * @param {string[]} peers - Array di peer URLs
 * @returns {Gun} Istanza Gun per collaborazione real-time
 */
function createRealtimeClient(peers) {
  validate(schemaPeers, peers);
  
  const gun = Gun({
    peers,
    localStorage: true,
    radisk: true,
    ws: true, // Essenziale per real-time collaboration
    // Ottimizzazioni per real-time
    chunk: 500,
    until: 9, // Timeout più breve per real-time
  });
  
  // Carica moduli specifici per real-time se disponibili
  try {
    require('gun/lib/webrtc'); // Per connessioni P2P dirette
  } catch (e) {
    console.warn('WebRTC module not available');
  }
  
  return gun;
}

/**
 * Istanza per applicazioni offline-first
 * @param {string[]} peers - Array di peer URLs
 * @param {object} options - Opzioni di configurazione
 * @returns {Gun} Istanza Gun ottimizzata per offline
 */
function createOfflineFirstClient(peers = [], options = {}) {
  validate(schemaPeers, peers);
  
  const { storageQuota = 50, syncInterval = 30000 } = options;
  
  return Gun({
    peers,
    localStorage: true,
    radisk: true,
    ws: true, // WebSocket per sync quando online
    // Configurazioni per offline-first
    chunk: 1000,
    until: 199, // Timeout più lungo per offline
    // Quota storage personalizzabile
    quota: storageQuota * 1024 * 1024, // MB to bytes
  });
}

/**
 * Crea istanza Gun con preset predefinito
 * @param {string} preset - Nome del preset (FAST, RELIABLE, MINIMAL, COLLABORATIVE)
 * @param {string[]} peers - Array di peer URLs
 * @param {object} overrides - Sovrascritture delle configurazioni
 * @returns {Gun} Istanza Gun configurata
 */
function createPresetClient(preset, peers = [], overrides = {}) {
  validate(schemaPeers, peers);
  
  if (!PRESETS[preset]) {
    throw new Error(`Preset "${preset}" non trovato. Presets disponibili: ${Object.keys(PRESETS).join(', ')}`);
  }
  
  const config = { ...PRESETS[preset], peers, ...overrides };
  return Gun(config);
}

/**
 * Auto-rileva l'ambiente e crea l'istanza ottimale
 * @param {string[]} peers - Array di peer URLs
 * @param {object} options - Opzioni aggiuntive
 * @returns {Gun} Istanza Gun ottimizzata per l'ambiente
 */
function createAutoClient(peers = [], options = {}) {
  validate(schemaPeers, peers);
  
  const isNode = typeof window === 'undefined';
  const hasIndexedDB = typeof indexedDB !== 'undefined';
  
  if (isNode) {
    return createFileSystemClient(peers, options.dataPath);
  } else if (hasIndexedDB && options.preferIndexedDB) {
    return createIndexedDBClient(peers, options.dbName);
  } else {
    return createLocalStorageClient(peers);
  }
}

/**
 * Setup rapido per sviluppo locale
 * @param {number} port - Porta del server locale (default: 8765)
 * @returns {object} Server e client configurati
 */
function createDevSetup(port = 8765) {
  validate(schemaPort, port);
  
  const serverPeers = [`http://localhost:${port}/gun`];
  
  // Server per Node.js
  const server = createNodeServer(port, [], {
    useRadisk: true,
    radiskPath: 'dev-data'
  });
  
  // Client ottimizzato per sviluppo
  const client = createAutoClient(serverPeers, {
    preferIndexedDB: true,
    dbName: 'dev-gundb'
  });
  
  return { server, client };
}

module.exports = {
  // Funzioni esistenti
  createNodeClient,
  createBrowserClient,
  createNodeServer,
  
  // Nuove istanze preconfezionate
  createLocalStorageClient,
  createIndexedDBClient,
  createFileSystemClient,
  createInMemoryClient,
  createRealtimeClient,
  createOfflineFirstClient,
  
  // Utilities
  createPresetClient,
  createAutoClient,
  createDevSetup,
  
  // Presets per accesso diretto
  PRESETS
};
