export interface IBall {
  x: number;
  y: number;
  dx: number;
  dy: number;
  dir: number;
  radius: number;
}

export interface IPaddle {
  y: number;
  height: number;
  width: number;
  score: number;
}

export interface IGameState {
  id: string;
  db_id: number;
  playersNb: number;
  winner_id: string | null;
  startDate: string | null;
  startAt: number;
  playtime: number | null;
  player1: {
    id: string | null;
    socketId: string | null;
    username: string | null;
    avatar: string | null;
    frame: string | null;
    level: string | null;
    ready: boolean;
  };
  player2: {
    id: string | null;
    socketId: string | null;
    username: string | null;
    avatar: string | null;
    frame: string | null;
    level: string | null;
    ready: boolean;
  };
  game: {
    status: 'waiting' | 'playing' | 'ended';
    ball: IBall;
    leftPaddle: IPaddle;
    rightPaddle: IPaddle;
    winner: string | null;
    scoreUpdate: boolean;
  };
}

export interface IGmaes {
  lobyGame: string | null;
  games: {
    [gameId: string]: IGameState;
  };
}

export interface IPlayer {
  id: string;
  username: string;
  avatar: string;
  frame: string;
  level: string;
}
