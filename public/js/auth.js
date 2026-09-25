/**
 * Auth pages – shared JavaScript
 * Handles password visibility toggles.
 */

/**
 * Toggle password field visibility.
 * @param {string} fieldId - The ID of the password input
 * @param {HTMLButtonElement} btn - The toggle button
 */
function togglePassword(fieldId, btn) {
  const input = document.getElementById(fieldId);
  const icon = document.getElementById('eye-icon-' + fieldId);

  if (!input || !icon) return;

  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';

  // Swap icon between eye and eye-off
  if (isPassword) {
    icon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>`;
    btn.setAttribute('aria-label', 'Hide password');
  } else {
    icon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>`;
    btn.setAttribute('aria-label', 'Show password');
  }

  // Return focus to input
  input.focus();
}
