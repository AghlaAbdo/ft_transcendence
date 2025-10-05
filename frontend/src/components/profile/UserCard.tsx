"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UserCardProps {
  id: number;
  username: string;
  avatar_url: string;
}

export default function UserCard({ id, username, avatar_url }: UserCardProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddFriend = async () => {
    try {
      setLoading(true);

      const response = await fetch("https://localhost:8080/api/friends/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send cookie/token
        body: JSON.stringify({ friend_id: id }),
      });

      if (response.ok) {
        toast.success(`Friend request sent to ${username}`);
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
    <div className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl shadow-md w-full max-w-md hover:bg-slate-700 transition">

      <div className="flex items-center gap-4">
        <img
          src={avatar_url}
          alt={username}
          className="w-12 h-12 rounded-full object-cover border border-slate-600"
        />
        <span className="text-lg font-semibold text-white">{username}</span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => toast.info(`Viewing ${username}'s profile`)}
          className="px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium transition"
        >
          View Profile
        </button>

        <button
          onClick={handleAddFriend}
          disabled={loading}
          className={`px-4 py-2 rounded-xl text-white text-sm font-medium transition ${
            loading
              ? "bg-purple-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading ? "Sending..." : "Add Friend"}
        </button>

      </div>
    </div>
  );
}
