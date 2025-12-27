# API Performance Optimization

## Table of Contents
1. [Latency Optimization](#latency-optimization)
2. [Throughput Optimization](#throughput-optimization)
3. [Caching Strategies](#caching-strategies)
4. [Compression](#compression)
5. [Protocol Optimization](#protocol-optimization)
6. [Rate Limiting](#rate-limiting)
7. [Microservices Patterns](#microservices-patterns)
8. [Monitoring & Observability](#monitoring--observability)

---

## Latency Optimization

### Latency Budget

```
Target: 95th percentile < 200ms

Budget Breakdown Example:
├── Network latency: 20ms
├── Load balancer: 5ms
├── API gateway: 10ms
├── Application logic: 50ms
├── Database query: 30ms
├── External API calls: 50ms
└── Serialization: 10ms
Total: 175ms (with 25ms buffer)
```

### Quick Wins

| Optimization | Impact | Effort |
|--------------|--------|--------|
| Add database indexes | High | Low |
| Enable connection pooling | High | Low |
| Add caching layer | High | Medium |
| Enable compression | Medium | Low |
| Optimize N+1 queries | High | Medium |
| Use CDN for static content | Medium | Low |

### Reduce Round Trips

```javascript
// Bad: Multiple sequential calls
const user = await getUser(id);
const orders = await getOrders(user.id);
const preferences = await getPreferences(user.id);

// Good: Parallel calls
const [user, orders, preferences] = await Promise.all([
  getUser(id),
  getOrders(id),
  getPreferences(id)
]);

// Good: Single aggregated endpoint
const userData = await getUserWithDetails(id);
// Returns: { user, orders, preferences }
```

### Edge Computing

```javascript
// Deploy to edge locations (Cloudflare Workers, Vercel Edge)
// Reduces network latency by 50-70%

// Cloudflare Worker example
export default {
  async fetch(request, env) {
    // Check edge cache first
    const cache = caches.default;
    let response = await cache.match(request);

    if (!response) {
      response = await fetch(request);
      // Cache for 5 minutes
      response = new Response(response.body, response);
      response.headers.set('Cache-Control', 'max-age=300');
      await cache.put(request, response.clone());
    }

    return response;
  }
};
```

---

## Throughput Optimization

### Connection Pooling

```javascript
// Node.js HTTP Agent
const http = require('http');

const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 100,        // Max connections per host
  maxFreeSockets: 10,     // Max idle connections
  timeout: 60000          // Socket timeout
});

// Database connection pool
const pool = new Pool({
  max: 20,                // Max connections
  min: 5,                 // Min idle connections
  idleTimeoutMillis: 30000
});
```

### Request Batching

```javascript
// DataLoader for batching (GraphQL pattern)
const DataLoader = require('dataloader');

const userLoader = new DataLoader(async (ids) => {
  // Single query for all IDs
  const users = await db.query(
    'SELECT * FROM users WHERE id = ANY($1)',
    [ids]
  );
  // Return in same order as requested
  return ids.map(id => users.find(u => u.id === id));
});

// Multiple loads batched into single query
const [user1, user2, user3] = await Promise.all([
  userLoader.load(1),
  userLoader.load(2),
  userLoader.load(3)
]);
```

### Horizontal Scaling

```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Load Balancing Strategies

| Strategy | Use Case | Pros | Cons |
|----------|----------|------|------|
| Round Robin | General | Simple, fair | Ignores server load |
| Least Connections | Variable load | Load-aware | More overhead |
| IP Hash | Session affinity | Consistent routing | Uneven distribution |
| Weighted | Mixed servers | Capacity-aware | Manual config |

---

## Caching Strategies

### Cache Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      CACHING LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CDN (Edge)                                               │
│     └── Static assets, public API responses                 │
│                                                              │
│  2. API Gateway                                              │
│     └── Rate limit counters, auth tokens                    │
│                                                              │
│  3. Application (In-Memory)                                  │
│     └── Computed values, config                             │
│                                                              │
│  4. Distributed Cache (Redis)                               │
│     └── Session data, API responses                         │
│                                                              │
│  5. Database Query Cache                                    │
│     └── Query results                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### HTTP Caching Headers

```javascript
// Express middleware
app.get('/api/products', (req, res) => {
  const products = getProducts();

  res.set({
    'Cache-Control': 'public, max-age=300',  // 5 minutes
    'ETag': generateETag(products),
    'Last-Modified': new Date().toUTCString()
  });

  res.json(products);
});

// Cache-Control directives
// public - CDN can cache
// private - Only browser can cache
// max-age=N - Cache for N seconds
// s-maxage=N - CDN cache for N seconds
// no-cache - Validate before use
// no-store - Never cache
// immutable - Never changes
```

### Redis Caching Pattern

```javascript
const Redis = require('ioredis');
const redis = new Redis();

// Cache-aside pattern
async function getCachedData(key, fetchFn, ttl = 3600) {
  // Try cache
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from source
  const data = await fetchFn();

  // Cache with TTL
  await redis.setex(key, ttl, JSON.stringify(data));

  return data;
}

// Cache with tags for invalidation
async function setWithTags(key, value, tags, ttl = 3600) {
  const multi = redis.multi();
  multi.setex(key, ttl, JSON.stringify(value));

  for (const tag of tags) {
    multi.sadd(`tag:${tag}`, key);
    multi.expire(`tag:${tag}`, ttl);
  }

  await multi.exec();
}

async function invalidateByTag(tag) {
  const keys = await redis.smembers(`tag:${tag}`);
  if (keys.length) {
    await redis.del(...keys);
  }
  await redis.del(`tag:${tag}`);
}
```

### Stale-While-Revalidate

```javascript
async function getWithSWR(key, fetchFn, ttl = 300, staleTTL = 3600) {
  const cached = await redis.get(key);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    if (age < ttl * 1000) {
      // Fresh - return immediately
      return data;
    }

    if (age < staleTTL * 1000) {
      // Stale - return and refresh in background
      refreshInBackground(key, fetchFn, ttl);
      return data;
    }
  }

  // Miss or expired - fetch and cache
  const data = await fetchFn();
  await redis.setex(key, staleTTL, JSON.stringify({
    data,
    timestamp: Date.now()
  }));

  return data;
}

function refreshInBackground(key, fetchFn, ttl) {
  setImmediate(async () => {
    try {
      const data = await fetchFn();
      await redis.setex(key, ttl, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Background refresh failed:', error);
    }
  });
}
```

---

## Compression

### Response Compression

```javascript
// Express with compression middleware
const compression = require('compression');

app.use(compression({
  level: 6,                    // Compression level (1-9)
  threshold: 1024,             // Min size to compress (1KB)
  filter: (req, res) => {      // Skip already compressed
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Nginx configuration
gzip on;
gzip_types text/plain application/json application/javascript text/css;
gzip_min_length 1024;
gzip_comp_level 6;

# Brotli (better compression)
brotli on;
brotli_types text/plain application/json application/javascript text/css;
brotli_comp_level 6;
```

### Payload Optimization

```javascript
// Use efficient data formats
// JSON (human readable) vs Protocol Buffers (3-10x smaller)

// Field selection (avoid over-fetching)
// GET /api/users?fields=id,name,email

// Pagination
// GET /api/users?page=1&limit=20

// Compression of repeated data
const response = {
  users: users.map(u => ({
    id: u.id,
    name: u.name
    // Omit unused fields
  }))
};
```

---

## Protocol Optimization

### HTTP/2 and HTTP/3

```nginx
# Nginx HTTP/2
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}

# Node.js HTTP/2
const http2 = require('http2');
const fs = require('fs');

const server = http2.createSecureServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
});

server.on('stream', (stream, headers) => {
  stream.respond({ ':status': 200 });
  stream.end('Hello HTTP/2');
});
```

### GraphQL Optimization

```javascript
// Query complexity limiting
const { createComplexityLimitRule } = require('graphql-validation-complexity');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [
    createComplexityLimitRule(1000)  // Max complexity
  ]
});

// DataLoader for N+1 prevention
const userLoader = new DataLoader(ids => batchGetUsers(ids));

const resolvers = {
  Post: {
    author: (post) => userLoader.load(post.authorId)
  }
};

// Persisted queries (reduce payload size)
// Client sends hash instead of full query
```

### gRPC for Internal Services

```protobuf
// service.proto
syntax = "proto3";

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);
}

message GetUserRequest {
  string id = 1;
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
}
```

```javascript
// Node.js gRPC client
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('service.proto');
const proto = grpc.loadPackageDefinition(packageDefinition);

const client = new proto.UserService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

client.getUser({ id: '123' }, (error, user) => {
  console.log(user);
});
```

---

## Rate Limiting

### Token Bucket Algorithm

```javascript
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate;  // tokens per second
    this.lastRefill = Date.now();
  }

  tryConsume(tokens = 1) {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(
      this.capacity,
      this.tokens + elapsed * this.refillRate
    );
    this.lastRefill = now;
  }
}
```

### Redis Rate Limiting

```javascript
// Sliding window rate limiter
async function isRateLimited(key, limit, windowMs) {
  const now = Date.now();
  const windowStart = now - windowMs;

  const multi = redis.multi();
  multi.zremrangebyscore(key, 0, windowStart);  // Remove old entries
  multi.zadd(key, now, `${now}`);                // Add current request
  multi.zcard(key);                              // Count requests
  multi.pexpire(key, windowMs);                  // Set expiry

  const results = await multi.exec();
  const count = results[2][1];

  return count > limit;
}

// Express middleware
app.use(async (req, res, next) => {
  const key = `ratelimit:${req.ip}`;
  const limited = await isRateLimited(key, 100, 60000);  // 100 req/min

  if (limited) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }

  next();
});
```

### Rate Limit Headers

```javascript
app.use((req, res, next) => {
  res.set({
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTime.toString(),
    'Retry-After': retryAfter.toString()  // When 429
  });
  next();
});
```

---

## Microservices Patterns

### Circuit Breaker

```javascript
const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000,           // Time before request considered failed
  errorThresholdPercentage: 50,  // % failures to open circuit
  resetTimeout: 30000      // Time before trying again
};

const breaker = new CircuitBreaker(callExternalService, options);

breaker.fallback(() => cachedResponse);

breaker.on('open', () => console.log('Circuit opened'));
breaker.on('halfOpen', () => console.log('Circuit half-open'));
breaker.on('close', () => console.log('Circuit closed'));

const result = await breaker.fire(params);
```

### Retry with Exponential Backoff

```javascript
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 1000;
      await sleep(delay + jitter);
    }
  }
}

