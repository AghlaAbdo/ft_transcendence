'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import AlreadyInGame from '@/components/game/AlreadyInGame';
import Modal from '@/components/game/Modal';

import { socket } from '@/app/(protected)/lib/socket';
import { TournamentListItem } from '@/constants/game';
import { useLayout } from '@/context/LayoutContext';
import { useUser } from '@/context/UserContext';

export default function TournamentLobbyPage() {
  const router = useRouter();
  const { user } = useUser();
  const [tournaments, setTournaments] = useState<TournamentListItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTournamentSize, setNewTournamentSize] = useState<number>(4);
  const [error, setError] = useState<string | null>(null);
  const [tournamentName, setTournamentName] = useState<string>('');
  const [showError, setShowError] = useState(false);
  const { hideHeaderSidebar } = useLayout();
  const [inAnotherGame, setInAnotherGame] = useState<boolean>(false);

  useEffect(() => {
    socket.emit('requestTournaments', { userId: user.id });

    socket.on('tournamentList', (data: TournamentListItem[]) => {
      setTournaments(data);
    });

    socket.on('inAnotherGame', () => {
      setInAnotherGame(true);
    });

    socket.on('inTournament', (data: { tournamentId: string }) => {
      router.replace(`/game/tournament/${data.tournamentId}`);
    });

    socket.on('tournamentListUpdate', (data: TournamentListItem[]) => {
      setTournaments(data);
    });

    socket.on('tournamentCreated', (data: { tournamentId: string }) => {
      // console.log('Tournament created:', data.tournamentId);
      setIsCreateModalOpen(false);
      router.push(`/game/tournament/${data.tournamentId}`);
    });

    socket.on('tournamentJoined', (data: { tournamentId: string }) => {
      // console.log('Tournament joined:', data.tournamentId);
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
    setShowError(true);

    if (!tournamentName.trim()) {
      return;
    }
    if (user && user.id) {
      socket.emit(
        'createTournament',
        user.id,
        newTournamentSize,
        tournamentName.trim()
      );
      setTournamentName('');
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

  if (inAnotherGame) return <AlreadyInGame />;

  return (
    <div
      className={`${!hideHeaderSidebar ? 'min-h-[calc(100vh_-_72px)]' : 'min-h-screen'} bg-gradient-to-b from-gray-900  to-dark-blue text-white flex flex-col items-center py-12 px-4`}
    >
      <h1 className='text-5xl font-extrabold mb-8 bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text drop-shadow-md'>
        Tournament Lobby
      </h1>

      {error && (
        <p className='text-red-400 mb-4 text-lg font-medium animate-pulse'>
          {error}
        </p>
      )}

      <button
        onClick={() => setIsCreateModalOpen(true)}
        className='group relative overflow-hidden bg-purple hover:bg-light-purple text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all duration-300 mb-12 cursor-pointer'
      >
        <span className='relative z-10'>Create Tournament</span>
        <div className='absolute inset-0 bg-gradient-to-r from-pink-600 to-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
      </button>

      <div className='w-full max-w-6xl'>
        <h2 className='text-2xl font-semibold mb-6 text-gray-300 text-center uppercase tracking-wide'>
          Available Tournaments
        </h2>

        {tournaments.length === 0 ? (
          <p className='text-gray-400 text-center text-lg'>
            No tournaments yet — start the first one!
          </p>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
            {tournaments.map((t) => (
              <div
                key={t.id}
                className='relative bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 flex flex-col justify-between shadow-xl hover:shadow-purple-500/20 transition-all duration-300'
              >
                <div>
                  <h3 className='text-xl font-bold mb-2 text-light-purple'>
                    {t.name}
                  </h3>
                  <p className='text-gray-300 mb-1'>👤 {t.creatorUsername}</p>
                  <p className='text-gray-400 mb-1'>
                    Players: {t.currentPlayers} / {t.maxPlayers}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      t.status === 'waiting'
                        ? 'text-yellow-400'
                        : t.status === 'live'
                          ? 'text-aqua'
                          : 'text-gray-400'
                    }`}
                  >
                    Status: {t.status.toUpperCase()}
                  </p>
                </div>

                <button
                  onClick={() => handleJoinTournament(t.id)}
                  disabled={
                    t.currentPlayers >= t.maxPlayers || t.status !== 'waiting'
                  }
                  className='mt-6 bg-gradient-to-r from-purple to-pink hover:from-pink-500 hover:to-purple-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed'
                >
                  Join Tournament
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <h2 className='text-2xl font-bold mb-4 text-white text-center'>
          Create New Tournament
        </h2>

        <div className='space-y-4'>
          <div>
            <label
              htmlFor='tournamentName'
              className='block text-lg font-medium text-gray-300 mb-2'
            >
              Tournament Name
            </label>
            <input
              type='text'
              id='tournamentName'
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              placeholder='Enter tournament name'
              className='w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-pink-500 focus:border-pink-500'
            />
            {showError && !tournamentName.trim() && (
              <p className='text-red-500 text-sm mt-1'>
                Tournament name is required.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='players'
              className='block text-lg font-medium text-gray-300 mb-2'
            >
              Number of Players
            </label>
            <select
              id='players'
              value={newTournamentSize}
              onChange={handleSizeChange}
              className='w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-pink-500 focus:border-pink-500'
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
            className='w-full bg-gradient-to-r from-pink-600 to-purple hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300'
          >
            Create Tournament
          </button>
        </div>
      </Modal>
    </div>
  );
}
