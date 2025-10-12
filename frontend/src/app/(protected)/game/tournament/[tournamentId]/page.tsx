'use client';

import { useCallback, useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import Modal from '@/components/game/Modal';
import TournamentBracket from '@/components/game/TournamentBracket';

import { socket } from '@/app/(protected)/lib/socket';
import { IMatch, IPlayer, IRound, TournamentDetails } from '@/constants/game';
import { useLayout } from '@/context/LayoutContext';
import { useUser } from '@/context/UserContext';

export default function SpecificTournamentPage() {
  const router = useRouter();
  const params = useParams<{ tournamentId: string }>();
  const { user } = useUser();
  const { setHideHeaderSidebar } = useLayout();

  const tournamentId = params.tournamentId;
  const [tournament, setTournament] = useState<TournamentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nextMatchInfo, setNextMatchInfo] = useState<{
    gameId: string;
    opponent: IPlayer;
  } | null>(null);

  const requestDetails = useCallback(() => {
    if (user?.id && tournamentId) {
      socket.emit('requestTournamentDetails', user.id, tournamentId);
    }
  }, [tournamentId, user?.id]);

  useEffect(() => {
    if (!user?.id || !tournamentId) return;

    requestDetails();
    if (tournamentId)
      socket.emit('tourn:inLoby', {tournamentId});
    socket.on('tournamentDetails', (data: TournamentDetails) => {
      console.log('got Tournament details!!');
      setTournament(data);
      setError(null);
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
      setTournament((prev) => (prev ? { ...prev, bracket: bracket } : null));
    });

    socket.on(
      'startTournament',
      (data: { tournamentId: string; bracket: IRound[] }) => {
        console.log('Tournament started:', data.tournamentId);
        console.log('tournament.bracket: ', data.bracket);
        setHideHeaderSidebar(true);
        setTournament((prev) =>
          prev ? { ...prev, status: 'running', bracket: data.bracket } : null
        );
        setError(null);
      }
    );

    socket.on('matchReady', (data: {gameId: string, opponent: IPlayer})=> {
      console.log("Your match is ready! You have 60s to join the game");
      setNextMatchInfo({ gameId: data.gameId, opponent: data.opponent })
    });

    // socket.on(
    //   'matchReady',
    //   (data: { gameId: string; tournamentId: string; opponent: IPlayer }) => {
    //     console.log('Match Ready! Navigating to game:', data.gameId);
    //     setTimeout(()=> {
    //       console.log("set next match info!!");
    //       setNextMatchInfo({ gameId: data.gameId, opponent: data.opponent })
    //     }, 5000);
        
    //     router.push(
    //       `/game/tournament/${data.tournamentId}/match/${data.gameId}`
    //     );
    //   }
    // );

    socket.on(
      'tournamentWinner',
      (data: { winnerId: string; message: string }) => {
        console.log('Tournament ended! Winner:', data.winnerId);
        setTournament((prev) => (prev ? { ...prev, status: 'ended' } : null));
        setNextMatchInfo(null);
      }
    );

    socket.on('leftTournamentLobby', () => {
      router.push('/game/tournament');
    });

    socket.on('tournamentError', (message: string) => {
      setError(message);
    });

    socket.on('redirect', (path: string) => {
      router.push(path);
    });

    return () => {
      socket.off('tournamentDetails');
      socket.off('tournamentPlayerUpdate');
      socket.off('bracketUpdate');
      socket.off('tournamentStarted');
      socket.off('matchReady');
      socket.off('tournamentWinner');
      socket.off('leftTournamentLobby');
      socket.off('tournamentError');
      socket.off('redirect');
      // socket.emit('leaveTournamentLobby', user.id, tournamentId);
    };
  }, [user?.id, tournamentId, router, requestDetails]);

  const handleStartTournament = () => {
    if (user?.id && tournamentId) {
      socket.emit('startTournamentRequest', tournamentId, user.id);
    }
  };

  const handleLeaveLobby = () => {
    if (user?.id && tournamentId) {
      socket.emit('leaveTournamentLobby', user.id, tournamentId);
    }
  };

  const handleGoToMatch = () => {
    if (tournament && nextMatchInfo) {
      router.push(`/game/tournament/${tournament.id}/match/${nextMatchInfo.gameId}`);
    }
  };

  if (!tournament) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-gray-900 text-white'>
        Loading Tournament...
      </div>
    );
  }

  const isCreator = user?.id === tournament.creatorId;
  const isPlayerRegistered = tournament.players.some((p) => p.id === user?.id);
  const isLobbyFull = tournament.players.length === tournament.maxPlayers;
  const isWaitingStatus = tournament.status === 'waiting';
  const isTournamentRunning = tournament.status === 'running';

  const currentUserMatch: IMatch | undefined = isTournamentRunning
    ? tournament.bracket
        .flatMap((round) => round.matches)
        .find(
          (match) =>
            (match.player1Id === user?.id || match.player2Id === user?.id) &&
            match.status === 'ready'
        )
    : undefined;

  return (
    <div className='flex flex-col items-center p-8 bg-gray-900 text-white min-h-screen'>
      <h1 className='text-4xl font-bold mb-4 text-pink-500'>
        Tournament: {tournament.id}
      </h1>
      <p className='text-lg mb-2 text-gray-300'>
        Status: {tournament.status.toUpperCase()}
      </p>
      <p className='text-lg mb-4 text-gray-300'>
        Players: {tournament.players.length} / {tournament.maxPlayers}
      </p>

      {error && <p className='text-red-500 mb-4'>{error}</p>}

      {isWaitingStatus && isCreator && !isLobbyFull && (
        <p className='text-yellow-400 mb-4'>
          Waiting for {tournament.maxPlayers - tournament.players.length} more
          players...
        </p>
      )}

      {isWaitingStatus && isCreator && isLobbyFull && (
        <button
          onClick={handleStartTournament}
          className='bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 mb-6'
        >
          Start Tournament
        </button>
      )}

      {isWaitingStatus && !isCreator && isPlayerRegistered && (
        <button
          onClick={handleLeaveLobby}
          className='bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 mb-6'
        >
          Leave Lobby
        </button>
      )}

      {isTournamentRunning && currentUserMatch && nextMatchInfo && (
        <div className='bg-blue-800 p-4 rounded-lg shadow-md mb-6'>
          <p className='text-xl font-semibold text-blue-200 mb-2'>
            Your Match is Ready!
          </p>
          <button
            onClick={handleGoToMatch}
            className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300'
          >
            Go to Match
          </button>
        </div>
      )}

      {isTournamentRunning && !currentUserMatch && isPlayerRegistered && (
        <p className='text-xl text-blue-300 mb-6'>
          Waiting for your next match to be ready...
        </p>
      )}

      {!isPlayerRegistered && tournament.status === 'running' && (
        <p className='text-xl text-gray-400 mb-6'>
          Tournament is running. Spectator mode or you've been eliminated.
        </p>
      )}

      <h2 className='text-2xl font-semibold mb-4 text-gray-300'>
        Registered Players ({tournament.players.length}/{tournament.maxPlayers})
      </h2>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-4xl mb-8'>
        {tournament.players.map((player) => (
          <div
            key={player.id}
            className='bg-gray-800 p-3 rounded-md flex items-center justify-center text-center'
          >
            <p className='font-medium text-lg'>{player.username}</p>
            {player.id === tournament.creatorId && (
              <span className='ml-2 text-yellow-500 text-sm'>(Creator)</span>
            )}
          </div>
        ))}
      </div>

      {tournament.bracket.length > 0 && (
        <>
          <h2 className='text-2xl font-semibold mb-4 text-gray-300'>
            Tournament Bracket
          </h2>
          <div className='w-full overflow-x-auto p-4 bg-gray-800 rounded-lg shadow-lg'>
            <TournamentBracket
              bracket={tournament.bracket}
              currentUserId={user?.id}
              players={tournament.players}
            />
          </div>
        </>
      )}
    </div>
  );
}
