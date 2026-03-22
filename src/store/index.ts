// =====================================================
// USER STORE
// Zustand store for managing user state
// =====================================================

import { create } from 'zustand';
import type { User } from '@/types';

// Simple client-side cache
const clientCache = new Map<string, { data: unknown; expiry: number }>();

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  
  setUser: (user) => set({ 
    user, 
    isLoggedIn: !!user,
    isLoading: false 
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  logout: async () => {
    try {
      // Call logout API
      const res = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear state regardless of API response
      clientCache.clear();
      
      // Clear local and session storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Clear state
      set({ user: null, isLoggedIn: false, isLoading: false });
      
      // Force page reload to clear any cached data
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear state on error
      set({ user: null, isLoggedIn: false, isLoading: false });
      
      // Force page reload
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  },
  
  refreshUser: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.data) {
        set({ 
          user: data.data, 
          isLoggedIn: true,
          isLoading: false 
        });
      } else {
        set({ user: null, isLoggedIn: false, isLoading: false });
      }
    } catch {
      set({ user: null, isLoggedIn: false, isLoading: false });
    }
  },
}));

// =====================================================
// ADMIN STORE
// Zustand store for admin state
// =====================================================

interface AdminState {
  isLoggedIn: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  isLoggedIn: false,
  isLoading: true,
  
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        set({ isLoggedIn: true, isLoading: false });
      } else {
        set({ isLoggedIn: false, isLoading: false });
      }
    } catch {
      set({ isLoggedIn: false, isLoading: false });
    }
  },
  
  logout: async () => {
    try {
      await fetch('/api/admin/logout', { 
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Admin logout error:', error);
    }
    
    // Clear state
    set({ isLoggedIn: false, isLoading: false });
    
    // Force page reload
    if (typeof window !== 'undefined') {
      window.location.href = '/admin';
    }
  },
}));

// =====================================================
// APP STORE
// Zustand store for app-wide state
// =====================================================

type ActiveTab = 'home' | 'service' | 'menu' | 'record' | 'mine';
type ActivePage = 'main' | 'deposit' | 'withdraw' | 'teams' | 'messages' | 'wallets' | 'settings' | 'profile' | 'deposit-records' | 'withdraw-records' | 'register' | 'login' | 'transactions';

interface AppState {
  activeTab: ActiveTab;
  activePage: ActivePage;
  setActiveTab: (tab: ActiveTab) => void;
  setActivePage: (page: ActivePage) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'home',
  activePage: 'main',
  
  setActiveTab: (tab) => set({ activeTab: tab, activePage: 'main' }),
  setActivePage: (page) => set({ activePage: page }),
}));
