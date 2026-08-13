(function () {
  'use strict';

  const Store = window.FatalStore;

  const $ = (sel) => document.querySelector(sel);

  let toastTimer = null;
  function toast(msg, type) {
    const el = $('#toast');
    el.textContent = msg;
    el.className = 'toast' + (type ? ' ' + type : '');
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  function openModal(id) {
    document.querySelectorAll('.modal').forEach((m) => { m.hidden = true; });
    const m = $('#modal-' + id);
    if (m) m.hidden = false;
  }

  function closeModals() {
    document.querySelectorAll('.modal').forEach((m) => { m.hidden = true; });
  }

  function msg(id, text, type) {
    const el = $('#' + id);
    el.textContent = text || '';
    el.className = 'form-msg' + (type ? ' ' + type : '');
  }

  function renderSession() {
    const login = Store.getSession();
    const nav = $('#navAuth');
    const panel = $('#panelUser');

    if (login) {
      const db = Store.loadDB();
      const user = db.users.find((u) => u.login === login);
      nav.innerHTML =
        '<button class="btn btn-ghost" id="openPanelBtn">Кабинет</button>' +
        '<button class="btn btn-primary" id="navLogoutBtn">Выйти</button>';
      $('#openPanelBtn').addEventListener('click', () => openPanel(user));
      $('#navLogoutBtn').addEventListener('click', () => { Store.clearSession(); location.reload(); });
      if (user && panel) {
        const initial = (user.login[0] || '?').toUpperCase();
        panel.innerHTML =
          '<div class="avatar">' + initial + '</div>' +
          '<div><b>' + escapeHtml(user.login) + '</b><span>' + escapeHtml(user.email) + '</span></div>';
      }
    } else {
      nav.innerHTML =
        '<a href="#" class="btn btn-ghost" data-modal="login">Войти</a>' +
        '<a href="#" class="btn btn-primary" data-modal="register">Регистрация</a>';
      nav.querySelectorAll('[data-modal]').forEach((el) => {
        el.addEventListener('click', (e) => { e.preventDefault(); openModal(el.dataset.modal); });
      });
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function openPanel(user) {
    closeModals();
    if (!user) return;
    const lic = user.license;
    $('#licenseKey').value = lic;
    $('#panelUser').innerHTML =
      '<div class="avatar">' + escapeHtml(user.login[0].toUpperCase()) + '</div>' +
      '<div><b>' + escapeHtml(user.login) + '</b><span>' + escapeHtml(user.email) + '</span></div>';

    $('#modal-panel').hidden = false;
    simulateSync();
  }

  function simulateSync() {
    const box = $('#syncBox');
    const text = $('#syncText');
    const line = $('#loaderLine');
    box.className = 'sync-box connecting';
    text.textContent = 'Синхронизация с лоадером...';
    line.className = 'line';
    line.textContent = 'Поиск Minecraft (Java)...';

    setTimeout(() => {
      box.className = 'sync-box connecting';
      text.textContent = 'Отправка лицензии на лоадер...';
      line.textContent = 'Инъекция выполнена';
      line.className = 'line';
    }, 1200);

    setTimeout(() => {
      box.className = 'sync-box linked';
      text.textContent = 'Лоадер подключён. Лицензия синхронизирована.';
      line.innerHTML = 'Лицензия <b>OK</b> — Fatal Loader подключён';
      line.className = 'line ok';
      toast('Лоадер синхронизирован', 'ok');
    }, 2400);
  }

  /* ---- Auth handlers ---- */

  function handleRegister(e) {
    e.preventDefault();
    const f = e.target;
    const login = f.login.value.trim();
    const email = f.email.value.trim();
    const pass = f.password.value;
    const pass2 = f.password2.value;

    if (login.length < 3) return msg('registerMsg', 'Логин минимум 3 символа', 'err');
    if (pass.length < 6) return msg('registerMsg', 'Пароль минимум 6 символов', 'err');
    if (pass !== pass2) return msg('registerMsg', 'Пароли не совпадают', 'err');

    const db = Store.loadDB();
    if (db.users.some((u) => u.login.toLowerCase() === login.toLowerCase())) {
      return msg('registerMsg', 'Такой логин уже занят', 'err');
    }

    const user = {
      login: login,
      email: email,
      password: pass,
      license: Store.genLicense(),
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    Store.saveDB(db);
    Store.setSession(login);

    msg('registerMsg', 'Аккаунт создан! Выполняем вход...', 'ok');
    setTimeout(() => { closeModals(); renderSession(); openPanel(user); toast('Добро пожаловать, ' + login, 'ok'); }, 700);
  }

  function handleLogin(e) {
    e.preventDefault();
    const f = e.target;
    const login = f.login.value.trim();
    const pass = f.password.value;

    const db = Store.loadDB();
    const user = db.users.find((u) => u.login.toLowerCase() === login.toLowerCase());
    if (!user || user.password !== pass) {
      return msg('loginMsg', 'Неверный логин или пароль', 'err');
    }

    Store.setSession(user.login);
    msg('loginMsg', 'Вход выполнен!', 'ok');
    setTimeout(() => { closeModals(); renderSession(); openPanel(user); toast('С возвращением, ' + user.login, 'ok'); }, 700);
  }

  /* ---- Events ---- */

  document.addEventListener('DOMContentLoaded', () => {
    renderSession();

    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-modal]');
      if (t) { e.preventDefault(); openModal(t.dataset.modal); }
    });

    document.querySelectorAll('[data-close]').forEach((el) => {
      el.addEventListener('click', closeModals);
    });

    document.querySelectorAll('[data-switch]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(el.dataset.switch);
      });
    });

    document.querySelectorAll('.modal').forEach((m) => {
      m.addEventListener('click', (e) => {
        if (e.target === m) closeModals();
      });
    });

    $('#registerForm').addEventListener('submit', handleRegister);
    $('#loginForm').addEventListener('submit', handleLogin);

    const genBtn = $('#genKey');
    if (genBtn) {
      genBtn.addEventListener('click', () => {
        const login = Store.getSession();
        if (!login) return;
        const db = Store.loadDB();
        const user = db.users.find((u) => u.login === login);
        if (!user) return;
        user.license = Store.genLicense();
        Store.saveDB(db);
        $('#licenseKey').value = user.license;
        toast('Ключ перевыпущен', 'ok');
      });
    }

    const copyBtn = $('#copyKey');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const input = $('#licenseKey');
        input.select();
        input.setSelectionRange(0, 99999);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(input.value).then(() => toast('Ключ скопирован', 'ok'));
        } else {
          document.execCommand('copy');
          toast('Ключ скопирован', 'ok');
        }
      });
    }

    const logoutBtn = $('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Store.clearSession();
        closeModals();
        renderSession();
        toast('Вы вышли из аккаунта', 'ok');
      });
    }
  });
})();
