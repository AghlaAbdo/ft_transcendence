"use client";

import React, { useEffect } from 'react';
import { useState } from 'react';
import FriendRequestCard, { FriendRequestCardProps } from './FriendRequestCard';
import { toast } from 'sonner';


const FriendRequests = () => {
  const [count, setCount] = useState<number>(0);
  const [friendRequests, setFriendRequests] = useState<FriendRequestCardProps[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
        try {
            const res = await fetch('https://localhost:8080/api/friends/pending', {
                credentials: "include"
            });

            // const data
            if (!res.ok) {
                toast.error("Error fetching requests");
            }
            const result = await res.json();

            setFriendRequests(result.data || []);
            setCount(result.count || 0);
        } catch (error) {
            console.error("Failed to load friend requests:", error);
        }
    }

    fetchRequests();

  });


  return (
    <div>
        {friendRequests.map(req => (
            <FriendRequestCard
                key={req.id}
                id={req.id}
                username={req.username}
                avatar_url={req.avatar_url}
            />
        ))
        }
    </div>
  )
}

export default FriendRequests