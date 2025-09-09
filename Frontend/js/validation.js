// validation.js
// Minimal, robust client-side validation for both login and signup pages.
// Expects form id="form" and the following optional elements:
// Signup-only: firstname-input, email-input, repeat-password-input, role-select
// Both pages: collegeid-input, password-input
// Error output: element with id="error-message"

// Helper: safe query
const $ = (sel) => document.getElementById(sel);

// Elements (may be null depending on page)
const form = $('form') || $('form') /* fallback but we expect id="form" */;
const formById = $('#form') || form;
const firstname_input = $('firstname-input');
const email_input = $('email-input');
const collegeid_input = $('collegeid-input');
const role_select = $('role-select');
const password_input = $('password-input');
const repeat_password_input = $('repeat-password-input');
const error_message = $('error-message');

// Utility: numeric-only enforcement for college id inputs
if (collegeid_input) {
  collegeid_input.addEventListener('input', (e) => {
    const cleaned = e.target.value.replace(/\D+/g, '');
    if (e.target.value !== cleaned) e.target.value = cleaned;
  });
}

// Utilities
function isNumericStr(s) {
  return /^\d+$/.test(String(s || '').trim());
}
function isValidEmail(s) {
  return /^\S+@\S+\.\S+$/.test(String(s || '').trim());
}
function markIncorrect(el, flag = true) {
  if (!el) return;
  const wrapper = el.parentElement || el;
  if (flag) wrapper.classList.add('incorrect');
  else wrapper.classList.remove('incorrect');
}
function clearAllMarks() {
  ['firstname-input','email-input','collegeid-input','role-select','password-input','repeat-password-input']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el && el.parentElement) el.parentElement.classList.remove('incorrect');
    });
  if (error_message) error_message.textContent = '';
}

// Validation functions
function getSignupErrors(values) {
  const { firstname, email, collegeid, role, password, repeatPassword } = values;
  const errors = [];

  if (!firstname || firstname.trim() === '') {
    errors.push('Name is required');
    markIncorrect(firstname_input, true);
  }

  if (!email || email.trim() === '') {
    errors.push('Email is required');
    markIncorrect(email_input, true);
  } else if (!isValidEmail(email)) {
    errors.push('Invalid email format');
    markIncorrect(email_input, true);
  }

  if (!collegeid || collegeid.trim() === '') {
    errors.push('College ID is required');
    markIncorrect(collegeid_input, true);
  } else if (!isNumericStr(collegeid)) {
    errors.push('College ID must be numeric');
    markIncorrect(collegeid_input, true);
  }

  if (!role || role === '') {
    errors.push('Role is required');
    markIncorrect(role_select, true);
  }

  if (!password) {
    errors.push('Password is required');
    markIncorrect(password_input, true);
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
    markIncorrect(password_input, true);
  }

  if (password !== repeatPassword) {
    errors.push('Passwords do not match');
    markIncorrect(repeat_password_input, true);
    markIncorrect(password_input, true);
  }

  return errors;
}

function getLoginErrors(values) {
  const { collegeid, password } = values;
  const errors = [];

  if (!collegeid || collegeid.trim() === '') {
    errors.push('College ID is required');
    markIncorrect(collegeid_input, true);
  } else if (!isNumericStr(collegeid)) {
    errors.push('College ID must be numeric');
    markIncorrect(collegeid_input, true);
  }

  if (!password) {
    errors.push('Password is required');
    markIncorrect(password_input, true);
  }

  return errors;
}

// Attach submit handler
if (formById) {
  formById.addEventListener('submit', function (e) {
    clearAllMarks();

    // Gather current values (guard for null elements)
    const values = {
      firstname: firstname_input ? firstname_input.value : '',
      email: email_input ? email_input.value : '',
      collegeid: collegeid_input ? collegeid_input.value : '',
      role: role_select ? role_select.value : '',
      password: password_input ? password_input.value : '',
      repeatPassword: repeat_password_input ? repeat_password_input.value : ''
    };

    // Decide whether this is signup (presence of firstname_input) or login
    let errors = [];
    if (firstname_input || repeat_password_input || role_select) {
      // signup page
      errors = getSignupErrors(values);
    } else {
      // login page
      errors = getLoginErrors(values);
    }

    if (errors.length > 0) {
      e.preventDefault();
      // Show errors (joined)
      if (error_message) {
        error_message.textContent = errors.join('. ');
        error_message.setAttribute('role','alert');
      } else {
        // fallback alert
        alert(errors.join('\n'));
      }
      // keep focus on first incorrect field
      const firstIncorrect = document.querySelector('.incorrect input, .incorrect select');
      if (firstIncorrect) firstIncorrect.focus();
      return false;
    }

    // No saving / no redirection here — allow normal submit if you have backend later.
    // If you want to *prevent* submission until backend is ready, uncomment the next line:
    // e.preventDefault();

    return true;
  });
} else {
  // try to find any form element on page if id differs
  const anyForm = document.querySelector('form');
  if (anyForm) {
    anyForm.addEventListener('submit', function (e) {
      // same handler but simpler: do nothing to alter behavior unless you ask me to patch further.
    });
  }
}
