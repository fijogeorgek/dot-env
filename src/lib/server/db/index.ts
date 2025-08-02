import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { DatabaseLogger } from '$lib/server/axiom/database';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const connection = mysql.createPool(env.DATABASE_URL);

DatabaseLogger.logConnection('connect', {
    database: env.DATABASE_URL,
    driver: 'mysql2'
});

export const db = drizzle(connection, { schema, mode: 'default' });