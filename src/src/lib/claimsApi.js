import { supabase } from './supabaseClient';

const CLAIMS_TABLE = 'claims';

export async function createClaim(claim) {
  const { data, error } = await supabase.from(CLAIMS_TABLE).insert(claim).select().single();

  if (error) {
    console.error('Error creating claim', error);
    throw error;
  }

  return data;
}

