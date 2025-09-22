'use client';

import Image from 'next/image';

import Avatar from '@/components/Avatar';
import Matching from '@/components/Matching';
import GamePlayers from '@/components/game/GamePlayers';
import GameResultCard from '@/components/game/GameResultCard';

import { usePongGameLogic } from '@/hooks/usePongGameLogic';

export default function GamePage() {
  const { containerRef, waiting, opponent, dialogRef } = usePongGameLogic();
  const leftUser = {
    username: 'user_13445',
    avatar: '/avatars/avatar1.png',
    frame: 'gold2',
    level: '145',
  };
  const rightUser = {
    username: 'user_2548',
    avatar: '/avatars/avatar2.png',
    frame: 'silver3',
    level: '10',
  };
  return (
    <>
      {waiting ? (
        <Matching opponent={opponent} />
      ) : (
        <div className='h-screen py-2 px-2 md:py-6 md:px-6 flex flex-col gap-4 justify-center items-center'>
          <GamePlayers leftUser={leftUser} rightUser={rightUser} />
          <div ref={containerRef} className='w-full max-w-[1000px] aspect-[3/2] rounded-[8px] overflow-hidden border-2 border-pink shadow-[0_0_14px_4px_rgba(236,72,135,1)]'></div>
          <GameResultCard ref={dialogRef}/>
        </div>
      )}
    </>
  );
}
