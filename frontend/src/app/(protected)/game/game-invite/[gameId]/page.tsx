'use client'

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { socket } from '@/app/(protected)/lib/socket';
import { useUser } from '@/context/UserContext';
import { usePongGameLogic } from '@/hooks/usePongGameLogic';
import Image from 'next/image';
import LoadingPong from '@/components/LoadingPong';
import Matching from '@/components/Matching';
import AlreadyInGame from '@/components/game/AlreadyInGame';
import CloseGameDialog from '@/components/game/CloseGameDialog';
import GamePlayers from '@/components/game/GamePlayers';
import GameResultCard from '@/components/game/GameResultCard';
import InTournamentCard from '@/components/game/InTournamentCard';
import { IPlayer } from '@/constants/game';

export default function GameInvite() {
    const closeDialRef = useRef<HTMLDialogElement | null>(null);
    const { user } = useUser();
    const params = useParams();
    const gameId = params.gameId as string;

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
            <Matching player={player} opponent={opponent} gameId={gameId} />
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