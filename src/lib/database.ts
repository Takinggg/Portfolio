import { Database } from 'sqlite3';

const db = new Database(':memory:');

export const initializeDatabase = () => {
    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)');
    });
};

export const getDatabase = () => db;