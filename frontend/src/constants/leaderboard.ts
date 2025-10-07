export interface Player {
    username: string;
    score: number;
    winrate: number;
    games: number;
    avatar_url: string;
    wins: number;
    losses: number;
}


export interface PlayerWithRank extends Player {
    rank: number;
}