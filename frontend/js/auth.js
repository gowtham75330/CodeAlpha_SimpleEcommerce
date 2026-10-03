const TOKEN_KEY = 'hd_token';
const USER_KEY = 'hd_user';

const Auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  },

  isLoggedIn() {
    return Boolean(this.getToken());
  },

  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  requireLogin(redirectTo) {
    if (!this.isLoggedIn()) {
      const next = encodeURIComponent(redirectTo || window.location.pathname);
      window.location.href = `login.html?next=${next}`;
      return false;
    }
    return true;
  },

  updateNav() {
    const userSlot = document.querySelector('[data-auth-slot]');
    const user = this.getUser();
    if (!userSlot) return;

    if (user) {
      userSlot.innerHTML = `
        <a href="orders.html">My Orders</a>
        <span class="nav-user">${escapeHtml(user.name.split(' ')[0])}</span>
        <button class="linkish" type="button" data-logout>Log out</button>
      `;
      userSlot.querySelector('[data-logout]').addEventListener('click', () => {
        this.clearSession();
        window.location.href = 'index.html';
      });
    } else {
      userSlot.innerHTML = `
        <a href="login.html">Log in</a>
        <a href="register.html">Register</a>
      `;
    }

    const cartCount = document.querySelector('[data-cart-count]');
    if (cartCount && window.Cart) {
      const count = Cart.totalQuantity();
      cartCount.textContent = count;
      cartCount.hidden = count === 0;
    }
  }
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function setAlert(el, message, type) {
  if (!el) return;
  if (!message) {
    el.hidden = true;
    el.textContent = '';
    return;
  }
  el.hidden = false;
  el.className = `alert ${type || 'error'}`;
  el.textContent = message;
}

function money(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

function initLayout() {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[href]').forEach((link) => {
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
    }
  });

  Auth.updateNav();
}

window.Auth = Auth;
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.setAlert = setAlert;
window.money = money;

document.addEventListener('DOMContentLoaded', initLayout);
