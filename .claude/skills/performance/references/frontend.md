# Frontend Performance Optimization

## Table of Contents
1. [Core Web Vitals](#core-web-vitals)
2. [React Optimization](#react-optimization)
3. [Vue Optimization](#vue-optimization)
4. [Angular Optimization](#angular-optimization)
5. [Bundle Optimization](#bundle-optimization)
6. [Image Optimization](#image-optimization)
7. [CSS Optimization](#css-optimization)
8. [Font Optimization](#font-optimization)

---

## Core Web Vitals

### Current Metrics (2025)

| Metric | What It Measures | Good | Needs Improvement | Poor |
|--------|------------------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | Loading performance | ≤ 2.5s | 2.5s - 4s | > 4s |
| **INP** (Interaction to Next Paint) | Responsiveness | ≤ 200ms | 200ms - 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | Visual stability | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

> **Note**: INP replaced FID (First Input Delay) in March 2024 as the official responsiveness metric.

### LCP Optimization

**Common LCP Elements**: Images (73% of mobile pages), videos, large text blocks.

```html
<!-- Preload critical images -->
<link rel="preload" as="image" href="hero.webp" fetchpriority="high">

<!-- Use fetchpriority for LCP images -->
<img src="hero.webp" fetchpriority="high" alt="Hero">

<!-- Avoid data-src patterns (requires JS) -->
<!-- Bad -->
<img data-src="hero.webp" class="lazy">
<!-- Good -->
<img src="hero.webp" loading="eager" fetchpriority="high">
```

**LCP Optimization Checklist**:
- [ ] Use `fetchpriority="high"` on LCP image
- [ ] Preload LCP image with `<link rel="preload">`
- [ ] Avoid lazy loading above-the-fold content
- [ ] Use modern formats (WebP, AVIF)
- [ ] Serve appropriately sized images
- [ ] Use CDN for static assets
- [ ] Minimize render-blocking resources

### INP Optimization

INP measures responsiveness across the ENTIRE page lifecycle, not just first interaction.

```javascript
// Bad: Long task blocking main thread
button.addEventListener('click', () => {
  // Heavy computation blocks interaction
  processLargeDataset(data);
  updateUI();
});

// Good: Break up long tasks
button.addEventListener('click', async () => {
  // Show immediate feedback
  showSpinner();

  // Defer heavy work
  await scheduler.yield(); // or setTimeout
  await processLargeDatasetAsync(data);

  updateUI();
});

// Good: Use Web Workers for heavy computation
const worker = new Worker('processor.js');
button.addEventListener('click', () => {
  worker.postMessage(data);
});
worker.onmessage = (e) => updateUI(e.data);
```

**INP Optimization Checklist**:
- [ ] Break up long tasks (> 50ms)
- [ ] Use `requestIdleCallback` for non-critical work
- [ ] Debounce/throttle frequent event handlers
- [ ] Use CSS transforms instead of layout-triggering properties
- [ ] Avoid forced synchronous layouts
- [ ] Use `content-visibility: auto` for off-screen content

### CLS Optimization

```html
<!-- Always set dimensions -->
<img src="photo.jpg" width="800" height="600" alt="Photo">

<!-- Reserve space for dynamic content -->
<div style="min-height: 250px;">
  <!-- Ad or dynamic content -->
</div>

<!-- Use aspect-ratio for responsive images -->
<style>
.hero-image {
  aspect-ratio: 16 / 9;
  width: 100%;
  object-fit: cover;
}
</style>
```

**CLS Optimization Checklist**:
- [ ] Set width/height on all images and videos
- [ ] Use `aspect-ratio` CSS property
- [ ] Reserve space for ads/embeds
- [ ] Preload web fonts with `font-display: optional`
- [ ] Avoid inserting content above existing content
- [ ] Use CSS `transform` for animations

---

## React Optimization

### React 19+ Features

```javascript
// React Compiler (auto-memoization)
// Previously needed useMemo/useCallback manually
// Now handled automatically by React Compiler

// Before (manual)
const MemoizedComponent = React.memo(({ data }) => {
  const processed = useMemo(() => expensiveCalc(data), [data]);
  return <div>{processed}</div>;
});

// After (React Compiler handles this)
function Component({ data }) {
  const processed = expensiveCalc(data);
  return <div>{processed}</div>;
}
```

### Memoization (When React Compiler Not Available)

```javascript
// Memoize expensive components
const ExpensiveList = React.memo(({ items }) => (
  <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>
));

// Memoize expensive calculations
function DataGrid({ data, filters }) {
  const filteredData = useMemo(
    () => data.filter(item => applyFilters(item, filters)),
    [data, filters]
  );
  return <Grid data={filteredData} />;
}

// Memoize callbacks
function Parent() {
  const handleClick = useCallback((id) => {
    // handle click
  }, []);
  return <Child onClick={handleClick} />;
}
```

### List Virtualization

```javascript
// react-window for large lists
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  );

  return (
    <FixedSizeList
      height={600}
      width="100%"
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </FixedSizeList>
  );
}
```

### Code Splitting

```javascript
// Route-based splitting
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// Component-based splitting
const HeavyChart = lazy(() => import('./HeavyChart'));

function Report({ showChart }) {
  return (
    <div>
      <Summary />
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
}
```

### Context Optimization

```javascript
// Bad: Single context with frequently changing values
const AppContext = createContext({ user, theme, cart, notifications });

// Good: Split contexts by update frequency
const UserContext = createContext(null);      // Rarely changes
const ThemeContext = createContext('light');  // Rarely changes
const CartContext = createContext([]);        // Changes often
const NotificationContext = createContext([]); // Changes often

// Good: Memoize context value
function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const value = useMemo(() => ({
    items,
    addItem: (item) => setItems(prev => [...prev, item]),
    removeItem: (id) => setItems(prev => prev.filter(i => i.id !== id)),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
```

### React 18+ Concurrent Features

```javascript
// useTransition for non-urgent updates
function SearchResults({ query }) {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);

  function handleSearch(newQuery) {
    // Urgent: Update input immediately
    setQuery(newQuery);

    // Non-urgent: Defer results update
    startTransition(() => {
      setResults(searchDatabase(newQuery));
    });
  }

  return (
    <>
      <input onChange={e => handleSearch(e.target.value)} />
      {isPending ? <Spinner /> : <ResultsList results={results} />}
    </>
  );
}

// useDeferredValue for expensive renders
function ProductList({ filter }) {
  const deferredFilter = useDeferredValue(filter);
  const isStale = filter !== deferredFilter;

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      <ExpensiveProductGrid filter={deferredFilter} />
    </div>
  );
}
```

---

## Vue Optimization

### Vue 3 Optimizations

```javascript
// Use shallowRef for large objects that replace entirely
import { shallowRef } from 'vue';
const largeList = shallowRef([]);

// Replace entire array (triggers update)
largeList.value = newLargeList;

// Use computed for derived state
const filteredItems = computed(() =>
  items.value.filter(item => item.active)
);

// Use v-once for static content
<template>
  <header v-once>
    <h1>{{ title }}</h1>
    <nav><!-- static nav --></nav>
  </header>
</template>

// Use v-memo for conditional memoization
<template>
  <div v-for="item in items" :key="item.id" v-memo="[item.selected]">
    <ExpensiveComponent :item="item" />
  </div>
</template>
```

### Virtual Scrolling (Vue)

```javascript
// Using vue-virtual-scroller
<template>
  <RecycleScroller
    :items="items"
    :item-size="50"
    key-field="id"
    v-slot="{ item }"
  >
    <ItemComponent :item="item" />
  </RecycleScroller>
</template>
```

---

## Angular Optimization

### Change Detection

```typescript
// Use OnPush change detection
@Component({
  selector: 'app-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>{{ item.name }}</div>`
})
export class ItemComponent {
  @Input() item: Item;
}

// Use trackBy for ngFor
@Component({
  template: `
    <div *ngFor="let item of items; trackBy: trackById">
      {{ item.name }}
    </div>
  `
})
export class ListComponent {
  trackById(index: number, item: Item): number {
    return item.id;
  }
}

// Detach change detection for static components
constructor(private cd: ChangeDetectorRef) {
  this.cd.detach();
}
```

### Lazy Loading Routes

```typescript
const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module')
      .then(m => m.DashboardModule)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component')
      .then(m => m.SettingsComponent)
  }
];
```

---

## Bundle Optimization

### Code Splitting Strategies

```javascript
// Webpack dynamic imports
const Chart = () => import(/* webpackChunkName: "chart" */ './Chart');

// Vite/Rollup manual chunks
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['d3', 'recharts'],
        }
      }
    }
  }
}
```

### Tree Shaking

```javascript
// Bad: Import entire library
import _ from 'lodash';
_.debounce(fn, 300);

