"use client";

import { Chatlist } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { MessageInput } from "@/components/chat/MessageInput";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface conversation {
  id: number;
  chat_id: number;
  sender: number;
  receiver: number;
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const [conv_, set_conv] = useState<conversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedChatId) {
      fetch(`${process.env.NEXT_PUBLIC_CHAT_API}/messages/${selectedChatId}`) //protect with async, axios
        .then((res) => res.json())
        .then((data: conversation[]) => {
          set_conv(data);
        })
        .catch((err) => console.log("faild because of: ", err));
      console.log("fetched conv: ", conv_);
    }
  }, [selectedChatId]);

  const [text, setText] = useState("");
  const socketRef = useRef<Socket | null>(null);

  const handleSendMessage = (messageContent: string) => {
    console.log("Message sent:", messageContent + ", to chat: " + selectedChatId);
    if (socketRef.current && selectedChatId && messageContent.trim()) {
      socketRef.current.emit("ChatMessage", {
        chatId: selectedChatId,
        message: messageContent,
        sender: UserId,
        receiver: UserId_2,
      });
    }
  };
  const [UserId, SetUser] = useState<number | null>(null)
  const [UserId_2, SetUser_2] = useState<number | null>(null) //second user which is the receiver
  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`, {
      path: '/ws/chat/socket.io/',
      auth: { user_id: UserId }
    });
  socketRef.current = socket;
  socket.on("ChatMessage", (data) => {
    console.log("testing: " + selectedChatId)
    console.log("a message arries : " + data.content + " from chat: " + data.chat_id + " and id = " + data.id)
      set_conv((prevMessages) => [...prevMessages, data])
  });
  return () => {
    socket.disconnect();
  };
}, [UserId]);

useEffect(() => {
  const userset = new URLSearchParams(window.location.search);
  const userFromUrl = userset.get('user')
  if (userFromUrl)
    SetUser(parseInt(userFromUrl))
  console.log('user is: ', userFromUrl);
}, [])


return (
  <div className="h-[calc(100vh_-_72px)] bg-[#111827] text-white flex px-2 gap-2 ">
    <Chatlist
      onSelect={setSelectedChatId}
      selectedChatId={selectedChatId}
      userId={UserId}
      onReceiveChange={SetUser_2}
      conv={conv_}
    />
    <div className="flex-1 bg-[#021024] rounded-[20px] flex flex-col my-2">
      <ChatWindow SelectedChatId={selectedChatId} userId={UserId} conv={conv_} />
      {selectedChatId && <MessageInput onSendMessage={handleSendMessage} />}
    </div>
  </div>
);
}

