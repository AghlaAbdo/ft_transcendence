import { useCallback, useEffect, useRef } from 'react';

import { socket } from '@/app/lib/socket';
import {
  BALL_RADIUS,
  GAME_HEIGHT,
  GAME_WIDTH,
  IGameState,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
} from '@/constants/game';

interface returnType {
  handlePlayBtn: () => void;
  handleStopBtn: () => void;
  refCanvas: React.RefObject<HTMLCanvasElement | null>;
}

export const usePongGameLogic = (): returnType => {
  const refCanvas = useRef<HTMLCanvasElement>(null);
  const pressedKeys = useRef<Set<string>>(new Set());
  const animationFrameId = useRef<number | null>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const gameId = useRef<string>(null);
  const isPlaying = useRef<boolean>(false);
  const playerRole = useRef<'player1' | 'player2'>(null);

  const clearCanvas = useCallback((ctx: CanvasRenderingContext2D | null) => {
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }, []);

  const drawWaiting = useCallback((ctx: CanvasRenderingContext2D | null) => {
    if (!ctx) return;
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.strokeText('Waiting for opponent..', GAME_WIDTH / 2, GAME_HEIGHT / 2);
  }, []);

  const drawGame = useCallback(
    (gameState: IGameState) => {
      if (!ctx.current) return;
      clearCanvas(ctx.current);
      // Score
      ctx.current.font = '48px serif';
      ctx.current.textAlign = 'center';
      ctx.current.fillText(
        gameState.leftPaddle.score + ' | ' + gameState.rightPaddle.score,
        GAME_WIDTH / 2,
        80
      );
      // Ball
      ctx.current.fillStyle = '#689B8A';
      ctx.current.beginPath();
      ctx.current.arc(
        gameState.ball.x,
        gameState.ball.y,
        BALL_RADIUS,
        0,
        2 * Math.PI
      );
      ctx.current.fill();
      // left paddle
      ctx.current.fillStyle = '#280A3E';
      ctx.current.fillRect(
        0,
        gameState.leftPaddle.y,
        PADDLE_WIDTH,
        PADDLE_HEIGHT
      );
      //right paddle
      ctx.current.fillRect(
        GAME_WIDTH - PADDLE_WIDTH,
        gameState.rightPaddle.y,
        PADDLE_WIDTH,
        PADDLE_HEIGHT
      );
      if (gameState.status === 'ended') {
        ctx.current.font = '48px serif';
        ctx.current.textAlign = 'center';
        ctx.current.strokeText(
          gameState.winner === playerRole.current ? 'You Won' : 'You Lost',
          GAME_WIDTH / 2,
          GAME_HEIGHT / 2
        );
        return;
      }
    },
    [clearCanvas]
  );

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server!');
      console.log('Socket ID:', socket.id);
    });
    socket.on('playerRole', (msg) => {
      console.log('player role: ', msg);
      playerRole.current = msg;
    });
    socket.on('startGame', (id) => {
      isPlaying.current = true;
      gameId.current = id;
    });
    socket.on('gameStateUpdate', (gameState: IGameState) => {
      drawGame(gameState);
    });
    socket.on('gameOver', () => {
      isPlaying.current = false;
    });
    const canvas: HTMLCanvasElement | null = refCanvas.current;
    if (canvas) ctx.current = canvas.getContext('2d');
    window.addEventListener('keydown', keydownEvent);
    window.addEventListener('keyup', keyupEvent);
    return () => {
      window.removeEventListener('keydown', keydownEvent);
      window.removeEventListener('keyup', keyupEvent);
      socket.disconnect();
    };
  }, [drawGame]);

  const gameLoop = () => {
    if (pressedKeys.current.has('ArrowUp')) {
      socket.emit('movePaddle', gameId.current, playerRole.current, 'up');
    } else if (pressedKeys.current.has('ArrowDown')) {
      socket.emit('movePaddle', gameId.current, playerRole.current, 'down');
    }
    animationFrameId.current = requestAnimationFrame(gameLoop);
  };

  function handlePlayBtn() {
    if (isPlaying.current) return;
    // socket.connect();
    console.log('Play Now');
    socket.emit('play');
    clearCanvas(ctx.current);
    drawWaiting(ctx.current);
    isPlaying.current = true;
    if (!animationFrameId.current)
      animationFrameId.current = requestAnimationFrame(gameLoop);
  }

  function handleStopBtn() {
    console.log('stop game');
    socket.emit('stopGame');
    isPlaying.current = false;
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

  return {
    handlePlayBtn,
    handleStopBtn,
    refCanvas,
  };
};
