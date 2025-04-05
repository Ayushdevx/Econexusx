import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: Notification[];
  unreadNotifications: number;
  isMenuOpen: boolean;
  isChatOpen: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  addNotification: (notification: Notification) => void;
  markNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
  toggleMenu: () => void;
  toggleChat: () => void;
  setChatOpen: (isOpen: boolean) => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'en',
      notifications: [],
      unreadNotifications: 0,
      isMenuOpen: false,
      isChatOpen: false,
      
      setTheme: (theme) => set({ theme }),
      
      setLanguage: (language) => set({ language }),
      
      addNotification: (notification) => 
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadNotifications: state.unreadNotifications + 1
        })),
      
      markNotificationsAsRead: () => 
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadNotifications: 0
        })),
      
      removeNotification: (id) => 
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
          unreadNotifications: state.notifications.filter(n => !n.read && n.id !== id).length
        })),
      
      toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
      
      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
      
      setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
    }),
    {
      name: 'app-storage',
    }
  )
);
