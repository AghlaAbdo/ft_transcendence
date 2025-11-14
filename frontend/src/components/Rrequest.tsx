"use client";

import { useNotificationStore } from "@/store/useNotificationStore";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

export interface FriendRequestCardProps {
  user_id: number;
  id: number;
  username: string;
  avatar_url?: string;
}

export default function FriendRequestCard({ id, username, avatar_url, user_id }: FriendRequestCardProps) {
  const [isLoading, setIsLoading] = useState<'accept' | 'reject' | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  const handleAccept = async () => {
    setIsLoading('accept');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/api/friends/accept/${user_id}`, {
        method: "PUT",
        credentials: "include",
      });

      const data: { status: boolean, message: string} = await response.json();

      if (response.ok && data.status) {
        toast.success(`${data.message}`);
        removeNotification(id);
        setTimeout(() => setIsVisible(false), 300);
      } else {
        toast.error(`${data.message}`);
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(null);
    }
  };
  
  const handleReject = async () => {
    setIsLoading('reject');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/api/friends/reject/${user_id}`, {
        method: "DELETE",
        credentials: "include"
      });

      const data: {status: boolean, message: string} = await response.json();
      if (response.ok && data.status) {
        removeNotification(id);
        toast.success(`${data.message}`);
        setTimeout(() => setIsVisible(false), 300);
      } else {
        toast.error(`${data.message}`);
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(null);
    }
  };

  if (!isVisible) {
    return null;
  }


  return (
    <div className="flex items-center justify-between bg-slate-700 hover:bg-slate-800 p-3 shadow-md w-full scrollbar-none [&::-webkit-scrollbar]:hidden">
      <div
      className="flex items-center gap-3">
        <img
          src={avatar_url || "/avatars/avatar1.png"}
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <p className="text-lg font-bold">{username}</p>
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