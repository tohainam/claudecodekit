# Frontend Architecture

Component design patterns and architecture for frontend applications.

## Table of Contents
1. [Component Architecture](#component-architecture)
2. [State Management Patterns](#state-management-patterns)
3. [Frontend Architecture Patterns](#frontend-architecture-patterns)
4. [Performance Patterns](#performance-patterns)
5. [Testing Strategies](#testing-strategies)

---

## Component Architecture

### Atomic Design

Hierarchical component organization from smallest to largest:

```
┌─────────────────────────────────────────────────────────────────┐
│ PAGES                                                           │
│   Complete screens with real data                               │
│   Example: HomePage, ProductPage, CheckoutPage                  │
├─────────────────────────────────────────────────────────────────┤
│ TEMPLATES                                                       │
│   Page-level layouts without data                               │
│   Example: MainLayout, AuthLayout, DashboardLayout              │
├─────────────────────────────────────────────────────────────────┤
│ ORGANISMS                                                       │
│   Complex UI sections                                           │
│   Example: Header, ProductCard, ShoppingCart, CommentSection    │
├─────────────────────────────────────────────────────────────────┤
│ MOLECULES                                                       │
│   Simple component combinations                                 │
│   Example: SearchInput, FormField, NavLink, MediaObject         │
├─────────────────────────────────────────────────────────────────┤
│ ATOMS                                                           │
│   Basic building blocks                                         │
│   Example: Button, Input, Label, Icon, Avatar                   │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure (Atomic)

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.styles.ts
│   │   │   └── index.ts
│   │   ├── Input/
│   │   └── Icon/
│   ├── molecules/
│   │   ├── SearchInput/
│   │   └── FormField/
│   ├── organisms/
│   │   ├── Header/
│   │   └── ProductCard/
│   └── templates/
│       ├── MainLayout/
│       └── AuthLayout/
└── pages/
    ├── Home/
    └── Product/
```

---

### Container/Presenter Pattern

Separate logic from presentation:

```typescript
// Container (Smart Component) - handles logic
function ProductListContainer() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (productId: string) => {
    cartService.add(productId);
  };

  return (
    <ProductList
      products={products}
      loading={loading}
      onAddToCart={handleAddToCart}
    />
  );
}

// Presenter (Dumb Component) - handles display
function ProductList({ products, loading, onAddToCart }) {
  if (loading) return <Spinner />;

  return (
    <ul>
      {products.map(product => (
        <ProductItem
          key={product.id}
          product={product}
          onAddToCart={() => onAddToCart(product.id)}
        />
      ))}
    </ul>
  );
}
```

---

### Compound Components

Components that work together sharing implicit state:

```typescript
// Usage
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
    <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
</Tabs>

// Implementation
const TabsContext = createContext();

function Tabs({ children, defaultValue }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.Tab = function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      className={activeTab === value ? 'active' : ''}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function Panel({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  return activeTab === value ? <div>{children}</div> : null;
};
```

---

## State Management Patterns

### State Types & Solutions

| State Type | Scope | Solution |
|------------|-------|----------|
| **Local UI** | Single component | useState, useReducer |
| **Shared UI** | Component tree | Context, Props drilling |
| **Server** | Cached API data | React Query, SWR, RTK Query |
| **Global App** | Entire app | Redux, Zustand, Jotai |
| **URL** | Route/query params | React Router, Next.js |
| **Form** | Form state | React Hook Form, Formik |

### State Colocation

Keep state as close to where it's used:

```
┌─────────────────────────────────────────────────────────────────┐
│                          App                                     │
│  Global state: user auth, theme, feature flags                  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Page/Route                              │  │
│  │  Route state: URL params, page-level data                 │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │                Feature Section                      │   │  │
│  │  │  Feature state: form data, filters, selections     │   │  │
│  │  │                                                     │   │  │
│  │  │  ┌─────────────────────────────────────────────┐   │   │  │
│  │  │  │              Component                       │   │   │  │
│  │  │  │  Local state: open/closed, hover, input     │   │   │  │
│  │  │  └─────────────────────────────────────────────┘   │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Server State Pattern

```typescript
// React Query example
function ProductList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <ul>
      {data.map(product => <ProductItem key={product.id} {...product} />)}
    </ul>
  );
}
```

---

## Frontend Architecture Patterns

### Feature-Sliced Design (FSD)

Modern approach for scalable frontend architecture:

```
src/
├── app/                    # Application initialization
│   ├── providers/          # Global providers
│   ├── styles/             # Global styles
│   └── index.tsx           # Entry point
├── pages/                  # Route components
│   ├── home/
│   ├── product/
│   └── checkout/
├── widgets/                # Composite UI blocks
│   ├── header/
│   ├── product-list/
│   └── shopping-cart/
├── features/               # User interactions
│   ├── auth/
│   ├── add-to-cart/
│   └── search-products/
├── entities/               # Business entities
│   ├── user/
│   ├── product/
│   └── order/
└── shared/                 # Reusable utilities
    ├── ui/                 # UI components
    ├── lib/                # Utilities
    ├── api/                # API client
    └── config/             # Configuration
```

**FSD Rules:**
1. Each layer can only import from layers below it
2. No cross-imports within the same layer
3. Public API through index.ts

### Micro-Frontends

Independent frontend applications composed together:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Shell Application                         │
│  (Routing, Authentication, Shared Layout)                       │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Catalog MFE   │   Cart MFE      │   Checkout MFE              │
│   (Team A)      │   (Team B)      │   (Team C)                  │
│   React         │   Vue           │   React                      │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

**Integration Methods:**
- **Build-time**: Compile as packages
- **Server-side**: Compose HTML on server
- **Runtime**: Module Federation, iframes

---

## Performance Patterns

### Code Splitting

```typescript
// Route-based splitting
const ProductPage = lazy(() => import('./pages/Product'));
const CheckoutPage = lazy(() => import('./pages/Checkout'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </Suspense>
  );
}

// Component-based splitting
const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Dashboard({ showChart }) {
  return (
    <div>
      <Stats />
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
}
```

### Memoization Patterns

```typescript
// Memoize expensive calculations
const sortedProducts = useMemo(
  () => products.sort((a, b) => a.price - b.price),
  [products]
);

// Memoize callbacks
const handleClick = useCallback(
  () => onSelect(item.id),
  [item.id, onSelect]
);

// Memoize components
const ProductCard = memo(function ProductCard({ product, onAddToCart }) {
  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={() => onAddToCart(product.id)}>Add</button>
    </div>
  );
});
```

### Virtual Scrolling

For large lists:
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef();

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Testing Strategies

### Testing Pyramid (Frontend)

```
                    ┌─────────────┐
                    │    E2E      │  ← Few, slow, expensive
                    │  (Cypress)  │
                  ┌─┴─────────────┴─┐
                  │  Integration     │  ← Some
                  │ (Testing Lib)   │
                ┌─┴─────────────────┴─┐
                │      Unit Tests      │  ← Many, fast, cheap
                │  (Jest, Vitest)     │
                └─────────────────────┘
```

### Component Testing

```typescript
// Test behavior, not implementation
describe('ProductCard', () => {
  it('displays product information', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Product Name')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when button clicked', async () => {
    const onAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);

    await userEvent.click(screen.getByRole('button', { name: /add to cart/i }));

    expect(onAddToCart).toHaveBeenCalledWith(mockProduct.id);
  });

  it('shows loading state while adding', async () => {
    render(<ProductCard product={mockProduct} adding={true} />);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/adding/i)).toBeInTheDocument();
  });
});
```

### Integration Testing

```typescript
// Test feature flows
describe('Shopping Cart', () => {
  it('allows adding and removing products', async () => {
    render(<App />);

    // Add product
    await userEvent.click(screen.getByText('Add to Cart'));
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');

    // Open cart
    await userEvent.click(screen.getByLabelText('Open cart'));
    expect(screen.getByText('Product Name')).toBeInTheDocument();

    // Remove product
    await userEvent.click(screen.getByLabelText('Remove item'));
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
  });
});
```
