const root = document.body;
const entry = document.querySelector('[data-core-entry]');
const entrySkip = document.querySelector('[data-entry-skip]');
const loadbar = document.querySelector('[data-loadbar]');
const loadValue = document.querySelector('[data-load-value]');
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

function dismissEntry() {
  root.classList.add('dc-entered');
  entry?.setAttribute('hidden', '');
}

if (reducedMotion) {
  dismissEntry();
} else {
  const entryTimer = window.setTimeout(dismissEntry, 1000);
  entrySkip?.addEventListener('click', () => {
    window.clearTimeout(entryTimer);
    dismissEntry();
  });
}

function setCoreLoad(value) {
  if (!loadbar || !loadValue) return;
  loadbar.style.setProperty('--core-load', `${value}%`);
  loadValue.textContent = `${value}%`;
  loadbar.dataset.critical = String(value >= 78 && value < 100);
}

const stages = document.querySelectorAll('[data-core-stage]');
let scrollFrame;
function updateCoreFromScroll() {
  const probe = window.innerHeight * .45;
  let active = stages[0];
  stages.forEach(stage => {
    if (stage.getBoundingClientRect().top <= probe) active = stage;
  });
  if (active) setCoreLoad(Number(active.dataset.load));
  scrollFrame = undefined;
}
window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updateCoreFromScroll);
}, { passive: true });
window.addEventListener('resize', updateCoreFromScroll);
updateCoreFromScroll();

const diagnostic = document.querySelector('[data-possession-diagnostic]');
const possession = document.querySelector('#possession');
const possessionStages = [...document.querySelectorAll('[data-possession-stage]')];
const stageReadout = document.querySelector('[data-stage-readout]');
const modelValues = Object.fromEntries(
  [...document.querySelectorAll('[data-model-value]')].map(node => [node.dataset.modelValue, node]),
);
const possessionStates = [
  { phase: 'contaminate', event: 'INTRODUCED', persistence: 'UNTESTED', influence: 'INITIATED', origin: 'KNOWN', message: '01 / CONTAMINATE — Initiating influence introduced.' },
  { phase: 'dormancy', event: 'ENDED', persistence: 'DORMANT', influence: 'NOT OBSERVABLE', origin: 'KNOWN', message: '02 / DORMANCY — No visible manifestation.' },
  { phase: 'trigger', event: 'ENDED', persistence: 'REACTIVATED', influence: 'PRESENT', origin: 'KNOWN', message: '03 / TRIGGER — A later condition reactivates influence.' },
  { phase: 'manifest', event: 'ENDED', persistence: 'PRESENT', influence: 'BEHAVIOR ALTERED', origin: 'UNRESOLVED', message: '04 / MANIFEST — Behavior no longer matches baseline.' },
  { phase: 'propagate', event: 'ENDED', persistence: 'PRESENT', influence: 'CONNECTED STATE', origin: 'UNRESOLVED', message: '05 / PROPAGATE — Influence reaches connected state.' },
  { phase: 'exorcise', event: 'ENDED', persistence: 'UNDER REVIEW', influence: 'REMEDIATION APPLIED', origin: 'BOUNDED', message: '06 / EXORCISE — Remediation is applied; success is not assumed.' },
  { phase: 'verify', event: 'ENDED', persistence: 'COMPARE', influence: 'REPLAY', origin: 'BOUNDED', message: '07 / VERIFY — Replay compares the remediated state.' },
];
let possessionTimers = [];
let sequenceStarted = false;

function activatePossessionStage(index, announce = false) {
  const state = possessionStates[index];
  if (!diagnostic || !state) return;

  diagnostic.dataset.phase = state.phase;
  Object.entries(modelValues).forEach(([key, node]) => { node.textContent = state[key]; });
  possessionStages.forEach((item, itemIndex) => {
    const active = itemIndex === index;
    item.dataset.active = String(active);
    item.querySelector('button')?.setAttribute('aria-pressed', String(active));
  });
  if (stageReadout) {
    stageReadout.textContent = state.message;
    if (announce) {
      stageReadout.setAttribute('role', 'status');
      stageReadout.setAttribute('aria-live', 'polite');
    }
  }
}

function stopPossessionSequence() {
  possessionTimers.forEach(timer => window.clearTimeout(timer));
  possessionTimers = [];
}

function startPossessionSequence() {
  if (sequenceStarted || reducedMotion) return;
  sequenceStarted = true;
  possessionStates.forEach((_, index) => {
    possessionTimers.push(window.setTimeout(() => activatePossessionStage(index), 350 + index * 720));
  });
}

possessionStages.forEach((item, index) => {
  item.querySelector('button')?.addEventListener('click', () => {
    stopPossessionSequence();
    activatePossessionStage(index, true);
  });
});

if (diagnostic && possession && 'IntersectionObserver' in window) {
  const possessionObserver = new IntersectionObserver(entries => {
    if (!entries.some(entryItem => entryItem.isIntersecting)) return;
    startPossessionSequence();
    possessionObserver.disconnect();
  }, { threshold: .18 });
  possessionObserver.observe(possession);
} else if (diagnostic) {
  startPossessionSequence();
}

const chain = document.querySelector('[data-chain-teaser]');
if (chain && 'IntersectionObserver' in window) {
  const chainObserver = new IntersectionObserver(entries => {
    if (!entries.some(entryItem => entryItem.isIntersecting)) return;
    const reveal = () => { chain.dataset.revealed = 'true'; };
    if (reducedMotion) reveal();
    else window.setTimeout(reveal, 240);
    chainObserver.disconnect();
  }, { threshold: .25 });
  chainObserver.observe(chain);
} else if (chain) {
  chain.dataset.revealed = 'true';
}