// Usage
const data = await retryWithBackoff(
  () => fetchFromUnreliableService(),
  3,
  1000
);
```

### Service Mesh (Istio/Linkerd)

```yaml
# Istio retry policy
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: user-service
spec:
  hosts:
  - user-service
  http:
  - route:
    - destination:
        host: user-service
    retries:
      attempts: 3
      perTryTimeout: 2s
      retryOn: 5xx,reset,connect-failure
```

---

## Monitoring & Observability

### Key Metrics (RED Method)

| Metric | Description | Target |
|--------|-------------|--------|
| **R**ate | Requests per second | Based on capacity |
| **E**rrors | Error rate percentage | < 1% |
| **D**uration | Response time percentiles | p50 < 50ms, p95 < 200ms, p99 < 500ms |

### OpenTelemetry Instrumentation

```javascript
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');

const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new JaegerExporter()));
provider.register();

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation()
  ]
});

// Custom spans
const tracer = trace.getTracer('my-service');

async function processOrder(order) {
  const span = tracer.startSpan('processOrder');
  span.setAttribute('order.id', order.id);

  try {
    await validateOrder(order);
    await chargePayment(order);
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    throw error;
  } finally {
    span.end();
  }
}
```

### Prometheus Metrics

```javascript
const client = require('prom-client');

// Default metrics (CPU, memory, etc.)
client.collectDefaultMetrics();

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5]
});

// Express middleware
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path, status: res.statusCode });
  });
  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});
```
