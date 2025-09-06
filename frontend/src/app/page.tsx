'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { socket } from './lib/socket';

export default function Home() {
  useEffect(() => {
    // const socket = io("http://127.0.0.1:4000");
    socket.connect();

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server!');
      console.log('Socket ID:', socket.id);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <Link
        className='border-2 border-black-500 p-4 p bg-green-200'
        href='/game'
      >
        Play Game
      </Link>
    </div>
  );
}
