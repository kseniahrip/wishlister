<template>
  <div id="app">
    <router-view />
    <AppNotification
      v-if="notification.message"
      :message="notification.message"
      :type="notification.type"
      :duration="notification.duration"
      @close="notification.message = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppNotification from '@/components/ui/AppNotification.vue';

const notification = ref({
  message: '',
  type: 'info' as 'success' | 'error' | 'info',
  duration: 3000
});

onMounted(() => {
  window.addEventListener('show-notification', (event: any) => {
    notification.value = {
      message: event.detail.message,
      type: event.detail.type || 'info',
      duration: event.detail.duration || 3000
    };
  });
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  min-height: 100vh;
  color: #1f2937;
}

#app {
  min-height: 100vh;
}

</style>