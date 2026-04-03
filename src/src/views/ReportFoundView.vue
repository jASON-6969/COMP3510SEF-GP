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
import { useItemReportForm } from '../composables/useItemReportForm';
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const { form, submitting, error, success, onFileChange, handleSubmit } = useItemReportForm({
  itemType: 'found',
  bucket: 'find',
  successMessage: 'Found item reported successfully.',
  initialForm: () => ({
    title: '',
    category: '',
    location: '',
    storageLocation: '',
    time: '',
    description: '',
    contact: '',
  }),
  mapFormToPayload: ({ form: f, contactText }) => ({
    title: f.title.trim(),
    description: f.description.trim() || null,
    category: f.category.trim(),
    location: f.location.trim(),
    storage_location: f.storageLocation.trim() || null,
    finder_contact: f.contact.trim() || contactText || null,
  }),
});
</script>

