import { useCallback, useEffect, useRef, useState } from 'react';

import * as PIXI from 'pixi.js';

import { socket } from '@/app/(protected)/lib/socket';
import {
  BALL_RADIUS,
  GAME_HEIGHT,
  GAME_WIDTH,
  IGameState,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
} from '@/constants/game';
import { useLayout } from '@/context/LayoutContext';

interface returnType {
  handlePlayBtn: () => void;
  handleStopBtn: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  waiting: boolean;
  opponent: null | { username: string; avatar: string };
}

export const usePongGameLogic = (): returnType => {
  const [waiting, setWaiting] = useState(true);
  const [opponent, setOpponent] = useState(null);
  const pressedKeys = useRef<Set<string>>(new Set());
  const animationFrameId = useRef<number | null>(null);
  const gameId = useRef<string>(null);
  const isPlaying = useRef<boolean>(false);
  const playerRole = useRef<'player1' | 'player2'>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pixiApp = useRef<PIXI.Application | null>(null);

  const ballRef = useRef<PIXI.Graphics | null>(null);
  const leftPaddleRef = useRef<PIXI.Graphics | null>(null);
  const rightPaddleRef = useRef<PIXI.Graphics | null>(null);
  const scoreTextRef = useRef<PIXI.Text | null>(null);
  const endTextRef = useRef<PIXI.Text | null>(null);
  const coundDownRef = useRef<PIXI.Text | null>(null);

  const { setHideHeaderSidebar } = useLayout();

  const showCountDown = useCallback((num: number) => {
    if (!coundDownRef.current) return;
    coundDownRef.current.text = num.toString();
    coundDownRef.current.alpha = 1;
    coundDownRef.current.scale.set(1);

    let elapsed = 0;

    const animate = (ticker: PIXI.Ticker) => {
      if (!coundDownRef.current) return;
      const delta = ticker.deltaTime / 60;
      elapsed += delta;

      coundDownRef.current.scale.set(1 + elapsed * 0.5);
      coundDownRef.current.alpha = Math.max(1 - elapsed, 0);

      if (elapsed >= 1) {
        pixiApp.current?.ticker.remove(animate);
      }
    };

    pixiApp.current?.ticker.add(animate);
  }, []);

  useEffect(() => {
    if (waiting) return;
    let isInitialized = false;
    const initPixiApp = async () => {
      try {
        const app = new PIXI.Application();

        await app.init({
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          backgroundColor: 0xf2edd1,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });
        if (containerRef.current) {
          containerRef.current.appendChild(app.canvas);
        }
        pixiApp.current = app;
        isInitialized = true;

        const scoreText = new PIXI.Text({
          text: '0 | 0',
          style: {
            fontSize: 48,
            fill: 0x280a3e,
            align: 'center',
          },
        });
        scoreText.anchor.set(0.5);
        scoreText.x = GAME_WIDTH / 2;
        scoreText.y = 80;
        app.stage.addChild(scoreText);
        scoreTextRef.current = scoreText;

        const ball = new PIXI.Graphics();
        ball.circle(0, 0, BALL_RADIUS);
        ball.fill(0x689b8a);
        ball.x = GAME_WIDTH / 2;
        ball.y = GAME_HEIGHT / 2;
        app.stage.addChild(ball);
        ballRef.current = ball;

        const leftPaddle = new PIXI.Graphics();
        leftPaddle.rect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);
        leftPaddle.fill(0x280a3e);
        leftPaddle.x = 0;
        leftPaddle.y = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        app.stage.addChild(leftPaddle);
        leftPaddleRef.current = leftPaddle;

        const rightPaddle = new PIXI.Graphics();
        rightPaddle.rect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);
        rightPaddle.fill(0x280a3e);
        rightPaddle.x = GAME_WIDTH - PADDLE_WIDTH;
        rightPaddle.y = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        app.stage.addChild(rightPaddle);
        rightPaddleRef.current = rightPaddle;

        const endText = new PIXI.Text({
          text: '',
          style: {
            fontSize: 48,
            fill: 0x280a3e,
            align: 'center',
          },
        });
        endText.anchor.set(0.5);
        endText.x = GAME_WIDTH / 2;
        endText.y = GAME_HEIGHT / 2;
        app.stage.addChild(endText);
        endTextRef.current = endText;

        const countdownText = new PIXI.Text({
          text: '',
          style: {
            fontFamily: 'Arial',
            fontSize: 120,
            fill: 0x111827,
            align: 'center',
          },
        });

        countdownText.anchor.set(0.5);
        countdownText.x = app.screen.width / 2;
        countdownText.y = app.screen.height / 2;
        app.stage.addChild(countdownText);
        coundDownRef.current = countdownText;
      } catch (error) {
        console.error('Failed to initialize PixiJS app:', error);
        if (pixiApp.current) {
          pixiApp.current.destroy(true, { children: true });
          pixiApp.current = null;
        }
      }
    };

    initPixiApp();

    return () => {
      if (isInitialized && pixiApp.current) {
        pixiApp.current.destroy();
        pixiApp.current = null;
      }
    };
  }, [waiting]);

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server!');
      console.log('Socket ID:', socket.id);
    });

    console.log('Play Now');
    socket.emit('play');
    isPlaying.current = true;
    if (!animationFrameId.current)
      animationFrameId.current = requestAnimationFrame(gameLoop);

    socket.on('playerRole', (msg) => {
      console.log('player role: ', msg);
      if (msg === 'player1' && endTextRef.current) {
        endTextRef.current.text = 'waiting';
      }
      playerRole.current = msg;
    });

    socket.on('starting', (count) => {
      console.log('starting: ', count);
      showCountDown(count);
    });

    socket.on('startGame', (id) => {
      isPlaying.current = true;
      console.log('Stared the game !!!!!');
      gameId.current = id;
      setWaiting(false);
      setHideHeaderSidebar(true);
    });

    socket.on('matchFound', (opponent) => {
      console.log('Match Found: ', opponent.username);
      setOpponent(opponent);
    });

    socket.on('gameStateUpdate', (gameState: IGameState) => {
      if (!pixiApp.current) return;

      if (ballRef.current) {
        ballRef.current.x = gameState.ball.x;
        ballRef.current.y = gameState.ball.y;
      }

      if (leftPaddleRef.current) {
        leftPaddleRef.current.y = gameState.leftPaddle.y;
      }
      if (rightPaddleRef.current) {
        rightPaddleRef.current.y = gameState.rightPaddle.y;
      }

      if (scoreTextRef.current) {
        scoreTextRef.current.text = `${gameState.leftPaddle.score} | ${gameState.rightPaddle.score}`;
      }

      if (gameState.status === 'ended' && endTextRef.current) {
        endTextRef.current.text =
          gameState.winner === playerRole.current ? 'You Won' : 'You Lost';
        setHideHeaderSidebar(false);
      } else if (endTextRef.current) {
        endTextRef.current.text = '';
      }
    });
    socket.on('gameOver', () => {
      isPlaying.current = false;
    });
    window.addEventListener('keydown', keydownEvent);
    window.addEventListener('keyup', keyupEvent);
    return () => {
      window.removeEventListener('keydown', keydownEvent);
      window.removeEventListener('keyup', keyupEvent);
      socket.disconnect();
    };
  }, []);

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
    console.log('Play Now');
    socket.emit('play');
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
    containerRef,
    waiting,
    opponent,
  };
};
