# Axiom Logging Implementation

This document describes the comprehensive Axiom logging implementation for the SvelteKit application.

## Overview

The implementation provides structured logging with the following features:
- **Dual Transport**: Logs to both console (development) and Axiom (production)
- **Request/Response Logging**: Automatic logging of all HTTP requests and responses
- **Error Handling**: Enhanced error logging with context and stack traces
- **Database Logging**: Performance monitoring for database operations
- **Type Safety**: Full TypeScript support with proper interfaces

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Axiom logging configuration
AXIOM_TOKEN=your-axiom-api-token-here
AXIOM_DATASET=your-axiom-dataset-name-here
```

### Getting Axiom Credentials

1. Sign up at [axiom.co](https://axiom.co)
2. Create a new dataset
3. Generate an API token with ingest permissions
4. Update your `.env` file with the real values

## Usage

### Basic Logging

```typescript
import { log } from '$lib/server/axiom';

// Different log levels
log.debug('Debug message', { userId: 123 });
log.info('User logged in', { userId: 123, email: 'user@example.com' });
log.warn('Rate limit approaching', { userId: 123, requests: 95 });
log.error('Authentication failed', { userId: 123, reason: 'invalid_token' });
```

### Request/Response Logging

Request/response logging is automatic via the global hook in `src/hooks.server.ts`. Each request gets:
- Unique request ID for tracing
- Method, URL, user agent, IP address
- Response status and duration
- Automatic error handling

### Error Logging

```typescript
import { logError, AppError, ErrorType } from '$lib/server/axiom';

// Log regular errors
try {
  // some operation
} catch (error) {
  logError(error as Error, {
    operation: 'user_creation',
    userId: 123
  });
}

// Create and log application errors
const error = new AppError(
  'User not found',
  ErrorType.NOT_FOUND,
  404,
  { userId: 123 }
);
```

### Database Logging

```typescript
import { DatabaseLogger, DatabaseOperation } from '$lib/server/axiom';

// Wrap database operations
const users = await DatabaseLogger.logSelect('users', async () => {
  return db.select().from(users).where(eq(users.id, userId));
}, {
  requestId: 'req_123',
  query: 'SELECT * FROM users WHERE id = ?',
  params: [userId]
});
```

## File Structure

```
src/lib/server/axiom/
├── index.ts          # Main exports
├── axiom.ts          # Axiom client configuration
├── logger.ts         # Core logging functionality
├── middleware.ts     # Request/response logging
├── errors.ts         # Error handling utilities
├── database.ts       # Database logging utilities
└── test.ts           # Test suite
```

## API Endpoints

### Test Logging
- `GET /api/test-logging` - Run comprehensive logging tests
- `POST /api/test-logging` - Generate test logs

Example:
```bash
# Run tests
curl http://localhost:5173/api/test-logging

# Generate 5 warning logs
curl -X POST http://localhost:5173/api/test-logging \
  -H "Content-Type: application/json" \
  -d '{"count": 5, "type": "warn"}'
```

## Log Structure

All logs include these base fields:
- `timestamp`: ISO 8601 timestamp
- `service`: Service name ('sveltekit-app')
- `environment`: Current environment (development/production)
- `type`: Log type (request, response, database, etc.)

### Request Logs
```json
{
  "timestamp": "2025-08-02T12:00:00.000Z",
  "service": "sveltekit-app",
  "environment": "development",
  "type": "request",
  "method": "POST",
  "url": "http://localhost:5173/api/items",
  "pathname": "/api/items",
  "userAgent": "Mozilla/5.0...",
  "ip": "::1",
  "requestId": "req_1754136349192_ucf2unzp1"
}
```

### Response Logs
```json
{
  "timestamp": "2025-08-02T12:00:00.100Z",
  "service": "sveltekit-app",
  "environment": "development",
  "type": "response",
  "method": "POST",
  "url": "http://localhost:5173/api/items",
  "requestId": "req_1754136349192_ucf2unzp1",
  "status": 201,
  "duration": 100,
  "itemId": 123
}
```

### Database Logs
```json
{
  "timestamp": "2025-08-02T12:00:00.050Z",
  "service": "sveltekit-app",
  "environment": "development",
  "type": "database",
  "operation": "insert",
  "table": "items",
  "requestId": "req_1754136349192_ucf2unzp1",
  "duration": 25,
  "rowsAffected": 1
}
```

## Features

### ✅ Implemented
- [x] Axiom client configuration
- [x] Structured logging with multiple transports
- [x] Request/response logging middleware
- [x] Error handling and logging
- [x] Database operation logging
- [x] TypeScript interfaces and types
- [x] Test suite and validation endpoints
- [x] Global error handling
- [x] Performance metrics

### 🔄 Development Mode
- Console logging with pretty printing
- All log levels (debug, info, warn, error)
- Request tracing with unique IDs
- Database connection logging

### 🚀 Production Mode
- Logs sent to Axiom (when configured)
- Info level and above sent to Axiom
- All levels still logged to console
- Error aggregation and alerting

## Testing

Run the test suite:
```bash
# Start the development server
npm run dev

# Test the logging implementation
curl http://localhost:5173/api/test-logging
```

The test will validate:
- Axiom configuration
- All log levels
- Request/response logging
- Database logging
- Error handling

## Monitoring

With proper Axiom credentials, you can:
- View real-time logs in the Axiom dashboard
- Create alerts for errors and performance issues
- Build dashboards for request metrics
- Query logs with APL (Axiom Processing Language)
- Set up notifications for critical errors

## Next Steps

1. **Get Axiom credentials** and update `.env`
2. **Deploy to production** to see logs in Axiom
3. **Create dashboards** for monitoring
4. **Set up alerts** for critical errors
5. **Add custom metrics** as needed
