import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { evidenceDisclaimer, evidenceProfiles } from '../src/evidence-profiles.js';
import { buildPilotMailto, PILOT_EMAIL } from '../src/pilot-mail.js';

const pages = ['index.html', 'ghostgate/index.html', 'ghostgate/evidence/index.html', 'proofline/index.html'];
const load = page => readFile(new URL('../' + page, import.meta.url), 'utf8');

for (const page of pages) {
  test(page + ' has production metadata and safe links', async () => {
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
  assert.match(config, /ghostgate\/evidence\/index\.html/);
  assert.match(config, /proofline\/index\.html/);
});

test('homepage leads with the tightened GhostGate buyer proposition', async () => {
  const home = await load('index.html');
  assert.match(home, /Crash-test AI agents before production does it for you\./);
  assert.match(home, /produces evidence for production-readiness decisions/);
  assert.doesNotMatch(home, /evidence showing whether they can be trusted in production/);
  assert.match(home, /Request a Private Pilot/);
  assert.match(home, /href="\/ghostgate\/evidence\/">View Sample Evidence/);
  const body = home.slice(home.indexOf('<body'));
  assert.ok(body.indexOf('GhostGate places AI agents') < body.indexOf('Proofline'));
});

test('homepage preserves the studio portfolio and adds verified founder context', async () => {
  const home = await load('index.html');
  assert.match(home, /GhostFrame Studios/);
  assert.match(home, /GhostGate is the flagship product/);
  for (const product of ['Proofline', 'Breach Escape', 'Livery Forge']) {
    assert.match(home, new RegExp(product));
  }
  assert.match(home, /Built by a U\.S\. Army veteran and cybersecurity professional\./);
  assert.match(home, /https:\/\/www\.linkedin\.com\/in\/alton-klick-324883420\//);
  assert.match(home, /rel="noopener noreferrer"/);
});

test('GhostGate route follows the buyer journey and exposes section navigation', async () => {
  const ghostgate = await load('ghostgate/index.html');
  const ids = ['problem', 'process', 'evaluate', 'evidence', 'fit', 'boundaries', 'pilot'];
  for (const id of ids) {
    assert.match(ghostgate, new RegExp('href="#' + id + '"'));
    assert.match(ghostgate, new RegExp('id="' + id + '"'));
  }
  const positions = ids.map(id => ghostgate.indexOf('id="' + id + '"'));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.match(ghostgate, /href="\/ghostgate\/evidence\/">View Sample Evidence/);
});

test('GhostGate explains hostile coverage, evaluation areas, and evidence outputs', async () => {
  const ghostgate = await load('ghostgate/index.html');
  for (const threat of ['Prompt injection', 'Poisoned tool results', 'Permission confusion', 'Fragmented data exfiltration', 'Malicious repository content']) {
    assert.match(ghostgate, new RegExp(threat));
  }
  for (const area of ['Tool-use behavior', 'Approval handling', 'Recovery after blocks', 'Poisoned context', 'Evidence completeness']) {
    assert.match(ghostgate, new RegExp(area));
  }
  for (const output of ['Agent Trust Report', 'Permission Envelope', 'behavior-timeline.json', 'findings.json', 'scenario-results.json', 'evaluation-metadata.json']) {
    assert.match(ghostgate, new RegExp(output, 'i'));
  }
});

test('published report previews use only the verified approved baseline', async () => {
  const [home, ghostgate] = await Promise.all([load('index.html'), load('ghostgate/index.html')]);
  const published = home + ghostgate;
  assert.match(published, /GitHub Sandbox Baseline/i);
  assert.match(published, /10 of 10 simulated scenarios passed/i);
  assert.match(published, /36 attempted actions/);
  assert.match(published, /0 findings/);
  assert.match(published, /No real GitHub API calls/);
  assert.doesNotMatch(published, /CONDITIONAL TRUST|FINDING \/ GG-004|Boundary escape|Blocked export retried/i);
});

test('sample evidence is config-driven and currently exposes one verified profile', () => {
  assert.equal(evidenceProfiles.length, 1);
  const profile = evidenceProfiles[0];
  assert.equal(profile.id, 'github-sandbox-approved');
  assert.equal(profile.publicSampleId, 'GG-PUBLIC-GH-SAFE-001');
  assert.equal(profile.result, 'Approved');
  assert.equal(profile.scenarios.length, 10);
  assert.equal(profile.metrics.find(item => item[0] === 'Attempted actions')[1], '36');
  assert.equal(profile.findings.count, 0);
  assert.equal(profile.permissionEnvelope.approvalRequired.length, 0);
  assert.equal(profile.permissionEnvelope.blocked.length, 0);
  assert.match(evidenceDisclaimer, /does not certify an agent or guarantee safe production behavior/);
});

test('sample evidence route has both buyer-useful views and clear disclosures', async () => {
  const [page, script, profiles] = await Promise.all([
    load('ghostgate/evidence/index.html'),
    load('src/evidence-page.js'),
    load('src/evidence-profiles.js'),
  ]);
  const evidenceCopy = page + script + profiles;
  for (const disclosure of ['Sanitized sample', 'GitHub Sandbox Baseline', 'Dry-run / mock GitHub environment', 'No real GitHub API calls', 'Approved baseline example', 'Human review required']) {
    assert.match(evidenceCopy, new RegExp(disclosure, 'i'));
  }
  assert.match(script, /Sanitized Agent Trust Report/);
  assert.match(script, /Sanitized Permission Envelope/);
  assert.match(script, /Coverage summary/);
  assert.match(script, /Behavior timeline excerpt/);
  assert.match(script, /IMPACT FINDINGS/);
  assert.match(script, /Copy YAML/);
  assert.match(script, /Download JSON/);
  assert.match(script, /Download YAML/);
  assert.match(script, /evidenceProfiles\.forEach/);
});

test('public evidence downloads match the approved sanitized facts', async () => {
  const report = JSON.parse(await load('public/evidence/github-sandbox-approved-report.json'));
  const envelope = await load('public/evidence/github-sandbox-approved-permission-envelope.yaml');
  assert.equal(report.sampleId, 'GG-PUBLIC-GH-SAFE-001');
  assert.equal(report.environment.realGitHubApiCalls, false);
  assert.equal(report.result.scenarioCount, 10);
  assert.equal(report.result.passedScenarios, 10);
  assert.equal(report.result.attemptedActions, 36);
  assert.equal(report.result.findingCount, 0);
  assert.equal(report.result.riskScore, 0);
  assert.equal(report.result.humanReviewRequired, true);
  assert.match(envelope, /observed_approval_required: \[\]/);
  assert.match(envelope, /observed_blocked: \[\]/);
  assert.match(envelope, /github\.read_issue/);
  assert.match(envelope, /policy\.read_internal_policy/);
});

test('private pilot form collects scoped fields, consent, and a direct fallback', async () => {
  const ghostgate = await load('ghostgate/index.html');
  assert.match(ghostgate, /data-pilot-form/);
  for (const name of ['name', 'email', 'company', 'role', 'agentProduct', 'access', 'stage', 'outcome', 'message', 'website', 'consent']) {
    assert.match(ghostgate, new RegExp('name="' + name + '"'));
  }
  assert.doesNotMatch(ghostgate, /name="(phone|address|budget|password)"/i);
  assert.match(ghostgate, /Do not submit passwords, API keys, customer records, proprietary prompts, or other sensitive data/);
  assert.match(ghostgate, /data-pilot-fallback/);
  assert.match(ghostgate, /mailto:klicker01@gmail\.com\?subject=GhostGate%20Private%20Pilot%20Inquiry/);
});

test('pilot mail builder safely encodes all qualification details', () => {
  const href = buildPilotMailto({
    name: 'Ada Example',
    email: 'ada@example.com',
    company: 'Example & Co',
    role: 'Security Lead',
    agentProduct: 'Review Agent',
    access: 'GitHub + internal APIs',
    stage: 'Enterprise pilot',
    outcome: 'Evaluate prompt injection & permission retries',
    message: 'No sensitive data',
  });
  assert.ok(href.startsWith('mailto:' + PILOT_EMAIL + '?subject='));
  assert.ok(href.includes('Example%20%26%20Co'));
  assert.ok(href.includes('Review%20Agent'));
  assert.ok(href.includes('GitHub%20%2B%20internal%20APIs'));
  assert.ok(href.includes('prompt%20injection%20%26%20permission%20retries'));
  assert.doesNotMatch(href, /\n|\r/);
});

test('navigation and form runtime include accessible interactions and API fallback', async () => {
  const script = await load('src/site.js');
  assert.match(script, /menuButton\?\.addEventListener\('click'/);
  assert.match(script, /closest\('a'\).*setMenu\(false\)/);
  assert.match(script, /Escape/);
  assert.match(script, /menu-open/);
  assert.match(script, /aria-expanded/);
  assert.match(script, /checkValidity\(\)/);
  assert.match(script, /aria-invalid/);
  assert.match(script, /fetch\('\/api\/pilot-request'/);
  assert.match(script, /application\/json/);
  assert.match(script, /data-pilot-fallback/);
  assert.match(script, /buildPilotMailto/);
  assert.match(script, /aria-busy/);
});

test('security headers constrain content, framing, permissions, and transport', async () => {
  const config = JSON.parse(await load('vercel.json'));
  const headers = Object.fromEntries(config.headers[0].headers.map(item => [item.key, item.value]));
  assert.match(headers['Content-Security-Policy'], /default-src 'self'/);
  assert.match(headers['Content-Security-Policy'], /object-src 'none'/);
  assert.match(headers['Content-Security-Policy'], /frame-ancestors 'none'/);
  assert.match(headers['Content-Security-Policy'], /connect-src 'self'/);
  assert.equal(headers['Strict-Transport-Security'], 'max-age=63072000; includeSubDomains; preload');
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['Cross-Origin-Opener-Policy'], 'same-origin');
});

test('beta boundaries avoid guarantees, certification, and unsupported social proof', async () => {
  const source = await Promise.all([
    load('index.html'),
    load('ghostgate/index.html'),
    load('ghostgate/evidence/index.html'),
    load('src/evidence-profiles.js'),
  ]);
  const publicCopy = source.join('');
  assert.match(publicCopy, /does not certify compliance/);
  assert.match(publicCopy, /does not guarantee safe production behavior/);
  assert.match(publicCopy, /Universal framework integration is not claimed/);
  assert.doesNotMatch(publicCopy, /68 scenarios|49 automated tests|100% safe|guarantees? complete safety|certified compliant/i);
  assert.doesNotMatch(publicCopy, /trusted by|customer logo|testimonial|fortune 500/i);
  assert.doesNotMatch(publicCopy, /AgentAV|Agent AB/i);
  assert.doesNotMatch(publicCopy, /[A-Z]:\\/);
});

test('Proofline buyer route remains intact', async () => {
  const proofline = await load('proofline/index.html');
  assert.match(proofline, /Know what they proved\. Not what they claimed\./);
  assert.match(proofline, /Synthetic example/);
  assert.match(proofline, /Internally validated\. External private pilot pending\./);
});