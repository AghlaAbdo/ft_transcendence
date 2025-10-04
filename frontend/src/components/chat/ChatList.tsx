// "use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search } from "lucide-react";
import { Search_Input } from "./Search_Input";
import { formatDistanceToNow } from "date-fns";
import Modal from "./new_conversation";

interface User {
  id: number;
  username: string;
  avatar_url: string;
  online_status: number;
}

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
  sender: User;
  receiver: User;
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

export const Chatlist = ({ onSelect, selectedChatId, userId, onReceiveChange, conv }: ChatlistProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const otherUser = chat.sender.id === userId ? chat.receiver : chat.sender;
    const userIdString = otherUser.username.toString();
    return userIdString.includes(searchQuery);
  });
  useEffect(() => {
    if (userId) {
      fetch(`${process.env.NEXT_PUBLIC_CHAT_API}/chats/${userId}`) //fetch chats from backend
        .then((res) => res.json())
        .then((data: Chat[]) => {
          setChats(data);
        })
        .catch((err) => console.error("Failed to fetch chats:", err));
      console.log("chat fetched: ", chats);
    }
  }, [userId, conv]);
    

  return (
    <>
      <div className="w-1/4 outline-none flex flex-col bg-[#021024] rounded-[20px] my-2 ">
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-lg font-semibold text-white">Messages</h2>


          {/* <button
            className="bg-purple-600 hover:bg-purple-700 rounded-lg p-2 transition-colors"
            // onClick={() => setIsModalOpen(true)} // open modal
          >
            <Plus className="h-5 w-5 text-white font-semibold" />
          </button> */}

          {/* Modal */}
          

        </div>
        <div className="p-4">
          <div className="relative">
            <Search_Input
              onsearchchange_2={setSearchQuery}
              searchquery_2={searchQuery}
            />
          </div>
        </div>
        <div className="px-4 pb-4">
          {filteredChats.map((chat) => {
            const otherUser = chat.sender.id === userId ? chat.receiver : chat.sender;
            return (
              <div
                key={chat.chat_id}
                onClick={() => {
                  onSelect(chat.chat_id);
                  onReceiveChange(otherUser.id);
                }}
                className={`flex items-center p-3 my-1 rounded-md cursor-pointer 
                  hover:bg-gray-800 ${selectedChatId === chat.chat_id ? "bg-gray-700" : ""
                  }`}
              >
                <img
                  src={chat.receiver.avatar_url}
                  alt={`${otherUser.username}`}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-white">
                      {otherUser.username}
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
