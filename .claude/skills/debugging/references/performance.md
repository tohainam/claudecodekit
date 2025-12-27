# Performance Debugging

Debugging techniques for performance issues including CPU, memory, and I/O bottlenecks.

## Table of Contents

1. [Performance Analysis Process](#performance-analysis-process)
2. [CPU Profiling](#cpu-profiling)
3. [Memory Analysis](#memory-analysis)
4. [I/O Bottlenecks](#io-bottlenecks)
5. [Concurrency Issues](#concurrency-issues)
6. [Frontend Performance](#frontend-performance)

---

## Performance Analysis Process

### Systematic Approach

```
┌─────────────────────────────────────────────────────────────────┐
│              PERFORMANCE DEBUGGING FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. MEASURE ────► Establish baseline metrics                    │
│       │          Don't guess, measure!                          │
│       ▼                                                         │
│  2. IDENTIFY ──► Find the bottleneck                            │
│       │          CPU? Memory? I/O? Network?                     │
│       ▼                                                         │
│  3. PROFILE ───► Deep dive into bottleneck                      │
│       │          Use appropriate profiling tool                 │
│       ▼                                                         │
│  4. OPTIMIZE ──► Fix the identified issue                       │
│       │          One change at a time                           │
│       ▼                                                         │
│  5. VERIFY ────► Measure improvement                            │
│                  Ensure no regression elsewhere                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Quick System Check

**Linux**:
```bash
# Overall system health
top -bn1 | head -20
vmstat 1 5
iostat -x 1 5

# Process-specific
pidstat -p <pid> 1 5
```

**macOS**:
```bash
top -l 1
vm_stat
iotop  # Requires root
```

### Identify Bottleneck Type

| Symptom | Likely Bottleneck |
|---------|-------------------|
| High CPU usage | CPU-bound code |
| High memory, swapping | Memory leak or inefficiency |
| High I/O wait | Disk or network I/O |
| Low resource usage but slow | Lock contention, external dependency |

---

## CPU Profiling

### Sampling vs Instrumentation

| Approach | Pros | Cons |
|----------|------|------|
| Sampling | Low overhead, production safe | Less precise |
| Instrumentation | Precise timing | High overhead |

### CPU Profiling Tools by Language

**Node.js**:
```bash
# Built-in profiler
node --prof app.js
node --prof-process isolate-*.log > processed.txt

# Clinic.js
npx clinic doctor -- node app.js
npx clinic flame -- node app.js
```

**Python**:
```python
# cProfile
import cProfile
cProfile.run('main()', 'output.prof')

# Analyze
import pstats
p = pstats.Stats('output.prof')
p.sort_stats('cumulative').print_stats(10)

# Line profiler
@profile
def slow_function():
    pass
# Run: kernprof -l -v script.py
```

**Java**:
```bash
# async-profiler (low overhead)
./profiler.sh -d 30 -f flamegraph.html <pid>

# Java Flight Recorder
java -XX:StartFlightRecording=duration=60s,filename=recording.jfr MyApp
```

**Go**:
```go
import "runtime/pprof"

f, _ := os.Create("cpu.prof")
pprof.StartCPUProfile(f)
defer pprof.StopCPUProfile()
// ... code to profile ...
```

### Reading Flame Graphs

```
┌──────────────────────────────────────────────────────────────┐
│                         main()                                │
├────────────────────────────────┬─────────────────────────────┤
│        processData()           │       renderUI()            │
├──────────────────┬─────────────┼─────────────────────────────┤
│   parseJSON()    │  validate() │        DOM updates          │
├──────────────────┴─────────────┴─────────────────────────────┤
```

- Width = time spent (wider = more time)
- Stack grows upward
- Look for wide, flat tops (hot spots)
- Look for deep stacks (optimization opportunity)

---

## Memory Analysis

### Types of Memory Issues

| Issue | Symptoms | Cause |
|-------|----------|-------|
| Memory leak | Gradual increase, eventual OOM | Objects not released |
| Memory spike | Sudden increase, possible OOM | Large allocation |
| Fragmentation | High RSS, low actual usage | Many small allocations |

### Memory Profiling Tools

**Node.js**:
```javascript
// Heap snapshot
const v8 = require('v8');
v8.writeHeapSnapshot();

// Memory usage
console.log(process.memoryUsage());
// { rss, heapTotal, heapUsed, external, arrayBuffers }
```

**Python**:
```python
# tracemalloc
import tracemalloc
tracemalloc.start()
# ... code ...
snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics('lineno')
for stat in top_stats[:10]:
    print(stat)

# memory_profiler
@profile
def memory_hungry():
    pass
# Run: python -m memory_profiler script.py
```

**Java**:
```bash
# Heap dump
jmap -dump:format=b,file=heap.hprof <pid>

# Analyze with Eclipse MAT or VisualVM
```

### Finding Memory Leaks

**Process**:
1. Take baseline heap snapshot
2. Perform suspected leaking action
3. Force garbage collection
4. Take another snapshot
5. Compare - look for growing object counts

**Common leak patterns**:
```javascript
// Event listeners not removed
element.addEventListener('click', handler);
// Missing: element.removeEventListener('click', handler);

// Closures holding references
function createLeak() {
  const hugeArray = new Array(1000000);
  return function() {
    // hugeArray is retained even if not used
  };
}

// Global/static collections
const cache = {};  // Never cleared, grows forever
```

---

## I/O Bottlenecks

### Disk I/O Analysis

**Linux**:
```bash
# I/O statistics
iostat -x 1

# Key metrics:
# %util - Device utilization (>80% = bottleneck)
# await - Average wait time (high = slow disk)
# r/s, w/s - Reads/writes per second
```

**Per-process I/O**:
```bash
pidstat -d -p <pid> 1

# Or iotop for all processes
sudo iotop
```

### Network I/O Analysis

```bash
# Connection states
ss -s

# Per-connection details
ss -tunapl

# Network traffic
nethogs  # Per-process
iftop    # Per-connection
```

### Common I/O Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| Sync writes | High I/O wait | Use async I/O, buffering |
| Small reads/writes | Many IOPS | Batch operations |
| No caching | Repeated same reads | Add caching layer |
| Large file reads | Memory spike | Stream processing |

---

## Concurrency Issues

### Lock Contention

**Symptoms**:
- Low CPU utilization despite many threads
- Threads spending time in wait states
- Inconsistent performance

**Debug approach**:
```
1. Profile lock acquisition time
2. Identify hot locks
3. Consider:
   - Lock-free alternatives
   - Finer-grained locking
   - Read-write locks
   - Lock striping
```

### Thread Pool Sizing

```
CPU-bound tasks:
  threads = number_of_cores

I/O-bound tasks:
  threads = number_of_cores * (1 + wait_time/compute_time)

Example: 4 cores, 90% wait time
  threads = 4 * (1 + 0.9/0.1) = 4 * 10 = 40 threads
```

### Deadlock Detection

```java
// Java: Thread dump
jstack <pid>

// Look for:
// "Found one Java-level deadlock:"
// and circular wait patterns
```

---

## Frontend Performance

### Core Web Vitals

| Metric | Target | What it measures |
|--------|--------|------------------|
| LCP (Largest Contentful Paint) | <2.5s | Loading performance |
| FID (First Input Delay) | <100ms | Interactivity |
| CLS (Cumulative Layout Shift) | <0.1 | Visual stability |

### Chrome DevTools Performance

```
1. Open DevTools → Performance
2. Click Record
3. Perform action
4. Stop recording
5. Analyze:
   - Main thread activity
   - Long tasks (>50ms)
   - Layout shifts
   - JavaScript execution
```

### Common Frontend Performance Issues

**Long Tasks**:
```javascript
// Bug: Long synchronous operation
function processLargeArray(items) {
  items.forEach(item => heavyComputation(item));
}

// Fix: Break into chunks
async function processLargeArray(items) {
  for (let i = 0; i < items.length; i += 100) {
    const chunk = items.slice(i, i + 100);
    chunk.forEach(item => heavyComputation(item));
    await new Promise(r => setTimeout(r, 0)); // Yield to main thread
  }
}
```

**Layout Thrashing**:
```javascript
// Bug: Read-write interleaving
elements.forEach(el => {
  const height = el.offsetHeight;  // Read (forces layout)
  el.style.height = height + 10 + 'px';  // Write (invalidates layout)
});

// Fix: Batch reads, then writes
const heights = elements.map(el => el.offsetHeight);
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px';
});
```

**Bundle Size**:
```bash
# Analyze webpack bundle
npx webpack-bundle-analyzer stats.json

# Tree-shaking issues
# - Side effects in modules
# - CommonJS instead of ES modules
# - Import entire library instead of specific exports
```

---

## Performance Checklist

```
[ ] Establish baseline measurements
[ ] Identify if CPU, memory, I/O, or network bound
[ ] Profile with appropriate tool
[ ] Look for obvious issues:
    [ ] N+1 queries
    [ ] Missing indexes
    [ ] Unoptimized loops
    [ ] Large memory allocations
    [ ] Synchronous I/O
    [ ] Lock contention
[ ] Measure after each change
[ ] Ensure no regression in other areas
[ ] Document findings and optimizations
```
