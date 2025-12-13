export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface SearchFilters {
  query: string;
  category: string;
  minPrice: number;
  maxPrice: number;
}

export type SweetCategory = 
  | 'Chocolates'
  | 'Candies'
  | 'Cookies'
  | 'Cakes'
  | 'Ice Cream'
  | 'Pastries';

export const SWEET_CATEGORIES: SweetCategory[] = [
  'Chocolates',
  'Candies',
  'Cookies',
  'Cakes',
  'Ice Cream',
  'Pastries',
];
