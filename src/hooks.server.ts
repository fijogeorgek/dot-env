import type { Handle, HandleServerError } from '@sveltejs/kit';
import { logRequest, logResponse, shouldLogRequest, generateRequestId } from '$lib/server/axiom';
import { logAppError, AppError, ErrorType } from '$lib/server/axiom/errors';

/**
 * SvelteKit server hook for global request/response logging
 */
export const handle: Handle = async ({ event, resolve }) => {
	const { url } = event;

	// Skip logging for certain paths
	if (!shouldLogRequest(url.pathname)) {
		return resolve(event);
	}

	const requestId = generateRequestId();
	const startTime = Date.now();

	// Add request context to locals for use in routes
	event.locals.requestId = requestId;
	event.locals.startTime = startTime;

	// Log the incoming request
	logRequest(event, requestId);

	try {
		// Resolve the request
		const response = await resolve(event);

		// Log the response
		logResponse(event, requestId, startTime, response.status);

		return response;
	} catch (error) {
		// Log error response
		logResponse(event, requestId, startTime, 500);

		// Log the error with context
		if (error instanceof AppError) {
			logAppError(error, {
				requestId,
				method: event.request.method,
				url: event.url.toString()
			});
		} else {
			const appError = new AppError(
				'Unhandled server error',
				ErrorType.INTERNAL,
				500,
				{
					requestId,
					method: event.request.method,
					url: event.url.toString(),
					originalError: error instanceof Error ? error.message : String(error)
				}
			);
			logAppError(appError);
		}

		throw error;
	}
};

/**
 * Global error handler for unhandled server errors
 */
export const handleError: HandleServerError = ({ error, event }) => {
	const requestId = event.locals.requestId || generateRequestId();

	if (error instanceof AppError) {
		logAppError(error, {
			requestId,
			method: event.request.method,
			url: event.url.toString()
		});
	} else {
		const appError = new AppError(
			'Unhandled server error',
			ErrorType.INTERNAL,
			500,
			{
				requestId,
				method: event.request.method,
				url: event.url.toString(),
				originalError: error instanceof Error ? error.message : String(error)
			}
		);
		logAppError(appError);
	}

	// Return a safe error message to the client
	return {
		message: 'Internal server error',
		code: 'INTERNAL_ERROR'
	};
};
