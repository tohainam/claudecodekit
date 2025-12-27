# Error Handling & Logging

Best practices for robust error handling and effective logging.

## Error Handling Principles

### Fail Fast
```javascript
// BAD: Silent failure, continues with bad state
function processUser(user) {
  if (!user) {
    user = {};  // Silently create empty object
  }
  // Continue processing potentially invalid data...
}

// GOOD: Fail fast, fail loudly
function processUser(user) {
  if (!user) {
    throw new ValidationError('User is required');
  }
  // Safe to proceed...
}
```

### Fail Secure
```javascript
// BAD: Fail open (security risk)
async function checkAccess(user, resource) {
  try {
    return await accessControl.check(user, resource);
  } catch (error) {
    return true;  // Allow access on error - DANGEROUS
  }
}

// GOOD: Fail secure (deny by default)
async function checkAccess(user, resource) {
  try {
    return await accessControl.check(user, resource);
  } catch (error) {
    logger.error('Access check failed', { user, resource, error });
    return false;  // Deny access on error - SAFE
  }
}
```

## Exception Handling Patterns

### Catch Specific Exceptions
```python
# BAD: Catching everything
try:
    result = risky_operation()
except Exception:
    pass  # Swallows all errors

# GOOD: Catch specific exceptions
try:
    result = risky_operation()
except ValidationError as e:
    logger.warning(f"Validation failed: {e}")
    return default_value
except NetworkError as e:
    logger.error(f"Network error: {e}")
    raise ServiceUnavailableError from e
except Exception as e:
    logger.exception("Unexpected error")
    raise  # Re-raise unknown exceptions
```

### Error Recovery Strategies
```javascript
// Strategy 1: Return default value
function getConfig(key) {
  try {
    return configService.get(key);
  } catch (error) {
    logger.warn(`Config ${key} not found, using default`);
    return defaults[key];
  }
}

// Strategy 2: Retry with backoff
async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await sleep(Math.pow(2, attempt) * 100);  // Exponential backoff
    }
  }
}

// Strategy 3: Circuit breaker
const breaker = new CircuitBreaker(riskyOperation, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});
```

### Custom Error Classes
```typescript
// Base application error
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Permission denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}
```

### Centralized Error Handling
```typescript
// Express error handler
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Log the error
  logger.error('Request failed', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  });

  // Operational errors: send error response
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    });
  }

  // Programming errors: generic response, alert team
  alertTeam(err);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
}
```

## Logging Best Practices

### Log Levels
| Level | When to Use | Example |
|-------|-------------|---------|
| **ERROR** | Application errors requiring attention | Failed payment, DB connection lost |
| **WARN** | Unexpected but handled situations | Deprecated API used, rate limit near |
| **INFO** | Significant business events | User registered, order placed |
| **DEBUG** | Detailed diagnostic information | Function inputs/outputs, state changes |
| **TRACE** | Very detailed tracing | Loop iterations, low-level details |

### Structured Logging
```javascript
// BAD: Unstructured string interpolation
console.log(`User ${userId} placed order ${orderId} for $${amount}`);

// GOOD: Structured logging
logger.info('Order placed', {
  userId,
  orderId,
  amount,
  currency: 'USD',
  timestamp: new Date().toISOString()
});

// Output (JSON)
{
  "level": "info",
  "message": "Order placed",
  "userId": "user_123",
  "orderId": "order_456",
  "amount": 99.99,
  "currency": "USD",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### What to Log

```
✓ LOG:
├── Authentication events (login, logout, failed attempts)
├── Authorization failures (access denied)
├── Input validation failures
├── System errors and exceptions
├── Significant business events
├── External service calls (start, end, status)
├── Performance metrics (response times, queue lengths)
└── Configuration changes

✗ DON'T LOG:
├── Passwords (even hashed)
├── API keys, tokens, secrets
├── Credit card numbers, SSN
├── Personal health information
├── Full request bodies with sensitive data
└── Encryption keys
```

### Sensitive Data Handling
```typescript
// Utility to mask sensitive fields
function sanitizeForLogging(data: object): object {
  const sensitiveFields = ['password', 'token', 'apiKey', 'ssn', 'creditCard'];
  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Mask email partially
  if ('email' in sanitized && typeof sanitized.email === 'string') {
    const [local, domain] = sanitized.email.split('@');
    sanitized.email = `${local[0]}***@${domain}`;
  }

  return sanitized;
}

// Usage
logger.info('User created', sanitizeForLogging(userData));
```

### Correlation IDs
```typescript
// Middleware to add correlation ID
function correlationMiddleware(req, res, next) {
  const correlationId = req.headers['x-correlation-id'] || uuid();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  // Add to async context for all logs in this request
  asyncLocalStorage.run({ correlationId }, () => next());
}

// Logger with correlation ID
function log(level, message, data = {}) {
  const store = asyncLocalStorage.getStore();
  logger[level](message, {
    ...data,
    correlationId: store?.correlationId
  });
}
```

## Error Messages

### User-Facing Messages
```javascript
// BAD: Technical error exposed to user
res.status(500).json({
  error: "SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry"
});

// GOOD: User-friendly message, technical details logged
logger.error('Database constraint violation', {
  error: sqlError,
  table: 'users',
  field: 'email'
});

res.status(409).json({
  error: {
    code: 'EMAIL_EXISTS',
    message: 'An account with this email already exists'
  }
});
```

### Developer Messages
```javascript
// Include context for debugging
throw new Error(
  `Failed to process order ${orderId}: ` +
  `Payment declined for user ${userId}. ` +
  `Amount: ${amount}, Currency: ${currency}`
);

// Use error cause (ES2022+)
try {
  await paymentService.charge(amount);
} catch (error) {
  throw new Error('Order processing failed', { cause: error });
}
```

## Language-Specific Patterns

### Python Exception Groups (3.11+)
```python
# Handling multiple exceptions from concurrent operations
async def process_all(items):
    results = []
    exceptions = []

    async with asyncio.TaskGroup() as tg:
        for item in items:
            tg.create_task(process_item(item))

# Handling ExceptionGroup
try:
    await process_all(items)
except* ValueError as eg:
    for exc in eg.exceptions:
        logger.warning(f"Validation error: {exc}")
except* NetworkError as eg:
    for exc in eg.exceptions:
        logger.error(f"Network error: {exc}")
```

### TypeScript Result Pattern
```typescript
// Result type for explicit error handling
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { success: false, error: 'Division by zero' };
  }
  return { success: true, value: a / b };
}

// Usage
const result = divide(10, 2);
if (result.success) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

## Error Handling Checklist

```
EXCEPTION HANDLING
□ Catching specific exceptions (not bare except)?
□ Failing secure (deny on error)?
□ Not swallowing exceptions silently?
□ Custom error classes for domain errors?
□ Errors propagated or handled appropriately?
□ Cleanup in finally blocks?

LOGGING
□ Appropriate log levels used?
□ Structured logging format?
□ Sensitive data excluded/masked?
□ Correlation IDs for request tracing?
□ Sufficient context for debugging?
□ Logs don't impact performance?

USER EXPERIENCE
□ User-friendly error messages?
□ Technical details hidden from users?
□ Actionable guidance when possible?
□ Consistent error response format?

MONITORING
□ Errors trigger alerts?
□ Error rates monitored?
□ Log aggregation configured?
□ Error patterns analyzed regularly?
```
