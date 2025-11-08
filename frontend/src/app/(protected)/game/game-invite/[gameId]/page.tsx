'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import LoadingPong from '@/components/LoadingPong';
import Matching from '@/components/Matching';
import AlreadyInGame from '@/components/game/AlreadyInGame';
import CloseGameDialog from '@/components/game/CloseGameDialog';
import GamePlayers from '@/components/game/GamePlayers';
import GameResultCard from '@/components/game/GameResultCard';
import InTournamentCard from '@/components/game/InTournamentCard';

import { socket } from '@/app/(protected)/lib/socket';
import NotFound from '@/app/not-found';
import { IPlayer } from '@/constants/game';
import { useLayout } from '@/context/LayoutContext';
import { useUser } from '@/context/UserContext';
import { usePongGameLogic } from '@/hooks/usePongGameLogic';

export default function GameInvite() {
  const closeDialRef = useRef<HTMLDialogElement | null>(null);
  const { user } = useUser();
  const params = useParams();
  const gameId = params.gameId as string;
  const { setHideHeaderSidebar, setHideSidebar } = useLayout();
  const [loading, setLoading] = useState<boolean>(true);
  const [inviteRejected, setInviteRejected] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setHideHeaderSidebar(true);
    setHideSidebar(true);
    socket.on('opponentDidNotJoin', () => {
      setInviteRejected(true);
      setHideHeaderSidebar(false);
      setHideSidebar(false);
    });
    socket.on('matchNotFound', () => {
      console.log('GAmeInvite match not found!!');
      setHideHeaderSidebar(false);
      setHideSidebar(false);
      setLoading(false);
      setNotFound(true);
    });
    socket.on('matchDetails', () => {
      setLoading(false);
    });

    return () => {
      setHideHeaderSidebar(false);
      setHideSidebar(false);
      socket.off('opponentDidNotJoin');
      socket.off('matchNotFound');
      socket.off('matchDetails');
    };
  }, []);

  const { containerRef, dialogRef, matching, opponent, winner, playerRole } =
    usePongGameLogic(null, null, gameId);

  function handleClose() {
    closeDialRef.current?.showModal();
  }

  function handleReturn() {
    socket.emit('leaveGameInvite', { userId: user.id, gameId });
    router.replace('/chat');
  }

  const player: IPlayer = {
    id: user.id,
    username: user.username,
    avatar: user.avatar_url!,
    frame: 'silver2',
    level: '34',
    isEliminated: false,
  };

  if (loading)
    return (
      <div className='h-[calc(100vh_-_72px)] flex justify-center items-center'>
        <LoadingPong />
      </div>
    );

  if (notFound) return <NotFound />;

  if (inviteRejected)
    return (
      <div className='h-[calc(100vh_-_72px)] flex justify-center items-center'>
        <div className='w-fit min-w-20 flex flex-col justify-center items-center bg-dark-blue gap-4 border-1 border-gray-600 rounded-[8px] p-4'>
          <span className='text-2xl font-bold'>
            Opponent did not join the game!
          </span>
          <button
            onClick={() => router.replace('/chat')}
            className='bg-red py-[2px] 500:py-1 px-1 500:px-4 mt-4 rounded-[8px] text-[14px] 500:text-[18px] text-gray-50 font-bold cursor-pointer'
          >
            Return
          </button>
        </div>
      </div>
    );

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
