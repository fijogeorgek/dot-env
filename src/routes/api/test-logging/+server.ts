import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AxiomTestSuite } from '$lib/server/axiom/test';
import { log, generateRequestId, isAxiomConfigured } from '$lib/server/axiom';

/**
 * Test endpoint to validate Axiom logging implementation
 */
export const GET: RequestHandler = async ({ request }) => {
	const requestId = generateRequestId();
	const startTime = Date.now();
	
	log.request('Testing Axiom logging endpoint', {
		method: 'GET',
		url: request.url,
		requestId,
		userAgent: request.headers.get('user-agent') || undefined
	});

	try {
		// Check if Axiom is configured
		const configured = isAxiomConfigured();
		
		// Run test suite
		await AxiomTestSuite.runAllTests();
		
		const duration = Date.now() - startTime;
		
		log.response('Axiom logging test completed successfully', {
			method: 'GET',
			url: request.url,
			requestId,
			status: 200,
			duration
		});

		return json({
			success: true,
			message: 'Axiom logging test completed successfully',
			axiomConfigured: configured,
			duration,
			timestamp: new Date().toISOString()
		});
		
	} catch (error) {
		const duration = Date.now() - startTime;
		
		log.error('Axiom logging test failed', {
			requestId,
			method: 'GET',
			url: request.url,
			duration,
			error: {
				name: (error as Error).name,
				message: (error as Error).message,
				stack: (error as Error).stack
			}
		});
		
		log.response('Axiom logging test failed', {
			method: 'GET',
			url: request.url,
			requestId,
			status: 500,
			duration
		});

		return json({
			success: false,
			message: 'Axiom logging test failed',
			error: (error as Error).message,
			duration,
			timestamp: new Date().toISOString()
		}, { status: 500 });
	}
};

/**
 * POST endpoint to generate test logs
 */
export const POST: RequestHandler = async ({ request }) => {
	const requestId = generateRequestId();
	const startTime = Date.now();
	
	log.request('Generating test logs', {
		method: 'POST',
		url: request.url,
		requestId,
		userAgent: request.headers.get('user-agent') || undefined
	});

	try {
		const body = await request.json();
		const { count = 10, type = 'info' } = body;
		
		// Generate test logs
		for (let i = 0; i < count; i++) {
			switch (type) {
				case 'info':
					log.info(`Test info log ${i + 1}`, {
						test: 'log_generation',
						iteration: i + 1,
						requestId,
						data: { random: Math.random() }
					});
					break;
				case 'warn':
					log.warn(`Test warning log ${i + 1}`, {
						test: 'log_generation',
						iteration: i + 1,
						requestId,
						reason: 'test_warning'
					});
					break;
				case 'error':
					log.error(`Test error log ${i + 1}`, {
						test: 'log_generation',
						iteration: i + 1,
						requestId,
						error: {
							name: 'TestError',
							message: `Simulated error ${i + 1}`,
							stack: 'Test stack trace'
						}
					});
					break;
				default:
					log.info(`Test log ${i + 1}`, {
						test: 'log_generation',
						iteration: i + 1,
						requestId
					});
			}
			
			// Small delay between logs
			await new Promise(resolve => setTimeout(resolve, 10));
		}
		
		const duration = Date.now() - startTime;
		
		log.response('Test logs generated successfully', {
			method: 'POST',
			url: request.url,
			requestId,
			status: 200,
			duration,
			logsGenerated: count
		});

		return json({
			success: true,
			message: `Generated ${count} test logs of type '${type}'`,
			count,
			type,
			duration,
			timestamp: new Date().toISOString()
		});
		
	} catch (error) {
		const duration = Date.now() - startTime;
		
		log.error('Failed to generate test logs', {
			requestId,
			method: 'POST',
			url: request.url,
			duration,
			error: {
				name: (error as Error).name,
				message: (error as Error).message,
				stack: (error as Error).stack
			}
		});
		
		log.response('Failed to generate test logs', {
			method: 'POST',
			url: request.url,
			requestId,
			status: 500,
			duration
		});

		return json({
			success: false,
			message: 'Failed to generate test logs',
			error: (error as Error).message,
			duration,
			timestamp: new Date().toISOString()
		}, { status: 500 });
	}
};
