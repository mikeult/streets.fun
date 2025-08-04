/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), legacy()],
    resolve: {
      alias: {
        buffer: 'buffer',
      },
    },
    define: {
      // Expose VITE_PRIVY_APP_ID from environment to import.meta.env
      'import.meta.env.VITE_PRIVY_APP_ID': JSON.stringify(env.VITE_PRIVY_APP_ID),
      // Buffer polyfill for Solana libraries
      global: 'globalThis',
      'process.env': {},
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://pump.fun',
          changeOrigin: true,
          secure: false,
        }
      },
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          format: 'es',
        },
      },
    },
    optimizeDeps: {
      include: ['buffer'],
      esbuildOptions: {
        target: 'esnext',
        supported: {
          bigint: true,
        },
      },
    },
    esbuild: {
      target: 'esnext',
      supported: {
        bigint: true,
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    }
  }
});
