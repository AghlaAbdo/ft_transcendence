import { resetBallPos } from './gameState';
import { postGame } from '../models/game.model';
import { getDiffInMin } from '../utils/dates';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  BALL_SPEED,
  GAME_INTERVAL_MS,
} from '../config/game';
import { IGameState } from '../types/game';
import { Server } from 'socket.io';

let ioInstance: Server;
const gameIntervals: { [gameId: string]: NodeJS.Timeout | undefined | null } =
  {};

export function _resetGameIntervalsForTesting(): void {
  Object.keys(gameIntervals).forEach((key) => {
    delete gameIntervals[key];
  });
  gameIntervals.foreach;
}

export function setIoInstance(io: Server): void {
  ioInstance = io;
}

export function startGame(gameState: IGameState) {
  if (gameIntervals[gameState.id]) return;
  // const gameState = getGameState();
  gameState.status = 'playing';
  gameIntervals[gameState.id] = setInterval(
    () => gameLoop(gameState),
    GAME_INTERVAL_MS,
  );
}

function gameLoop(gameState: IGameState): void {
  //check for top and bottom collision
  gameState.ball.x += gameState.ball.dx;
  gameState.ball.y += gameState.ball.dy;
  if (
    gameState.ball.y - BALL_RADIUS / 2 < 0 ||
    gameState.ball.y + BALL_RADIUS >= GAME_HEIGHT
  ) {
    console.log('ball.y: ', gameState.ball.y);
    gameState.ball.dy *= -1;
  }

  // check collision with left paddle
  if (
    gameState.ball.x - BALL_RADIUS / 2 <= PADDLE_WIDTH &&
    gameState.ball.y >= gameState.leftPaddle.y &&
    gameState.ball.y <= gameState.leftPaddle.y + PADDLE_HEIGHT
  ) {
    const relativeIntersectY =
      gameState.leftPaddle.y + PADDLE_HEIGHT / 2 - gameState.ball.y;
    const normalizedIntersectY = relativeIntersectY / (PADDLE_HEIGHT / 2);
    const bounceAngle = normalizedIntersectY * (Math.PI / 4);
    gameState.ball.dx = BALL_SPEED * Math.cos(bounceAngle);
    gameState.ball.dy = BALL_SPEED * -Math.sin(bounceAngle);
  }
  // check collision with right paddle
  else if (
    gameState.ball.x + BALL_RADIUS / 2 >= GAME_WIDTH - PADDLE_WIDTH &&
    gameState.ball.y >= gameState.rightPaddle.y &&
    gameState.ball.y <= gameState.rightPaddle.y + PADDLE_HEIGHT
  ) {
    const relativeIntersectY =
      gameState.rightPaddle.y + PADDLE_HEIGHT / 2 - gameState.ball.y;
    const normalizedIntersectY = relativeIntersectY / (PADDLE_HEIGHT / 2);
    const bounceAngle = normalizedIntersectY * (Math.PI / 4);
    gameState.ball.dx = -BALL_SPEED * Math.cos(bounceAngle);
    gameState.ball.dy = BALL_SPEED * -Math.sin(bounceAngle);
  }
  // check for loss
  else if (gameState.ball.x - 10 <= 0) {
    gameState.rightPaddle.score++;
    if (gameState.rightPaddle.score === 5) {
      endGame(gameState);
    } else {
      resetBallPos(gameState);
    }
  } else if (gameState.ball.x + 10 >= GAME_WIDTH) {
    gameState.leftPaddle.score++;
    if (gameState.leftPaddle.score === 5) {
      endGame(gameState);
    } else {
      resetBallPos(gameState);
    }
  }

  ioInstance.to(gameState.id).emit('gameStateUpdate', gameState);
}

export function endGame(gameState: IGameState): void {
  if (gameState.leftPaddle.score > gameState.rightPaddle.score)
    gameState.winner = 'player1';
  else gameState.winner = 'player2';
  gameState.status = 'ended';
  ioInstance.emit('gameOver');
  if (gameIntervals[gameState.id] != null)
    clearInterval(gameIntervals[gameState.id]!);
  gameIntervals[gameState.id] = null;
  gameState.playtime = getDiffInMin(gameState.startAt);
  postGame(gameState);
  // resetGameState(gameState);
}
