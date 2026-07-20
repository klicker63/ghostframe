import './styles.css';
import './refine.css';
import './acquisition.css';
import { buildPilotMailto } from './pilot-mail.js';

const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');

if (nav) {
  nav.id = 'site-navigation';
  menuButton?.setAttribute('aria-controls', nav.id);
}

function setMenu(open) {
  if (!menuButton || !nav) return;
  menuButton.setAttribute('aria-expanded', String(open));
  nav.dataset.open = String(open);
  document.body.classList.toggle('menu-open', open);
}

menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('click', event => event.target.closest('a') && setMenu(false));
window.addEventListener('keydown', event => event.key === 'Escape' && setMenu(false));

document.querySelectorAll('[data-year]').forEach(node => {
  node.textContent = new Date().getFullYear();
});

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.dataset.visible = 'true';
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('[data-reveal]').forEach(node => observer.observe(node));
} else {
  document.querySelectorAll('[data-reveal]').forEach(node => {
    node.dataset.visible = 'true';
  });
}

if (!reducedMotion && window.matchMedia?.('(pointer: fine)').matches) {
  document.querySelectorAll('[data-depth]').forEach(section => {
    section.addEventListener('pointermove', event => {
      const bounds = section.getBoundingClientRect();
      section.style.setProperty('--px', ((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
      section.style.setProperty('--py', ((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
    });
    section.addEventListener('pointerleave', () => {
      section.style.setProperty('--px', 0);
      section.style.setProperty('--py', 0);
    });
  });
}

document.querySelectorAll('.build-row button').forEach(button => {
  button.addEventListener('click', () => {
    const row = button.closest('.build-row');
    const willOpen = row.dataset.open !== 'true';
    document.querySelectorAll('.build-row[data-open="true"]').forEach(openRow => {
      openRow.dataset.open = 'false';
      openRow.querySelector('button')?.setAttribute('aria-expanded', 'false');
    });
    row.dataset.open = String(willOpen);
    button.setAttribute('aria-expanded', String(willOpen));
  });
});

const pilotForm = document.querySelector('[data-pilot-form]');

pilotForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const status = pilotForm.querySelector('[data-form-status]');
  const submitButton = pilotForm.querySelector('[data-submit-button]');
  const fallback = pilotForm.querySelector('[data-pilot-fallback]');
  const controls = [...pilotForm.querySelectorAll('input, textarea, select')];
  const invalid = controls.filter(control => !control.checkValidity());

  controls.forEach(control => {
    if (control.checkValidity()) control.removeAttribute('aria-invalid');
    else control.setAttribute('aria-invalid', 'true');
  });

  if (invalid.length) {
    status.dataset.state = 'error';
    status.textContent = 'Complete the required fields and confirm the sensitive-data notice.';
    invalid[0].focus();
    return;
  }

  const details = Object.fromEntries(new FormData(pilotForm));
  details.consent = details.consent === 'true';
  fallback.href = buildPilotMailto(details);
  submitButton.disabled = true;
  submitButton.setAttribute('aria-busy', 'true');
  status.dataset.state = 'pending';
  status.textContent = 'Sending your private-pilot request…';

  try {
    const response = await fetch('/api/pilot-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || 'Online delivery failed.');
    }

    pilotForm.reset();
    controls.forEach(control => control.removeAttribute('aria-invalid'));
    status.dataset.state = 'success';
    status.textContent = result.message || 'Your private-pilot request was sent to GhostFrame Studios.';
  } catch (error) {
    status.dataset.state = 'error';
    status.textContent = error.message + ' Use the direct email link below to send the prepared request.';
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
  }
});
