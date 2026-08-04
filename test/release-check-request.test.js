import assert from 'node:assert/strict';
import test from 'node:test';
import { handleReleaseCheckRequest } from '../api/release-check-request.js';

const validPayload = {
  name: 'Ada Example',
  email: 'ada@example.com',
  company: 'Example Agent Systems',
  companyWebsite: 'https://example.com',
  agentProduct: 'Procurement Review Agent',
  agentPurpose: 'Reviews security questionnaires and drafts answers for human approval.',
  stage: 'Pre-production',
  tools: 'Read-only document retrieval and approval-bound ticket creation.',
  sandbox: 'Yes — ready now',
  desiredDate: '2026-09-15',
  reason: 'Enterprise customer request',
  additionalContext: 'The customer is reviewing the permission design.',
  website: '',
  consent: true,
};

const validEnv = {
  RESEND_API_KEY: 'test-provider-key',
  RELEASE_CHECK_TO_EMAIL: 'release-check@example.com',
  RELEASE_CHECK_FROM_EMAIL: 'GhostFrame <release-check@example.com>',
};

function requestFor(payload = validPayload, options = {}) {
  const method = options.method ?? 'POST';
  const headers = new Headers(options.headers ?? {});
  if (method === 'POST' && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  return new Request('https://example.com/api/release-check-request', {
    method,
    headers,
    body: method === 'POST' ? (options.body ?? JSON.stringify(payload)) : undefined,
  });
}

test('release-check endpoint accepts POST only and returns no-store JSON', async () => {
  const response = await handleReleaseCheckRequest(requestFor(validPayload, { method: 'GET' }), { env: validEnv });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('content-type'), /application\/json/);
});

test('release-check endpoint requires JSON and rejects malformed JSON', async () => {
  const wrongType = await handleReleaseCheckRequest(requestFor(validPayload, {
    headers: { 'content-type': 'text/plain' },
    body: 'hello',
  }), { env: validEnv });
  assert.equal(wrongType.status, 415);

  const malformed = await handleReleaseCheckRequest(requestFor(validPayload, { body: '{' }), { env: validEnv });
  assert.equal(malformed.status, 400);
});

test('release-check endpoint rejects every missing required field', async () => {
  const required = [
    'name', 'email', 'company', 'companyWebsite', 'agentProduct', 'agentPurpose',
    'stage', 'tools', 'sandbox', 'desiredDate', 'reason',
  ];

  for (const field of required) {
    const response = await handleReleaseCheckRequest(requestFor({ ...validPayload, [field]: '' }), { env: validEnv });
    assert.equal(response.status, 422, field);
    assert.match((await response.json()).error, /required/i, field);
  }
});

test('release-check endpoint validates work email, controlled options, date, website, and consent', async () => {
  const cases = [
    [{ ...validPayload, email: 'not-an-email' }, /valid work email/i],
    [{ ...validPayload, stage: 'Unknown' }, /valid development stage/i],
    [{ ...validPayload, sandbox: 'Production only' }, /valid sandbox/i],
    [{ ...validPayload, reason: 'Sales demo' }, /valid primary reason/i],
    [{ ...validPayload, desiredDate: 'soon' }, /valid desired assessment date/i],
    [{ ...validPayload, desiredDate: '2026-99-99' }, /valid desired assessment date/i],
    [{ ...validPayload, companyWebsite: 'localhost' }, /valid company website/i],
    [{ ...validPayload, companyWebsite: 'javascript:alert(1)' }, /valid company website/i],
    [{ ...validPayload, consent: false }, /no secrets or credentials/i],
  ];

  for (const [payload, expected] of cases) {
    const response = await handleReleaseCheckRequest(requestFor(payload), { env: validEnv });
    assert.equal(response.status, 422);
    assert.match((await response.json()).error, expected);
  }
});

test('release-check endpoint rejects overlong fields and oversized payloads', async () => {
  const overlong = await handleReleaseCheckRequest(requestFor({
    ...validPayload,
    name: 'x'.repeat(101),
  }), { env: validEnv });
  assert.equal(overlong.status, 422);

  const raw = JSON.stringify({ ...validPayload, additionalContext: 'x'.repeat(33_000) });
  const oversized = await handleReleaseCheckRequest(requestFor(validPayload, { body: raw }), { env: validEnv });
  assert.equal(oversized.status, 413);

  const declaredOversized = await handleReleaseCheckRequest(requestFor(validPayload, {
    headers: { 'content-type': 'application/json', 'content-length': '40000' },
  }), { env: validEnv });
  assert.equal(declaredOversized.status, 413);
});

