// Polyfills for Node.js globals needed by Solana libraries
import { Buffer } from 'buffer';

// Make Buffer available globally
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}

if (typeof window !== 'undefined') {
  if (typeof (window as any).Buffer === 'undefined') {
    (window as any).Buffer = Buffer;
  }
  
  if (typeof (window as any).global === 'undefined') {
    (window as any).global = window;
  }
  
  if (typeof (window as any).process === 'undefined') {
    (window as any).process = { env: {} };
  }
}

export {};