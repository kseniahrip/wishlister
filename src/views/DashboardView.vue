<template>
  <div class="dashboard">
    <!-- Боковое меню -->
    <aside :class="['sidebar', { 
      'sidebar-collapsed': isSidebarCollapsed, 
      'sidebar-mobile-open': isSidebarOpenMobile 
    }]">
      <div class="sidebar-header">
        <div class="logo" @click="isSidebarCollapsed = !isSidebarCollapsed">
          <div class="logo-icon">✨</div>
          <span class="logo-text" v-if="!isSidebarCollapsed">WishLister</span>
        </div>
        <button class="toggle-btn" @click="toggleSidebar">
          {{ isSidebarCollapsed ? '→' : '←' }}
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-section">
          <h3 v-if="!isSidebarCollapsed" class="nav-title">Мой вишлист</h3>
          <button 
            :class="['nav-item', { active: activeTab === 'my-wishes' }]"
            @click="setActiveTab('my-wishes')"
          >
            <span class="nav-icon">📦</span>
            <span class="nav-text" v-if="!isSidebarCollapsed">Мои желания</span>
          </button>
        </div>

        <div class="nav-section">
          <h3 v-if="!isSidebarCollapsed" class="nav-title">Другие пользователи</h3>
          <button 
            v-for="user in otherUsers" 
            :key="user.id"
            :class="['nav-item', { active: activeTab === `user-${user.id}` }]"
            @click="setActiveTab(`user-${user.id}`)"
          >
            <img :src="user.avatar" :alt="user.username" class="user-avatar-small">
            <span class="nav-text" v-if="!isSidebarCollapsed">{{ user.username }}</span>
          </button>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile">
          <img :src="authStore.user?.avatar" :alt="authStore.user?.username" class="user-avatar">
          <div class="user-details" v-if="!isSidebarCollapsed">
            <strong>{{ authStore.user?.username }}</strong>
            <span>Ваш профиль</span>
          </div>
        </div>
        <button class="nav-item logout-btn" @click="authStore.logout">
          <span class="nav-icon">🚪</span>
          <span class="nav-text" v-if="!isSidebarCollapsed">Выйти</span>
        </button>
      </div>
    </aside>

    <!-- Overlay для мобильного меню -->
    <div 
      v-if="isMobile && isSidebarOpenMobile" 
      class="sidebar-overlay"
      @click="closeSidebarMobile"
    ></div>

    <!-- Основной контент -->
    <main class="main-content">
      <!-- Хедер -->
      <header class="content-header">
        <div class="header-left">
          <button class="menu-toggle" @click="toggleSidebarMobile" v-if="isMobile">
            <span class="menu-icon">☰</span>
          </button>
          <div class="header-info">
            <h1>{{ getCurrentTitle }}</h1>
            <p class="welcome-text">{{ getCurrentSubtitle }}</p>
          </div>
        </div>
        
        <button 
          v-if="activeTab === 'my-wishes'"
          class="add-wish-btn" 
          @click="openAddWishModal"
        >
          <span class="btn-icon">➕</span>
          Добавить желание
        </button>
      </header>

      <!-- Контент -->
      <div class="content-area">
        <!-- Статистика -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-info">
              <h3>{{ myWishesCount }}</h3>
              <p>Мои желания</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👀</div>
            <div class="stat-info">
              <h3>{{ otherUsersWishesCount }}</h3>
              <p>Чужие желания</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <h3>{{ otherUsers.length }}</h3>
              <p>Пользователи</p>
            </div>
          </div>
        </div>

        <!-- Сетка желаний -->
        <div class="wishes-section">
          <div class="section-header">
            <h2>Список желаний</h2>
            <div class="view-controls">
              <button 
                :class="['view-btn', { active: viewMode === 'grid' }]"
                @click="viewMode = 'grid'"
              >
                ◼️ Сетка
              </button>
              <button 
                :class="['view-btn', { active: viewMode === 'list' }]"
                @click="viewMode = 'list'"
              >
                📋 Список
              </button>
            </div>
          </div>

          <div :class="['wishes-container', viewMode]">
            <div 
              v-for="wish in filteredWishes" 
              :key="wish.id" 
              :class="['wish-card', viewMode, { 'reserved': wish.reservedBy && wish.userId !== authStore.user?.id }]"
            >
              <div class="wish-image-container">
                <img :src="wish.image" :alt="wish.title" class="wish-image">
                <div class="wish-actions">
                  <!-- Бейдж зарезервированного желания (виден только другим пользователям) -->
                  <div 
                    v-if="wish.reservedBy && wish.userId !== authStore.user?.id" 
                    class="reserved-badge"
                    title="Это желание уже зарезервировано другим пользователем"
                  >
                    🎁 Забронировано
                  </div>
                  
                  <!-- Кнопка резерва (только для чужих желаний) -->
                  <button 
                    v-if="wish.userId !== authStore.user?.id && !wish.reservedBy"
                    class="reserve-btn"
                    @click="reserveWish(wish)"
                    title="Забронировать этот подарок"
                  >
                    🎁 Забронировать
                  </button>
                  
                  <!-- Кнопки редактирования и удаления (только для своих желаний) -->
                  <template v-if="wish.userId === authStore.user?.id">
                    <button 
                      class="edit-btn"
                      @click="openEditWishModal(wish)"
                      title="Редактировать желание"
                    >
                      ✏️
                    </button>
                    <button 
                      class="delete-btn"
                      @click="confirmDeleteWish(wish)"
                      title="Удалить желание"
                    >
                      🗑️
                    </button>
                  </template>
                </div>
              </div>
              
              <div class="wish-content">
                <h3 class="wish-title">{{ wish.title }}</h3>
                <p class="wish-description">{{ wish.description }}</p>
                
                <div class="wish-tags">
                  <span v-for="tag in wish.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
                
                <!-- Информация о резерве (видна только владельцу) -->
                <div 
                  v-if="wish.reservedBy && wish.userId === authStore.user?.id" 
                  class="reserve-info"
                >
                  <div class="reserve-notice">
                    🎁 Кто-то собирается подарить вам это!
                  </div>
                </div>
                
                <div class="wish-footer">
                  <a 
                    v-if="wish.link" 
                    :href="wish.link" 
                    target="_blank" 
                    class="wish-link"
                  >
                    🔗 Перейти
                  </a>
                  <div class="wish-meta">
                    <span class="wish-date">{{ formatDate(wish.createdAt) }}</span>
                    <span class="wish-author">{{ getUsername(wish.userId) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Пустое состояние -->
            <div v-if="filteredWishes.length === 0" class="empty-state">
              <div class="empty-icon">📝</div>
              <h3>Пока нет желаний</h3>
              <p v-if="activeTab === 'my-wishes'">Добавьте первое желание, нажав на кнопку</p>
              <p v-else>У этого пользователя пока нет желаний</p>
              <button 
                v-if="activeTab === 'my-wishes'" 
                class="empty-btn" 
                @click="openAddWishModal"
              >
                Добавить желание
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Модальное окно добавления/редактирования желания -->
    <div v-if="showWishModal" class="modal-overlay" @click.self="closeWishModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Редактировать желание' : 'Добавить новое желание' }}</h2>
          <button class="modal-close" @click="closeWishModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Название желания *</label>
            <input v-model="currentWish.title" type="text" placeholder="Например, кружка эээ" required>
          </div>
          
          <div class="form-group">
            <label>Описание</label>
            <textarea 
              v-model="currentWish.description" 
              placeholder="Расскажите подробнее о вашем желании..."
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Ссылка на товар (необязательно)</label>
            <input v-model="currentWish.link" type="url" placeholder="https://example.com">
          </div>

          <div class="form-group">
            <label>Ссылка на фото (необязательно)</label>
            <input v-model="currentWish.image" type="url" placeholder="https://example.com">
          </div>

        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeWishModal">Отмена</button>
          <button 
            class="btn-primary" 
            @click="isEditing ? updateWish() : addNewWish()" 
            :disabled="!currentWish.title.trim()"
          >
            {{ isEditing ? 'Сохранить' : 'Добавить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h2>Подтверждение удаления</h2>
          <button class="modal-close" @click="showDeleteConfirm = false">×</button>
        </div>
        
        <div class="modal-body">
          <p>Вы уверены, что хотите удалить желание "<strong>{{ wishToDelete?.title }}</strong>"?</p>
          <p class="warning-text">Это действие нельзя отменить!</p>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteConfirm = false">Отмена</button>
          <button class="btn-danger" @click="deleteWish">Удалить</button>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения резерва -->
    <div v-if="showReserveConfirm" class="modal-overlay" @click.self="showReserveConfirm = false">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h2>Бронирование подарка</h2>
          <button class="modal-close" @click="showReserveConfirm = false">×</button>
        </div>
        
        <div class="modal-body">
          <p>Вы собираетесь забронировать подарок "<strong>{{ wishToReserve?.title }}</strong>"?</p>
          <p class="info-text">Другие пользователи увидят, что этот подарок уже забронирован, но автор желания не узнает, кто именно его забронировал.</p>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" @click="showReserveConfirm = false">Отмена</button>
          <button class="btn-primary" @click="confirmReserveWish">Забронировать</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/services/api';

const authStore = useAuthStore();

// Состояния интерфейса
const isSidebarCollapsed = ref(false);
const isSidebarOpenMobile = ref(false);
const isMobile = ref(false);
const activeTab = ref('my-wishes');
const viewMode = ref('grid');
const showWishModal = ref(false);
const showDeleteConfirm = ref(false);
const showReserveConfirm = ref(false);
const isEditing = ref(false);

// Данные
const wishes = ref<any[]>([]);
const otherUsers = ref<any[]>([]);
const wishToDelete = ref<any>(null);
const wishToReserve = ref<any>(null);

// Текущее редактируемое/добавляемое желание
const currentWish = ref({
  id: '',
  title: '',
  description: '',
  link: '',
  image: '',
  tagsInput: ''
});

// Проверка мобильного устройства
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

// Загрузка данных
onMounted(async () => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  try {
    wishes.value = await apiService.getWishes();
    const users = await apiService.getUsers();
    otherUsers.value = users.filter((user: any) => user.id !== authStore.user?.id);
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

// Вычисляемые свойства
const filteredWishes = computed(() => {
  if (activeTab.value === 'my-wishes') {
    return wishes.value.filter(wish => wish.userId === authStore.user?.id);
  } else if (activeTab.value.startsWith('user-')) {
    const userId = activeTab.value.split('-')[1];
    return wishes.value.filter(wish => wish.userId === userId);
  }
  return wishes.value;
});

const myWishesCount = computed(() => {
  return wishes.value.filter(wish => wish.userId === authStore.user?.id).length;
});

const otherUsersWishesCount = computed(() => {
  return wishes.value.filter(wish => wish.userId !== authStore.user?.id).length;
});

const getCurrentTitle = computed(() => {
  if (activeTab.value === 'my-wishes') {
    return `Добро пожаловать, ${authStore.user?.username}!`;
  } else {
    const user = otherUsers.value.find(u => `user-${u.id}` === activeTab.value);
    return user ? `Вишлист ${user.username}` : 'Вишлист';
  }
});

const getCurrentSubtitle = computed(() => {
  if (activeTab.value === 'my-wishes') {
    return 'Управляйте своими желаниями';
  } else {
    return 'Просматривайте желания других пользователей';
  }
});

// Методы
const toggleSidebar = () => {
  if (isMobile.value) {
    isSidebarOpenMobile.value = !isSidebarOpenMobile.value;
  } else {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
  }
};

const toggleSidebarMobile = () => {
  isSidebarOpenMobile.value = !isSidebarOpenMobile.value;
};

const closeSidebarMobile = () => {
  isSidebarOpenMobile.value = false;
};

const setActiveTab = (tab: string) => {
  activeTab.value = tab;
  if (isMobile.value) {
    closeSidebarMobile();
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const getUsername = (userId: string) => {
  if (userId === authStore.user?.id) return 'Вы';
  const user = otherUsers.value.find(u => u.id === userId);
  return user ? user.username : 'Неизвестный';
};

// Методы для работы с желаниями
const openAddWishModal = () => {
  isEditing.value = false;
  currentWish.value = {
    id: '',
    title: '',
    description: '',
    link: '',
    image: '',
    tagsInput: ''
  };
  showWishModal.value = true;
};

const openEditWishModal = (wish: any) => {
  isEditing.value = true;
  currentWish.value = {
    id: wish.id,
    title: wish.title,
    description: wish.description || '',
    link: wish.link || '',
    image: wish.image || '',
    tagsInput: Array.isArray(wish.tags) ? wish.tags.join(', ') : ''
  };
  showWishModal.value = true;
};

const closeWishModal = () => {
  showWishModal.value = false;
  isEditing.value = false;
};

const addNewWish = async () => {
  if (!currentWish.value.title.trim()) return;

  try {
    const wishData = {
      title: currentWish.value.title,
      description: currentWish.value.description,
      link: currentWish.value.link,
      image: currentWish.value.image,
      tags: currentWish.value.tagsInput 
        ? currentWish.value.tagsInput.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : [],
      userId: authStore.user?.id || '',
      createdAt: new Date().toISOString(),
      reservedBy: null
    };

    const createdWish = await apiService.createWish(wishData);
    wishes.value.unshift(createdWish);
    closeWishModal();
    
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: {
        message: 'Желание успешно добавлено!',
        type: 'success',
        duration: 3000
      }
    }));
    
  } catch (error: any) {
    console.error('Ошибка при добавлении желания:', error);
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: {
        message: error.message || 'Ошибка при добавлении желания',
        type: 'error',
        duration: 4000
      }
    }));
  }
};

const updateWish = async () => {
  if (!currentWish.value.title.trim()) return;

  try {
    const wishData = {
      title: currentWish.value.title,
      description: currentWish.value.description,
      link: currentWish.value.link,
      image: currentWish.value.image,
      tags: currentWish.value.tagsInput 
        ? currentWish.value.tagsInput.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : []
    };

    const updatedWish = await apiService.updateWish(currentWish.value.id, wishData);
    
    // Обновляем локальный массив
    const index = wishes.value.findIndex(w => w.id === currentWish.value.id);
    if (index !== -1) {
      wishes.value[index] = { ...wishes.value[index], ...updatedWish };
    }
    
    closeWishModal();
    
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: {
        message: 'Желание успешно обновлено!',
        type: 'success',
        duration: 3000
      }
    }));
    
  } catch (error: any) {
    console.error('Ошибка при обновлении желания:', error);
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: {
        message: error.message || 'Ошибка при обновлении желания',
        type: 'error',
        duration: 4000
      }
    }));
  }
};

