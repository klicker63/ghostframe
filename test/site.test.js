import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { buildReviewMailto, CONTACT_EMAIL, REVIEW_BODY, REVIEW_SUBJECT, SITE_URL } from '../src/config.js';

const root = path.resolve(import.meta.dirname, '..');
const load = file => readFile(path.join(root, file), 'utf8');
const commercialRoutes = [
  ['index.html', '/'],
  ['ghostgate/index.html', '/ghostgate/'],
  ['proof/index.html', '/proof/'],
  ['pilot/index.html', '/pilot/'],
  ['security/index.html', '/security/'],
  ['studio/index.html', '/studio/'],
  ['contact/index.html', '/contact/'],
];

test('every commercial route has production metadata and shared runtime', async () => {
  for (const [file, route] of commercialRoutes) {
    const html = await load(file);
    const canonical = route === '/' ? SITE_URL + '/' : SITE_URL + route;
    assert.match(html, new RegExp(`rel="canonical" href="${canonical.replaceAll('.', '\\.')}`));
    assert.match(html, new RegExp(`property="og:url" content="${canonical.replaceAll('.', '\\.')}`));
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
    assert.match(html, /property="og:image" content="https:\/\/www\.ghostframestudios\.com\/og\.png"/);
    assert.match(html, /src="\/src\/site\.js"/);
    assert.match(html, /href="\/favicon\.svg"/);
    assert.doesNotMatch(html, /ghostframe-inky\.vercel\.app/);
  }
});

test('homepage uses approved GhostGate positioning and release workflow', async () => {
  const html = await load('index.html');
  assert.match(html, /GHOSTFRAME PRESENTS/i);
  assert.match(html, /Pre-Production Trust Infrastructure for AI Agents/);
  assert.match(html, /Decide which exact AI-agent versions are ready for production, under what conditions, and based on what evidence\./);
  assert.match(html, /Request a 20-Minute Technical Review/);
  assert.match(html, /View Technical Proof/);
  for (const stage of ['Agent Development', 'Exact Version Registration', 'Qualification', 'Security and Human Review', 'Signed Deployment Attestation', 'Production Admission', 'Monitoring, Containment, and Re-entry']) {
    assert.match(html, new RegExp(stage));
  }
});

test('homepage publishes every required capability in buyer context', async () => {
  const html = await load('index.html');
  for (const capability of ['Immutable version registration', 'Exact manifests and configuration binding', 'Behavior DNA', 'mutation detection', 'drift detection', 'RiskChain causal analysis', 'blast-path analysis', 'graduated immune response', 'approval-bound enforcement', 'controlled re-entry', 'recurrence memory', 'failback', 'Fleet qualification', 'Cross-agent correlation', 'shared-identity analysis', 'shared-dependency analysis', 'outbreak-cluster analysis', 'Human release decisions', 'conditional qualification controls', 'Ed25519 deployment attestations', 'Material-change invalidation', 'Sanitized evidence archives']) {
    assert.match(html, new RegExp(capability, 'i'));
  }
});

test('proof page separates and labels controlled, deterministic, synthetic, and cryptographic evidence', async () => {
  const html = await load('proof/index.html');
  for (const category of ['Controlled live external proof', 'Local deterministic validation', 'Synthetic fleet capacity', 'Cryptographic verification']) assert.match(html, new RegExp(category));
  assert.match(html, /99\.5/);
  assert.match(html, /0\.99/);
  assert.match(html, /58/);
  assert.match(html, /533bbf249a12314f113932c2883c9fb625e4135ce096094f78020ea2d8b7b3a1/);
  assert.match(html, /263 \/ 263/);
  assert.match(html, /31 \/ 31/);
  assert.match(html, /1,000/);
  assert.match(html, /1,200/);
  assert.match(html, /1,201/);
  assert.match(html, /9,608/);
  assert.match(html, /10\.45 s/);
  assert.match(html, /114\.93/);
  assert.match(html, /77,242,368/);
  assert.match(html, /48,974,296/);
  assert.match(html, /Synthetic scale demonstrates architecture and deterministic processing capacity\. It is not equivalent to customer production-scale validation\./);
});

