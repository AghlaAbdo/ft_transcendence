'use client';

import Image from 'next/image';

import { motion } from 'framer-motion';

import avatar from '@/../public/avatars/avatar1.png';

const avatars = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
];

export default function Matching({
  opponent,
}: {
  opponent: null | { username: string; avatar: string };
}) {
  return (
    <div className='h-[calc(100vh-100px)] flex justify-center items-center gap-2 md:gap-12  px-2'>
      <div className='w-48 flex flex-col gap-6 items-center'>
        <Image src={avatar} alt='your avatar' className='w-full' />
        <span className='bg-gray-800 px-3 py-1 rounded-[8px] border-1 border-gray-500'>
          user_9823
        </span>
      </div>

      <div className='w-36'>
        <motion.img
          src='/images/vs.png'
          alt='VS'
          className='w-full'
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className='w-48 flex flex-col gap-6 items-center'>
        {opponent ? (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1,
                scale: { type: 'spring', bounce: 0.5, duration: 1 },
              }}
            >
              <Image
                src={avatar}
                alt={opponent.username}
                className='w-full rounded-full'
                width={192}
                height={192}
              />
            </motion.div>

            <span className='bg-gray-800 px-3 py-1 rounded-[8px] border-1 border-gray-500'>
              {opponent ? opponent.username : ''}
            </span>
          </>
        ) : (
          <div className='relative h-60 sm:h-125 w-48 overflow-hidden flex items-end justify-center rounded-xl'>
            {avatars.map((src, i) => (
              <motion.img
                key={i}
                src={src}
                className='absolute bottom-0 w-48 h-48 rounded-full object-cover'
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 1, 0], y: [500, 250, -100, -500] }}
                transition={{
                  duration: 1,
                  delay: i * 0.25,
                  ease: 'linear',
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
