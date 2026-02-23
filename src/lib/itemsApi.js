import { supabase } from './supabaseClient';

const ITEMS_TABLE = 'items';

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

