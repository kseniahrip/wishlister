import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from '@/services/api';
import type { User, RegisterData, LoginData } from '@/types/auth';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('wishlist_token'));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value && !!token.value);

  const register = async (userData: RegisterData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const newUser = await apiService.register(userData);
      
      user.value = newUser;
      token.value = Math.random().toString(36).substr(2);
      
      localStorage.setItem('wishlist_token', token.value);
      localStorage.setItem('wishlist_user', JSON.stringify(newUser));
      
      await router.push('/dashboard');
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const login = async (loginData: LoginData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const userData = await apiService.login(loginData);
      
      user.value = userData;
      token.value = Math.random().toString(36).substr(2);
      
      localStorage.setItem('wishlist_token', token.value);
      localStorage.setItem('wishlist_user', JSON.stringify(userData));
      
      await router.push('/dashboard');
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
  user.value = null;
  token.value = null;
  error.value = null;
  
  localStorage.removeItem('wishlist_token');
  localStorage.removeItem('wishlist_user');
  
  // Показываем уведомление о выходе
  window.dispatchEvent(new CustomEvent('show-notification', {
    detail: {
      message: 'Вы успешно вышли из системы',
      type: 'info',
      duration: 2000
    }
  }));
  
  router.push('/login');
};

  const initialize = () => {
    const savedUser = localStorage.getItem('wishlist_user');
    if (savedUser) {
      user.value = JSON.parse(savedUser);
    }
  };

  initialize();

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout
  };
});