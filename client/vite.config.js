import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration.
 *
 * `manualChunks` splits rarely-changing vendor code into its own files so a
 * change to application code does not invalidate the whole cached bundle.
 */
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    // The PHP API is served separately; proxying keeps the browser on one
    // origin in development, so cookies and CORS behave like production.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },

  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          ui: ['react-bootstrap'],
          motion: ['framer-motion'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
  },
});
