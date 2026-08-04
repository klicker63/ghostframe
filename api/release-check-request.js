const MAX_REQUEST_BYTES = 32_000;
const MAX_URLS_IN_FREE_TEXT = 3;

const DEVELOPMENT_STAGES = new Set([
  'Prototype',
  'Internal testing',
  'Pre-production',
  'Already deployed',
  'Enterprise customer review',
]);

const PRIMARY_REASONS = new Set([
  'Pre-release security decision',
  'Enterprise customer request',
  'Procurement evidence',
  'Permission design',
  'Incident follow-up',
  'Independent technical validation',
  'Other',
]);

const SANDBOX_OPTIONS = new Set([
  'Yes — ready now',
  'In progress',
  'No — needs discussion',
]);

const FIELD_LIMITS = {
  name: 100,
  email: 254,
  company: 160,
  companyWebsite: 300,
  agentProduct: 200,
  agentPurpose: 3000,
  stage: 40,
  tools: 3000,
  sandbox: 40,
  desiredDate: 40,
  reason: 80,
  additionalContext: 4000,
  website: 300,
};

const REQUIRED_FIELDS = [
  'name',
  'email',
  'company',
  'companyWebsite',
  'agentProduct',
  'agentPurpose',
  'stage',
  'tools',
  'sandbox',
  'desiredDate',
  'reason',
];

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
    // Preserve ordinary whitespace while removing control characters that can corrupt email output.
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

function normalizeCompanyWebsite(value) {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const parsed = new URL(candidate);
    const invalidHost = !parsed.hostname.includes('.') || parsed.hostname === 'localhost';
    const invalidProtocol = parsed.protocol !== 'https:' && parsed.protocol !== 'http:';
    const containsCredentials = Boolean(parsed.username || parsed.password);

    if (invalidHost || invalidProtocol || containsCredentials) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function hasSpamPattern(values) {
  const freeText = [values.agentPurpose, values.tools, values.additionalContext].join(' ');
  const urlMatches = freeText.match(/(?:https?:\/\/|www\.)/gi) ?? [];
  if (urlMatches.length > MAX_URLS_IN_FREE_TEXT) return true;

  return /(?:\[url=|<a\s+href=|\b(?:buy backlinks|guest post service|crypto giveaway)\b)/i.test(freeText);
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

  if (REQUIRED_FIELDS.some(field => !values[field])) {
    return { error: 'Complete all required fields.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return { error: 'Enter a valid work email.' };
  }

  if (!DEVELOPMENT_STAGES.has(values.stage)) {
    return { error: 'Select a valid development stage.' };
  }

  if (!PRIMARY_REASONS.has(values.reason)) {
    return { error: 'Select a valid primary reason.' };
  }

  if (!SANDBOX_OPTIONS.has(values.sandbox)) {
    return { error: 'Select a valid sandbox or test-endpoint status.' };
  }

  if (!isIsoDate(values.desiredDate)) {
    return { error: 'Enter a valid desired assessment date.' };
  }

  const normalizedWebsite = normalizeCompanyWebsite(values.companyWebsite);
  if (!normalizedWebsite) {
    return { error: 'Enter a valid company website.' };
  }
  values.companyWebsite = normalizedWebsite;

  if (body.consent !== true) {
    return { error: 'Confirm that no secrets or credentials are included.' };
  }

  if (values.website || hasSpamPattern(values)) {
    return { error: 'The request could not be accepted.' };
  }

  return { values };
}

function buildProviderPayload(values, env) {
  const subjectCompany = values.company.replace(/[\r\n]/g, ' ');
  const rows = [
    ['Full name', values.name],
    ['Work email', values.email],
    ['Company', values.company],
    ['Company website', values.companyWebsite],
    ['Agent or product', values.agentProduct],
    ['What the agent does', values.agentPurpose],
    ['Development stage', values.stage],
    ['Tools or systems', values.tools],
    ['Sandbox or test endpoint', values.sandbox],
    ['Desired assessment date', values.desiredDate],
    ['Primary reason', values.reason],
    ['Additional context', values.additionalContext || 'Not provided'],
  ];

  const text = [
    'GhostGate Agent Release Check Request',
    '',
    ...rows.flatMap(([label, value]) => [`${label}:`, value, '']),
  ].join('\n');

  const htmlRows = rows.map(([label, value]) => (
    '<tr><th style="text-align:left;padding:8px;vertical-align:top">' +
    escapeHtml(label) +
    '</th><td style="padding:8px;white-space:pre-wrap">' +
    escapeHtml(value) +
    '</td></tr>'
  )).join('');

  return {
    from: env.RELEASE_CHECK_FROM_EMAIL,
    to: [env.RELEASE_CHECK_TO_EMAIL],
    reply_to: values.email,
    subject: 'GhostGate Release Check Request — ' + subjectCompany,
    text,
    html: '<h1>GhostGate Agent Release Check Request</h1><table>' + htmlRows + '</table>',
  };
}

export async function handleReleaseCheckRequest(request, dependencies = {}) {
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

  const requiredEnvironment = [
    'RESEND_API_KEY',
    'RELEASE_CHECK_TO_EMAIL',
    'RELEASE_CHECK_FROM_EMAIL',
  ];
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
      console.error('Release Check request delivery failed', { providerStatus: providerResponse.status });
      return jsonResponse(502, {
        error: 'Online delivery failed. Please use the direct email option.',
      });
    }

    return jsonResponse(200, {
      ok: true,
      message: 'GhostFrame received your Release Check request for scope review.',
    });
  } catch {
    console.error('Release Check request delivery error');
    return jsonResponse(502, {
      error: 'Online delivery failed. Please use the direct email option.',
    });
  }
}

export async function POST(request) {
  return handleReleaseCheckRequest(request);
}
