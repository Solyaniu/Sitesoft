(function () {
  'use strict';

  const DB_KEY = 'fatal_cc_db';
  const SESSION_KEY = 'fatal_cc_session';

  function loadDB() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEY)) || { users: [] };
    } catch (e) {
      return { users: [] };
    }
  }

  function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  function getSession() {
    return localStorage.getItem(SESSION_KEY);
  }

  function setSession(login) {
    localStorage.setItem(SESSION_KEY, login);
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function genLicense() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const parts = [];
    for (let i = 0; i < 4; i++) {
      let s = '';
      for (let j = 0; j < 4; j++) {
        s += chars[Math.floor(Math.random() * chars.length)];
      }
      parts.push(s);
    }
    return 'FATAL-' + parts.join('-');
  }

  const Store = {
    DB_KEY: DB_KEY,
    SESSION_KEY: SESSION_KEY,
    loadDB: loadDB,
    saveDB: saveDB,
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession,
    genLicense: genLicense
  };

  window.FatalStore = Store;
})();
