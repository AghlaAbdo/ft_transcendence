CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,      -- Unique notification ID
    user_id INTEGER NOT NULL,                  -- Recipient user
    actor_id INTEGER,                          -- User who triggered it (optional)
    type TEXT NOT NULL CHECK (type IN (
        'friend_request',
        'friend_accept',
        'game_invite',
        'game_start',
        'game_end',
        'message',
        'achievement',
        'level_up',
        'tournament_invite'
    )),
    title TEXT NOT NULL,                   -- Short title
    message TEXT NOT NULL,                     -- Full message                             -- Optional URL (game, profile, etc.)
    read INTEGER DEFAULT 0,                     -- Has the user seen it? 0=false, 1=true
    created_at TEXT DEFAULT (datetime('now')), -- When created (ISO string)
);
