"use client";

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
  const handleAccept = async () => {
    await fetch(`/api/friends/accept/${id}`, { method: "PUT" });
  };

  const handleReject = async () => {
    await fetch(`/api/friends/reject/${id}`, { method: "DELETE" });
  };


  return (
    <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl shadow-md w-full max-w-md">
      <div className="flex items-center gap-3">
        <img
          src={avatar_url || "/default-avatar.png"} // TODO add default-avatar
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <p className="text-lg font-bold">{username}</p>
      </div>

      <div className="flex gap-3">
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
      </div>
    </div>
  );
}
// function FriendRequestCard({ id, username, avatar }) {


//   return (
//     <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
//       <div className="flex items-center space-x-3">
//         <img src={avatar} alt={username} className="w-10 h-10 rounded-full" />
//         <span className="font-medium">{username}</span>
//       </div>
//       <div className="space-x-2">
//         <button onClick={handleAccept} className="text-green-600">Accept</button>
//         <button onClick={handleReject} className="text-red-600">Reject</button>
//       </div>
//     </div>
//   );
// }
