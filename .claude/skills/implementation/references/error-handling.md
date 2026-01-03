# Error Handling

## Error Categories

### By Recoverability

| Category          | Description                | Example          | Handling                 |
| ----------------- | -------------------------- | ---------------- | ------------------------ |
| **Recoverable**   | Can continue with fallback | Network timeout  | Retry, cache, default    |
| **Unrecoverable** | Must stop operation        | Invalid config   | Fail fast, clear message |
| **Bug**           | Programmer error           | Null dereference | Fix the code             |

### By Source

| Source               | Examples                     | Strategy               |
| -------------------- | ---------------------------- | ---------------------- |
| **User Input**       | Invalid email, missing field | Validate, return error |
| **External Service** | API down, timeout            | Retry, circuit breaker |
| **Environment**      | File not found, permission   | Check preconditions    |
| **Logic Bug**        | Impossible state             | Assert, crash in dev   |

## Error Handling Patterns

### Result/Either Type

Explicit error handling without exceptions:

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function parseJson<T>(text: string): Result<T, ParseError> {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: new ParseError(e.message) };
  }
}

// Usage: Forced to handle both cases
const result = parseJson<Config>(text);
if (result.ok) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

### Try-Catch at Boundaries

```typescript
// At system boundary: catch and convert
async function handleRequest(req: Request): Promise<Response> {
  try {
    const result = await processRequest(req);
    return Response.json(result);
  } catch (error) {
    // Convert to appropriate HTTP response
    if (error instanceof ValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    // Log unexpected errors, return generic message
    logger.error("Unexpected error", { error });
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

// Internal code: let exceptions bubble
function processRequest(req: Request) {
  const user = validateUser(req.body); // Throws ValidationError
  return userService.create(user); // Throws if user exists
}
```

### Error Wrapping

Preserve context while adding information:

```typescript
class AppError extends Error {
  constructor(message: string, public code: string, public cause?: Error) {
    super(message);
    this.name = "AppError";
  }
}

async function getUser(id: string): Promise<User> {
  try {
    return await db.query("SELECT * FROM users WHERE id = ?", [id]);
  } catch (dbError) {
    throw new AppError(
      `Failed to fetch user ${id}`,
      "USER_FETCH_FAILED",
      dbError
    );
  }
}
```

### Fail Fast

Validate early, fail immediately:

```typescript
function createUser(data: unknown): User {
  // Validate at entry point
  if (!data || typeof data !== "object") {
    throw new ValidationError("Invalid user data");
  }

  const { email, name } = data as Record<string, unknown>;

  if (!email || typeof email !== "string") {
    throw new ValidationError("Email is required");
  }

  if (!isValidEmail(email)) {
    throw new ValidationError("Invalid email format");
  }

  // After validation, proceed with confidence
  return new User(email, name);
}
```

## Retry Patterns

### Simple Retry

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}
```

### Exponential Backoff

```typescript
async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
  } = {}
): Promise<T> {
  const { maxAttempts = 5, baseDelayMs = 100, maxDelayMs = 10000 } = options;
  let lastError: Error;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts - 1) {
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
        // Add jitter to prevent thundering herd
        const jitter = delay * 0.1 * Math.random();
        await sleep(delay + jitter);
      }
    }
  }

  throw lastError;
}
```

### Circuit Breaker

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure: number = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    private threshold: number = 5,
    private resetTimeMs: number = 30000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailure > this.resetTimeMs) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = "closed";
  }

  private onFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.threshold) {
      this.state = "open";
    }
  }
}
```

## Logging Best Practices

### Structured Logging

```typescript
// Bad: Unstructured string
console.log(`User ${userId} failed to login: ${error.message}`);

// Good: Structured JSON
logger.error("Login failed", {
  userId,
  error: {
    message: error.message,
    code: error.code,
    stack: error.stack,
  },
  context: {
    ip: request.ip,
    userAgent: request.headers["user-agent"],
  },
});
```

### Log Levels

| Level     | Use Case                     | Example                  |
| --------- | ---------------------------- | ------------------------ |
| **ERROR** | Failure requiring attention  | Database connection lost |
| **WARN**  | Potential issue, not failure | Deprecated API called    |
| **INFO**  | Normal operations            | User logged in           |
| **DEBUG** | Debugging information        | Request payload          |
| **TRACE** | Detailed tracing             | Function entry/exit      |

### What to Log

```typescript
// DO log:
// - Error details with context
// - Request/response for APIs (redacted)
// - Business events (order placed, user created)
// - Performance metrics
// - Security events (login, permission denied)

// DON'T log:
// - Passwords, tokens, API keys
// - PII without consent
// - High-frequency events in production
// - Successful health checks
```

## Error Messages

### User-Facing Messages

```typescript
// Bad: Technical jargon
"ECONNREFUSED: Connection refused to 127.0.0.1:5432";

// Good: User-friendly with action
"Unable to save your changes. Please try again in a few moments.";

// Good: Specific and actionable
"Your password must be at least 8 characters and include a number.";
```

### Developer-Facing Messages

```typescript
// Bad: Vague
throw new Error("Invalid input");

// Good: Specific with context
throw new Error(
  `Invalid user ID format: expected UUID, got "${userId}". ` +
    `Called from UserService.getById`
);
```

### Error Codes

```typescript
// Define error codes for programmatic handling
const ErrorCodes = {
  VALIDATION_FAILED: "E001",
  USER_NOT_FOUND: "E002",
  PERMISSION_DENIED: "E003",
  RATE_LIMITED: "E004",
  EXTERNAL_SERVICE_ERROR: "E005",
} as const;

class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

// Usage
throw new AppError(ErrorCodes.USER_NOT_FOUND, "User not found", 404);
```
