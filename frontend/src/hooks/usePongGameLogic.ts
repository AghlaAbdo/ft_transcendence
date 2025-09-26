import { useCallback, useEffect, useRef, useState } from 'react';

import { redirect } from 'next/navigation';

import * as PIXI from 'pixi.js';

import { socket } from '@/app/(protected)/lib/socket';
import {
  BALL_RADIUS,
  GAME_HEIGHT,
  GAME_WIDTH,
  IGameState,
  IPlayer,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
} from '@/constants/game';
import { useLayout } from '@/context/LayoutContext';

interface returnType {
  containerRef: React.RefObject<HTMLDivElement | null>;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  waiting: boolean;
  player: null | IPlayer;
  opponent: null | IPlayer;
  winner: string;
  gameId: string | null;
  playerRole: 'player1' | 'player2' | null;
  handleClose: () => void;
}

export const usePongGameLogic = (): returnType => {
  const [waiting, setWaiting] = useState(true);
  const [opponent, setOpponent] = useState<IPlayer | null>(null);
  const [player, setPlayer] = useState<IPlayer | null>(null);
  const [winner, setWinner] = useState<string>('');
  const pressedKeys = useRef<Set<string>>(new Set());
  const animationFrameId = useRef<number | null>(null);
  const gameId = useRef<string>(null);
  const isPlaying = useRef<boolean>(false);
  const playerRole = useRef<'player1' | 'player2'>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pixiApp = useRef<PIXI.Application | null>(null);

  const ballRef = useRef<PIXI.Graphics | null>(null);
  const leftPaddleRef = useRef<PIXI.Graphics | null>(null);
  const rightPaddleRef = useRef<PIXI.Graphics | null>(null);
  const scoreTextRef = useRef<PIXI.Text | null>(null);
  const endTextRef = useRef<PIXI.Text | null>(null);
  const coundDownRef = useRef<PIXI.Text | null>(null);
  const gameContainerRef = useRef<PIXI.Container | null>(null);

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
          resizeTo: containerRef.current!,
          backgroundColor: 0x1f2937,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });
        if (containerRef.current) {
          containerRef.current.appendChild(app.canvas);
        }
        pixiApp.current = app;
        isInitialized = true;

        const gameContainer = new PIXI.Container();
        app.stage.addChild(gameContainer);
        gameContainerRef.current = gameContainer;

        // Middle dashed line
        const middleLinePx = new PIXI.Graphics();
        gameContainer.addChild(middleLinePx);
        middleLinePx.clear();
        const dash = 23;
        const gap = 22;
        const lineWidth = 3;
        const cw = GAME_WIDTH;
        const ch = GAME_HEIGHT;
        const cx = cw / 2;
        for (let y = 0; y < ch; y += dash + gap) {
          middleLinePx.moveTo(cx, y);
          middleLinePx.lineTo(cx, Math.min(y + dash, ch));
        }
        middleLinePx.stroke({ width: lineWidth, color: 0xf9fafb, alpha: 1 });

        // Middle circle
        const circle = new PIXI.Graphics();
        circle.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 40);
        circle.fill(0x1f2937);
        circle.stroke({ width: 2, color: 0xf9fafb, alpha: 1 });
        gameContainer.addChild(circle);

        // Score Text
        const scoreText = new PIXI.Text({
          text: '0    0',
          style: {
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: 54,
            fill: 0xf9fafb,
            align: 'center',
          },
          resolution: 2,
        });
        scoreText.anchor.set(0.5);
        scoreText.x = GAME_WIDTH / 2;
        scoreText.y = 60;
        gameContainer.addChild(scoreText);
        scoreTextRef.current = scoreText;

        // Ball
        const ball = new PIXI.Graphics();
        ball.circle(0, 0, BALL_RADIUS);
        ball.fill(0x689b8a);
        ball.x = GAME_WIDTH / 2;
        ball.y = GAME_HEIGHT / 2;
        gameContainer.addChild(ball);
        ballRef.current = ball;

        // Left Paddle
        const leftPaddle = new PIXI.Graphics();
        leftPaddle.rect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);
        leftPaddle.fill(0x9333ea);
        leftPaddle.x = 0;
        leftPaddle.y = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        gameContainer.addChild(leftPaddle);
        leftPaddleRef.current = leftPaddle;

        // Right paddle
        const rightPaddle = new PIXI.Graphics();
        rightPaddle.rect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);
        rightPaddle.fill(0x9333ea);
        rightPaddle.x = GAME_WIDTH - PADDLE_WIDTH;
        rightPaddle.y = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        gameContainer.addChild(rightPaddle);
        rightPaddleRef.current = rightPaddle;

        // Result Text
        const endText = new PIXI.Text({
          text: '',
          style: {
            fontSize: 48,
            fill: 0xf9fafb,
            align: 'center',
          },
        });
        endText.anchor.set(0.5);
        endText.x = GAME_WIDTH / 2;
        endText.y = GAME_HEIGHT / 2;
        gameContainer.addChild(endText);
        endTextRef.current = endText;

        // Count Down
        const countdownText = new PIXI.Text({
          text: '',
          style: {
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: 124,
            fill: 0xeab308,
            align: 'center',
          },
        });
        countdownText.anchor.set(0.5);
        countdownText.x = GAME_WIDTH / 2;
        countdownText.y = GAME_HEIGHT / 2;
        gameContainer.addChild(countdownText);
        coundDownRef.current = countdownText;

        const scaleX = pixiApp.current!.renderer.width / GAME_WIDTH;
        const scaleY = pixiApp.current!.renderer.height / GAME_HEIGHT;
        const scale = Math.min(scaleX, scaleY);
        gameContainerRef.current!.scale.set(scale);
        gameContainerRef.current!.x =
          (pixiApp.current!.renderer.width - GAME_WIDTH * scale) / 2;
        gameContainerRef.current!.y =
          (pixiApp.current!.renderer.height - GAME_HEIGHT * scale) / 2;
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

  const transformX = useCallback((x: number, playerRole: "player1" | "player2"):number =>{
    if (playerRole === "player1") return x;
    return GAME_WIDTH - x;
  }, []);

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server!');
      console.log('Socket ID:', socket.id);
    });

    console.log('Play Now');
    socket.emit('play');
    // isPlaying.current = true;

    socket.on('playerRole', (msg) => {
      console.log('player role: ', msg);
      if (msg === 'player1' && endTextRef.current) {
        endTextRef.current.text = 'waiting';
      }
      playerRole.current = msg;
      setPlayer({
        username: 'user_13445',
        avatar: '/avatars/avatar1.png',
        frame: 'gold2',
        level: '145',
      });
    });

    socket.on('starting', (count) => {
      console.log('starting: ', count);
      if (waiting) {
        console.log("set waiting once!!!!!!!!!!\n");
        setWaiting(false);
      }
      showCountDown(count);
    });

    socket.on('startGame', (id) => {
      isPlaying.current = true;
      gameId.current = id;
      setHideHeaderSidebar(true);
      if (!animationFrameId.current)
        animationFrameId.current = requestAnimationFrame(gameLoop);
      console.log('Stared the game !!!!!');
    });

    socket.on('matchFound', (opponent: IPlayer) => {
      console.log('Match Found: ', opponent.username);
      setOpponent(opponent);
    });

    socket.on('gameStateUpdate', (gameState: IGameState) => {
      if (!pixiApp.current) return;

      if (ballRef.current) {
        ballRef.current.x = transformX(gameState.ball.x, playerRole.current!);
        ballRef.current.y = gameState.ball.y;
      }

      if (leftPaddleRef.current) {
        leftPaddleRef.current.y = playerRole.current === 'player2' ? gameState.rightPaddle.y : gameState.leftPaddle.y;
      }
      if (rightPaddleRef.current) {
        rightPaddleRef.current.y = playerRole.current === 'player2' ? gameState.leftPaddle.y : gameState.rightPaddle.y;
      }

      if (gameState.scoreUpdate && scoreTextRef.current) {
        scoreTextRef.current.text = `${playerRole.current === 'player2' ? gameState.rightPaddle.score + "   " + gameState.leftPaddle.score
          : gameState.leftPaddle.score + "   " + gameState.rightPaddle.score}`;
      }

      if (gameState.status === 'ended' && endTextRef.current) {
        endTextRef.current.text =
          gameState.winner === playerRole.current ? 'You Won' : 'You Lost';
        setWinner(gameState.winner!);
      } else if (endTextRef.current) {
        endTextRef.current.text = '';
      }
    });
    socket.on('gameOver', () => {
      isPlaying.current = false;
      dialogRef.current?.showModal();
    });

    socket.on(
      'opponentQuit',
      (gameStatus: 'waiting' | 'playing' | 'ended' | null) => {
        isPlaying.current = false;
        if (gameStatus === 'playing') {
          endTextRef.current!.text = 'You Won';
          setWinner(playerRole.current!);
          setTimeout(() => dialogRef.current?.showModal(), 2000);
        }
      }
    );

    window.addEventListener('keydown', keydownEvent);
    window.addEventListener('keyup', keyupEvent);

    function resize() {
      if (!pixiApp.current || !gameContainerRef.current) return;
      const scaleX = pixiApp.current.renderer.width / GAME_WIDTH;
      const scaleY = pixiApp.current.renderer.height / GAME_HEIGHT;
      const scale = Math.min(scaleX, scaleY);
      gameContainerRef.current.scale.set(scale);
      gameContainerRef.current.x =
        (pixiApp.current!.renderer.width - GAME_WIDTH * scale) / 2;
      gameContainerRef.current.y =
        (pixiApp.current!.renderer.height - GAME_HEIGHT * scale) / 2;
    }

    window.addEventListener('resize', resize);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // e.preventDefault();
      e.returnValue = '';
      console.log('sent quit event');
      if (isPlaying.current) socket.emit('quit', gameId.current);
      window.removeEventListener('keydown', keydownEvent);
      window.removeEventListener('keyup', keyupEvent);
      window.removeEventListener('resize', resize);
      socket.off();
      socket.disconnect();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('keydown', keydownEvent);
      window.removeEventListener('keyup', keyupEvent);
      window.removeEventListener('resize', resize);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (isPlaying.current) {
        socket.emit('quit', gameId.current);
      }
      socket.off();
      socket.disconnect();
    };
  }, []);

  const gameLoop = () => {
    if (pressedKeys.current.has('ArrowUp')) {
      socket.emit('movePaddle', gameId.current, playerRole.current, 'up');
    } else if (pressedKeys.current.has('ArrowDown')) {
      socket.emit('movePaddle', gameId.current, playerRole.current, 'down');
    }
    if (isPlaying.current)
      animationFrameId.current = requestAnimationFrame(gameLoop);
    else
      animationFrameId.current = null;
  };

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

  function handleClose() {
    socket.emit('quit', gameId.current);
    redirect('/game');
  }

  return {
    containerRef,
    dialogRef,
    waiting,
    player,
    opponent,
    winner,
    gameId: gameId.current,
    playerRole: playerRole.current,
    handleClose,
  };
};
