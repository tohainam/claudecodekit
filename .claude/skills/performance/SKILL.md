---
name: performance
description: |
  Comprehensive performance optimization skill for all technologies: frontend (React, Vue, Angular), backend (Node.js, Python, Go, Java), databases (SQL, NoSQL), mobile (iOS, Android, React Native, Flutter), and APIs/microservices. Use PROACTIVELY when: (1) User reports slow performance, lag, or high latency, (2) Profiling or benchmarking is needed, (3) Optimizing Core Web Vitals (LCP, INP, CLS), (4) Database query optimization, (5) Memory leaks or high CPU usage, (6) Caching strategy design, (7) API throughput/latency improvements, (8) Mobile app performance tuning, (9) Code review for performance issues, (10) Load testing or capacity planning.
---

# Performance Optimization

## Quick Reference

| Domain | Key Metrics | Target | Reference |
|--------|-------------|--------|-----------|
| Frontend | LCP, INP, CLS | LCP < 2.5s, INP < 200ms, CLS < 0.1 | [frontend.md](references/frontend.md) |
| Backend | Response time, throughput, CPU/memory | p95 < 200ms, >1000 RPS | [backend.md](references/backend.md) |
| Database | Query time, connections, I/O | Queries < 100ms | [database.md](references/database.md) |
| Mobile | FPS, startup time, memory | 60 FPS, cold start < 2s | [mobile.md](references/mobile.md) |
| API | Latency, throughput | p95 < 100ms | [api.md](references/api.md) |

## Core Workflow

### 1. Measure First

Never optimize without data. Establish baseline metrics before any changes.

```
Profile → Identify Bottleneck → Optimize → Measure Again → Validate
```

### 2. Identify Bottleneck Category

```
Slow Performance
├── Network-bound → Caching, CDN, compression, connection pooling
├── CPU-bound → Algorithm optimization, parallelization, offloading
├── Memory-bound → Memory leaks, garbage collection, data structures
├── I/O-bound → Async operations, batching, connection pooling
└── Rendering-bound → Virtual DOM, virtualization, lazy loading
```

### 3. Apply Optimization

Refer to domain-specific guides:
- **Frontend**: See [references/frontend.md](references/frontend.md)
- **Backend**: See [references/backend.md](references/backend.md)
- **Database**: See [references/database.md](references/database.md)
- **Mobile**: See [references/mobile.md](references/mobile.md)
- **API**: See [references/api.md](references/api.md)
- **Profiling Tools**: See [references/profiling.md](references/profiling.md)
- **Quick Checklists**: See [references/checklists.md](references/checklists.md)

## Universal Optimization Principles

### The 80/20 Rule
Focus on the 20% of code causing 80% of performance issues. Profile to find hotspots.

### Caching Hierarchy (fastest to slowest)
```
1. CPU Cache (L1/L2/L3) → Data locality
2. In-Memory Cache (Redis, Memcached) → <1ms
3. CDN Cache → Geographic distribution
4. Application Cache → Computed values
5. Database Cache → Query results
```

### Async Over Sync
Prefer non-blocking operations. Block only when necessary.

```javascript
// Bad: Blocking
const data1 = await fetchData1();
const data2 = await fetchData2();

// Good: Parallel
const [data1, data2] = await Promise.all([fetchData1(), fetchData2()]);
```

### Lazy Loading Pattern
Load resources only when needed:
- Images below the fold
- Routes/components not immediately visible
- Heavy libraries used conditionally

### Connection Pooling
Reuse connections instead of creating new ones:
- Database connections
- HTTP keep-alive
- WebSocket connections

### Compression
Reduce payload sizes:
- Gzip/Brotli for HTTP responses
- Image optimization (WebP, AVIF)
- Minification for JS/CSS

## Performance Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| N+1 Queries | Multiple DB round-trips | Batch queries, eager loading |
| Sync in Event Loop | Blocks all operations | Use worker threads, async |
| Memory Leaks | Growing memory usage | Proper cleanup, weak references |
| Premature Optimization | Wasted effort | Profile first, optimize hotspots |
| Over-fetching | Unnecessary data transfer | GraphQL, field selection |
| Missing Indexes | Full table scans | Analyze queries, add indexes |
| Unbatched Updates | Multiple re-renders | Batch state updates |
| Large Bundle Size | Slow initial load | Code splitting, tree shaking |

## Quick Diagnostics

### Check for Common Issues

```bash
# Node.js: Check event loop lag
node --inspect app.js

# Memory usage
node --expose-gc --max-old-space-size=4096 app.js

# CPU profiling
node --prof app.js
node --prof-process isolate-*.log > processed.txt
```

### Web Performance Quick Check

```javascript
// Core Web Vitals in browser console
new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => console.log(entry.name, entry.value));
}).observe({type: 'largest-contentful-paint', buffered: true});

// Check LCP element
performance.getEntriesByType('largest-contentful-paint')[0]?.element;
```

### Database Quick Check

```sql
-- PostgreSQL: Find slow queries
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- MySQL: Show slow query log
SHOW VARIABLES LIKE 'slow_query%';
```

## Optimization Priorities

### High Impact (Do First)
1. Add missing database indexes
2. Implement caching for repeated queries
3. Fix N+1 query problems
4. Enable compression (Gzip/Brotli)
5. Optimize LCP element loading

### Medium Impact
1. Code splitting and lazy loading
2. Image optimization
3. Connection pooling
4. Debounce/throttle expensive operations
5. Implement pagination

### Lower Impact (Consider Later)
1. Micro-optimizations in algorithms
2. CSS optimization
3. Font subsetting
4. Prefetching strategies

## Performance Budget Example

| Resource | Budget | Measurement |
|----------|--------|-------------|
| Total JS | < 200KB gzipped | Bundle analyzer |
| Total CSS | < 50KB gzipped | Bundle size |
| LCP | < 2.5s | Lighthouse |
| INP | < 200ms | Web Vitals |
| CLS | < 0.1 | Lighthouse |
| API p95 | < 200ms | APM tool |
| DB query | < 100ms | Query profiler |
