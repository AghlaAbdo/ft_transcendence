-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
    chat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender INTEGER NOT NULL,
    receiver INTEGER NOT NULL,
    last_message_content TEXT NOT NULL,
    last_message_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_id INTEGER,
    FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    sender INTEGER NOT NULL,
    receiver INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_ INTEGER DEFAULT 0,
    FOREIGN KEY (chat_id) REFERENCES chats(chat_id) ON DELETE CASCADE
);