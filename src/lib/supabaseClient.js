import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ehygdrwdibbqormjhrum.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GIHwS5K-Qhsa4tKsXAo3ZQ_UV58fthD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

