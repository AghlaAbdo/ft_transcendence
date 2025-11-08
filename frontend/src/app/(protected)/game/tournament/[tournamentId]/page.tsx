'use client';

import { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import Avatar from '@/components/Avatar';
import LoadingPong from '@/components/LoadingPong';
import TournamentBracket from '@/components/game/TournamentBracket';

import { getCurrentMatch } from '@/app/(protected)/lib/game/utils';
import { socket } from '@/app/(protected)/lib/socket';
import NotFound from '@/app/not-found';
import { IMatch, IPlayer, IRound, TournamentDetails } from '@/constants/game';
import { useLayout } from '@/context/LayoutContext';
import { useUser } from '@/context/UserContext';

export default function SpecificTournamentPage() {
  const router = useRouter();
  const params = useParams<{ tournamentId: string }>();
  const { user } = useUser();
  const { hideHeaderSidebar, setHideHeaderSidebar, setHideSidebar } =
    useLayout();

  const tournamentId = params.tournamentId;
  const [tournament, setTournament] = useState<TournamentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nextMatchInfo, setNextMatchInfo] = useState<{
    gameId: string;
  } | null>(null);
  const [notInTournament, setNotInTournament] = useState<boolean>(false);
  const [winner, setWinner] = useState<IPlayer | null>(null);

  const requestDetails = useCallback(() => {
    if (user?.id && tournamentId) {
      socket.emit('requestTournamentDetails', user.id, tournamentId);
    }
  }, [tournamentId, user?.id]);

  useEffect(() => {
    if (!user?.id || !tournamentId) return;

    requestDetails();
    // if (tournamentId)
    //   socket.emit('tourn:inLoby', { userId: user.id, tournamentId });
    socket.on('tournamentDetails', (data: TournamentDetails) => {
      // console.log('got Tournament details!!: ', data);
      setTournament(data);
      setError(null);
      if (data.status == 'live') {
        setHideHeaderSidebar(true);
        setHideSidebar(true);
      }
      const match = getCurrentMatch(data, user.id);
      if (match && match.status == 'ready' && match.gameId) {
        setNextMatchInfo({ gameId: match.gameId });
      }
      if (data.winner) setWinner(data.winner);
    });

    socket.on('notInTournament', () => {
      setNotInTournament(true);
    });

    socket.on(
      'tournamentPlayerUpdate',
      (data: { userId: string; action: 'joined' | 'left'; user?: IPlayer }) => {
        setTournament((prev) => {
          if (!prev) return null;
          let newPlayers: IPlayer[] = prev.players;
          if (data.action === 'joined' && data.user) {
            newPlayers = [...prev.players, data.user];
          } else if (data.action === 'left') {
            newPlayers = prev.players.filter((player) => {
              return player.id !== data.userId;
            });
          }
          return { ...prev, players: newPlayers };
        });
      }
    );

    socket.on('bracketUpdate', (bracket: IRound[]) => {
      // console.log('got bracketUpdate!!');
      setTournament((prev) => (prev ? { ...prev, bracket: bracket } : null));
    });

    socket.on(
      'startTournament',
      (data: { tournamentId: string; bracket: IRound[] }) => {
        // console.log('Tournament started:', data.tournamentId);
        // console.log('tournament.bracket: ', data.bracket);
        setHideHeaderSidebar(true);
        setHideSidebar(true);
        setTournament((prev) =>
          prev ? { ...prev, status: 'live', bracket: data.bracket } : null
        );
        setError(null);
      }
    );

    socket.on('matchReady', (data: { gameId: string }) => {
      // console.log('matchReady, gameId: ', data.gameId);
      setNextMatchInfo({ gameId: data.gameId });
    });

    socket.on('tournamentWinner', (data: { winner: IPlayer }) => {
      // console.log('Tournament ended! Winner:', data.winner);
      setTournament((prev) => (prev ? { ...prev, status: 'completed' } : null));
      setNextMatchInfo(null);
      setWinner(data.winner);
    });

    // socket.on('leftTournamentLobby', () => {
    //   router.push('/game/tournament');
    // });

    socket.on('tournamentError', (message: string) => {
      setError(message);
    });

    socket.on('redirect', (path: string) => {
      router.push(path);
    });

    return () => {
      setHideHeaderSidebar(false);
      setHideSidebar(false);
      socket.off('tournamentDetails');
      socket.off('tournamentPlayerUpdate');
      socket.off('bracketUpdate');
      socket.off('tournamentStarted');
      socket.off('matchReady');
      socket.off('tournamentWinner');
      // socket.off('leftTournamentLobby');
      socket.off('tournamentError');
      socket.off('redirect');
      socket.off('startTournament');
      socket.off('notInTournament');
    };
  }, [user?.id, tournamentId, router, requestDetails]);

  const handleStartTournament = () => {
    if (user?.id && tournamentId) {
      socket.emit('startTournamentRequest', tournamentId, user.id);
    }
  };

  const handleLeaveLobby = () => {
    if (user?.id && tournamentId) {
      socket.emit('leaveTournamentLobby', { userId: user.id, tournamentId });
      router.replace('/game/tournament');
    }
  };

  const handleGoToMatch = () => {
    if (tournament && nextMatchInfo) {
      router.replace(
        `/game/tournament/${tournament.id}/match/${nextMatchInfo.gameId}`
      );
    }
  };

  if (notInTournament) {
    return <NotFound />;
  } else if (!tournament) {
    return (
      <div className='flex justify-center items-center min-h-[calc(100vh_-_72px)] bg-gray-900 text-white'>
        <LoadingPong />
      </div>
    );
  }

  const currentUserStatus = tournament.players.find((p) => p.id === user.id);
  // console.log('currentUser: ', currentUserStatus);
  const isPlayerEliminated = currentUserStatus?.isEliminated;
  // const isCreator = user?.id === tournament.creatorId;
  const isLobbyFull = tournament.players.length === tournament.maxPlayers;
  const isWaitingStatus = tournament.status === 'waiting';
  const isTournamentRunning = tournament.status === 'live';

  const currentUserMatch: IMatch | undefined = isTournamentRunning
    ? tournament.bracket
        .flatMap((round) => round.matches)
        .find(
          (match) =>
            (match.player1Id === user?.id || match.player2Id === user?.id) &&
            match.status === 'ready'
        )
    : undefined;

  // console.log("nextMatchInfo: ", nextMatchInfo);
  // console.log("isTournamentRunning: ", isTournamentRunning);
  // console.log("currentUserMatch: ", currentUserMatch);

  return (
    <div
      className={`${!hideHeaderSidebar ? 'min-h-[calc(100vh_-_72px)]' : 'min-h-screen'} bg-gradient-to-b from-gray-900  to-dark-blue text-white flex flex-col items-center py-4 px-1 md:py-10 md:px-4`}
    >
      <div className='w-full max-w-6xl bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700 shadow-2xl p-2 sm:p-4 md:p-8 space-y-6'>
        <h1 className='text-4xl font-extrabold text-center bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg'>
          {tournament.name || `Tournament #${tournament.id}`}
        </h1>

        <div className='flex flex-wrap justify-center gap-4 text-gray-300 text-lg'>
          <span>
            🏁 Status:{' '}
            <span className='font-bold text-aqua'>
              {tournament.status.toUpperCase()}
            </span>
          </span>
          <span>
            👥 Players: {tournament.players.length}/{tournament.maxPlayers}
          </span>
        </div>

        {error && <p className='text-red-500 text-center'>{error}</p>}

        {isPlayerEliminated && (
          <div className='text-center bg-red-800/40 border border-red-500 rounded-2xl p-6 shadow-lg'>
            <h2 className='text-2xl sm:text-3xl font-bold text-red-400 mb-2 animate-pulse'>
              You’ve been eliminated 😢
            </h2>
            <p className='text-gray-300'>Better luck next time!</p>
            <button
              onClick={handleLeaveLobby}
              className='bg-gradient-to-r from-red-600 to-red-800 hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg transition duration-300 shadow-md cursor-pointer'
            >
              Leave Lobby
            </button>
          </div>
        )}

        {isWaitingStatus && (
          <div className='flex justify-center'>
            <button
              onClick={handleLeaveLobby}
              className='bg-gradient-to-r from-red-600 to-red-800 hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg transition duration-300 shadow-md cursor-pointer'
            >
              Leave Lobby
            </button>
          </div>
        )}

        {isTournamentRunning && currentUserMatch && nextMatchInfo && (
          <div className='text-center bg-light-purple/15 border border-purple rounded-2xl p-6 shadow-lg'>
            <p className='text-xl font-semibold mb-1 text-pink'>
              Your Match is Ready!
            </p>
            <p className='text-[18px] mb-3 text-gray-400'>
              You have <strong>60s</strong> to join the match or you will be{' '}
              <b>eliminated</b>
            </p>
            <button
              onClick={handleGoToMatch}
              className='bg-gradient-to-r from-pink to-purple hover:opacity-90 text-gray-50 font-bold py-2 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-purple/40 cursor-pointer'
            >
              Go to Match
            </button>
          </div>
        )}

        {winner && (
          <div className='text-center bg-gradient-to-b from-gray-800 to-gray-700 border border-gold rounded-2xl p-6 shadow-lg mt-10 max-w-md mx-auto'>
            <div className='flex flex-col items-center'>
              <div className='text-gold text-5xl mb-3'>🏆</div>
              <h2 className='text-2xl font-bold text-gold mb-2'>
                Tournament Champion
              </h2>
              <div className='mb-4'>
                <Avatar width={120} url={winner.avatar} frame={winner.frame} />
                <div className='relative'>
                  <div className='absolute right-0 top-1/2 -translate-y-1/2'>
                    <div className='relative w-6 md:w-8 lg:w-12'>
                      <Image
                        width={48}
                        height={48}
                        src='/images/star.png'
                        alt='star'
                        className='w-full pointer-events-none'
                      />
                      <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12px] md:text-[16px] text-gray-50 font-bold drop-shadow-[0_0_2px_black]'>
                        {winner.level}
                      </span>
                    </div>
                  </div>
                  <span className='block min-w-16 sm:min-w-24 md:min-w-32 lg:min-w-40 font-bold text-[12px] sm:text-[16px] lg:text-[20px] text-left px-2 md:px-3 py-[2px] lg:py-1 rounded-[8px] bg-gray-600 mr-3 md:mr-4'>
                    {winner.username}
                  </span>
                </div>
              </div>

              <div className='w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent mb-4'></div>

              <button
                onClick={() => router.replace('/game/tournament')}
                className='bg-gradient-to-r from-pink to-purple hover:opacity-90 text-gray-50 font-bold py-2 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-purple/40 cursor-pointer'
              >
                Back to Lobby
              </button>
            </div>
          </div>
        )}

        <div>
          <h2 className='text-2xl font-bold mb-4 text-center text-gray-200'>
            Registered Players
          </h2>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
            {tournament.players.map((player) => (
              <div
                key={player.id}
                className={`bg-gray-800/70 border border-gray-700 rounded-lg px-8 py-4 flex flex-col items-center justify-center ${
                  player.isEliminated ? 'opacity-40' : ''
                }`}
              >
                <Avatar width={200} url={player.avatar} frame={player.frame} />
                <div className='relative'>
                  <div className='absolute right-0 top-1/2 -translate-y-1/2'>
                    <div className='relative w-8 md:w-12'>
                      <Image
                        width={48}
                        height={48}
                        src='/images/star.png'
                        alt='star'
                        className='w-full pointer-events-none'
                      />
                      <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12px] md:text-[16px] text-gray-50 font-bold drop-shadow-[0_0_2px_black]'>
                        {player.level}
                      </span>
                    </div>
                  </div>
                  <span className='block min-w-22 sm:min-w-24 md:min-w-32 lg:min-w-40 font-bold text-[12px] sm:text-[16px] lg:text-[20px] text-left px-2 md:px-3 py-[2px] lg:py-1 rounded-[8px] bg-gray-600 mr-3 md:mr-4'>
                    {player.username}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {tournament.bracket.length > 0 && (
          <>
            <h2 className='text-2xl font-semibold mb-4 text-center text-gray-200'>
              Bracket Progress
            </h2>
            <div className='w-full overflow-x-auto bg-gray-900/40 p-4 rounded-xl border border-gray-700 shadow-inner'>
              <div className='flex w-max space-x-8'>
                <TournamentBracket
                  bracket={tournament.bracket}
                  currentUserId={user?.id}
                  players={tournament.players}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
