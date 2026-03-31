import { supabase } from './supabaseClient';

const CLAIMS_TABLE = 'claims';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function getClaimantName(user) {
  return user?.name?.trim() || user?.student_no?.trim() || 'Anonymous user';
}

export function getClaimantContact(user) {
  const parts = [user?.email, user?.phone, user?.student_no]
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean);
  return parts.join(' / ') || 'Contact not provided';
}

export function getClaimantUserId(user) {
  const id = user?.id;
  if (typeof id === 'string' && isValidUuid(id)) return id;
  return null;
}

export async function createClaim(claim) {
  const { data, error } = await supabase.from(CLAIMS_TABLE).insert(claim).select().single();

  if (error) {
    console.error('Error creating claim', error);
    throw error;
  }

  return data;
}

export async function findExistingClaim({ itemId, claimantUserId, claimantName, claimantContact }) {
  if (!itemId) return null;

  let builder = supabase.from(CLAIMS_TABLE).select('*').eq('item_id', itemId).limit(1);

  if (isValidUuid(claimantUserId)) {
    builder = builder.eq('claimant_user_id', claimantUserId);
  } else if (claimantName && claimantContact) {
    // Fallback for demo user accounts without UUID id.
    builder = builder.eq('claimant_name', claimantName).eq('claimant_contact', claimantContact);
  } else {
    return null;
  }

  const { data, error } = await builder.maybeSingle();
  if (error) {
    console.error('Error checking existing claim', error);
    throw error;
  }
  return data ?? null;
}

export async function createClaimIfNotExists(claim) {
  const existing = await findExistingClaim({
    itemId: claim?.item_id,
    claimantUserId: claim?.claimant_user_id,
    claimantName: claim?.claimant_name,
    claimantContact: claim?.claimant_contact,
  });

  if (existing) {
    return { alreadyClaimed: true, claim: existing };
  }

  try {
    const created = await createClaim(claim);
    return { alreadyClaimed: false, claim: created };
  } catch (error) {
    // Unique index conflict fallback: another request inserted first.
    if (error?.code === '23505') {
      const conflicted = await findExistingClaim({
        itemId: claim?.item_id,
        claimantUserId: claim?.claimant_user_id,
        claimantName: claim?.claimant_name,
        claimantContact: claim?.claimant_contact,
      });
      return { alreadyClaimed: true, claim: conflicted };
    }
    throw error;
  }
}

export async function fetchMyClaims(user) {
  if (!user) return [];

  const claimantUserId = getClaimantUserId(user);
  const claimantName = getClaimantName(user);
  const claimantContact = getClaimantContact(user);

  let builder = supabase
    .from(CLAIMS_TABLE)
    .select(`
      id,
      item_id,
      status,
      created_at,
      claimant_name,
      claimant_contact,
      items (
        id,
        title
      )
    `)
    .order('created_at', { ascending: false });

  if (claimantUserId) {
    builder = builder.eq('claimant_user_id', claimantUserId);
  } else {
    // Demo account fallback where local user id is not a DB UUID.
    builder = builder.eq('claimant_name', claimantName).eq('claimant_contact', claimantContact);
  }

  const { data, error } = await builder;
  if (error) {
    console.error('Error fetching my claims', error);
    throw error;
  }
  return data ?? [];
}

