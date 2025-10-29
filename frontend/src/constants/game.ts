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
  scoreUpdate: boolean;
}

export interface IPlayer {
  id: string;
  username: string;
  avatar: string;
  frame: string;
  level: string;
  isEliminated: boolean;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  isAccountVerified: boolean;
}

export interface TournamentDetails {
  id: string;
  name: string;
  winner: IPlayer;
  status: 'waiting' | 'live' | 'completed';
  maxPlayers: number;
  players: IPlayer[];
  bracket: IRound[];
}

export interface ITournament {
  id: string;
  name: string;
  creatorId: string;
  creatorUsername: string;
  status: 'waiting' | 'live' | 'completed';
  maxPlayers: number;
  players: Map<string, IPlayer>;
  bracket: IRound[];
}

export interface TournamentListItem {
  id: string;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  status: string;
  creatorUsername?: string;
}

export interface IMatch {
  id: string;
  round: number;
  player1Id: string | null;
  player2Id: string | null;
  gameId: string | null;
  winnerId: string | null;
  nextMatchId: string | null;
  nextMatchSlot: 'player1Id' | 'player2Id' | null;
  status: 'pending' | 'ready' | 'playing' | 'completed';
}

export interface IRound {
  roundNumber: number;
  matches: IMatch[];
}
