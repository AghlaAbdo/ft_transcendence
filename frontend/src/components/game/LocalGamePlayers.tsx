import Image from 'next/image';

import { ArrowDown, ArrowUp } from 'lucide-react';

export default function LocalGamePlayers() {
  return (
    <div className='flex gap-1 md:gap-5 items-center justify-center mb-3'>
      <div>
        <div className='flex gap-1 md:gap-2 items-center'>
          <div className='flex gap-2'>
            <ArrowUp className='w-12 h-12 p-2 rounded-[8px] bg-purple' />
            <ArrowDown className='w-12 h-12 p-2 rounded-[8px] bg-purple' />
          </div>
          <div className='relative'>
            <span className='block min-w-24 md:min-w-30 font-bold text-[12px] md:text-[20px] text-right px-1 md:px-2 py-[2px]  rounded-[8px] bg-gray-600 ml-3 md:ml-4'>
              Player 1
            </span>
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
          <div className='relative'>
            <span className='block min-w-24 md:min-w-30 font-bold text-[12px] md:text-[20px] text-left px-1 md:px-2 py-[2px]  rounded-[8px] bg-gray-600 mr-3 md:mr-4'>
              Player 2
            </span>
          </div>
          <div className='flex gap-2'>
            <span className='w-12 h-12 p-2 rounded-[8px] bg-purple text-3xl font-bold text-center'>
              W
            </span>
            <span className='w-12 h-12 p-2 rounded-[8px] bg-purple text-3xl font-bold text-center'>
              S
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
