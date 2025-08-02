import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { DatabaseLogger } from '$lib/server/axiom/database';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = new Database(env.DATABASE_URL);

// Log database connection
DatabaseLogger.logConnection('connect', {
    database: env.DATABASE_URL,
    driver: 'better-sqlite3'
});

// Better-sqlite3 doesn't have event emitters, so we'll handle errors in queries

export const db = drizzle(client, { schema });
