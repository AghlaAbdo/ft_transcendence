'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import Modal from '@/components/game/Modal';

import { socket } from '@/app/(protected)/lib/socket';
import { TournamentListItem } from '@/constants/game';
import { useUser } from '@/context/UserContext';

export default function TournamentLobbyPage() {
  const router = useRouter();
  const { user } = useUser();
  const [tournaments, setTournaments] = useState<TournamentListItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTournamentSize, setNewTournamentSize] = useState<number>(4);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    socket.connect();

    socket.emit('requestTournaments');

    socket.on('tournamentList', (data: TournamentListItem[]) => {
      setTournaments(data);
    });

    socket.on('tournamentListUpdate', (data: TournamentListItem[]) => {
      setTournaments(data);
    });

    socket.on('tournamentCreated', (data: { tournamentId: string }) => {
      console.log('Tournament created:', data.tournamentId);
      setIsCreateModalOpen(false);
      router.push(`/game/tournament/${data.tournamentId}`);
    });

    socket.on('tournamentJoined', (data: { tournamentId: string }) => {
      console.log('Tournament joined:', data.tournamentId);
      router.push(`/game/tournament/${data.tournamentId}`);
    });

    socket.on('tournamentError', (message: string) => {
      setError(message);
      setTimeout(() => setError(null), 5000);
    });

    socket.on('error', (message: string) => {
      setError(message);
      setTimeout(() => setError(null), 5000);
    });

    return () => {
      socket.off('tournamentList');
      socket.off('tournamentListUpdate');
      socket.off('tournamentCreated');
      socket.off('tournamentJoined');
      socket.off('tournamentError');
      socket.off('error');
    };
  }, [router, user.id]);

  const handleCreateTournament = () => {
    if (user && user.id) {
      socket.emit('createTournament', user.id, newTournamentSize);
    }
  };

  const handleJoinTournament = (tournamentId: string) => {
    if (user && user.id) {
      socket.emit('joinTournament', user.id, tournamentId);
    }
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewTournamentSize(Number(e.target.value));
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white'>
      <h1 className='text-4xl font-bold mb-8 text-pink-500'>Tournaments</h1>

      {error && <p className='text-red-500 mb-4'>{error}</p>}

      <button
        onClick={() => setIsCreateModalOpen(true)}
        className='cursor-pointer bg-purple  text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 mb-8'
      >
        Create New Tournament
      </button>

      <h2 className='text-2xl font-semibold mb-6 text-gray-300'>
        Available Tournaments
      </h2>

      {tournaments.length === 0 ? (
        <p className='text-gray-400'>
          No tournaments available. Be the first to create one!
        </p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl'>
          {tournaments.map((t) => (
            <div
              key={t.id}
              className='bg-gray-800 rounded-lg shadow-md p-6 border border-purple-600 flex flex-col justify-between'
            >
              <div>
                <h3 className='text-xl font-semibold mb-2 text-purple-400'>
                  Tournament {t.id}
                </h3>
                <p className='text-gray-300'>Creator: {t.creatorUsername}</p>
                <p className='text-gray-300'>
                  Players: {t.currentPlayers} / {t.maxPlayers}
                </p>
                <p className='text-gray-300'>Status: {t.status}</p>
              </div>
              <button
                onClick={() => handleJoinTournament(t.id)}
                disabled={
                  t.currentPlayers >= t.maxPlayers || t.status !== 'waiting'
                }
                className='mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Join Tournament
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <h2 className='text-2xl font-bold mb-4 text-white'>
          Create New Tournament
        </h2>
        <div className='mb-4'>
          <label
            htmlFor='players'
            className='block text-lg font-medium text-gray-300 mb-2'
          >
            Number of Players:
          </label>
          <select
            id='players'
            value={newTournamentSize}
            onChange={handleSizeChange}
            className='block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-pink-500 focus:border-pink-500'
          >
            {[4, 8, 16, 32].map((size) => (
              <option key={size} value={size}>
                {size} Players
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCreateTournament}
          className='bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-md transition duration-300'
        >
          Create
        </button>
      </Modal>
    </div>
  );
}
