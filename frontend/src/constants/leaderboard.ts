export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  isAccountVerified: number;
  points: number;
  wins: number;
  losses: number;
  rank: number;
  online_status: number;
}

export type Player = User & {
    rank: number;
    games: number;
    winrate: number;
}
