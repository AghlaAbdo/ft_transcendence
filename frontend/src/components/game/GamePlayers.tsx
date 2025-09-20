import Image from 'next/image';

import Avatar from '../Avatar';

export default function GamePlayers({
  leftUser,
  rightUser,
}: {
  leftUser: {
    username: string;
    avatar: string;
    frame: string;
    level: string;
  };
  rightUser: {
    username: string;
    avatar: string;
    frame: string;
    level: string;
  };
}) {
  return (
    <div className='flex gap-5 items-center justify-center'>
      <div>
        <div className='flex gap-2 items-center'>
          <div className='relative'>
            <div className='absolute left-0 top-1/2 -translate-y-1/2'>
              <div className='relative w-12'>
                <Image
                  width={24}
                  height={24}
                  src='/images/star.png'
                  alt='star'
                  className='w-full pointer-events-none'
                />
                <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-lg font-bold text-stroke-[2px] text-stroke-black'>
                  {leftUser.level}
                </span>
              </div>
            </div>
            <span className='block w-52 font-bold text-[20px] text-right px-2 py-1 rounded-[8px] bg-gray-600 ml-4'>
              {leftUser.username}
            </span>
          </div>
          <div className='w-20'>
            <Avatar width={42} url={leftUser.avatar} frame={leftUser.frame} />
          </div>
        </div>
      </div>

      <div className='w-16'>
        <Image
          width={56}
          height={56}
          alt='vs'
          src='/images/vs.png'
          className='w-full'
        />
      </div>

      <div>
        <div className='flex gap-2 items-center'>
          <div className='w-20'>
            <Avatar width={42} url={rightUser.avatar} frame={rightUser.frame} />
          </div>
          <div className='relative'>
            <div className='absolute right-0 top-1/2 -translate-y-1/2'>
              <div className='relative w-12'>
                <Image
                  width={24}
                  height={24}
                  src='/images/star.png'
                  alt='star'
                  className='w-full pointer-events-none'
                />
                <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-lg font-bold text-stroke-[2px] text-stroke-black'>
                  {rightUser.level}
                </span>
              </div>
            </div>
            <span className='block w-52 font-bold text-[20px] text-left px-2 py-1 rounded-[8px] bg-gray-600 mr-4'>
              {rightUser.username}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
