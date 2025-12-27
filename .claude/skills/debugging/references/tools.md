# Debugging Tools Reference

Comprehensive reference for debugging tools, logging, and observability.

## Table of Contents

1. [IDE Debuggers](#ide-debuggers)
2. [Logging Best Practices](#logging-best-practices)
3. [Distributed Tracing](#distributed-tracing)
4. [Monitoring & Observability](#monitoring--observability)
5. [Command-Line Tools](#command-line-tools)

---

## IDE Debuggers

### VS Code

**Launch configurations** (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Node.js",
      "program": "${workspaceFolder}/src/index.js",
      "env": { "NODE_ENV": "development" }
    },
    {
      "type": "python",
      "request": "launch",
      "name": "Debug Python",
      "program": "${file}",
      "console": "integratedTerminal"
    },
    {
      "type": "go",
      "request": "launch",
      "name": "Debug Go",
      "program": "${workspaceFolder}"
    },
    {
      "type": "java",
      "request": "launch",
      "name": "Debug Java",
      "mainClass": "com.example.Main"
    }
  ]
}
```

**Key shortcuts**:
| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Start debugging | F5 | F5 |
| Step over | F10 | F10 |
| Step into | F11 | F11 |
| Step out | Shift+F11 | Shift+F11 |
| Continue | F5 | F5 |
| Toggle breakpoint | F9 | F9 |

### JetBrains IDEs (IntelliJ, PyCharm, WebStorm)

**Breakpoint types**:
- Line breakpoint
- Method breakpoint (triggers on entry/exit)
- Field watchpoint (triggers on read/write)
- Exception breakpoint (triggers on throw)

**Evaluate expression**: Alt+F8 (during debug)

**Conditional breakpoint**: Right-click breakpoint → Condition

### Xcode (iOS/macOS)

**LLDB commands**:
```
po object          - Print object
p variable         - Print primitive
expr var = value   - Modify value
thread backtrace   - Show call stack
frame variable     - Show local variables
```

### Android Studio

**Breakpoint features**:
- Suspend thread vs all threads
- Log message instead of suspend
- Evaluate and log expression
- Hit count condition

---

## Logging Best Practices

### Log Levels

| Level | When to use |
|-------|-------------|
| ERROR | Application error, needs attention |
| WARN | Unexpected but handled, potential issue |
| INFO | Significant events (startup, shutdown, transactions) |
| DEBUG | Detailed diagnostic info (dev/troubleshooting) |
| TRACE | Very detailed (request/response bodies, loops) |

### Structured Logging

```javascript
// Bad: Unstructured
console.log('User login failed for user ' + userId);

// Good: Structured
logger.warn({
  event: 'login_failed',
  userId: userId,
  reason: 'invalid_password',
  ip: request.ip,
  timestamp: new Date().toISOString()
});
```

### Correlation IDs

```javascript
// Generate at entry point
const correlationId = uuid();

// Pass through all calls
logger.info({ correlationId, event: 'request_start' });
// ...
logger.info({ correlationId, event: 'db_query', query });
// ...
logger.info({ correlationId, event: 'request_end', status: 200 });
```

### Logging Libraries

| Language | Library |
|----------|---------|
| Node.js | Winston, Pino, Bunyan |
| Python | logging (stdlib), structlog, loguru |
| Java | SLF4J + Logback, Log4j2 |
| Go | zap, zerolog, logrus |
| .NET | Serilog, NLog |

### Example: Node.js with Pino

```javascript
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: 'my-service',
    version: process.env.APP_VERSION,
  },
});

// Usage
logger.info({ userId: 123, action: 'login' }, 'User logged in');
logger.error({ err, userId: 123 }, 'Failed to process request');
```

---

## Distributed Tracing

### OpenTelemetry (2025 Standard)

```javascript
// Node.js setup
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

### Tracing Tools

| Tool | Description | Best For |
|------|-------------|----------|
| Jaeger | Open-source, CNCF project | Self-hosted, Kubernetes |
| Zipkin | Open-source, mature | Simple setup |
| Tempo (Grafana) | Open-source, Grafana integration | Grafana stack users |
| Datadog APM | Commercial, full-featured | Enterprise, SaaS |
| AWS X-Ray | AWS native | AWS environments |

