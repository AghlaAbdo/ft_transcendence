import { useCallback, useEffect, useRef, useState } from 'react';

import * as PIXI from 'pixi.js';

import {
  BALL_RADIUS,
  BALL_SPEED,
  GAME_HEIGHT,
  GAME_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_SPEED,
  PADDLE_WIDTH,
} from '@/constants/game';
import { useLayout } from '@/context/LayoutContext';

interface returnType {
  containerRef: React.RefObject<HTMLDivElement | null>;
  scores: React.RefObject<{
    left: number;
    right: number;
  }>;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  winner: 'Player 1' | 'Player 2' | null;
  handleRematch: () => void;
}

export const useLocalPongLogic = (): returnType => {
  const gameContainerRef = useRef<PIXI.Container | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pixiApp = useRef<PIXI.Application | null>(null);
  const endTextRef = useRef<PIXI.Text | null>(null);
  const coundDownRef = useRef<PIXI.Text | null>(null);

  const ballRef = useRef<PIXI.Graphics | null>(null);
  const leftPaddleRef = useRef<PIXI.Graphics | null>(null);
  const rightPaddleRef = useRef<PIXI.Graphics | null>(null);
  const scoreTextRef = useRef<PIXI.Text | null>(null);
  const scores = useRef({ left: 0, right: 0 });
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [winner, setWinner] = useState<'Player 1' | 'Player 2' | null>(null);
  const isPlaying = useRef<boolean>(false);
  const ballSpeed = useRef(BALL_SPEED);

  const pressedKeys = useRef<Set<string>>(new Set());
  const animationFrame = useRef<number | null>(null);

  const direction = Math.random() < 0.5 ? 1 : -1;
  const angle = Math.random() * (Math.PI / 2) - Math.PI / 4;
  const ball = useRef({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    dx: BALL_SPEED * Math.cos(angle) * direction,
    dy: BALL_SPEED * Math.sin(angle),
    dir: Math.random() < 0.5 ? 1 : -1,
  });
  const leftPaddleY = useRef(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const rightPaddleY = useRef(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const { setHideHeaderSidebar, setHideSidebar } = useLayout();

  useEffect(() => {
    setTimeout(() => {
      prepareGame();
    }, 1000);
  }, []);

  useEffect(() => {
    setHideHeaderSidebar(true);
    setHideSidebar(true);
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
        ball.fill(0xec4899);
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
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: 0xeab308,
            align: 'center',
          },
          resolution: 2,
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

    initPixiApp();
    return () => {
      setHideHeaderSidebar(false);
      setHideSidebar(false);
      window.removeEventListener('resize', resize);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      if (isInitialized && pixiApp.current) {
        pixiApp.current.destroy();
        pixiApp.current = null;
      }
    };
  }, []);

  const gameLoop = useCallback(() => {
    movePaddles();
    moveBall();
    renderGame();
    if (isPlaying.current)
      animationFrame.current = requestAnimationFrame(gameLoop);
    else animationFrame.current = null;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = ['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'];
      if (keys.includes(e.key)) pressedKeys.current.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = ['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'];
      if (keys.includes(e.key)) pressedKeys.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  function prepareGame() {
    let count = 3;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        showCountDown(count);
        count--;
        if (count === 0)
          setTimeout(() => {
            startGameLoop();
          }, 1000);
      }, i * 1000);
    }
  }

  function startGameLoop() {
    isPlaying.current = true;
    animationFrame.current = requestAnimationFrame(gameLoop);
  }

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

  const movePaddles = () => {
    // Player 1 (left paddle)
    if (pressedKeys.current.has('ArrowUp')) leftPaddleY.current -= PADDLE_SPEED;
    if (pressedKeys.current.has('ArrowDown'))
      leftPaddleY.current += PADDLE_SPEED;
    leftPaddleY.current = Math.max(
      0,
      Math.min(GAME_HEIGHT - PADDLE_HEIGHT, leftPaddleY.current)
    );

    // Player 2 (right paddle)
    if (pressedKeys.current.has('w') || pressedKeys.current.has('W'))
      rightPaddleY.current -= PADDLE_SPEED;
    if (pressedKeys.current.has('s') || pressedKeys.current.has('S'))
      rightPaddleY.current += PADDLE_SPEED;
    rightPaddleY.current = Math.max(
      0,
      Math.min(GAME_HEIGHT - PADDLE_HEIGHT, rightPaddleY.current)
    );
  };

  const moveBall = () => {
    ball.current.x += ball.current.dx;
    ball.current.y += ball.current.dy;
    if (ball.current.y < 20) ball.current.y = 20;
    else if (ball.current.y > GAME_HEIGHT - 20)
      ball.current.y = GAME_HEIGHT - 20;
    if (ball.current.y <= 20 || ball.current.y >= GAME_HEIGHT - 20) {
      ball.current.dy *= -1;
    }

    // check collision with left paddle
    if (
      ball.current.x - BALL_RADIUS / 2 <= PADDLE_WIDTH &&
      ball.current.y >= leftPaddleY.current &&
      ball.current.y <= leftPaddleY.current + PADDLE_HEIGHT
    ) {
      const relativeIntersectY =
        leftPaddleY.current + PADDLE_HEIGHT / 2 - ball.current.y;
      const normalizedIntersectY = relativeIntersectY / (PADDLE_HEIGHT / 2);
      const bounceAngle = normalizedIntersectY * (Math.PI / 4);
      ballSpeed.current *= 1.06;
      ball.current.dx = ballSpeed.current * Math.cos(bounceAngle);
      ball.current.dy = ballSpeed.current * -Math.sin(bounceAngle);
    }
    // check collision with right paddle
    else if (
      ball.current.x + BALL_RADIUS / 2 >= GAME_WIDTH - PADDLE_WIDTH &&
      ball.current.y >= rightPaddleY.current &&
      ball.current.y <= rightPaddleY.current + PADDLE_HEIGHT
    ) {
      const relativeIntersectY =
        rightPaddleY.current + PADDLE_HEIGHT / 2 - ball.current.y;
      const normalizedIntersectY = relativeIntersectY / (PADDLE_HEIGHT / 2);
      const bounceAngle = normalizedIntersectY * (Math.PI / 4);
      ballSpeed.current *= 1.06;
      ball.current.dx = -ballSpeed.current * Math.cos(bounceAngle);
      ball.current.dy = ballSpeed.current * -Math.sin(bounceAngle);
    }
    // check for loss
    else if (ball.current.x - 10 <= 0) {
      scores.current.right += 1;
      ballSpeed.current = BALL_SPEED;
      if (scores.current.right === 5) {
        setWinner('Player 2');
        isPlaying.current = false;
        dialogRef.current?.show();
      } else resetBall();
    } else if (ball.current.x + 10 >= GAME_WIDTH) {
      scores.current.left += 1;
      ballSpeed.current = BALL_SPEED;
      // console.log('increasing left ??');
      if (scores.current.left === 5) {
        setWinner('Player 1');
        isPlaying.current = false;
        dialogRef.current?.show();
      } else resetBall();
    }
  };

  const resetBall = () => {
    const angle = Math.random() * (Math.PI / 2) - Math.PI / 4;

    ball.current.x = GAME_WIDTH / 2;
    ball.current.y = GAME_HEIGHT / 2;
    ball.current.dy = BALL_SPEED * Math.sin(angle);
    ball.current.dir = ball.current.dir * -1;
    ball.current.dx = BALL_SPEED * Math.cos(angle) * ball.current.dir;
  };

  const resetPaddles = () => {
    if (!rightPaddleRef.current || !leftPaddleRef.current) return;
    leftPaddleY.current = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    rightPaddleY.current = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
  };

  const handleRematch = () => {
    resetPaddles();
    resetBall();
    scores.current.left = 0;
    scores.current.right = 0;
    renderGame();
    setWinner(null);
    setTimeout(() => {
      prepareGame();
    }, 400);
    dialogRef.current?.close();
  };

  const renderGame = () => {
    if (ballRef.current) {
      ballRef.current.x = ball.current.x;
      ballRef.current.y = ball.current.y;
    }
    if (leftPaddleRef.current) leftPaddleRef.current.y = leftPaddleY.current;
    if (rightPaddleRef.current) rightPaddleRef.current.y = rightPaddleY.current;
    if (scoreTextRef.current)
      scoreTextRef.current.text = `${scores.current.left}    ${scores.current.right}`;
  };

  return { containerRef, scores, dialogRef, winner, handleRematch };
};
