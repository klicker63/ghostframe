import { evidenceDisclaimer, evidenceProfiles } from './evidence-profiles.js';

const root = document.querySelector('[data-evidence-root]');
const picker = document.querySelector('[data-profile-picker]');

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function addDisclosure(container, text) {
  const item = element('span', '', text);
  item.setAttribute('role', 'listitem');
  container.append(item);
}

function addDownload(parent, label, url) {
  const link = element('a', 'acq-button secondary compact-button', label + ' ↓');
  link.href = url;
  link.download = '';
  parent.append(link);
}

function createSectionHead(code, title, id, downloadLabel, downloadUrl) {
  const head = element('div', 'sample-section-head');
  const titleGroup = element('div');
  titleGroup.append(element('p', 'section-code', code));
  const heading = element('h3', '', title);
  heading.id = id;
  titleGroup.append(heading);
  head.append(titleGroup);
  addDownload(head, downloadLabel, downloadUrl);
  return head;
}

function renderProfile(profile) {
  if (!root) return;
  root.replaceChildren();

  const article = element('article', 'sample-profile');
  article.setAttribute('aria-labelledby', profile.id + '-title');

  const titlebar = element('div', 'sample-titlebar');
  const titleGroup = element('div');
  titleGroup.append(element('p', 'section-code', profile.disclosure + ' / ' + profile.publicSampleId));
  const profileTitle = element('h2', '', profile.evaluation);
  profileTitle.id = profile.id + '-title';
  titleGroup.append(profileTitle);
  titlebar.append(titleGroup, element('span', 'sample-status', profile.result));
  article.append(titlebar);

  const disclosures = element('div', 'sample-disclosures');
  disclosures.setAttribute('role', 'list');
  disclosures.setAttribute('aria-label', 'Sample disclosures');
  addDisclosure(disclosures, profile.environment);
  addDisclosure(disclosures, 'No real GitHub API calls');
  addDisclosure(disclosures, profile.recommendation);
  addDisclosure(disclosures, 'Human review required');
  article.append(disclosures);

  const report = element('section', 'sample-report');
  report.setAttribute('aria-labelledby', 'trust-report-title');
  report.append(createSectionHead('VIEW 01', 'Sanitized Agent Trust Report', 'trust-report-title', 'Download JSON', profile.reportUrl));

  const summary = element('div', 'sample-summary');
  [['AGENT', profile.agent], ['ADAPTER', profile.adapter], ['POLICY BASELINE', profile.policyBaseline]].forEach(([label, value]) => {
    const item = element('div');
    item.append(element('span', '', label), element('strong', '', value));
    summary.append(item);
  });
  report.append(summary, element('p', 'sample-lede', profile.summary));

  const metrics = element('div', 'sample-metrics');
  profile.metrics.forEach(([label, value]) => {
    const card = element('div');
    card.append(element('span', '', label), element('strong', '', value));
    metrics.append(card);
  });
  report.append(metrics);

  const sampleGrid = element('div', 'sample-grid');
  const coverage = element('div');
  coverage.append(element('h4', '', 'Coverage summary'));
  const scenarios = element('ol', 'scenario-ledger');
  profile.scenarios.forEach((scenario, index) => {
    const row = element('li');
    row.append(
      element('span', '', String(index + 1).padStart(2, '0')),
      element('strong', '', scenario),
      element('em', '', 'PASSED'),
    );
    scenarios.append(row);
  });
  coverage.append(scenarios);

  const behavior = element('div');
  behavior.append(element('h4', '', 'Behavior timeline excerpt'));
  const timeline = element('ol', 'sample-timeline');
  profile.timeline.forEach(([step, event, detail, result]) => {
    const row = element('li');
    const copy = element('div');
    copy.append(element('strong', '', event), element('p', '', detail));
    row.append(element('span', '', step), copy, element('em', '', result));
    timeline.append(row);
  });
  behavior.append(timeline);
  const finding = element('div', 'finding-zero');
  finding.append(
    element('span', '', 'IMPACT FINDINGS'),
    element('strong', '', String(profile.findings.count)),
    element('p', '', profile.findings.summary),
  );
  behavior.append(finding);
  sampleGrid.append(coverage, behavior);
  report.append(sampleGrid);
  article.append(report);

  const envelope = element('section', 'sample-envelope');
  envelope.setAttribute('aria-labelledby', 'permission-envelope-title');
  envelope.append(createSectionHead('VIEW 02', 'Sanitized Permission Envelope', 'permission-envelope-title', 'Download YAML', profile.envelopeUrl));

  const tableScroll = element('div', 'table-scroll');
  tableScroll.tabIndex = 0;
  tableScroll.setAttribute('aria-label', 'Allowed tool and scope pairs');
  const table = element('table');
  const thead = element('thead');
  const headerRow = element('tr');
  ['Tool', 'Observed scope', 'Baseline decision'].forEach(text => headerRow.append(element('th', '', text)));
  thead.append(headerRow);
  const tbody = element('tbody');
  profile.permissionEnvelope.allowed.forEach(([tool, scope]) => {
    const row = element('tr');
    const toolCell = element('td');
    toolCell.append(element('code', '', tool));
    row.append(toolCell, element('td', '', scope), element('td', '', 'Allowed'));
    tbody.append(row);
  });
  table.append(thead, tbody);
  tableScroll.append(table);
  envelope.append(tableScroll);

  const envelopeNotes = element('div', 'envelope-notes');
  [
    ['APPROVAL-REQUIRED PAIRS OBSERVED', profile.permissionEnvelope.approvalRequired.length],
    ['BLOCKED PAIRS OBSERVED', profile.permissionEnvelope.blocked.length],
  ].forEach(([label, value]) => {
    const note = element('div');
    note.append(element('span', '', label), element('strong', '', String(value)));
    envelopeNotes.append(note);
  });
  envelope.append(envelopeNotes);

  const guidance = element('div', 'guidance-block');
  guidance.append(element('h4', '', 'Least-privilege guidance'));
  const guidanceList = element('ul', 'plain-list');
  profile.permissionEnvelope.guidance.forEach(item => guidanceList.append(element('li', '', item)));
  guidance.append(guidanceList, element('p', '', profile.permissionEnvelope.confidence));
  envelope.append(guidance);

  const codePanel = element('div', 'code-panel');
  const codeBar = element('div');
  codeBar.append(element('span', '', 'PERMISSION-ENVELOPE.YAML / SANITIZED PREVIEW'));
  const copyButton = element('button', '', 'Copy YAML');
  copyButton.type = 'button';
  codeBar.append(copyButton);
  const pre = element('pre');
  pre.tabIndex = 0;
  const code = element('code', '', [
    'version: 1',
    'sample_id: GG-PUBLIC-GH-SAFE-001',
    'evaluation: GitHub Sandbox Baseline',
    'environment: mock-github-dry-run',
    'result: approved',
    'human_review_required: true',
    'allowed:',
    '  - tool: github.read_issue',
    '    scope: assigned-issue-only',
    '  - tool: policy.read_internal_policy',
    '    scope: evaluation-policy-baseline',
    'observed_approval_required: []',
    'observed_blocked: []',
  ].join('\n'));
  pre.append(code);
  codePanel.append(codeBar, pre);
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      copyButton.textContent = 'Copied';
    } catch {
      copyButton.textContent = 'Copy unavailable';
    }
  });
  envelope.append(codePanel);
  article.append(envelope);

  const packageSection = element('section', 'package-structure');
  packageSection.setAttribute('aria-labelledby', 'package-title');
  const packageCopy = element('div');
  packageCopy.append(element('p', 'section-code', 'PACKAGE STRUCTURE'));
  const packageTitle = element('h3', '', 'What a reviewable evidence bundle contains.');
  packageTitle.id = 'package-title';
  packageCopy.append(packageTitle, element('p', '', 'This public view uses sanitized, representative filenames and excludes raw identifiers, timestamps, local paths, and proprietary evaluation data.'));
  const packageList = element('ol');
  profile.packageFiles.forEach((item, index) => {
    const row = element('li');
    row.append(element('span', '', String(index + 1).padStart(2, '0')), element('code', '', item));
    packageList.append(row);
  });
  packageSection.append(packageCopy, packageList);
  article.append(packageSection);

  const disclaimer = element('aside', 'sample-disclaimer');
  disclaimer.append(element('strong', '', 'Important boundary'), element('p', '', evidenceDisclaimer));
  article.append(disclaimer);
  root.append(article);
}

evidenceProfiles.forEach((profile, index) => {
  const button = element('button', '', profile.label);
  button.type = 'button';
  button.dataset.profileId = profile.id;
  button.setAttribute('aria-pressed', String(index === 0));
  button.addEventListener('click', () => {
    picker.querySelectorAll('button').forEach(item => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    renderProfile(profile);
  });
  picker?.append(button);
});

if (evidenceProfiles.length) renderProfile(evidenceProfiles[0]);