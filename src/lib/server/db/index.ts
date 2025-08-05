import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { DatabaseLogger } from '$lib/server/axiom/database';
import { building } from '$app/environment';

let _db: ReturnType<typeof drizzle> | null = null;

function createDatabase() {
    if (_db) return _db;

    if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

    const connection = mysql.createPool(env.DATABASE_URL);

    DatabaseLogger.logConnection('connect', {
        database: env.DATABASE_URL,
        driver: 'mysql2'
    });

    _db = drizzle(connection, { schema, mode: 'default' });
    return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
    get(target, prop) {
        // Don't initialize database during build
        if (building) {
            throw new Error('Database access during build is not allowed');
        }

        const database = createDatabase();
        return database[prop as keyof typeof database];
    }
});