import Database from "better-sqlite3";
import fs from 'fs';
import { DB_NAME } from "../config/env";

const db = new Database(`./src/database/${DB_NAME}`);

const sql = fs.readFileSync('./src/database/schema.sql', 'utf8');

db.exec(sql);

export default db;