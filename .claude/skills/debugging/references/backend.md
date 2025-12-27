# Backend Debugging

Debugging techniques for server-side applications across languages and frameworks.

## Table of Contents

1. [Node.js Debugging](#nodejs-debugging)
2. [Python Debugging](#python-debugging)
3. [Java Debugging](#java-debugging)
4. [Go Debugging](#go-debugging)
5. [Common Backend Issues](#common-backend-issues)
6. [Distributed Systems](#distributed-systems)

---

## Node.js Debugging

### Built-in Debugger

```bash
# Start with inspector
node --inspect app.js
node --inspect-brk app.js  # Break on first line

# Then open chrome://inspect in Chrome
```

### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Program",
      "program": "${workspaceFolder}/src/index.js",
      "env": { "DEBUG": "*" }
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Process",
      "port": 9229
    }
  ]
}
```

### Common Node.js Issues

#### Unhandled Promise Rejections

```javascript
// Bug: Silent failure
async function process() {
  await riskyOperation(); // If this throws, nothing catches it
}
process();

// Fix: Global handler + proper catches
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// Better: Explicit error handling
process().catch(err => console.error('Process failed:', err));
```

#### Event Loop Blocking

```javascript
// Bug: Blocking the event loop
const data = fs.readFileSync('/large/file'); // Blocks!

// Fix: Use async version
const data = await fs.promises.readFile('/large/file');

// Detect: Monitor event loop lag
let lastCheck = Date.now();
setInterval(() => {
  const now = Date.now();
  const lag = now - lastCheck - 1000;
  if (lag > 100) console.warn(`Event loop lag: ${lag}ms`);
  lastCheck = now;
}, 1000);
```

#### Memory Leaks

```javascript
// Common causes:
// 1. Growing arrays/maps
const cache = new Map(); // Never cleared

// 2. Event listeners
emitter.on('data', handler); // Never removed

// 3. Closures holding references
function createHandler(bigData) {
  return () => { /* bigData held in closure */ };
}

// Debug: Take heap snapshots
// node --inspect, then Chrome DevTools → Memory → Heap Snapshot
```

### Debug Module

```javascript
const debug = require('debug');
const dbDebug = debug('app:db');
const httpDebug = debug('app:http');

dbDebug('Query executed: %s', query);
httpDebug('Request received: %s %s', method, url);

// Enable: DEBUG=app:* node app.js
// Filter: DEBUG=app:db node app.js
```

---

## Python Debugging

### pdb (Built-in Debugger)

```python
import pdb

def problematic_function(data):
    pdb.set_trace()  # Debugger starts here
    result = process(data)
    return result

# Python 3.7+: Just use breakpoint()
def problematic_function(data):
    breakpoint()
    result = process(data)
    return result
```

**pdb commands**:
```
n(ext)      - Step over
s(tep)      - Step into
c(ontinue)  - Continue execution
p expr      - Print expression
pp expr     - Pretty print
l(ist)      - Show source
w(here)     - Print stack trace
q(uit)      - Quit debugger
```

### VS Code Python Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Current File",
      "type": "python",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal"
    },
    {
      "name": "Django",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/manage.py",
      "args": ["runserver", "--noreload"]
    }
  ]
}
```

### Common Python Issues

#### Mutable Default Arguments

```python
# Bug: Default list shared across calls
def append_to(element, lst=[]):
    lst.append(element)
    return lst

append_to(1)  # [1]
append_to(2)  # [1, 2] - Unexpected!

# Fix: Use None as default
def append_to(element, lst=None):
    if lst is None:
        lst = []
    lst.append(element)
    return lst
```

#### Import Circular Dependencies

```python
# module_a.py
from module_b import func_b  # Error: circular import

# Fix 1: Import inside function
def func_a():
    from module_b import func_b
    return func_b()

# Fix 2: Restructure modules
# Extract shared code to module_c
```

#### GIL Issues (Threading)

```python
# Bug: CPU-bound threads don't parallelize
import threading

def cpu_intensive():
    # This won't run in parallel due to GIL
    return sum(i*i for i in range(10**7))

# Fix: Use multiprocessing for CPU-bound
from multiprocessing import Pool
with Pool() as p:
    results = p.map(cpu_intensive, range(4))
```

---

## Java Debugging

### JVM Debugging Options

```bash
# Remote debugging
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 -jar app.jar

# For Java 9+
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005 -jar app.jar
```

### Common Java Issues

#### NullPointerException

```java
// Bug: Unchecked null
String name = user.getAddress().getCity(); // NPE if address is null

// Fix: Null checks or Optional
String name = Optional.ofNullable(user)
    .map(User::getAddress)
    .map(Address::getCity)
    .orElse("Unknown");
```

#### Thread Issues

```java
// Bug: Race condition
public class Counter {
    private int count = 0;
    public void increment() { count++; } // Not atomic!
}

// Fix: Use atomic or synchronized
public class Counter {
    private AtomicInteger count = new AtomicInteger(0);
    public void increment() { count.incrementAndGet(); }
}
```

#### Memory Issues

```bash
# Heap dump on OOM
java -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heap.hprof -jar app.jar

# Analyze with Eclipse MAT or VisualVM
```

### JVM Profiling Tools

| Tool | Purpose |
|------|---------|
| VisualVM | CPU, memory, threads (free) |
| JProfiler | Full profiling (paid) |
| async-profiler | Low-overhead CPU/allocation |
| Java Flight Recorder | Production monitoring |

---

## Go Debugging

### Delve Debugger

```bash
# Install
go install github.com/go-delve/delve/cmd/dlv@latest

# Debug
dlv debug main.go
dlv test -- -test.run TestFunction
dlv attach <pid>
```

**Delve commands**:
```
break main.go:15   - Set breakpoint
continue           - Run until breakpoint
next               - Step over
step               - Step into
print varname      - Print variable
goroutines         - List goroutines
goroutine <id>     - Switch to goroutine
```

### Common Go Issues

#### Nil Interface vs Nil Pointer

```go
// Bug: Non-nil interface containing nil pointer
type MyError struct{}
func (e *MyError) Error() string { return "error" }

func getError() error {
    var err *MyError = nil
    return err // Returns non-nil interface!
}

if getError() != nil { // True! Interface is not nil
    // This executes even though underlying value is nil
}

// Fix: Return nil explicitly
func getError() error {
    var err *MyError = nil
    if err == nil {
        return nil
    }
    return err
}
```

#### Goroutine Leaks

```go
// Bug: Goroutine blocked forever
func process() {
    ch := make(chan int)
    go func() {
        result := compute()
        ch <- result // Blocks if no receiver
    }()
    // If we return early, goroutine leaks
}

// Fix: Use buffered channel or context
func process(ctx context.Context) {
    ch := make(chan int, 1)
    go func() {
        select {
        case ch <- compute():
        case <-ctx.Done():
        }
    }()
}
```

### pprof Profiling

```go
import _ "net/http/pprof"

func main() {
    go func() {
        http.ListenAndServe(":6060", nil)
    }()
    // ...
}
```

```bash
# CPU profile
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30

# Memory profile
go tool pprof http://localhost:6060/debug/pprof/heap

# Goroutine profile
go tool pprof http://localhost:6060/debug/pprof/goroutine
```

---

## Common Backend Issues

### Connection Pool Exhaustion

```
Symptoms:
- Timeouts acquiring connections
- Application hangs
- "Too many connections" errors

Debugging:
1. Check pool metrics (active, idle, waiting)
2. Look for connection leaks (opened but not closed)
3. Check if transactions are committed/rolled back
4. Look for long-running queries holding connections
```

### Race Conditions

```
Symptoms:
- Intermittent failures
- Data corruption
- Deadlocks

Debugging:
1. Add logging with timestamps and thread IDs
2. Use race detection tools (go run -race, Thread Sanitizer)
3. Review shared state access
4. Check lock ordering for deadlocks
```

### Resource Leaks

```
Symptoms:
- Gradual memory increase
- File descriptor exhaustion
- Socket/connection limit reached

Debugging:
1. Monitor resource usage over time
2. Take periodic snapshots
3. Look for missing close() calls
4. Check error paths (defer cleanup)
```

---

## Distributed Systems

### Request Tracing

```
Add correlation ID to all requests:
1. Generate ID at entry point
2. Pass through all internal calls
3. Include in all log messages
4. Use for distributed tracing (Jaeger, Zipkin)
```

### Debugging Microservices

```
1. Identify which service fails (tracing, logs)
2. Check service health endpoints
3. Verify service discovery/routing
4. Check inter-service communication (network, auth)
5. Reproduce with isolated service if possible
```

### Common Distributed Issues

| Issue | Symptoms | Debug Approach |
|-------|----------|----------------|
| Network partition | Timeout, partial failures | Check connectivity, retry logic |
| Clock skew | Ordering issues, expiry bugs | Use logical clocks, verify NTP |
| Split brain | Data inconsistency | Check consensus protocol, quorum |
| Cascading failure | One failure causes others | Check circuit breakers, timeouts |
