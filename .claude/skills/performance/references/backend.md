# Backend Performance Optimization

## Table of Contents
1. [Node.js Optimization](#nodejs-optimization)
2. [Python Optimization](#python-optimization)
3. [Go Optimization](#go-optimization)
4. [Java/JVM Optimization](#javajvm-optimization)
5. [Caching Strategies](#caching-strategies)
6. [Connection Pooling](#connection-pooling)
7. [Async Patterns](#async-patterns)
8. [Memory Management](#memory-management)

---

## Node.js Optimization

### Event Loop Management

The event loop is the heart of Node.js performance. Monitor Event Loop Utilization (ELU), not just CPU.

```javascript
// Check event loop lag
const { monitorEventLoopDelay } = require('perf_hooks');

const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();

setInterval(() => {
  console.log({
    min: h.min / 1e6,      // Convert to ms
    max: h.max / 1e6,
    mean: h.mean / 1e6,
    p99: h.percentile(99) / 1e6
  });
}, 5000);
```

### Avoid Blocking the Event Loop

```javascript
// Bad: Synchronous file read blocks event loop
const data = fs.readFileSync('large-file.json');

// Good: Async file read
const data = await fs.promises.readFile('large-file.json');

// Bad: CPU-intensive in main thread
function processData(data) {
  return data.map(item => heavyComputation(item)); // Blocks!
}

// Good: Use worker threads for CPU-intensive work
const { Worker, parentPort } = require('worker_threads');

// main.js
const worker = new Worker('./processor.js');
worker.postMessage(data);
worker.on('message', result => handleResult(result));

// processor.js
parentPort.on('message', data => {
  const result = data.map(item => heavyComputation(item));
  parentPort.postMessage(result);
});
```

### Clustering

```javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  // Workers share TCP connection
  require('./server');
}
```

### Memory Optimization

```bash
# Increase heap size for large applications
node --max-old-space-size=4096 app.js

# Optimize for memory over speed
node --optimize-for-size app.js

# Enable garbage collection logging
node --expose-gc --trace-gc app.js
```

```javascript
// Detect memory leaks
const v8 = require('v8');

setInterval(() => {
  const heap = v8.getHeapStatistics();
  console.log({
    used: Math.round(heap.used_heap_size / 1024 / 1024) + 'MB',
    total: Math.round(heap.total_heap_size / 1024 / 1024) + 'MB',
    limit: Math.round(heap.heap_size_limit / 1024 / 1024) + 'MB'
  });
}, 10000);

// Force garbage collection (for debugging only)
if (global.gc) {
  global.gc();
}
```

### Framework Selection

| Framework | Requests/sec | Use Case |
|-----------|-------------|----------|
| Fastify | ~75,000 | High-performance APIs |
| Koa | ~55,000 | Lightweight middleware |
| Express | ~25,000 | General purpose |
| NestJS | ~20,000 | Enterprise apps |

```javascript
// Fastify example - 3x faster than Express
const fastify = require('fastify')({ logger: true });

fastify.get('/api/data', async (request, reply) => {
  return { data: 'value' };
});

fastify.listen({ port: 3000 });
```

---

## Python Optimization

### Async with asyncio

```python
import asyncio
import aiohttp

# Bad: Sequential requests
async def fetch_all_slow(urls):
    results = []
    async with aiohttp.ClientSession() as session:
        for url in urls:
            async with session.get(url) as response:
                results.append(await response.json())
    return results

# Good: Concurrent requests
async def fetch_all_fast(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [session.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)
        return [await r.json() for r in responses]
```

### Use uvloop

```python
# 2-4x faster than default asyncio event loop
import uvloop
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
```

### FastAPI for High Performance

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

# Run with: uvicorn main:app --workers 4
```

### Memory Optimization

```python
# Use generators for large datasets
def process_large_file(filename):
    with open(filename) as f:
        for line in f:  # Memory-efficient iteration
            yield process_line(line)

# Use __slots__ to reduce memory
class Point:
    __slots__ = ['x', 'y']
    def __init__(self, x, y):
        self.x = x
        self.y = y

# Use dataclasses with slots (Python 3.10+)
from dataclasses import dataclass

@dataclass(slots=True)
class User:
    name: str
    email: str
```

### Cython for CPU-Intensive Code

```python
# cython_module.pyx
def heavy_computation(int n):
    cdef int i
    cdef double result = 0
    for i in range(n):
        result += i * 0.5
    return result
```

---

## Go Optimization

### Goroutines and Channels

```go
// Concurrent processing
func processItems(items []Item) []Result {
    results := make(chan Result, len(items))

    for _, item := range items {
        go func(i Item) {
            results <- process(i)
        }(item)
    }

    var output []Result
    for range items {
        output = append(output, <-results)
    }
    return output
}

// Worker pool pattern
func workerPool(jobs <-chan Job, results chan<- Result, workers int) {
    var wg sync.WaitGroup
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for job := range jobs {
                results <- process(job)
            }
        }()
    }
    wg.Wait()
    close(results)
}
```

### Memory Optimization

```go
// Pre-allocate slices
items := make([]Item, 0, expectedSize)

// Use sync.Pool for frequently allocated objects
var bufferPool = sync.Pool{
    New: func() interface{} {
        return make([]byte, 1024)
    },
}

func processRequest() {
    buf := bufferPool.Get().([]byte)
    defer bufferPool.Put(buf)
    // Use buf...
}

// Avoid string concatenation in loops
var builder strings.Builder
for _, s := range strings {
    builder.WriteString(s)
}
result := builder.String()
```

### Profiling

```bash
# CPU profiling
go test -cpuprofile=cpu.prof -bench=.
go tool pprof cpu.prof

# Memory profiling
go test -memprofile=mem.prof -bench=.
go tool pprof mem.prof

# Trace
go test -trace=trace.out
go tool trace trace.out
```

---

## Java/JVM Optimization

### JVM Tuning

```bash
# G1GC for balanced performance (default in Java 11+)
java -XX:+UseG1GC -Xms2g -Xmx2g -jar app.jar

# ZGC for low latency (Java 15+)
java -XX:+UseZGC -Xms4g -Xmx4g -jar app.jar

# Enable GC logging
java -Xlog:gc*:file=gc.log:time,uptime:filecount=5,filesize=10M -jar app.jar
```

### Virtual Threads (Java 21+)

```java
// Traditional thread pool
ExecutorService executor = Executors.newFixedThreadPool(100);

// Virtual threads - millions of concurrent tasks
ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            // I/O-bound task
            fetchData(i);
        });
    });
}
```

### Spring Boot Optimization

```java
// Use constructor injection (faster than field injection)
@Service
public class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }
}

