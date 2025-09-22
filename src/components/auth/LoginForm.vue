<!-- src/components/auth/LoginForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <div class="logo">
      <div class="logo-icon">✨</div>
      <h1>WishLister</h1>
    </div>

    <h2>Вход в систему</h2>

    <div class="form-group">
      <input
        v-model="formData.username"
        type="text"
        placeholder="Ваше имя"
        required
        :disabled="loading"
        class="input-field"
      >
    </div>

    <div class="form-group">
      <input
        v-model="formData.password"
        type="password"
        placeholder="Пароль"
        required
        :disabled="loading"
        class="input-field"
      >
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <button type="submit" :disabled="loading" class="submit-btn">
      <span v-if="loading">Входим...</span>
      <span v-else>Войти</span>
    </button>

    <p class="auth-link">
      Нет аккаунта? 
      <router-link to="/register" class="link">Зарегистрироваться</router-link>
    </p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const formData = ref({
  username: '',
  password: ''
});

const loading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = '';
    await authStore.login(formData.value);
    
    // Успешный вход - перенаправление происходит в store
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-form {
  text-align: center;
}

.logo {
  margin-bottom: 2rem;
}

.logo-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.logo h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #B07ED9;
  margin-bottom: -1rem;
}


h2 {
  font-family: "Nunito Sans", sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  color: #72777e;
  margin-bottom: 2rem;
}

.demo-account {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.demo-account p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #0369a1;
}

.demo-account p:first-child {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.input-field {
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fafafa;
}

.input-field:focus {
  outline: none;
  border-color: #97ded9;
  background: white;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.input-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(150deg,rgba(151, 222, 217, 1) 0%, rgba(110, 184, 179, 1) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  font-family: "Nunito Sans", sans-serif;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  color: #ef4444;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.auth-link {
  color: #6b7280;
  margin: 0;
  font-family: "Nunito Sans", sans-serif;
}

.link {
  color: #B07ED9;
  text-decoration: none;
  font-weight: 600;
  font-family: "Nunito Sans", sans-serif;
}

.link:hover {
  text-decoration: underline;
}
</style>