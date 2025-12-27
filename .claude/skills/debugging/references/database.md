# Database Debugging

Debugging techniques for SQL databases, query optimization, and data issues.

## Table of Contents

1. [Query Analysis](#query-analysis)
2. [EXPLAIN Plans](#explain-plans)
3. [Common Query Issues](#common-query-issues)
4. [Index Debugging](#index-debugging)
5. [Connection Issues](#connection-issues)
6. [Data Integrity](#data-integrity)

---

## Query Analysis

### Identifying Slow Queries

**PostgreSQL**:
```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
SELECT pg_reload_conf();

-- Query statistics
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

**MySQL**:
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Query from performance schema
SELECT * FROM performance_schema.events_statements_summary_by_digest
ORDER BY SUM_TIMER_WAIT DESC
LIMIT 10;
```

### Query Profiling

**PostgreSQL**:
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM users WHERE email = 'test@example.com';
```

**MySQL**:
```sql
SET profiling = 1;
SELECT * FROM users WHERE email = 'test@example.com';
SHOW PROFILES;
SHOW PROFILE FOR QUERY 1;
```

---

## EXPLAIN Plans

### Reading EXPLAIN Output

```sql
EXPLAIN ANALYZE SELECT * FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.total > 100;
```

**Key indicators**:

| Term | Meaning | Good/Bad |
|------|---------|----------|
| Seq Scan | Full table scan | Usually bad for large tables |
| Index Scan | Using index | Good |
| Index Only Scan | Index covers query | Best |
| Bitmap Scan | Combines multiple indexes | Good for OR conditions |
| Nested Loop | Loop join | Good for small inner table |
| Hash Join | Build hash table for join | Good for large tables |
| Merge Join | Sorted merge | Good for pre-sorted data |

### Cost Interpretation

```
Seq Scan on users  (cost=0.00..1234.00 rows=10000 width=50)
                    └─ startup..total    └─ estimated  └─ row width
```

- **Startup cost**: Cost before first row returned
- **Total cost**: Cost to return all rows
- **Rows**: Estimated row count
- **Actual**: Real execution metrics (with ANALYZE)

### Warning Signs in Plans

```
⚠️ Seq Scan on large table (>10K rows)
⚠️ Nested Loop with large outer table
⚠️ Sort using disk (external sort)
⚠️ Estimated rows far from actual rows (statistics outdated)
⚠️ Filter removing most rows (pushdown possible?)
```

---

## Common Query Issues

### N+1 Query Problem

```python
# Bug: N+1 queries
for order in Order.objects.all():
    print(order.customer.name)  # Query per order

# Fix: Eager loading
for order in Order.objects.select_related('customer').all():
    print(order.customer.name)  # Single query with JOIN
```

**Symptoms**: Many similar queries in short succession.

### Missing Index

```sql
-- Find missing index opportunities (PostgreSQL)
SELECT schemaname, relname, seq_scan, idx_scan,
       seq_scan - idx_scan AS difference
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan
ORDER BY difference DESC;
```

**When to add index**:
- Column frequently in WHERE clause
- Column used in JOIN condition
- Column used in ORDER BY

### Implicit Type Conversion

```sql
-- Bug: Index not used due to type mismatch
SELECT * FROM users WHERE user_id = '123';  -- user_id is INT

-- Fix: Use correct type
SELECT * FROM users WHERE user_id = 123;
```

### Cartesian Product

```sql
-- Bug: Missing JOIN condition
SELECT * FROM orders, customers;  -- Returns m × n rows

-- Fix: Add proper JOIN
SELECT * FROM orders o
JOIN customers c ON o.customer_id = c.id;
```

### SELECT *

```sql
-- Bug: Fetching unnecessary columns
SELECT * FROM users WHERE id = 1;  -- May prevent index-only scan

-- Fix: Select only needed columns
SELECT id, name, email FROM users WHERE id = 1;
```

---

## Index Debugging

### Check Index Usage

**PostgreSQL**:
```sql
SELECT indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

**MySQL**:
```sql
SELECT * FROM sys.schema_unused_indexes;
SELECT * FROM sys.schema_redundant_indexes;
```

### Why Index Not Used

| Reason | Solution |
|--------|----------|
| Low selectivity | Index might not help, DB chooses scan |
| Function on column | Create functional index |
| Type mismatch | Fix query to match column type |
| OR conditions | Use UNION or bitmap scan |
| NULL handling | Consider partial index |
| Statistics stale | Run ANALYZE |
| Small table | Seq scan may be faster |

### Index Types

```sql
-- B-tree (default, most common)
CREATE INDEX idx_name ON users(name);

-- Hash (equality only)
CREATE INDEX idx_hash ON users USING hash(name);

-- GIN (arrays, full-text, JSONB)
CREATE INDEX idx_tags ON posts USING gin(tags);

-- GiST (geometric, range types)
CREATE INDEX idx_location ON places USING gist(location);

-- Partial index
CREATE INDEX idx_active ON users(email) WHERE active = true;

-- Covering index (index-only scans)
CREATE INDEX idx_covering ON orders(customer_id) INCLUDE (total, status);
```

---

## Connection Issues

### Connection Pool Debugging

**Symptoms**:
- "Too many connections"
- Long wait times for connections
- Application hangs

**Debug**:
```sql
-- PostgreSQL: View connections
SELECT * FROM pg_stat_activity;
SELECT count(*) FROM pg_stat_activity;

-- MySQL: View connections
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Threads_connected';
```

### Connection Leaks

```python
# Bug: Connection not returned to pool
def get_user(user_id):
    conn = pool.getconn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    return cursor.fetchone()  # Connection never released!

# Fix: Use context manager
def get_user(user_id):
    with pool.getconn() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            return cursor.fetchone()
    # Connection automatically returned
```

### Deadlock Detection

```sql
-- PostgreSQL: View locks
SELECT blocked_locks.pid AS blocked_pid,
       blocking_locks.pid AS blocking_pid,
       blocked_activity.query AS blocked_query,
       blocking_activity.query AS blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_locks blocking_locks
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

---

## Data Integrity

### Finding Orphaned Records

```sql
-- Find orders without customers
SELECT o.* FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE c.id IS NULL;
```

### Duplicate Detection

```sql
-- Find duplicate emails
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;
```

### Constraint Violations

```sql
-- Check for NULL in NOT NULL column (before adding constraint)
SELECT * FROM users WHERE email IS NULL;

-- Check for foreign key violations
SELECT o.* FROM orders o
WHERE NOT EXISTS (
    SELECT 1 FROM customers c WHERE c.id = o.customer_id
);
```

### Data Type Issues

```sql
-- Find non-numeric values in supposedly numeric column
SELECT * FROM imports
WHERE amount !~ '^[0-9]+\.?[0-9]*$';

-- Find invalid dates
SELECT * FROM events
WHERE event_date::date IS NULL
  OR event_date::date < '1900-01-01'
  OR event_date::date > '2100-01-01';
```

---

## Query Optimization Checklist

```
[ ] Run EXPLAIN ANALYZE on slow query
[ ] Check for full table scans on large tables
[ ] Verify indexes exist on JOIN and WHERE columns
[ ] Check for implicit type conversions
[ ] Look for N+1 query patterns
[ ] Verify statistics are up to date (ANALYZE)
[ ] Check for missing index on ORDER BY columns
[ ] Review if query can use covering index
[ ] Consider query rewrite (subquery vs JOIN)
[ ] Check for lock contention
[ ] Verify connection pool is properly sized
```
