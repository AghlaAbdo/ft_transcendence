"use client";

import { log } from "node:console";
import { useState } from "react";
import { toast } from "sonner";

export interface FriendRequestCardProps {
  id: number;
  username: string;
  // online_status: boolean;
  avatar_url?: string;
  // status: string;
}

export default function FriendRequestCard({ id, username, avatar_url }: FriendRequestCardProps) {
  const [isLoading, setIsLoading] = useState<'accept' | 'reject' | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const handleAccept = async () => {
    setIsLoading('accept');
    try {
      const response = await fetch(`https://localhost:8080/api/friends/accept/${id}`, {
        method: "PUT",
        credentials: "include",
      });

      const data: { status: boolean, message: string} = await response.json();

      if (response.ok && data.status) {
        toast.success(`${data.message}`);
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
      const response = await fetch(`https://localhost:8080/api/friends/reject/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      const data: {status: boolean, message: string} = await response.json();
      if (response.ok && data.status) {
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
          src={avatar_url || "/avatars/avatar1.png"} // TODO add default-avatar
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <p className="text-lg font-bold">{username}</p>
      </div>

      {/* <div className="flex gap-3">
        <button
          onClick={handleAccept}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold disabled:opacity-50"
        >
          Accept
        </button>
        <button
          onClick={handleReject}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold disabled:opacity-50"
        >
          Reject
        </button>
      </div> */}

      <div className="flex gap-3">
        <button
          onClick={handleAccept}
          disabled={isLoading !== null}
          className={`
            px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold 
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2 min-w-[100px] justify-center
            ${isLoading === 'accept' ? 'bg-green-700' : ''}
          `}
        >
          {isLoading === 'accept' ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Accepting...
            </>
          ) : (
            'Accept'
          )}
        </button>
        
        <button
          onClick={handleReject}
          disabled={isLoading !== null}
          className={`
            px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold 
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2 min-w-[100px] justify-center
            ${isLoading === 'reject' ? 'bg-red-700' : ''}
          `}
        >
          {isLoading === 'reject' ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Rejecting...
            </>
          ) : (
            'Reject'
          )}
        </button>
      </div>
    </div>
  );
}