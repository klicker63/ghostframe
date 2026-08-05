export const READINESS_CATEGORIES = {
  prepared: 'Prepared for scoped assessment',
  gaps: 'Control gaps remain',
  blockers: 'Release blockers indicated',
};

export const ANSWER_OPTIONS = [
  { value: 'verified', label: 'Fully implemented and verified', score: 1 },
  { value: 'partial', label: 'Partially implemented', score: 0.62 },
  { value: 'planned', label: 'Planned but not implemented', score: 0.3 },
  { value: 'none', label: 'Not implemented', score: 0 },
  { value: 'na', label: 'Not applicable', score: 0.42 },
];

export const DIMENSIONS = {
  authority: 'Authority risk',
  permissions: 'Permission discipline',
  data: 'Data exposure',
  approval: 'Approval strength',
  adversarial: 'Adversarial exposure',
  version: 'Version control',
  observability: 'Observability',
  recovery: 'Recovery readiness',
};

export const CAPABILITIES = [
  { id: 'write_delete', label: 'Write or delete access', description: 'Can create, change, or remove records or files.' },
  { id: 'financial', label: 'Financial actions', description: 'Can initiate, approve, or influence payments or purchases.' },
  { id: 'deployments', label: 'Deployments', description: 'Can change code, infrastructure, configuration, or production state.' },
  { id: 'email', label: 'Email or message sending', description: 'Can send external communications as a person or organization.' },
  { id: 'authenticated_browser', label: 'Authenticated browser sessions', description: 'Can act inside signed-in web applications.' },
  { id: 'terminal', label: 'Terminal execution', description: 'Can run shell commands, scripts, or arbitrary code.' },
  { id: 'multi_agent', label: 'Multi-agent delegation', description: 'Can create or direct other agents or sub-processes.' },
  { id: 'persistent_memory', label: 'Persistent memory', description: 'Can retain state or instructions between runs.' },
  { id: 'external_content', label: 'External untrusted content', description: 'Consumes webpages, messages, documents, or other untrusted inputs.' },
];

