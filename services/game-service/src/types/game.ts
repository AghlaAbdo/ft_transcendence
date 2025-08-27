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
  ball: IBall;
  leftPaddle: IPaddle;
  rightPaddle: IPaddle;
  player1_id: number;
  player2_id: number;
  status: 'waiting' | 'playing' | 'ended';
  playersNb: number;
  winner: string | null;
  winner_id: number | null;
  startDate: string | null;
  startAt: number;
  playtime: number | null;
}

export interface IGmaes {
  lobyGame: string | null;
  games: {
    [gameId: string]: IGameState;
  };
}
