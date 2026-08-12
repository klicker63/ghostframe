import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        work: resolve(import.meta.dirname, 'work/index.html'),
        labs: resolve(import.meta.dirname, 'labs/index.html'),
        about: resolve(import.meta.dirname, 'about/index.html'),
        demonCore: resolve(import.meta.dirname, 'demon-core/index.html'),
        ghostgate: resolve(import.meta.dirname, 'ghostgate/index.html'),
        releaseCheck: resolve(import.meta.dirname, 'ghostgate/release-check/index.html'),
        agentReleaseReadiness: resolve(import.meta.dirname, 'tools/agent-release-readiness/index.html'),
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
