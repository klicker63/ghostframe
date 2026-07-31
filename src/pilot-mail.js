export const PILOT_EMAIL = 'hello@ghostframestudios.com';

const clean = value => String(value ?? '').trim();

export function buildPilotMailto(details) {
  const company = clean(details.company) || 'Unknown company';
  const subject = 'GhostGate Private Pilot Inquiry — ' + company;
  const body = [
    'GhostGate Private Pilot Request',
    '',
    'Name: ' + clean(details.name),
    'Work email: ' + clean(details.email),
    'Company: ' + company,
    'Role: ' + clean(details.role),
    'Agent or product: ' + clean(details.agentProduct),
    'Deployment stage: ' + clean(details.stage),
    '',
    'Agent access:',
    clean(details.access),
    '',
    'Desired outcome:',
    clean(details.outcome),
    '',
    'Additional context:',
    clean(details.message) || 'Not provided',
  ].join('\n');

  return 'mailto:' + PILOT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}