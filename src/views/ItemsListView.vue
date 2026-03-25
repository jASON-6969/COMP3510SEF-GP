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
      <input
        v-model="categoryFilter"
        type="text"
        class="items-search-input"
        placeholder="Category (optional)"
      />
      <input
        v-model="locationFilter"
        type="text"
        class="items-search-input"
        placeholder="Location (optional)"
      />
      <input v-model="timeFrom" type="datetime-local" class="items-search-input" />
      <input v-model="timeTo" type="datetime-local" class="items-search-input" />
      <button type="submit" class="items-search-button">Search</button>
    </form>

    <div class="items-list-content">
      <div v-if="loading" class="loading">Loading items...</div>
      <div v-else class="items-dual-layout">
        <section class="items-block items-block-lost" aria-labelledby="search-lost-heading">
          <h3 id="search-lost-heading" class="items-block-heading">Lost</h3>
          <p v-if="lostItems.length === 0" class="items-block-empty">No matching lost items.</p>
          <div v-else class="item-grid">
            <ItemCard
              v-for="item in lostItems"
              :key="item.id"
              :item="item"
              :photos="itemPhotos[item.id] || []"
            />
          </div>
        </section>
        <section class="items-block items-block-found" aria-labelledby="search-found-heading">
          <h3 id="search-found-heading" class="items-block-heading">Found</h3>
          <p v-if="foundItems.length === 0" class="items-block-empty">No matching found items.</p>
          <div v-else class="item-grid">
            <ItemCard
              v-for="item in foundItems"
              :key="item.id"
              :item="item"
              :photos="itemPhotos[item.id] || []"
            />
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ItemCard from '../components/ItemCard.vue';
import { searchItemsWithPhotos } from '../lib/itemsApi';

const route = useRoute();
const router = useRouter();

const routeQueryString = (value) => (typeof value === 'string' ? value : '');

const searchQuery = ref(routeQueryString(route.query.q));
const typeFilter = ref(routeQueryString(route.query.type) || 'all');
const categoryFilter = ref(routeQueryString(route.query.category));
const locationFilter = ref(routeQueryString(route.query.location));
const timeFrom = ref(routeQueryString(route.query.timeFrom));
const timeTo = ref(routeQueryString(route.query.timeTo));

const loading = ref(false);
const items = ref([]);
const photosByItem = ref({});

const itemPhotos = computed(() => photosByItem.value);

const lostItems = computed(() => items.value.filter((i) => i.type === 'lost'));
const foundItems = computed(() => items.value.filter((i) => i.type === 'found'));

const syncFromRoute = () => {
  searchQuery.value = routeQueryString(route.query.q);
  typeFilter.value = routeQueryString(route.query.type) || 'all';
  categoryFilter.value = routeQueryString(route.query.category);
  locationFilter.value = routeQueryString(route.query.location);
  timeFrom.value = routeQueryString(route.query.timeFrom);
  timeTo.value = routeQueryString(route.query.timeTo);
};

const buildQuery = () => {
  // Keep query keys stable so the UI can restore state when user shares/back-forth.
  return {
    ...(searchQuery.value ? { q: searchQuery.value } : {}),
    ...(typeFilter.value && typeFilter.value !== 'all' ? { type: typeFilter.value } : {}),
    ...(categoryFilter.value ? { category: categoryFilter.value } : {}),
    ...(locationFilter.value ? { location: locationFilter.value } : {}),
    ...(timeFrom.value ? { timeFrom: timeFrom.value } : {}),
    ...(timeTo.value ? { timeTo: timeTo.value } : {}),
  };
};

const performSearch = async () => {
  loading.value = true;
  try {
    const { items: resultItems, photosByItem: resultPhotos } = await searchItemsWithPhotos({
      query: searchQuery.value,
      type: typeFilter.value,
      category: categoryFilter.value,
      location: locationFilter.value,
      timeFrom: timeFrom.value,
      timeTo: timeTo.value,
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
    query: buildQuery(),
  });
};

watch(
  () => route.query,
  () => {
    syncFromRoute();
    performSearch();
  },
  { deep: true, immediate: true }
);
</script>

