import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { buildReviewMailto, CONTACT_EMAIL, REVIEW_BODY, REVIEW_SUBJECT, SITE_URL } from '../src/config.js';

const root = path.resolve(import.meta.dirname, '..');
const load = file => readFile(path.join(root, file), 'utf8');
const commercialRoutes = [
  ['index.html', '/'],
  ['work/index.html', '/work/'],
  ['labs/index.html', '/labs/'],
  ['about/index.html', '/about/'],
  ['demon-core/index.html', '/demon-core/'],
  ['ghostgate/index.html', '/ghostgate/'],
  ['ghostgate/release-check/index.html', '/ghostgate/release-check/'],
  ['tools/agent-release-readiness/index.html', '/tools/agent-release-readiness/'],
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
    const studioRoutes = ['/', '/work/', '/labs/', '/about/', '/demon-core/', '/studio/', '/contact/'];
    const ogImage = studioRoutes.includes(route) ? 'og-ghostframe-studios.png' : ['/ghostgate/release-check/', '/tools/agent-release-readiness/'].includes(route) ? 'og-release-check.png' : 'og.png';
    assert.match(html, new RegExp(`property="og:image" content="https:\\/\\/www\\.ghostframestudios\\.com\\/${ogImage.replace('.', '\\.')}"`));
    assert.match(html, /src="\/src\/site\.js"/);
    assert.match(html, /href="\/favicon\.svg"/);
    assert.doesNotMatch(html, /ghostframe-inky\.vercel\.app/);
  }
});

test('homepage presents GhostFrame as the company and features a multi-domain portfolio', async () => {
  const html = await load('index.html');
  assert.match(html, /GhostFrame Studios \| We Build What Should Exist/);
  assert.match(html, /We build what should exist\./i);
  assert.match(html, /Original software for problems without good answers/);
  assert.match(html, /AI, cybersecurity, simulation, and creative technology/);
  for (const product of ['Demon Core', 'GhostGate', 'Proofline', 'GhostFrame Recall', 'Breach Escape', 'Livery Forge']) assert.match(html, new RegExp(product));
  for (const route of ['/work/', '/labs/', '/about/', '/contact/']) assert.match(html, new RegExp(`href="${route}"`));
  assert.match(html, /Research program/);
  assert.match(html, /Controlled pilot/);
  assert.match(html, /Private-pilot evaluation/);
  assert.match(html, /Research preview/);
  assert.match(html, /Playable prototype/);
  assert.match(html, /Active research/);
  assert.match(html, /href="\/demon-core\/"/);
  assert.match(html, /href="\/ghostgate\/"/);
  assert.match(html, /href="\/proofline\/"/);
});

test('homepage communicates the studio manifesto, evidence principles, and work-with path', async () => {
  const html = await load('index.html');
  assert.match(html, /GhostFrame builds the missing systems\./);
  for (const principle of ['Build the hard part first', 'Prove what actually works', 'State limitations clearly', 'Kill weak ideas']) assert.match(html, new RegExp(principle));
  assert.match(html, /Maturity is labeled directly; research is not dressed up as production\./);
  assert.match(html, /works selectively on technical evaluations, controlled pilots, and unusual engineering problems/i);
  assert.match(html, /href="\/contact\/"/);
  assert.match(html, /hello@ghostframestudios\.com/);
});

test('Demon Core is a distinct research environment with honest interface boundaries', async () => {
  const [html, script] = await Promise.all([load('demon-core/index.html'), load('src/demon-core.js')]);
  assert.match(html, /Everything beyond this point is designed to fail\./);
  assert.match(html, /research program/i);
  assert.match(html, /does not represent a live run or production deployment/i);
  assert.match(html, /visual storytelling devices/);
  assert.match(html, /not live telemetry/i);
  for (const state of ['18', '37', '61', '78', '84', '92', '97', '100']) assert.match(html, new RegExp(`data-load="${state}"`));
  assert.match(script, /prefers-reduced-motion/);
  assert.match(script, /dataset\.critical/);
});

