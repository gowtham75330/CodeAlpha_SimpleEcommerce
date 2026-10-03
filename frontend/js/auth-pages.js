function redirectAfterAuth(fallback = 'index.html') {
  const next = new URLSearchParams(window.location.search).get('next');
  if (next && /^[-a-zA-Z0-9_./?=&%]+$/.test(next) && !next.startsWith('//') && !next.includes('://')) {
    window.location.href = next;
  } else {
    window.location.href = fallback;
  }
}
function initAuthPages() {
  const alert = document.getElementById('auth-alert');
  if (Auth.isLoggedIn()) return redirectAfterAuth();
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const submit = async (form, path, payload) => {
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    setAlert(alert, '', '');
    try {
      const response = await API.request(path, { method: 'POST', body: JSON.stringify(payload) });
      Auth.setSession(response.data.token, response.data.user);
      redirectAfterAuth('index.html');
    } catch (err) {
      setAlert(alert, err.message, 'error');
      button.disabled = false;
    }
  };
  if (loginForm) loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    submit(loginForm, '/auth/login', { email: data.get('email'), password: data.get('password') });
  });
  if (registerForm) registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(registerForm);
    const password = String(data.get('password') || '');
    if (password.length < 8) return setAlert(alert, 'Password must be at least 8 characters.', 'error');
    submit(registerForm, '/auth/register', { name: data.get('name'), email: data.get('email'), password });
  });
}
document.addEventListener('DOMContentLoaded', initAuthPages);
