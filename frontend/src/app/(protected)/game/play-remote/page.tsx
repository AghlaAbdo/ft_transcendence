'use client';

import { useRef } from 'react';

import Image from 'next/image';

import Matching from '@/components/Matching';
import CloseGameDialog from '@/components/game/CloseGameDialog';
import GamePlayers from '@/components/game/GamePlayers';
import GameResultCard from '@/components/game/GameResultCard';

import { usePongGameLogic } from '@/hooks/usePongGameLogic';

export default function GamePage() {
  const {
    containerRef,
    dialogRef,
    waiting,
    player,
    opponent,
    winner,
    gameId,
    playerRole,
    handleClose,
  } = usePongGameLogic();
  const closeDialRef = useRef<HTMLDialogElement | null>(null);

  function close() {
    closeDialRef.current?.showModal();
  }
  return (
    <>
      {!player && <div></div>}
      {player && waiting && <Matching player={player} opponent={opponent} />}
      {!waiting && (
        <>
          <button
            onClick={close}
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
          <CloseGameDialog
            dialogRef={closeDialRef}
            gameId={gameId}
            playerRole={playerRole}
          />
          {/* <dialog ref={closeDialRef} className='flex flex-col gap-6 mx-auto my-auto bg-dark-blue rounded-[8px] border-[1px] border-gray-700 pt-4 pb-2 px-6'>
            <div>
              <p className='text-2xl text-gold text-center font-bold'>Are you sure you want to quit?</p>
              <p className='text-[16px] text-gray-200 text-center '>You will lose this game!</p>
            </div>
            <div className='flex justify-between'>
              <button className='w-full max-w-[88px] bg-green px-3 py-[2px] rounded-[8px] text-[18px] text-gray-50 font-bold'>Cancel</button>
              <button className='w-full max-w-[88px] bg-red px-3 py-[2px] rounded-[8px] text-[18px] text-gray-50 font-bold'>Quit</button>
            </div>
          </dialog> */}

          <div className='h-screen py-2 px-2 md:py-6 md:px-6 flex flex-col gap-4 justify-center items-center'>
            <GamePlayers leftUser={player!} rightUser={opponent!} />
            <div
              ref={containerRef}
              className='w-full max-w-[1000px] aspect-[3/2] rounded-[8px] overflow-hidden border-2 border-pink shadow-[0_0_14px_4px_rgba(236,72,135,1)]'
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
