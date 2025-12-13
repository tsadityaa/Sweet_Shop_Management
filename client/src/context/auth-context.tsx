import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthState, LoginCredentials, RegisterCredentials } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';

const AUTH_STORAGE_KEY = 'sweet_shop_auth';
const API_BASE = import.meta.env.PROD
  ? "https://sweet-shop-management-triw.onrender.com"
  : "";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAuthState({
          user: parsed.user,
          token: parsed.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      console.log('\n🔐 === LOGIN ATTEMPT ===');
      console.log('📝 Credentials:', { email: credentials.email, password: '***' });
      
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      const data = await response.json() as { user: User; token: string };
      
      console.log('\n✅ Login response received');
      console.log('   User:', data.user);
      console.log('   Token type:', typeof data.token);
      console.log('   Token first 40 chars:', data.token ? data.token.substring(0, 40) + '...' : 'MISSING!');
      console.log('   Token starts with Bearer?', data.token?.startsWith('Bearer'));
      
      if (!data.token) {
        console.error('❌ ERROR: Server did not return a token!');
        return { success: false, error: 'Login failed: No token received from server' };
      }
      
      // Clean token if it has Bearer prefix (shouldn't happen, but just in case)
      const cleanToken = data.token.startsWith('Bearer ') ? data.token.substring(7) : data.token;
      console.log('   Clean token:', cleanToken.substring(0, 40) + '...');
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: data.user, token: cleanToken }));
      console.log('✅ Token saved to localStorage (cleaned)');
      console.log('   Stored token first 40 chars:', cleanToken.substring(0, 40) + '...\n');
      
      setAuthState({ 
        user: data.user, 
        token: cleanToken, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return { success: true, user: data.user };
    } catch (error: any) {
      const errorMessage = error?.message || 'Invalid email or password';
      console.error('❌ Login error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const response = await apiRequest('POST', '/api/auth/register', credentials);
      const data = await response.json() as { user: User; token: string };
      
      console.log('✅ Register response received');
      console.log('   User:', data.user);
      console.log('   Token from server:', data.token ? data.token.substring(0, 40) + '...' : 'MISSING!');
      
      if (!data.token) {
        console.error('❌ ERROR: Server did not return a token!');
        return { success: false, error: 'Registration failed: No token received from server' };
      }
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: data.user, token: data.token }));
      console.log('✅ Token saved to localStorage');
      
      setAuthState({ 
        user: data.user, 
        token: data.token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return { success: true, user: data.user };
    } catch (error: any) {
      const errorMessage = error?.message || 'Registration failed';
      console.error('❌ Register error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getAuthToken(): string | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.token;
    } catch {
      return null;
    }
  }
  return null;
}
