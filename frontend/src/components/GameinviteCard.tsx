"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Gamepad2 } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useRouter } from 'next/navigation';
import { markOneNotificationsAsRead_game } from "./markAsRead";

export interface GameInviteCardProps {
  user_id: number;
  id: number;
  username: string;
  avatar_url?: string;
  game_link :string
  onclose: () => void;
}

export default function GameInviteCard({ id, username, avatar_url, user_id, game_link,onclose}: GameInviteCardProps) {
  const [isLoading, setIsLoading] = useState<'accept' | 'reject' | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  const handleAccept = async () => {
    markOneNotificationsAsRead_game(id);
    removeNotification(id);
    onclose();
    router.push(`/game/game-invite/${game_link}`);
    // end for delete only one notification
  };

  const handleReject = async () => {
    setIsLoading('reject');
    try {
      const response = await fetch(`https://localhost:8080/api/game/reject/${user_id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data: { status: boolean, message: string } = await response.json();

      if (response.ok && data.status) {
        toast.success(`${data.message}`);
        removeNotification(id);
        setTimeout(() => setIsVisible(false), 300);
      } else {
        toast.error(`${data.message}`);
      }
    } catch (error) {
      console.error("Error rejecting game invite:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(null);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-700/30 transition-colors">
      <div className="relative">
        <img
          src={avatar_url || '/default-avatar.png'}
          alt={username}
          className="w-12 h-12 rounded-full"
        />
    
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">
          {username}
        </p>
        <p className="text-slate-400 text-sm">
          invited you to play a game
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          disabled={isLoading !== null}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isLoading === 'accept' ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle size={16} />
              <span>Accept</span>
            </>
          )}
        </button>
        
        <button
          onClick={handleReject}
          disabled={isLoading !== null}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isLoading === 'reject' ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <XCircle size={16} />
              <span>Decline</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}