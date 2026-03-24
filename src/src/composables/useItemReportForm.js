import { reactive, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { supabase } from '../lib/supabaseClient';

const isDemoId = (id) => typeof id === 'string' && id.startsWith('demo-');

const buildContactText = (user) => {
  if (!user) return '';
  const parts = [user.name, user.email].filter(Boolean);
  if (user.phone) parts.push(user.phone);
  return parts.join(' / ');
};

const ensureTime = (rawTime) => {
  if (!rawTime) return new Date().toISOString();
  const d = new Date(rawTime);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
};

async function uploadPhoto({ file, bucket, userId }) {
  if (!file) return null;
  const baseFolder = userId && !isDemoId(userId) ? userId : 'demo';
  const rawName = file.name || 'upload';
  const safeName = `${Date.now()}-${rawName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
  const path = `${baseFolder}/${safeName}`;

  const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, file);
  if (uploadErr) throw uploadErr;

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicData?.publicUrl || null;
}

export function useItemReportForm({
  itemType,
  bucket,
  successMessage,
  initialForm,
  mapFormToPayload,
}) {
  const auth = useAuthStore();
  const form = reactive(initialForm());
  const file = ref(null);
  const submitting = ref(false);
  const error = ref('');
  const success = ref('');

  const resetForm = () => {
    Object.assign(form, initialForm());
    file.value = null;
  };

  const onFileChange = (event) => {
    const files = event.target.files;
    file.value = files && files[0] ? files[0] : null;
  };

  const handleSubmit = async () => {
    error.value = '';
    success.value = '';

    if (!auth.currentUser) {
      error.value = 'Please login first.';
      return;
    }

    submitting.value = true;
    try {
      const user = auth.currentUser;
      const userId = user?.id;
      const photoUrl = await uploadPhoto({ file: file.value, bucket, userId });

      const payload = {
        type: itemType,
        status: 'pending',
        time: ensureTime(form.time),
        ...mapFormToPayload({
          form,
          contactText: buildContactText(user),
        }),
      };

      if (userId && !isDemoId(userId)) {
        payload.created_by = userId;
      }

      const { data: insertedItem, error: itemErr } = await supabase.from('items').insert(payload).select('*').single();
      if (itemErr) throw itemErr;

      if (photoUrl && insertedItem?.id) {
        const { error: photoErr } = await supabase.from('item_photos').insert({
          item_id: insertedItem.id,
          photo_url: photoUrl,
        });
        if (photoErr) {
          console.error('Error inserting item photo', photoErr);
        }
      }

      success.value = successMessage;
      resetForm();
    } catch (e) {
      console.error(`Error reporting ${itemType} item`, e);
      error.value = e?.message || `Failed to submit ${itemType} report.`;
    } finally {
      submitting.value = false;
    }
  };

  return {
    form,
    submitting,
    error,
    success,
    onFileChange,
    handleSubmit,
  };
}
