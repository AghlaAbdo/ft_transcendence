export interface game {
    played_at: Date,
    player1_id: number;
    player2_id: number,
    type: string,
    player1_score: number,
    player2_score: number,
    winner_id: number;
}

export interface TimeDict {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface StatWithTimeDict {
    total_play_time: TimeDict;
    avg_play_time: TimeDict;
    longest_play_time: TimeDict;
}

export interface stat {
    total_play_time: number;
    avg_play_time: number;
    longest_play_time: number;
}

export interface WeekStats {
  week: number;
  games_played: number;
  range: string;
}
