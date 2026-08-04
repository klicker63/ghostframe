import './release-check.css';

const form = document.querySelector('[data-release-check-form]');
const status = document.querySelector('[data-form-status]');
const submitButton = form?.querySelector('button[type="submit"]');
const successPanel = document.querySelector('[data-form-success]');
const fallback = document.querySelector('[data-form-fallback]');

function setStatus(message, kind = 'error') {
  if (!status) return;
  status.textContent = message;
  status.dataset.kind = kind;
  status.hidden = !message;
  if (message) status.focus();
}

function setBusy(busy) {
  if (!submitButton) return;
  submitButton.disabled = busy;
  submitButton.setAttribute('aria-busy', String(busy));
  submitButton.textContent = busy ? 'Sending request…' : 'Submit for scope review';
}

form?.addEventListener('submit', async event => {
  event.preventDefault();
  fallback?.setAttribute('hidden', '');
  setStatus('');

  if (!form.reportValidity()) return;

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.consent = formData.get('consent') === 'acknowledged';

  setBusy(true);

  try {
    const response = await fetch('/api/release-check-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(result.error || 'The request could not be sent. Review the form and try again.');
      if (response.status === 502 || response.status === 503) fallback?.removeAttribute('hidden');
      return;
    }

    form.hidden = true;
    successPanel?.removeAttribute('hidden');
    successPanel?.focus();
  } catch {
    setStatus('Online delivery is unavailable. Please use the direct email option.');
    fallback?.removeAttribute('hidden');
  } finally {
    setBusy(false);
  }
});
