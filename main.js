'use strict';

// ─── Smooth Scroll ───────────────────────────────────────────────────────────
// Intercepts all internal anchor clicks and delegates to scrollIntoView so the
// nav offset (scroll-margin-top) and cross-browser easing are applied correctly.

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (href === '#' || href === '#!') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Keep the URL in sync without triggering a native jump
    history.pushState(null, '', href);
  });
});

// ─── Contact Form ────────────────────────────────────────────────────────────

const form       = document.querySelector('.contact-form');
const successMsg = document.getElementById('form-success');

if (form && successMsg) {
  form.addEventListener('submit', handleSubmit);

  // Re-validate on input after first failed attempt
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        validateField(field);
      }
    });
  });
}

function handleSubmit(e) {
  e.preventDefault();

  const fields = [
    { id: 'name',    errorId: 'name-error',    validate: validateName    },
    { id: 'email',   errorId: 'email-error',   validate: validateEmail   },
    { id: 'message', errorId: 'message-error', validate: validateMessage },
  ];

  let firstInvalid = null;

  fields.forEach(({ id, errorId, validate }) => {
    const field    = document.getElementById(id);
    const errorEl  = document.getElementById(errorId);
    const errorMsg = validate(field.value.trim());

    if (errorMsg) {
      markInvalid(field, errorEl, errorMsg);
      if (!firstInvalid) firstInvalid = field;
    } else {
      markValid(field, errorEl);
    }
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  submitForm();
}

function submitForm() {
  const submitBtn = form.querySelector('button[type="submit"]');

  submitBtn.disabled    = true;
  submitBtn.textContent = 'Sending…';

  // Simulated async submission — replace with real fetch() call
  setTimeout(() => {
    form.reset();
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Send message';

    // Show with slide-in animation
    successMsg.classList.remove('is-hiding');
    successMsg.hidden = false;
    successMsg.focus();

    // Fade out after 5 s, then fully hide once animation ends
    const hideTimer = setTimeout(() => {
      successMsg.classList.add('is-hiding');
      successMsg.addEventListener('animationend', () => {
        successMsg.hidden = true;
        successMsg.classList.remove('is-hiding');
      }, { once: true });
    }, 5000);

    // If the user submits again before the timer fires, cancel the old one
    form.addEventListener('submit', () => clearTimeout(hideTimer), { once: true });
  }, 1000);
}

// ─── Validators ──────────────────────────────────────────────────────────────

function validateName(value) {
  if (!value)         return 'Please enter your name.';
  if (value.length < 2) return 'Name must be at least 2 characters.';
  return null;
}

function validateEmail(value) {
  if (!value) return 'Please enter your email address.';
  // RFC-5322-lite pattern
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

function validateMessage(value) {
  if (!value)           return 'Please enter a message.';
  if (value.length < 10) return 'Message must be at least 10 characters.';
  return null;
}

// ─── ARIA helpers ─────────────────────────────────────────────────────────────

function markInvalid(field, errorEl, message) {
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', errorEl.id);
  errorEl.textContent = message;
}

function markValid(field, errorEl) {
  field.removeAttribute('aria-invalid');
  field.removeAttribute('aria-describedby');
  errorEl.textContent = '';
}
