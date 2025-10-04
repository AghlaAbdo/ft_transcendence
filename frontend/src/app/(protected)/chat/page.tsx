'use client';

import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { Chatlist } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageInput } from '@/components/chat/MessageInput';
import { useAuth } from '@/hooks/useAuth';
import Loading from './loading';

interface conversation {
  id: number;
  chat_id: number;
  sender: number;
  receiver: number;
  content: string;
  created_at: string;
}

type User = {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export default function ChatPage() {
  const [conv_, set_conv] = useState<conversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const  {user}  = useAuth();
  // console.log(username, allo);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  useEffect(() => {
    if (user && selectedChatId) {
      fetch(`${process.env.NEXT_PUBLIC_CHAT_API}/messages/${selectedChatId}`) //protect with async, axios
        .then((res) => res.json())
        .then((data: conversation[]) => {
          set_conv(data);
          const otherId = data[0].sender === user.id ? data[0].receiver : data[0].sender;
          if (otherId) {
            // console.log("other user id:", otherId);
            fetch(`https://localhost:8080/api/users/${otherId}`)
              .then((res) => res.json())
              .then((u) => setOtherUser(u.user));
          }
        })
        .catch((err) => console.log('faild because of: ', err));
    }
  }, [selectedChatId]);
  const socketRef = useRef<Socket | null>(null);
  const handleSendMessage = (messageContent: string) => {
    if (socketRef.current && selectedChatId && messageContent.trim() && user) {
      socketRef.current.emit('ChatMessage', {
        chatId: selectedChatId,
        message: messageContent,
        sender: user.id,
        receiver: UserId_2,
      });
    }
  };
  const [UserId_2, SetUser_2] = useState<number | null>(null); // second user which is the receiver
  useEffect(() => {
    if (!user) return;
    const socket = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`, {
      path: '/ws/chat/socket.io/',
      auth: { user_id: user?.id },
    });
    socketRef.current = socket;
    socket.on('ChatMessage', (data) => {
      console.log('a message has arrives');
      set_conv((prevMessages) => [...prevMessages, data]);
    });
    return () => {
        socket.disconnect();
      }
  }, [user]);

  if (!user)
    return (
      <>
        <Loading />
      </>
    );
  return (
    <div className='h-[calc(100vh_-_72px)] bg-[#111827] text-white flex px-2 gap-2 '>
      {user && (
        <Chatlist
          onSelect={setSelectedChatId}
          selectedChatId={selectedChatId}
          userId={user.id}
          onReceiveChange={SetUser_2}
          conv={conv_}
        />
      )}
      <div className='flex-1 bg-[#021024] rounded-[20px] flex flex-col my-2'>
        {user && otherUser && (
          <ChatWindow
            SelectedChatId={selectedChatId}
            userId={user!.id}
            conv={conv_}
            other_User={otherUser}
          />
        )}
        {user && selectedChatId && (
          <MessageInput onSendMessage={handleSendMessage} />
        )}
      </div>
    </div>
  );
}
