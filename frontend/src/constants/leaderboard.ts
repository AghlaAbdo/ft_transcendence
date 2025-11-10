export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  isAccountVerified: number;
  points: number;
  wins: number;
  losses: number;
  level: number;
  online_status: number;
  is_google_auth: number;
}

export type Player = User & {
    rank: number;
    games: number;
    winrate: number;
}
