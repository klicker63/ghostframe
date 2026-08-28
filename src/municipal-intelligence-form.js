const form = document.querySelector('[data-mi-intake-form]');
const status = document.querySelector('[data-mi-form-status]');
const fallback = document.querySelector('[data-mi-form-fallback]');
const success = document.querySelector('[data-mi-form-success]');
const submissionId = document.querySelector('[data-mi-submission-id]');
const submitButton = form?.querySelector('button[type="submit"]');

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
  submitButton.innerHTML = busy
    ? 'Sending coverage request…'
    : 'Submit for coverage review <span aria-hidden="true">↗</span>';
}

form?.addEventListener('submit', async event => {
  event.preventDefault();
  fallback?.setAttribute('hidden', '');
  setStatus('');

  if (!form.reportValidity()) return;

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.requestedScope = formData.getAll('requestedScope');
  payload.lawfulPurpose = formData.get('lawfulPurpose') === 'acknowledged';
  payload.privacyAcknowledgement = formData.get('privacyAcknowledgement') === 'acknowledged';

  if (payload.requestedScope.length === 0) {
    setStatus('Select at least one requested research area.');
    form.querySelector('[name="requestedScope"]')?.focus();
    return;
  }

  setBusy(true);

  try {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (import.meta.env.DEV) {
      const previewState = new URLSearchParams(location.search).get('preview_delivery');
      if (previewState === 'success' || previewState === 'error') {
        headers['X-GhostFrame-Preview-State'] = previewState;
      }
    }

    const response = await fetch('/api/municipal-intelligence-lead', {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(result.error || 'The coverage request could not be sent. Review the form and try again.');
      if (response.status === 502 || response.status === 503) fallback?.removeAttribute('hidden');
      return;
    }

    form.hidden = true;
    if (submissionId) submissionId.textContent = result.submissionId;
    success?.removeAttribute('hidden');
    success?.focus();
  } catch {
    setStatus('Online delivery is unavailable. Please use the direct email option.');
    fallback?.removeAttribute('hidden');
  } finally {
    setBusy(false);
  }
});
