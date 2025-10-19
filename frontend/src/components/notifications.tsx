// <Modal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//         >
//           {/* Your modal content */}
//           <input
//             type='text'
//             onChange={(e) => {
//               onsearch_change(e.target.value.trim());
//             }}
//             placeholder='Username...'
//             className='w-full py-1.5 pl-3 pr-3 bg-[#1F2937] text-white placeholder-gray-400 border border-gray-600 rounded-lg outline-none focus:border-purple-600'
//           />
//           {/* <p className='text-sm text-gray-500 mt-2'>Users list</p> */}
//           <div className='max-h-[60vh] overflow-y-auto'>
//           </div>
//         </Modal>
// const [users, setusers] = useState<User[]>([]);
// const [filteredUsers, setfilteredusers] = useState<User[]>([]);
// const { user } = useAuth();
// const [isLoading, setIsLoading] = useState<boolean>(false)
// const [error, seterror] = useState<string | null>(null)
// useEffect(() => {
//   // setIsLoading(true)
//   // seterror("")
//   // setTimeout(()=>{}, 10000)
//   fetch(`https://localhost:8080/api/users`)
//   .then((res) => res.json())
//   .then((u) => {
//     if (u.status)
//       setusers(u.users)
//   })
//   .catch((err) => console.log('users fetching failed because of: ', err));
// }, []);
// const onsearch_change = async (search_input: string) => {
//   if (search_input && search_input.trim() && user) {
//     setfilteredusers(
//       users.filter((_user) =>
//         _user.id != user.id &&
//         _user.username.toLowerCase().includes(search_input.toLowerCase()))
//     );
//   } else setfilteredusers([]);
// };
// import avatar from '@/../public/avatars/avatar1.png';
// 
import { useEffect, useState } from 'react';
import { useNotificationStore } from "@/store/useNotificationStore";
import { Eye, UserPlus, X } from 'lucide-react';
import { Bell, Check, Clock, Gamepad2 } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

import FriendRequestCard from './Rrequest';
import { markAllNotificationsAsRead_friend, markAllNotificationsAsRead_game } from './markAsRead';

type notification = {
  id: number;
  user_id: number;
  actor_id: string;
  // avatar_url: string;
  type: string;
  read: boolean;
  created_at: string;
};

interface Notification_props {
  onClose: () => void;
}

const NotificationCenter = ({ onClose }: Notification_props) => {
  // const [notifications, setNotifications] = useState<notification[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('friend_request');
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const { notifications, setNotifications, setError, setIsLoading, isLoading, resetUnread } = useNotificationStore();
  const friendRequests = notifications.filter(
    (n) => n.type === 'friend_request'
  );
  const gameInvites = notifications.filter((n) => n.type === 'game_invite');

  const activeNotifications =
    activeTab === 'friend_request' ? friendRequests : gameInvites;

  const { user } = useAuth();

  useEffect(() => {
  if (!user) return;
  // markAllNotificationsAsRead(user.id); // make a function in the component file .
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`https://localhost:8080/api/users/notifications/${user.id}`);
      const data = await res.json();

      if (data.status) {
        console.log('notifs:', data);
        setNotifications(data.notifications); // auto-sets unreadCount
      }
    } catch (err) {
      console.error('API Error:', err);
    }
  };

  fetchNotifications();
}, [user]);

// const openNotifications = async () => {
//   if (user)
//   {
//     const userId = user.id;
//     resetUnread();
//     await fetch('https://localhost:8080/api/chat/notifications/mark-as-read', {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ userId }),
//     });
//   }
// };
  // if (notifications)
  //   console.log('notifs fetched: ' , notifications);
  // const getTimeAgo = (timestamp) => {
  //   const seconds = Math.floor((new Date() - timestamp) / 1000);
  //   if (seconds < 60) return 'just now';
  //   const minutes = Math.floor(seconds / 60);
  //   if (minutes < 60) return `${minutes}m ago`;
  //   const hours = Math.floor(minutes / 60);
  //   if (hours < 24) return `${hours}h ago`;
  //   return `${Math.floor(hours / 24)}d ago`;
  // };

  const handleAccept = (id: number) => {
    // setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleDecline = (id: number) => {
    // setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div>
      <div className='max-w-2xl mx-auto'>
        {/* Notification Panel */}
        {isOpen && (
          <div className='bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700'>
            {/* Header */}
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

            {/* Tab Navigation */}
            { user &&

              <div className='flex border-b border-slate-700 bg-slate-750'>
              <button
                onClick={() => {setActiveTab('friend_request');
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
                onClick={() => {setActiveTab('game_invite')
                  markAllNotificationsAsRead_game(user.id)
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-all ${
                  activeTab === 'game_invite'
                  ? 'text-purple-400 bnotifg-slate-700 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                  }`}
                  >
                <Gamepad2 size={18} />
                <span>Game Invites</span>
              </button>
            </div>
              }

            {/* Notifications List */}
            <div className='max-h-[600px] overflow-y-auto'>
              {activeNotifications.length === 0 ? (
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
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div
                  className='overflow-y-auto max-h-64 divide-y divide-slate-600 scrollbar-none [&::-webkit-scrollbar]:hidden'>
                  {activeNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className=" transition-all duration-200 hover:bg-slate-750">
                      <FriendRequestCard
                        avatar_url='https://ui-avatars.com/api/?name=IM&background=ffa700&color=fff&size=150&bold=true&font-size=0.6'
                        id={notif.id}
                        username='imad'
                      />
                    </div>
                  ))}
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
