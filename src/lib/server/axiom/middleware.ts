import type { RequestEvent } from '@sveltejs/kit';
import { log, generateRequestId, type RequestContext } from './logger.js';

/**
 * Enhanced request event with logging context
 */
export interface LoggedRequestEvent extends RequestEvent {
	requestId: string;
	startTime: number;
}

/**
 * Extract request context from SvelteKit request event
 */
export const extractRequestContext = (event: RequestEvent): RequestContext => {
	const { request, url, getClientAddress } = event;
	
	return {
		method: request.method,
		url: url.toString(),
		pathname: url.pathname,
		search: url.search,
		userAgent: request.headers.get('user-agent') || undefined,
		ip: getClientAddress(),
		contentType: request.headers.get('content-type') || undefined,
		referer: request.headers.get('referer') || undefined
	};
};

/**
 * Log incoming request with context
 */
export const logRequest = (event: RequestEvent, requestId?: string): string => {
	const id = requestId || generateRequestId();
	const context = extractRequestContext(event);
	
	log.request(`${context.method} ${context.pathname}`, {
		...context,
		requestId: id
	});
	
	return id;
};

/**
 * Log response with context and timing
 */
export const logResponse = (
	event: RequestEvent,
	requestId: string,
	startTime: number,
	status: number,
	responseSize?: number
) => {
	const duration = Date.now() - startTime;
	const context = extractRequestContext(event);
	
	log.response(`${context.method} ${context.pathname} - ${status}`, {
		...context,
		requestId,
		status,
		duration,
		responseSize
	});
};

/**
 * Middleware wrapper for API routes that adds automatic request/response logging
 */
export const withLogging = <T extends (...args: any[]) => any>(
	handler: T,
	options?: {
		logRequest?: boolean;
		logResponse?: boolean;
		logBody?: boolean;
	}
): T => {
	const { logRequest: shouldLogRequest = true, logResponse: shouldLogResponse = true } = options || {};
	
	return (async (event: RequestEvent) => {
		const requestId = generateRequestId();
		const startTime = Date.now();
		
		// Add logging context to the event
		(event as LoggedRequestEvent).requestId = requestId;
		(event as LoggedRequestEvent).startTime = startTime;
		
		if (shouldLogRequest) {
			logRequest(event, requestId);
		}
		
		try {
			const response = await handler(event);
			
			if (shouldLogResponse) {
				// Extract status from response
				let status = 200;
				if (response && typeof response === 'object' && 'status' in response) {
					status = response.status;
				}
				
				logResponse(event, requestId, startTime, status);
			}
			
			return response;
		} catch (error) {
			if (shouldLogResponse) {
				logResponse(event, requestId, startTime, 500);
			}
			throw error;
		}
	}) as T;
};

/**
 * Create a request context for manual logging
 */
export const createRequestContext = (
	method: string,
	url: string,
	headers?: Record<string, string>
): RequestContext => {
	return {
		method,
		url,
		userAgent: headers?.['user-agent'],
		ip: headers?.['x-forwarded-for'] || headers?.['x-real-ip'],
		contentType: headers?.['content-type'],
		referer: headers?.['referer']
	};
};

/**
 * Utility to get request size from headers
 */
export const getRequestSize = (request: Request): number | undefined => {
	const contentLength = request.headers.get('content-length');
	return contentLength ? parseInt(contentLength, 10) : undefined;
};

/**
 * Utility to determine if request should be logged based on path
 */
export const shouldLogRequest = (pathname: string): boolean => {
	// Skip logging for static assets and health checks
	const skipPaths = [
		'/favicon.ico',
		'/robots.txt',
		'/_app/',
		'/health',
		'/ping'
	];
	
	return !skipPaths.some(path => pathname.startsWith(path));
};
