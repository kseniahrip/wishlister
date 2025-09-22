<template>
  <transition name="notification">
    <div v-if="visible" :class="['notification', type]">
      <div class="notification-content">
        <span class="notification-icon">
          <span v-if="type === 'success'">✅</span>
          <span v-else-if="type === 'error'">❌</span>
          <span v-else>💡</span>
        </span>
        <span class="notification-message">{{ message }}</span>
      </div>
      <button @click="close" class="notification-close">×</button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}>(), {
  type: 'info',
  duration: 3000
});

const emit = defineEmits(['close']);

const visible = ref(false);

watch(() => props.message, (newMessage) => {
  if (newMessage) {
    showNotification();
  }
});

const showNotification = () => {
  visible.value = true;
  
  if (props.duration > 0) {
    setTimeout(() => {
      close();
    }, props.duration);
  }
};

const close = () => {
  visible.value = false;
  emit('close');
};
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
  border-left: 4px solid;
  min-width: 300px;
  animation: slideIn 0.3s ease;
}

.notification.success {
  border-left-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
}

.notification.error {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
}

.notification.info {
  border-left-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.notification-icon {
  font-size: 1.2rem;
}

.notification-message {
  color: #1f2937;
  font-weight: 500;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #374151;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 480px) {
  .notification {
    left: 20px;
    right: 20px;
    min-width: auto;
  }
}
</style>