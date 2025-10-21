'use client';

import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { Chatlist } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageInput } from '@/components/chat/MessageInput';
import { useAuth, User } from '@/hooks/useAuth';
import ChatListSkeleton from '@/components/chat/chatlist_loading';
import { BlockedUserInput } from '@/components/chat/BlockedUser';
import { BlockingUserInput } from '@/components/chat/BlockingUser';

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
  const {user} = useAuth();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showChatList, setShowChatList] = useState(true);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  
  // Mobile detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (selectedChatId)
        setShowChatList(false);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [selectedChatId]);
  
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
        .catch((err) => console.log('failed because of: ', err));
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
  useEffect(() => { // put this in the layout ok??
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

  // Navigation handlers
  const handleChatSelect = (chatId: number) => {
    setSelectedChatId(chatId);
    if (isMobile) {
      setShowChatList(false);
    }
  };

  const handleBackToChatList = () => {
    setShowChatList(true);
    setSelectedChatId(null);
  };

  if (!user)
    return (
      <>
        <ChatListSkeleton />
      </>
    );
    
  return (
    <div className='h-[calc(100vh_-_72px)] bg-[#111827] text-white flex px-2 gap-2'>
      {/*big screens  */}
      {!isMobile ? (
        <>
          <Chatlist
            onSelect={handleChatSelect}
            selectedChatId={selectedChatId}
            userId={user.id}
            onReceiveChange={SetUser_2}
            conv={conv_}
          />
          <div className='flex-1 bg-[#021024] rounded-[20px] flex flex-col my-2'>
            {(
              <ChatWindow
                SelectedChatId={selectedChatId}
                userId={user.id}
                conv={conv_}
                other_User={otherUser}
              />
            )}
            {selectedChatId && (
              // <BlockingUserInput />
              <MessageInput onSendMessage={handleSendMessage} />
            )}
          </div>
        </>
      ) : (
        /*mobile */
        <>
          {showChatList ? (
            <div className='w-full '>
              <Chatlist
                onSelect={handleChatSelect}
                selectedChatId={selectedChatId}
                userId={user.id}
                onReceiveChange={SetUser_2}
                conv={conv_}
              />
            </div>
          ) : (
            <div className='w-full bg-[#021024] rounded-[20px] flex flex-col my-2'>
              {( 
                <ChatWindow
                  SelectedChatId={selectedChatId}
                  userId={user.id}
                  conv={conv_}
                  other_User={otherUser}
                  onBackClick={handleBackToChatList}
                  showBackButton={true}
                />
              )}
              {selectedChatId && otherUser && (
              // <BlockingUserInput />
                <MessageInput onSendMessage={handleSendMessage} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
