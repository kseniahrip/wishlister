<template>
  <div class="auth-container">
    <div class="auth-card">
      <LoginForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '../components/auth/LoginForm.vue';
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(120deg,rgba(151, 222, 217, 1) 0%, rgba(196, 151, 232, 1) 100%);
}

.auth-card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 2rem;
    margin: 1rem;
  }
  
  .auth-container {
    padding: 0;
    background: white;
  }
}
</style>