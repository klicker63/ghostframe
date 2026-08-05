import assert from 'node:assert/strict';
import test from 'node:test';
import { parse as parseYaml } from 'yaml';
import {
  QUESTIONS,
  buildLeadPayload,
  calculateReadiness,
  createEmptyReadinessSession,
  generatePermissionEnvelope,
  permissionEnvelopeAsJson,
  permissionEnvelopeAsYaml,
} from '../src/readiness-engine.js';

const categories = [
  'Agent authority', 'Tools and external systems', 'Data and credential exposure', 'Human approval controls',
  'Prompt and external-content exposure', 'Multi-step and multi-agent behavior', 'Environment separation',
  'Version immutability', 'Permission boundaries', 'Logging and behavioral evidence',
  'Material-change invalidation', 'Adversarial testing', 'Recovery and incident response',
  'Memory and persistence', 'Release ownership',
];

const answersWith = value => Object.fromEntries(QUESTIONS.map(question => [question.id, value]));

test('readiness check exposes exactly 15 concise questions in the required categories', () => {
  assert.equal(QUESTIONS.length, 15);
  assert.deepEqual(QUESTIONS.map(question => question.category), categories);
  assert.equal(new Set(QUESTIONS.map(question => question.id)).size, 15);
  for (const question of QUESTIONS) {
    assert.ok(question.title.length < 100);
    assert.ok(Object.keys(question.dimensions).length >= 1);
    assert.ok(question.why && question.nextControl);
  }
});

test('scoring is deterministic and preserves documented result boundaries', () => {
  const preparedA = calculateReadiness({ answers: answersWith('verified') });
  const preparedB = calculateReadiness({ answers: answersWith('verified') });
  assert.deepEqual(preparedA, preparedB);
  assert.equal(preparedA.category, 'Prepared for scoped assessment');
  assert.equal(preparedA.overallScore, 100);
  assert.equal(calculateReadiness({ answers: answersWith('partial') }).category, 'Control gaps remain');
  assert.equal(calculateReadiness({ answers: answersWith('none') }).category, 'Release blockers indicated');
});

test('risk-bearing capabilities increase the weight of weak related controls', () => {
  const answers = answersWith('verified');
  answers.permission_boundary = 'none';
  answers.prompt_exposure = 'partial';
  const baseline = calculateReadiness({ answers });
  const terminal = calculateReadiness({ answers, capabilities: ['terminal'] });
  assert.ok(terminal.overallScore < baseline.overallScore);
  assert.ok(terminal.dimensions.permissions.score < baseline.dimensions.permissions.score);
});

test('consequential authority with multiple absent hard controls indicates blockers', () => {
  const answers = answersWith('verified');
  answers.authority = 'planned';
  answers.approval = 'none';
  const result = calculateReadiness({ answers, capabilities: ['financial'] });
  assert.equal(result.category, 'Release blockers indicated');
  assert.match(result.restrictions.join(' '), /financial|approval/i);
});

test('not applicable is limited credit and can become a priority gap', () => {
  const answers = answersWith('verified');
  answers.memory = 'na';
  const result = calculateReadiness({ answers, capabilities: ['persistent_memory'] });
  assert.ok(result.dimensions.data.score < 100);
  assert.ok(result.priorityGaps.some(gap => gap.id === 'memory'));
});

test('highest-priority gaps are stable and include explanations and next controls', () => {
  const answers = answersWith('verified');
  answers.approval = 'none';
  answers.permission_boundary = 'planned';
  answers.logging = 'partial';
  const result = calculateReadiness({ answers, capabilities: ['write_delete', 'financial'] });
  assert.equal(result.priorityGaps.length, 3);
  assert.equal(result.priorityGaps[0].id, 'approval');
  for (const gap of result.priorityGaps) assert.ok(gap.why && gap.nextControl && gap.primaryDimension);
});

test('Permission Envelope generates valid JSON and YAML with every required structure', () => {
  const result = calculateReadiness({ answers: answersWith('verified'), capabilities: ['email'] });
  const envelope = generatePermissionEnvelope({
    agentName: 'Release agent', versionIdentifier: 'sha256:abc123', environment: 'staging',
    allowedTools: 'ticket.read\nemail.draft', approvedIdentities: 'release-reviewer', allowedSystems: 'example.test',
  }, result);
  const json = JSON.parse(permissionEnvelopeAsJson(envelope));
  const yaml = parseYaml(permissionEnvelopeAsYaml(envelope));
  assert.deepEqual(yaml, json);
  for (const field of ['agent_name', 'version_identifier', 'environment', 'allowed_tools', 'prohibited_operations', 'approved_identities', 'data_boundaries', 'human_approval_requirements', 'allowed_domains_or_systems', 'execution_limits', 'logging_requirements', 'invalidation_triggers']) {
    assert.ok(field in json, field);
  }
});

test('restart returns a clean, independent assessment state', () => {
  const first = createEmptyReadinessSession();
  first.answers.authority = 'verified';
  const restarted = createEmptyReadinessSession();
  assert.deepEqual(restarted, { answers: {}, profile: {}, currentQuestion: 0, result: null, envelope: null });
  assert.notEqual(first.answers, restarted.answers);
});

test('lead payload construction excludes answers, scores, profile detail, and envelope content', () => {
  const result = calculateReadiness({ answers: answersWith('partial') });
  const payload = buildLeadPayload({
    form: { fullName: 'Ada', email: 'ada@example.com', company: 'Example', agentName: 'Agent', context: 'Scope review', website: '', consent: true, answers: answersWith('none') },
    result: { ...result, answers: answersWith('verified'), envelope: { secret: true } },
    correlationMarker: 'marker_12345678',
  });
  assert.deepEqual(Object.keys(payload).sort(), ['agentName', 'company', 'consent', 'context', 'correlationMarker', 'email', 'fullName', 'readinessCategory', 'riskDimensions', 'website'].sort());
  assert.doesNotMatch(JSON.stringify(payload), /secret|overallScore|"answers"/);
});
