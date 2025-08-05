import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
// Using dynamic environment variables instead of static for Docker compatibility
// import { STATIC_PRIVATE_KEY } from '$env/static/private';
// import { PUBLIC_STATIC_KEY } from '$env/static/public';
import { db } from '$lib/server/db';
import { items } from '$lib/server/db/schema';
import { log, logError } from '$lib/server/axiom';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const startTime = Date.now();

	log.info('Loading page data', {
		operation: 'page_load',
		page: 'home'
	});

	// Access dynamic environment variables (can change at runtime)
	const dynamicPublicKey = publicEnv.PUBLIC_DYNAMIC_KEY;
	const dynamicPrivateKey = privateEnv.DYNAMIC_PRIVATE_KEY;

	// For demonstration, we'll access static variables through dynamic env
	// Using dynamic environment variables for Docker compatibility
	const staticPublicKey = publicEnv.PUBLIC_STATIC_KEY;
	const staticPrivateKey = privateEnv.STATIC_PRIVATE_KEY;

	// Load items from database
	let allItems = [];
	try {
		const dbStartTime = Date.now();
		allItems = await db.select().from(items).orderBy(items.createdAt);
		const dbDuration = Date.now() - dbStartTime;

		log.database('Successfully loaded items for page', {
			operation: 'select',
			table: 'items',
			duration: dbDuration,
			rowsAffected: allItems.length
		});
	} catch (error) {
		const dbDuration = Date.now() - dbStartTime;
		logError(error as Error, {
			operation: 'page_load_items',
			table: 'items',
			duration: dbDuration
		});

		log.warn('Continuing page load without items due to database error', {
			operation: 'page_load',
			page: 'home'
		});
		// Continue without items if database is not ready
	}

	const totalDuration = Date.now() - startTime;
	log.info('Page data loaded successfully', {
		operation: 'page_load',
		page: 'home',
		duration: totalDuration,
		itemCount: allItems.length
	});

	// Return the environment variables and items to the client
	// Note: Be careful about exposing sensitive data to the client
	return {
		envVars: {
			dynamic: {
				publicKey: dynamicPublicKey || 'Not set',
				privateKey: dynamicPrivateKey || 'Not set'
			},
			static: {
				publicKey: staticPublicKey || 'Not set',
				privateKey: staticPrivateKey || 'Not set'
			}
		},
		serverInfo: {
			timestamp: new Date().toISOString(),
			nodeEnv: process.env.NODE_ENV || 'development'
		},
		items: allItems
	};
};
