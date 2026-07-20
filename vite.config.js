import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        ghostgate: resolve(import.meta.dirname, 'ghostgate/index.html'),
        proofline: resolve(import.meta.dirname, 'proofline/index.html'),
      },
    },
  },
});
