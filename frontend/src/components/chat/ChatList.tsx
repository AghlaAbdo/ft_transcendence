// "use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Search_Input } from "./Search_Input";
import { formatDistanceToNow } from "date-fns";



interface Message {
  id: number;
  chat_id: number;
  sender: number;
  receiver: number;
  content: string;
  created_at: string;
}

interface Chat {
  chat_id: number;
  sender: number;
  receiver: number;
  last_message_content: string;
  last_message_timestamp: string;
  last_message_id?: number;
}

interface ChatlistProps {
  onSelect: (chatId: number) => void;
  onReceiveChange: (userId_2: number) => void;
  selectedChatId: number | null;
  userId: number | null;
  conv: Message[];
}

export const Chatlist = ({
  onSelect,
  selectedChatId,
  userId,
  onReceiveChange,
  conv,
}: ChatlistProps) => {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    // console.log('user in chatlist comp: ', userId);

    if (userId) {
      fetch(`${process.env.NEXT_PUBLIC_CHAT_API}/chats/${userId}`)
        .then((res) => res.json())
        .then((data: Chat[]) => {
          console.log("chats fetched from backend:", data);
          setChats(data);
        })
        .catch((err) => console.error("Failed to fetch chats:", err));
    }
  }, [selectedChatId, userId, conv]);

  return (
    <>
      <div className="w-1/4 outline-none flex flex-col bg-[#021024] rounded-[20px] my-2 mt-20 ">
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-xl font-semibold text-white">Messages</h2>
          <button className="bg-purple-600 hover:bg-purple-700 rounded-lg p-2 transition-colors">
            <Plus className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search_Input />
          </div>
        </div>

        <div className="px-4 pb-4">
          {chats.map((chat) => {
            const otherUserId =
              chat.sender === userId ? chat.receiver : chat.sender;
            return (
              <div
                key={chat.chat_id}
                onClick={() => {
                  onSelect(chat.chat_id);
                  onReceiveChange(otherUserId);
                }}
                className={`flex items-center p-3 my-1 rounded-md cursor-pointer 
                  hover:bg-gray-800 ${
                    selectedChatId === chat.chat_id ? "bg-gray-700" : ""
                  }`}
              >
                <img
                  src="/avatars/avatar3.png"
                  alt={`User ${otherUserId}`}
                  className="w-12 h-12 rounded-full mr-3"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-white">
                      User_{otherUserId}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {
                         formatDistanceToNow(
                            new Date(chat.last_message_timestamp + "Z").toLocaleString(),
                              { addSuffix: true }
                          )}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {chat.last_message_content || "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
