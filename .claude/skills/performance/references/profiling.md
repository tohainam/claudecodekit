# Performance Profiling Tools

## Table of Contents
1. [Web Performance Tools](#web-performance-tools)
2. [Node.js Profiling](#nodejs-profiling)
3. [Python Profiling](#python-profiling)
4. [Go Profiling](#go-profiling)
5. [Java Profiling](#java-profiling)
6. [Database Profiling](#database-profiling)
7. [Mobile Profiling](#mobile-profiling)
8. [APM Solutions](#apm-solutions)

---

## Web Performance Tools

### Lighthouse

```bash
# CLI usage
npm install -g lighthouse
lighthouse https://example.com --output=html --output-path=./report.html

# Programmatic usage
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const result = await lighthouse(url, {
    port: chrome.port,
    onlyCategories: ['performance']
  });
  await chrome.kill();
  return result.lhr;
}
```

### WebPageTest

```bash
# API usage
curl "https://www.webpagetest.org/runtest.php?url=https://example.com&f=json&k=YOUR_API_KEY"

# Key metrics in results:
# - TTFB (Time to First Byte)
# - Start Render
# - Speed Index
# - LCP, CLS, TBT
# - Waterfall chart
```

### Chrome DevTools Performance Panel

```
How to use:
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record button
4. Perform actions to profile
5. Stop recording
6. Analyze:
   - Main thread activity (yellow = JS, purple = rendering)
   - Long tasks (> 50ms, marked with red corner)
   - Layout shifts
   - Network requests waterfall
```

### Web Vitals Library

```javascript
import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals';

// Log to console
onLCP(console.log);
onINP(console.log);
onCLS(console.log);
onFCP(console.log);
onTTFB(console.log);

// Send to analytics
function sendToAnalytics({ name, delta, id }) {
  const body = JSON.stringify({ name, delta, id });
  navigator.sendBeacon('/analytics', body);
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

### Bundle Analyzers

```bash
# Webpack Bundle Analyzer
npm install --save-dev webpack-bundle-analyzer
# Add to webpack.config.js:
# plugins: [new BundleAnalyzerPlugin()]

# Vite
npx vite-bundle-visualizer

# Next.js
ANALYZE=true npm run build

# source-map-explorer
npm install -g source-map-explorer
source-map-explorer bundle.js bundle.js.map
```

---

## Node.js Profiling

### Built-in Profiler

```bash
# V8 CPU Profiler
node --prof app.js
# Creates isolate-*.log

# Process the log
node --prof-process isolate-*.log > processed.txt

# Flamegraph output
node --prof-process --preprocess -j isolate*.log | flamebearer
```

### Chrome DevTools for Node.js

```bash
# Start with inspector
node --inspect app.js
# Or break on first line
node --inspect-brk app.js

# Open chrome://inspect in Chrome
# Click "Open dedicated DevTools for Node"
```

### Clinic.js

```bash
# Install
npm install -g clinic

# Doctor - general diagnostics
clinic doctor -- node app.js

# Flame - CPU flamegraph
clinic flame -- node app.js

# Bubbleprof - async operations
clinic bubbleprof -- node app.js

# HeapProfiler - memory analysis
clinic heapprofiler -- node app.js
```

### 0x Flamegraph

```bash
npm install -g 0x

# Generate flamegraph
0x app.js

# With specific options
0x --output-dir ./profiles --open app.js
```

### Memory Profiling

```javascript
// Heap snapshot
const v8 = require('v8');
const fs = require('fs');

function takeHeapSnapshot() {
  const snapshotStream = v8.writeHeapSnapshot();
  console.log(`Heap snapshot written to ${snapshotStream}`);
}

// Memory usage tracking
setInterval(() => {
  const usage = process.memoryUsage();
  console.log({
    rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
    external: Math.round(usage.external / 1024 / 1024) + 'MB'
  });
}, 10000);

// Force garbage collection (for testing)
// Run with: node --expose-gc app.js
if (global.gc) {
  global.gc();
}
```

### Event Loop Monitoring

```javascript
const { monitorEventLoopDelay } = require('perf_hooks');

const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();

setInterval(() => {
  console.log({
    min: h.min / 1e6,       // Convert to ms
    max: h.max / 1e6,
    mean: h.mean / 1e6,
    stddev: h.stddev / 1e6,
    p50: h.percentile(50) / 1e6,
    p99: h.percentile(99) / 1e6
  });
  h.reset();
}, 5000);
```

---

## Python Profiling

### cProfile

```python
import cProfile
import pstats

# Profile a function
cProfile.run('my_function()', 'output.prof')

# Analyze results
stats = pstats.Stats('output.prof')
stats.sort_stats('cumulative')
stats.print_stats(20)  # Top 20

# Profile script from command line
# python -m cProfile -o output.prof script.py

# Visualize with snakeviz
# pip install snakeviz
# snakeviz output.prof
```

### line_profiler

```python
# pip install line_profiler

# Decorate function to profile
@profile
def slow_function():
    total = 0
    for i in range(1000000):
        total += i
    return total

# Run with kernprof
# kernprof -l -v script.py
```

### memory_profiler

```python
# pip install memory_profiler

from memory_profiler import profile

@profile
def memory_heavy_function():
    large_list = [i for i in range(1000000)]
    return sum(large_list)

# Run: python -m memory_profiler script.py

# Track memory over time
from memory_profiler import memory_usage

def my_function():
    # ... code ...
    pass

mem_usage = memory_usage(my_function)
print(f"Peak memory: {max(mem_usage)} MiB")
```

### py-spy

```bash
# Install
pip install py-spy

# Live top-like view
py-spy top --pid 12345

# Record to flamegraph
py-spy record -o profile.svg --pid 12345

# Profile script directly
py-spy record -o profile.svg -- python script.py
```

### Scalene

```bash
# pip install scalene

# Profile CPU, memory, and GPU
scalene script.py

# Output to HTML
scalene --html --outfile profile.html script.py
```

---

## Go Profiling

### pprof

```go
import (
    "net/http"
    _ "net/http/pprof"
)

func main() {
    // Expose pprof endpoints
    go func() {
        http.ListenAndServe("localhost:6060", nil)
    }()

    // Your application code
}

// Access profiles:
// CPU:    go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30
// Heap:   go tool pprof http://localhost:6060/debug/pprof/heap
// Goroutines: go tool pprof http://localhost:6060/debug/pprof/goroutine
// Block:  go tool pprof http://localhost:6060/debug/pprof/block
// Mutex:  go tool pprof http://localhost:6060/debug/pprof/mutex
```

### Benchmark Profiling

```go
// benchmark_test.go
func BenchmarkMyFunction(b *testing.B) {
    for i := 0; i < b.N; i++ {
        MyFunction()
    }
}

// Run with profiling
// go test -bench=. -cpuprofile=cpu.prof
// go test -bench=. -memprofile=mem.prof
// go test -bench=. -trace=trace.out

// Analyze
// go tool pprof cpu.prof
// (pprof) top
// (pprof) web  # Opens flamegraph in browser
```

### Trace

```bash
# Generate trace
go test -trace=trace.out
# Or: curl http://localhost:6060/debug/pprof/trace?seconds=5 > trace.out

# Analyze
go tool trace trace.out
```

### fgprof (Wall-clock profiler)

```go
import "github.com/felixge/fgprof"

func main() {
    http.DefaultServeMux.Handle("/debug/fgprof", fgprof.Handler())
    go http.ListenAndServe(":6060", nil)
    // ...
}

// Capture profile
// go tool pprof --http=:6061 http://localhost:6060/debug/fgprof?seconds=10
```

---

## Java Profiling

### JFR (Java Flight Recorder)

```bash
# Start recording
java -XX:StartFlightRecording=duration=60s,filename=recording.jfr -jar app.jar

# Continuous recording
java -XX:StartFlightRecording=disk=true,maxsize=500m,maxage=1h -jar app.jar

# Analyze with JDK Mission Control
jmc  # Opens GUI

# Command line analysis
jfr print --events CPULoad recording.jfr
jfr summary recording.jfr
```

### async-profiler

```bash
# Download from https://github.com/async-profiler/async-profiler

# Profile running JVM
./profiler.sh -d 30 -f profile.html PID

# CPU profiling
./profiler.sh -e cpu -d 30 -f cpu.html PID

# Allocation profiling
./profiler.sh -e alloc -d 30 -f alloc.html PID

# Wall-clock profiling
./profiler.sh -e wall -d 30 -f wall.html PID
```

### VisualVM

```bash
# Download from https://visualvm.github.io/

# Enable JMX for remote profiling
java -Dcom.sun.management.jmxremote \
     -Dcom.sun.management.jmxremote.port=9010 \
     -Dcom.sun.management.jmxremote.authenticate=false \
     -Dcom.sun.management.jmxremote.ssl=false \
     -jar app.jar
```

### JVM Options for Diagnostics

```bash
# GC logging
java -Xlog:gc*:file=gc.log:time,uptime:filecount=5,filesize=10M -jar app.jar

# Heap dump on OOM
java -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/path/to/dumps -jar app.jar

# Print JIT compilation
java -XX:+PrintCompilation -jar app.jar

# Native memory tracking
java -XX:NativeMemoryTracking=summary -jar app.jar
# Then: jcmd PID VM.native_memory summary
```

---

## Database Profiling

### PostgreSQL

```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 100;  -- Log queries > 100ms
SELECT pg_reload_conf();

-- Enable pg_stat_statements
CREATE EXTENSION pg_stat_statements;

-- View slowest queries
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- EXPLAIN ANALYZE
EXPLAIN (ANALYZE, BUFFERS, TIMING, FORMAT TEXT)
SELECT * FROM orders WHERE user_id = 123;

-- Auto-explain for slow queries
LOAD 'auto_explain';
SET auto_explain.log_min_duration = '100ms';
SET auto_explain.log_analyze = true;
```

### MySQL

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Performance Schema
SELECT * FROM performance_schema.events_statements_summary_by_digest
ORDER BY SUM_TIMER_WAIT DESC
LIMIT 10;

-- EXPLAIN
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123;

-- pt-query-digest (Percona Toolkit)
-- pt-query-digest /var/log/mysql/slow.log
```

### MongoDB

```javascript
// Enable profiling
db.setProfilingLevel(1, { slowms: 100 });

// View slow queries
db.system.profile.find().sort({ ts: -1 }).limit(10);

// Explain query
db.orders.find({ userId: 123 }).explain("executionStats");

// mongotop - collection activity
// mongotop 10  # refresh every 10 seconds

// mongostat - server statistics
// mongostat
```

---

## Mobile Profiling

### iOS - Instruments

```
Key instruments:
- Time Profiler: CPU usage
- Allocations: Memory allocation/deallocation
- Leaks: Memory leaks
- Core Animation: Rendering performance
- Network: Network activity
- Energy Log: Battery usage

Access: Xcode > Product > Profile (⌘I)
```

### Android - Android Profiler

```
Android Studio > View > Tool Windows > Profiler

Profilers:
- CPU Profiler: Method tracing, system traces
- Memory Profiler: Heap dumps, allocation tracking
- Network Profiler: Request/response inspection
- Energy Profiler: Battery usage

Command line tools:
- systrace: System-wide tracing
- perfetto: Modern tracing
```

### React Native

```bash
# Flipper (recommended)
# Install Flipper desktop app
# Includes: React DevTools, Network, Layout, Hermes Debugger

# Hermes CPU Profiler
# In Flipper, select "Hermes Debugger" > "Profile"

# Console logging performance
import { PerformanceObserver, performance } from 'perf_hooks';

performance.mark('start');
// ... operation ...
performance.mark('end');
performance.measure('operation', 'start', 'end');
```

### Flutter

```bash
# DevTools
flutter pub global activate devtools
flutter pub global run devtools

# Performance overlay
MaterialApp(
  showPerformanceOverlay: true,
)

# Timeline
flutter run --profile
# Then in DevTools: Timeline tab

# Benchmark
flutter drive --profile --trace-startup
```

---

## APM Solutions

### Comparison

| Tool | Best For | Pricing |
|------|----------|---------|
| Datadog | Full-stack visibility | Per host |
| New Relic | Application performance | Per user |
| Dynatrace | Enterprise, AI-powered | Per host |
| Elastic APM | Open source, logs | Self-hosted free |
| Sentry | Error tracking + performance | Per event |
| Grafana + Tempo | Tracing, open source | Self-hosted free |

### OpenTelemetry Setup

```javascript
// Node.js
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const provider = new NodeTracerProvider();

provider.addSpanProcessor(
  new SimpleSpanProcessor(
    new OTLPTraceExporter({
      url: 'http://localhost:4318/v1/traces'
    })
  )
);

provider.register();

registerInstrumentations({
  instrumentations: [getNodeAutoInstrumentations()]
});
```

### Key Metrics to Track

```
Application Metrics:
- Request rate (requests/second)
- Error rate (%)
- Response time (p50, p95, p99)
- Apdex score

Infrastructure Metrics:
- CPU utilization
- Memory usage
- Disk I/O
- Network throughput

Business Metrics:
- Conversion rate
- Cart abandonment
- User session duration
- Revenue per session
```
