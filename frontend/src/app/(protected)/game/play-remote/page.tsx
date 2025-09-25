'use client';

import Image from 'next/image';

import Avatar from '@/components/Avatar';
import Matching from '@/components/Matching';
import GamePlayers from '@/components/game/GamePlayers';

import { usePongGameLogic } from '@/hooks/usePongGameLogic';

export default function GamePage() {
  const { containerRef, waiting, opponent } = usePongGameLogic();
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
        <div className='flex flex-col gap-4 justify-center'>
          <GamePlayers leftUser={leftUser} rightUser={rightUser} />
          <div ref={containerRef} className='flex justify-center'></div>
        </div>
      )}
    </>
  );
}
