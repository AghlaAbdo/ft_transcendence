-- Create chats table
CREATE TABLE chats (
    chat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender INTEGER NOT NULL,
    receiver INTEGER NOT NULL,
    last_message_content TEXT NOT NULL,
    last_message_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    last_message_id INTEGER,
    FOREIGN KEY (last_message_id) REFERENCES messages(id)
);

-- Create messages table
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    sender INTEGER NOT NULL,
    receiver INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 