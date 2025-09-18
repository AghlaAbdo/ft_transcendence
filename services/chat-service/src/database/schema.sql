-- Create chats table
CREATE TABLE chats (
    chat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender INTEGER NOT NULL,
    receiver INTEGER NOT NULL,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(chat_id)
);

// check this shit later !!

-- Auto-update last_message_id for each chat to the latest message
UPDATE chats SET last_message_id = (
    SELECT id FROM messages
    WHERE chat_id = chats.chat_id
    ORDER BY created_at DESC, id DESC
    LIMIT 1
);