const confirmDeleteWish = (wish: any) => {
  wishToDelete.value = wish;
  showDeleteConfirm.value = true;
};

const deleteWish = async () => {
  if (!wishToDelete.value) return;

  try {
    await apiService.deleteWish(wishToDelete.value.id);
    wishes.value = wishes.value.filter(w => w.id !== wishToDelete.value.id);
    showDeleteConfirm.value = false;
    wishToDelete.value = null;
    
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: {
        message: 'Желание успешно удалено',
        type: 'success',
        duration: 3000
      }
    }));
    
  } catch (error: any) {
    console.error('Ошибка при удалении желания:', error);
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: {
        message: error.message || 'Ошибка при удалении желания',
        type: 'error',
        duration: 4000
      }
    }));
  }
};

const reserveWish = (wish: any) => {
  wishToReserve.value = wish;
  showReserveConfirm.value = true;
};

const confirmReserveWish = async () => {
  if (!wishToReserve.value) return;

  try {
    const reserveData = {
      reservedBy: authStore.user?.id,
      reservedAt: new Date().toISOString()
    };

    const updatedWish = await apiService.updateWish(wishToReserve.value.id, reserveData);
    
    // Обновляем локальный массив
    const index = wishes.value.findIndex(w => w.id === wishToReserve.value.id);
    if (index !== -1) {
      wishes.value[index] = { ...wishes.value[index], ...updatedWish };
    }
    
    showReserveConfirm.value = false;
    wishToReserve.value = null;
    
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: {
        message: 'Подарок успешно забронирован!',
        type: 'success',
        duration: 3000
      }
    }));
    
  } catch (error: any) {
    console.error('Ошибка при бронировании подарка:', error);
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: {
        message: error.message || 'Ошибка при бронировании подарка',
        type: 'error',
        duration: 4000
      }
    }));
  }
};
</script>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(120deg,rgba(151, 222, 217, 1) 0%, rgba(196, 151, 232, 1) 100%);
}

