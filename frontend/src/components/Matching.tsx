import { redirect } from 'next/navigation';

import { motion } from 'framer-motion';

import Avatar from '@/components/Avatar';

import { socket } from '@/app/(protected)/lib/socket';
import { IPlayer } from '@/constants/game';

const avatars = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
];

export default function Matching({
  player,
  opponent,
  gameId,
}: {
  player: IPlayer;
  opponent: null | IPlayer;
  gameId: string;
}) {
  function handleCancel() {
    if (!opponent) {
      socket.emit('cancelMatching', gameId);
      redirect('/game');
    }
  }
  return (
    <div className='h-[calc(100vh-100px)] fixed left-auto right-auto w-full flex justify-center items-center gap-2 sm:gap-12  px-2'>
      <motion.div
        className={`${!player ? 'invisible' : 'visible'} w-30 sm:w-48 flex flex-col gap-6 items-center`}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.6,
          scale: { type: 'spring', bounce: 0.4, duration: 0.6 },
        }}
      >
        <Avatar width={192} url={player.avatar} frame={player.frame} />
        <span className='bg-gray-800 px-1 py-[2px] sm:px-3 sm:py-1 rounded-[8px] border-1 border-gray-500'>
          {player.username}
        </span>
      </motion.div>

      <div className='w-20 sm:w-30 md:w-36 flex flex-col gap-4 items-center'>
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
        {!opponent && (
          <button
            onClick={handleCancel}
            className='bg-red rounded-[8px] px-1 py-[2px] sm:px-3 sm:py-1 text-sm sm:text-[20px] text-gray-50 font-bold cursor-pointer'
          >
            Cancel
          </button>
        )}
      </div>

      <div className='w-30 sm:w-48 flex flex-col gap-6 items-center'>
        {opponent ? (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1,
                scale: { type: 'spring', bounce: 0.5, duration: 1 },
              }}
              className='w-full'
            >
              <Avatar
                width={192}
                url={`${opponent ? opponent.avatar : '/avatars/avatar2.png'}`}
                frame={`${opponent ? opponent.frame : 'silver3'}`}
              />
            </motion.div>

            <span className='bg-gray-800 px-1 py-[2px] sm:px-3 sm:py-1 rounded-[4px] sm:rounded-[8px] border-1 border-gray-500'>
              {opponent ? opponent.username : 'guest_9850'}
            </span>
          </>
        ) : (
          <div className='relative h-60 sm:h-125 w-full overflow-hidden flex items-end justify-center rounded-xl'>
            {avatars.map((src, i) => (
              <motion.div
                key={i}
                className='absolute bottom-0 w-full rounded-full object-cover'
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 1, 0], y: [500, 250, -100, -500] }}
                transition={{
                  duration: 1,
                  delay: i * 0.25,
                  ease: 'linear',
                  repeat: Infinity,
                }}
              >
                <Avatar width={192} url={src} frame='silver1' />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
