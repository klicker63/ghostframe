import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        ghostgate: resolve(import.meta.dirname, 'ghostgate/index.html'),
        releaseCheck: resolve(import.meta.dirname, 'ghostgate/release-check/index.html'),
        proof: resolve(import.meta.dirname, 'proof/index.html'),
        pilot: resolve(import.meta.dirname, 'pilot/index.html'),
        security: resolve(import.meta.dirname, 'security/index.html'),
        studio: resolve(import.meta.dirname, 'studio/index.html'),
        contact: resolve(import.meta.dirname, 'contact/index.html'),
        evidence: resolve(import.meta.dirname, 'ghostgate/evidence/index.html'),
        proofline: resolve(import.meta.dirname, 'proofline/index.html'),
      },
    },
  },
});
