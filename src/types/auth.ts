export interface User {
  id: string;
  username: string;
  createdAt: string;
  avatar?: string;
}

export interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  username: string;
  password: string;
}
export interface Wish {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  userId: string;
  createdAt: string;
  likes?: number;
  tags?: string[];
}