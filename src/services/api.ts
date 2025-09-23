import type { User, RegisterData, LoginData, Wish } from '@/types/auth';

const MOCKAPI_BASE_URL = 'https://68d1f635e6c0cbeb39a63078.mockapi.io/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${MOCKAPI_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  async register(userData: RegisterData): Promise<User> {
    if (userData.password !== userData.confirmPassword) {
      throw new Error('Пароли не совпадают');
    }

    const users = await this.request('/users');
    if (users.find((u: any) => u.username === userData.username)) {
      throw new Error('Имя пользователя уже занято');
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      username: userData.username,
      password: userData.password,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=8b5cf6&color=fff`,
      createdAt: new Date().toISOString()
    };

    await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(newUser),
    });

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async createWish(wishData: Omit<Wish, 'id'>): Promise<Wish> {
  const newWish = {
    id: Math.random().toString(36).substr(2, 9),
    title: wishData.title,
    description: wishData.description,
    image: wishData.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop',
    link: wishData.link,
    userId: wishData.userId,
    createdAt: new Date().toISOString()
  };

  const createdWish = await this.request('/wishes', {
    method: 'POST',
    body: JSON.stringify(newWish),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return createdWish;
}

async deleteWish(wishId: string): Promise<void> {
  await this.request(`/wishes/${wishId}`, {
    method: 'DELETE',
  });
}

  async login(loginData: LoginData): Promise<User> {
    const users = await this.request('/users');
    const user = users.find((u: any) => 
      u.username === loginData.username && u.password === loginData.password
    );

    if (!user) {
      throw new Error('Неверное имя пользователя или пароль');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getWishes() {
    return this.request('/wishes');
  }

  async getUsers() {
    return this.request('/users');
  }
}

export const apiService = new ApiService();
