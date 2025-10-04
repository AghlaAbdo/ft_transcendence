import { useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import avatar from '@/../public/avatars/avatar1.png';

import Modal from './new_conversation';

// import Styles from './Header.module.css'; // remove this one later

export default function Header() {

  return (
    <div
      // id={Styles.container}
      className='fixed h-[72px] w-[calc(100%-72px)] top-0 left-[72px] bg-[#111827] flex justify-between items-center px-16 pl-3 border-b border-[#374151]'
    >
      <div className='flex justify-between items-center gap-4'>
        <Image src={avatar} alt='Avatar' className='w-10' />
        <span className='text-[20px] font-bold text-gray-50'>
          Welcome user_x
        </span>
      </div>
      <div className='flex justify-between items-center gap-4'>
        <button onClick={() => setIsModalOpen(true)}>
          {/* onClick={() => setIsModalOpen(true)} */}
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
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialFocusRef={inputRef}
        >
          {/* Your modal content */}
          <input
            ref={inputRef}
            type='text'
            placeholder='Username...'
            className='w-full py-1.5 pl-3 pr-3 bg-[#1F2937] text-white placeholder-gray-400 border border-gray-600 rounded-lg outline-none focus:border-purple-600'
          />
          <p className='text-sm text-gray-500 mt-2'>friends list</p>
         
        </Modal>
        <Link href='#'>
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
        </Link>
      </div>
    </div>
  );
}
