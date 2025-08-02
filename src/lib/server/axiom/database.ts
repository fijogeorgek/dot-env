import { log, logError, type DatabaseContext } from './logger.js';
import { logDatabaseError, createDatabaseError } from './errors.js';

/**
 * Database operation types for logging
 */
export enum DatabaseOperation {
	SELECT = 'select',
	INSERT = 'insert',
	UPDATE = 'update',
	DELETE = 'delete',
	TRANSACTION = 'transaction',
	MIGRATION = 'migration'
}

/**
 * Database performance metrics
 */
export interface DatabaseMetrics {
	duration: number;
	rowsAffected?: number;
	rowsReturned?: number;
	querySize?: number;
}

/**
 * Enhanced database context
 */
export interface EnhancedDatabaseContext extends DatabaseContext {
	operation: DatabaseOperation;
	table?: string;
	query?: string;
	params?: unknown[];
	metrics?: DatabaseMetrics;
	requestId?: string;
}

/**
 * Database operation wrapper with logging and error handling
 */
export class DatabaseLogger {
	/**
	 * Log a database operation with timing
	 */
	static async logOperation<T>(
		operation: DatabaseOperation,
		table: string,
		queryFn: () => Promise<T>,
		context?: Partial<EnhancedDatabaseContext>
	): Promise<T> {
		const startTime = Date.now();
		const operationContext: EnhancedDatabaseContext = {
			operation,
			table,
			...context
		};

		log.database(`Starting ${operation} operation on ${table}`, operationContext);

		try {
			const result = await queryFn();
			const duration = Date.now() - startTime;

			// Extract metrics from result if possible
			let metrics: DatabaseMetrics = { duration };
			
			if (Array.isArray(result)) {
				metrics.rowsReturned = result.length;
			} else if (result && typeof result === 'object' && 'changes' in result) {
				metrics.rowsAffected = (result as any).changes;
			}

			log.database(`Completed ${operation} operation on ${table}`, {
				...operationContext,
				metrics
			});

			return result;
		} catch (error) {
			const duration = Date.now() - startTime;
			
			logDatabaseError(
				error as Error,
				operation,
				table,
				context?.query,
				{
					...operationContext,
					metrics: { duration }
				}
			);

			throw createDatabaseError(
				`Database ${operation} operation failed on ${table}`,
				operation,
				table
			);
		}
	}

	/**
	 * Log a SELECT operation
	 */
	static async logSelect<T>(
		table: string,
		queryFn: () => Promise<T>,
		context?: Partial<EnhancedDatabaseContext>
	): Promise<T> {
		return this.logOperation(DatabaseOperation.SELECT, table, queryFn, context);
	}

	/**
	 * Log an INSERT operation
	 */
	static async logInsert<T>(
		table: string,
		queryFn: () => Promise<T>,
		context?: Partial<EnhancedDatabaseContext>
	): Promise<T> {
		return this.logOperation(DatabaseOperation.INSERT, table, queryFn, context);
	}

	/**
	 * Log an UPDATE operation
	 */
	static async logUpdate<T>(
		table: string,
		queryFn: () => Promise<T>,
		context?: Partial<EnhancedDatabaseContext>
	): Promise<T> {
		return this.logOperation(DatabaseOperation.UPDATE, table, queryFn, context);
	}

	/**
	 * Log a DELETE operation
	 */
	static async logDelete<T>(
		table: string,
		queryFn: () => Promise<T>,
		context?: Partial<EnhancedDatabaseContext>
	): Promise<T> {
		return this.logOperation(DatabaseOperation.DELETE, table, queryFn, context);
	}

	/**
	 * Log a transaction
	 */
	static async logTransaction<T>(
		queryFn: () => Promise<T>,
		context?: Partial<EnhancedDatabaseContext>
	): Promise<T> {
		return this.logOperation(DatabaseOperation.TRANSACTION, 'transaction', queryFn, context);
	}

	/**
	 * Log connection events
	 */
	static logConnection(event: 'connect' | 'disconnect' | 'error', context?: Partial<DatabaseContext>) {
		switch (event) {
			case 'connect':
				log.info('Database connection established', {
					type: 'database',
					event: 'connection',
					...context
				});
				break;
			case 'disconnect':
				log.info('Database connection closed', {
					type: 'database',
					event: 'disconnection',
					...context
				});
				break;
			case 'error':
				log.error('Database connection error', {
					type: 'database',
					event: 'connection_error',
					...context
				});
				break;
		}
	}

	/**
	 * Log slow queries
	 */
	static logSlowQuery(
		operation: DatabaseOperation,
		table: string,
		duration: number,
		threshold: number = 1000,
		context?: Partial<EnhancedDatabaseContext>
	) {
		if (duration > threshold) {
			log.warn(`Slow query detected: ${operation} on ${table}`, {
				...context,
				operation,
				table,
				metrics: { duration },
				threshold,
				type: 'slow_query'
			});
		}
	}

	/**
	 * Log database health check
	 */
	static async logHealthCheck(healthCheckFn: () => Promise<boolean>, context?: Partial<DatabaseContext>) {
		const startTime = Date.now();
		
		try {
			const isHealthy = await healthCheckFn();
			const duration = Date.now() - startTime;
			
			if (isHealthy) {
				log.info('Database health check passed', {
					type: 'database',
					event: 'health_check',
					status: 'healthy',
					duration,
					...context
				});
			} else {
				log.warn('Database health check failed', {
					type: 'database',
					event: 'health_check',
					status: 'unhealthy',
					duration,
					...context
				});
			}
			
			return isHealthy;
		} catch (error) {
			const duration = Date.now() - startTime;
			
			logError(error as Error, {
				type: 'database',
				event: 'health_check',
				status: 'error',
				duration,
				...context
			});
			
			return false;
		}
	}
}

/**
 * Utility function to extract table name from Drizzle queries
 */
export const extractTableName = (query: any): string => {
	// This is a simplified extraction - you might need to enhance this
	// based on your specific Drizzle usage patterns
	if (query && query.table && query.table.name) {
		return query.table.name;
	}
	return 'unknown';
};

/**
 * Create a database context with request ID
 */
export const createDatabaseContext = (
	operation: DatabaseOperation,
	table: string,
	requestId?: string,
	additionalContext?: Partial<EnhancedDatabaseContext>
): EnhancedDatabaseContext => {
	return {
		operation,
		table,
		requestId,
		...additionalContext
	};
};
