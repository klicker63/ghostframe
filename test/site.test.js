import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildPilotMailto, PILOT_EMAIL } from '../src/pilot-mail.js';

const pages = ['index.html', 'ghostgate/index.html', 'proofline/index.html'];
const load = page => readFile(new URL(`../${page}`, import.meta.url), 'utf8');

for (const page of pages) {
  test(`${page} has production metadata and safe links`, async () => {
    const html = await load(page);
    assert.match(html, /<title>.+<\/title>/);
    assert.match(html, /name="description"/);
    assert.match(html, /rel="canonical" href="https:\/\/ghostframe-inky\.vercel\.app\//);
    assert.match(html, /property="og:url"/);
    assert.doesNotMatch(html, /href="#"/);
    assert.doesNotMatch(html, /[A-Z]:\\/);
    assert.doesNotMatch(html, /placeholder\.com|placehold\.co|unsplash\.com/);
  });
}

test('all production routes remain configured', async () => {
  const config = await load('vite.config.js');
  assert.match(config, /ghostgate\/index\.html/);
  assert.match(config, /proofline\/index\.html/);
});

test('homepage leads with the concrete GhostGate buyer proposition', async () => {
  const home = await load('index.html');
  assert.match(home, /Crash-test AI agents before production does it for you\./);
  assert.match(home, /controlled hostile scenarios/);
  assert.match(home, /records how they use tools and permissions/);
  assert.match(home, /Request a Private Pilot/);
  assert.match(home, /See How GhostGate Works/);
  const body = home.slice(home.indexOf('<body'));
  assert.ok(body.indexOf('GhostGate places AI agents') < body.indexOf('Proofline'));
});

test('homepage preserves GhostFrame and the legitimate studio portfolio', async () => {
  const home = await load('index.html');
  assert.match(home, /GhostFrame Studios/);
  assert.match(home, /GhostGate is the flagship product/);
  for (const product of ['Proofline', 'Breach Escape', 'Livery Forge']) assert.match(home, new RegExp(product));
  assert.match(home, /href="\/proofline\/"/);
});

test('GhostGate route follows the buyer journey and exposes section navigation', async () => {
  const ghostgate = await load('ghostgate/index.html');
  const ids = ['problem', 'process', 'evaluate', 'evidence', 'fit', 'boundaries', 'pilot'];
  for (const id of ids) {
    assert.match(ghostgate, new RegExp(`href="#${id}"`));
    assert.match(ghostgate, new RegExp(`id="${id}"`));
  }
  const positions = ids.map(id => ghostgate.indexOf(`id="${id}"`));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
});

test('GhostGate explains hostile coverage, evaluation areas, and evidence outputs', async () => {
  const ghostgate = await load('ghostgate/index.html');
  for (const threat of ['Prompt injection', 'Poisoned tool results', 'Permission confusion', 'Fragmented data exfiltration', 'Malicious repository content']) assert.match(ghostgate, new RegExp(threat));
  for (const area of ['Tool-use behavior', 'Approval handling', 'Recovery after blocks', 'Poisoned context', 'Evidence completeness']) assert.match(ghostgate, new RegExp(area));
  for (const output of ['Agent Trust Report', 'Permission Envelope', 'behavior-timeline.json', 'findings.json', 'scenario-results.json', 'evaluation-metadata.json']) assert.match(ghostgate, new RegExp(output, 'i'));
});

test('private pilot form requests only useful qualification fields', async () => {
  const ghostgate = await load('ghostgate/index.html');
  assert.match(ghostgate, /data-pilot-form/);
  for (const name of ['name', 'email', 'company', 'role', 'access', 'stage', 'goal']) assert.match(ghostgate, new RegExp(`name="${name}"`));
  assert.doesNotMatch(ghostgate, /name="(phone|address|budget|password)"/i);
  assert.match(ghostgate, /Submitting this form opens a pre-addressed email/);
  assert.match(ghostgate, /mailto:klicker01@gmail\.com\?subject=GhostGate%20Private%20Pilot%20Inquiry/);
});

test('pilot mail builder safely encodes all qualification details', () => {
  const href = buildPilotMailto({ name: 'Ada Example', email: 'ada@example.com', company: 'Example & Co', role: 'Security Lead', access: 'GitHub + internal APIs', stage: 'Enterprise pilot', goal: 'Evaluate prompt injection & permission retries' });
  assert.ok(href.startsWith(`mailto:${PILOT_EMAIL}?subject=`));
  assert.ok(href.includes('Example%20%26%20Co'));
  assert.ok(href.includes('GitHub%20%2B%20internal%20APIs'));
  assert.ok(href.includes('prompt%20injection%20%26%20permission%20retries'));
  assert.doesNotMatch(href, /\n|\r/);
});

test('beta boundaries avoid guarantees and certification claims', async () => {
  const [home, ghostgate] = await Promise.all([load('index.html'), load('ghostgate/index.html')]);
  const publicCopy = home + ghostgate;
  assert.match(ghostgate, /does not certify compliance/);
  assert.match(ghostgate, /does not guarantee safe production behavior/);
  assert.match(ghostgate, /Universal framework integration is not claimed/);
  assert.doesNotMatch(publicCopy, /68 scenarios|49 automated tests|100% safe|guarantees? complete safety|certified compliant/i);
  assert.doesNotMatch(publicCopy, /trusted by|customer logo|testimonial|fortune 500/i);
});

test('navigation and form runtime include accessible interaction behavior', async () => {
  const script = await load('src/site.js');
  assert.match(script, /menuButton\?\.addEventListener\('click'/);
  assert.match(script, /closest\('a'\).*setMenu\(false\)/);
  assert.match(script, /Escape/);
  assert.match(script, /menu-open/);
  assert.match(script, /aria-expanded/);
  assert.match(script, /data-pilot-form/);
  assert.match(script, /checkValidity\(\)/);
  assert.match(script, /aria-invalid/);
  assert.match(script, /buildPilotMailto/);
});

test('Proofline buyer route remains intact', async () => {
  const proofline = await load('proofline/index.html');
  assert.match(proofline, /Know what they proved\. Not what they claimed\./);
  assert.match(proofline, /Synthetic example/);
  assert.match(proofline, /Internally validated\. External private pilot pending\./);
});
