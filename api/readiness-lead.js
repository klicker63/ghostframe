const MAX_REQUEST_BYTES = 12_000;
const CATEGORIES = new Set(['Prepared for scoped assessment', 'Control gaps remain', 'Release blockers indicated']);
const DIMENSIONS = new Set(['authority', 'permissions', 'data', 'approval', 'adversarial', 'version', 'observability', 'recovery']);
const FIELD_LIMITS = { fullName: 100, email: 254, company: 160, agentName: 200, readinessCategory: 50, context: 1500, website: 200, correlationMarker: 80 };
const RESPONSE_HEADERS = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' };

function jsonResponse(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...RESPONSE_HEADERS, ...extraHeaders } });
}

function cleanText(value) {
  return String(value ?? '').normalize('NFKC')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function hasSpamPattern(context) {
  const urls = context.match(/(?:https?:\/\/|www\.)/gi) ?? [];
  return urls.length > 2 || /(?:\[url=|<a\s+href=|buy backlinks|guest post service|crypto giveaway)/i.test(context);
}

function validatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Submit a valid JSON object.' };
  if ('answers' in body || 'assessment' in body || 'questions' in body) return { error: 'Assessment answers must not be submitted.' };
  const values = {};
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    if (body[field] !== undefined && typeof body[field] !== 'string') return { error: 'One or more fields use an invalid format.' };
    values[field] = cleanText(body[field]);
    if (values[field].length > limit) return { error: 'One or more fields exceed the allowed length.' };
  }
  if (['fullName', 'email', 'company', 'agentName', 'readinessCategory', 'correlationMarker'].some(field => !values[field])) return { error: 'Complete all required fields.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return { error: 'Enter a valid work email.' };
  if (!CATEGORIES.has(values.readinessCategory)) return { error: 'Submit a valid readiness category.' };
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(values.correlationMarker)) return { error: 'Submit a valid correlation marker.' };
  if (!Array.isArray(body.riskDimensions) || body.riskDimensions.length > 3 || body.riskDimensions.some(value => typeof value !== 'string' || !DIMENSIONS.has(value))) return { error: 'Submit valid high-level risk dimensions.' };
  values.riskDimensions = [...new Set(body.riskDimensions)];
  if (body.consent !== true) return { error: 'Consent is required before contact information can be submitted.' };
  if (values.website || hasSpamPattern(values.context)) return { error: 'The request could not be accepted.' };
  return { values };
}

function buildProviderPayload(values, env) {
  const rows = [
    ['Full name', values.fullName], ['Work email', values.email], ['Company', values.company],
    ['Agent or product', values.agentName], ['Readiness category', values.readinessCategory],
    ['High-level risk dimensions', values.riskDimensions.join(', ') || 'None selected'],
    ['Correlation marker', values.correlationMarker], ['Optional context', values.context || 'Not provided'],
  ];
  return {
    from: env.READINESS_LEAD_FROM_EMAIL || env.RELEASE_CHECK_FROM_EMAIL,
    to: [env.READINESS_LEAD_TO_EMAIL || env.RELEASE_CHECK_TO_EMAIL],
    reply_to: values.email,
    subject: `GhostGate readiness lead — ${values.company.replace(/[\r\n]/g, ' ')}`,
    text: ['GhostGate readiness lead', '', ...rows.flatMap(([label, value]) => [`${label}:`, value, ''])].join('\n'),
    html: `<h1>GhostGate readiness lead</h1><table>${rows.map(([label, value]) => `<tr><th style="text-align:left;padding:8px;vertical-align:top">${escapeHtml(label)}</th><td style="padding:8px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join('')}</table>`,
  };
}

export async function handleReadinessLead(request, dependencies = {}) {
  const fetchImpl = dependencies.fetchImpl ?? globalThis.fetch;
  const env = dependencies.env ?? process.env;
  if (request.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed.' }, { Allow: 'POST' });
  if (request.headers.get('sec-fetch-site') === 'cross-site') return jsonResponse(403, { error: 'Cross-site submissions are not accepted.' });
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) return jsonResponse(413, { error: 'Request payload is too large.' });
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) return jsonResponse(415, { error: 'Content-Type must be application/json.' });
  let body;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_REQUEST_BYTES) return jsonResponse(413, { error: 'Request payload is too large.' });
    body = JSON.parse(raw);
  } catch {
    return jsonResponse(400, { error: 'Submit valid JSON.' });
  }
  const validation = validatePayload(body);
  if (validation.error) return jsonResponse(422, { error: validation.error });
  const to = cleanText(env.READINESS_LEAD_TO_EMAIL || env.RELEASE_CHECK_TO_EMAIL);
  const from = cleanText(env.READINESS_LEAD_FROM_EMAIL || env.RELEASE_CHECK_FROM_EMAIL);
  if (!cleanText(env.RESEND_API_KEY) || !to || !from) return jsonResponse(503, { error: 'Online delivery is temporarily unavailable. Please use the direct Release Check request.' });
  try {
    const providerResponse = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(buildProviderPayload(validation.values, env)),
    });
    if (!providerResponse.ok) {
      console.error('Readiness lead delivery failed', { providerStatus: providerResponse.status });
      return jsonResponse(502, { error: 'Online delivery failed. Please use the direct Release Check request.' });
    }
    return jsonResponse(200, { ok: true, message: 'GhostFrame received your request.' });
  } catch {
    console.error('Readiness lead delivery error');
    return jsonResponse(502, { error: 'Online delivery failed. Please use the direct Release Check request.' });
  }
}

export async function POST(request) {
  return handleReadinessLead(request);
}
