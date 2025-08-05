'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import {socket} from "../socket"
import Styles from "./game.module.css"
import { IGameState, GAME_WIDTH, GAME_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_RADIUS } from '../../constants/game';


export default function GamePage() {
  // const [isPlaying, setIsPlaying] = useState(false);
  const refCanvas = useRef<HTMLCanvasElement>(null);
  const pressedKeys = useRef<Set<string>>(new Set());
  const animationFrameId = useRef<number | null>(null);
  let   isPlaying = false;
  let   playerRole: "player1" | "player2";
  
  
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server!');
      console.log('Socket ID:', socket.id);
    });
    socket.on('playerRole', (msg) => {
      console.log("player role: ", msg);
      playerRole = msg;
    });
    socket.on('gameStateUpdate', (gameState: IGameState) => {
      drawGame(gameState);
    });
    window.addEventListener('keydown', keydownEvent);
    window.addEventListener('keyup', keyupEvent);
    return () => {
      window.removeEventListener('keydown', keydownEvent);
      window.removeEventListener('keyup', keyupEvent);
      if (isPlaying)
        socket.disconnect();
    };
  }, [])

  const gameLoop = ()=> {
    if (pressedKeys.current.has('ArrowUp')) {
      socket.emit('moveUp', playerRole);
    }
    else if (pressedKeys.current.has('ArrowDown')) {
      socket.emit('moveDown', playerRole);
    }
    animationFrameId.current = requestAnimationFrame(gameLoop);
  };

  const drawGame = useCallback((gameState: IGameState) => {
    const canvas: HTMLCanvasElement | null = refCanvas.current;
    if (!canvas)
      return;
    const ctx = canvas.getContext('2d');
    if (!ctx)
      return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Ball
    ctx.fillStyle = '#689B8A';
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, BALL_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
    // left paddle
    ctx.fillStyle = '#280A3E';
    ctx.fillRect(0, gameState.paddle1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    //right paddle
    ctx.fillRect(GAME_WIDTH - PADDLE_WIDTH, gameState.paddle2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    
  }, [])

  function handlePlayBtn(event: any) {
    if (isPlaying)
      return;
    socket.connect();
    console.log("Play Now");
    socket.emit("play");
    isPlaying = true;
    if (!animationFrameId.current)
      animationFrameId.current = requestAnimationFrame(gameLoop);

    if (!playerRole || playerRole === 'player1') {
      const canvas: HTMLCanvasElement | null = refCanvas.current;
      if (!canvas)
        return;
      const ctx = canvas.getContext('2d');
      if (!ctx)
       return;
      ctx.font = "48px serif";
      ctx.textAlign = "center";
      ctx.strokeText("Waiting for opponent..", GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }
  }

  function handleStopBtn() {
    console.log("stop game");
    socket.emit('stopGame');
    // setIsPlaying(false);
    isPlaying = false
    socket.disconnect();
  }

  function keydownEvent(event: KeyboardEvent) {
    event.preventDefault();
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown')
      pressedKeys.current.add(event.key);
  }

  function keyupEvent(event: KeyboardEvent) {
    event.preventDefault();
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown')
      pressedKeys.current.delete(event.key);
  }


  return (
    <>
      <button className={Styles.btn} onClick={handlePlayBtn}>Play Now</button>
      <button className={Styles.btn} onClick={handleStopBtn}>Stop Game</button>
      <div className={Styles.container}>
        <canvas ref={refCanvas} width={GAME_WIDTH} height={GAME_HEIGHT}className={Styles.canvas}></canvas>
      </div>
    </>
  );
}
