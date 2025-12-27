# Performance Checklists

Quick reference checklists for common performance optimization scenarios.

---

## Frontend Performance Checklist

### Initial Load
- [ ] Enable Gzip/Brotli compression
- [ ] Minify JavaScript and CSS
- [ ] Use code splitting (route-based at minimum)
- [ ] Lazy load below-the-fold content
- [ ] Preload critical resources (`<link rel="preload">`)
- [ ] Use modern image formats (WebP, AVIF)
- [ ] Set explicit width/height on images
- [ ] Defer non-critical JavaScript
- [ ] Inline critical CSS
- [ ] Use CDN for static assets

### Core Web Vitals
- [ ] LCP < 2.5s: Optimize largest content element
- [ ] INP < 200ms: Break up long tasks, use web workers
- [ ] CLS < 0.1: Reserve space for dynamic content
- [ ] Use `fetchpriority="high"` on LCP image
- [ ] Avoid layout-triggering CSS properties in animations
- [ ] Use `content-visibility: auto` for off-screen content

### JavaScript
- [ ] Tree shake unused code
- [ ] Use dynamic imports for conditional features
- [ ] Debounce/throttle event handlers
- [ ] Use `requestIdleCallback` for non-critical work
- [ ] Avoid memory leaks (clean up listeners, timers)
- [ ] Use Web Workers for CPU-intensive tasks

### React Specific
- [ ] Use React.memo for expensive components
- [ ] Use useMemo/useCallback appropriately
- [ ] Virtualize long lists (react-window)
- [ ] Split context by update frequency
- [ ] Use Suspense for code splitting
- [ ] Enable React Compiler (if available)

---

## Backend Performance Checklist

### API Endpoints
- [ ] Enable response compression
- [ ] Implement caching headers (ETag, Cache-Control)
- [ ] Use connection pooling
- [ ] Paginate large result sets
- [ ] Return only needed fields
- [ ] Use async/non-blocking I/O
- [ ] Implement request timeout
- [ ] Add rate limiting

### Database Queries
- [ ] Add indexes for frequently queried columns
- [ ] Fix N+1 query problems
- [ ] Use query result caching
- [ ] Avoid SELECT * - specify columns
- [ ] Use EXPLAIN to analyze slow queries
- [ ] Implement connection pooling
- [ ] Consider read replicas for read-heavy workloads

### Node.js Specific
- [ ] Avoid blocking the event loop
- [ ] Use clustering for multi-core
- [ ] Use worker threads for CPU tasks
- [ ] Monitor event loop lag
- [ ] Set appropriate heap size
- [ ] Use Fastify over Express for speed

### Caching
- [ ] Implement multi-layer caching strategy
- [ ] Use Redis/Memcached for distributed cache
- [ ] Set appropriate TTLs
- [ ] Implement cache invalidation strategy
- [ ] Use stale-while-revalidate pattern
- [ ] Cache database query results

---

## Database Performance Checklist

### Query Optimization
- [ ] Add indexes for WHERE, JOIN, ORDER BY columns
- [ ] Use composite indexes for multi-column queries
- [ ] Avoid functions on indexed columns
- [ ] Use prepared statements
- [ ] Limit result sets (LIMIT clause)
- [ ] Use cursor-based pagination
- [ ] Avoid SELECT *

### Schema Design
- [ ] Choose appropriate data types
- [ ] Normalize for writes, denormalize for reads
- [ ] Partition large tables
- [ ] Archive old data
- [ ] Use appropriate constraints

### Maintenance
- [ ] Run ANALYZE regularly
- [ ] VACUUM tables with high churn
- [ ] Monitor and remove unused indexes
- [ ] Check for index bloat
- [ ] Review slow query log
- [ ] Monitor connection count

### PostgreSQL Specific
- [ ] Enable pg_stat_statements
- [ ] Configure shared_buffers (25% of RAM)
- [ ] Set appropriate work_mem
- [ ] Use EXPLAIN ANALYZE for query analysis
- [ ] Consider partial indexes
- [ ] Use covering indexes (INCLUDE)

### MySQL Specific
- [ ] Configure InnoDB buffer pool (50-80% RAM)
- [ ] Enable slow query log
- [ ] Use pt-query-digest for analysis
- [ ] Consider query cache (MySQL 5.7)
- [ ] Use EXPLAIN for query plans

