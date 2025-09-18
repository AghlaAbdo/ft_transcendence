"use client";

import { Chatlist } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { MessageInput } from "@/components/chat/MessageInput";
import { use, useEffect , useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface conversation {
  id:number;
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
      if (selectedChatId){
        fetch(`https://34.175.40.197/api/chat/messages/${selectedChatId}`) //protect with async, axios
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
    // Line 1: Check if we have socket and a chat selected
    console.log("Message sent:", messageContent + ", to chat: " + selectedChatId);
    if (socketRef.current && selectedChatId && messageContent.trim()) {
      // Line 2: Emit the message to the server via socket
      socketRef.current.emit("ChatMessage", {
        chatId: selectedChatId,
        // here i need the sender and reciever, i have just the chat id and the sendr
        message: messageContent,
        sender: UserId,
        receiver: UserId_2 ,
      });
    }
  };

  const [UserId, SetUser] = useState<number | null>(null)
  const [UserId_2, SetUser_2] = useState<number | null>(null) // second user which is the receiver
    useEffect(() => {
      const socket = io("https://34.175.40.197/api/chat:4545", {auth : {user_id: UserId}});
      socketRef.current = socket;
      socket.on("ChatMessage", (data) => {
        console.log("testing: " +  selectedChatId)
        console.log("a message arries : " + data.content + " from chat: " +  data.chat_id + " and id = " + data.id)
      if (selectedChatId == data.chat_id)
      {
        console.log("object arrives: " + data.receiver);
        set_conv((prevMessages)=> [...prevMessages, data])
      }
      //what to do , i do not know ni9a, here we are going to recieve the message
    });
    return () => {
      socket.disconnect();
      // also i do not know what to do here hhhhh
    };
  }, [UserId, selectedChatId]);
  
  const [SendMessage, setMessage] = useState<string | "">("");

  useEffect(()=>{
    const userset = new URLSearchParams(window.location.search);
    const userFromUrl = userset.get('user')
    if (userFromUrl)
        SetUser(parseInt(userFromUrl))
    console.log('user is: ', userFromUrl);
  },[])

  useEffect(() => {
    if (socketRef.current && selectedChatId) {
      console.log("chat changed from front"); // remove later ni9a
      socketRef.current.emit("joinChat", selectedChatId);
    }
  }, [selectedChatId]);

  return (
    // Change this div to have a fixed screen height and be a flex container
    <div className="h-screen bg-[#111827] text-white flex px-2 gap-2 ">
      {/* The inner div is no longer needed */}
      {/* pass the callback to Chatlist */}
    
      <Chatlist
        onSelect={setSelectedChatId}
        selectedChatId={selectedChatId}
        userId={UserId}
        onReceiveChange={SetUser_2}
        conv={conv_}
      />
      {/* This div will now correctly take the remaining space */}
      <div className="flex-1 bg-[#021024] rounded-[20px] flex flex-col my-2 mt-20">
        <ChatWindow SelectedChatId={selectedChatId} userId={UserId} conv={conv_} />
        {selectedChatId && <MessageInput onSendMessage={handleSendMessage} />}
      </div>
    </div>
  );
}

