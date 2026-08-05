const ALLOWED_EVENTS = new Set([
  'readiness_check_started',
  'readiness_question_completed',
  'readiness_check_completed',
  'permission_envelope_copied',
  'result_downloaded',
  'release_check_cta_clicked',
  'lead_form_started',
  'lead_form_submitted',
  'launch_asset_link_clicked',
]);

const ALLOWED_PROPERTIES = new Set([
  'question_number', 'question_category', 'readiness_category', 'dimension_count', 'format', 'source',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
]);

export function getUtmContext(search = globalThis.location?.search ?? '') {
  const params = new URLSearchParams(search);
  return Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
    .map(key => [key, params.get(key)])
    .filter(([, value]) => value && value.length <= 100));
}

export function sanitizeAnalyticsPayload(event, properties = {}) {
  if (!ALLOWED_EVENTS.has(event)) throw new Error(`Unsupported analytics event: ${event}`);
  const safe = {};
  for (const [key, value] of Object.entries(properties)) {
    if (!ALLOWED_PROPERTIES.has(key)) continue;
    if (!['string', 'number', 'boolean'].includes(typeof value)) continue;
    safe[key] = typeof value === 'string' ? value.slice(0, 100) : value;
  }
  return { event, properties: safe };
}

export function createAnalytics({ adapter = { track() {} }, context = {} } = {}) {
  return {
    track(event, properties = {}) {
      const payload = sanitizeAnalyticsPayload(event, { ...context, ...properties });
      adapter.track(payload);
      return payload;
    },
  };
}

export function createDebugAdapter(onEvent) {
  return { track(payload) { onEvent(payload); } };
}

export function decorateWithUtm(href, context) {
  const url = new URL(href, globalThis.location?.origin ?? 'https://www.ghostframestudios.com');
  Object.entries(context).forEach(([key, value]) => url.searchParams.set(key, value));
  return `${url.pathname}${url.search}${url.hash}`;
}
