'use client';

import { useParams, useRouter } from 'next/navigation';

import { socket } from '@/app/(protected)/lib/socket';
import { useLayout } from '@/context/LayoutContext';
import { useUser } from '@/context/UserContext';

interface MatchPageParams extends Record<string, string> {
  tournamentId: string;
  gameId: string;
}

export default function CloseGameDialog({
  dialogRef,
  gameId,
  isTournamentGame,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  gameId: string | null;
  isTournamentGame: boolean;
}) {
  const { user } = useUser();
  const router = useRouter();
  const { setHideHeaderSidebar } = useLayout();
  const params = useParams<MatchPageParams>();

  function handleCancel() {
    dialogRef.current?.close();
  }
  function handleQuit() {
    socket.emit('quit', gameId, user.id);
    setHideHeaderSidebar(false);
    if (isTournamentGame)
      router.push(`/game/tournament/${params.tournamentId}`);
    else router.push('/game');
  }
  return (
    <dialog
      ref={dialogRef}
      className='mx-auto my-auto bg-dark-blue rounded-[8px] border-[1px] border-gray-700 pt-4 pb-2 px-6'
    >
      <div className='mb-6'>
        <p className='text-2xl text-gold text-center font-bold'>
          Are you sure you want to quit?
        </p>
        <p className='text-[16px] text-gray-200 text-center '>
          You will lose this game!
        </p>
      </div>
      <div className='flex justify-between'>
        <button
          onClick={handleCancel}
          className='w-full max-w-[88px] bg-green px-3 py-[2px] rounded-[8px] text-[18px] text-gray-50 font-bold cursor-pointer'
        >
          Cancel
        </button>
        <button
          onClick={handleQuit}
          className='w-full max-w-[88px] bg-red px-3 py-[2px] rounded-[8px] text-[18px] text-gray-50 font-bold cursor-pointer'
        >
          Quit
        </button>
      </div>
    </dialog>
  );
}
