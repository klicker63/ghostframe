import assert from 'node:assert/strict';
import test from 'node:test';
import { createAnalytics, decorateWithUtm, getUtmContext, sanitizeAnalyticsPayload } from '../src/analytics.js';

test('analytics accepts documented events and strips sensitive or unknown properties', () => {
  const payload = sanitizeAnalyticsPayload('readiness_check_completed', {
    readiness_category: 'Control gaps remain', email: 'secret@example.com', answer: 'none', context: 'private',
  });
  assert.deepEqual(payload, { event: 'readiness_check_completed', properties: { readiness_category: 'Control gaps remain' } });
  assert.doesNotMatch(JSON.stringify(payload), /secret@example|private|answer/);
  assert.throws(() => sanitizeAnalyticsPayload('email_captured', {}), /Unsupported/);
});

test('no-op adapter is the default and a custom adapter receives only filtered payloads', () => {
  assert.doesNotThrow(() => createAnalytics().track('readiness_check_started', { source: 'tool' }));
  let received;
  createAnalytics({ adapter: { track(payload) { received = payload; } } }).track('result_downloaded', { format: 'markdown', email: 'no@example.com' });
  assert.deepEqual(received, { event: 'result_downloaded', properties: { format: 'markdown' } });
});

test('UTM context is bounded and preserved on the conversion route', () => {
  const context = getUtmContext('?utm_source=show-hn&utm_medium=organic&utm_campaign=launch&utm_content=post&email=nope');
  assert.deepEqual(context, { utm_source: 'show-hn', utm_medium: 'organic', utm_campaign: 'launch', utm_content: 'post' });
  assert.equal(decorateWithUtm('/ghostgate/release-check/#request', context), '/ghostgate/release-check/?utm_source=show-hn&utm_medium=organic&utm_campaign=launch&utm_content=post#request');
});