/* Боковое меню */
.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.logo-icon {
  font-size: 2rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #B07ED9;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.toggle-btn:hover {
  background: #f1f5f9;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 1.5rem;
}

.nav-title {
  padding: 0 1.5rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: "Nunito Sans", sans-serif;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
  text-align: left;
  font-family: "Nunito Sans", sans-serif;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #B07ED9;
}

.nav-item.active {
  background: #ede9fe;
  color: #B07ED9;
  border-right: 3px solid #B07ED9;
}

.nav-icon {
  font-size: 1.2rem;
  min-width: 24px;
}

.nav-text {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: "Nunito Sans", sans-serif;
}

.user-avatar-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
}

.logout-btn {
  color: #ef4444 !important;
}

.logout-btn:hover {
  background: #fef2f2 !important;
}

/* Основной контент */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  font-family: "Nunito Sans", sans-serif;
}

.content-header {
  background: rgba(255, 255, 255, 0.9);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-info h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #8d4ba5;
  margin: 0 0 0.25rem 0;
}

.welcome-text {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
}

.add-wish-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(150deg,rgba(151, 222, 217, 1) 0%, rgba(110, 184, 179, 1) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-wish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
}

/* Область контента */
.content-area {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* Статистика */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg,rgba(195, 162, 222, 1) 0%, rgb(163, 114, 204) 100%);
  border-radius: 12px;
  color: white;
}