---

## API Performance Checklist

### Latency Reduction
- [ ] Minimize network round trips
- [ ] Use parallel requests where possible
- [ ] Implement caching at multiple levels
- [ ] Enable compression
- [ ] Use connection pooling
- [ ] Consider edge deployment
- [ ] Use efficient serialization (JSON, Protocol Buffers)

### Throughput Improvement
- [ ] Implement horizontal scaling
- [ ] Use load balancing
- [ ] Enable HTTP/2 or HTTP/3
- [ ] Batch requests where appropriate
- [ ] Use async processing for long tasks
- [ ] Implement circuit breakers

### Reliability
- [ ] Add retry with exponential backoff
- [ ] Implement circuit breakers
- [ ] Set request timeouts
- [ ] Use health checks
- [ ] Implement graceful degradation
- [ ] Add rate limiting

---

## Mobile Performance Checklist

### App Startup
- [ ] Minimize initial bundle size
- [ ] Lazy load non-essential features
- [ ] Preload critical data
- [ ] Optimize splash screen
- [ ] Use app caching

### Rendering
- [ ] Maintain 60 FPS
- [ ] Virtualize long lists
- [ ] Use native animations
- [ ] Avoid unnecessary re-renders
- [ ] Optimize image loading

### Memory
- [ ] Monitor memory usage
- [ ] Detect and fix leaks
- [ ] Release unused resources
- [ ] Use appropriate data structures
- [ ] Implement proper cleanup in unmount

### Network
- [ ] Cache API responses
- [ ] Implement offline support
- [ ] Batch network requests
- [ ] Compress data transfer
- [ ] Preload next-screen data

### React Native Specific
- [ ] Enable Hermes engine
- [ ] Use New Architecture (Fabric)
- [ ] Optimize FlatList performance
- [ ] Use FastImage for images
- [ ] Avoid JavaScript thread blocking

### Flutter Specific
- [ ] Use const constructors
- [ ] Enable Impeller renderer
- [ ] Split widgets to minimize rebuilds
- [ ] Use Isolates for heavy computation
- [ ] Profile with DevTools

---

## Pre-Launch Performance Checklist

### Measurement
- [ ] Run Lighthouse audit (score > 90)
- [ ] Test on slow 3G network
- [ ] Test on low-end devices
- [ ] Measure Core Web Vitals
- [ ] Profile memory usage
- [ ] Load test API endpoints

### Infrastructure
- [ ] Enable CDN
- [ ] Configure caching headers
- [ ] Set up monitoring/alerting
- [ ] Configure auto-scaling
- [ ] Enable compression
- [ ] Test failover scenarios

### Monitoring Setup
- [ ] Real User Monitoring (RUM)
- [ ] Error tracking
- [ ] APM for backend
- [ ] Database monitoring
- [ ] Log aggregation
- [ ] Uptime monitoring

---

## Performance Debugging Flowchart

```
Problem: Slow Application
│
├── Slow Page Load?
│   ├── Check Network tab waterfall
│   ├── Run Lighthouse
│   ├── Analyze bundle size
│   └── Check Core Web Vitals
│
├── Slow API Response?
│   ├── Profile application code
│   ├── Check database queries
│   ├── Analyze caching effectiveness
│   └── Check external service calls
│
├── High Memory Usage?
│   ├── Take heap snapshot
│   ├── Check for memory leaks
│   ├── Analyze object retention
│   └── Review caching strategy
│
├── High CPU Usage?
│   ├── CPU profiling
│   ├── Find hotspots
│   ├── Check for blocking operations
│   └── Review algorithm complexity
│
└── Intermittent Slowness?
    ├── Check garbage collection
    ├── Monitor event loop lag
    ├── Check external dependencies
    └── Review load balancing
```

---

## Quick Wins by Impact

### High Impact, Low Effort
1. Enable compression (Gzip/Brotli)
2. Add missing database indexes
3. Enable browser caching headers
4. Use a CDN for static assets
5. Lazy load images below the fold

### High Impact, Medium Effort
1. Implement application caching (Redis)
2. Code splitting and lazy loading
3. Fix N+1 database queries
4. Optimize LCP element
5. Add connection pooling

### High Impact, High Effort
1. Migrate to faster framework
2. Implement microservices
3. Database sharding
4. Full architecture redesign
5. Multi-region deployment
