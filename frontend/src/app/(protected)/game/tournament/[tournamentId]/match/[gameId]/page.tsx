'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import LoadingPong from '@/components/LoadingPong';
import AlreadyInGame from '@/components/game/AlreadyInGame';
import CloseGameDialog from '@/components/game/CloseGameDialog';
import GamePlayers from '@/components/game/GamePlayers';
import GameResultCard from '@/components/game/GameResultCard';
import OpponentNotJoined from '@/components/game/OpponentNotJoined';

import { socket } from '@/app/(protected)/lib/socket';
import NotFound from '@/app/not-found';
import { IPlayer } from '@/constants/game';
import { useUser } from '@/context/UserContext';
import { usePongGameLogic } from '@/hooks/usePongGameLogic';

interface MatchPageParams extends Record<string, string> {
  tournamentId: string;
  gameId: string;
}

export default function GamePage() {
  const params = useParams<MatchPageParams>();
  const tournamentId = params.tournamentId;
  const matchGameId = params.gameId;
  const { user } = useUser();
  const [accessToMatch, setAccessToMatch] = useState<
    'pending' | 'access' | '404'
  >('pending');
  const [opponentNotJoined, setOpponentNotJoined] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // console.log('how many times sent readyForMatch??');
    socket.emit('tourn:readyForMatch', {
      userId: user.id,
      tournamentId,
      gameId: matchGameId,
    });
    socket.on('notInMatch', () => {
      // console.log('ever got notInMatch???');
      setAccessToMatch('404');
    });
    socket.on('inMatch', () => {
      // console.log('ever got InMatch???');
      setAccessToMatch('access');
    });
    socket.on('opponentNotJoined', () => {
      setOpponentNotJoined(true);
    });
    return () => {
      socket.off('inMatch');
      socket.off('notInMatch');
      socket.off('opponentNotJoined');
      // if (!player || !opponent || matching)
      socket.emit('unreadyForMatch', { userId: user.id });
    };
  }, []);

  const {
    containerRef,
    dialogRef,
    opponent,
    winner,
    matching,
    gameId,
    playerRole,
    inAnotherGame,
  } = usePongGameLogic(tournamentId, matchGameId, null);
  const closeDialRef = useRef<HTMLDialogElement | null>(null);

  if (accessToMatch === 'pending') return <div></div>;

  const player: IPlayer = {
    id: user.id,
    username: user.username,
    avatar: user.avatar_url!,
    frame: 'silver2',
    level: '34',
    isEliminated: false,
  };

  function handleClose() {
    closeDialRef.current?.showModal();
  }

  if (inAnotherGame) return <AlreadyInGame />;
  if (accessToMatch === '404') {
    return <NotFound />;
    // return <OpponentNotJoined tournamentId={tournamentId} />
  }
  if (opponentNotJoined) {
    setTimeout(() => router.replace(`/game/tournament/${tournamentId}`), 3000);
    return <OpponentNotJoined tournamentId={tournamentId} />;
  }
  if (!player || !opponent || matching)
    return (
      <div className='text-center mt-12 h-[calc(100vh_-_72px)] flex flex-col justify-center'>
        <LoadingPong />
        <h1 className='text-2xl font-bold mt-4'>
          Waiting for opponent to join
        </h1>
      </div>
    );
  return (
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
        isTournamentGame={true}
        isLocal={false}
      />

      <div className='h-screen py-2 px-2 md:py-6 md:px-6 flex flex-col gap-4 justify-center items-center'>
        {player && opponent && (
          <GamePlayers leftUser={player} rightUser={opponent} />
        )}
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
          isTournamentGame={true}
        />
      </div>
    </>
  );
}