export const QUESTIONS = [
  {
    id: 'authority', category: 'Agent authority', title: 'Is the agent’s action authority explicitly bounded?',
    prompt: 'Document what the agent may decide or do autonomously, what always requires a person, and what it must never do.',
    dimensions: { authority: 3, approval: 1, permissions: 1 },
    why: 'Unbounded authority turns a model error or manipulated instruction into a real-world action.',
    nextControl: 'Create a decision-rights table covering autonomous, approval-bound, and prohibited actions.',
  },
  {
    id: 'tools', category: 'Tools and external systems', title: 'Are tools and external systems inventoried at operation level?',
    prompt: 'Include each tool, the operations it exposes, whether access is read or write, and the identity used.',
    dimensions: { authority: 1, permissions: 3, data: 1 },
    why: 'A tool name alone hides consequential operations and alternate action paths.',
    nextControl: 'Inventory every tool operation and disable capabilities that are not required for the release.',
  },
  {
    id: 'data', category: 'Data and credential exposure', title: 'Are credentials and data boundaries minimized and verified?',
    prompt: 'Use scoped identities, secret isolation, data classification, and explicit rules for reading, retaining, and transmitting data.',
    dimensions: { data: 3, permissions: 1 },
    why: 'Over-broad data or credential access increases the impact of misuse, leakage, and confused-deputy behavior.',
    nextControl: 'Replace shared or broad credentials with scoped test identities and enforce data-access boundaries.',
  },
  {
    id: 'approval', category: 'Human approval controls', title: 'Are consequential actions stopped by enforceable human approval?',
    prompt: 'Approval should occur outside the model’s control, show the exact action, and expire or bind to a single request.',
    dimensions: { approval: 3, authority: 1, permissions: 1 },
    why: 'A prompt-level instruction to ask for approval is not an enforcement boundary.',
    nextControl: 'Add an external approval gate that binds one reviewer decision to one exact consequential action.',
  },
  {
    id: 'prompt_exposure', category: 'Prompt and external-content exposure', title: 'Is untrusted content treated as data rather than authority?',
    prompt: 'Test webpages, email, files, retrieved content, and tool output for prompt injection and instruction smuggling.',
    dimensions: { adversarial: 3, data: 1, authority: 1 },
    why: 'External content can redirect an agent unless instruction sources are separated and tool use remains constrained.',
    nextControl: 'Label untrusted inputs, isolate them from system instructions, and test tool-use decisions under injection attempts.',
  },
  {
    id: 'multi_step', category: 'Multi-step and multi-agent behavior', title: 'Are delegated and multi-step action chains bounded end to end?',
    prompt: 'Trace retries, handoffs, sub-agents, shared state, and cumulative effects—not only individual calls.',
    dimensions: { authority: 2, approval: 1, observability: 1, adversarial: 1 },
    why: 'Individually acceptable steps can combine into an unsafe outcome or bypass an earlier restriction.',
    nextControl: 'Set delegation depth, action-count, retry, and cumulative-impact limits with parent-level enforcement.',
  },
  {
    id: 'environment', category: 'Environment separation', title: 'Is testing isolated from production identities and systems?',
    prompt: 'Use a representative sandbox or test endpoint with non-production credentials and controlled fixtures.',
    dimensions: { permissions: 2, data: 1, recovery: 1 },
    why: 'Testing against production can turn discovery of a failure into an incident.',
    nextControl: 'Create a representative test environment with scoped identities, synthetic data, and reversible actions.',
  },
  {
    id: 'version', category: 'Version immutability', title: 'Can the exact assessed agent version be reproduced?',
    prompt: 'Pin model, system instructions, code, tool definitions, dependencies, retrieval sources, and configuration.',
    dimensions: { version: 3, observability: 1 },
    why: 'Evidence cannot support a release decision when the assessed subject can change underneath it.',
    nextControl: 'Create an immutable release identifier and record hashes or fixed references for every behavior-shaping component.',
  },
  {
    id: 'permission_boundary', category: 'Permission boundaries', title: 'Are least-privilege rules enforced outside the model?',
    prompt: 'Use allowlists, scoped identities, denied operations, destination limits, and execution caps at the tool or platform layer.',
    dimensions: { permissions: 3, authority: 1, data: 1 },
    why: 'Model compliance is probabilistic; permission enforcement must remain effective when the model is wrong.',
    nextControl: 'Move critical allowlists, denials, and limits into the tool gateway or underlying system permissions.',
  },
  {
    id: 'logging', category: 'Logging and behavioral evidence', title: 'Can reviewers reconstruct what the agent saw, decided, and did?',
    prompt: 'Capture version, inputs by reference, tool requests, approvals, outcomes, errors, and actor identities without logging secrets.',
    dimensions: { observability: 3, recovery: 1 },
    why: 'Without trustworthy evidence, teams cannot investigate behavior, reproduce findings, or support a release decision.',
    nextControl: 'Add tamper-evident, secret-safe event records that correlate each decision, approval, tool call, and result.',
  },
  {
    id: 'invalidation', category: 'Material-change invalidation', title: 'Do defined changes invalidate prior release evidence?',
    prompt: 'Cover changes to models, prompts, tools, permissions, code, orchestration, memory, data sources, policy, and deployment.',
    dimensions: { version: 3, authority: 1 },
    why: 'Evidence for one configuration should not silently transfer to a materially different agent.',
    nextControl: 'Define material-change triggers and require review or reassessment before the changed version is released.',
  },
  {
    id: 'adversarial', category: 'Adversarial testing', title: 'Has the exact version been tested against realistic hostile paths?',
    prompt: 'Include prompt manipulation, tool misuse, approval bypass, data exposure, retry behavior, and chained actions.',
    dimensions: { adversarial: 3, authority: 1, permissions: 1 },
    why: 'Happy-path tests do not show how the agent behaves when inputs or tool states are adversarial.',
    nextControl: 'Run documented, reproducible hostile scenarios against the release candidate and retain the evidence.',
  },
  {
    id: 'recovery', category: 'Recovery and incident response', title: 'Can operators contain, reverse, and investigate unsafe behavior?',
    prompt: 'Provide kill controls, credential revocation, rollback, ownership, escalation paths, and tested recovery procedures.',
    dimensions: { recovery: 3, observability: 1, authority: 1 },
    why: 'Consequential agents need a tested path to stop harm and restore known-good state.',
    nextControl: 'Test the kill, revoke, rollback, evidence-preservation, and escalation sequence before release.',
  },
  {
    id: 'memory', category: 'Memory and persistence', title: 'Is persistent state bounded, inspectable, and erasable?',
    prompt: 'Control what is stored, who can write it, how long it persists, how it influences actions, and how it is cleared.',
    dimensions: { data: 2, adversarial: 1, version: 1 },
    why: 'Persistent state can carry sensitive data or malicious instructions across otherwise separate sessions.',
    nextControl: 'Define a memory schema, provenance rules, retention limits, write controls, and an operator-visible reset path.',
  },
  {
    id: 'ownership', category: 'Release ownership', title: 'Is one accountable human owner authorized to make the release decision?',
    prompt: 'Name the owner, required reviewers, acceptance criteria, exception process, and post-release monitoring obligation.',
    dimensions: { authority: 1, approval: 2, recovery: 1 },
    why: 'A release can drift through organizational gaps when no person owns the decision and its conditions.',
    nextControl: 'Assign a release owner and record the evidence reviewed, accepted restrictions, and expiration conditions.',
  },
];

