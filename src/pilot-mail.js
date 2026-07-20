export const PILOT_EMAIL = 'klicker01@gmail.com';

const clean = value => String(value ?? '').trim();

export function buildPilotMailto(details) {
  const company = clean(details.company) || 'Unknown company';
  const subject = `GhostGate Private Pilot Inquiry — ${company}`;
  const body = [
    'GhostGate Private Pilot Request',
    '',
    `Name: ${clean(details.name)}`,
    `Work email: ${clean(details.email)}`,
    `Company: ${company}`,
    `Role: ${clean(details.role)}`,
    `Deployment stage: ${clean(details.stage)}`,
    '',
    'Agent access:',
    clean(details.access),
    '',
    'Evaluation goals:',
    clean(details.goal),
  ].join('\n');

  return `mailto:${PILOT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
