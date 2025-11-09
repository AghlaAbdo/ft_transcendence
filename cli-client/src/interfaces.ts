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
  scoreUpdate: boolean;
}

export interface IPlayer {
  id: string;
  username: string;
  level: string;
}

export interface IPlayerData {
  user: IPlayer | null;
  opponent: IPlayer | null;
  gameId: string | null;
  paddle: IPaddle | null;
  opponentPaddle: IPaddle | null;
  role: 'player1' | 'player2' | null;
  gameStatus: 'matching' | 'playing' | null;
  inGame: boolean;
}
