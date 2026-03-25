<template>
  <router-link :to="`/items/${item.id}`" class="item-card">
    <div class="item-card-image">
      <img :src="firstPhoto" :alt="item.title" />
    </div>
    <div class="item-card-body">
      <div class="item-card-header">
        <span class="item-card-type" :class="'type-' + (item.type || 'unknown')">
          {{ typeLabel }}
        </span>
        <h3 class="item-card-title">{{ item.title }}</h3>
      </div>
      <p class="item-card-meta">{{ item.location }} · {{ formattedTime }}</p>
      <span class="item-card-status" :class="'status-' + item.status">{{ statusLabel }}</span>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue';
import PLACEHOLDER from '../No_Image_Available.jpg';

const props = defineProps({
  item: { type: Object, required: true },
  photos: { type: Array, default: () => [] },
});

const firstPhoto = computed(() => props.photos?.[0]?.photo_url || PLACEHOLDER);

const formattedTime = computed(() => {
  const t = props.item?.time;
  if (!t) return '';
  const d = new Date(t);
  return d.toLocaleDateString('en-HK', { month: 'short', day: 'numeric', year: 'numeric' });
});

const statusLabel = computed(() => {
  const s = props.item?.status || '';
  const map = { pending: 'Pending', in_progress: 'In progress', claimed: 'Claimed', returned: 'Returned', cancelled: 'Cancelled' };
  return map[s] || s;
});

const typeLabel = computed(() => {
  const t = props.item?.type || '';
  if (t === 'lost') return 'Lost';
  if (t === 'found') return 'Found';
  return t || 'Item';
});
</script>
