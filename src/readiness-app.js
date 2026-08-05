import './readiness.css';
import './readiness-results-polish.css';
import {
  ANSWER_OPTIONS,
  CAPABILITIES,
  QUESTIONS,
  buildLeadPayload,
  buildResultSummary,
  calculateReadiness,
  createEmptyReadinessSession,
  generatePermissionEnvelope,
  permissionEnvelopeAsJson,
  permissionEnvelopeAsYaml,
} from './readiness-engine.js';
import { createAnalytics, createDebugAdapter, decorateWithUtm, getUtmContext } from './analytics.js';

const panels = {
  intro: document.querySelector('[data-panel="intro"]'),
  profile: document.querySelector('[data-panel="profile"]'),
  questions: document.querySelector('[data-panel="questions"]'),
  results: document.querySelector('[data-panel="results"]'),
};
const profileForm = document.querySelector('[data-profile-form]');
const questionForm = document.querySelector('[data-question-form]');
const questionContent = document.querySelector('[data-question-content]');
const progressText = document.querySelector('[data-progress-text]');
const progressBar = document.querySelector('[data-progress-bar]');
const questionError = document.querySelector('[data-question-error]');
const previousButton = document.querySelector('[data-question-previous]');
const nextButton = document.querySelector('[data-question-next]');
const inspector = document.querySelector('[data-analytics-inspector]');
const inspectorLog = document.querySelector('[data-analytics-log]');

let currentQuestion = 0;
let answers = {};
let profile = {};
let result;
let envelope;
let leadFormStarted = false;
let resultDownloadUrl;
const utmContext = getUtmContext();
const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const debugEnabled = import.meta.env.DEV && new URLSearchParams(location.search).get('analytics_debug') === '1';
const analytics = createAnalytics({
  context: utmContext,
  adapter: debugEnabled ? createDebugAdapter(payload => {
    inspector?.removeAttribute('hidden');
    if (inspectorLog) inspectorLog.textContent = `${JSON.stringify(payload)}\n${inspectorLog.textContent}`.slice(0, 5000);
  }) : undefined,
});

function showPanel(name) {
  Object.entries(panels).forEach(([key, panel]) => { if (panel) panel.hidden = key !== name; });
  panels[name]?.querySelector('h1, h2, [tabindex="-1"]')?.focus({ preventScroll: true });
  panels[name]?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
}

document.querySelectorAll('[data-start-assessment]').forEach(button => {
  button.addEventListener('click', () => showPanel('profile'));
});

document.querySelector('[data-review-intro]')?.addEventListener('click', () => showPanel('intro'));

function renderCapabilities() {
  const root = document.querySelector('[data-capability-list]');
  if (!root) return;
  root.replaceChildren(...CAPABILITIES.map(capability => {
    const label = document.createElement('label');
    label.className = 'rr-capability';
    label.innerHTML = `<input type="checkbox" name="capability" value="${capability.id}"><span><strong>${capability.label}</strong><small>${capability.description}</small></span>`;
    return label;
  }));
}

function renderQuestion(index) {
  const question = QUESTIONS[index];
  if (!question || !questionContent) return;
  const selected = answers[question.id];
  questionContent.innerHTML = `
    <fieldset class="rr-question-fieldset">
      <legend><span>${String(index + 1).padStart(2, '0')} / ${question.category}</span>${question.title}</legend>
      <p id="question-help">${question.prompt}</p>
      <div class="rr-options">
        ${ANSWER_OPTIONS.map(option => `<label><input type="radio" name="maturity" value="${option.value}" ${selected === option.value ? 'checked' : ''}><span>${option.label}</span></label>`).join('')}
      </div>
    </fieldset>`;
  progressText.textContent = `Question ${index + 1} of ${QUESTIONS.length}: ${question.category}`;
  progressBar.style.width = `${((index + 1) / QUESTIONS.length) * 100}%`;
  progressBar.parentElement?.setAttribute('aria-valuenow', String(index + 1));
  previousButton.disabled = index === 0;
  nextButton.textContent = index === QUESTIONS.length - 1 ? 'Generate results' : 'Next control';
  questionError.hidden = true;
  questionContent.querySelector('input:checked, input')?.focus();
}

