'use client';

import { create } from 'zustand';

interface Notification {
  id: number;
  message?: string;
  type: string;
  user_id: number;
  actor_id: number;
  read: number; // 0 = unread, 1 = read
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;

  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  resetUnread: () => void;
  incrementUnread: () => void;

  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  isLoading: true,
  error: null,
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => n.read === 0).length, // count unread
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      // unreadCount: state.unreadCount + (notification.read === 0 ? 1 : 0),
    })),

  resetUnread: () => set({ unreadCount: 0 }),

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  setError: (error) => set({ error }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
