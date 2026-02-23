<template>
  <div class="stats-cards">
    <div class="stat-card">
      <span class="stat-value">{{ stats.pending }}</span>
      <span class="stat-label">Pending</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{{ stats.in_progress }}</span>
      <span class="stat-label">In progress</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{{ stats.returned }}</span>
      <span class="stat-label">Returned</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    default: () => ({ pending: 0, in_progress: 0, returned: 0 }),
  },
});
</script>
