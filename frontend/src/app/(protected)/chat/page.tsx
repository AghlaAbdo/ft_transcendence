'use client';

import { useEffect, useRef, useState } from 'react';

import { Socket, io } from 'socket.io-client';
import { toast } from 'sonner';

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
  id: number;
  username: string;
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
  const [other_user_id, setotheruserid] = useState<number>(0);

  const selectedChatIdRef = useRef(selectedChatId);
  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

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
      if (user && selectedChatId && other_user_id) {
        try {
          const userResponse = await fetch(
            `/api/friends/friend_data/${other_user_id}`,
            { credentials: 'include' }
          );
          const userData = await userResponse.json();
          if (!userData) {
            toast.error("some thing went wrong");
            return;
          }
          setOtherUser(userData.friends);
          if (user.id === userData.friends.blocked_by) setblocker(true);
          if (other_user_id === userData.friends.blocked_by) setblocked(true);

          if (selectedChatId !== -1) {
            const fetchmessage = await fetch(
              `/api/chat/messages/${selectedChatId}/${other_user_id}`,
              { credentials: 'include' }
            );
            const data = await fetchmessage.json();
            if (data.status) {
              set_conv(data.messages);
            }

          }
        } catch (error) {
          console.error('failed because of: ', error);
        }
      }
    };
    fetchingmessages();
  }, [other_user_id, selectedChatId, user]);

  const socketRef = useRef<Socket | null>(null);
  const handleSendMessage = (messageContent: string) => {
    if (
      socketRef.current &&
      selectedChatId &&
      messageContent.trim() &&
      user &&
      otherUser
    ) {
      socketRef.current.emit('ChatMessage', {
        chatId: selectedChatId,
        message: messageContent,
        receiver: otherUser.id,
      });
    }
  };
  useEffect(() => {
    if (!user) return;
    const socket = io({
      path: '/ws/chat/socket.io/',
      autoConnect: false,
      withCredentials: true,
    });
    socket.connect();
    socketRef.current = socket;
    socket.on('ChatMessage', (data) => {
      if (selectedChatIdRef.current === -1 && data.chat_id) {
        setSelectedChatId(data.chat_id);
      }
      set_conv((prevMessages) => [...prevMessages, data]);
    });

    socket.on('block', (data) => {
      const { actor_id, target_id } = data;
      if (actor_id === user.id) {
        setblocker(true);
        setblocked(false);
      }
      if (target_id === user.id) {
        setblocked(true);
        setblocker(false);
      }
    });

    socket.on('unblock', (data) => {
      const { actor_id, target_id } = data;
      if (actor_id === user.id || target_id === user.id) {
        setblocker(false);
        setblocked(false);
      }
    });

    socket.on('error', (data) => {
      const { message } = data;
      if (message) toast.error(message);
    });

    return () => {
      socket.off('ChatMessage');
      socket.off('block');
      socket.off('unblock');
      socket.off('error');
      socket.disconnect();
    };
  }, [user]);

  const handle_block = (target_id: number) => {
    if (socketRef.current && selectedChatId && user && otherUser) {
      socketRef.current.emit('block', {
        target_id: target_id,
      });
    }
  };

  const handle_unblock = (target_id: number) => {
    if (socketRef.current && selectedChatId && user && otherUser) {
      socketRef.current.emit('unblock', {
        target_id: target_id,
      });
    }
  };

  const handleChatSelect = (chatId: number, selectedFriend?: number) => {
    if (selectedFriend) {
      setotheruserid(selectedFriend);
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
            conv={conv_}
          />
          <div className='flex-1 bg-[#021024] rounded-[20px] flex flex-col my-2'>
            {
              <ChatWindow
                blocker={blocker}
                blocked={blocked}
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
              <BlockingUserInput
                onUnblock={() => handle_unblock(otherUser.id)}
              />
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
                conv={conv_}
              />
            </div>
          ) : (
            <div className='w-full bg-[#021024] rounded-[20px] flex flex-col my-2'>
              {
                <ChatWindow
                  blocker={blocker}
                  blocked={blocked}
                  SelectedChatId={selectedChatId}
                  userId={user.id}
                  conv={conv_}
                  other_User={otherUser}
                  onBackClick={handleBackToChatList}
                  showBackButton={true}
                  handle_block={handle_block}
                />
              }
              {selectedChatId && otherUser && !blocked && !blocker && (
                <MessageInput onSendMessage={handleSendMessage} />
              )}
              {selectedChatId && otherUser && blocker && !blocked && (
                <BlockingUserInput
                  onUnblock={() => handle_unblock(otherUser.id)}
                />
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
