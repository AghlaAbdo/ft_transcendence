import { Ban } from 'lucide-react';
import { toast } from 'sonner';

type BlockingUserProps = {
  onUnblock?: () => void;
};

export const BlockingUserInput = ({ onUnblock }: BlockingUserProps) => {
  const handleUnblock = () => {
    if (onUnblock) {
      try {
        onUnblock();
        toast.success('User has been unblocked');
      } catch (err) {
        toast.error('Failed to unblock user');
      }
    } else {
      // placeholder behaviour if no handler provided
    //   toast('Unblock action not implemented', { duration: 3000 });
    }
  };

  return (
    <div className="py-3 flex items-center justify-center">
      <div className="w-full bg-slate-800 rounded-xl px-4 py-3 shadow-sm border border-gray-700 text-center">
        <div className="mx-auto mb-2 w-9 h-9 flex items-center justify-center rounded-md bg-red-600/10 text-red-400">
          <Ban className="w-4 h-4"/>
        </div>

        <h3 className="text-sm font-semibold text-purple-200">You blocked this user</h3>
        <p className="text-xs text-gray-400 mt-1">They won't be able to send or receive messages to/from you.</p>

        <div className="mt-3 ">
          <button
            type="button"
            onClick={handleUnblock}
            aria-label="Unblock user"
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium text-purple-100 bg-transparent border border-purple-700 hover:bg-purple-700/10 hover:outline-none hover:ring-2 hover:ring-purple-600/30 transition-colors"
          >
            Unblock
          </button>
        </div>
      </div>
    </div>
  );
};