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
  startAt: number | null;
  playtime: number | null;
  player1: {
    id: string | null;
    username: string | null;
    avatar: string | null;
    frame: string | null;
    level: string | null;
    ready: boolean;
  };
  player2: {
    id: string | null;
    username: string | null;
    avatar: string | null;
    frame: string | null;
    level: string | null;
    ready: boolean;
  };
  game: {
    status: 'waiting' | 'playing' | 'ended' | 'rematching';
    ball: IBall;
    leftPaddle: IPaddle;
    rightPaddle: IPaddle;
    winner: string | null;
    scoreUpdate: boolean;
  };
}

export interface IGmaes {
  lobyGame: string | null;
  games: Map<string, IGameState>;
}

export interface IPlayer {
  id: string;
  username: string;
  avatar: string;
  frame: string;
  level: string;
  isEliminated: boolean;
}

// ----------- Tournament -----------

export interface ITournament {
  id: string;
  name: string;
  winner: IPlayer | null;
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
  matchesInRound: number;
  PlayedMatches: number;
  matches: IMatch[];
}

export interface TournamentDetails {
  id: string;
  // creatorId: string;
  status: 'waiting' | 'live' | 'completed';
  maxPlayers: number;
  players: IPlayer[];
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

// ----------- Game Invite -----------

export interface IGameInvite {
  challengerId: string;
  opponentId: string;
  challengerJoined: boolean;
  opponentJoined: boolean;
  game: IGameState;
}
