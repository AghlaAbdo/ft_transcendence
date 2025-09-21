// "use client";

// import { Chatlist } from "@/components/chat/ChatList";
// import { ChatWindow } from "@/components/chat/ChatWindow";

// import { useEffect, useRef, useState } from "react";
// import { io, Socket } from "socket.io-client";

// export default function ConversationsPage() {
//   const [messages, setMessages] = useState<string[]>([]);
//   const [text, setText] = useState("");
//   const socketRef = useRef<Socket | null>(null);

//   useEffect(() => {
//     const socket = io("http://localhost:4000");
//     socketRef.current = socket;

//     socket.on("connect", () => {
//       console.log("Connected:", socket.id);
//     });

//     socket.on("chatMessage", (msg: string) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   const sendMessage = () => {
//     if (socketRef.current && text.trim() !== "") {
//       socketRef.current.emit("chatMessage", text);
//       setText("");
//     }
//   };

//   const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  
//   return (
//     <div className="min-h-screen bg-[#111827]">
//       <div className="min-h-screen text-white flex gap-0">
//         {/* pass the callback to Chatlist */}
//         <Chatlist onSelect={setSelectedChatId} 
//         selectedChatId={selectedChatId}/>
//         {/* pass selected chat to ChatWindow */}
//         <ChatWindow selectedChatId={selectedChatId} />
//         {/* <MessageInput /> */}
//       </div>
//     </div>
//   );
// }
