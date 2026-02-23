<template>
  <div class="app-root">
    <header class="app-header">
      <img src="./logo_main.jpg" alt="HKMU Logo" class="app-logo" />
      <h1 class="app-title">HKMU Lost &amp; Found</h1>
      <NavBar />
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue';
</script>

