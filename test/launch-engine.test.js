import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parse, stringify } from 'yaml';
import { loadAndValidateManifest } from '../scripts/manifest-lib.mjs';

const root = path.resolve(import.meta.dirname, '..');
const manifestPath = path.join(root, 'launch', 'products', 'ghostgate.yaml');

async function withManifest(mutator, callback) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'ghostframe-manifest-'));
  try {
    const manifest = parse(await readFile(manifestPath, 'utf8'));
    mutator(manifest);
    const file = path.join(directory, 'product.yaml');
    await writeFile(file, stringify(manifest));
    await callback(file);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test('GhostGate product manifest validates against the JSON schema', async () => {
  const manifest = await loadAndValidateManifest(manifestPath);
  assert.equal(manifest.product_id, 'ghostgate');
  assert.equal(manifest.offers.length, 2);
  for (const field of ['seller_id', 'organization_id', 'referral_configuration', 'listing_visibility', 'moderation_state']) assert.ok(field in manifest);
});

test('manifest validation reports missing required fields', async () => {
  await withManifest(manifest => { delete manifest.core_promise; }, async file => {
    await assert.rejects(loadAndValidateManifest(file), /core_promise|required property/);
  });
});

test('manifest validation prevents prohibited claims', async () => {
  await withManifest(manifest => { manifest.public_claims.push(manifest.prohibited_claims[0]); }, async file => {
    await assert.rejects(loadAndValidateManifest(file), /prohibited public claim/i);
  });
});

test('manifest validation rejects product IDs that could create unsafe paths', async () => {
  await withManifest(manifest => { manifest.product_id = '../escape'; }, async file => {
    await assert.rejects(loadAndValidateManifest(file), /pattern/);
  });
});

test('generator creates every deterministic, human-review draft and refuses implicit overwrite', async () => {
  const first = spawnSync(process.execPath, ['scripts/generate-launch-package.mjs', 'launch/products/ghostgate.yaml', '--force'], { cwd: root, encoding: 'utf8' });
  assert.equal(first.status, 0, first.stderr);
  assert.match(first.stdout, /Generated 18 draft assets/);
  const directory = path.join(root, 'launch', 'generated', 'ghostgate');
  const productHuntBefore = await readFile(path.join(directory, 'product-hunt.md'), 'utf8');
  assert.match(productHuntBefore, /^> \*\*DRAFT — Human review required before publication\.\*\*/);
  const second = spawnSync(process.execPath, ['scripts/generate-launch-package.mjs', 'launch/products/ghostgate.yaml', '--force'], { cwd: root, encoding: 'utf8' });
  assert.equal(second.status, 0, second.stderr);
  assert.equal(await readFile(path.join(directory, 'product-hunt.md'), 'utf8'), productHuntBefore);
  const refused = spawnSync(process.execPath, ['scripts/generate-launch-package.mjs', 'launch/products/ghostgate.yaml'], { cwd: root, encoding: 'utf8' });
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /Refusing to overwrite/);
});

test('generated public drafts contain no configured prohibited claims', async () => {
  const manifest = await loadAndValidateManifest(manifestPath);
  const names = ['product-hunt.md', 'show-hn.md', 'reddit-value-first.md', 'technical-article-outline.md', 'github-readme-section.md', 'founder-announcement.md', 'short-social.md', 'long-social.md', 'community-permission-message.md', 'founder-outreach-email.md', 'three-day-follow-up.md', 'newsletter-pitch.md', 'podcast-pitch.md', 'demo-script.md', 'headlines-and-ctas.md', 'faq.md', 'utm-urls.md', 'launch-checklist.md'];
  for (const name of names) {
    const content = (await readFile(path.join(root, 'launch', 'generated', 'ghostgate', name), 'utf8')).toLowerCase();
    for (const claim of manifest.prohibited_claims) assert.ok(!content.includes(claim.toLowerCase()), `${name}: ${claim}`);
  }
});
