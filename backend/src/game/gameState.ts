import { IGameState } from '../types/game';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_SPEED,
  BALL_RADIUS,
  BALL_SPEED,
} from '../config/game';

const direction = Math.random() < 0.5 ? 1 : -1;
const angle = Math.random() * (Math.PI / 2) - Math.PI / 4;

export function GenerateGameState(gameId: string): IGameState {
  return {
    id: gameId,
    ball: {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      dx: BALL_SPEED * Math.cos(angle) * direction,
      dy: BALL_SPEED * Math.sin(angle),
      dir: direction,
      radius: BALL_RADIUS,
    },
    leftPaddle: {
      y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      height: PADDLE_HEIGHT,
      width: PADDLE_WIDTH,
      score: 0,
    },
    rightPaddle: {
      y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      height: PADDLE_HEIGHT,
      width: PADDLE_WIDTH,
      score: 0,
    },
    status: 'waiting',
    players: { plr1Socket: null, plr2Socket: null },
    playersNb: 1,
    winner: null,
  };
}

export function paddleMoveUp(gameState: IGameState, playerRole: string): void {
  if (playerRole === 'player1') {
    if (gameState.leftPaddle.y - PADDLE_SPEED > 0)
      gameState.leftPaddle.y -= PADDLE_SPEED;
  } else {
    if (gameState.rightPaddle.y - PADDLE_SPEED > 0)
      gameState.rightPaddle.y -= PADDLE_SPEED;
  }
}

export function paddleMoveDown(
  gameState: IGameState,
  playerRole: string,
): void {
  if (playerRole === 'player1') {
    if (gameState.leftPaddle.y + PADDLE_HEIGHT + PADDLE_SPEED < GAME_HEIGHT)
      gameState.leftPaddle.y += PADDLE_SPEED;
  } else {
    if (gameState.rightPaddle.y + PADDLE_HEIGHT + PADDLE_SPEED < GAME_HEIGHT)
      gameState.rightPaddle.y += PADDLE_SPEED;
  }
}

export function resetBallPos(gameState: IGameState): void {
  const angle = Math.random() * (Math.PI / 2) - Math.PI / 4;
  gameState.ball = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    dx: BALL_SPEED * Math.cos(angle),
    dy: BALL_SPEED * Math.sin(angle),
    dir: gameState.ball.dir * -1,
    radius: BALL_RADIUS,
  };
  gameState.ball.dx *= gameState.ball.dir;
}
