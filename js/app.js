const App = {
  init() {
    Storage.get();
    this.bindLogin();
    this.bindGlobal();

    if (Auth.isLoggedIn()) {
      this.showApp();
    } else {
      this.showLogin();
    }
  },

  showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
  },

  showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    this.renderSidebar();
    this.updateUserInfo();
    Router.init();
  },

  renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = Auth.getNavItems().map(item => `
      <button class="nav-item" data-page="${item.id}">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
      </button>
    `).join('');

    nav.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => Router.navigate(btn.dataset.page));
    });
  },

  updateUserInfo() {
    const session = Auth.getSession();
    document.getElementById('user-name').textContent = session.name;
    document.getElementById('user-role').textContent = session.role.charAt(0).toUpperCase() + session.role.slice(1);
    document.getElementById('user-avatar').textContent = session.name.charAt(0).toUpperCase();
  },

  bindLogin() {
    document.getElementById('login-form').addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const errorEl = document.getElementById('login-error');

      const session = Auth.login(email, password);
      if (!session) {
        errorEl.textContent = 'Invalid email or password';
        errorEl.classList.remove('hidden');
        return;
      }
      errorEl.classList.add('hidden');
      this.showApp();
      UI.toast(`Welcome, ${session.name}!`);
    });

    document.querySelectorAll('.demo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('login-email').value = btn.dataset.email;
        document.getElementById('login-password').value = btn.dataset.pass;
      });
    });
  },

  bindGlobal() {
    document.getElementById('logout-btn').addEventListener('click', () => {
      Auth.logout();
      this.showLogin();
      UI.toast('Logged out');
    });

    document.getElementById('modal-close').addEventListener('click', () => UI.hideModal());
    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target === e.currentTarget) UI.hideModal();
    });

    document.getElementById('menu-toggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    document.getElementById('theme-toggle').addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
      document.getElementById('theme-toggle').textContent = isDark ? '🌙' : '☀️';
      localStorage.setItem('edumanage_theme', isDark ? 'light' : 'dark');
    });

    const savedTheme = localStorage.getItem('edumanage_theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.getElementById('theme-toggle').textContent = '☀️';
    }

    window.addEventListener('hashchange', () => {
      const page = location.hash.slice(1);
      if (page && Auth.canAccess(page)) Router.navigate(page);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
