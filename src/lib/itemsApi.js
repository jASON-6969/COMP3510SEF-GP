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