// Enable lazy initialization
# application.properties
spring.main.lazy-initialization=true

// Use WebFlux for reactive non-blocking
@RestController
public class UserController {
    @GetMapping("/users/{id}")
    public Mono<User> getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
}
```

---

## Caching Strategies

### Cache Patterns

```
┌─────────────────────────────────────────────────────────────┐
│                    CACHING PATTERNS                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CACHE-ASIDE (Lazy Loading)                              │
│     App ──► Check Cache ──► Miss ──► DB ──► Update Cache   │
│                          └► Hit ──► Return                   │
│                                                              │
│  2. WRITE-THROUGH                                            │
│     App ──► Write to Cache ──► Cache writes to DB           │
│                                                              │
│  3. WRITE-BEHIND (Write-Back)                               │
│     App ──► Write to Cache ──► Async write to DB            │
│                                                              │
│  4. READ-THROUGH                                             │
│     App ──► Request Cache ──► Cache fetches from DB if miss │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Redis Caching Example

```javascript
// Node.js with ioredis
const Redis = require('ioredis');
const redis = new Redis({ host: 'localhost', port: 6379 });

async function getCachedData(key, fetchFn, ttl = 3600) {
  // Try cache first
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

// Usage
const user = await getCachedData(
  `user:${userId}`,
  () => db.users.findById(userId),
  3600  // 1 hour TTL
);
```

### Cache Invalidation Strategies

