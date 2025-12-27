# Frontend Debugging

Debugging techniques for browser-based applications, SPAs, and frontend frameworks.

## Table of Contents

1. [Browser DevTools](#browser-devtools)
2. [React Debugging](#react-debugging)
3. [Vue Debugging](#vue-debugging)
4. [Angular Debugging](#angular-debugging)
5. [Common Frontend Issues](#common-frontend-issues)
6. [Network Debugging](#network-debugging)

---

## Browser DevTools

### Chrome DevTools Essentials

#### Console

```javascript
// Beyond console.log
console.table(array);           // Display array/object as table
console.group('label');         // Group related logs
console.groupEnd();
console.time('operation');      // Measure execution time
console.timeEnd('operation');
console.trace();                // Print stack trace
console.assert(condition, msg); // Log only if condition false
console.dir(domElement);        // Inspect DOM element as object
```

#### Sources Panel (Debugger)

| Action | How |
|--------|-----|
| Set breakpoint | Click line number |
| Conditional breakpoint | Right-click line → Add conditional |
| Logpoint | Right-click → Add logpoint (logs without pausing) |
| DOM breakpoint | Elements → Right-click → Break on |
| XHR breakpoint | Sources → XHR/fetch Breakpoints |
| Event listener breakpoint | Sources → Event Listener Breakpoints |

**Stepping controls**:
- `F8` / `Cmd+\` - Resume/Pause
- `F10` / `Cmd+'` - Step over
- `F11` / `Cmd+;` - Step into
- `Shift+F11` - Step out
- `Cmd+Shift+;` - Step into async

#### Async Call Stack

Enable "Async" in Call Stack panel to trace through:
- `setTimeout`/`setInterval`
- Promises/async-await
- Event handlers
- `requestAnimationFrame`

### Memory Analysis

```
Memory Panel:
1. Take heap snapshot
2. Perform action suspected of leaking
3. Take another snapshot
4. Compare snapshots - look for growing object counts

Common leaks:
- Event listeners not removed
- Closures holding references
- Detached DOM nodes
- Global variables
```

### Performance Panel

```
1. Click Record
2. Perform the slow action
3. Stop recording
4. Analyze:
   - Main thread activity
   - Long tasks (>50ms)
   - Layout thrashing
   - JavaScript execution time
```

---

## React Debugging

### React Developer Tools

**Components Tab**:
- Inspect component hierarchy
- View/edit props and state
- Search components by name
- Filter components

**Profiler Tab**:
- Record rendering activity
- Identify slow components
- See why component re-rendered
- Flamegraph view of render times

### Common React Issues

#### Infinite Re-renders

```jsx
// Bug: Infinite loop
useEffect(() => {
  setData(fetchData()); // setData triggers re-render, re-runs effect
});

// Fix: Add dependency array
useEffect(() => {
  setData(fetchData());
}, []); // Run once on mount
```

**Debugging**: Add console.log in component body to count renders.

#### Stale Closures

```jsx
// Bug: count is always 0
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // Captures initial count (0)
    }, 1000);
    return () => clearInterval(id);
  }, []);

// Fix: Use functional update
  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1); // Always uses current value
    }, 1000);
    return () => clearInterval(id);
  }, []);
}
```

#### Missing Keys

```jsx
// Bug: React can't track items
{items.map(item => <Item {...item} />)}

// Fix: Add stable key
{items.map(item => <Item key={item.id} {...item} />)}
```

**Symptom**: State gets mixed up between items, animations break.

### Why Did You Render

Tool to identify unnecessary re-renders:

```javascript
// Setup
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, { trackAllPureComponents: true });
}

// Mark component for tracking
MyComponent.whyDidYouRender = true;
```

---

## Vue Debugging

### Vue DevTools

- **Components**: Inspect component tree, props, data, computed
- **Vuex/Pinia**: Time-travel debugging for state
- **Events**: Track emitted events
- **Performance**: Component render timing

### Common Vue Issues

#### Reactivity Gotchas (Vue 2)

```javascript
// Bug: New property not reactive
this.obj.newProp = 'value';

// Fix: Use Vue.set
Vue.set(this.obj, 'newProp', 'value');

// Bug: Array index assignment not reactive
this.arr[0] = 'new value';

// Fix: Use splice or Vue.set
this.arr.splice(0, 1, 'new value');
```

#### Computed vs Watch

```javascript
// Use computed for derived state
computed: {
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

// Use watch for side effects
watch: {
  searchQuery(newVal) {
    this.debouncedSearch(newVal);
  }
}
```

---

## Angular Debugging

### Augury (Angular DevTools)

- Component tree inspection
- Router state visualization
- Dependency injection graph
- NgModule structure

### Common Angular Issues

#### Change Detection

```typescript
// Bug: View not updating
// Angular uses zone.js to detect changes, but misses some async

// Fix 1: Trigger manually
constructor(private cdr: ChangeDetectorRef) {}
this.cdr.detectChanges();

// Fix 2: Run in zone
constructor(private zone: NgZone) {}
this.zone.run(() => { /* async operation */ });
```

#### Memory Leaks in Subscriptions

```typescript
// Bug: Subscription not cleaned up
ngOnInit() {
  this.data$.subscribe(data => this.data = data);
}

// Fix: Unsubscribe on destroy
private destroy$ = new Subject();

ngOnInit() {
  this.data$.pipe(
    takeUntil(this.destroy$)
  ).subscribe(data => this.data = data);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## Common Frontend Issues

### Layout Thrashing

```javascript
// Bug: Forces multiple reflows
elements.forEach(el => {
  el.style.width = el.offsetWidth + 10 + 'px'; // Read then write in loop
});

// Fix: Batch reads, then batch writes
const widths = elements.map(el => el.offsetWidth);
elements.forEach((el, i) => {
  el.style.width = widths[i] + 10 + 'px';
});
```

### Event Handler Leaks

```javascript
// Bug: Handler not removed
window.addEventListener('resize', this.handleResize);

// Fix: Remove on cleanup
componentWillUnmount() {
  window.removeEventListener('resize', this.handleResize);
}
```

### CORS Errors

```
Access to fetch at 'X' from origin 'Y' has been blocked by CORS policy
```

**Debugging**:
1. Check browser Network tab for actual response
2. Verify server CORS headers: `Access-Control-Allow-Origin`
3. Check if preflight OPTIONS request succeeds
4. Verify credentials mode matches server config

### Race Conditions

```javascript
// Bug: Old response overwrites new
async function search(query) {
  const results = await api.search(query);
  setResults(results); // Might be stale if newer request finished first
}

// Fix: Track request identity
let currentRequest = 0;
async function search(query) {
  const thisRequest = ++currentRequest;
  const results = await api.search(query);
  if (thisRequest === currentRequest) {
    setResults(results);
  }
}
```

---

## Network Debugging

### DevTools Network Panel

| Column | What to check |
|--------|---------------|
| Status | 4xx/5xx errors |
| Time | Slow requests |
| Size | Large payloads |
| Initiator | What triggered request |
| Waterfall | Timing breakdown |

### Request Timing Breakdown

```
Queueing     → Browser waiting to send (connection limit?)
Stalled      → Request waiting (proxy negotiation?)
DNS Lookup   → DNS resolution
Initial conn → TCP handshake
SSL          → TLS negotiation
Request sent → Uploading request
Waiting      → Server processing (TTFB)
Content DL   → Downloading response
```

### Debugging API Calls

```javascript
// Intercept and log all fetches
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('[FETCH]', args);
  const response = await originalFetch(...args);
  console.log('[RESPONSE]', response.status, response.url);
  return response;
};
```

### Service Worker Issues

```
Application Tab → Service Workers
- Check registration status
- Try "Update on reload"
- Try "Bypass for network" to exclude SW
```
