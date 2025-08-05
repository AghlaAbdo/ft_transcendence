'use client'

import { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import {socket} from "./socket"
import Link from 'next/link'

export default function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // const socket = io("http://127.0.0.1:4000");
    socket.connect();

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server!');
      console.log('Socket ID:', socket.id);
    });
    socket.on('messageee', (msg) => {
      setMessage(msg);
    })
    return () => {
      socket.disconnect();
    }
  }, [])

  function handleSubmit(event: any) {
    event.preventDefault();
    socket.emit("message", message);
    setMessage('');
  }

  return (
    <div>
      <Link className='border-2 border-black-500 p-4 p bg-green-200' href="/game">Play Game</Link>
    </div>
  );
}
