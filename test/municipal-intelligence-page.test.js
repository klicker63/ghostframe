import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const load = file => readFile(path.join(root, file), 'utf8');

test('Municipal Intelligence product page publishes approved positioning, pricing, and quote-first workflow', async () => {
  const html = await load('work/municipal-intelligence/index.html');
  assert.match(html, /See the municipal red flags <span>before you commit to the property\.<\/span>/);
  assert.match(html, /included Tampa municipal and government sources/);
  assert.match(html, /\$99 \+ required government fees/);
  assert.match(html, /GhostFrame service fee<\/span><strong>\$99/);
  assert.match(html, /Typical current Tampa municipal fee<\/span><strong>\$25/);
  assert.match(html, /Typical total when that source applies<\/span><strong>\$124/);
  assert.match(html, /No subscription/);
  assert.match(html, /Exact property coverage and the exact government fee are confirmed before payment/);
  assert.match(html, /No paid external source is ordered without your authorization/);
  assert.match(html, /customer-specific invoice through Stripe/);
  assert.match(html, /delivered through Google Drive to the named recipient/);
  assert.match(html, /delivery link is scheduled to expire after 14 days/);
  assert.match(html, /restricted folder for that order/);
  assert.match(html, /Correction Request - \[Report ID\]/);
  assert.match(html, /hello@ghostframestudios\.com/);
  assert.match(html, /not published or opened to anyone with the link/);
  assert.doesNotMatch(html, /Buy Now|Instant Report|Clear This Property|Safe to Buy/i);
});

test('Municipal Intelligence readiness documentation names only the actual external gates', async () => {
  const readme = await load('README.md');
  for (const resolved of [
    'customer-specific Stripe invoices',
    'solo two-pass quality review',
    'recipient-specific Google Drive delivery',
    '14-day link expiration',
    'restricted per-order document folders',
  ]) assert.ok(readme.includes(resolved), resolved);
  for (const gate of [
    'professional reviewer reference',
    'professional review record reference',
    'production Resend routing',
    'current Tampa government fee',
    'current provider timing',
  ]) assert.ok(readme.includes(gate), gate);
  assert.doesNotMatch(readme, /READY_FOR_AJ_FINAL_CONFIGURATION/);
});

test('Municipal Intelligence product page explains evidence truth and report states', async () => {
  const html = await load('work/municipal-intelligence/index.html');
  for (const copy of [
    'A blocked source is not treated as “no records.”',
    'A pending government response stays pending.',
    'Research in progress',
    'PRELIMINARY',
    'Research complete',
    'FINAL',
    'Complete with customer-approved exclusions',
    'FINAL_WITH_EXCLUSIONS',
  ]) assert.ok(html.includes(copy), copy);
  assert.match(html, /uses automation where reliable and verified human research where government systems require it/);
  assert.match(html, /source, property or parcel binding, search time, factual status, and evidence reference/);
});

test('Municipal Intelligence intake includes only the bounded coverage-review fields and no checkout', async () => {
  const html = await load('work/municipal-intelligence/index.html');
  for (const name of [
    'name', 'company', 'email', 'phone', 'customerRole', 'propertyAddress', 'folioApn',
    'transactionStage', 'intendedUse', 'propertyType', 'decisionDeadline', 'knownConcern',
    'requestedScope', 'otherScope', 'lawfulPurpose', 'privacyAcknowledgement', 'website',
  ]) assert.match(html, new RegExp(`name="${name}"`), name);
  assert.match(html, /data-mi-intake-form/);
  assert.match(html, /action="\/api\/municipal-intelligence-lead"/);
  assert.match(html, /creates only a coverage-review lead/);
  assert.match(html, /This does not authorize a government fee/);
  assert.match(html, /No fee was authorized and no payment occurred/);
  assert.doesNotMatch(html, /name="(?:ssn|card|bank|password|governmentId)"/i);
  assert.doesNotMatch(html, /Stripe\.js|checkout\.sessions|PaymentIntent/i);
});

test('public sample remains redacted, validation-based, preliminary, and honest about pending paid work', async () => {
  const html = await load('work/municipal-intelligence/sample-report/index.html');
  for (const label of ['REDACTED', 'VALIDATION-BASED SAMPLE', 'PRELIMINARY']) assert.match(html, new RegExp(label));
  assert.match(html, /delegated Tampa municipal search was awaiting customer authorization and was not ordered/i);
  assert.match(html, /delegated paid source was not completed in this validation example/i);
  assert.match(html, /No conclusion about validity, priority, payoff, ownership, or other legal effect was made/);
  assert.match(html, /Evidence appendix/);
  assert.doesNotMatch(html, /customer name|payment record|operator identity|repository path|[A-Z]:\\/i);
});

