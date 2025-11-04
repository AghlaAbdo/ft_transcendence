// components/game/WinByDefaultCard.tsx
'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { ArrowLeft, Trophy } from 'lucide-react';

// components/game/WinByDefaultCard.tsx

// components/game/WinByDefaultCard.tsx

// components/game/WinByDefaultCard.tsx

// components/game/WinByDefaultCard.tsx

type Props = {
  opponentName?: string | null;
  tournamentId?: string | null;
};

export default function WinByDefaultCard({
  opponentName,
  tournamentId,
}: Props) {
  const router = useRouter();

  return (
    <div className='h-[calc(100vh_-_72px)] flex justify-center items-center'>
      <div className='mx-auto max-w-lg rounded-2xl border border-gold bg-gradient-to-br from-gray-800/90 to-gray-900 p-6 shadow-lg shadow-gold/20 backdrop-blur-sm'>
        <div className='flex flex-col items-center text-center'>
          <div className='rounded-full bg-gold/10 p-4 mb-4'>
            <Trophy className='w-10 h-10 text-gold' />
          </div>

          <h3 className='text-2xl font-bold text-gold mb-2'>
            Victory by Default 🏆
          </h3>

          <p className='text-gray-300 mb-1'>
            {opponentName
              ? `${opponentName} didn’t join the match.`
              : `Your opponent didn’t join the match.`}
          </p>
          <p className='text-gray-400 mb-6'>
            You automatically advance to the next round. Great job!
          </p>

          <button
            onClick={() =>
              tournamentId
                ? router.replace(`/game/tournament/${tournamentId}`)
                : router.replace('/game/tournament')
            }
            className='inline-flex items-center gap-2 bg-gradient-to-r from-purple to-light-purple text-gray-50 font-semibold py-2.5 px-5 rounded-lg shadow-md hover:scale-[1.03] transition transform'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to Tournament
          </button>
        </div>
      </div>
    </div>
  );
}