const CAPABILITY_RULES = {
  write_delete: ['authority', 'tools', 'approval', 'permission_boundary', 'recovery'],
  financial: ['authority', 'approval', 'permission_boundary', 'logging', 'recovery'],
  deployments: ['authority', 'approval', 'environment', 'version', 'permission_boundary', 'recovery'],
  email: ['authority', 'approval', 'prompt_exposure', 'permission_boundary', 'logging'],
  authenticated_browser: ['tools', 'data', 'prompt_exposure', 'permission_boundary', 'logging'],
  terminal: ['tools', 'prompt_exposure', 'environment', 'permission_boundary', 'adversarial'],
  multi_agent: ['authority', 'approval', 'multi_step', 'logging', 'recovery'],
  persistent_memory: ['data', 'invalidation', 'logging', 'memory'],
  external_content: ['data', 'prompt_exposure', 'permission_boundary', 'adversarial'],
};

const CONSEQUENCE_CAPABILITIES = new Set([
  'write_delete', 'financial', 'deployments', 'email', 'authenticated_browser', 'terminal',
]);

function answerScore(answer) {
  return ANSWER_OPTIONS.find(option => option.value === answer)?.score;
}

function importanceFor(questionId, capabilities) {
  const matches = capabilities.filter(id => CAPABILITY_RULES[id]?.includes(questionId)).length;
  return Math.min(2.4, 1 + matches * 0.28);
}

function band(score) {
  if (score >= 75) return 'Established';
  if (score >= 50) return 'Developing';
  return 'Weak';
}

