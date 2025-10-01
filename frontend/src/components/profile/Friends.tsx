
import { Gamepad2 } from "lucide-react";
import Image from "next/image";

interface Friend {
  id: string;
  username: string;
  avatar: string;
  status: 0 | 1 | 2;
}

const friends: Friend[] = [
    { id: "1", username: "username3", avatar: "/avatars/avatar3.png", status: 1 },
    { id: "2", username: "username4", avatar: "/avatars/avatar4.png", status: 0 },
    { id: "3", username: "username5", avatar: "/avatars/avatar1.png", status: 2 },
    { id: "4", username: "username6", avatar: "/avatars/avatar2.png", status: 1 },
    { id: "5", username: "username3", avatar: "/avatars/avatar3.png", status: 1 },
    { id: "6", username: "username4", avatar: "/avatars/avatar4.png", status: 0 },
    { id: "7", username: "username5", avatar: "/avatars/avatar1.png", status: 2 },
    { id: "8", username: "username6", avatar: "/avatars/avatar2.png", status: 1 },
  ];


const statusColors: Record<Friend["status"], string> = {
    0: "bg-yellow-500", // offline
    1: "bg-green-500", //online
    2: "bg-orange-500", // in game
};

const statusStyles: Record<Friend["status"], { text: string; classes: string }> = {
    1: {
      text: "ONLINE",
      classes: "border-green-600 text-green-400 bg-green-900/30",
    },
    0: {
      text: "OFFLINE",
      classes: "border-yellow-500 text-yellow-400 bg-yellow-900/30",
    },
    2: {
      text: "IN GAME",
      classes: "border-orange-500 text-orange-400 bg-orange-900/30",
    },
  };

export default function Friends () {
  return (
    <div className="mt-2">
      <div className="w-full flex flex-col gap-4">
        {friends.map((friend) => {
          const style = statusStyles[friend.status];
          return (
            <div
              key={friend.id}
              className="flex items-center justify-between bg-[#0f172a]  rounded-2xl px-6 py-4 hover:bg-[#1b2235] transition"
            >
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src={friend.avatar}
                  alt={friend.username}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                {/* Online status dot */}
                <span
                  className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-[#0f172a] ${statusColors[friend.status]}`}
                />
              </div>
              <span className="font-semibold text-xl">{friend.username}</span>
            </div>

              <div
                className={`flex items-center gap-2 px-4 py-1 rounded-full border font-bold text-sm ${style.classes}`}
              >
                {style.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
