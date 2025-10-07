
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
    
    -- Profile info
    location VARCHAR(100),
    online_status BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamps
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. FRIENDSHIPS TABLE - Friend system

CREATE TABLE IF NOT EXISTS FRIENDS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, friend_id)
);
