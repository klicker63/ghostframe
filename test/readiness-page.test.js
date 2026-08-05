import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const load = file => readFile(path.join(root, file), 'utf8');

test('readiness route renders the no-login self-assessment boundary and SEO metadata', async () => {
  const html = await load('tools/agent-release-readiness/index.html');
  assert.match(html, /AI Agent Release Readiness Check \| GhostGate/);
  assert.match(html, /rel="canonical" href="https:\/\/www\.ghostframestudios\.com\/tools\/agent-release-readiness\//);
  for (const statement of ['It is a self-assessment', 'It is not a security certification', 'It does not guarantee safety', 'It does not replace independent testing']) assert.match(html, new RegExp(statement));
  assert.match(html, /Do not enter credentials, secrets, personal data, customer data, or confidential instructions/);
  assert.match(html, />Assess an Agent</);
  assert.match(html, />View the GhostGate Release Check</);
  assert.match(html, /isAccessibleForFree/);
});

test('readiness route exposes accessible progress, controls, result sections, and optional lead fields', async () => {
  const html = await load('tools/agent-release-readiness/index.html');
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /data-question-previous/);
  assert.match(html, /data-question-next/);
  assert.match(html, /data-copy-json/);
  assert.match(html, /data-copy-yaml/);
  assert.match(html, /data-download-result/);
  assert.match(html, /data-restart/);
  for (const name of ['fullName', 'email', 'company', 'agentName', 'readinessCategory', 'context', 'consent', 'website']) assert.match(html, new RegExp(`name="${name}"`));
  assert.match(html, /Your 15 answers and Permission Envelope are never included/);
  assert.match(html, /data-lead-status role="alert" tabindex="-1"/);
});

test('readiness client remains local until explicit optional lead submission', async () => {
  const [app, engine] = await Promise.all([load('src/readiness-app.js'), load('src/readiness-engine.js')]);
  assert.equal((app.match(/fetch\(/g) ?? []).length, 1);
  assert.match(app, /fetch\('\/api\/readiness-lead'/);
  assert.doesNotMatch(app + engine, /localStorage|sessionStorage|indexedDB/);
  assert.match(app, /buildLeadPayload/);
  assert.match(engine, /riskDimensions/);
});

test('requested existing GhostGate pages link to the free readiness route without replacing paid CTAs', async () => {
  for (const file of ['ghostgate/index.html', 'ghostgate/release-check/index.html', 'ghostgate/evidence/index.html']) {
    const html = await load(file);
    assert.match(html, /href="\/tools\/agent-release-readiness\//, file);
    assert.match(html, /href="\/ghostgate\/release-check\//, file);
  }
});

test('readiness structured data is covered by the production content security policy', async () => {
  const [html, configSource] = await Promise.all([load('tools/agent-release-readiness/index.html'), load('vercel.json')]);
  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(jsonLd);
  const hash = createHash('sha256').update(jsonLd).digest('base64');
  const config = JSON.parse(configSource);
  const csp = config.headers[0].headers.find(header => header.key === 'Content-Security-Policy').value;
  assert.match(csp, new RegExp(`sha256-${hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
});
