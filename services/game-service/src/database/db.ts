import Database, { Database as DatabaseType } from 'better-sqlite3';
import fs from 'fs';
import { DB_NAME } from '../config/env';

let db: DatabaseType | null = null;

export function getDb(): DatabaseType {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDb() first.');
  }
  return db;
}

export function initializeDb() {
  if (db) {
    console.log('Database is already initialized.');
    return;
  }

  try {
    db = new Database(`./src/database/${DB_NAME}`);
    console.log(`Connected to database: ${DB_NAME}`);

    const schema = fs.readFileSync('./src/database/schema.sql', 'utf8');
    db.exec(schema);
    console.log('Database schema applied.');
  } catch (err) {
    console.error('Failed to initialize the database:', err);
    throw err;
  }
}