profileForm?.addEventListener('submit', event => {
  event.preventDefault();
  if (!profileForm.reportValidity()) return;
  const data = new FormData(profileForm);
  profile = {
    agentName: data.get('agentName'),
    versionIdentifier: data.get('versionIdentifier'),
    environment: data.get('environment'),
    allowedTools: data.get('allowedTools'),
    approvedIdentities: data.get('approvedIdentities'),
    allowedSystems: data.get('allowedSystems'),
    capabilities: data.getAll('capability'),
  };
  analytics.track('readiness_check_started', { source: 'readiness_tool' });
  currentQuestion = 0;
  showPanel('questions');
  renderQuestion(currentQuestion);
});

questionForm?.addEventListener('submit', event => {
  event.preventDefault();
  const selected = questionForm.elements.maturity?.value;
  if (!selected) {
    questionError.hidden = false;
    questionError.textContent = 'Choose the control maturity that best matches the current release.';
    questionContent?.querySelector('input')?.focus();
    return;
  }
  const question = QUESTIONS[currentQuestion];
  answers[question.id] = selected;
  analytics.track('readiness_question_completed', { question_number: currentQuestion + 1, question_category: question.category });
  if (currentQuestion < QUESTIONS.length - 1) {
    currentQuestion += 1;
    renderQuestion(currentQuestion);
    return;
  }
  renderResults();
});

previousButton?.addEventListener('click', () => {
  const selected = questionForm.elements.maturity?.value;
  if (selected) answers[QUESTIONS[currentQuestion].id] = selected;
  if (currentQuestion > 0) currentQuestion -= 1;
  renderQuestion(currentQuestion);
});

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function renderResults() {
  result = calculateReadiness({ answers, capabilities: profile.capabilities });
  envelope = generatePermissionEnvelope(profile, result);
  if (resultDownloadUrl) URL.revokeObjectURL(resultDownloadUrl);
  resultDownloadUrl = URL.createObjectURL(new Blob([buildResultSummary(profile, result, envelope)], { type: 'text/markdown;charset=utf-8' }));
  document.querySelector('[data-download-result]').href = resultDownloadUrl;
  document.querySelector('[data-result-category]').textContent = result.category;
  document.querySelector('[data-result-summary]').textContent = result.categoryKey === 'prepared'
    ? 'Meaningful controls are present. The next step is to define the exact version, test scope, and Permission Envelope for independent assessment.'
    : result.categoryKey === 'gaps'
      ? 'The agent may be testable, but important permission, approval, evidence, or version-control work remains.'
      : 'Consequential authority is paired with missing or immature release controls. Restrict the agent before production use.';

  const dimensionRoot = document.querySelector('[data-dimensions]');
  dimensionRoot.replaceChildren(...Object.values(result.dimensions).map(dimension => {
    const item = document.createElement('li');
    item.dataset.band = dimension.band.toLowerCase();
    item.innerHTML = `<div><strong>${dimension.label}</strong><span>${dimension.band} / ${dimension.score} of 100</span></div><div class="rr-dimension-track" aria-hidden="true"><span style="width:${dimension.score}%"></span></div>`;
    return item;
  }));

  const gapsRoot = document.querySelector('[data-priority-gaps]');
  gapsRoot.replaceChildren(...result.priorityGaps.map((gap, index) => {
    const article = document.createElement('article');
    article.append(textElement('span', 'rr-gap-index', `Priority ${index + 1} / ${gap.category}`));
    article.append(textElement('h3', '', gap.title));
    article.append(textElement('p', '', gap.why));
    const next = textElement('p', 'rr-next-control', gap.nextControl);
    next.prepend(textElement('strong', '', 'Recommended next control: '));
    article.append(next);
    return article;
  }));

  const restrictionsRoot = document.querySelector('[data-restrictions]');
  restrictionsRoot.replaceChildren(...result.restrictions.map(restriction => textElement('li', '', restriction)));
  document.querySelector('[data-envelope-output]').textContent = permissionEnvelopeAsJson(envelope);
  document.querySelector('[data-lead-category]').value = result.category;
  analytics.track('readiness_check_completed', { readiness_category: result.category, dimension_count: Object.keys(result.dimensions).length });
  showPanel('results');
}

