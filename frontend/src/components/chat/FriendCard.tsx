'use client';

import { User } from '@/hooks/useAuth';
import { useSocketStore } from '@/store/useNotificationSocket';

// type User = {
//   id: number;
//   username: string;
//   online_status: 0 | 1 | 2;
//   avatar_url: string;
// };
type UserCardProps = {
  _user: Friend;
};


interface Friend {
  id: number,
  username: string,
  online_status: 0 | 1 | 2;
  avatar_url: string;
}


export default function FriendCard({ _user }: UserCardProps) {
  return (
    <div className="flex items-center justify-between w-full p-3 bg-slate-700 hover:bg-slate-600 transition-colors rounded-lg overflow-visible">
      <div className="flex items-center flex-1 min-w-0 space-x-3">
        <img
          src={_user.avatar_url}
          alt={_user.username}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-600 flex-shrink-0"
        />

        <div className="flex flex-col min-w-0">
          <h3 className="text-white font-semibold text-lg truncate">
            {_user.username}
          </h3>
          <div className="flex items-center space-x-2">
            <p className="text-gray-400 text-sm truncate">
              {_user.online_status === 1
                ? 'Online'
                : _user.online_status === 2
                ? 'In Game'
                : 'Offline'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


