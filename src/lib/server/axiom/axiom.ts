import { Axiom } from '@axiomhq/js';
import { env } from '$env/dynamic/private';

/**
 * Axiom client instance for server-side operations
 * Configured with API token from environment variables
 */
export const axiom = new Axiom({
	token: env.AXIOM_TOKEN || '',
	onError: (err) => {
		console.error('Axiom client error:', err);
	}
});

/**
 * Get the configured Axiom dataset name from environment variables
 */
export const getDatasetName = (): string => {
	const dataset = env.AXIOM_DATASET;
	if (!dataset) {
		console.warn('AXIOM_DATASET environment variable is not set');
		return 'default';
	}
	return dataset;
};

/**
 * Check if Axiom is properly configured
 */
export const isAxiomConfigured = (): boolean => {
	return !!(env.AXIOM_TOKEN && env.AXIOM_DATASET);
};
