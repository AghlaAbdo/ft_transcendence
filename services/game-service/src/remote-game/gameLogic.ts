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
import { IGameState } from '../types/types';
import { Server } from 'socket.io';
import { getAllGames } from './AllGames';
import { getCurrDate } from '../utils/dates';
import { removeUserActiveGame } from './userActiveGame';
import { advancePlayerInTournament } from '../tournament/tournamentManager';

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
  if (!gameState || gameIntervals[gameState.id]) return;

  ioInstance.to(gameState.id).emit('prepare');
  for (let i = 1; i <= 3; i++) {
    const j = 4 - i;

    setTimeout(() => {
      // console.log("starting:", j);
      ioInstance.to(gameState.id).emit('starting', j);

      if (j === 1) {
        setTimeout(() => {
          if (gameState.game.status === 'ended') {
            deleteGame(gameState);
            return;
          }
          ioInstance.to(gameState.id).emit('startGame');
          ioInstance.emit('startGame');
          gameState.startDate = getCurrDate();
          gameState.game.status = 'playing';
          gameIntervals[gameState.id] = setInterval(
            () => gameLoop(gameState),
            GAME_INTERVAL_MS,
          );
        }, 1000);
      }
    }, i * 1000);
  }
}

function gameLoop(gameState: IGameState): void {
  if (!gameState || gameState.game.status !== 'playing') return;
  //check for top and bottom collision
  gameState.game.ball.x += gameState.game.ball.dx;
  gameState.game.ball.y += gameState.game.ball.dy;
  if (
    gameState.game.ball.y - BALL_RADIUS / 2 < 0 ||
    gameState.game.ball.y + BALL_RADIUS >= GAME_HEIGHT
  ) {
    gameState.game.ball.dy *= -1;
  }

  // check collision with left paddle
  if (
    gameState.game.ball.x - BALL_RADIUS / 2 <= PADDLE_WIDTH &&
    gameState.game.ball.y >= gameState.game.leftPaddle.y &&
    gameState.game.ball.y <= gameState.game.leftPaddle.y + PADDLE_HEIGHT
  ) {
    const relativeIntersectY =
      gameState.game.leftPaddle.y + PADDLE_HEIGHT / 2 - gameState.game.ball.y;
    const normalizedIntersectY = relativeIntersectY / (PADDLE_HEIGHT / 2);
    const bounceAngle = normalizedIntersectY * (Math.PI / 4);
    gameState.game.ball.dx = BALL_SPEED * Math.cos(bounceAngle);
    gameState.game.ball.dy = BALL_SPEED * -Math.sin(bounceAngle);
  }
  // check collision with right paddle
  else if (
    gameState.game.ball.x + BALL_RADIUS / 2 >= GAME_WIDTH - PADDLE_WIDTH &&
    gameState.game.ball.y >= gameState.game.rightPaddle.y &&
    gameState.game.ball.y <= gameState.game.rightPaddle.y + PADDLE_HEIGHT
  ) {
    const relativeIntersectY =
      gameState.game.rightPaddle.y + PADDLE_HEIGHT / 2 - gameState.game.ball.y;
    const normalizedIntersectY = relativeIntersectY / (PADDLE_HEIGHT / 2);
    const bounceAngle = normalizedIntersectY * (Math.PI / 4);
    gameState.game.ball.dx = -BALL_SPEED * Math.cos(bounceAngle);
    gameState.game.ball.dy = BALL_SPEED * -Math.sin(bounceAngle);
  }
  // check for loss
  else if (gameState.game.ball.x - 10 <= 0) {
    gameState.game.rightPaddle.score++;
    gameState.game.scoreUpdate = true;
    if (gameState.game.rightPaddle.score === 5) {
      gameOver(gameState);
    } else {
      resetBallPos(gameState);
    }
  } else if (gameState.game.ball.x + 10 >= GAME_WIDTH) {
    gameState.game.leftPaddle.score++;
    gameState.game.scoreUpdate = true;
    if (gameState.game.leftPaddle.score === 5) {
      gameOver(gameState);
    } else {
      resetBallPos(gameState);
    }
  }
  ioInstance.to(gameState.id).emit('gameStateUpdate', gameState.game);
  gameState.game.scoreUpdate = false;
}

function gameOver(gameState: IGameState): void {
  removeUserActiveGame(gameState.player1.id, gameState.id);
  removeUserActiveGame(gameState.player2.id, gameState.id);
  if (gameState.game.leftPaddle.score > gameState.game.rightPaddle.score) {
    gameState.winner_id = gameState.player1.id;
    gameState.game.winner = 'player1';
  } else {
    gameState.winner_id = gameState.player2.id;
    gameState.game.winner = 'player2';
  }
  gameState.game.status = 'ended';
  gameState.player1.ready = false;
  gameState.player2.ready = false;
  ioInstance.to(gameState.id).emit('gameOver');
  if (gameIntervals[gameState.id] != null)
    clearInterval(gameIntervals[gameState.id]!);
  gameIntervals[gameState.id] = null;
  gameState.playtime = getDiffInMin(gameState.startAt);
  postGame(gameState);
  if (gameState.isTournamentGame) {
    advancePlayerInTournament(
      gameState.tournamentId!,
      gameState.tournamentMatchId!,
      gameState.winner_id!,
    );
    deleteGame(gameState);
  }
}

export function deleteGame(gameState: IGameState): void {
  if (!gameState) return;
  if (gameState.game.status === 'playing') {
    gameState.game.status = 'ended';
  }
  delete getAllGames().games[gameState.id];
}
