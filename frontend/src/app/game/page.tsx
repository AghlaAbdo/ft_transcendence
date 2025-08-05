'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import {socket} from "../socket"
import Styles from "./game.module.css"

const GAME_WIDTH = 900;
const GAME_HEIGHT = 600;
const PADDLE_HEIGHT = 150;
const PADDLE_WIDTH = 30;
const BALL_RADIUS = 20;

interface IBall {
    x: number,
    y: number,
    dx: number,
    dy: number,
    radius: number
}

interface IPaddle {
    y: number,
    height: number,
    width: number,
    score: number
}


interface IGameState {
    ball: IBall,
    paddle1: IPaddle,
    paddle2: IPaddle,
    status: 'waiting' | 'playing' | 'ended'
    players: { [socketId: string]: 'player1' | 'player2' | 'spectator' },
    playersNb: number
}

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const refCanvas = useRef<HTMLCanvasElement>(null);

  const drawGame = useCallback((gameState: IGameState) => {
    const canvas: HTMLCanvasElement | null = refCanvas.current;
    if (!canvas)
      return;
    const ctx = canvas.getContext('2d');
    if (!ctx)
      return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = '#280A3E';
    ctx.fillRect(0, 50, PADDLE_WIDTH, PADDLE_HEIGHT);

    ctx.fillStyle = '#689B8A';
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, BALL_RADIUS, 0, 2 * Math.PI);
    ctx.fill();



    
  }, [])

  useEffect(() => {

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server!');
      console.log('Socket ID:', socket.id);
    });

    socket.on('playerRole', (msg) => {
      console.log("player role: ", msg);
    });

    socket.on('gameStateUpdate', (gameState: IGameState) => {
      drawGame(gameState);
      // console.log("game state: ", gameState);
    });



    return () => {
      if (isPlaying)
        socket.disconnect();
    }
  }, [])

  function handleBtnClick(event: any) {
    if (isPlaying)
      return;
    socket.connect();
    console.log("Play Now");
    socket.emit("play");
    setIsPlaying(true);
  }

  return (
    <>
      <button className={Styles.btn} onClick={handleBtnClick}>Play Now</button>
      <div className={Styles.container}>
        <canvas ref={refCanvas} width={GAME_WIDTH} height={GAME_HEIGHT}className={Styles.canvas}></canvas>
      </div>
    </>
  );
}
