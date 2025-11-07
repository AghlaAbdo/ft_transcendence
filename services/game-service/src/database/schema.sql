CREATE TABLE IF NOT EXISTS Game(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_type TEXT NOT NULL,
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    player1_username TEXT NOT NULL,
    player2_username TEXT NOT NULL,
    player1_score INTEGER NOT NULL DEFAULT 0,
    player2_score INTEGER NOT NULL DEFAULT 0,
    winner_id INTEGER NOT NULL DEFAULT 0,
    play_time INTEGER NOT NULL DEFAULT 0,
    played_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK(player1_id != player2_id)
);