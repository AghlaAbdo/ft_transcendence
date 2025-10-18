'use client';

// import { socket } from '@/app/(protected)/lib/socket';
import { useAuth } from '@/hooks/useAuth';
import { Eye, UserPlus } from 'lucide-react';
import { useState } from 'react';
// import { useSocket } from '@/context/SocketContext';
import { toast } from 'sonner';
import { ta } from 'zod/v4/locales';
import { useSocketStore } from '@/store/useNotificationSocket';
// import {} from
export interface usercardprops {
  id: number;
  username: string;
  online_status: number;
  avatar_url?: string;
  // status: string;
}

export default function UserCard({
  id,
  username,
  avatar_url,
  online_status,
}: usercardprops) {

  const {user} = useAuth();
  const {socket} =  useSocketStore();
  const send_friend_request = async (target: number) => {
    if (!user || !socket)
        return ;
    socket.emit("Notification", {
      user_id: user.id,
      actor_id: target,
      type: "friend_request"
    })
  };

  return (
    <div
      className='flex items-center rounded-lg justify-between w-full p-3  bg-slate-700 hover:bg-slate-600 transition-colors overflow-visible'
    >
      {/* User Info */}
      <div className='flex items-center flex-1 min-w-0 space-x-2'>
        <img
          src={avatar_url}
          alt={username}
          className='w-12 h-12 rounded-full object-cover border-2 border-gray-600 flex-shrink-0'
        />
        <div className='flex flex-col min-w-0'>
          <h3 className='text-white font-semibold text-lg truncate'>
            {username}
          </h3>
          <p className='text-gray-400 text-sm truncate'>
            {online_status === 1
              ? 'Online'
              : online_status === 2
                ? 'In Game'
                : 'Offline'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex space-x-2 flex-shrink-0 overflow-visible'>
        {/* View Profile */}
        <div className='relative group'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // handle view profile
            }}
            className='p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors'
          >
            <Eye className='w-5 h-5' />
          </button>
          {/* Tooltip */}
          <span className='absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-lg z-[60]'>
            View
          </span>
        </div>

        {/* Add Friend */}
        <div className='relative group'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              send_friend_request(id)
            }}
            className='p-2 text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors'
          >
            <UserPlus className='w-5 h-5' />
          </button>
          {/* Tooltip */}
          <span className='absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-lg z-[60]'>
            Add
          </span>
        </div>
      </div>
    </div>
  );
}
