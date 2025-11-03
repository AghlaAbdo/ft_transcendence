
CREATE TABLE IF NOT EXISTS USERS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    -- password VARCHAR(255) NOT NULL,
    password VARCHAR(255) , -- Nullable - NULL for OAuth users
    avatar_url VARCHAR(255) NOT NULL, -- Generated via generatePingPongAvatar
    
    -- Account verification
    -- isAccountVerified INTEGER DEFAULT 0,
    -- verificationToken TEXT,
    -- verificationTokenExpiresAt DATETIME,

    isAccountVerified INTEGER DEFAULT 0,
    verificationToken TEXT,
    verificationTokenExpiresAt DATETIME,
    resetPasswordToken TEXT,
    resetPasswordExpiresAt DATETIME,
    
    -- Game stats
    points INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    rank INTEGER NOT NULL DEFAULT 0,

    --OAuth 
    is_google_auth INTEGER DEFAULT 0,
    
    -- Profile info
    location VARCHAR(100),
    -- online_status BOOLEAN NOT NULL DEFAULT FALSE,
    online_status INTEGER NOT NULL DEFAULT 0,

    is_2fa_enabled BOOLEAN DEFAULT 0,
    totp_secret VARCHAR(255),
    
    -- Timestamps
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS FRIENDS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  blocked_by INTEGER, -- null unless statis is blocked
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_by) REFERENCES users(id) ON DELETE CASCADE,

  UNIQUE(user_id, friend_id)
);


CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  actor_id INTEGER,
  type TEXT NOT NULL CHECK (type IN (
    'friend_request',
    'friend_accept',
    'game_invite',
    'message',
    'tournament_invite'
  )),
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

