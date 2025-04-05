import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Mock API for now - would be replaced with real API calls
const mockLogin = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // For demo purposes, accept any email with a password longer than 5 chars
  if (password.length < 6) {
    throw new Error('Invalid credentials');
  }
  
  return {
    user: {
      id: '1',
      name: email.split('@')[0],
      email,
      role: email.includes('admin') ? 'admin' : 'user',
    },
    token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
  };
};

const mockRegister = async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  
  return {
    user: {
      id: '1',
      name,
      email,
      role: 'user',
    },
    token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await mockLogin(email, password);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await mockRegister(name, email, password);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
