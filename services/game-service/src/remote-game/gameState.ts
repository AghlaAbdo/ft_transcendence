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

export function generateGameState(gameId: string): IGameState {
  const direction = Math.random() < 0.5 ? 1 : -1;
  const angle = Math.random() * (Math.PI / 2) - Math.PI / 4;
  return {
    id: gameId,
    db_id: 0,
    game: {
      status: 'waiting',
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
      winner: null,
    },
    player1: {
      id: 45,
      ready: false,
    },
    player2: {
      id: 23,
      ready: false,
    },
    playersNb: 1,
    winner_id: null,
    startDate: null,
    startAt: new Date().getTime(),
    playtime: null,
  };
}

export function paddleMoveUp(gameState: IGameState, playerRole: string): void {
  if (playerRole === 'player1') {
    if (gameState.game.leftPaddle.y - PADDLE_SPEED > 0)
      gameState.game.leftPaddle.y -= PADDLE_SPEED;
    else gameState.game.leftPaddle.y = 0;
  } else if (playerRole === 'player2') {
    if (gameState.game.rightPaddle.y - PADDLE_SPEED > 0)
      gameState.game.rightPaddle.y -= PADDLE_SPEED;
    else gameState.game.rightPaddle.y = 0;
  }
}

export function paddleMoveDown(
  gameState: IGameState,
  playerRole: string,
): void {
  if (playerRole === 'player1') {
    if (
      gameState.game.leftPaddle.y + PADDLE_HEIGHT + PADDLE_SPEED <
      GAME_HEIGHT
    )
      gameState.game.leftPaddle.y += PADDLE_SPEED;
    else gameState.game.leftPaddle.y = GAME_HEIGHT - PADDLE_HEIGHT;
  } else if (playerRole === 'player2') {
    if (
      gameState.game.rightPaddle.y + PADDLE_HEIGHT + PADDLE_SPEED <
      GAME_HEIGHT
    )
      gameState.game.rightPaddle.y += PADDLE_SPEED;
    else gameState.game.rightPaddle.y = GAME_HEIGHT - PADDLE_HEIGHT;
  }
}

export function resetBallPos(gameState: IGameState): void {
  const angle = Math.random() * (Math.PI / 2) - Math.PI / 4;
  gameState.game.ball = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    dx: BALL_SPEED * Math.cos(angle),
    dy: BALL_SPEED * Math.sin(angle),
    dir: gameState.game.ball.dir * -1,
    radius: BALL_RADIUS,
  };
  gameState.game.ball.dx *= gameState.game.ball.dir;
}

export function resetGameState(gameState: IGameState): void {
  const direction = Math.random() < 0.5 ? 1 : -1;
  const angle = Math.random() * (Math.PI / 2) - Math.PI / 4;
  gameState.game.status = 'waiting';
  gameState.game.ball.x = GAME_WIDTH / 2;
  gameState.game.ball.x = GAME_HEIGHT / 2;
  gameState.game.ball.x = BALL_SPEED * Math.cos(angle) * direction;
  gameState.game.ball.x = BALL_SPEED * Math.sin(angle);
  gameState.game.ball.x = direction;
  gameState.game.ball.x = BALL_RADIUS;
  gameState.game.leftPaddle.y = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
  gameState.game.leftPaddle.height = PADDLE_HEIGHT;
  gameState.game.leftPaddle.width = PADDLE_WIDTH;
  gameState.game.leftPaddle.score = 0;
  gameState.game.rightPaddle.y = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
  gameState.game.rightPaddle.height = PADDLE_HEIGHT;
  gameState.game.rightPaddle.width = PADDLE_WIDTH;
  gameState.game.rightPaddle.score = 0;
  gameState.game.winner = null;
  gameState.winner_id = null;
  gameState.startDate = null;
  gameState.startAt = new Date().getTime();
  gameState.playtime = null;
}
