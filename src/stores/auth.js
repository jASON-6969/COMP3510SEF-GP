import { defineStore } from 'pinia';

const STORAGE_KEY = 'hkmu-lf-auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    currentUser: null,
  }),
  actions: {
    loginSample(user) {
      this.isLoggedIn = true;
      this.currentUser = user;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ isLoggedIn: true, currentUser: user }));
      } catch (_) {}
    },
    logout() {
      this.isLoggedIn = false;
      this.currentUser = null;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (_) {}
    },
    initFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const { isLoggedIn, currentUser } = JSON.parse(raw);
        if (isLoggedIn && currentUser) {
          this.isLoggedIn = true;
          this.currentUser = currentUser;
        }
      } catch (_) {}
    },
  },
});

