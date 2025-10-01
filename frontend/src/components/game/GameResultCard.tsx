'use client';

import { useState } from 'react';

import Image from 'next/image';

import { motion } from 'framer-motion';

import { IPlayer } from '@/constants/game';

import Avatar from '../Avatar';
import Rematch from './Rematch';

export default function GameResultCard({
  ref,
  leftUser,
  rightUser,
  winner,
  gameId,
  playerRole,
}: {
  ref: React.RefObject<HTMLDialogElement | null>;
  leftUser: IPlayer;
  rightUser: IPlayer;
  winner: string;
  gameId: string | null;
  playerRole: 'player1' | 'player2' | null;
}) {
  const [rematch, setRematch] = useState<string[]>([]);

  console.log('reached game reslut card!!!');

  return (
    <dialog
      ref={ref}
      className='bg-dark-blue border-[1px] border-gray-700 rounded-[8px] mx-auto my-auto px-2 pt-1 pb-8 500:pb-10 md:px-8 md:pt-6 md:pb-11'
    >
      <div className='500:w-100 md:w-142 h-full flex gap-1 500:gap-2 md:gap-4 items-end'>
        <div className='relative flex-1 flex flex-col gap-4 items-center'>
          <div>
            <span
              className={`${winner !== playerRole ? 'invisible' : ''} text-gold px-[2px] text-3xl 500:text-4xl md:text-5xl font-bold`}
            >
              Winner
            </span>
          </div>
          <div className='w-16 500:w-24 md:w-32'>
            <Avatar width={128} url={leftUser.avatar} frame={leftUser.frame} />
          </div>
          <span className='bg-gray-700 px-1 py-[2px] md:px-3 md:py-1 rounded-[8px] border-1 border-gray-500 text-sm md:text-[16px] text-gray-50 font-bold'>
            {leftUser.username}
          </span>
          {/* Play again messge */}
          {(rematch.includes('sent') || rematch.includes('quit')) && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0.3 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className='absolute -bottom-7 md:-bottom-9 left-auto right-auto'
            >
              <div className='w-fit relative inline-block px-1 md:px-2 py-[2px] border border-pink rounded-lg bg-white text-[10px] md:text-sm font-bold'>
                {rematch.includes('quit')
                  ? "Can't play right now"
                  : 'I want to play again'}
                <div className='absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-pink'></div>
                <div className='absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-7 border-r-7 border-b-7 border-transparent border-b-white'></div>
              </div>
            </motion.div>
          )}
        </div>

        <div className='relative md:flex-1 flex flex-col gap-4 items-center self-end pb-8'>
          <Rematch
            rematch={rematch}
            setRematch={setRematch}
            gameId={gameId}
            playerRole={playerRole}
            dialogRef={ref}
          />
        </div>

        <div className='w-fit relative flex-1 flex flex-col gap-2 items-center'>
          <div>
            <span
              className={`${winner === playerRole ? 'invisible' : ''} text-gold px-[2px] text-3xl 500:text-4xl md:text-5xl font-bold`}
            >
              Winner
            </span>
          </div>
          <div className='w-16 500:w-24 md:w-32'>
            <Avatar
              width={128}
              url={rightUser.avatar}
              frame={rightUser.frame}
            />
          </div>
          <div className='h-[26px] md:h-[34px] flex items-center pl-3 pr-1 gap-1 bg-gray-700  rounded-[8px] border-1 border-gray-500'>
            <span className='text-sm md:text-[16px] text-gray-50 font-bold'>
              {rightUser.username}
            </span>
            <Image
              src='/icons/add-friend.png'
              width={22}
              height={22}
              alt='Add friend'
              className='w-fit cursor-pointer'
            />
          </div>
          {/* Play again messge */}
          {(rematch.includes('recived') || rematch.includes('rejected')) && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0.3 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className='absolute -bottom-7 md:-bottom-9 left-auto right-auto'
            >
              <div className='w-fit relative inline-block px-1 md:px-2 py-[2px] border border-pink rounded-lg bg-white text-[10px] md:text-sm font-bold'>
                <p>
                  {rematch.includes('rejected')
                    ? "Can't play right now"
                    : 'I want to play again'}
                </p>
                <div className='absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-pink'></div>
                <div className='absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-7 border-r-7 border-b-7 border-transparent border-b-white'></div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </dialog>
  );
}
