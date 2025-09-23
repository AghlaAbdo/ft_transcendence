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
  winner_id: number | null;
  startDate: string | null;
  startAt: number;
  playtime: number | null;
  player1: {
    id: number;
    ready: boolean;
  };
  player2: {
    id: number;
    ready: boolean;
  };
  game: {
    status: 'waiting' | 'playing' | 'ended';
    ball: IBall;
    leftPaddle: IPaddle;
    rightPaddle: IPaddle;
    winner: string | null;
  };
}

export interface IGmaes {
  lobyGame: string | null;
  games: {
    [gameId: string]: IGameState;
  };
}
