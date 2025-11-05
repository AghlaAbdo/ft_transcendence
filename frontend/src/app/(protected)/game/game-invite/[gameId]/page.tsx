'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useParams } from 'next/navigation';

import LoadingPong from '@/components/LoadingPong';
import Matching from '@/components/Matching';
import AlreadyInGame from '@/components/game/AlreadyInGame';
import CloseGameDialog from '@/components/game/CloseGameDialog';
import GamePlayers from '@/components/game/GamePlayers';
import GameResultCard from '@/components/game/GameResultCard';
import InTournamentCard from '@/components/game/InTournamentCard';

import { socket } from '@/app/(protected)/lib/socket';
import { IPlayer } from '@/constants/game';
import { useLayout } from '@/context/LayoutContext';
import { useUser } from '@/context/UserContext';
import { usePongGameLogic } from '@/hooks/usePongGameLogic';

export default function GameInvite() {
  const closeDialRef = useRef<HTMLDialogElement | null>(null);
  const { user } = useUser();
  const params = useParams();
  const gameId = params.gameId as string;
  const { setHideHeaderSidebar } = useLayout();

  useEffect(() => {
    setHideHeaderSidebar(true);

    return () => {
      setHideHeaderSidebar(false);
    };
  }, []);

  const {
    containerRef,
    dialogRef,
    matching,
    opponent,
    winner,
    playerRole,
    inAnotherGame,
    gameStatus,
    inTournament,
  } = usePongGameLogic(null, null, gameId);

  function handleClose() {
    closeDialRef.current?.showModal();
  }

  function handleReturn() {}

  const player: IPlayer = {
    id: user.id,
    username: user.username,
    avatar: user.avatar_url!,
    frame: 'silver2',
    level: '34',
    isEliminated: false,
  };

  return (
    <>
      {matching && (
        <Matching player={player} opponent={opponent} gameId={gameId}>
          {
            <div className='flex flex-col justify-center items-center'>
              <LoadingPong />
              <span className='text-2xl font-bold'>
                Waiting for opponent to join
              </span>
              <button
                onClick={handleReturn}
                className='w-full max-w-30 text-center bg-red py-[2px] 500:py-1 px-1 500:px-2 mt-4 rounded-[8px] text-[14px] 500:text-[20px] text-gray-50 font-bold cursor-pointer'
              >
                Return
              </button>
            </div>
          }
        </Matching>
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
          <CloseGameDialog
            dialogRef={closeDialRef}
            gameId={gameId}
            isTournamentGame={false}
            isLocal={false}
          />

          <div className='h-screen py-2 px-2 md:py-6 md:px-6 flex flex-col gap-4 justify-center items-center'>
            <GamePlayers leftUser={player} rightUser={opponent!} />
            <div
              ref={containerRef}
              className='mx-auto rounded-[8px] overflow-hidden border-2 border-pink aspect-[3/2] w-[min(100%,1600px,calc((100vh-140px)*(3/2)))] shadow-[0_0_14px_4px_rgba(236,72,135,1)]'
            ></div>
            <GameResultCard
              ref={dialogRef}
              leftUser={player}
              rightUser={opponent!}
              winner={winner}
              gameId={gameId}
              playerRole={playerRole}
              isTournamentGame={false}
            />
          </div>
        </>
      )}
    </>
  );
}
