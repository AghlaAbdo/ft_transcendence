'use client';

import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { BlockedUserInput } from '@/components/chat/BlockedUser';
import { BlockingUserInput } from '@/components/chat/BlockingUser';
import { Chatlist } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageInput } from '@/components/chat/MessageInput';
import ChatListSkeleton from '@/components/chat/chatlist_loading';
import { useAuth } from '@/hooks/useAuth';

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
  const [blocked, setblocked] = useState<boolean>(false);
  const [blocker, setblocker] = useState<boolean>(false);

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
            ,{credentials: "include" }
          );
          const data = await fetchmessage.json();
          console.log(      'messages: ', data);
          if (data.status) {
            console.log('allo from messages');
            set_conv(data.messages);
            const otherId =
            data.messages[0].sender === user.id
            ? data.messages[0].receiver
            : data.messages[0].sender;
            if (otherId) { //
              const userResponse = await fetch(
                `https://localhost:8080/api/friends/friend_data/${otherId}`, {
                  credentials: 'include'
                }
              );
              const userData = await userResponse.json();
              // console.log("freidn+dansdfnd: ", userData.friends);
              setOtherUser(userData.friends);
              if (user.id === userData.friends.blocked_by)
                  setblocker(true)
              if (otherId === userData.friends.blocked_by)
                  setblocked(true)
            }
          }
        } catch (error) {
          console.error('failed because of: ', error);
        }
      }
    };
    // "user_id": 2,
    // "friend_id": 5,
    // "blocked_by": 2
    fetchingmessages();
  }, [selectedChatId]);
  const socketRef = useRef<Socket |null >(null);
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
    const socket = io({
      path: '/ws/chat/socket.io/',
      autoConnect: false,
      withCredentials: true
    });
    socket.connect();
    socketRef.current = socket;
    socket.on('ChatMessage', (data) => {
      if ((selectedChatId === -1  || !selectedChatId) && data.chat_id) {
        setSelectedChatId(data.chat_id);
      }
      set_conv((prevMessages) => [...prevMessages, data]);
    });
    
    socket.on('block', (data) => {
      setblocked(false);
      setblocker(false)
      const {actor_id, target_id } = data;
      if (actor_id === user.id)
        setblocker(true)
      if (target_id === user.id)
        setblocked(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);
  
  const handle_block = (actor_id: number, target_id:number) => {
    console.log('user clicked blocker_id: ', actor_id);
    console.log('user clicked traget_id: ', target_id);
    if (socketRef.current && selectedChatId && user && otherUser) {
      console.log('current: ', actor_id, ', target: ', target_id);
      
      socketRef.current.emit('block', {
        actor_id: actor_id,
        target_id: target_id
      });
    }
  }
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
                handle_block={handle_block}
              />
            }
            {selectedChatId && otherUser && !blocker && !blocked && (
                <MessageInput onSendMessage={handleSendMessage} />
              )}
              {selectedChatId && otherUser && blocker && !blocked && (
                <BlockingUserInput />
              )}
               {selectedChatId && otherUser && blocked && !blocker && (
                <BlockedUserInput />
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
                  handle_block={handle_block}
                />
              }
              {selectedChatId && otherUser && !blocked && !blocked && (
                <MessageInput onSendMessage={handleSendMessage} />
              )}
              {selectedChatId && otherUser && blocker && !blocked && (
                <BlockingUserInput />
              )}
               {selectedChatId && otherUser && blocked && !blocker && (
                <BlockedUserInput />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
