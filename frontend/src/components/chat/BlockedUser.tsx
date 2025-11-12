import { Ban } from 'lucide-react';

export const BlockedUserInput = () => {
  return (
    <div className="py-3 flex items-center justify-center">
      <div className="w-full bg-slate-800 rounded-xl px-4 py-2 shadow-sm border border-gray-700 text-center">
        <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 mb-1">
          <Ban className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-medium text-purple-200 mb-0.5">You are blocked</h3>
        <p className="text-xs text-gray-400">You cannot send messages to this user.</p>
      </div>
    </div>
  );
};
