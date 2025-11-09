import Image from 'next/image';

import { ArrowDown, ArrowUp } from 'lucide-react';

export default function LocalGamePlayers() {
  return (
    <div className='flex gap-1 md:gap-5 items-center justify-center mb-3'>
      <div>
        <div className='flex gap-2 500:gap-4 md:gap-8 items-center'>
          <div className='flex gap-1 500:gap-2'>
            <ArrowUp className='w-6 h-6 p-1 500:w-8 500:h-8 md:w-12 md:h-12 md:p-2 rounded-[4px] 500:rounded-[8px] bg-purple' />
            <ArrowDown className='w-6 h-6 p-1 500:w-8 500:h-8 md:w-12 md:h-12 md:p-2 rounded-[4px] 500:rounded-[8px] bg-purple' />
          </div>
          <div className='relative'>
            <span className='font-bold text-[10px] 500:text-[14px] md:text-[20px] px-1 md:px-2 py-[2px] rounded-[4px] md:rounded-[8px] bg-gray-600'>
              Player 1
            </span>
          </div>
        </div>
      </div>

      <div className='w-6 500:w-12 md:w-16'>
        <Image
          width={64}
          height={64}
          alt='vs'
          src='/images/vs.png'
          className='w-full'
        />
      </div>

      <div>
        <div className='flex gap-2 500:gap-4 md:gap-8 items-center'>
          <div className='relative'>
            <span className='font-bold text-[10px] 500:text-[14px] md:text-[20px] px-1 md:px-2 py-[2px] rounded-[4px] md:rounded-[8px] bg-gray-600'>
              Player 2
            </span>
          </div>
          <div className='flex gap-1 md:gap-2'>
            <span className='w-6 h-6 p-1 500:w-8 500:h-8 md:w-12 md:h-12 md:p-2 rounded-[4px] 500:rounded-[8px] bg-purple text-[14px] 500:text-[20px] md:text-3xl font-bold text-center'>
              W
            </span>
            <span className='w-6 h-6 p-1 500:w-8 500:h-8 md:w-12 md:h-12 md:p-2 rounded-[4px] 500:rounded-[8px] bg-purple text-[14px] 500:text-[20px] md:text-3xl font-bold text-center'>
              S
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
