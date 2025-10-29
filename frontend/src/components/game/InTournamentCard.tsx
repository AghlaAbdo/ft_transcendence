'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { Trophy } from 'lucide-react';

type Props = {
  tournamentId: string;
};

export default function TournamentRegisteredCard({ tournamentId }: Props) {
  const router = useRouter();

  return (
    <div className='h-[calc(100vh_-_72px)] flex justify-center items-center'>
      <div className='mx-auto max-w-xl rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800 to-dark-blue p-6 shadow-lg shadow-purple/20 backdrop-blur-sm'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex flex-col justify-center items-center gap-3 text-center'>
            <div className='rounded-full w-fit bg-gradient-to-br from-gold/30 to-gold/10 p-3'>
              <Trophy className='w-6 h-6 text-gold' />
            </div>
            <div>
              <h3 className='text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-pink'>
                Already Registered
              </h3>
              <p className='text-sm text-gray-500'>
                You are already registered in a tournament
              </p>
              <p className='text-sm text-gray-200 my-2'>
                You can head to the tournament lobby to check brackets, matches,
                and live updates.
              </p>
            </div>
          </div>
        </div>

        <div className='flex justify-between gap-3 mt-3'>
          <button
            onClick={() => router.replace(`/game/tournament/${tournamentId}`)}
            className='group relative overflow-hidden bg-purple hover:bg-light-purple text-white font-semibold py-2 px-4 rounded-xl shadow-lg transition-all duration-300  cursor-pointer'
          >
            <span className='relative z-10'>Go to Tournament</span>
            <div className='absolute inset-0 bg-gradient-to-r from-pink-600 to-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
          </button>

          <button
            onClick={() => router.replace('/game')}
            className='py-2 px-4 rounded-xl border border-gray-700 text-gray-200 bg-gray-700/40 hover:bg-gray-700/70 transition cursor-pointer'
          >
            Return
          </button>
        </div>
      </div>
    </div>
  );
}
