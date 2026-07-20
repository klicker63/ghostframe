const MAX_REQUEST_BYTES = 24_000;
const MAX_URLS = 3;
const STAGES = new Set([
  'Prototype',
  'Internal testing',
  'Enterprise pilot',
  'Limited production',
  'Production',
]);

const FIELD_LIMITS = {
  name: 100,
  email: 254,
  company: 160,
  role: 120,
  agentProduct: 200,
  access: 3000,
  stage: 40,
  outcome: 3000,
  message: 4000,
  website: 300,
};

const RESPONSE_HEADERS = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

function jsonResponse(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...RESPONSE_HEADERS, ...extraHeaders },
  });
}

function cleanText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    // This intentionally strips non-printing control characters while preserving newlines.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function validatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Submit a valid JSON object.' };
  }

  const values = {};
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    const raw = body[field];
    if (raw !== undefined && typeof raw !== 'string') {
      return { error: 'One or more fields use an invalid format.' };
    }
    values[field] = cleanText(raw);
    if (values[field].length > limit) {
      return { error: 'One or more fields exceed the allowed length.' };
    }
  }

  const required = ['name', 'email', 'company', 'role', 'agentProduct', 'access', 'stage', 'outcome'];
  if (required.some(field => !values[field])) {
    return { error: 'Complete all required fields.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return { error: 'Enter a valid work email.' };
  }

  if (!STAGES.has(values.stage)) {
    return { error: 'Select a valid deployment stage.' };
  }

  if (body.consent !== true) {
    return { error: 'Confirm that the request contains no sensitive information.' };
  }

  if (values.website) {
    return { error: 'The request could not be accepted.' };
  }

  const urlMatches = Object.values(values).join(' ').match(/(?:https?:\/\/|www\.)/gi) ?? [];
  if (urlMatches.length > MAX_URLS) {
    return { error: 'The request could not be accepted.' };
  }

  return { values };
}

function buildProviderPayload(values, env) {
  const subjectCompany = values.company.replace(/[\r\n]/g, ' ');
  const text = [
    'GhostGate Private Pilot Request',
    '',
    'Name: ' + values.name,
    'Work email: ' + values.email,
    'Company: ' + values.company,
    'Role: ' + values.role,
    'Agent or product: ' + values.agentProduct,
    'Deployment stage: ' + values.stage,
    '',
    'Agent access:',
    values.access,
    '',
    'Desired outcome:',
    values.outcome,
    '',
    'Additional context:',
    values.message || 'Not provided',
  ].join('\n');

  const rows = [
    ['Name', values.name],
    ['Work email', values.email],
    ['Company', values.company],
    ['Role', values.role],
    ['Agent or product', values.agentProduct],
    ['Deployment stage', values.stage],
    ['Agent access', values.access],
    ['Desired outcome', values.outcome],
    ['Additional context', values.message || 'Not provided'],
  ];

  const htmlRows = rows.map(([label, value]) => (
    '<tr><th style="text-align:left;padding:8px;vertical-align:top">' +
    escapeHtml(label) +
    '</th><td style="padding:8px;white-space:pre-wrap">' +
    escapeHtml(value) +
    '</td></tr>'
  )).join('');

  return {
    from: env.PILOT_FROM_EMAIL,
    to: [env.PILOT_TO_EMAIL],
    reply_to: values.email,
    subject: 'GhostGate Private Pilot Inquiry — ' + subjectCompany,
    text,
    html: '<h1>GhostGate Private Pilot Request</h1><table>' + htmlRows + '</table>',
  };
}

export async function handlePilotRequest(request, dependencies = {}) {
  const fetchImpl = dependencies.fetchImpl ?? globalThis.fetch;
  const env = dependencies.env ?? process.env;

  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' }, { Allow: 'POST' });
  }

  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return jsonResponse(403, { error: 'Cross-site submissions are not accepted.' });
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return jsonResponse(413, { error: 'Request payload is too large.' });
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return jsonResponse(415, { error: 'Content-Type must be application/json.' });
  }

  let body;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_REQUEST_BYTES) {
      return jsonResponse(413, { error: 'Request payload is too large.' });
    }
    body = JSON.parse(raw);
  } catch {
    return jsonResponse(400, { error: 'Submit valid JSON.' });
  }

  const validation = validatePayload(body);
  if (validation.error) {
    return jsonResponse(422, { error: validation.error });
  }

  const requiredEnvironment = ['RESEND_API_KEY', 'PILOT_TO_EMAIL', 'PILOT_FROM_EMAIL'];
  if (requiredEnvironment.some(key => !cleanText(env[key]))) {
    return jsonResponse(503, {
      error: 'Online delivery is temporarily unavailable. Please use the direct email option.',
    });
  }

  const providerPayload = buildProviderPayload(validation.values, env);

  try {
    const providerResponse = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(providerPayload),
    });

    if (!providerResponse.ok) {
      console.error('Pilot request delivery failed', { providerStatus: providerResponse.status });
      return jsonResponse(502, {
        error: 'Online delivery failed. Please use the direct email option.',
      });
    }

    return jsonResponse(200, {
      ok: true,
      message: 'Your private-pilot request was sent to GhostFrame Studios.',
    });
  } catch {
    console.error('Pilot request delivery error');
    return jsonResponse(502, {
      error: 'Online delivery failed. Please use the direct email option.',
    });
  }
}

export async function POST(request) {
  return handlePilotRequest(request);
}