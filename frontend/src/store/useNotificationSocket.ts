'use client';

import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useNotificationStore } from '@/store/useNotificationStore';

type notification = {
  id: number;
  user_id: number;
  actor_id: string;
  // avatar_url: string;
  type: string;
  read: boolean;
  created_at: string;
};

interface SocketState {
  socket: Socket | null;
  connect: (userId: number) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connect: (userId) => {
    // Avoid reconnecting if already connected
    if (get().socket) return;

    const socket = io(`https://localhost:8080`, {
      path: '/ws/user/socket.io/',
      auth: { user_id: userId },
    });

    socket.on('connect', () => {
      console.log('Connected to socket');
    });

    socket.on('Notification', (data) => {
      const { addNotification, incrementUnread } = useNotificationStore.getState();
      addNotification(data);
      incrementUnread();
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket');
      set({ socket: null });
    });

    set({ socket });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect(); 
      set({ socket: null });
      console.log('Socket disconnected manually');
    }
  },
}));
