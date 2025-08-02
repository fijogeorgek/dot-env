import { Logger, AxiomJSTransport, ConsoleTransport } from '@axiomhq/logging';
import { axiom, getDatasetName, isAxiomConfigured } from './axiom.js';

/**
 * Log levels for structured logging
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Base log context interface
 */
export interface LogContext {
	[key: string]: unknown;
	timestamp?: string;
	service?: string;
	environment?: string;
}

/**
 * Request context for API logging
 */
export interface RequestContext extends LogContext {
	method?: string;
	url?: string;
	userAgent?: string;
	ip?: string;
	requestId?: string;
}

/**
 * Database operation context
 */
export interface DatabaseContext extends LogContext {
	operation?: string;
	table?: string;
	duration?: number;
	rowsAffected?: number;
}

/**
 * Error context for error logging
 */
export interface ErrorContext extends LogContext {
	error?: {
		name: string;
		message: string;
		stack?: string;
	};
	userId?: string;
	sessionId?: string;
}

/**
 * Create and configure the logger instance
 */
const createLogger = (): Logger => {
	const transports = [];

	// Always add console transport for development
	transports.push(
		new ConsoleTransport({
			logLevel: 'debug',
			prettyPrint: true
		})
	);

	// Add Axiom transport if properly configured
	if (isAxiomConfigured()) {
		transports.push(
			new AxiomJSTransport({
				axiom,
				dataset: getDatasetName(),
				logLevel: 'info' // Only send info and above to Axiom
			})
		);
	} else {
		console.warn('Axiom not configured. Logs will only be sent to console.');
	}

	return new Logger({
		transports
	});
};

/**
 * Global logger instance
 */
export const logger = createLogger();

/**
 * Enhanced logging functions with context
 */
export const log = {
	/**
	 * Log debug messages (development only)
	 */
	debug: (message: string, context?: LogContext) => {
		logger.debug(message, {
			...getBaseContext(),
			...context
		});
	},

	/**
	 * Log informational messages
	 */
	info: (message: string, context?: LogContext) => {
		logger.info(message, {
			...getBaseContext(),
			...context
		});
	},

	/**
	 * Log warning messages
	 */
	warn: (message: string, context?: LogContext) => {
		logger.warn(message, {
			...getBaseContext(),
			...context
		});
	},

	/**
	 * Log error messages
	 */
	error: (message: string, context?: ErrorContext) => {
		logger.error(message, {
			...getBaseContext(),
			...context
		});
	},

	/**
	 * Log API requests
	 */
	request: (message: string, context: RequestContext) => {
		logger.info(`[REQUEST] ${message}`, {
			...getBaseContext(),
			type: 'request',
			...context
		});
	},

	/**
	 * Log API responses
	 */
	response: (message: string, context: RequestContext & { status?: number; duration?: number }) => {
		logger.info(`[RESPONSE] ${message}`, {
			...getBaseContext(),
			type: 'response',
			...context
		});
	},

	/**
	 * Log database operations
	 */
	database: (message: string, context: DatabaseContext) => {
		logger.info(`[DATABASE] ${message}`, {
			...getBaseContext(),
			type: 'database',
			...context
		});
	}
};

/**
 * Get base context that's added to all logs
 */
function getBaseContext(): LogContext {
	return {
		timestamp: new Date().toISOString(),
		service: 'sveltekit-app',
		environment: process.env.NODE_ENV || 'development'
	};
}

/**
 * Utility function to log errors with full context
 */
export const logError = (error: Error, context?: ErrorContext) => {
	log.error(error.message, {
		...context,
		error: {
			name: error.name,
			message: error.message,
			stack: error.stack
		}
	});
};

/**
 * Utility function to create a request ID for tracing
 */
export const generateRequestId = (): string => {
	return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
