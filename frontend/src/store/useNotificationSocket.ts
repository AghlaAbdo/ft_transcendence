'use client';

import { Socket, io } from 'socket.io-client';
import { toast } from 'sonner';
import { create } from 'zustand';
import { useNotificationStore } from '@/store/useNotificationStore';
import { markOneNotificationsAsRead_game } from '@/components/markAsRead';

interface SocketState {
  socket: Socket | null;
  connect: (userId: number) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connect: (userId) => {
    if (get().socket) return;
    const socket = io({
      path: '/ws/user/socket.io/',
      autoConnect: false,
      withCredentials: true,
    });
    socket.connect();
    socket.on('connect', () => {
      console.log('Connected to socket');
    });

    socket.on('Notification', async (data) => {
      const { addNotification, incrementUnread , removeNotification, decrementUnread} =
        useNotificationStore.getState();

      const userRes = await fetch(
        `/api/users/profile/${data.user_id}`,
        {
          credentials: 'include',
        }
      );
      const userData = await userRes.json();
      data = {
        ...data,
        user_username: userData.user.username,
        user_avatar: userData.user.avatar_url,
      };
      addNotification(data);
    incrementUnread();
      toast.info('you have new notification !');
      if (data.type === 'game_invite') {
        setTimeout(() => {
          markOneNotificationsAsRead_game(data.id);
          removeNotification(data.id);
          decrementUnread();
        }, 30000); // 30s
      }
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
