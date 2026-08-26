import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import inlineEditPlugin from './plugins/visual-editor/vite-plugin-react-inline-editor.js';
import editModeDevPlugin from './plugins/visual-editor/vite-plugin-edit-mode.js';
import iframeRouteRestorationPlugin from './plugins/vite-plugin-iframe-route-restoration.js';
import sitePagesPlugin from './plugins/vite-plugin-site-pages.js';
import sessionJournalPlugin from './plugins/session-journal/vite-plugin-session-journal.js';

export default defineConfig(({ mode }) => ({
  plugins: [
    ...(mode !== 'production'
      ? [inlineEditPlugin(), editModeDevPlugin(), iframeRouteRestorationPlugin(), sitePagesPlugin(), sessionJournalPlugin()]
      : []),
    react(),
  ],
  server: {
    host: true,
    port: 3000,
    cors: { origin: ['https://horizons.hostinger.com', 'https://horizons.hostinger.dev'] },
    headers: { 'Cross-Origin-Embedder-Policy': 'credentialless' },
    allowedHosts: ['.app-preview.com', '.app-preview.io'],
    fs: {
      strict: true,
      allow: [path.resolve(__dirname), path.join(path.resolve(__dirname, '../..'), 'node_modules')],
    },
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    rollupOptions: {
      external: ['@babel/parser', '@babel/traverse', '@babel/generator', '@babel/types'],
    },
  },
}));
