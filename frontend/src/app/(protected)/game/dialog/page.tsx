import GameResultCard from '@/components/game/GameResultCard';

export default function () {
  return (
    <>
      <div className='relative inline-block px-3 py-2 border border-gray-400 rounded-lg bg-white text-sm'>
        I want to play again
        {/* The little arrow */}
        <div className='absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-400'></div>
        <div className='absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-7 border-r-7 border-b-7 border-transparent border-b-white'></div>
      </div>
    </>
  );
}
