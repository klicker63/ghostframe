import assert from 'node:assert/strict';
import test from 'node:test';
import { handlePilotRequest } from '../api/pilot-request.js';

const validPayload = {
  name: 'Ada Example',
  email: 'ada@example.com',
  company: 'Example Security',
  role: 'Security Lead',
  agentProduct: 'Review Agent',
  access: 'GitHub issues and pull requests',
  stage: 'Enterprise pilot',
  outcome: 'Validate least-privilege behavior',
  message: 'Controlled evaluation only',
  website: '',
  consent: true,
};

const validEnv = {
  RESEND_API_KEY: 'test-provider-key',
  PILOT_TO_EMAIL: 'pilot@example.com',
  PILOT_FROM_EMAIL: 'GhostFrame <pilot@example.com>',
};

function requestFor(payload = validPayload, options = {}) {
  const method = options.method ?? 'POST';
  const headers = new Headers(options.headers ?? {});
  if (method === 'POST' && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  return new Request('https://example.com/api/pilot-request', {
    method,
    headers,
    body: method === 'POST' ? (options.body ?? JSON.stringify(payload)) : undefined,
  });
}

test('pilot endpoint accepts POST only', async () => {
  const response = await handlePilotRequest(requestFor(validPayload, { method: 'GET' }), { env: validEnv });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
});

test('pilot endpoint requires JSON', async () => {
  const response = await handlePilotRequest(requestFor(validPayload, {
    headers: { 'content-type': 'text/plain' },
    body: 'hello',
  }), { env: validEnv });
  assert.equal(response.status, 415);
});

test('pilot endpoint rejects malformed JSON', async () => {
  const response = await handlePilotRequest(requestFor(validPayload, { body: '{' }), { env: validEnv });
  assert.equal(response.status, 400);
});

test('pilot endpoint validates required fields, email, stage, and consent', async () => {
  const cases = [
    [{ ...validPayload, name: '' }, /required/i],
    [{ ...validPayload, email: 'not-an-email' }, /valid work email/i],
    [{ ...validPayload, stage: 'Unknown' }, /valid deployment stage/i],
    [{ ...validPayload, consent: false }, /sensitive information/i],
  ];
  for (const [payload, expected] of cases) {
    const response = await handlePilotRequest(requestFor(payload), { env: validEnv });
    assert.equal(response.status, 422);
    assert.match((await response.json()).error, expected);
  }
});

test('pilot endpoint rejects overlong fields and payloads', async () => {
  const fieldResponse = await handlePilotRequest(requestFor({
    ...validPayload,
    name: 'x'.repeat(101),
  }), { env: validEnv });
  assert.equal(fieldResponse.status, 422);

  const body = JSON.stringify({ ...validPayload, message: 'x'.repeat(25_000) });
  const payloadResponse = await handlePilotRequest(requestFor(validPayload, { body }), { env: validEnv });
  assert.equal(payloadResponse.status, 413);
});

test('pilot endpoint rejects honeypot, URL spam, and cross-site submissions', async () => {
  const honeypot = await handlePilotRequest(requestFor({ ...validPayload, website: 'bot.example' }), { env: validEnv });
  assert.equal(honeypot.status, 422);

  const spam = await handlePilotRequest(requestFor({
    ...validPayload,
    message: 'https://a.example https://b.example https://c.example https://d.example',
  }), { env: validEnv });
  assert.equal(spam.status, 422);

  const crossSite = await handlePilotRequest(requestFor(validPayload, {
    headers: { 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' },
  }), { env: validEnv });
  assert.equal(crossSite.status, 403);
});

test('pilot endpoint fails safely when provider configuration is absent', async () => {
  let called = false;
  const response = await handlePilotRequest(requestFor(), {
    env: {},
    fetchImpl: async () => {
      called = true;
      return new Response();
    },
  });
  assert.equal(response.status, 503);
  assert.equal(called, false);
  assert.match((await response.json()).error, /direct email option/i);
});

test('pilot endpoint escapes HTML and sends a plain-text copy', async () => {
  let providerBody;
  const payload = {
    ...validPayload,
    name: '<script>alert("x")</script>',
    message: '<img src=x onerror=alert(1)>',
  };
  const response = await handlePilotRequest(requestFor(payload), {
    env: validEnv,
    fetchImpl: async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails');
      assert.match(options.headers.Authorization, /^Bearer /);
      providerBody = JSON.parse(options.body);
      return new Response('{}', { status: 200 });
    },
  });

  assert.equal(response.status, 200);
  assert.doesNotMatch(providerBody.html, /<script>|<img /);
  assert.match(providerBody.html, /&lt;script&gt;/);
  assert.match(providerBody.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(providerBody.text, /<script>/);
  assert.equal(providerBody.reply_to, validPayload.email);
});

test('pilot endpoint returns no-store JSON on success', async () => {
  const response = await handlePilotRequest(requestFor(), {
    env: validEnv,
    fetchImpl: async () => new Response('{}', { status: 200 }),
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await response.json(), {
    ok: true,
    message: 'Your private-pilot request was sent to GhostFrame Studios.',
  });
});

test('pilot endpoint returns a safe fallback message on provider failure', async () => {
  const response = await handlePilotRequest(requestFor(), {
    env: validEnv,
    fetchImpl: async () => new Response('{}', { status: 429 }),
  });
  assert.equal(response.status, 502);
  const body = await response.json();
  assert.match(body.error, /direct email option/i);
  assert.doesNotMatch(JSON.stringify(body), /test-provider-key|ada@example\.com/);
});