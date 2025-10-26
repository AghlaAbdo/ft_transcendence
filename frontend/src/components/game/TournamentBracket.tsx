import React from 'react';

import { IPlayer } from '@/constants/game';
import { IMatch, IRound } from '@/constants/game';

interface TournamentBracketProps {
  bracket: IRound[];
  currentUserId: string;
  players: IPlayer[];
}

const MatchCard: React.FC<{
  match: IMatch;
  currentUserId?: string;
  players: IPlayer[];
  roundNumber: number;
}> = ({ match, currentUserId, players, roundNumber }) => {
  const getPlayerDisplay = (playerId: string | null) => {
    if (!playerId) return <span className='text-gray-500 italic'>TBD</span>;
    const isCurrentUser = currentUserId && playerId === currentUserId;
    const playerName = isCurrentUser
      ? 'You'
      : players.find((p) => p.id === playerId)?.username || 'Unknown';
    const isWinner = match.winnerId === playerId;

    return (
      <span
        className={`${
          isCurrentUser ? 'text-pink font-semibold' : 'text-gray-200'
        } ${isWinner ? 'text-gold' : ''}`}
      >
        {playerName}
        {isWinner && ' 🏆'}
      </span>
    );
  };

  const getMatchBorder = (status: IMatch['status']) => {
    switch (status) {
      case 'pending':
        return 'border-gray-500/60';
      case 'ready':
        return 'border-aqua';
      case 'playing':
        return 'border-purple';
      case 'completed':
        return 'border-green';
      default:
        return 'border-gray-700';
    }
  };

  return (
    <div
      className={`relative flex flex-col bg-gray-800/80 border ${getMatchBorder(
        match.status
      )} rounded-xl p-2 w-52 shadow-md hover:shadow-purple/40 transition-all`}
    >
      <div className='flex justify-between text-xs text-gray-400 mb-2'>
        <span>Round:</span>
        <span className='font-mono'>{roundNumber}</span>
      </div>

      <div
        className={`p-2 rounded-md mb-1 ${
          match.winnerId === match.player1Id
            ? 'bg-green/10 border border-green/50'
            : 'bg-gray-700/60'
        }`}
      >
        {getPlayerDisplay(match.player1Id)}
      </div>

      <div className='text-center text-gray-500 text-sm'>vs</div>

      <div
        className={`p-2 rounded-md mt-1 ${
          match.winnerId === match.player2Id
            ? 'bg-green/10 border border-green/50'
            : 'bg-gray-700/60'
        }`}
      >
        {getPlayerDisplay(match.player2Id)}
      </div>

      <div className='flex justify-between text-xs text-gray-400 mt-2'>
        <span>Status:</span>
        <span className='font-mono'>{match.status}</span>
      </div>
    </div>
  );
};

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  bracket,
  currentUserId,
  players,
}) => {
  return (
    <div className='flex w-full justify-center'>
      <div className='flex items-stretch w-fit gap-8'>
        {bracket.map((round) => (
          <div
            key={round.roundNumber}
            className='flex w-fit flex-col justify-center items-center flex-1'
          >
            <div className='flex flex-col h-full justify-around space-y-4'>
              {round.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  roundNumber={round.roundNumber}
                  currentUserId={currentUserId}
                  players={players}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentBracket;
