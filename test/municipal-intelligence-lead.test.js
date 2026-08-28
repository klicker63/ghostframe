import assert from 'node:assert/strict';
import test from 'node:test';
import { handleMunicipalIntelligenceLead } from '../api/municipal-intelligence-lead.js';

const validPayload = {
  name: 'Taylor Buyer',
  company: 'Example Acquisitions',
  email: 'taylor@example.com',
  phone: '+1 (813) 555-0100',
  customerRole: 'Real-estate investor',
  propertyAddress: '5034 N Nebraska Ave, Tampa, FL 33603',
  folioApn: '164840-0000',
  transactionStage: 'Initial review',
  intendedUse: 'Rental acquisition',
  propertyType: 'Commercial',
  decisionDeadline: '2026-09-10',
  knownConcern: 'Confirm permit and code-enforcement history.',
  requestedScope: [
    'Standard Tampa property and parcel research',
    'Building permits and code enforcement',
  ],
  otherScope: '',
  website: '',
  lawfulPurpose: true,
  privacyAcknowledgement: true,
};

const validEnv = {
  RESEND_API_KEY: 'test-provider-key',
  RELEASE_CHECK_TO_EMAIL: 'coverage@example.com',
  RELEASE_CHECK_FROM_EMAIL: 'GhostFrame <coverage@example.com>',
};

const fixedNow = () => new Date('2026-08-28T15:30:00.000Z');

function requestFor(payload = validPayload, options = {}) {
  const method = options.method ?? 'POST';
  const headers = new Headers(options.headers ?? {});
  if (method === 'POST' && !headers.has('content-type')) headers.set('content-type', 'application/json');
  return new Request('https://www.ghostframestudios.com/api/municipal-intelligence-lead', {
    method,
    headers,
    body: method === 'POST' ? (options.body ?? JSON.stringify(payload)) : undefined,
  });
}

function silentLogger() {
  return { info() {}, error() {} };
}

test('municipal lead endpoint accepts POST only and returns no-store JSON', async () => {
  const response = await handleMunicipalIntelligenceLead(requestFor(validPayload, { method: 'GET' }), { env: validEnv });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('content-type'), /application\/json/);
});

