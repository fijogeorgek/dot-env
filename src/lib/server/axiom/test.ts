import { log, logError, isAxiomConfigured } from './index.js';
import { AppError, ErrorType } from './errors.js';
import { DatabaseLogger, DatabaseOperation } from './database.js';

/**
 * Test script to validate Axiom logging implementation
 */
export class AxiomTestSuite {
	/**
	 * Run all tests
	 */
	static async runAllTests(): Promise<void> {
		console.log('🧪 Starting Axiom logging tests...\n');

		// Check configuration
		await this.testConfiguration();
		
		// Test basic logging
		await this.testBasicLogging();
		
		// Test error logging
		await this.testErrorLogging();
		
		// Test request/response logging
		await this.testRequestResponseLogging();
		
		// Test database logging
		await this.testDatabaseLogging();
		
		console.log('\n✅ All Axiom logging tests completed!');
	}

	/**
	 * Test Axiom configuration
	 */
	static async testConfiguration(): Promise<void> {
		console.log('📋 Testing Axiom configuration...');
		
		const isConfigured = isAxiomConfigured();
		
		if (isConfigured) {
			log.info('Axiom is properly configured', {
				test: 'configuration',
				status: 'success'
			});
			console.log('✅ Axiom configuration: OK');
		} else {
			log.warn('Axiom is not configured - logs will only go to console', {
				test: 'configuration',
				status: 'warning'
			});
			console.log('⚠️  Axiom configuration: Missing (console only)');
		}
	}

	/**
	 * Test basic logging levels
	 */
	static async testBasicLogging(): Promise<void> {
		console.log('\n📝 Testing basic logging levels...');
		
		log.debug('This is a debug message', {
			test: 'basic_logging',
			level: 'debug',
			timestamp: new Date().toISOString()
		});
		
		log.info('This is an info message', {
			test: 'basic_logging',
			level: 'info',
			data: { userId: 123, action: 'test' }
		});
		
		log.warn('This is a warning message', {
			test: 'basic_logging',
			level: 'warn',
			reason: 'test_warning'
		});
		
		console.log('✅ Basic logging levels: OK');
	}

	/**
	 * Test error logging
	 */
	static async testErrorLogging(): Promise<void> {
		console.log('\n🚨 Testing error logging...');
		
		// Test regular error
		const testError = new Error('This is a test error');
		logError(testError, {
			test: 'error_logging',
			errorType: 'test_error',
			context: 'unit_test'
		});
		
		// Test AppError
		const appError = new AppError(
			'This is a test application error',
			ErrorType.VALIDATION,
			400,
			{
				test: 'error_logging',
				validationField: 'email'
			}
		);
		
		log.error('Application error occurred', {
			test: 'error_logging',
			error: {
				name: appError.name,
				message: appError.message,
				type: appError.type,
				statusCode: appError.statusCode
			}
		});
		
		console.log('✅ Error logging: OK');
	}

	/**
	 * Test request/response logging
	 */
	static async testRequestResponseLogging(): Promise<void> {
		console.log('\n🌐 Testing request/response logging...');
		
		const requestId = `test_${Date.now()}`;
		
		log.request('Test API request', {
			method: 'POST',
			url: '/api/test',
			requestId,
			userAgent: 'AxiomTestSuite/1.0',
			ip: '127.0.0.1'
		});
		
		// Simulate processing time
		await new Promise(resolve => setTimeout(resolve, 100));
		
		log.response('Test API response', {
			method: 'POST',
			url: '/api/test',
			requestId,
			status: 200,
			duration: 100
		});
		
		console.log('✅ Request/response logging: OK');
	}

	/**
	 * Test database logging
	 */
	static async testDatabaseLogging(): Promise<void> {
		console.log('\n🗄️  Testing database logging...');
		
		// Test successful database operation
		await DatabaseLogger.logSelect('test_table', async () => {
			// Simulate database query
			await new Promise(resolve => setTimeout(resolve, 50));
			return [{ id: 1, name: 'test' }];
		}, {
			requestId: `db_test_${Date.now()}`,
			query: 'SELECT * FROM test_table WHERE id = ?',
			params: [1]
		});
		
		// Test database error
		try {
			await DatabaseLogger.logInsert('test_table', async () => {
				throw new Error('Simulated database error');
			}, {
				requestId: `db_error_test_${Date.now()}`,
				query: 'INSERT INTO test_table (name) VALUES (?)',
				params: ['test']
			});
		} catch (error) {
			// Expected error
		}
		
		// Test connection logging
		DatabaseLogger.logConnection('connect', {
			database: 'test.db',
			driver: 'sqlite'
		});
		
		console.log('✅ Database logging: OK');
	}

	/**
	 * Test performance logging
	 */
	static async testPerformanceLogging(): Promise<void> {
		console.log('\n⚡ Testing performance logging...');
		
		const startTime = Date.now();
		
		// Simulate some work
		await new Promise(resolve => setTimeout(resolve, 200));
		
		const duration = Date.now() - startTime;
		
		log.info('Performance test completed', {
			test: 'performance',
			operation: 'simulated_work',
			duration,
			metrics: {
				memoryUsage: process.memoryUsage(),
				uptime: process.uptime()
			}
		});
		
		console.log('✅ Performance logging: OK');
	}

	/**
	 * Generate test data for validation
	 */
	static async generateTestData(): Promise<void> {
		console.log('\n🎯 Generating test data for validation...');
		
		// Generate various log types
		for (let i = 0; i < 5; i++) {
			log.info(`Test log entry ${i + 1}`, {
				test: 'data_generation',
				iteration: i + 1,
				timestamp: new Date().toISOString(),
				randomData: Math.random()
			});
			
			// Small delay between logs
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		
		console.log('✅ Test data generation: OK');
	}
}

/**
 * Run tests if this file is executed directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
	AxiomTestSuite.runAllTests().catch(console.error);
}