// Good: Import only what you need
import debounce from 'lodash/debounce';
debounce(fn, 300);

// Good: Use lodash-es for better tree shaking
import { debounce } from 'lodash-es';
```

### Bundle Analysis

```bash
# Webpack
npx webpack-bundle-analyzer stats.json

# Vite
npx vite-bundle-visualizer

# Next.js
ANALYZE=true npm run build
```

---

## Image Optimization

### Modern Formats

```html
<!-- Use picture element for format fallback -->
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero" width="1200" height="800">
</picture>

<!-- Responsive images -->
<img
  srcset="hero-400.webp 400w,
          hero-800.webp 800w,
          hero-1200.webp 1200w"
  sizes="(max-width: 600px) 400px,
         (max-width: 1000px) 800px,
         1200px"
  src="hero-800.webp"
  alt="Hero"
>
```

### Lazy Loading

```html
<!-- Native lazy loading -->
<img src="photo.jpg" loading="lazy" alt="Photo">

<!-- Intersection Observer for custom lazy loading -->
<script>
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});
document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
</script>
```

---

## CSS Optimization

### Critical CSS

```html
<!-- Inline critical CSS -->
<head>
  <style>
    /* Critical above-the-fold styles */
    .header { ... }
    .hero { ... }
  </style>
  <!-- Defer non-critical CSS -->
  <link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
</head>
```

### Reduce Layout Thrashing

```javascript
// Bad: Forced synchronous layout
elements.forEach(el => {
  const height = el.offsetHeight; // Read
  el.style.height = height + 10 + 'px'; // Write
});

// Good: Batch reads and writes
const heights = elements.map(el => el.offsetHeight); // All reads
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px'; // All writes
});
```

### CSS Containment

```css
/* Isolate component from rest of page */
.widget {
  contain: layout style paint;
}

/* Auto-skip rendering off-screen content */
.card {
  content-visibility: auto;
  contain-intrinsic-size: 0 200px;
}
```

---

## Font Optimization

```html
<!-- Preload critical fonts -->
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>

<style>
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap; /* or optional for better CLS */
  unicode-range: U+0000-00FF; /* Subset to Latin characters */
}
</style>
```

**Font Loading Strategies**:
- `font-display: swap` - Show fallback immediately, swap when loaded (may cause CLS)
- `font-display: optional` - Only use if already cached (best for CLS)
- `font-display: fallback` - Short swap period, then fallback