test('municipal lead endpoint rejects malformed, cross-site, and oversized requests', async () => {
  const wrongType = await handleMunicipalIntelligenceLead(requestFor(validPayload, { headers: { 'content-type': 'text/plain' } }), { env: validEnv });
  assert.equal(wrongType.status, 415);

  const malformed = await handleMunicipalIntelligenceLead(requestFor(validPayload, { body: '{' }), { env: validEnv });
  assert.equal(malformed.status, 400);

  const crossSite = await handleMunicipalIntelligenceLead(requestFor(validPayload, { headers: { 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' } }), { env: validEnv });
  assert.equal(crossSite.status, 403);

  const oversized = await handleMunicipalIntelligenceLead(requestFor(validPayload, { headers: { 'content-type': 'application/json', 'content-length': '30000' } }), { env: validEnv });
  assert.equal(oversized.status, 413);
});

test('municipal lead endpoint validates required, controlled, and acknowledged fields', async () => {
  const cases = [
    [{ ...validPayload, name: '' }, /required/i],
    [{ ...validPayload, email: 'not-an-email' }, /valid email/i],
    [{ ...validPayload, phone: 'call me maybe' }, /valid phone/i],
    [{ ...validPayload, customerRole: 'Unknown' }, /valid customer role/i],
    [{ ...validPayload, transactionStage: 'Unknown' }, /valid transaction stage/i],
    [{ ...validPayload, propertyType: 'Unknown' }, /valid property type/i],
    [{ ...validPayload, decisionDeadline: 'soon' }, /valid decision/i],
    [{ ...validPayload, propertyAddress: 'Tampa' }, /full Tampa property address/i],
    [{ ...validPayload, requestedScope: [] }, /at least one/i],
    [{ ...validPayload, requestedScope: ['Everything everywhere'] }, /invalid/i],
    [{ ...validPayload, lawfulPurpose: false }, /lawful property-related purpose/i],
    [{ ...validPayload, privacyAcknowledgement: false }, /privacy acknowledgment/i],
    [{ ...validPayload, website: 'bot.example' }, /could not be accepted/i],
    [{ ...validPayload, cardNumber: '4242424242424242' }, /not accepted/i],
  ];

  for (const [payload, expected] of cases) {
    const response = await handleMunicipalIntelligenceLead(requestFor(payload), { env: validEnv, logger: silentLogger() });
    assert.equal(response.status, 422, JSON.stringify(payload));
    assert.match((await response.json()).error, expected);
  }
});

test('municipal lead endpoint sends sanitized coverage-review email without creating payment state', async () => {
  let providerBody;
  const logs = [];
  const payload = {
    ...validPayload,
    name: '<script>alert(1)</script>',
    knownConcern: '<img src=x onerror=alert(1)>',
  };

  const response = await handleMunicipalIntelligenceLead(requestFor(payload), {
    env: validEnv,
    now: fixedNow,
    logger: { info(message, details) { logs.push([message, details]); }, error() {} },
    fetchImpl: async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails');
      assert.match(options.headers.Authorization, /^Bearer /);
      providerBody = JSON.parse(options.body);
      return new Response('{}', { status: 200 });
    },
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.match(body.submissionId, /^GF-MI-[A-F0-9]{16}$/);
  assert.equal(providerBody.to[0], validEnv.RELEASE_CHECK_TO_EMAIL);
  assert.equal(providerBody.reply_to, validPayload.email);
  assert.match(providerBody.text, /LEAD \/ COVERAGE REVIEW only/);
  assert.match(providerBody.text, /No external fee is authorized, no invoice is created, and no payment is recorded/);
  assert.doesNotMatch(providerBody.html, /<script>|<img /);
  assert.match(providerBody.html, /&lt;script&gt;/);
  assert.deepEqual(logs[0][1], { submissionId: body.submissionId, submittedAt: '2026-08-28T15:30:00.000Z' });
  assert.doesNotMatch(JSON.stringify(logs), /taylor@example\.com|5034 N Nebraska|test-provider-key/);
});

test('municipal-specific routing overrides the shared Resend routing without changing code', async () => {
  let providerBody;
  const response = await handleMunicipalIntelligenceLead(requestFor(), {
    env: {
      ...validEnv,
      MUNICIPAL_INTELLIGENCE_TO_EMAIL: 'municipal@example.com',
      MUNICIPAL_INTELLIGENCE_FROM_EMAIL: 'GhostFrame Municipal <municipal@example.com>',
    },
    logger: silentLogger(),
    fetchImpl: async (_url, options) => {
      providerBody = JSON.parse(options.body);
      return new Response('{}', { status: 200 });
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(providerBody.to, ['municipal@example.com']);
  assert.equal(providerBody.from, 'GhostFrame Municipal <municipal@example.com>');
});

test('municipal lead submission ID is deterministic for the same normalized request', async () => {
  const ids = [];
  const dependencies = {
    env: validEnv,
    now: fixedNow,
    logger: silentLogger(),
    fetchImpl: async () => new Response('{}', { status: 200 }),
  };
  for (let index = 0; index < 2; index += 1) {
    const response = await handleMunicipalIntelligenceLead(requestFor(validPayload), dependencies);
    ids.push((await response.json()).submissionId);
  }
  assert.equal(ids[0], ids[1]);

  const changed = await handleMunicipalIntelligenceLead(requestFor({ ...validPayload, propertyAddress: '100 E Madison St, Tampa, FL 33602' }), dependencies);
  assert.notEqual((await changed.json()).submissionId, ids[0]);
});

test('municipal lead endpoint fails safely when delivery configuration or provider is unavailable', async () => {
  const missing = await handleMunicipalIntelligenceLead(requestFor(), { env: {}, logger: silentLogger() });
  assert.equal(missing.status, 503);
  assert.match((await missing.json()).error, /direct email/i);

  const failed = await handleMunicipalIntelligenceLead(requestFor(), {
    env: validEnv,
    now: fixedNow,
    logger: silentLogger(),
    fetchImpl: async () => new Response('{}', { status: 429 }),
  });
  assert.equal(failed.status, 502);
  const body = await failed.json();
  assert.deepEqual(Object.keys(body), ['error']);
  assert.doesNotMatch(JSON.stringify(body), /test-provider-key|taylor@example\.com|5034 N Nebraska/);
});

test('municipal lead server routing contains no hardcoded customer address', async () => {
  const source = await import('node:fs/promises').then(fs => fs.readFile(new URL('../api/municipal-intelligence-lead.js', import.meta.url), 'utf8'));
  assert.match(source, /MUNICIPAL_INTELLIGENCE_TO_EMAIL/);
  assert.match(source, /MUNICIPAL_INTELLIGENCE_FROM_EMAIL/);
  assert.doesNotMatch(source, /hello@ghostframestudios\.com/i);
});