test('release-check endpoint rejects honeypot, URL spam, spam patterns, and cross-site requests', async () => {
  const honeypot = await handleReleaseCheckRequest(requestFor({ ...validPayload, website: 'bot.example' }), { env: validEnv });
  assert.equal(honeypot.status, 422);

  const urlSpam = await handleReleaseCheckRequest(requestFor({
    ...validPayload,
    additionalContext: 'https://a.example https://b.example https://c.example https://d.example',
  }), { env: validEnv });
  assert.equal(urlSpam.status, 422);

  const patternSpam = await handleReleaseCheckRequest(requestFor({
    ...validPayload,
    agentPurpose: 'Buy backlinks for every page',
  }), { env: validEnv });
  assert.equal(patternSpam.status, 422);

  const crossSite = await handleReleaseCheckRequest(requestFor(validPayload, {
    headers: { 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' },
  }), { env: validEnv });
  assert.equal(crossSite.status, 403);
});

test('release-check endpoint sends sanitized HTML and a plain-text copy through mocked transport', async () => {
  let providerBody;
  const payload = {
    ...validPayload,
    name: '<script>alert("x")</script>',
    companyWebsite: 'example.com',
    additionalContext: '<img src=x onerror=alert(1)>',
  };

  const response = await handleReleaseCheckRequest(requestFor(payload), {
    env: validEnv,
    fetchImpl: async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails');
      assert.match(options.headers.Authorization, /^Bearer /);
      providerBody = JSON.parse(options.body);
      return new Response('{}', { status: 200 });
    },
  });

  assert.equal(response.status, 200);
  assert.equal(providerBody.to[0], validEnv.RELEASE_CHECK_TO_EMAIL);
  assert.equal(providerBody.reply_to, validPayload.email);
  assert.match(providerBody.text, /<script>/);
  assert.match(providerBody.text, /https:\/\/example\.com\//);
  assert.doesNotMatch(providerBody.html, /<script>|<img /);
  assert.match(providerBody.html, /&lt;script&gt;/);
  assert.match(providerBody.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
});

test('release-check endpoint succeeds with a mocked email transport', async () => {
  const response = await handleReleaseCheckRequest(requestFor(), {
    env: validEnv,
    fetchImpl: async () => new Response('{}', { status: 200 }),
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), {
    ok: true,
    message: 'GhostFrame received your Release Check request for scope review.',
  });
});

test('release-check endpoint fails safely when provider configuration is absent', async () => {
  let called = false;
  const response = await handleReleaseCheckRequest(requestFor(), {
    env: {},
    fetchImpl: async () => {
      called = true;
      return new Response();
    },
  });

  assert.equal(response.status, 503);
  assert.equal(called, false);
  const body = await response.json();
  assert.match(body.error, /direct email option/i);
  assert.doesNotMatch(JSON.stringify(body), /ada@example\.com|Procurement Review Agent|test-provider-key/);
});

test('release-check endpoint returns no secrets or intake values on provider failure', async () => {
  const response = await handleReleaseCheckRequest(requestFor(), {
    env: validEnv,
    fetchImpl: async () => new Response('{}', { status: 429 }),
  });

  assert.equal(response.status, 502);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.match(body.error, /direct email option/i);
  assert.doesNotMatch(JSON.stringify(body), /test-provider-key|ada@example\.com|Procurement Review Agent|release-check@example\.com/);
});

test('release-check endpoint returns a safe fallback after a transport exception', async () => {
  const response = await handleReleaseCheckRequest(requestFor(), {
    env: validEnv,
    fetchImpl: async () => { throw new Error('provider details must not escape'); },
  });

  assert.equal(response.status, 502);
  const body = await response.json();
  assert.deepEqual(Object.keys(body), ['error']);
  assert.match(body.error, /direct email option/i);
  assert.doesNotMatch(JSON.stringify(body), /provider details|test-provider-key/);
});
