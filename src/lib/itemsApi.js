import { supabase } from './supabaseClient';

const ITEMS_TABLE = 'items';

export async function fetchStats() {
  const { data, error } = await supabase
    .from(ITEMS_TABLE)
    .select('status');
  if (error) {
    console.error('Error fetching stats', error);
    return { pending: 0, in_progress: 0, returned: 0 };
  }
  const counts = { pending: 0, in_progress: 0, returned: 0 };
  (data || []).forEach((r) => {
    if (r.status === 'pending') counts.pending++;
    else if (r.status === 'in_progress') counts.in_progress++;
    else if (r.status === 'returned') counts.returned++;
  });
  return counts;
}

export async function fetchLatestFoundItems(limit = 5) {
  const { data, error } = await supabase
    .from(ITEMS_TABLE)
    .select('*')
    .eq('type', 'found')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest found items', error);
    return [];
  }

  return data ?? [];
}

export async function searchItems({ query = '', type = 'all', limit = 50 } = {}) {
  let builder = supabase.from(ITEMS_TABLE).select('*').order('created_at', { ascending: false }).limit(limit);

  if (type === 'lost' || type === 'found') {
    builder = builder.eq('type', type);
  }

  if (query && query.trim()) {
    const q = `%${query.trim()}%`;
    builder = builder.or(
      `title.ilike.${q},description.ilike.${q},category.ilike.${q},location.ilike.${q}`
    );
  }

  const { data, error } = await builder;
  if (error) {
    console.error('Error searching items', error);
    return [];
  }
  return data ?? [];
}

export async function loadPhotosForItems(itemIds) {
  if (!itemIds || itemIds.length === 0) {
    return {};
  }
  const { data: photos, error } = await supabase
    .from('item_photos')
    .select('item_id, photo_url')
    .in('item_id', itemIds);

  if (error) {
    console.error('Error loading item photos', error);
    return {};
  }

  const byItem = {};
  (photos || []).forEach((p) => {
    if (!byItem[p.item_id]) byItem[p.item_id] = [];
    byItem[p.item_id].push(p);
  });
  return byItem;
}

export async function searchItemsWithPhotos({ query = '', type = 'all', limit = 50 } = {}) {
  const items = await searchItems({ query, type, limit });
  const ids = items.map((i) => i.id);
  const photosByItem = await loadPhotosForItems(ids);
  return { items, photosByItem };
}

