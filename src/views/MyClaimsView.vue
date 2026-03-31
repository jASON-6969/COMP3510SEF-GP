<template>
  <section class="view-container">
    <header class="my-claims-header">
      <h2>My Claims</h2>
      <p class="muted">Track the claims you have submitted.</p>
    </header>

    <p v-if="loading" class="muted">Loading...</p>
    <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div v-else>
      <p v-if="claims.length === 0" class="muted">You have not submitted any claims yet.</p>

      <ul v-else class="claims-list">
        <li v-for="claim in claims" :key="claim.id" class="claim-item">
          <div class="claim-main">
            <router-link class="claim-title" :to="`/items/${claim.item_id}`">
              {{ claim.items?.title || 'Untitled item' }}
            </router-link>
            <span class="claim-status" :class="'status-' + (claim.status || 'pending')">
              {{ claimStatusLabel(claim.status) }}
            </span>
          </div>
          <p class="claim-meta">Submitted: {{ formatDateTime(claim.created_at) }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { fetchMyClaims } from '../lib/claimsApi';

const router = useRouter();
const auth = useAuthStore();

const loading = ref(false);
const errorMessage = ref('');
const claims = ref([]);

function claimStatusLabel(status) {
  const map = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
  return map[status] || status || 'Pending';
}

function formatDateTime(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-HK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function load() {
  if (!auth.isLoggedIn || !auth.currentUser) {
    router.push({ name: 'login', query: { redirect: '/my-claims' } });
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  try {
    claims.value = await fetchMyClaims(auth.currentUser);
  } catch (_) {
    errorMessage.value = 'Failed to load your claims. Please try again.';
    claims.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  load();
});
</script>

<style scoped>
.my-claims-header {
  margin-bottom: 14px;
}
.claims-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}
.claim-item {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  padding: 12px;
  background: #fff;
}
.claim-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.claim-title {
  color: #003a5d;
  text-decoration: none;
  font-weight: 600;
}
.claim-title:hover {
  text-decoration: underline;
}
.claim-status {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.claim-status.status-pending {
  background: #fef3c7;
  color: #92400e;
}
.claim-status.status-approved {
  background: #d1fae5;
  color: #065f46;
}
.claim-status.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}
.claim-meta {
  margin: 8px 0 0;
  color: #555;
  font-size: 13px;
}
.muted {
  opacity: 0.8;
}
.error {
  color: #b42318;
}
</style>