async function copyText(value, button, format) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
  const original = button.textContent;
  button.textContent = 'Copied';
  setTimeout(() => { button.textContent = original; }, 1600);
  analytics.track('permission_envelope_copied', { format });
}

document.querySelector('[data-copy-json]')?.addEventListener('click', event => copyText(permissionEnvelopeAsJson(envelope), event.currentTarget, 'json'));
document.querySelector('[data-copy-yaml]')?.addEventListener('click', event => copyText(permissionEnvelopeAsYaml(envelope), event.currentTarget, 'yaml'));

document.querySelector('[data-download-result]')?.addEventListener('click', () => {
  analytics.track('result_downloaded', { format: 'markdown' });
});

document.querySelectorAll('[data-release-check-cta]').forEach(link => {
  link.href = decorateWithUtm(link.getAttribute('href'), utmContext);
  link.addEventListener('click', () => analytics.track('release_check_cta_clicked', { readiness_category: result?.category ?? 'not_completed', source: 'readiness_tool' }));
});

document.querySelectorAll('[data-launch-asset-link]').forEach(link => {
  link.addEventListener('click', () => analytics.track('launch_asset_link_clicked', { source: link.dataset.launchAssetLink || 'unknown' }));
});

document.querySelector('[data-restart]')?.addEventListener('click', () => {
  const empty = createEmptyReadinessSession();
  answers = empty.answers;
  profile = empty.profile;
  result = empty.result;
  envelope = empty.envelope;
  currentQuestion = empty.currentQuestion;
  if (resultDownloadUrl) URL.revokeObjectURL(resultDownloadUrl);
  resultDownloadUrl = undefined;
  leadFormStarted = false;
  profileForm?.reset();
  document.querySelector('[data-lead-form]')?.reset();
  showPanel('intro');
});

const leadForm = document.querySelector('[data-lead-form]');
leadForm?.addEventListener('focusin', () => {
  if (leadFormStarted) return;
  leadFormStarted = true;
  analytics.track('lead_form_started', { readiness_category: result?.category ?? 'not_completed' });
}, { once: true });

leadForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const status = document.querySelector('[data-lead-status]');
  const submit = leadForm.querySelector('button[type="submit"]');
  status.hidden = true;
  if (!leadForm.reportValidity()) return;
  const data = new FormData(leadForm);
  const payload = buildLeadPayload({
    form: {
      fullName: data.get('fullName'), email: data.get('email'), company: data.get('company'),
      agentName: data.get('agentName'), context: data.get('context'), website: data.get('website'),
      consent: data.get('consent') === 'agreed',
    },
    result,
    correlationMarker: crypto.randomUUID?.() ?? `rr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
  });
  submit.disabled = true;
  submit.setAttribute('aria-busy', 'true');
  submit.textContent = 'Sending…';
  try {
    const response = await fetch('/api/readiness-lead', {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    status.textContent = response.ok ? 'Request received. GhostFrame will review the release context and follow up.' : (body.error || 'The request could not be sent. Use the direct Release Check request instead.');
    status.dataset.kind = response.ok ? 'success' : 'error';
    status.hidden = false;
    status.focus();
    if (response.ok) {
      analytics.track('lead_form_submitted', { readiness_category: result.category });
      leadForm.querySelectorAll('input, textarea, button').forEach(control => { control.disabled = true; });
    }
  } catch {
    status.textContent = 'Online delivery is unavailable. Use the direct Release Check request instead.';
    status.dataset.kind = 'error';
    status.hidden = false;
    status.focus();
  } finally {
    if (!status || status.dataset.kind !== 'success') submit.disabled = false;
    submit.removeAttribute('aria-busy');
    submit.textContent = 'Ask GhostFrame to qualify this release';
  }
});

renderCapabilities();