test('Possession remains inside Demon Core and Demon Chain exposes only a restricted teaser', async () => {
  const html = await load('demon-core/index.html');
  assert.match(html, /Campaign family \/ Persistent influence/);
  assert.match(html, /Possession is the Demon Core campaign model/);
  for (const stage of ['CONTAMINATE', 'DORMANCY', 'TRIGGER', 'MANIFEST', 'PROPAGATE', 'EXORCISE', 'VERIFY']) assert.match(html, new RegExp(stage));
  assert.match(html, /ANOMALOUS PERSISTENCE DETECTED/);
  assert.match(html, /Demon Chain/);
  assert.match(html, /Some failures don’t stay where they started\./);
  assert.match(html, /Restricted \/\/ Concept in development/);
  assert.doesNotMatch(html, /Demon Chain[^<]{0,120}(?:architecture|feature|capability|platform)/i);
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

test('Release Check route publishes the fixed price, scope, delivery gate, and payment terms', async () => {
  const html = await load('ghostgate/release-check/index.html');
  assert.match(html, /Independently verify your AI agent before release\./);
  assert.match(html, /\$5,000/);
  assert.match(html, /50% at kickoff \/ 50% at delivery/);
  assert.match(html, /Seven business days/);
  assert.match(html, /delivery target starts only after GhostFrame confirms intake readiness/i);
  for (const scope of ['One AI agent', 'One exact agent version or immutable build', 'One test environment or supported adapter', 'One tool and permission configuration', 'One policy baseline', 'Up to 20 agreed']) {
    assert.match(html, new RegExp(scope));
  }
  assert.doesNotMatch(html, /\$5,000[^\n]{0,80}(?:per month|starting at)/i);
});

test('Release Check route publishes exact verdict wording and version-bound limitations', async () => {
  const html = await load('ghostgate/release-check/index.html');
  for (const wording of [
    'The tested version completed the agreed assessment without release-blocking findings under the tested configuration.',
    'The version may proceed only with documented restrictions, approvals, or Permission Envelope controls.',
    'The tested version demonstrated behavior or access paths that should prevent release until remediated and retested.',
  ]) assert.ok(html.includes(wording));
  assert.match(html, /a verdict does not transfer to a materially changed version or configuration/i);
  for (const change of ['model', 'system instructions', 'tool access', 'permissions', 'agent code', 'orchestration', 'retrieval sources', 'memory behavior', 'policy baseline', 'deployment configuration']) {
    assert.match(html, new RegExp(change, 'i'));
  }
  assert.match(html, /not a guarantee of present or future safety/i);
  assert.match(html, /No guarantee of safety, compliance certification, or legal opinion/);
  assert.match(html, /Human review remains required/);
});

test('Release Check form exposes every bounded intake field and accessible status states', async () => {
  const html = await load('ghostgate/release-check/index.html');
  for (const name of ['name', 'email', 'company', 'companyWebsite', 'agentProduct', 'agentPurpose', 'stage', 'tools', 'sandbox', 'desiredDate', 'reason', 'additionalContext', 'website', 'consent']) {
    assert.match(html, new RegExp(`name="${name}"`));
  }
  assert.match(html, /data-release-check-form/);
  assert.match(html, /action="\/api\/release-check-request"/);
  assert.match(html, /data-form-status role="alert" tabindex="-1"/);
  assert.match(html, /data-form-success tabindex="-1"/);
  assert.match(html, /Do not submit secrets/);
  assert.match(html, /does not create a binding engagement or promise acceptance/i);
  assert.match(html, /GhostFrame reviews the submitted scope, confirms whether the agent can be assessed under the fixed package, and responds with intake requirements and next steps\./);
});

test('GhostGate commercial pages expose the Release Check, private pilot, and evidence hierarchy', async () => {
  const files = ['ghostgate/index.html', 'proof/index.html', 'pilot/index.html', 'contact/index.html', 'ghostgate/evidence/index.html'];
  for (const file of files) {
    const html = await load(file);
    assert.match(html, /href="\/ghostgate\/release-check\//, file);
    assert.match(html, /href="\/pilot\//, file);
    assert.match(html, /href="\/ghostgate\/evidence\//, file);
  }

  const [pilot, evidence] = await Promise.all([load('pilot/index.html'), load('ghostgate/evidence/index.html')]);
  assert.match(pilot, /\$32,000 USD/);
  assert.match(evidence, /data-evidence-root/);
});

test('security page publishes honest human-authority and product boundaries', async () => {
  const html = await load('security/index.html');
  for (const claim of ['does not guarantee universal or future safety', 'does not prove malicious intent', 'does not replace security teams', 'does not autonomously certify compliance', 'does not claim customer production validation yet', 'does not claim production fleet-scale validation', 'does not currently provide managed cloud hosting', 'SSO, SAML, SCIM, billing, cloud orchestration, or broad production deployment automation', 'does not require production secrets', 'Release authority remains with the customer']) assert.match(html, new RegExp(claim, 'i'));
});

test('studio hierarchy keeps GhostFrame primary while retaining every documented project', async () => {
  const [studio, work, labs] = await Promise.all([load('studio/index.html'), load('work/index.html'), load('labs/index.html')]);
  for (const project of ['Demon Core', 'GhostGate', 'Proofline', 'Recall', 'Breach Escape', 'Livery Forge']) assert.match(studio + work + labs, new RegExp(project));
  assert.match(studio, /GhostFrame is bigger than any one system\./);
  assert.match(work, /GhostGate proof remains intact\./);
});

test('review CTA uses one centralized email and approved prepared content', async () => {
  const [script, contact, home] = await Promise.all([load('src/site.js'), load('contact/index.html'), load('index.html')]);
  const mailto = buildReviewMailto();
  assert.equal(CONTACT_EMAIL, 'hello@ghostframestudios.com');
  assert.equal(REVIEW_SUBJECT, 'GhostGate Technical Review Request');
  assert.match(REVIEW_BODY, /Company:\nRole:\nAgent use case:/);
  assert.ok(mailto.startsWith(`mailto:${CONTACT_EMAIL}?subject=`));
  assert.match(script, /buildReviewMailto/);
  assert.match(contact, /data-review-link/);
  assert.match(contact, /No submission form/);
  assert.match(home, /hello@ghostframestudios\.com/);
  assert.match(contact, /GhostFrame%20Studio%20Inquiry/);
});

test('navigation runtime supports mobile closing, Escape, focus, and reduced motion', async () => {
  const [script, commercialCss, portfolioCss, ghostframeCss, demonCoreCss] = await Promise.all([load('src/site.js'), load('src/commercial.css'), load('src/portfolio.css'), load('src/ghostframe.css'), load('src/demon-core.css')]);
  const css = commercialCss + portfolioCss + ghostframeCss + demonCoreCss;
  assert.match(script, /menuButton\?\.addEventListener\('click'/);
  assert.match(script, /closest\('a'\).*setMenu\(false\)/);
  assert.match(script, /Escape/);
  assert.match(script, /aria-expanded/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /overflow-x: clip/);
  assert.match(css, /evidence-pulse/);
});

test('SEO support files use the canonical production domain', async () => {
  const [robots, sitemap] = await Promise.all([load('public/robots.txt'), load('public/sitemap.xml')]);
  assert.match(robots, /https:\/\/www\.ghostframestudios\.com\/sitemap\.xml/);
  for (const [, route] of commercialRoutes) {
    const url = route === '/' ? `${SITE_URL}/` : `${SITE_URL}${route}`;
    assert.ok(sitemap.includes(`<loc>${url}</loc>`));
  }
});

test('integrated pilot assets retain real contact details and print-safe page structures', async () => {
  const [sheet, sheetCss, deck, deckCss] = await Promise.all([
    load('public/commercial/ghostframe-integrated-pilot.html'),
    load('public/commercial/ghostframe-integrated-pilot.css'),
    load('public/commercial/ghostframe-integrated-pilot-deck.html'),
    load('public/commercial/ghostframe-integrated-pilot-deck.css'),
  ]);
  const files = sheet + sheetCss + deck + deckCss;
  assert.match(files, /hello@ghostframestudios\.com/);
  assert.doesNotMatch(files, /ghostframe\.example|contact@|\[Name\]|\[Title\]/i);
  assert.match(sheet, /GhostFrame%20Integrated%20Security%20Pilot/);
  assert.equal((deck.match(/class="slide /g) ?? []).length, 6);
  assert.match(sheetCss + deckCss, /@media print/);
  assert.match(sheetCss + deckCss, /@page/);
});

test('public copy avoids unsupported commercial claims and private paths', async () => {
  const files = await Promise.all([...commercialRoutes.map(([file]) => load(file)), load('proofline/index.html'), load('ghostgate/evidence/index.html')]);
  const copy = files.join('\n');
  assert.doesNotMatch(copy, /trusted by|customer logo|testimonial|fortune 500|military-grade|unhackable|game-changing|revolutionary|AI antivirus|proven at enterprise production scale/i);
  assert.doesNotMatch(copy, /[A-Z]:\\|ghostframe-inky\.vercel\.app/);
  assert.doesNotMatch(copy, /AgentAV|Agent AB/i);
  assert.doesNotMatch(copy, /GhostGate (?:guarantees safety|provides compliance certification|certifies compliance)/i);
});

test('Vercel security headers and server endpoints remain configured', async () => {
  const config = JSON.parse(await load('vercel.json'));
  const headers = Object.fromEntries(config.headers[0].headers.map(item => [item.key, item.value]));
  assert.match(headers['Content-Security-Policy'], /default-src 'self'/);
  assert.match(headers['Content-Security-Policy'], /object-src 'none'/);
  assert.match(headers['Content-Security-Policy'], /frame-ancestors 'none'/);
  assert.equal(headers['Strict-Transport-Security'], 'max-age=63072000; includeSubDomains; preload');
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(typeof (await import('../api/pilot-request.js')).POST, 'function');
  assert.equal(typeof (await import('../api/release-check-request.js')).POST, 'function');
  assert.equal(typeof (await import('../api/readiness-lead.js')).POST, 'function');
});