.stat-info h3 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #7e5186;
  margin: 0;
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
}

.stat-info p {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
}

/* Секция желаний */
.wishes-section {
   background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6c4575;
  margin-top: -1rem;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 8px;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.view-btn.active {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Контейнер желаний */
.wishes-container {
  display: grid;
  gap: 1.5rem;
}

.wishes-container.grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.wishes-container.list {
  grid-template-columns: 1fr;
}

/* Карточки желаний */
.wish-card {
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.wish-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.wish-card.list {
  display: flex;
}

.wish-image-container {
  position: relative;
}

.wish-card.grid .wish-image-container {
  height: 200px;
}

.wish-card.list .wish-image-container {
  width: 200px;
  height: 150px;
  flex-shrink: 0;
}

.wish-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wish-like-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.wish-content {
  padding: 1.5rem;
  flex: 1;
}

.wish-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.wish-description {
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.wish-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background: #ede9fe;
  color: #7c3aed;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.wish-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.wish-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.wish-date {
  font-size: 0.8rem;
  color: #6b7280;
}

.wish-author {
  font-size: 0.8rem;
  color: #8b5cf6;
  font-weight: 500;
}

.wish-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.wish-link:hover {
  background: rgba(59, 130, 246, 0.2);
  text-decoration: none;
}

/* Пустое состояние */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
}

.empty-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(150deg,rgba(151, 222, 217, 1) 0%, rgba(110, 184, 179, 1) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #8b5cf6;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: linear-gradient(150deg,rgba(151, 222, 217, 1) 0%, rgba(110, 184, 179, 1) 100%);
  color: white;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

/* Адаптивность */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    z-index: 1000;
    height: 100vh;
  }
  
  .sidebar.sidebar-collapsed {
    left: -80px;
  }
  
  .sidebar.open {
    left: 0;
  }
  
  .content-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .wish-card.list {
    flex-direction: column;
  }
  
  .wish-card.list .wish-image-container {
    width: 100%;
    height: 200px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .wishes-container.grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .content-area {
    padding: 1rem;
  }
  
  .modal {
    margin: 0.5rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.menu-toggle:hover {
  background: #f1f5f9;
}

/* Стили для мобильного меню */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.sidebar-mobile-open {
  left: 0 !important;
}

/* Кнопки действий в карточке */
.wish-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.delete-btn:hover {
  background: rgba(220, 38, 38, 0.9);
  transform: scale(1.1);
}

/* Модальное окно подтверждения */
.confirm-modal {
  max-width: 400px;
}

.warning-text {
  color: #ef4444;
  font-weight: 500;
}

.btn-danger {
  background: #ef4444;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Профиль пользователя в сайдбаре */
.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #8b5cf6;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-details strong {
  color: #1f2937;
  font-size: 0.9rem;
}

.user-details span {
  color: #6b7280;
  font-size: 0.8rem;
}

/* Адаптивность для мобильных */
@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .sidebar {
    position: fixed;
    left: -280px;
    z-index: 1000;
    height: 100vh;
    transition: left 0.3s ease;
  }
  
  .sidebar.sidebar-collapsed {
    left: -80px;
  }
  
  .content-header {
    flex-direction: row;
    align-items: center;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .wish-actions {
    top: 0.25rem;
    right: 0.25rem;
  }

  .delete-btn {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .content-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-left {
    justify-content: space-between;
  }

  .add-wish-btn {
    width: 100%;
    justify-content: center;
  }
}

.reserved-badge {
  background: rgba(34, 197, 94, 0.9);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

/* Кнопка бронирования */
.reserve-btn {
  background: rgba(59, 130, 246, 0.9);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.reserve-btn:hover {
  background: rgba(37, 99, 235, 0.9);
  transform: scale(1.05);
}

/* Кнопка редактирования */
.edit-btn {
  background: rgba(234, 179, 8, 0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.edit-btn:hover {
  background: rgba(202, 138, 4, 0.9);
  transform: scale(1.1);
}

/* Стили для зарезервированных карточек */
.wish-card.reserved {
  opacity: 0.7;
  position: relative;
}

.wish-card.reserved::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.05);
  z-index: 1;
  pointer-events: none;
}

/* Информация о резерве для владельца */
.reserve-info {
  margin: 1rem 0;
  padding: 0.75rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
}

.reserve-notice {
  color: #16a34a;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
}

/* Группировка кнопок действий */
.wish-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

/* Информационный текст в модалках */
.info-text {
  color: #3b82f6;
  font-size: 0.9rem;
  margin: 0.5rem 0 0 0;
}

/* Адаптивность для мобильных */
@media (max-width: 768px) {
  .wish-actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  
  .reserved-badge,
  .reserve-btn {
    font-size: 0.7rem;
    padding: 0.4rem 0.6rem;
  }
  
  .edit-btn,
  .delete-btn {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
}

</style>