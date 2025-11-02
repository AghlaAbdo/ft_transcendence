import { Eye, Gamepad2, Ban, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {toast}  from "sonner"
import { User } from '@/hooks/useAuth';
type chat_options_props = {
  onClose: () => void;
  _other_user: Friend;
}


interface Friend {
  id: number,
  username: string,
  online_status: 0 | 1 | 2;
  avatar_url: string;
}

const UserActionsMenu = ({ onClose, _other_user }: chat_options_props) => {
  const router = useRouter();
  const handleViewProfile = (id: number) => {
    router.push(`/profile/${id}`);
  }

  const handleInviteToGame = () => {
    console.log('Invite to game clicked');
    onClose();
    // Add your game invitation logic here
  };

  const handleBlock = () => {
    console.log('Block user clicked');
    onClose();
    // Add your blocking logic here
  };

  return (
    <div className="p-0">
      {/* Header */}

      {/* Action Buttons */}
      <div>
        {/* View Profile */}
        <button
          onClick={() => {
            handleViewProfile(_other_user.id)
            onClose()
          }
          }
          className="flex items-center w-full p-2 text-gray-200 rounded-lg hover:bg-slate-700 hover:text-white transition-all duration-200 group"
        >
          <div className="p-1">
            <Eye className="w-5 h-5" />
          </div>
          <span className="ml-3 font-medium">View Profile</span>
        </button>

        {/* Invite to Game */}
        <button
          onClick={handleInviteToGame}
          className="flex items-center w-full p-2 text-gray-200 rounded-lg hover:bg-slate-700 hover:text-white transition-all duration-200 group"
        >
          <div className="p-1">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="ml-3 font-medium">Invite to Game</span>
        </button>

        {/* Block User */}
        <button
          onClick={handleBlock}
          className="flex items-center w-full p-2 text-gray-200 rounded-lg hover:bg-red-900/30 hover:text-red-400 transition-all duration-200 group"
        >
          <div className="p-1 text-red">
            <Ban className="w-5 h-5" />
          </div>
          <span className="ml-3 text-red font-medium">Block User</span>
        </button>
      </div>
    </div>
  );
};

export default UserActionsMenu;