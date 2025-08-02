import { log, logError, type ErrorContext, type RequestContext } from './logger.js';

/**
 * Enhanced error types for better categorization
 */
export enum ErrorType {
	VALIDATION = 'validation',
	DATABASE = 'database',
	AUTHENTICATION = 'authentication',
	AUTHORIZATION = 'authorization',
	NOT_FOUND = 'not_found',
	RATE_LIMIT = 'rate_limit',
	EXTERNAL_API = 'external_api',
	INTERNAL = 'internal',
	NETWORK = 'network',
	TIMEOUT = 'timeout'
}

/**
 * Enhanced error context with additional metadata
 */
export interface EnhancedErrorContext extends ErrorContext {
	errorType?: ErrorType;
	statusCode?: number;
	requestId?: string;
	userId?: string;
	sessionId?: string;
	operation?: string;
	resource?: string;
	metadata?: Record<string, unknown>;
}

/**
 * Custom application error class with enhanced logging
 */
export class AppError extends Error {
	public readonly type: ErrorType;
	public readonly statusCode: number;
	public readonly context: EnhancedErrorContext;
	public readonly isOperational: boolean;

	constructor(
		message: string,
		type: ErrorType = ErrorType.INTERNAL,
		statusCode: number = 500,
		context: Partial<EnhancedErrorContext> = {},
		isOperational: boolean = true
	) {
		super(message);
		
		this.name = 'AppError';
		this.type = type;
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.context = {
			...context,
			errorType: type,
			statusCode
		};

		// Capture stack trace
		Error.captureStackTrace(this, AppError);
	}
}

/**
 * Log application errors with enhanced context
 */
export const logAppError = (error: AppError, additionalContext?: Partial<EnhancedErrorContext>) => {
	const context: EnhancedErrorContext = {
		...error.context,
		...additionalContext,
		error: {
			name: error.name,
			message: error.message,
			stack: error.stack
		}
	};

	logError(error, context);
};

/**
 * Log validation errors
 */
export const logValidationError = (
	message: string,
	fields: Record<string, string[]>,
	context?: Partial<EnhancedErrorContext>
) => {
	log.warn(`Validation error: ${message}`, {
		...context,
		errorType: ErrorType.VALIDATION,
		statusCode: 400,
		validationErrors: fields
	});
};

/**
 * Log database errors with query context
 */
export const logDatabaseError = (
	error: Error,
	operation: string,
	table?: string,
	query?: string,
	context?: Partial<EnhancedErrorContext>
) => {
	logError(error, {
		...context,
		errorType: ErrorType.DATABASE,
		operation,
		resource: table,
		metadata: {
			query: query ? query.substring(0, 500) : undefined // Truncate long queries
		}
	});
};

/**
 * Log authentication errors
 */
export const logAuthError = (
	message: string,
	userId?: string,
	context?: Partial<EnhancedErrorContext>
) => {
	log.warn(`Authentication error: ${message}`, {
		...context,
		errorType: ErrorType.AUTHENTICATION,
		statusCode: 401,
		userId
	});
};

/**
 * Log authorization errors
 */
export const logAuthzError = (
	message: string,
	userId?: string,
	resource?: string,
	action?: string,
	context?: Partial<EnhancedErrorContext>
) => {
	log.warn(`Authorization error: ${message}`, {
		...context,
		errorType: ErrorType.AUTHORIZATION,
		statusCode: 403,
		userId,
		resource,
		metadata: { action }
	});
};

/**
 * Log external API errors
 */
export const logExternalApiError = (
	error: Error,
	apiName: string,
	endpoint: string,
	statusCode?: number,
	context?: Partial<EnhancedErrorContext>
) => {
	logError(error, {
		...context,
		errorType: ErrorType.EXTERNAL_API,
		statusCode: statusCode || 500,
		resource: apiName,
		metadata: {
			endpoint,
			externalStatusCode: statusCode
		}
	});
};

/**
 * Create error response with logging
 */
export const createErrorResponse = (
	error: AppError | Error,
	requestContext?: RequestContext
): { error: string; status: number } => {
	if (error instanceof AppError) {
		logAppError(error, requestContext);
		return {
			error: error.message,
			status: error.statusCode
		};
	}

	// Handle unknown errors
	logError(error, {
		...requestContext,
		errorType: ErrorType.INTERNAL,
		statusCode: 500
	});

	return {
		error: 'Internal server error',
		status: 500
	};
};

/**
 * Async error handler wrapper
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
	fn: T,
	context?: Partial<EnhancedErrorContext>
): T => {
	return (async (...args: Parameters<T>) => {
		try {
			return await fn(...args);
		} catch (error) {
			if (error instanceof AppError) {
				logAppError(error, context);
			} else {
				logError(error as Error, {
					...context,
					errorType: ErrorType.INTERNAL
				});
			}
			throw error;
		}
	}) as T;
};

/**
 * Common error factory functions
 */
export const createValidationError = (message: string, fields?: Record<string, string[]>) => {
	return new AppError(message, ErrorType.VALIDATION, 400, { validationErrors: fields });
};

export const createNotFoundError = (resource: string, id?: string | number) => {
	return new AppError(
		`${resource} not found${id ? ` with id: ${id}` : ''}`,
		ErrorType.NOT_FOUND,
		404,
		{ resource, metadata: { id } }
	);
};

export const createAuthError = (message: string = 'Authentication required') => {
	return new AppError(message, ErrorType.AUTHENTICATION, 401);
};

export const createAuthzError = (message: string = 'Access denied') => {
	return new AppError(message, ErrorType.AUTHORIZATION, 403);
};

export const createDatabaseError = (message: string, operation: string, table?: string) => {
	return new AppError(message, ErrorType.DATABASE, 500, { operation, resource: table });
};
