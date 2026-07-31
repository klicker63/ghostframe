export const SITE_URL = 'https://www.ghostframestudios.com';
export const CONTACT_EMAIL = 'klicker01@gmail.com';
export const REVIEW_SUBJECT = 'GhostGate Technical Review Request';
export const REVIEW_BODY = `Hello,

I would like to discuss how GhostGate could qualify exact AI-agent versions before production.

Company:
Role:
Agent use case:
Estimated number of agents or versions:
Current release or security concern:`;

export function buildReviewMailto() {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(REVIEW_SUBJECT)}&body=${encodeURIComponent(REVIEW_BODY)}`;
}