export function calculateReadiness({ answers, capabilities = [] }) {
  const missing = QUESTIONS.filter(question => answerScore(answers?.[question.id]) === undefined);
  if (missing.length) throw new Error(`Missing answers: ${missing.map(question => question.id).join(', ')}`);

  const validCapabilities = capabilities.filter(id => CAPABILITY_RULES[id]);
  const totals = Object.fromEntries(Object.keys(DIMENSIONS).map(id => [id, { earned: 0, possible: 0 }]));
  const gaps = [];

  for (const question of QUESTIONS) {
    const score = answerScore(answers[question.id]);
    const importance = importanceFor(question.id, validCapabilities);
    for (const [dimension, weight] of Object.entries(question.dimensions)) {
      totals[dimension].earned += score * weight * importance;
      totals[dimension].possible += weight * importance;
    }
    gaps.push({
      id: question.id,
      category: question.category,
      title: question.title,
      answer: answers[question.id],
      priority: (1 - score) * importance * Object.values(question.dimensions).reduce((sum, value) => sum + value, 0),
      why: question.why,
      nextControl: question.nextControl,
      primaryDimension: Object.entries(question.dimensions).sort((a, b) => b[1] - a[1])[0][0],
    });
  }

  const dimensions = Object.fromEntries(Object.entries(totals).map(([id, values]) => {
    const score = Math.round((values.earned / values.possible) * 100);
    return [id, { id, label: DIMENSIONS[id], score, band: band(score) }];
  }));
  const overallScore = Math.round(Object.values(dimensions).reduce((sum, item) => sum + item.score, 0) / Object.keys(dimensions).length);
  const weakestScore = Math.min(...Object.values(dimensions).map(item => item.score));
  const consequential = validCapabilities.some(id => CONSEQUENCE_CAPABILITIES.has(id));
  const hardControlAnswers = ['authority', 'approval', 'permission_boundary', 'version', 'adversarial'].map(id => answers[id]);
  const missingHardControls = hardControlAnswers.filter(value => value === 'none' || value === 'planned').length;

  let categoryKey = 'gaps';
  if (overallScore >= 75 && weakestScore >= 55 && (!consequential || missingHardControls === 0)) categoryKey = 'prepared';
  if (overallScore < 48 || weakestScore < 30 || (consequential && missingHardControls >= 2)) categoryKey = 'blockers';

  const priorityGaps = gaps.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id)).slice(0, 3);
  const selectedCapabilities = CAPABILITIES.filter(item => validCapabilities.includes(item.id));

  return {
    categoryKey,
    category: READINESS_CATEGORIES[categoryKey],
    overallScore,
    dimensions,
    priorityGaps,
    selectedCapabilities,
    restrictions: buildRestrictions({ answers, capabilities: validCapabilities, categoryKey }),
  };
}

function buildRestrictions({ answers, capabilities, categoryKey }) {
  const restrictions = [
    'Do not use tools, operations, identities, data, or destinations outside the explicitly approved release scope.',
    'Do not disclose, export, or persist credentials, secrets, customer data, or confidential instructions.',
  ];
  if (categoryKey !== 'prepared') restrictions.push('Keep the agent out of production until the named priority controls are implemented and verified.');
  if (capabilities.some(id => ['write_delete', 'financial', 'deployments', 'email'].includes(id)) && answers.approval !== 'verified') {
    restrictions.push('Disable consequential write, financial, deployment, and external-send actions or require an external, single-action human approval gate.');
  }
  if (capabilities.includes('terminal') && answers.permission_boundary !== 'verified') restrictions.push('Remove unrestricted terminal access; allowlist commands and isolate execution in a disposable sandbox.');
  if (capabilities.includes('authenticated_browser') && answers.data !== 'verified') restrictions.push('Use dedicated test identities and prohibit access to production sessions, customer records, and stored credentials.');
  if (capabilities.includes('multi_agent') && answers.multi_step !== 'verified') restrictions.push('Disable delegation or cap depth, child count, retries, and cumulative actions.');
  if (capabilities.includes('persistent_memory') && answers.memory !== 'verified') restrictions.push('Disable cross-session memory or restrict it to inspectable, erasable, non-sensitive records.');
  if (capabilities.includes('external_content') && answers.prompt_exposure !== 'verified') restrictions.push('Do not permit untrusted content to authorize tool use; isolate and label all external instructions.');
  if (answers.logging !== 'verified') restrictions.push('Limit use to supervised testing until secret-safe behavioral evidence is complete.');
  return [...new Set(restrictions)].slice(0, 5);
}

