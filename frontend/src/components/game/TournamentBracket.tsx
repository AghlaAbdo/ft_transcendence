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
}> = ({ match, currentUserId, players }) => {
  const getPlayerDisplay = (playerId: string | null) => {
    if (!playerId) return 'TBD';
    const isCurrentUser = currentUserId && playerId === currentUserId;
    return (
      <span
        className={isCurrentUser ? 'font-bold text-pink-400' : 'text-gray-200'}
      >
        {isCurrentUser
          ? 'You'
          : players.find((p) => p.id === playerId)?.username}
        {match.winnerId === playerId && ' (W)'}
      </span>
    );
  };

  const getMatchStatusColor = (status: IMatch['status']) => {
    switch (status) {
      case 'pending':
        return 'border-gray-500';
      case 'ready':
        return 'border-blue-500';
      case 'playing':
        return 'border-yellow-500';
      case 'completed':
        return 'border-green-500';
      default:
        return 'border-gray-600';
    }
  };

  return (
    <div
      className={`flex flex-col border rounded-md p-2 my-2 w-48 bg-gray-700 ${getMatchStatusColor(match.status)}`}
    >
      <div className='flex justify-between items-center text-sm mb-1'>
        <span className='text-gray-400'>Match ID:</span>
        <span className='font-mono text-xs text-gray-400'>
          {match.id.slice(0, 8)}
        </span>
      </div>
      <div
        className={`flex justify-between p-1 rounded-sm ${match.winnerId === match.player1Id ? 'bg-green-900 bg-opacity-30' : 'bg-gray-800'}`}
      >
        {getPlayerDisplay(match.player1Id)}
      </div>
      <div className='text-center text-xs text-gray-400'>vs</div>
      <div
        className={`flex justify-between p-1 rounded-sm ${match.winnerId === match.player2Id ? 'bg-green-900 bg-opacity-30' : 'bg-gray-800'}`}
      >
        {getPlayerDisplay(match.player2Id)}
      </div>
      <div className='text-xs text-gray-400 mt-1 text-right'>
        Status: {match.status}
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
    <div className='flex justify-center items-start space-x-8 min-w-max'>
      {bracket.map((round) => (
        <div key={round.roundNumber} className='flex flex-col items-center'>
          <h3 className='text-xl font-semibold mb-4 text-purple-300'>
            Round {round.roundNumber}
          </h3>
          <div className='flex flex-col space-y-4'>
            {round.matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                currentUserId={currentUserId}
                players={players}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TournamentBracket;
