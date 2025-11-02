'use client';

import { useEffect, useRef, useState } from 'react';

import { Socket, io } from 'socket.io-client';

import { BlockedUserInput } from '@/components/chat/BlockedUser';
import { BlockingUserInput } from '@/components/chat/BlockingUser';
import { Chatlist } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageInput } from '@/components/chat/MessageInput';
import ChatListSkeleton from '@/components/chat/chatlist_loading';

import { User, useAuth } from '@/hooks/useAuth';

interface conversation {
  id: number;
  chat_id: number;
  sender: number;
  receiver: number;
  content: string;
  created_at: string;
}

interface Friend {
  id: number,
  username: string,
  online_status: 0 | 1 | 2;
  avatar_url: string;
}

export default function ChatPage() {
  const [conv_, set_conv] = useState<conversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showChatList, setShowChatList] = useState(true);
  const [otherUser, setOtherUser] = useState<Friend | null>(null);

  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (selectedChatId) setShowChatList(false);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [selectedChatId]);

  useEffect(() => {
    const fetchingmessages = async () => {
      if (user && selectedChatId && selectedChatId != -1) {
        try {
          const fetchmessage = await fetch(
            `${process.env.NEXT_PUBLIC_CHAT_API}/messages/${selectedChatId}`
          );
          const data = await fetchmessage.json();
          if (data.status) {
            set_conv(data.messages);
            const otherId =
              data.messages[0].sender === user.id
                ? data.messages[0].receiver
                : data.messages[0].sender;
            if (otherId) {
              const userResponse = await fetch(
                `https://localhost:8080/api/users/${otherId}`
              );
              const userData = await userResponse.json();
              setOtherUser(userData.user);
            }
          }
        } catch (error) {
          console.error('failed because of: ', error);
        }
      }
    };
    fetchingmessages();
  }, [selectedChatId]);
  const socketRef = useRef<Socket | null>(null);
  const handleSendMessage = (messageContent: string) => {
    if (socketRef.current && selectedChatId && messageContent.trim() && user && otherUser) {
      socketRef.current.emit('ChatMessage', {
        chatId: selectedChatId,
        message: messageContent,
        sender: user.id,
        receiver: otherUser.id,
      });
    }
  };
  const [UserId_2, SetUser_2] = useState<number | null>(null);
  useEffect(() => {
    if (!user) return;
    const socket = io(`wss://localhost:8080`, {
      path: '/ws/chat/socket.io/',
      auth: { user_id: user?.id },
    });
    socketRef.current = socket;
    socket.on('ChatMessage', (data) => {
      if ((selectedChatId === -1  || !selectedChatId) && data.chat_id) {
        setSelectedChatId(data.chat_id);
      }
      set_conv((prevMessages) => [...prevMessages, data]);
    });
    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleChatSelect = (chatId: number, selectedFriend?: Friend) => {
    if (selectedFriend) {
      setOtherUser(selectedFriend)
    }
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
            {
              <ChatWindow
                SelectedChatId={selectedChatId}
                userId={user.id}
                conv={conv_}
                other_User={otherUser}
              />
            }
            {selectedChatId && (
              // <BlockingUserInput />
              <MessageInput onSendMessage={handleSendMessage} />
            )}
          </div>
        </>
      ) : (
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
              {
                <ChatWindow
                  SelectedChatId={selectedChatId}
                  userId={user.id}
                  conv={conv_}
                  other_User={otherUser}
                  onBackClick={handleBackToChatList}
                  showBackButton={true}
                />
              }
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
