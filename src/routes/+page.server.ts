import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { STATIC_PRIVATE_KEY } from '$env/static/private';
import { PUBLIC_STATIC_KEY } from '$env/static/public';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Access dynamic environment variables (can change at runtime)
	const dynamicPublicKey = publicEnv.PUBLIC_DYNAMIC_KEY;
	const dynamicPrivateKey = privateEnv.DYNAMIC_PRIVATE_KEY;

	// For demonstration, we'll also access static variables through process.env
	// In a real app, you'd use $env/static/private for build-time variables
	const staticPublicKey = PUBLIC_STATIC_KEY;
	const staticPrivateKey = STATIC_PRIVATE_KEY;

	// Return the environment variables to the client
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
		}
	};
};
