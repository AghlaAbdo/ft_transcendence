import { useEffect, useState } from 'react';

import { UserPlus, X } from 'lucide-react';
import { Bell, Gamepad2 } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/useNotificationStore';

import GameInviteCard from './GameinviteCard';
import FriendRequestCard from './Rrequest';
import {
  markAllNotificationsAsRead_friend,
  markAllNotificationsAsRead_game,
} from './markAsRead';
import { toast } from 'sonner';

interface Notification {
  id: number;
  user_id: number;
  user_username: string;
  user_avatar: string;
  actor_id: number | null;
  type: string;
  read: number;
  created_at: string;
  game_link: string,
}

interface Notification_props {
  onClose: () => void;
}

const NotificationCenter = ({ onClose }: Notification_props) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('friend_request');
  const [render, setrender] = useState<boolean>(false);
  const {
    notifications,
    setNotifications,
  } = useNotificationStore();
  const friendRequests = notifications.filter(
    (n) => n.type === 'friend_request'
  );
  const gameInvites = notifications.filter((n) => n.type === 'game_invite');

  const activeNotifications =
    activeTab === 'friend_request' ? friendRequests : gameInvites;

  const { user } = useAuth();

  useEffect(() => {
    setrender(false)
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/users/notifications`,  {credentials: "include"}
        );
        if (!res.ok) {
          toast.error('some thing went wrong!');
          return 
        }
        const data = await res.json();
        if (res.ok && data.status) {
          const notificationsWithUserData = await Promise.all(
            data.notifications.map(async (notif: Notification) => {
             const userRes = await fetch(`${process.env.NEXT_PUBLIC_API}/api/users/profile/${notif.user_id}`, {
              credentials: 'include'
            });
              const userData = await userRes.json();
              
              return {
                ...notif,
                user_username: userData.user.username,
                user_avatar: userData.user.avatar_url,
              };
            })
          );
          setNotifications(notificationsWithUserData);
        }
      } catch (err) {
        console.error('API:', err);
      }
    };

    fetchNotifications();
    setrender(true)
  }, [user], );

  return (
    <div>
      <div className='max-w-2xl mx-auto'>
        {isOpen && (
          <div className='bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700'>
            <div className='bg-slate-800 p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Bell className='text-white' size={20} />
                  <h2 className='text-xl font-bold text-white'>
                    Notifications
                  </h2>
                </div>
                <button
                  onClick={() => onClose()}
                  className='text-white hover:bg-white/20 p-1 rounded transition-colors'
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {user && (
              <div className='flex border-b border-slate-700 bg-slate-750'>
                <button
                  onClick={() => {
                    setActiveTab('friend_request');
                    markAllNotificationsAsRead_friend(user.id);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-all ${
                    activeTab === 'friend_request'
                      ? 'text-green-400 bg-slate-700 border-b-2 border-green-400'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <UserPlus size={18} />
                  <span>Friend Requests</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('game_invite');
                    markAllNotificationsAsRead_game(user.id);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-all ${
                    activeTab === 'game_invite'
                      ? 'text-purple-400 bg-slate-700 border-b-2 border-purple-400'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Gamepad2 size={18} />
                  <span>Game Invites</span>
                </button>
              </div>
            )}

            <div className='max-h-[600px] overflow-y-auto'>
              {notifications && activeNotifications.length === 0 ? (
                <div className='p-8 text-center'>
                  {activeTab === 'friend_request' ? (
                    <UserPlus
                      className='mx-auto mb-2 text-slate-600'
                      size={48}
                    />
                  ) : (
                    <Gamepad2
                      className='mx-auto mb-1 text-slate-600'
                      size={48}
                    />
                  )}
                  <p className='text-slate-600 text-lg'>
                    No{' '}
                    {activeTab === 'friend_request'
                      ? 'friend requests'
                      : 'game invites'}
                  </p>
                  <p className='text-slate-600 text-sm mt-1'>
                    You are all caught up!
                  </p>
                </div>
              ) : (
                <div className='overflow-y-auto max-h-64 divide-y divide-slate-600 scrollbar-none [&::-webkit-scrollbar]:hidden'>
                  {render && notifications && activeNotifications.map((notif) =>
                    notif.type === 'friend_request' ? (
                      <div
                        key={notif.id}
                        className='transition-all duration-200 hover:bg-slate-750'
                      >
                        <FriendRequestCard
                          id={notif.id}
                          user_id={notif.user_id}
                          username={notif.user_username}
                          avatar_url={notif.user_avatar}
                        />
                      </div>
                    ) : (
                      <div
                        key={notif.id}
                        className='transition-all duration-200 hover:bg-slate-750'
                      >
                        <GameInviteCard
                          onclose={onClose}
                          id={notif.id}
                          username={notif.user_username}
                          avatar_url={notif.user_avatar}
                          game_link={notif.game_link}
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
