<template>
  <section class="view-container items-list-view">
    <header class="items-list-header">
      <h2>Search Lost &amp; Found Items</h2>
      <p class="items-list-subtitle">Search across both lost and found items, and filter by type.</p>
    </header>

    <form class="items-search-bar" @submit.prevent="onSearch">
      <input
        v-model="searchQuery"
        type="text"
        class="items-search-input"
        placeholder="Search by title, description, category or location"
      />
      <select v-model="typeFilter" class="items-search-select">
        <option value="all">All types</option>
        <option value="lost">Lost only</option>
        <option value="found">Found only</option>
      </select>
      <button type="submit" class="items-search-button">Search</button>
    </form>

    <div class="items-list-content">
      <div v-if="loading" class="loading">Loading items...</div>
      <div v-else-if="items.length === 0" class="empty">
        No items match your search yet.
      </div>
      <div v-else class="item-grid">
        <ItemCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          :photos="itemPhotos[item.id] || []"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ItemCard from '../components/ItemCard.vue';
import { searchItemsWithPhotos } from '../lib/itemsApi';

const route = useRoute();
const router = useRouter();

const searchQuery = ref(route.query.q || '');
const typeFilter = ref(route.query.type || 'all');
const loading = ref(false);
const items = ref([]);
const photosByItem = ref({});

const itemPhotos = computed(() => photosByItem.value);

const performSearch = async () => {
  loading.value = true;
  try {
    const { items: resultItems, photosByItem: resultPhotos } = await searchItemsWithPhotos({
      query: searchQuery.value,
      type: typeFilter.value,
    });
    items.value = resultItems;
    photosByItem.value = resultPhotos;
  } catch (e) {
    console.error('Error searching items', e);
    items.value = [];
    photosByItem.value = {};
  } finally {
    loading.value = false;
  }
};

const onSearch = () => {
  router.replace({
    query: {
      ...(searchQuery.value ? { q: searchQuery.value } : {}),
      ...(typeFilter.value && typeFilter.value !== 'all' ? { type: typeFilter.value } : {}),
    },
  });
  performSearch();
};

onMounted(() => {
  performSearch();
});
</script>

