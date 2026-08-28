const MAX_REQUEST_BYTES = 28_000;
const MAX_URLS_IN_FREE_TEXT = 2;

const CUSTOMER_ROLES = new Set([
  'Real-estate investor',
  'Wholesaler',
  'Fix-and-flip operator',
  'Auction or tax-deed buyer',
  'Acquisition team',
  'Other property professional',
]);

const TRANSACTION_STAGES = new Set([
  'Initial review',
  'Under contract',
  'Auction pending',
  'Closing pending',
  'Other active decision',
]);

const PROPERTY_TYPES = new Set([
  'Single-family',
  'Multi-family',
  'Condominium',
  'Commercial',
  'Vacant land',
  'Mixed-use',
  'Other',
]);

const REQUESTED_SCOPES = new Set([
  'Standard Tampa property and parcel research',
  'Building permits and code enforcement',
  'Property tax and tax-certificate research',
  'Official-record index research',
  'Zoning context',
  'Delegated Tampa municipal search',
]);

const FIELD_LIMITS = {
  name: 100,
  company: 160,
  email: 254,
  phone: 40,
  customerRole: 60,
  propertyAddress: 300,
  folioApn: 100,
  transactionStage: 50,
  intendedUse: 200,
  propertyType: 40,
  decisionDeadline: 10,
  knownConcern: 1600,
  otherScope: 1000,
  website: 300,
};

const REQUIRED_FIELDS = [
  'name',
  'email',
  'customerRole',
  'propertyAddress',
  'transactionStage',
  'intendedUse',
  'propertyType',
  'decisionDeadline',
];

const ALLOWED_BODY_KEYS = new Set([
  ...Object.keys(FIELD_LIMITS),
  'requestedScope',
  'lawfulPurpose',
  'privacyAcknowledgement',
]);

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
    // Preserve useful whitespace while removing non-printing control characters.
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

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function hasSpamPattern(values) {
  const freeText = [values.knownConcern, values.otherScope, values.intendedUse].join(' ');
  const urlMatches = freeText.match(/(?:https?:\/\/|www\.)/gi) ?? [];
  if (urlMatches.length > MAX_URLS_IN_FREE_TEXT) return true;
  return /(?:\[url=|<a\s+href=|\b(?:buy backlinks|guest post service|crypto giveaway)\b)/i.test(freeText);
}

function validatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Submit a valid JSON object.' };
  }
  if (Object.keys(body).some(key => !ALLOWED_BODY_KEYS.has(key))) {
    return { error: 'One or more fields are not accepted by this coverage-review form.' };
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
    return { error: 'Enter a valid email address.' };
  }
  if (values.phone && !/^[+()\d\s.-]{7,40}$/.test(values.phone)) {
    return { error: 'Enter a valid phone number or leave it blank.' };
  }
  if (!CUSTOMER_ROLES.has(values.customerRole)) {
    return { error: 'Select a valid customer role.' };
  }
  if (!TRANSACTION_STAGES.has(values.transactionStage)) {
    return { error: 'Select a valid transaction stage.' };
  }
  if (!PROPERTY_TYPES.has(values.propertyType)) {
    return { error: 'Select a valid property type.' };
  }
  if (!isIsoDate(values.decisionDeadline)) {
    return { error: 'Enter a valid decision, auction, or closing deadline.' };
  }
  if (values.propertyAddress.length < 8) {
    return { error: 'Enter the full Tampa property address.' };
  }

  if (!Array.isArray(body.requestedScope) || body.requestedScope.length === 0) {
    return { error: 'Select at least one requested research area.' };
  }
  if (body.requestedScope.length > REQUESTED_SCOPES.size) {
    return { error: 'One or more requested research areas are invalid.' };
  }
  const requestedScope = body.requestedScope.map(cleanText);
  if (requestedScope.some(scope => !REQUESTED_SCOPES.has(scope)) || new Set(requestedScope).size !== requestedScope.length) {
    return { error: 'One or more requested research areas are invalid.' };
  }
  values.requestedScope = requestedScope;

  if (body.lawfulPurpose !== true) {
    return { error: 'Confirm the lawful property-related purpose.' };
  }
  if (body.privacyAcknowledgement !== true) {
    return { error: 'Confirm the coverage-review and privacy acknowledgment.' };
  }
  if (values.website || hasSpamPattern(values)) {
    return { error: 'The request could not be accepted.' };
  }

  return { values };
}

