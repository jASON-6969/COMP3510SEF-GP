<template>
  <section class="home-view">
    <h2>Welcome to HKMU Lost &amp; Found</h2>
    <p class="home-subtitle">Helping students reunite with their belongings.</p>

    <div class="home-quick-links">
      <router-link to="/report-lost" class="quick-link quick-link-primary">
        <span class="quick-link-title">Report Lost</span>
        <span class="quick-link-desc">Create a report for an item you have lost.</span>
      </router-link>
      <router-link to="/report-found" class="quick-link quick-link-accent">
        <span class="quick-link-title">I Found Something</span>
        <span class="quick-link-desc">Submit details of an item you have found.</span>
      </router-link>
      <router-link to="/items" class="quick-link quick-link-outline">
        <span class="quick-link-title">Search Items</span>
        <span class="quick-link-desc">Browse and search all lost &amp; found items.</span>
      </router-link>
    </div>

    <div class="home-stats">
      <p class="stats-intro">Currently <strong>{{ stats.pending }}</strong> items awaiting claim.</p>
      <StatsCards :stats="stats" />
    </div>

    <div class="home-latest">
      <h3>Latest Found Items</h3>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="latestItems.length === 0" class="empty">No found items yet.</div>
      <div v-else class="item-grid">
        <ItemCard
          v-for="item in latestItems"
          :key="item.id"
          :item="item"
          :photos="itemPhotos[item.id] || []"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { fetchStats, fetchLatestFoundItems } from '../lib/itemsApi';
import { supabase } from '../lib/supabaseClient';
import StatsCards from '../components/StatsCards.vue';
import ItemCard from '../components/ItemCard.vue';

const stats = ref({ pending: 0, in_progress: 0, returned: 0 });
const latestItems = ref([]);
const loading = ref(true);
const photosByItem = ref({});

const itemPhotos = computed(() => photosByItem.value);

onMounted(async () => {
  loading.value = true;
  try {
    const [s, items] = await Promise.all([fetchStats(), fetchLatestFoundItems(5)]);
    stats.value = s;
    latestItems.value = items || [];

    if (items?.length) {
      const ids = items.map((i) => i.id);
      const { data: photos } = await supabase
        .from('item_photos')
        .select('item_id, photo_url')
        .in('item_id', ids);
      const byItem = {};
      (photos || []).forEach((p) => {
        if (!byItem[p.item_id]) byItem[p.item_id] = [];
        byItem[p.item_id].push(p);
      });
      photosByItem.value = byItem;
    }
  } catch (_) {
    latestItems.value = [];
  } finally {
    loading.value = false;
  }
});
</script>