test('pilot page publishes the standard paid scope and commercial terms', async () => {
  const html = await load('pilot/index.html');
  assert.match(html, /GhostGate AI Agent Qualification Pilot/);
  assert.match(html, /\$32,000 USD/);
  for (const scope of ['UP TO TWO', 'UP TO FIVE', 'UP TO TEN', 'FORTY', 'FIVE', 'SIX WEEKS']) assert.match(html, new RegExp(scope));
  assert.match(html, /50 percent at kickoff and 50 percent at delivery/);
  assert.match(html, /additional agents, versions, scenarios, integrations, and workshops require a scope change/i);
  assert.doesNotMatch(html, /\$22,000/);
});

test('security page publishes honest human-authority and product boundaries', async () => {
  const html = await load('security/index.html');
  for (const claim of ['does not guarantee universal or future safety', 'does not prove malicious intent', 'does not replace security teams', 'does not autonomously certify compliance', 'does not claim customer production validation yet', 'does not claim production fleet-scale validation', 'does not currently provide managed cloud hosting', 'SSO, SAML, SCIM, billing, cloud orchestration, or broad production deployment automation', 'does not require production secrets', 'Release authority remains with the customer']) assert.match(html, new RegExp(claim, 'i'));
});

test('studio retains every existing project while keeping GhostGate primary', async () => {
  const studio = await load('studio/index.html');
  for (const project of ['GhostGate', 'Proofline', 'Breach Escape', 'Livery Forge']) assert.match(studio, new RegExp(project));
  const home = await load('index.html');
  assert.doesNotMatch(home, /Breach Escape|Livery Forge/);
});

test('review CTA uses one centralized email and approved prepared content', async () => {
  const [script, contact] = await Promise.all([load('src/site.js'), load('contact/index.html')]);
  const mailto = buildReviewMailto();
  assert.equal(CONTACT_EMAIL, 'klicker01@gmail.com');
  assert.equal(REVIEW_SUBJECT, 'GhostGate Technical Review Request');
  assert.match(REVIEW_BODY, /Company:\nRole:\nAgent use case:/);
  assert.ok(mailto.startsWith(`mailto:${CONTACT_EMAIL}?subject=`));
  assert.match(script, /buildReviewMailto/);
  assert.match(contact, /data-review-link/);
  assert.match(contact, /No submission form/);
  assert.equal((await Promise.all(commercialRoutes.map(([file]) => load(file)))).join('').includes(CONTACT_EMAIL), false);
});

test('navigation runtime supports mobile closing, Escape, focus, and reduced motion', async () => {
  const [script, css] = await Promise.all([load('src/site.js'), load('src/commercial.css')]);
  assert.match(script, /menuButton\?\.addEventListener\('click'/);
  assert.match(script, /closest\('a'\).*setMenu\(false\)/);
  assert.match(script, /Escape/);
  assert.match(script, /aria-expanded/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /overflow-x: clip/);
});

test('SEO support files use the canonical production domain', async () => {
  const [robots, sitemap] = await Promise.all([load('public/robots.txt'), load('public/sitemap.xml')]);
  assert.match(robots, /https:\/\/www\.ghostframestudios\.com\/sitemap\.xml/);
  for (const [, route] of commercialRoutes) {
    const url = route === '/' ? `${SITE_URL}/` : `${SITE_URL}${route}`;
    assert.ok(sitemap.includes(`<loc>${url}</loc>`));
  }
});

test('public copy avoids unsupported commercial claims and private paths', async () => {
  const files = await Promise.all([...commercialRoutes.map(([file]) => load(file)), load('proofline/index.html'), load('ghostgate/evidence/index.html')]);
  const copy = files.join('\n');
  assert.doesNotMatch(copy, /trusted by|customer logo|testimonial|fortune 500|military-grade|unhackable|game-changing|revolutionary|AI antivirus|proven at enterprise production scale/i);
  assert.doesNotMatch(copy, /[A-Z]:\\|ghostframe-inky\.vercel\.app/);
});

test('Vercel security headers and legacy server endpoint remain configured', async () => {
  const config = JSON.parse(await load('vercel.json'));
  const headers = Object.fromEntries(config.headers[0].headers.map(item => [item.key, item.value]));
  assert.match(headers['Content-Security-Policy'], /default-src 'self'/);
  assert.match(headers['Content-Security-Policy'], /object-src 'none'/);
  assert.match(headers['Content-Security-Policy'], /frame-ancestors 'none'/);
  assert.equal(headers['Strict-Transport-Security'], 'max-age=63072000; includeSubDomains; preload');
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(typeof (await import('../api/pilot-request.js')).POST, 'function');
});
