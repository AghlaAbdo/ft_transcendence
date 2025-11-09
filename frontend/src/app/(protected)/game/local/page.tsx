'use client';

import { useRef } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import CloseGameDialog from '@/components/game/CloseGameDialog';
import LocalGamePlayers from '@/components/game/LocalGamePlayers';

import { useLocalPongLogic } from '@/hooks/useLocalPongLogic';

export default function LocalGamePage() {
  const { containerRef, scores, dialogRef, winner, handleRematch } =
    useLocalPongLogic();
  const router = useRouter();
  const closeDialRef = useRef<HTMLDialogElement | null>(null);

  function handleReturn() {
    router.replace('/game');
  }

  function handleClose() {
    closeDialRef.current?.showModal();
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-900 text-white'>
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
      <CloseGameDialog
        dialogRef={closeDialRef}
        gameId={null}
        isTournamentGame={false}
        isLocal={true}
      />

      <LocalGamePlayers />
      <div
        ref={containerRef}
        className='mx-auto rounded-[8px] overflow-hidden border-2 border-pink aspect-[3/2] w-[min(100%,1600px,calc((100vh-140px)*(3/2)))] shadow-[0_0_14px_4px_rgba(236,72,135,1)]'
      ></div>
      <dialog
        ref={dialogRef}
        className='bg-dark-blue min-w-50 500:min-w-80 border-[1px] border-gray-700 rounded-[8px] mx-auto my-auto pt-6 pb-3 px-2 500:px-5'
      >
        <div className='flex flex-col gap-8 items-center'>
          <div className='flex flex-col gap-2 items-center'>
            <span className='text-gold px-[2px] text-3xl 500:text-4xl md:text-5xl font-bold'>
              Winner
            </span>
            <span className='bg-gray-700 px-1 py-[2px] md:px-3 md:py-1 rounded-[8px] border-1 border-gray-500 text-sm md:text-[16px] text-gray-50 font-bold'>
              {winner}
            </span>
          </div>
          <div className='flex w-full justify-between'>
            <button
              onClick={handleRematch}
              className='max-w-30 text-center bg-green py-[2px] 500:py-1 px-1 500:px-3 rounded-[8px] text-[14px] 500:text-[16px] text-gray-50 font-bold cursor-pointer'
            >
              Replay
            </button>

            <button
              onClick={handleReturn}
              className='max-w-30 text-center bg-red py-[2px] 500:py-1 px-1 500:px-3 rounded-[8px] text-[14px] 500:text-[16px] text-gray-50 font-bold cursor-pointer'
            >
              Return
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
