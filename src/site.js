import './styles.css';
import './refine.css';
import './acquisition.css';
import './commercial.css';
import './commercial-fixes.css';
import './portfolio.css';
import './ghostframe.css';
import './demon-core.css';
import { buildReviewMailto } from './config.js';

document.documentElement.classList.add('js');

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
window.addEventListener('resize', () => window.innerWidth > 980 && setMenu(false));

document.querySelectorAll('[data-review-link]').forEach(link => {
  link.setAttribute('href', buildReviewMailto());
});

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
  document.querySelectorAll('[data-reveal]').forEach(node => { node.dataset.visible = 'true'; });
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
