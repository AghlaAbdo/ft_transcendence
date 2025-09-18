import fp from 'fastify-plugin';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


const databasePlugin = async (fastify, options) => {
    //__dirname --> gives the absolute path 
    const dbPath = path.join(__dirname, '../../database/user-service.db');
    console.log("------> ", dbPath);
    const sqlPath = path.join(__dirname, '../../database/schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    const db = new Database(dbPath);

    db.pragma('foreign_keys = ON');

    db.exec(sql);

    fastify.decorate('db', db); // makes fastify.db acessible in routes/hooks

    // Close the database connection when the server stops
    fastify.addHook('onClose', (instance, done) => {
        instance.db.close();
        done();
    });
}

export default fp(databasePlugin, {
    name: 'database',
});