import { Eye, Gamepad2, Ban} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSocketStore } from '@/store/useNotificationSocket';
type chat_options_props = {
  handle_block : (target_id: number) => void;
  onClose: () => void;
  _other_user: Friend;
  user: number;
  blocked: boolean;
  blocker: boolean;
}

interface Friend {
  id: number,
  username: string,
  online_status: 0 | 1 | 2;
  avatar_url: string;
}

const UserActionsMenu = ({ onClose, _other_user, user, handle_block, blocker, blocked}: chat_options_props) => {
  const router = useRouter();
  const handleViewProfile = (id: number) => {
    router.push(`/profile/${id}`);
  }
  const { socket } =  useSocketStore();
  const handleInviteToGame = async () => {
    if (!socket)
        return;
    console.log('Invite to game clicked');
    onClose();

    const response = await fetch(`/api/game/game-invite?challengerId=${user}&opponentId=${_other_user.id}`, {
      method: 'POST'
    });
    const data = await response.json();
    console.log("recived data in gameInvite: ", data);
    if (data && data.gameId) {
      socket.emit("Notification", {
        user_id: user,
        actor_id: _other_user.id,
        type: "game_invite",
        game_link :data.gameId,
      })
      router.push(`/game/game-invite/${data.gameId}`);
    }
  };

  const handleBlock = () => {
    handle_block(_other_user.id);
    onClose();
  };

  return (
    <div className="p-0">

      <div>
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

        <button
          onClick={handleInviteToGame}
          disabled={blocker || blocked}
          className={`flex items-center w-full p-2 rounded-lg transition-all duration-200 group ${
            blocker || blocked 
              ? 'text-gray-500 cursor-not-allowed opacity-50' 
              : 'text-gray-200 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <div className="p-1">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="ml-3 font-medium">Invite to Game</span>
        </button>

        <button
          onClick={handleBlock}
          disabled={blocker || blocked}
          className={`flex items-center w-full p-2 rounded-lg transition-all duration-200 group ${
            blocker || blocked
              ? 'text-gray-500 cursor-not-allowed opacity-50'
              : 'text-gray-200 hover:bg-red-900/30 hover:text-red-400'
          }`}
        >
          <div className={`p-1 ${blocker || blocked ? '' : 'text-red'}`}>
            <Ban className="w-5 h-5" />
          </div>
          <span className={`ml-3 font-medium ${blocker || blocked ? '' : 'text-red'}`}>Block User</span>
        </button>
      </div>
    </div>
  );
};

export default UserActionsMenu;