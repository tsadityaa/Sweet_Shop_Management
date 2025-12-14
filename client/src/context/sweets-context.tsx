import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Sweet } from '@/lib/types';

const AUTH_STORAGE_KEY = 'sweet_shop_auth';
const API_BASE = import.meta.env.PROD
  ? "https://sweet-shop-management-triw.onrender.com"
  : "";

interface SweetsContextType {
  sweets: Sweet[];
  isLoading: boolean;
  error: string | null;
  refreshSweets: () => Promise<void>;
  addSweet: (sweet: Omit<Sweet, 'id'>) => Promise<{ success: boolean; data?: Sweet; error?: string }>;
  updateSweet: (id: string, updates: Partial<Sweet>) => Promise<{ success: boolean; data?: Sweet; error?: string }>;
  deleteSweet: (id: string) => Promise<{ success: boolean; error?: string }>;
  purchaseSweet: (id: string, quantity: number) => Promise<{ success: boolean; error?: string }>;
  restockSweet: (id: string, quantity: number) => Promise<{ success: boolean; error?: string }>;
  getSweetById: (id: string) => Sweet | undefined;
}

const SweetsContext = createContext<SweetsContextType | undefined>(undefined);

function getAuthToken(): string | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.token || null;
    }
  } catch (e) {
    console.error('Failed to get auth token:', e);
  }
  return null;
}

async function apiCall<T>(url: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const response = await fetch(API_BASE + url, {
      ...options,
      credentials: 'include',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      console.error(`🚫 Error response: ${response.status}`, errorData);
      return { error: errorData.error || `Request failed with status ${response.status}` };
    }
    
    if (response.status === 204) {
      return { data: {} as T };
    }
    
    const data = await response.json();
    return { data };
  } catch (err: any) {
    return { error: err.message || 'Network error' };
  }
}

function normalizeSweet(sweet: any): Sweet {
  return {
    ...sweet,
    price: typeof sweet.price === 'string' ? parseFloat(sweet.price) : sweet.price,
    stock: typeof sweet.stock === 'string' ? parseInt(sweet.stock) : sweet.stock,
    image: sweet.imageUrl || sweet.image || '',
  };
}

export function SweetsProvider({ children }: { children: React.ReactNode }) {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSweets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await apiCall<Sweet[]>('/api/sweets');
    
    if (result.error) {
      console.error('❌ Error fetching sweets:', result.error);
      setError(result.error);
      setSweets([]);
    } else if (Array.isArray(result.data)) {
      const normalized = result.data.map((sweet, idx) => {
        const norm = normalizeSweet(sweet);
        return norm;
      });
      setSweets(normalized);
    } else {
      console.warn('⚠️ Response data is not an array:', result.data);
      setSweets([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshSweets();
  }, [refreshSweets]);

  const addSweet = useCallback(async (sweetData: Omit<Sweet, 'id'>): Promise<{ success: boolean; data?: Sweet; error?: string }> => {
    const result = await apiCall<Sweet>('/api/sweets', {
      method: 'POST',
      body: JSON.stringify(sweetData),
    });
    
    if (result.error) {
       return { success: false, error: result.error };
    }
    
    if (result.data) {
      const normalizedSweet = normalizeSweet(result.data);
      setSweets(prev => [...prev, normalizedSweet]);
      return { success: true, data: normalizedSweet };
    }
    
    return { success: false, error: 'Unknown error' };
  }, []);

  const updateSweet = useCallback(async (id: string, updates: Partial<Sweet>): Promise<{ success: boolean; data?: Sweet; error?: string }> => {
    const result = await apiCall<Sweet>(`/api/sweets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (result.error) {
      return { success: false, error: result.error };
    }
    
    if (result.data) {
      const normalizedSweet = normalizeSweet(result.data);
      setSweets(prev => prev.map(s => s.id === id ? normalizedSweet : s));
      return { success: true, data: normalizedSweet };
    }
    
    return { success: false, error: 'Unknown error' };
  }, []);

  const deleteSweet = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    const result = await apiCall(`/api/sweets/${id}`, { method: 'DELETE' });
    
    if (result.error) {
      return { success: false, error: result.error };
    }
    
    setSweets(prev => prev.filter(s => s.id !== id));
    return { success: true };
  }, []);

  const purchaseSweet = useCallback(async (id: string, quantity: number): Promise<{ success: boolean; error?: string }> => {
    const result = await apiCall<{ success: boolean; sweet?: Sweet }>(`/api/sweets/${id}/purchase`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
    
    if (result.error) {
      return { success: false, error: result.error };
    }
    
    if (result.data?.sweet) {
      const normalizedSweet = normalizeSweet(result.data.sweet);
      setSweets(prev => prev.map(s => s.id === id ? normalizedSweet : s));
    }
    
    return { success: true };
  }, []);

  const restockSweet = useCallback(async (id: string, quantity: number): Promise<{ success: boolean; error?: string }> => {
    const result = await apiCall<{ success: boolean; sweet?: Sweet }>(`/api/sweets/${id}/restock`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
    
    if (result.error) {
      return { success: false, error: result.error };
    }
    
    if (result.data?.sweet) {
      const normalizedSweet = normalizeSweet(result.data.sweet);
      setSweets(prev => prev.map(s => s.id === id ? normalizedSweet : s));
    }
    
    return { success: true };
  }, []);

  const getSweetById = useCallback((id: string): Sweet | undefined => {
    return sweets.find(s => s.id === id);
  }, [sweets]);

  return (
    <SweetsContext.Provider value={{
      sweets,
      isLoading,
      error,
      refreshSweets,
      addSweet,
      updateSweet,
      deleteSweet,
      purchaseSweet,
      restockSweet,
      getSweetById,
    }}>
      {children}
    </SweetsContext.Provider>
  );
}

export function useSweets() {
  const context = useContext(SweetsContext);
  if (context === undefined) {
    throw new Error('useSweets must be used within a SweetsProvider');
  }
  return context;
}