test('Municipal routes publish canonical social metadata and appear in build and sitemap configuration', async () => {
  const [product, sample, vite, sitemap] = await Promise.all([
    load('work/municipal-intelligence/index.html'),
    load('work/municipal-intelligence/sample-report/index.html'),
    load('vite.config.js'),
    load('public/sitemap.xml'),
  ]);
  assert.match(product, /rel="canonical" href="https:\/\/www\.ghostframestudios\.com\/work\/municipal-intelligence\/"/);
  assert.match(product, /municipal property research|municipal and government sources/i);
  assert.match(sample, /rel="canonical" href="https:\/\/www\.ghostframestudios\.com\/work\/municipal-intelligence\/sample-report\/"/);
  assert.match(product + sample, /property="og:image" content="https:\/\/www\.ghostframestudios\.com\/og-ghostframe-studios\.png"/);
  assert.match(vite, /municipalIntelligence/);
  assert.match(vite, /municipalIntelligenceSample/);
  assert.match(sitemap, /\/work\/municipal-intelligence\/<\/loc>/);
  assert.match(sitemap, /\/work\/municipal-intelligence\/sample-report\/<\/loc>/);
});

test('homepage and Work page integrate Municipal Intelligence without removing existing systems', async () => {
  const [home, work] = await Promise.all([load('index.html'), load('work/index.html')]);
  assert.match(home, /GhostFrame Municipal Property Risk Report/);
  assert.match(home, /gf-system-municipal/);
  assert.match(work, /gf-route-card-municipal/);
  for (const product of ['Municipal Intelligence', 'Demon Core', 'GhostGate', 'Proofline', 'Recall']) {
    assert.match(home + work, new RegExp(product), product);
  }
});

test('Municipal public copy avoids unsupported transaction and coverage claims', async () => {
  const files = await Promise.all([
    load('work/municipal-intelligence/index.html'),
    load('work/municipal-intelligence/sample-report/index.html'),
    load('src/municipal-intelligence-form.js'),
  ]);
  const copy = files.join('\n');
  assert.doesNotMatch(copy, /property clear|safe to buy|safe to close|no liens|no liability|statewide coverage|fully automated|instant comprehensive report/i);
  assert.doesNotMatch(copy, /guaranteed completeness|guarantees completeness|title clearance|lien certification|legal advice/i);
  assert.doesNotMatch(copy, /trusted by|testimonial|paid customers?|statewide/i);
  assert.doesNotMatch(copy, /[A-Z]:\\|OWNER_CONFIGURATION_REQUIRED|business_configuration\.local/i);
});

test('Municipal entry-point links resolve to existing routes or same-page anchors', async () => {
  const pages = [
    ['index.html', '/'],
    ['work/index.html', '/work/'],
    ['work/municipal-intelligence/index.html', '/work/municipal-intelligence/'],
    ['work/municipal-intelligence/sample-report/index.html', '/work/municipal-intelligence/sample-report/'],
  ];

  for (const [file] of pages) {
    const html = await load(file);
    const hrefs = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map(match => match[1]);
    for (const href of hrefs) {
      if (/^(?:mailto:|https?:)/.test(href)) continue;
      if (href.startsWith('#')) {
        assert.match(html, new RegExp(`id="${href.slice(1)}"`), `${file}: ${href}`);
        continue;
      }
      const pathname = href.split(/[?#]/)[0];
      const target = pathname === '/' ? 'index.html' : `${pathname.replace(/^\//, '').replace(/\/$/, '')}/index.html`;
      await assert.doesNotReject(() => load(target), `${file}: ${href}`);
    }
  }
});

test('updated homepage structured data is allowed by the production content security policy', async () => {
  const [home, vercel] = await Promise.all([load('index.html'), load('vercel.json')]);
  const jsonLd = home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(jsonLd);
  const hash = createHash('sha256').update(jsonLd).digest('base64');
  const csp = JSON.parse(vercel).headers[0].headers.find(header => header.key === 'Content-Security-Policy').value;
  assert.ok(csp.includes(`'sha256-${hash}'`));
});
