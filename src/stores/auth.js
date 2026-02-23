import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    currentUser: null,
  }),
  actions: {
    loginSample(user) {
      this.isLoggedIn = true;
      this.currentUser = user;
    },
    logout() {
      this.isLoggedIn = false;
      this.currentUser = null;
    },
  },
});

