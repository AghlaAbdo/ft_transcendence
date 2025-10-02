'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { redirect } from 'next/navigation';

import Matching from '@/components/Matching';
import AlreadyInGame from '@/components/game/AlreadyInGame';
import CloseGameDialog from '@/components/game/CloseGameDialog';
import GamePlayers from '@/components/game/GamePlayers';
import GameResultCard from '@/components/game/GameResultCard';

import { IPlayer } from '@/constants/game';
import { useUser } from '@/context/UserContext';
import { usePongGameLogic } from '@/hooks/usePongGameLogic';

export default function GamePage() {
  const {
    containerRef,
    dialogRef,
    matching,
    opponent,
    winner,
    gameId,
    playerRole,
    inAnotherGame,
  } = usePongGameLogic();
  const closeDialRef = useRef<HTMLDialogElement | null>(null);
  const { user } = useUser();

  const player: IPlayer = {
    username: user.username,
    avatar: user.avatar_url!,
    frame: 'silver2',
    level: '34',
  };

  function handleClose() {
    closeDialRef.current?.showModal();
  }

  if (inAnotherGame) return <AlreadyInGame />;
  return (
    <>
      {matching && (
        <Matching player={player} opponent={opponent} gameId={gameId!} />
      )}
      {!matching && (
        <>
          <button
            onClick={handleClose}
            className='fixed top-4 left-4 w-10 bg-red rounded-[4px]  cursor-pointer'
          >
            <Image
              width={80}
              height={80}
              src='/icons/close.png'
              alt='close'
              className='w-full'
            />
          </button>
          {/* Close dialog */}
          <CloseGameDialog dialogRef={closeDialRef} gameId={gameId} />

          <div className='h-screen py-2 px-2 md:py-6 md:px-6 flex flex-col gap-4 justify-center items-center'>
            <GamePlayers leftUser={player!} rightUser={opponent!} />
            <div
              ref={containerRef}
              className='mx-auto rounded-[8px] overflow-hidden border-2 border-pink aspect-[3/2] w-[min(100%,1600px,calc((100vh-140px)*(3/2)))] shadow-[0_0_14px_4px_rgba(236,72,135,1)]'
            ></div>
            <GameResultCard
              ref={dialogRef}
              leftUser={player!}
              rightUser={opponent!}
              winner={winner}
              gameId={gameId}
              playerRole={playerRole}
            />
          </div>
        </>
      )}
    </>
  );
}
