import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { defineConfig } from 'vite';

const municipalIntakePreview = {
  name: 'municipal-intake-preview',
  configureServer(server) {
    server.middlewares.use('/api/municipal-intelligence-lead', (request, response, next) => {
      const previewState = request.headers['x-ghostframe-preview-state'];
      if (request.method !== 'POST' || !['success', 'error'].includes(previewState)) return next();

      let raw = '';
      request.setEncoding('utf8');
      request.on('data', chunk => { raw += chunk; });
      request.on('end', () => {
        response.setHeader('Cache-Control', 'no-store');
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        if (previewState === 'error') {
          response.statusCode = 503;
          response.end(JSON.stringify({ error: 'Online delivery is temporarily unavailable. Please use the direct email option.' }));
          return;
        }

        const reference = createHash('sha256').update(raw).digest('hex').slice(0, 16).toUpperCase();
        response.statusCode = 200;
        response.end(JSON.stringify({
          ok: true,
          submissionId: `GF-MI-${reference}`,
          message: 'GhostFrame received your Tampa property coverage-review request.',
        }));
      });
    });
  },
};

export default defineConfig({
  plugins: [municipalIntakePreview],
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        work: resolve(import.meta.dirname, 'work/index.html'),
        municipalIntelligence: resolve(import.meta.dirname, 'work/municipal-intelligence/index.html'),
        municipalIntelligenceSample: resolve(import.meta.dirname, 'work/municipal-intelligence/sample-report/index.html'),
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
