<template>
  <section class="view-container">
    <h2>Report Found Item</h2>
    <p class="view-subtitle">Fill in the details of the item you have found.</p>

    <form class="simple-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">Title</label>
        <input id="title" v-model="form.title" type="text" required placeholder="e.g. Black wallet" />
      </div>

      <div class="form-group">
        <label for="category">Category</label>
        <input id="category" v-model="form.category" type="text" required placeholder="e.g. Wallet, Laptop, Card" />
      </div>

      <div class="form-group">
        <label for="location">Where did you find it?</label>
        <input id="location" v-model="form.location" type="text" required placeholder="e.g. Library, Canteen" />
      </div>

      <div class="form-group">
        <label for="storageLocation">Where is it stored now?</label>
        <input
          id="storageLocation"
          v-model="form.storageLocation"
          type="text"
          placeholder="e.g. Security office counter"
        />
      </div>

      <div class="form-group">
        <label for="time">Approximate time</label>
        <input id="time" v-model="form.time" type="datetime-local" />
        <small>If left empty, current time will be used.</small>
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          rows="3"
          placeholder="Brand, colour, special marks..."
        ></textarea>
      </div>

      <div class="form-group">
        <label for="contact">Contact information (optional)</label>
        <input
          id="contact"
          v-model="form.contact"
          type="text"
          placeholder="e.g. 6123 4567 / your@email.com"
        />
        <small>If left empty, your profile contact will be used.</small>
      </div>

      <div class="form-group">
        <label for="photo">Photo (optional)</label>
        <input id="photo" type="file" accept="image/*" @change="onFileChange" />
      </div>

      <p v-if="error" class="form-error">{{ error }}</p>
      <div v-if="success" class="form-success-alert">
        <p class="form-success">{{ success }}</p>
        <button type="button" class="btn-outline" @click="goHome">Back to Home</button>
      </div>

      <button type="submit" class="btn-primary" :disabled="submitting">
        {{ submitting ? 'Submitting...' : 'Submit Found Report' }}
      </button>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { supabase } from '../lib/supabaseClient';

const auth = useAuthStore();
const router = useRouter();

const form = reactive({
  title: '',
  category: '',
  location: '',
  storageLocation: '',
  time: '',
  description: '',
  contact: '',
});

const file = ref(null);
const submitting = ref(false);
const error = ref('');
const success = ref('');

const isDemoId = (id) => typeof id === 'string' && id.startsWith('demo-');

const onFileChange = (event) => {
  const files = event.target.files;
  file.value = files && files[0] ? files[0] : null;
};

const buildContactText = () => {
  const u = auth.currentUser;
  if (!u) return '';
  const parts = [u.name, u.email].filter(Boolean);
  if (u.phone) parts.push(u.phone);
  return parts.join(' / ');
};

const ensureTime = () => {
  if (!form.time) {
    return new Date().toISOString();
  }
  const d = new Date(form.time);
  if (Number.isNaN(d.getTime())) {
    return new Date().toISOString();
  }
  return d.toISOString();
};

const goHome = () => {
  router.push('/');
};

async function handleSubmit() {
  error.value = '';
  success.value = '';

  if (!auth.currentUser) {
    error.value = 'Please login first.';
    return;
  }

  submitting.value = true;
  try {
    let photoUrl = null;

    if (file.value) {
      const bucket = 'find';
      const userId = auth.currentUser?.id;
      const baseFolder = userId && !isDemoId(userId) ? userId : 'demo';
      const rawName = file.value.name || 'upload';
      const safeName = `${Date.now()}-${rawName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const path = `${baseFolder}/${safeName}`;
      const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, file.value);
      if (uploadErr) {
        throw uploadErr;
      }
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
      photoUrl = publicData?.publicUrl || null;
    }

    const timeValue = ensureTime();

    const userId = auth.currentUser?.id;
    const payload = {
      type: 'found',
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category.trim(),
      location: form.location.trim(),
      time: timeValue,
      storage_location: form.storageLocation.trim() || null,
      status: 'pending',
      finder_contact: form.contact.trim() || buildContactText() || null,
    };

    if (userId && !isDemoId(userId)) {
      payload.created_by = userId;
    }

    const { data: insertedItem, error: itemErr } = await supabase.from('items').insert(payload).select('*').single();

    if (itemErr) {
      throw itemErr;
    }

    if (photoUrl && insertedItem?.id) {
      const { error: photoErr } = await supabase.from('item_photos').insert({
        item_id: insertedItem.id,
        photo_url: photoUrl,
      });
      if (photoErr) {
        console.error('Error inserting item photo', photoErr);
      }
    }

    success.value = 'Found item reported successfully.';
    form.title = '';
    form.category = '';
    form.location = '';
    form.storageLocation = '';
    form.time = '';
    form.description = '';
    form.contact = '';
    file.value = null;
  } catch (e) {
    console.error('Error reporting found item', e);
    error.value = e?.message || 'Failed to submit found report.';
  } finally {
    submitting.value = false;
  }
}
</script>

