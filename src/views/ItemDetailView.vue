<template>
  <section class="view-container">
    <div class="item-detail-header">
      <button type="button" class="btn btn-outline" @click="goBack">Back</button>
    </div>

    <p v-if="loading" class="muted">Loading...</p>
    <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div v-else-if="!item" class="empty-state">
      <h2>Not found</h2>
      <p class="muted">This item doesn’t exist (or was removed).</p>
      <router-link to="/items" class="btn btn-primary">Back to search</router-link>
    </div>

    <div v-else class="item-detail">
      <div class="item-detail-title-row">
        <h2 class="item-detail-title">{{ item.title }}</h2>
        <div class="item-detail-badges">
          <span class="badge" :class="'type-' + (item.type || 'unknown')">{{ typeLabel }}</span>
          <span v-if="item.status" class="badge" :class="'status-' + item.status">{{ statusLabel }}</span>
        </div>
      </div>

      <p class="item-detail-meta">
        <span v-if="item.category"><strong>Category:</strong> {{ item.category }}</span>
        <span v-if="item.location"><strong>Location:</strong> {{ item.location }}</span>
        <span v-if="formattedTime"><strong>Time:</strong> {{ formattedTime }}</span>
      </p>

      <div class="item-detail-photos">
        <img
          v-for="p in displayPhotos"
          :key="p.photo_url"
          class="item-photo"
          :src="p.photo_url"
          :alt="item.title"
          :style="{ maxHeight: photoMaxHeight + 'px' }"
        />
      </div>

      <div v-if="item.description" class="item-detail-description">
        <h3>Description</h3>
        <p>{{ item.description }}</p>
      </div>

      <div class="item-detail-actions">
        <button type="button" class="btn btn-primary" @click="onClaimOrContact">Claim / Contact</button>
        <p v-if="actionHint" class="muted">{{ actionHint }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { fetchItemByIdWithPhotos } from '../lib/itemsApi';
import PLACEHOLDER from '../No_Image_Available.jpg';

const props = defineProps({
  id: {
    type: String,
    required: false,
  },
});

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(false);
const errorMessage = ref('');
const item = ref(null);
const photos = ref([]);
const actionHint = ref('');
const photoMaxHeight = ref(420);

const displayPhotos = computed(() => {
  if (photos.value?.length) return photos.value;
  return [{ item_id: item.value?.id ?? 'placeholder', photo_url: PLACEHOLDER }];
});

const formattedTime = computed(() => {
  const t = item.value?.time;
  if (!t) return '';
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-HK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
});

const statusLabel = computed(() => {
  const s = item.value?.status || '';
  const map = { pending: 'Pending', in_progress: 'In progress', claimed: 'Claimed', returned: 'Returned', cancelled: 'Cancelled' };
  return map[s] || s;
});

const typeLabel = computed(() => {
  const t = item.value?.type || '';
  if (t === 'lost') return 'Lost';
  if (t === 'found') return 'Found';
  return t || 'Item';
});

const currentId = computed(() => props.id || route.params.id);

function updatePhotoMaxHeight() {
  const w = window.innerWidth || 0;
  const h = window.innerHeight || 0;
  const dpr = window.devicePixelRatio || 1;
  const maxByViewport = Math.floor(h * 0.55);
  const maxByWidth = Math.floor(w * 0.6);
  const base = Math.max(240, Math.min(maxByViewport, maxByWidth, 720));
  photoMaxHeight.value = Math.round(base * Math.min(1.15, Math.max(0.9, dpr / 1.5)));
}

async function load() {
  errorMessage.value = '';
  actionHint.value = '';
  item.value = null;
  photos.value = [];

  const id = currentId.value;
  if (!id) {
    errorMessage.value = 'Missing item id.';
    return;
  }

  loading.value = true;
  try {
    const result = await fetchItemByIdWithPhotos(String(id));
    item.value = result.item;
    photos.value = result.photos;
  } catch (e) {
    errorMessage.value = 'Failed to load item. Please try again.';
  } finally {
    loading.value = false;
  }
}

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push('/items');
}

function onClaimOrContact() {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  actionHint.value = 'Claim / private message flow is coming next (not implemented yet).';
}

watch(currentId, () => {
  load();
});

onMounted(() => {
  updatePhotoMaxHeight();
  window.addEventListener('resize', updatePhotoMaxHeight, { passive: true });
  load();
});

onUnmounted(() => {
  window.removeEventListener('resize', updatePhotoMaxHeight);
});
</script>

<style scoped>
.item-detail-header {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 12px;
}
.item-detail-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.item-detail-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.item-detail-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin: 8px 0 16px;
}
.item-detail-photos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
  margin: 8px 0 16px;
}
.item-photo {
  width: 100%;
  height: auto;
  object-fit: contain;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
}
.item-detail-actions {
  margin-top: 16px;
}
.muted {
  opacity: 0.8;
}
.error {
  color: #b42318;
}
.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.06);
}
.btn {
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-primary {
  background: #111827;
  color: white;
  border-color: #111827;
}
.btn-outline {
  background: transparent;
  color: inherit;
}
</style>

