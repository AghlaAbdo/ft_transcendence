'use client';
import { useAuth, User } from '@/hooks/useAuth';
import { Eye, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSocketStore } from '@/store/useNotificationSocket';
import { useRouter } from 'next/navigation';


type UserCardProps = {
  _user: User
  onClose: () => void; 
};

export default function UserCard({ _user, onClose }: UserCardProps) {

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
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleViewProfile = (id: number) => {
    router.push(`/profile/${id}`);
  }

  const handleAddFriend = async (user: User) => {
    try {
      setLoading(true);
      const response = await fetch("https://localhost:8080/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ friend_id: user.id }),
      });
      
      console.log('friend_id :', user.id);
      if (response.ok) {
        toast.success(`Friend request sent to ${user.username}`);
        send_friend_request(_user.id);
      } else {
        const err = await response.json();
        toast.error(err.message || "Failed to send friend request");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className='flex items-center rounded-lg justify-between w-full p-3  bg-slate-700 hover:bg-slate-600 transition-colors overflow-visible'
    >
      <div className='flex items-center flex-1 min-w-0 space-x-2'>
        <img
          src={_user.avatar_url}
          alt={_user.username}
          className='w-12 h-12 rounded-full object-cover border-2 border-gray-600 flex-shrink-0'
        />
        <div className='flex flex-col min-w-0'>
          <h3 className='text-white font-semibold text-lg truncate'>
            {_user.username}
          </h3>
          <p className='text-gray-400 text-sm truncate'>
            {_user.online_status === 1
              ? 'Online'
              : _user.online_status === 2
                ? 'In Game'
                : 'Offline'}
          </p>
        </div>
      </div>

      <div className='flex space-x-2 flex-shrink-0 overflow-visible'>
        <div className='relative group'>
          <button
            onClick={() => {
              toast.info(`Viewing ${_user.username}'s profile`);
              handleViewProfile(_user.id);
              onClose();
            }}
            className='p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors'
          >
            <Eye className='w-5 h-5' />
          </button>
          <span className='absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-lg z-[60]'>
            View
          </span>
        </div>

        <div className='relative group'>
          <button
            onClick={() => {
              handleAddFriend(_user);
            }}
            className='p-2 text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors'
          >
            <UserPlus className='w-5 h-5' />
          </button>

          <span className='absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-lg z-[60]'>
            Add
          </span>
        </div>
      </div>
    </div>
  );
}