### Trace Context Propagation

```javascript
// HTTP header propagation (W3C standard)
// traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01

// Extract from incoming request
const parentContext = propagation.extract(context.active(), req.headers);

// Inject into outgoing request
const headers = {};
propagation.inject(context.active(), headers);
fetch(url, { headers });
```

---

## Monitoring & Observability

### Three Pillars

```
┌─────────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY                                 │
├─────────────────────┬─────────────────────┬─────────────────────┤
│       LOGS          │       METRICS       │       TRACES        │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ What happened       │ How system performs │ Request flow        │
│ Discrete events     │ Aggregated numbers  │ Causation chain     │
│ High cardinality    │ Low cardinality     │ Medium cardinality  │
│ ELK, Loki           │ Prometheus, StatsD  │ Jaeger, Zipkin      │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

### Key Metrics to Monitor

**RED Method (Request-driven)**:
- **R**ate: Requests per second
- **E**rrors: Failed requests per second
- **D**uration: Request latency distribution

**USE Method (Resource-driven)**:
- **U**tilization: % time resource is busy
- **S**aturation: Queue length, waiting work
- **E**rrors: Error count

### Prometheus Metrics Example

```javascript
const client = require('prom-client');

// Counter
const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
});

// Histogram
const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'path'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Usage
app.use((req, res, next) => {
  const end = httpDuration.startTimer({ method: req.method, path: req.path });
  res.on('finish', () => {
    end();
    httpRequests.inc({ method: req.method, path: req.path, status: res.statusCode });
  });
  next();
});
```

---

## Command-Line Tools

### Process Investigation

```bash
# Find process by name/port
pgrep -f "node app"
lsof -i :3000

# Process details
ps aux | grep <pid>
cat /proc/<pid>/status  # Linux

# File descriptors
ls -l /proc/<pid>/fd    # Linux
lsof -p <pid>

# System calls
strace -p <pid>         # Linux
dtruss -p <pid>         # macOS
```

### Network Debugging

```bash
# DNS resolution
dig example.com
nslookup example.com

# Connection test
curl -v https://api.example.com
telnet host port
nc -zv host port

# TCP dump
tcpdump -i any port 8080

# HTTP debugging
curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' -v https://api.example.com
```

### Log Analysis

```bash
# Search logs
grep -r "ERROR" /var/log/
grep -A5 -B5 "exception" app.log  # Context lines

# Real-time monitoring
tail -f app.log
tail -f app.log | grep --line-buffered "ERROR"

# Log statistics
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head  # Top IPs
grep "500" access.log | wc -l  # Count 500 errors

# Parse JSON logs
cat app.log | jq '.level'
cat app.log | jq 'select(.level == "error")'
```

### Git Debugging

```bash
# Find when bug introduced
git bisect start
git bisect bad HEAD
git bisect good v1.0
# Test each commit, mark good/bad
git bisect reset

# Who changed this line
git blame file.js

# Search commit messages
git log --grep="bug fix"

# Search code changes
git log -p -S "function_name"

# Recent changes to file
git log --oneline -10 -- path/to/file
```

---

## Quick Reference

### Debug This Issue Type

| Issue | First Tool |
|-------|------------|
| Crash/exception | Stack trace, error logs |
| Performance | Profiler (CPU/memory) |
| Memory leak | Heap snapshots |
| Network issue | curl, tcpdump, browser DevTools |
| Database slow | EXPLAIN ANALYZE, slow query log |
| Concurrency bug | Thread dump, race detector |
| Production issue | Logs + metrics + traces |

### Must-Have Tools

```
Development:
- IDE debugger with breakpoints
- Browser DevTools
- curl/httpie for API testing

Production:
- Centralized logging (ELK, Loki)
- Metrics (Prometheus, Datadog)
- Distributed tracing (Jaeger, Tempo)
- Error tracking (Sentry, Rollbar)
```
