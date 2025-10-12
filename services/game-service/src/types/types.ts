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
  isTournamentGame: boolean;
  tournamentId: string | null;
  tournamentMatchId: string | null;
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
  socketId: string;
  username: string;
  avatar: string;
  frame: string;
  level: string;
}

// ----------- Tournament -----------

export interface ITournament {
  id: string;
  name: string;
  creatorId: string;
  creatorUsername: string;
  status: 'waiting' | 'live' | 'completed';
  maxPlayers: number;
  readyPlayers: number;
  players: Map<string, IPlayer>;
  bracket: IRound[];
}

export interface IMatch {
  id: string;
  round: number;
  player1Id: string | null;
  player2Id: string | null;
  isPlayer1Ready: boolean;
  isPlayer2Ready: boolean;
  gameId: string | null;
  winnerId: string | null;
  status: 'pending' | 'ready' | 'playing' | 'completed';
  nextMatchId: string | null;
  nextMatchSlot: string | null;
}

export interface IRound {
  roundNumber: number;
  matches: IMatch[];
}
