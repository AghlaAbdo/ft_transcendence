import Image from 'next/image';

import { getFrameByPoints } from '@/utils/getFrameByPoints';

import Avatar from '../Avatar';

export default function GamePlayers({
  leftUser,
  rightUser,
}: {
  leftUser: {
    username: string;
    avatar: string;
    frame: string;
    points: number;
    level: string;
  };
  rightUser: {
    username: string;
    avatar: string;
    frame: string;
    points: number;
    level: string;
  };
}) {
  return (
    <div className='flex gap-1 md:gap-5 items-center justify-center'>
      <div>
        <div className='flex gap-1 md:gap-2 items-center'>
          <div className='relative'>
            <div className='absolute left-0 top-1/2 -translate-y-1/2'>
              <div className='relative w-8 md:w-12'>
                <Image
                  width={48}
                  height={48}
                  src='/images/star.png'
                  alt='star'
                  className='w-full pointer-events-none'
                />
                <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12px] md:text-[16px] text-gray-50 font-bold drop-shadow-[0_0_2px_black]'>
                  {leftUser.level}
                </span>
              </div>
            </div>
            <span className='block w-24 md:w-52 font-bold text-[12px] md:text-[20px] text-right px-1 md:px-2 py-[2px] md:py-1 rounded-[8px] bg-gray-600 ml-3 md:ml-4'>
              {leftUser.username}
            </span>
          </div>
          <div className='w-10 md:w-20'>
            <Avatar
              width={80}
              url={leftUser.avatar}
              frame={getFrameByPoints(leftUser.points)}
            />
          </div>
        </div>
      </div>

      <div className='w-4 md:w-16'>
        <Image
          width={64}
          height={64}
          alt='vs'
          src='/images/vs.png'
          className='w-full'
        />
      </div>

      <div>
        <div className='flex gap-1 md:gap-2 items-center'>
          <div className='w-10 md:w-20'>
            <Avatar
              width={80}
              url={rightUser.avatar}
              frame={getFrameByPoints(rightUser.points)}
            />
          </div>
          <div className='relative'>
            <div className='absolute right-0 top-1/2 -translate-y-1/2'>
              <div className='relative w-8 md:w-12'>
                <Image
                  width={48}
                  height={48}
                  src='/images/star.png'
                  alt='star'
                  className='w-full pointer-events-none'
                />
                <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12px] md:text-[16px] text-gray-50 font-bold drop-shadow-[0_0_2px_black]'>
                  {rightUser.level}
                </span>
              </div>
            </div>
            <span className='block w-24 md:w-52 font-bold text-[12px] md:text-[20px] text-left px-1 md:px-2 py-[2px] md:py-1 rounded-[8px] bg-gray-600 mr-3 md:mr-4'>
              {rightUser.username}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
