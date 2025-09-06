export const GAME_WIDTH = 900;
export const GAME_HEIGHT = 600;
export const PADDLE_HEIGHT = 150;
export const PADDLE_WIDTH = 30;
export const BALL_RADIUS = 20;

export interface IBall {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

export interface IPaddle {
  y: number;
  height: number;
  width: number;
  score: number;
}

export interface IGameState {
  ball: IBall;
  leftPaddle: IPaddle;
  rightPaddle: IPaddle;
  status: 'waiting' | 'playing' | 'ended';
  players: { plr1Socket: string | null; plr2Socket: string | null };
  playersNb: number;
  winner: string | null;
}
