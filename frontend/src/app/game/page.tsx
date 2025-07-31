'use client'

import { useState, useEffect, useRef } from 'react';
import {socket} from "../socket"
import Styles from "./game.module.css"

export default function Home() {
  const [message, setMessage] = useState('');
  const refCanvas = useRef(null);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server!');
      console.log('Socket ID:', socket.id);
    });
    socket.on('messageee', (msg) => {
      setMessage(msg);
    })

    const canvas = refCanvas.current;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 50, 50, 200);

    return () => {
      socket.disconnect();
    }
  }, [])

  function handleSubmit(event: any) {
    event.preventDefault();
    socket.emit("message", message);
    setMessage('');
  }
  const canvasStyle  = {
    backgroundColor: "gray",

  }

  return (
    <div className={Styles.container}>
      <canvas ref={refCanvas} width="900px" height="600px" className={Styles.canvas}></canvas>
    </div>
  );
}