```javascript
// Time-based expiration (TTL)
await redis.setex('key', 3600, value);  // Expires in 1 hour

// Event-based invalidation
async function updateUser(userId, data) {
  await db.users.update(userId, data);
  await redis.del(`user:${userId}`);  // Invalidate cache
}

// Pattern-based invalidation
async function clearUserCaches(userId) {
  const keys = await redis.keys(`user:${userId}:*`);
  if (keys.length) await redis.del(...keys);
}

// Cache versioning
const CACHE_VERSION = 'v2';
const key = `${CACHE_VERSION}:user:${userId}`;
```

---

## Connection Pooling

### Database Connection Pool

```javascript
// PostgreSQL with pg-pool
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'mydb',
  max: 20,                    // Maximum pool size
  min: 5,                     // Minimum pool size
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000  // Timeout for acquiring connection
});

// Use pool for queries
const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
```

### HTTP Connection Keep-Alive

```javascript
// Node.js HTTP agent with keep-alive
const http = require('http');
const https = require('https');

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 50 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });

// With axios
const axios = require('axios');
const instance = axios.create({
  httpAgent,
  httpsAgent,
  timeout: 5000
});
```

---

## Async Patterns

### Parallel Execution

```javascript
// Execute independent operations in parallel
const [users, products, orders] = await Promise.all([
  fetchUsers(),
  fetchProducts(),
  fetchOrders()
]);

// With error handling
const results = await Promise.allSettled([
  fetchUsers(),
  fetchProducts(),
  fetchOrders()
]);

results.forEach((result, i) => {
  if (result.status === 'fulfilled') {
    console.log(`Task ${i} succeeded:`, result.value);
  } else {
    console.log(`Task ${i} failed:`, result.reason);
  }
});
```

### Batching

```javascript
// DataLoader pattern for batching
const DataLoader = require('dataloader');

const userLoader = new DataLoader(async (ids) => {
  // Single query for all IDs
  const users = await db.query(
    'SELECT * FROM users WHERE id = ANY($1)',
    [ids]
  );
  // Return in same order as requested IDs
  return ids.map(id => users.find(u => u.id === id));
});

// Multiple calls are batched into single query
const [user1, user2, user3] = await Promise.all([
  userLoader.load(1),
  userLoader.load(2),
  userLoader.load(3)
]);
```

### Rate Limiting

```javascript
// Token bucket rate limiter
class RateLimiter {
  constructor(tokensPerInterval, interval) {
    this.tokens = tokensPerInterval;
    this.maxTokens = tokensPerInterval;
    this.interval = interval;
    this.lastRefill = Date.now();
  }

  async acquire() {
    this.refill();
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }

  refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = Math.floor(elapsed / this.interval * this.maxTokens);
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}
```

---

## Memory Management

### Identifying Memory Leaks

Common causes:
1. **Event listeners not removed**
2. **Closures holding references**
3. **Global variables accumulating data**
4. **Caches without eviction**
5. **Timers not cleared**

```javascript
// Bad: Event listener leak
function setupHandler() {
  document.addEventListener('click', handleClick);
  // Never removed!
}

// Good: Clean up listeners
class Component {
  constructor() {
    this.handleClick = this.handleClick.bind(this);
    document.addEventListener('click', this.handleClick);
  }

  destroy() {
    document.removeEventListener('click', this.handleClick);
  }

  handleClick(e) { /* ... */ }
}

// Bad: Growing cache
const cache = {};
function getData(key) {
  if (!cache[key]) {
    cache[key] = fetchData(key);  // Never evicted!
  }
  return cache[key];
}

// Good: LRU cache with size limit
const LRU = require('lru-cache');
const cache = new LRU({ max: 500, ttl: 1000 * 60 * 5 });
```

### Streaming Large Data

```javascript
// Bad: Load entire file into memory
const data = await fs.promises.readFile('large-file.json');
const parsed = JSON.parse(data);

// Good: Stream processing
const { createReadStream } = require('fs');
const { pipeline } = require('stream/promises');
const JSONStream = require('jsonstream');

await pipeline(
  createReadStream('large-file.json'),
  JSONStream.parse('*'),
  async function* (source) {
    for await (const item of source) {
      yield processItem(item);
    }
  },
  createWriteStream('output.json')
);
```