async function createSubmissionId(values) {
  const canonical = JSON.stringify([
    values.email.toLowerCase(),
    values.propertyAddress.toLowerCase(),
    values.decisionDeadline,
    values.requestedScope.slice().sort(),
  ]);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  const compact = Array.from(new Uint8Array(digest).slice(0, 8), byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `GF-MI-${compact}`;
}

function buildProviderPayload(values, env, submissionId, submittedAt) {
  const rows = [
    ['Submission ID', submissionId],
    ['Submitted at', submittedAt],
    ['Name', values.name],
    ['Company', values.company || 'Not provided'],
    ['Email', values.email],
    ['Phone', values.phone || 'Not provided'],
    ['Customer role', values.customerRole],
    ['Property address', values.propertyAddress],
    ['Known folio / APN', values.folioApn || 'Not provided'],
    ['Transaction stage', values.transactionStage],
    ['Intended property use', values.intendedUse],
    ['Property type', values.propertyType],
    ['Decision / auction / closing deadline', values.decisionDeadline],
    ['Known concern', values.knownConcern || 'Not provided'],
    ['Requested scope', values.requestedScope.join('\n')],
    ['Other requested source or concern', values.otherScope || 'Not provided'],
    ['Lawful property-related purpose acknowledged', 'Yes'],
    ['Coverage-review and privacy acknowledgment', 'Yes'],
  ];

  const text = [
    'GhostFrame Municipal Intelligence — Coverage Review Lead',
    '',
    ...rows.flatMap(([label, value]) => [`${label}:`, value, '']),
    'Workflow boundary:',
    'LEAD / COVERAGE REVIEW only. No external fee is authorized, no invoice is created, and no payment is recorded.',
  ].join('\n');

  const htmlRows = rows.map(([label, value]) => (
    '<tr><th style="text-align:left;padding:8px;vertical-align:top">' +
    escapeHtml(label) +
    '</th><td style="padding:8px;white-space:pre-wrap">' +
    escapeHtml(value) +
    '</td></tr>'
  )).join('');

  return {
    from: env.MUNICIPAL_INTELLIGENCE_FROM_EMAIL || env.RELEASE_CHECK_FROM_EMAIL,
    to: [env.MUNICIPAL_INTELLIGENCE_TO_EMAIL || env.RELEASE_CHECK_TO_EMAIL],
    reply_to: values.email,
    subject: `Municipal Intelligence Coverage Review — ${submissionId}`,
    text,
    html: '<h1>Municipal Intelligence Coverage Review</h1><table>' + htmlRows + '</table><p><strong>LEAD / COVERAGE REVIEW only.</strong> No external fee is authorized, no invoice is created, and no payment is recorded.</p>',
  };
}

export async function handleMunicipalIntelligenceLead(request, dependencies = {}) {
  const fetchImpl = dependencies.fetchImpl ?? globalThis.fetch;
  const env = dependencies.env ?? process.env;
  const logger = dependencies.logger ?? console;
  const now = dependencies.now ?? (() => new Date());

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
  if (validation.error) return jsonResponse(422, { error: validation.error });

  const toEmail = cleanText(env.MUNICIPAL_INTELLIGENCE_TO_EMAIL || env.RELEASE_CHECK_TO_EMAIL);
  const fromEmail = cleanText(env.MUNICIPAL_INTELLIGENCE_FROM_EMAIL || env.RELEASE_CHECK_FROM_EMAIL);
  if (!cleanText(env.RESEND_API_KEY) || !toEmail || !fromEmail) {
    return jsonResponse(503, { error: 'Online delivery is temporarily unavailable. Please use the direct email option.' });
  }

  const submissionId = await createSubmissionId(validation.values);
  const submittedAt = now().toISOString();
  const providerPayload = buildProviderPayload(validation.values, env, submissionId, submittedAt);

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
      logger.error?.('Municipal Intelligence lead delivery failed', { submissionId, submittedAt, providerStatus: providerResponse.status });
      return jsonResponse(502, { error: 'Online delivery failed. Please use the direct email option.' });
    }

    logger.info?.('Municipal Intelligence coverage-review lead delivered', { submissionId, submittedAt });
    return jsonResponse(200, {
      ok: true,
      submissionId,
      message: 'GhostFrame received your Tampa property coverage-review request.',
    });
  } catch {
    logger.error?.('Municipal Intelligence lead delivery error', { submissionId, submittedAt });
    return jsonResponse(502, { error: 'Online delivery failed. Please use the direct email option.' });
  }
}

export async function POST(request) {
  return handleMunicipalIntelligenceLead(request);
}
