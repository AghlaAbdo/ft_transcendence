'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { motion } from 'framer-motion';
import useConnectSocket from '@/lib/useConnectSocket';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/useNotificationStore';
import { GlobalSearch } from './global_search';
import { markAllNotificationsAsRead_friend } from './markAsRead';
import NotificationCenter from './notifications';
import { useLayout } from '@/context/LayoutContext';

export default function Header() {
  const { user, isLoading } = useAuth();
  const { hideHeaderSidebar } = useLayout();
  const [isopen, setopen] = useState<boolean>(false);
  const [not_isopen, set_notopen] = useState<boolean>(false);
  const { unreadCount } = useNotificationStore();

  useConnectSocket();
  useEffect(() => {
    if (!isopen) return;
    const handleEsckey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setopen(false);
    };
    document.addEventListener('keydown', handleEsckey);
    return () => {
      document.removeEventListener('keydown', handleEsckey);
    };
  }, [isopen]);

  useEffect(() => {
    if (!not_isopen) return;
    const handleEsckey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setopen(false);
        // resetUnread();
      }
    };
    document.addEventListener('keydown', handleEsckey);
    return () => {
      document.removeEventListener('keydown', handleEsckey);
    };
  }, [not_isopen]);

  return (
    <>
      <motion.div
        initial={false}
        animate={{
          y: hideHeaderSidebar ? -72 : 0,
          opacity: hideHeaderSidebar ? 0 : 1,
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
        className='fixed h-[72px] w-full md:w-[calc(100%-72px)] top-0 left-0 md:left-[72px]  flex justify-between items-center px-16 pl-3 border-b border-[#374151]'
      >
        {!isLoading && user && (
        <div className='z-1000 flex justify-between items-center gap-4'>
          <img 
              src={user.avatar_url || "/avatars/avatar1.png"} 
              alt="Avatar" 
              width={45}
              height={45}
              className="w-10 h-10 rounded-full object-cover"
          />
          <span className='font-bold text-gray-50'>
            Welcome {user.username}
          </span>
        </div>

      )}
        <div className='flex justify-between items-center gap-4'>
          <button className='cursor-pointer' onClick={() => setopen(true)}>
            {/* Search Icon*/}
            <svg
              className='fill-gray-50'
              width='22'
              height='22'
              viewBox='0 0 14 14'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d='M6 0C9.312 0 12 2.688 12 6C12 9.312 9.312 12 6 12C2.688 12 0 9.312 0 6C0 2.688 2.688 0 6 0ZM6 10.6667C8.578 10.6667 10.6667 8.578 10.6667 6C10.6667 3.422 8.578 1.33333 6 1.33333C3.422 1.33333 1.33333 3.422 1.33333 6C1.33333 8.578 3.422 10.6667 6 10.6667ZM11.6567 10.714L13.5427 12.5993L12.5993 13.5427L10.714 11.6567L11.6567 10.714Z' />
            </svg>
          </button>
          {user && (
            <button
              className='relative cursor-pointer'
              onClick={() => {
                set_notopen(true);
                useNotificationStore.getState().resetUnread();
                markAllNotificationsAsRead_friend(user.id);
              }}
            >
              {/* Notification Icon */}
              <svg
                className='stroke-gray-50'
                width='22'
                height='22'
                viewBox='0 0 16 16'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M4 5.33333C4 4.27247 4.42143 3.25505 5.17157 2.5049C5.92172 1.75476 6.93913 1.33333 8 1.33333C9.06087 1.33333 10.0783 1.75476 10.8284 2.5049C11.5786 3.25505 12 4.27247 12 5.33333C12 10 14 11.3333 14 11.3333H2C2 11.3333 4 10 4 5.33333Z'
                  strokeWidth='1.33333'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M6.8667 14C6.97829 14.203 7.14233 14.3722 7.34169 14.4901C7.54106 14.608 7.76842 14.6702 8.00003 14.6702C8.23165 14.6702 8.45901 14.608 8.65837 14.4901C8.85773 14.3722 9.02178 14.203 9.13337 14'
                  strokeWidth='1.33333'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              <span className='absolute top-0 right-0  translate-x-1/3 -translate-y-1/3 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center'>
                {unreadCount}
              </span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Global Search Modal */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 pt-5 transition-opacity duration-200 ease-out ${
          isopen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setopen(false)}
      >
        <div
          className={`absolute bg-slate-800 rounded-xl transform transition-all duration-300 ease-out mx-2 w-[calc(100%-16px)] md:right-3 md:mx-0 md:w-full md:max-w-lg ${
            isopen ? 'translate-y-0 scale-100' : '-translate-y-4 scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <GlobalSearch onClose={() => setopen(false)} />
        </div>
      </div>
      <div
        className={`scrollbar-none fixed inset-0 bg-black/50 z-50 pt-5 transition-opacity duration-200 ease-out ${
          not_isopen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => 
          set_notopen(false)}
      >
        <div
          className={`absolute h-fit transform transition-all duration-300 rounded-lg ease-out mx-2 w-[calc(100%-16px)] md:right-3 md:mx-0 md:w-full md:max-w-lg ${
            not_isopen ? 'translate-y-0 scale-100' : '-translate-y-4 scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <NotificationCenter
            onClose={() => 
              set_notopen(false)}
          />
        </div>
      </div>
    </>
  );
}
