"use client";

import { useEffect, useState, useRef } from "react";
import { HeaderInfos } from "@/components/chat/HeaderInofs";

interface Message {
  id: number;
  chat_id: number;
  sender: number;
  receiver: number;
  content: string;
  created_at: string;
}

interface ChatWindowProps {
  SelectedChatId: number | null;
  userId: number | null;
  conv: Message[];
}

export const ChatWindow = ({
  SelectedChatId,
  userId,
  conv,
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv]);

  return (
    <>
      <div className="flex-1 flex flex-col min-h-0">
        {SelectedChatId ? (
          <>
          {/* here pass the user object to render infos about the other chat */}
            <HeaderInfos /> 
            {/* messages container */}
            <div
              className="flex-1 p-3 overflow-y-auto
  [&::-webkit-scrollbar]:w-2.5
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
            >
              {conv.map((msg) => {
                const isOwn = msg.sender === userId;
                return (
                  <div key={msg.id}>
                    <div
                      className={`flex flex-col ${
                        isOwn ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] lg:max-w-[50%] px-2.5 py-2 rounded-2xl ${
                          isOwn
                            ? "bg-purple-600 text-white"
                            : "bg-gray-700 text-white"
                        }`}
                      >
                        <p className="text-sm break-all">{msg.content}</p>
                      </div>
                      <p className="text-xs opacity-65 mt-1 px-2">
                        {new Date(msg.created_at + "Z").toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <img
                  src="/avatars/no_chat.png"
                  alt="No chat selected"
                  className="w-70 h-70 opacity-80 "
                />
                <h3 className="text-white text-xl font-medium mb-0.5">
                  Select a conversation
                </h3>
                <p className="text-gray-400 text-sm">
                  Choose a chat to start messaging
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
