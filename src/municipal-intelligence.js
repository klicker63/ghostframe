import './site.js';
import './municipal-intelligence.css';
import './municipal-intelligence-form.js';
import { createAnalytics, createFirstPartyAdapter } from './analytics.js';

const source = location.pathname.includes('sample-report')
  ? 'municipal_sample_report'
  : 'municipal_intelligence';
const analytics = createAnalytics({ adapter: createFirstPartyAdapter() });

analytics.track('page_view', { source });

document.querySelectorAll('[data-mi-primary-cta], [data-mi-sample-cta]').forEach(link => {
  link.addEventListener('click', () => analytics.track('primary_cta_click', {
    source: link.hasAttribute('data-mi-sample-cta') ? 'municipal_sample_report' : source,
  }));
});
