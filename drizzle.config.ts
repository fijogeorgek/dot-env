import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'mysql',
	dbCredentials: {
		url: process.env.DATABASE_URL
		// host: '162.253.227.90', // user this for local development
		// // host: 'localhost', // user this for production
		// port: 3306,
		// user: 'qa_envtest',
		// password: 'fM6Me43Kv3a5ZQO5',
		// database: 'qa_envtest'
		// ssl: true // can be boolean | "require" | "allow" | "prefer" | "verify-full" | options from node:tls
	},
	verbose: true,
	strict: true
});
