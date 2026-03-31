<template>
  <section class="view-container">
    <h2>Sample Login</h2>
    <p class="login-desc">Enter your details to log in. If you are new, a record will be created.</p>
    <form class="login-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="studentNo">Student No</label>
        <input id="studentNo" v-model="form.studentNo" type="text" required placeholder="e.g. 12345678" />
      </div>
      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" v-model="form.name" type="text" required placeholder="Your name" />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" required placeholder="your@email.com" />
      </div>
      <div class="form-group">
        <label for="phone">Phone (optional)</label>
        <input id="phone" v-model="form.phone" type="tel" placeholder="Phone number" />
      </div>
      <p v-if="error" class="form-error">{{ error }}</p>
      <button type="submit" class="btn-primary" :disabled="loading">{{ loading ? 'Logging in...' : 'Login' }}</button>
    </form>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { supabase } from '../lib/supabaseClient';

const router = useRouter();
const auth = useAuthStore();

const form = reactive({
  studentNo: '',
  name: '',
  email: '',
  phone: '',
});

const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  loading.value = true;
  error.value = '';
  try {
    const userPayload = {
      student_no: form.studentNo.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
    };

    const { data: existing } = await supabase
      .from('users')
      .select('id, student_no, email, name, phone')
      .eq('student_no', userPayload.student_no)
      .maybeSingle();

    let user;
    if (existing) {
      await supabase
        .from('users')
        .update({ name: userPayload.name, email: userPayload.email, phone: userPayload.phone })
        .eq('id', existing.id);
      user = { id: existing.id, ...userPayload };
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('users')
        .insert(userPayload)
        .select('id')
        .single();
      if (insertErr) throw insertErr;
      user = { id: inserted.id, ...userPayload };
    }

    auth.loginSample(user);
    const redirect = router.currentRoute.value.query.redirect || '/';
    router.push(redirect);
  } catch (e) {
    const msg = e?.message || '';
    if (msg.includes('fetch') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      const user = {
        id: 'demo-' + Date.now(),
        student_no: form.studentNo.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      };
      auth.loginSample(user);
      const redirect = router.currentRoute.value.query.redirect || '/';
      router.push(redirect);
    } else {
      error.value = msg || 'Login failed';
    }
  } finally {
    loading.value = false;
  }
}
</script>
