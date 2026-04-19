/**
 * index.js — Backwards-compatibility shim
 *
 * The real entry point is now server.js (started by nodemon / npm start).
 * This file is kept so that any tooling or documentation that references
 * "index.js" continues to work: importing it will simply start the server.
 *
 * If you need only the Express app object (e.g., for testing), import app.js:
 *   import app from './app.js';
 */

// Delegate entirely to server.js — all initialisation happens there.
import './server.js';
