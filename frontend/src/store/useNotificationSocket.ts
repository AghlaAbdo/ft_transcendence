'use client';

import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useNotificationStore } from '@/store/useNotificationStore';

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
    socket.on('Notification', async (data) => {
      const { addNotification, incrementUnread } = useNotificationStore.getState();

      const userRes = await fetch(
                `https://localhost:8080/api/users/profile/${data.user_id}`, {
                  credentials: 'include'
                }
              );
      const userData = await userRes.json();
      data = {
        ...data,
                user_username: userData.user.username,
                user_avatar: userData.user.avatar_url,
      }

      toast.message('you have new notification!')


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
