'use client';

import { useLocalPongLogic } from '@/hooks/useLocalPongLogic';

export default function LocalGamePage() {
  const { containerRef, scores } = useLocalPongLogic();

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-900 text-white'>
      <h1 className='text-3xl font-bold mb-4'>Local Pong</h1>
      <div
        ref={containerRef}
        className='mx-auto rounded-[8px] overflow-hidden border-2 border-pink aspect-[3/2] w-[min(100%,1600px,calc((100vh-140px)*(3/2)))] shadow-[0_0_14px_4px_rgba(236,72,135,1)]'
      ></div>
      <div className='mt-4 text-xl'>
        Score: {scores.left} - {scores.right}
      </div>
    </div>
  );
}
