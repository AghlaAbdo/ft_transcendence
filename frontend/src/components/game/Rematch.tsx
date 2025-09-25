import { useEffect, useState } from 'react';

import Link from 'next/link';
import { redirect } from 'next/navigation';

import { motion } from 'framer-motion';

import { socket } from '@/app/(protected)/lib/socket';
import { useLayout } from '@/context/LayoutContext';

export default function Rematch({
  rematch,
  setRematch,
  gameId,
  playerRole,
  dialogRef,
}: {
  rematch: string[];
  setRematch: React.Dispatch<React.SetStateAction<string[]>>;
  gameId: string | null;
  playerRole: 'player1' | 'player2' | null;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
}) {
  const { setHideHeaderSidebar } = useLayout();

  useEffect(() => {
    socket.on('rematch', () => {
      console.log('Opponent wants to play again');
      setRematch((prev) => [...prev, 'recived']);
    });
    socket.on('opponentQuit', () => {
      console.log('Opponent quit!');
      setRematch((prev) => [...prev, 'rejected']);
    });
    socket.on('playAgain', () => {
      dialogRef.current?.close();
      setRematch([]);
    });
    return () => {
      setHideHeaderSidebar(false);
    };
  }, []);

  const handleRematch = () => {
    console.log('rematch!!');
    setRematch((prev) => [...prev, 'sent']);
    socket.emit('rematch', gameId, playerRole);
  };

  const handleReturn = () => {
    setRematch((prev) => [...prev, 'quit']);
    socket.emit('quit', gameId);
    setTimeout(() => redirect('/game'), 1000);
  };

  if (rematch.includes('quit')) return <div></div>;
  return (
    <>
      {!rematch.length && (
        <>
          <button
            onClick={handleRematch}
            className='w-full max-w-24 md:max-w-30 text-center bg-green py-[2px] 500:py-1 px-1 500:px-2 rounded-[8px] text-[14px] 500:text-[20px] text-gray-50 font-bold cursor-pointer'
          >
            Rematch
          </button>
          <button
            onClick={handleReturn}
            className='w-full max-w-30 text-center bg-red py-[2px] 500:py-1 px-1 500:px-2 rounded-[8px] text-[14px] 500:text-[20px] text-gray-50 font-bold cursor-pointer'
          >
            Return
          </button>
        </>
      )}
      {rematch.includes('recived') && !rematch.includes('sent') && (
        <>
          <button
            onClick={handleRematch}
            className='w-full max-w-30 text-center bg-green py-[2px] 500:py-1 px-1 500:px-2 rounded-[8px] text-[14px] 500:text-[20px] text-gray-50 font-bold cursor-pointer'
          >
            Rematch
          </button>
          <button
            onClick={handleReturn}
            className='w-full max-w-30 text-center bg-red py-[2px] 500:py-1 px-1 500:px-2 rounded-[8px] text-[14px] 500:text-[20px] text-gray-50 font-bold cursor-pointer'
          >
            Return
          </button>
        </>
      )}
      {rematch.includes('sent') &&
        !rematch.includes('recived') &&
        !rematch.includes('rejected') && (
          <>
            <button
              onClick={handleReturn}
              className='w-full max-w-30 text-center bg-red py-[2px] 500:py-1 px-1 500:px-2 rounded-[8px] text-[14px] 500:text-[20px] text-gray-50 font-bold cursor-pointer'
            >
              Return
            </button>
          </>
        )}
      {rematch.includes('sent') && rematch.includes('recived') && (
        <>
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className='text-3xl text-gold text-center font-bold'
          >
            Challenge Accpeted!
          </motion.span>
        </>
      )}
      {rematch.includes('rejected') && (
        <>
          <button
            onClick={handleReturn}
            className='w-full max-w-30 text-center bg-red py-[2px] 500:py-1 px-1 500:px-2 rounded-[8px] text-[14px] 500:text-[20px] text-gray-50 font-bold cursor-pointer'
          >
            Return
          </button>
        </>
      )}
    </>
  );
}
