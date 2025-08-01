import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Access dynamic environment variables (can change at runtime)
	const dynamicPublicKey = env.DYNAMIC_PUBLIC_KEY;
	const dynamicPrivateKey = env.DYNAMIC_PRIVATE_KEY;

	// For demonstration, we'll also access static variables through process.env
	// In a real app, you'd use $env/static/private for build-time variables
	const staticPublicKey = env.STATIC_PUBLIC_KEY;
	const staticPrivateKey = env.STATIC_PRIVATE_KEY;

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
			nodeEnv: env.NODE_ENV || 'development'
		}
	};
};
