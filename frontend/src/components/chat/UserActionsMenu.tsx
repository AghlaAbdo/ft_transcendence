import { Eye, Gamepad2, Ban, X } from 'lucide-react';

type chat_options_props = {
  onClose: () => void;
}

const UserActionsMenu = ({ onClose }: chat_options_props) => {
  const handleViewProfile = () => {
    console.log('View profile clicked');
    onClose();
    // Add your profile viewing logic here
  };

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
          onClick={handleViewProfile}
          className="flex items-center w-full p-2 text-gray-200 rounded-lg hover:bg-slate-800 hover:text-white transition-all duration-200 group"
        >
          <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:bg-purple-500/30 transition-colors duration-200">
            <Eye className="w-5 h-5" />
          </div>
          <span className="ml-3 font-medium">View Profile</span>
        </button>

        {/* Invite to Game */}
        <button
          onClick={handleInviteToGame}
          className="flex items-center w-full p-2 text-gray-200 rounded-lg hover:bg-slate-800 hover:text-white transition-all duration-200 group"
        >
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 transition-colors duration-200">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="ml-3 font-medium">Invite to Game</span>
        </button>

        {/* Block User */}
        <button
          onClick={handleBlock}
          className="flex items-center w-full p-2 text-gray-200 rounded-lg hover:bg-red-900/30 hover:text-red-400 transition-all duration-200 group"
        >
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400 group-hover:bg-red-500/30 transition-colors duration-200">
            <Ban className="w-5 h-5" />
          </div>
          <span className="ml-3 font-medium">Block User</span>
        </button>
      </div>
    </div>
  );
};

export default UserActionsMenu;