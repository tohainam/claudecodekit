# Database Performance Optimization

## Table of Contents
1. [Query Optimization](#query-optimization)
2. [Indexing Strategies](#indexing-strategies)
3. [PostgreSQL Optimization](#postgresql-optimization)
4. [MySQL Optimization](#mysql-optimization)
5. [MongoDB Optimization](#mongodb-optimization)
6. [Connection Management](#connection-management)
7. [Schema Design](#schema-design)
8. [Monitoring & Profiling](#monitoring--profiling)

---

## Query Optimization

### The N+1 Problem

```javascript
// Bad: N+1 queries
const users = await User.findAll();
for (const user of users) {
  user.posts = await Post.findAll({ where: { userId: user.id } });
  // This executes N additional queries!
}

// Good: Eager loading
const users = await User.findAll({
  include: [{ model: Post }]
});
// Single query with JOIN

// Good: Batch loading
const users = await User.findAll();
const userIds = users.map(u => u.id);
const posts = await Post.findAll({
  where: { userId: { [Op.in]: userIds } }
});
// Only 2 queries total
```

### SELECT Only Needed Columns

```sql
-- Bad: Select all columns
SELECT * FROM users WHERE status = 'active';

-- Good: Select only needed columns
SELECT id, name, email FROM users WHERE status = 'active';
```

### Pagination

```sql
-- Offset pagination (slow for large offsets)
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 10000;

-- Cursor-based pagination (fast, consistent)
SELECT * FROM posts
WHERE created_at < '2024-01-15 10:30:00'
ORDER BY created_at DESC
LIMIT 20;

-- Keyset pagination
SELECT * FROM posts
WHERE (created_at, id) < ('2024-01-15 10:30:00', 12345)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

### Avoiding Full Table Scans

```sql
-- Bad: Function on indexed column prevents index use
SELECT * FROM users WHERE YEAR(created_at) = 2024;

-- Good: Range query uses index
SELECT * FROM users
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- Bad: Leading wildcard prevents index use
SELECT * FROM users WHERE email LIKE '%@gmail.com';

-- Good: Trailing wildcard uses index
SELECT * FROM users WHERE email LIKE 'john%';

-- Bad: OR can prevent index use
SELECT * FROM users WHERE status = 'active' OR role = 'admin';

-- Good: UNION uses indexes
SELECT * FROM users WHERE status = 'active'
UNION
SELECT * FROM users WHERE role = 'admin';
```

---

## Indexing Strategies

### Index Types

| Type | Use Case | Example |
|------|----------|---------|
| B-tree | Equality, range queries | `CREATE INDEX idx ON users(email)` |
| Hash | Equality only | `CREATE INDEX idx ON users USING HASH(id)` |
| GIN | Full-text, arrays, JSONB | `CREATE INDEX idx ON posts USING GIN(tags)` |
| GiST | Geometric, full-text | `CREATE INDEX idx ON locations USING GIST(coords)` |
| BRIN | Large tables, sorted data | `CREATE INDEX idx ON logs USING BRIN(created_at)` |

### Composite Indexes

```sql
-- Order matters! Leftmost prefix rule
CREATE INDEX idx_user_status_date ON orders(user_id, status, created_at);

-- This index supports:
WHERE user_id = 1                                    -- ✓ Uses index
WHERE user_id = 1 AND status = 'active'              -- ✓ Uses index
WHERE user_id = 1 AND status = 'active' AND created_at > '2024-01-01'  -- ✓ Uses index
WHERE user_id = 1 AND created_at > '2024-01-01'      -- ✓ Partial (skips status)
WHERE status = 'active'                               -- ✗ Cannot use (no leftmost column)
WHERE status = 'active' AND created_at > '2024-01-01' -- ✗ Cannot use
```

### Covering Indexes

```sql
-- Include all needed columns to avoid table lookup
CREATE INDEX idx_user_email_name ON users(email) INCLUDE (name, avatar_url);

-- Query can be satisfied entirely from index
SELECT name, avatar_url FROM users WHERE email = 'john@example.com';
```

### Partial Indexes

```sql
-- Index only active users (smaller, faster)
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- Index only recent orders
CREATE INDEX idx_recent_orders ON orders(created_at)
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

## PostgreSQL Optimization

### EXPLAIN ANALYZE

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE user_id = 123 AND status = 'pending';

-- Key metrics to check:
-- - Seq Scan vs Index Scan
-- - Actual rows vs estimated rows
-- - Buffers: shared hit (cache) vs shared read (disk)
```

### Query Statistics

```sql
-- Enable pg_stat_statements extension
CREATE EXTENSION pg_stat_statements;

-- Find slowest queries
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Find most called queries
SELECT query, calls, mean_time
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;

-- Find queries with most total time
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### Table Statistics

```sql
-- Check table bloat and dead tuples
SELECT relname, n_live_tup, n_dead_tup,
       round(n_dead_tup::numeric / nullif(n_live_tup, 0) * 100, 2) as dead_pct
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

-- Check index usage
SELECT relname, indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0;  -- Unused indexes
```

### Configuration Tuning

```sql
-- Memory settings (postgresql.conf)
shared_buffers = '256MB'          -- 25% of RAM for dedicated server
effective_cache_size = '768MB'    -- 75% of RAM
work_mem = '64MB'                 -- Per-query memory for sorts/hashes
maintenance_work_mem = '256MB'    -- For VACUUM, CREATE INDEX

-- Connection settings
max_connections = 200
```

### VACUUM and ANALYZE

```sql
-- Update statistics for query planner
ANALYZE users;

-- Reclaim dead tuple space
VACUUM users;

-- Full vacuum (locks table, reclaims disk space)
VACUUM FULL users;

-- Autovacuum configuration
ALTER TABLE high_churn_table SET (autovacuum_vacuum_scale_factor = 0.05);
```

---

## MySQL Optimization

### EXPLAIN

```sql
EXPLAIN SELECT * FROM orders WHERE user_id = 123;

-- Key columns:
-- type: ALL (bad), index, range, ref, eq_ref, const (best)
-- key: Which index is used
-- rows: Estimated rows to examine
-- Extra: Using index, Using filesort, Using temporary
```

### Query Cache (MySQL 5.7, deprecated in 8.0)

```sql
-- Check query cache status
SHOW VARIABLES LIKE 'query_cache%';

-- For MySQL 8.0+, use application-level caching (Redis, Memcached)
```

### InnoDB Buffer Pool

```sql
-- Check buffer pool usage
SHOW STATUS LIKE 'Innodb_buffer_pool%';

-- Buffer pool size (50-80% of RAM for dedicated server)
SET GLOBAL innodb_buffer_pool_size = 4294967296;  -- 4GB
```

### Slow Query Log

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- Log queries > 1 second
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';

-- Analyze with pt-query-digest
-- pt-query-digest /var/log/mysql/slow.log
```

---

## MongoDB Optimization

### Indexes

```javascript
// Create index
db.users.createIndex({ email: 1 }, { unique: true });

// Compound index
db.orders.createIndex({ userId: 1, createdAt: -1 });

// Partial index
db.orders.createIndex(
  { status: 1 },
  { partialFilterExpression: { status: 'pending' } }
);

// Text index for search
db.posts.createIndex({ title: 'text', content: 'text' });
```

### Query Optimization

```javascript
// Use projection to limit fields
db.users.find({ status: 'active' }, { name: 1, email: 1 });

// Use explain to analyze queries
db.orders.find({ userId: 123 }).explain('executionStats');

// Key metrics:
// - totalDocsExamined vs nReturned
// - executionTimeMillis
// - stage: COLLSCAN (bad) vs IXSCAN (good)
```

### Aggregation Pipeline Optimization

```javascript
// Put $match early to filter data
db.orders.aggregate([
  { $match: { status: 'completed' } },  // Filter first
  { $group: { _id: '$userId', total: { $sum: '$amount' } } }
]);

// Use $project to reduce document size between stages
db.orders.aggregate([
  { $match: { status: 'completed' } },
  { $project: { userId: 1, amount: 1 } },  // Only needed fields
  { $group: { _id: '$userId', total: { $sum: '$amount' } } }
]);
```

---

## Connection Management

### Connection Pooling Best Practices

```javascript
// PostgreSQL pool configuration
const pool = new Pool({
  max: 20,                      // Max connections in pool
  min: 5,                       // Min connections to maintain
  idleTimeoutMillis: 30000,     // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Fail fast if can't connect
  maxUses: 7500,                // Close connection after N uses
});

// Monitor pool health
setInterval(() => {
  console.log({
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount
  });
}, 10000);
```

### Connection Pool Sizing

Formula: `connections = (core_count * 2) + effective_spindle_count`

For SSD: typically 10-20 connections per CPU core.

```
Example for 4-core server with SSD:
- Base: (4 * 2) + 1 = 9
- With headroom: 15-20 connections
- Per application instance: Divide by number of instances
```

---

## Schema Design

### Normalization vs Denormalization

```sql
-- Normalized (reduce redundancy, slower reads)
CREATE TABLE users (id, name, email);
CREATE TABLE orders (id, user_id, total);
CREATE TABLE order_items (id, order_id, product_id, quantity);

-- Denormalized (redundant data, faster reads)
CREATE TABLE orders (
  id, user_id, user_name, user_email,  -- Embedded user data
  total, items_json                      -- Embedded items
);
```

### Partitioning

```sql
-- PostgreSQL range partitioning
CREATE TABLE orders (
  id SERIAL,
  created_at TIMESTAMP,
  user_id INT,
  total DECIMAL
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2024_01 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE orders_2024_02 PARTITION OF orders
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

### Data Types

```sql
-- Use appropriate types
-- Bad
CREATE TABLE events (id VARCHAR(36), timestamp VARCHAR(50));

-- Good
CREATE TABLE events (id UUID, timestamp TIMESTAMPTZ);

-- Use ENUM for fixed values
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');
CREATE TABLE orders (status order_status);
```

---

## Monitoring & Profiling

### Key Metrics to Monitor

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| Query response time (p95) | > 100ms | > 500ms |
| Connection pool utilization | > 70% | > 90% |
| Lock wait time | > 100ms | > 1s |
| Replication lag | > 1s | > 10s |
| Disk I/O utilization | > 70% | > 90% |
| Buffer/cache hit ratio | < 95% | < 90% |

### Query Performance Monitoring

```sql
-- PostgreSQL: Current running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '5 seconds';

-- MySQL: Current processes
SHOW FULL PROCESSLIST;

-- Kill long-running query
-- PostgreSQL: SELECT pg_terminate_backend(pid);
-- MySQL: KILL process_id;
```

### Recommended Tools

| Tool | Type | Use Case |
|------|------|----------|
| pgBadger | PostgreSQL | Log analysis |
| pg_stat_statements | PostgreSQL | Query statistics |
| Percona Toolkit | MySQL | Query analysis, schema checks |
| MongoDB Compass | MongoDB | Visual profiling |
| pgAdmin | PostgreSQL | GUI management |
| Datadog/NewRelic | All | APM monitoring |
