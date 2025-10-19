'use client';

import { useEffect, useRef, useState } from 'react';

import { MoreVertical } from 'lucide-react';

import UserActionsMenu from './UserActionsMenu';

// import { HeaderInfos } from '@/components/chat/HeaderInofs';

interface Message {
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
  avatar_url: string;
};

interface ChatWindowProps {
  SelectedChatId: number | null;
  userId: number | null;
  conv: Message[];
  other_User: User | null;
  onBackClick?: () => void;
  showBackButton?: boolean;
}

export const ChatWindow = ({
  SelectedChatId,
  userId,
  conv,
  other_User,
  onBackClick,
  showBackButton = false,
}: ChatWindowProps) => {
  const [chat_options, setoptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // console.log('user in chat window: ', other_User?.username);
    // messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    messagesEndRef.current?.scrollIntoView();
  }, [conv, SelectedChatId]);

  const [open, setopen] = useState(false);
  return (
    <>
      <div className='flex-1 flex flex-col min-h-0'>
        {SelectedChatId ? (
          <>
            <div className='flex py-2.5 px-5 items-center rounded-t-[20px] bg-[#1F2937]'>
              {showBackButton && (
                <button
                  onClick={onBackClick}
                  className='mr-3 text-white hover:text-gray-300 transition-colors duration-200'
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
              <img
                src={other_User?.avatar_url}
                alt='Imad'
                className='w-12 h-12 rounded-full mr-3'
              />
              <div className='flex-1'>
                <div className='flex justify-between items-center'>
                  <div>
                    <h3 className='font-semibold'>{other_User?.username}</h3>
                    <p className='text-sm text-gray-400 truncate'>Online</p>
                  </div>
                  <div>
                    <button
                      className='cursor-pointer'
                      onClick={() => {
                        setoptions(true);
                      }}
                    >
                      <MoreVertical onClick={() => setopen(true)} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div
              className='flex-1 p-3 overflow-y-auto scroll-smooth scrollbar-none [&::-webkit-scrollbar]:hidden'
            >
              {conv
                .filter((msg) => msg.chat_id === SelectedChatId)
                .map((msg) => {
                  const isOwn = msg.sender === userId;
                  return (
                    <div key={msg.id}>
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
              <div ref={messagesEndRef} />
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
        {open ? (
          <div
            className={`fixed inset-0 bg-black/30 z-50 pt-32  transition-opacity duration-300 ease-out ${
              open
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setopen(false)}
          >
            <div
              className={`absolute bg-slate-700 rounded-lg p-1 h-fit transform transition-all duration-300 ease-out mx-2 w-[calc(100%-30px)] md:right-3 md:mx-0 md:w-1/5 md:max-w-sm ${
                open ? 'translate-y-0 scale-100' : '-translate-y-4 scale-95'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <UserActionsMenu onClose={() => setopen(false)} />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};