export function generatePermissionEnvelope(profile, result) {
  const cleanList = value => String(value || '').split(/[\n,]/).map(item => item.trim()).filter(Boolean).slice(0, 20);
  const capabilityLabels = result.selectedCapabilities.map(item => item.label);
  return {
    schema_version: '0.1',
    agent_name: String(profile.agentName || 'Unnamed agent').trim(),
    version_identifier: String(profile.versionIdentifier || 'UNSET — define an immutable version').trim(),
    environment: String(profile.environment || 'test').trim(),
    allowed_tools: cleanList(profile.allowedTools),
    prohibited_operations: result.restrictions,
    approved_identities: cleanList(profile.approvedIdentities),
    data_boundaries: ['No credentials, secrets, personal data, customer data, or confidential instructions unless explicitly scoped and protected.'],
    human_approval_requirements: capabilityLabels.length ? [`Human approval required for consequential use of: ${capabilityLabels.join(', ')}.`] : ['Define any action that requires human approval before release.'],
    allowed_domains_or_systems: cleanList(profile.allowedSystems),
    execution_limits: {
      max_delegation_depth: result.selectedCapabilities.some(item => item.id === 'multi_agent') ? 1 : 0,
      max_consequential_actions_per_run: 1,
      retries_require_reauthorization: true,
    },
    logging_requirements: ['Version identifier', 'Actor identity', 'Tool request and result', 'Approval decision', 'Outcome and error state'],
    invalidation_triggers: ['Model change', 'System-instruction change', 'Tool or permission change', 'Agent-code or orchestration change', 'Retrieval or memory change', 'Policy or deployment change'],
    self_assessment_category: result.category,
    notice: 'Sample only. This self-assessment is not a security certification and does not guarantee safety.',
  };
}

function yamlScalar(value) {
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (value === null) return 'null';
  return JSON.stringify(String(value));
}

function yamlLines(value, depth = 0) {
  const indent = '  '.repeat(depth);
  if (Array.isArray(value)) {
    if (!value.length) return [`${indent}[]`];
    return value.flatMap(item => typeof item === 'object' && item !== null
      ? [`${indent}-`, ...yamlLines(item, depth + 1)]
      : [`${indent}- ${yamlScalar(item)}`]);
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value);
    if (!entries.length) return [`${indent}{}`];
    return entries.flatMap(([key, item]) => {
      if (typeof item === 'object' && item !== null) return [`${indent}${key}:`, ...yamlLines(item, depth + 1)];
      return [`${indent}${key}: ${yamlScalar(item)}`];
    });
  }
  return [`${indent}${yamlScalar(value)}`];
}

export function permissionEnvelopeAsJson(envelope) {
  return `${JSON.stringify(envelope, null, 2)}\n`;
}

export function permissionEnvelopeAsYaml(envelope) {
  return `${yamlLines(envelope).join('\n')}\n`;
}

export function buildResultSummary(profile, result, envelope) {
  const dimensions = Object.values(result.dimensions).map(item => `- ${item.label}: ${item.band} (${item.score}/100)`).join('\n');
  const gaps = result.priorityGaps.map((gap, index) => `${index + 1}. ${gap.category}\n   Why it matters: ${gap.why}\n   Next control: ${gap.nextControl}`).join('\n');
  const restrictions = result.restrictions.map(item => `- ${item}`).join('\n');
  return `# GhostGate Agent Release Readiness Summary\n\nAgent: ${profile.agentName || 'Unnamed agent'}\nVersion: ${profile.versionIdentifier || 'Not defined'}\nEnvironment: ${profile.environment || 'test'}\nCategory: ${result.category}\n\nThis is a self-assessment, not a security certification. It does not guarantee safety or replace independent testing.\n\n## Dimension results\n\n${dimensions}\n\n## Priority gaps\n\n${gaps}\n\n## Suggested release restrictions\n\n${restrictions}\n\n## Material-change warning\n\nChanges to the model, system instructions, tools, permissions, code, orchestration, retrieval, memory, policy, or deployment can invalidate this result.\n\n## Sample Permission Envelope\n\n\`\`\`json\n${permissionEnvelopeAsJson(envelope)}\`\`\`\n`;
}

export function createEmptyReadinessSession() {
  return { answers: {}, profile: {}, currentQuestion: 0, result: null, envelope: null };
}

export function buildLeadPayload({ form, result, correlationMarker }) {
  return {
    fullName: String(form.fullName || ''),
    email: String(form.email || ''),
    company: String(form.company || ''),
    agentName: String(form.agentName || ''),
    readinessCategory: result.category,
    context: String(form.context || ''),
    website: String(form.website || ''),
    consent: form.consent === true,
    riskDimensions: [...new Set(result.priorityGaps.map(gap => gap.primaryDimension))].slice(0, 3),
    correlationMarker,
  };
}
