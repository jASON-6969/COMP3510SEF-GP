<template>
  <nav class="nav-bar">
    <router-link to="/">Home</router-link>
    <router-link to="/report-lost">Report Lost</router-link>
    <router-link to="/report-found">I Found Something</router-link>
    <router-link to="/items">Search Items</router-link>
    <template v-if="auth.isLoggedIn">
      <span class="nav-user">{{ auth.currentUser?.name }}</span>
      <button type="button" class="nav-btn" @click="handleLogout">Logout</button>
    </template>
    <router-link v-else to="/login" class="nav-login">Login</router-link>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
  auth.logout();
  router.push('/');
}
</script>

