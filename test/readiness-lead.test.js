import assert from 'node:assert/strict';
import test from 'node:test';
import { handleReadinessLead } from '../api/readiness-lead.js';

const validPayload = {
  fullName: 'Ada Example', email: 'ada@example.com', company: 'Example Systems', agentName: 'Release Agent',
  readinessCategory: 'Control gaps remain', context: 'We are planning a staging release.', website: '', consent: true,
  riskDimensions: ['permissions', 'approval', 'version'], correlationMarker: 'rr_1234567890',
};
const validEnv = { RESEND_API_KEY: 'provider-secret', READINESS_LEAD_TO_EMAIL: 'team@example.com', READINESS_LEAD_FROM_EMAIL: 'GhostFrame <forms@example.com>' };

function requestFor(payload = validPayload, options = {}) {
  const method = options.method ?? 'POST';
  const headers = new Headers(options.headers ?? {});
  if (method === 'POST' && !headers.has('content-type')) headers.set('content-type', 'application/json');
  return new Request('https://example.com/api/readiness-lead', { method, headers, body: method === 'POST' ? (options.body ?? JSON.stringify(payload)) : undefined });
}

test('readiness lead endpoint accepts POST only and returns no-store JSON', async () => {
  const response = await handleReadinessLead(requestFor(validPayload, { method: 'GET' }), { env: validEnv });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('readiness lead endpoint rejects invalid email, consent, category, dimensions, marker, and honeypot', async () => {
  const cases = [
    [{ ...validPayload, email: 'invalid' }, /valid work email/i],
    [{ ...validPayload, consent: false }, /consent/i],
    [{ ...validPayload, readinessCategory: 'Pass' }, /valid readiness category/i],
    [{ ...validPayload, riskDimensions: ['raw_answer'] }, /valid high-level risk/i],
    [{ ...validPayload, correlationMarker: '../bad' }, /valid correlation/i],
    [{ ...validPayload, website: 'bot.example' }, /could not be accepted/i],
  ];
  for (const [payload, message] of cases) {
    const response = await handleReadinessLead(requestFor(payload), { env: validEnv });
    assert.equal(response.status, 422);
    assert.match((await response.json()).error, message);
  }
});

test('readiness lead endpoint rejects full answers, spam, overlong fields, and oversized bodies', async () => {
  for (const extra of [{ answers: { authority: 'none' } }, { questions: [] }, { assessment: {} }]) {
    const response = await handleReadinessLead(requestFor({ ...validPayload, ...extra }), { env: validEnv });
    assert.equal(response.status, 422);
    assert.match((await response.json()).error, /must not be submitted/i);
  }
  assert.equal((await handleReadinessLead(requestFor({ ...validPayload, context: 'buy backlinks now' }), { env: validEnv })).status, 422);
  assert.equal((await handleReadinessLead(requestFor({ ...validPayload, fullName: 'x'.repeat(101) }), { env: validEnv })).status, 422);
  const raw = JSON.stringify({ ...validPayload, context: 'x'.repeat(13_000) });
  assert.equal((await handleReadinessLead(requestFor(validPayload, { body: raw }), { env: validEnv })).status, 413);
});

test('readiness lead endpoint sanitizes provider HTML and uses work email as Reply-To', async () => {
  let providerPayload;
  const response = await handleReadinessLead(requestFor({ ...validPayload, fullName: '<script>alert(1)</script>', context: '<img src=x>' }), {
    env: validEnv,
    fetchImpl: async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails');
      providerPayload = JSON.parse(options.body);
      return new Response('{}', { status: 200 });
    },
  });
  assert.equal(response.status, 200);
  assert.equal(providerPayload.reply_to, validPayload.email);
  assert.equal(providerPayload.to[0], validEnv.READINESS_LEAD_TO_EMAIL);
  assert.doesNotMatch(providerPayload.html, /<script>|<img /);
  assert.match(providerPayload.html, /&lt;script&gt;/);
});

test('readiness lead endpoint safely reuses Release Check recipient configuration', async () => {
  let providerPayload;
  const env = { RESEND_API_KEY: 'key', RELEASE_CHECK_TO_EMAIL: 'release@example.com', RELEASE_CHECK_FROM_EMAIL: 'GhostFrame <release@example.com>' };
  const response = await handleReadinessLead(requestFor(), { env, fetchImpl: async (_url, options) => { providerPayload = JSON.parse(options.body); return new Response('{}', { status: 200 }); } });
  assert.equal(response.status, 200);
  assert.deepEqual(providerPayload.to, ['release@example.com']);
});

test('readiness lead provider and configuration failures reveal no secrets or submitted values', async () => {
  const absent = await handleReadinessLead(requestFor(), { env: {} });
  assert.equal(absent.status, 503);
  const failed = await handleReadinessLead(requestFor(), { env: validEnv, fetchImpl: async () => new Response('{}', { status: 429 }) });
  assert.equal(failed.status, 502);
  for (const response of [absent, failed]) {
    const body = JSON.stringify(await response.json());
    assert.doesNotMatch(body, /provider-secret|ada@example|Release Agent|team@example/);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
});
