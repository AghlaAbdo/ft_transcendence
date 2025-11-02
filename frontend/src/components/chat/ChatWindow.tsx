'use client';

import { useEffect, useRef, useState , useLayoutEffect} from 'react';
import { MoreVertical } from 'lucide-react';
import UserActionsMenu from './UserActionsMenu';

interface Message {
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

interface ChatWindowProps {
  SelectedChatId: number | null;
  userId: number | null;
  conv: Message[];
  other_User: Friend | null;
  onBackClick?: () => void;
  showBackButton?: boolean;
}

export const ChatWindow = ({
  SelectedChatId,
  userId,
  conv,
  other_User,
  onBackClick,
  showBackButton = false
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
 useEffect(() => {
    const time = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    },50);
    return () => clearTimeout(time);
}, [conv, SelectedChatId]);
const [open, setopen] = useState(false);
  // if (SelectedChatId && conv.length === 0)
  //   return <div className='flex justify-center items-center text-white h-screens'>Loading Messages ...</div>
  return (
    <>
      <div className='flex-1 flex flex-col min-h-0'>
        {SelectedChatId && other_User ? (
          <>
            <div className='flex py-2.5 px-5 items-center rounded-t-[20px] bg-[#1F2937]'>
              {showBackButton && (
                <button
                  onClick={onBackClick}
                  className='mr-3 text-white hover:text-gray-300'
                >
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M19 12H5' />
                    <path d='M12 19l-7-7 7-7' />
                  </svg>
                </button>
              )}
              <div className='relative mr-3'>
                <img
                  src={other_User.avatar_url}
                  alt={`${other_User.username}`}
                  className='w-12 h-12 rounded-full'
                />
                {other_User.online_status === 1 ? (
                  <div className='border-2 border-black absolute top-9 right-0 bg-green-500 rounded-full w-3 h-3'></div>
                ) : null}
              </div>
              <div className='flex-1'>
                <div className='flex justify-between items-center'>
                  <div>
                    <h3 className='font-semibold'>{other_User?.username}</h3>
                    <p className='text-sm text-gray-400 truncate'>
                      {other_User.online_status === 1
                        ? 'Online'
                        : other_User.online_status === 2
                          ? 'In Game'
                          : 'Offline'}
                    </p>
                  </div>
                  <div>
                    <button
                      className='cursor-pointer'
                      onClick={() => {
                      }}
                    >
                      <MoreVertical onClick={() => setopen(true)} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex-1 p-3 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden'>
              {conv
                .filter((msg) => msg.chat_id === SelectedChatId)
                .map((msg) => {
                  const isOwn = msg.sender === userId;
                  return (
                    <div  key={msg.id}>
                      <div
                        className={`flex flex-col ${
                          isOwn ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] lg:max-w-[50%] px-2.5 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-700 text-white'
                          }`}
                        >
                          <p className='text-sm break-all'>{msg.content}</p>
                        </div>
                        <p className='text-xs opacity-65 mt-1 px-2'>
                          {new Date(msg.created_at + 'Z').toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
                { <div  ref={messagesEndRef}/>}
            </div>
          </>
        ) : (
          <>
            <div className='flex-1 flex items-center justify-center'>
              <div className='text-center'>
                <img
                  src='/avatars/no_chat.png'
                  alt='No chat selected'
                  className='w-70 h-70 opacity-80 '
                />
                <h3 className='text-white text-xl font-medium mb-0.5'>
                  Select a conversation
                </h3>
                <p className='text-gray-400 text-sm'>
                  Choose a chat to start messaging
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div>
        {
          other_User && (
              <div
                className={`fixed inset-0 bg-black/30 z-50 pt-32 transition-opacity duration-200 ease-out ${
                  open
                    ? 'opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setopen(false)}
              >
                <div
                  className={`absolute bg-slate-800 rounded-lg p-1 h-fit transform transition-all duration-300 ease-out mx-2 w-[calc(100%-30px)] md:right-3 md:mx-0 md:w-1/5 md:max-w-sm ${
                    open ? 'translate-y-0 scale-100' : '-translate-y-4 scale-95'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                    <UserActionsMenu
                      onClose={() => setopen(false)}
                      _other_user={other_User}
                    />
                </div>
              </div>
            )
          }
      </div>
    </>
  );
};
