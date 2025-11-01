// "use client";
import { useEffect, useRef, useState } from 'react';

import { formatDistanceToNow } from 'date-fns';
import { Plus, Search } from 'lucide-react';

import { User, useAuth } from '@/hooks/useAuth';

import { Search_Input } from './Search_Input';
import { NoChats } from './noChats';
import { FriendList } from './FriendList';

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
  last_message_content?: string;
  last_message_timestamp?: string;
  last_message_id?: number;
}

interface Friend {
  id: number,
  username: string,
  online_status: 0 | 1 | 2;
  avatar_url: string;
}

interface ChatlistProps {
  onSelect: (chatId: number, selectedFriend?:Friend) => void;
  onReceiveChange: (userId_2: number) => void;
  selectedChatId: number | null;
  userId: number | null;
  conv: Message[];
}

export const Chatlist = ({
  onSelect,
  selectedChatId,
  userId,
  onReceiveChange,
  conv,
}: ChatlistProps) => {
  const [tick, setTick] = useState(0);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFriendsModal, setShowFriendsModal] = useState(false);

  const {user} = useAuth();
  useEffect(() =>{
    if (!showFriendsModal)
        return;
    const handleEsckey = (e: KeyboardEvent) =>{
      if (e.key == 'Escape')
        setShowFriendsModal(false)
    }
    document.addEventListener('keydown', handleEsckey);
    return () => document.removeEventListener('keydown', handleEsckey);
  }, [showFriendsModal])

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const otherUser = chat.sender.id === userId ? chat.receiver : chat.sender;
    const userIdString = otherUser.username.toString();
    return userIdString.includes(searchQuery);
  });

  
  useEffect(() => {
    if (userId) {
      setLoading(true); // do not forgot to use this later
      fetch(`${process.env.NEXT_PUBLIC_CHAT_API}/chats/${userId}`) //fetch chats from backend
      .then((res) => res.json())
      .then((data: Chat[]) => {
        setChats(data);
      })
      .catch((err) => console.error('Failed to fetch chats:', err));
      console.log('chat fetched: ', chats);
    }
  }, [userId, conv]);
  
  return (
    <>
      <div className='lg:w-1/4 outline-none flex flex-col bg-[#021024] rounded-[20px] my-2 h-[calc(100vh_-_88px)]'>
        <div className='flex items-center justify-between p-4 border-b border-gray-600'>
          <h2 className='text-lg font-semibold text-white'>Messages</h2>
          <button 
            onClick={() => setShowFriendsModal(true)}
            className='p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition '
            title='Start new conversation'
          >
            <Plus size={17} className='text-white' />
          </button>
        </div>
        <div className='p-4'>
          <div className='relative'>
            <Search_Input
              onsearchchange_2={setSearchQuery}
              searchquery_2={searchQuery}
            />
          </div>
        </div>
        {!filteredChats.length ? (
          <div className='flex-1 flex flex-col items-center justify-center p-8'>
            <NoChats isSearching={searchQuery.length > 0} />
          </div>
        ) : (
          <div className='px-4 pb-4 flex-1 overflow-y-auto'>
            {filteredChats.map((chat) => {
              const otherUser =
                chat.sender.id === userId ? chat.receiver : chat.sender;
              return (
                <div
                  key={chat.chat_id}
                  onClick={() => {
                    onSelect(chat.chat_id);
                    onReceiveChange(otherUser.id);
                  }}
                  className={`flex items-center p-3 my-1 rounded-md cursor-pointer 
                  hover:bg-gray-800 ${
                    selectedChatId === chat.chat_id ? "bg-gray-700" : ""
                  }`}
                >
                  <div className='relative mr-3'>
                    <img
                      src={otherUser.avatar_url}
                      alt={`${otherUser.username}`}
                      className='w-12 h-12 rounded-full'
                    />
                    {otherUser.online_status === 1 ? (
                      <div className='border-2 border-black absolute top-9 right-0 bg-green-500 rounded-full w-3 h-3'></div>
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between min-w-0'>
                      <h3 className='font-semibold text-white flex-shrink-0 mr-2 truncate min-w-0 '>
                        {otherUser.username}
                      </h3>
                      <span className='text-xs text-gray-400 truncate min-w-0'>
                        {formatDistanceToNow(
                          new Date(chat.last_message_timestamp + 'Z'),
                          { addSuffix: true }
                        )}
                      </span>
                    </div>
                    <p className='text-sm text-gray-400 truncate min-w-0'>
                      {chat.last_message_content || ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Friends Modal */}
     {showFriendsModal && (
       <div
         className="fixed inset-0 bg-black/50 z-50 pt-5 flex justify-center items-center "
         onClick={() => setShowFriendsModal(false)}
       >
         <div
           className="bg-slate-800 rounded-xl mx-2 w-[calc(100%-16px)] md:mx-0 md:w-full md:max-w-lg"
           onClick={(e) => e.stopPropagation()}
         >
           <FriendList user={user} onchatselected={onSelect} onClose={() => {setShowFriendsModal(false)}} />
         </div>
       </div>
     )}
    </>
  );
};
