# Function Design Examples

## Small Functions

### Target: Under 20 Lines

```typescript
// Bad: Long function with multiple responsibilities (50+ lines)
function processOrder(order: Order, user: User) {
  // Validate order
  if (!order.items || order.items.length === 0) {
    throw new Error("Order must have items");
  }
  for (const item of order.items) {
    if (!item.productId) throw new Error("Item missing product");
    if (item.quantity <= 0) throw new Error("Invalid quantity");
    // ... more validation
  }

  // Check inventory
  for (const item of order.items) {
    const stock = getStock(item.productId);
    if (stock < item.quantity) {
      throw new Error("Insufficient stock");
    }
  }

  // Calculate totals
  let subtotal = 0;
  for (const item of order.items) {
    const product = getProduct(item.productId);
    subtotal += product.price * item.quantity;
  }
  const tax = subtotal * 0.1;
  const shipping = calculateShipping(order.address);
  const total = subtotal + tax + shipping;

  // Apply discount
  let discount = 0;
  if (user.membershipLevel === "gold") {
    discount = total * 0.1;
  } else if (user.membershipLevel === "silver") {
    discount = total * 0.05;
  }

  // ... more code for payment, notification, etc.
}

// Good: Small, focused functions
function processOrder(order: Order, user: User): ProcessedOrder {
  validateOrder(order);
  checkInventory(order.items);

  const pricing = calculatePricing(order, user);
  const payment = processPayment(pricing.total);

  return createProcessedOrder(order, pricing, payment);
}

function validateOrder(order: Order): void {
  if (!order.items?.length) {
    throw new ValidationError("Order must have items");
  }
  order.items.forEach(validateOrderItem);
}

function validateOrderItem(item: OrderItem): void {
  if (!item.productId) {
    throw new ValidationError("Item missing product ID");
  }
  if (item.quantity <= 0) {
    throw new ValidationError("Quantity must be positive");
  }
}

function calculatePricing(order: Order, user: User): Pricing {
  const subtotal = calculateSubtotal(order.items);
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(order.address);
  const discount = calculateDiscount(user, subtotal + tax + shipping);

  return {
    subtotal,
    tax,
    shipping,
    discount,
    total: subtotal + tax + shipping - discount,
  };
}
```

## Parameter Guidelines

### 0-3 Parameters Ideal

```typescript
// Bad: Too many parameters (hard to remember order)
function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string,
  address: string,
  city: string,
  country: string,
  zipCode: string,
  role: string,
  isActive: boolean
) {}

// Good: Object parameter
interface CreateUserInput {
  email: string;
  password: string;
  name: {
    first: string;
    last: string;
  };
  contact?: {
    phone?: string;
    address?: Address;
  };
  role?: UserRole;
}

function createUser(input: CreateUserInput): User {
  const { email, password, name, contact, role = "user" } = input;
  // ...
}

// Usage: Clear and self-documenting
createUser({
  email: "alice@example.com",
  password: "securepassword",
  name: { first: "Alice", last: "Smith" },
  role: "admin",
});
```

### Destructuring for Clarity

```typescript
// Good: Destructure in function signature
function formatName({ first, last, middle }: Name): string {
  return middle ? `${first} ${middle} ${last}` : `${first} ${last}`;
}

// Good: Destructure with defaults
function fetchData({
  url,
  method = "GET",
  headers = {},
  timeout = 5000,
}: FetchOptions): Promise<Response> {
  // ...
}
```

## Early Returns

### Reduce Nesting

```typescript
// Bad: Deeply nested
function processUser(user: User | null): string {
  if (user) {
    if (user.isActive) {
      if (user.email) {
        if (isValidEmail(user.email)) {
          return `Welcome, ${user.name}!`;
        } else {
          return "Invalid email";
        }
      } else {
        return "Email required";
      }
    } else {
      return "User inactive";
    }
  } else {
    return "No user";
  }
}

// Good: Early returns
function processUser(user: User | null): string {
  if (!user) {
    return "No user";
  }

  if (!user.isActive) {
    return "User inactive";
  }

  if (!user.email) {
    return "Email required";
  }

  if (!isValidEmail(user.email)) {
    return "Invalid email";
  }

  return `Welcome, ${user.name}!`;
}
```

### Guard Clauses

```typescript
// Pattern: Handle edge cases first, then happy path
function divide(a: number, b: number): number {
  // Guards
  if (b === 0) {
    throw new Error("Division by zero");
  }

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error("Arguments must be finite numbers");
  }

  // Happy path
  return a / b;
}
```

## Pure Functions

### Prefer Pure When Possible

```typescript
// Impure: Modifies external state
let total = 0;
function addToTotal(amount: number): void {
  total += amount; // Side effect
}

// Pure: No side effects, deterministic
function add(a: number, b: number): number {
  return a + b;
}

// Impure: Depends on external state
function getCurrentGreeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : "Good afternoon";
}

// Pure: Explicit dependency
function getGreeting(hour: number): string {
  return hour < 12 ? "Good morning" : "Good afternoon";
}
```

### Isolate Side Effects

```typescript
// Bad: Side effects mixed with logic
function processAndSave(data: Data): void {
  const validated = validate(data);
  const transformed = transform(validated);
  database.save(transformed); // Side effect
  sendNotification(transformed); // Side effect
}

// Good: Separate pure logic from effects
function process(data: Data): ProcessedData {
  const validated = validate(data);
  return transform(validated);
}

// Effects isolated at boundary
async function handleRequest(data: Data): Promise<void> {
  const processed = process(data); // Pure
  await database.save(processed); // Effect
  await sendNotification(processed); // Effect
}
```

## Command-Query Separation

### Commands Do, Queries Ask

```typescript
// Bad: Does both (confusing)
function getAndIncrementCounter(): number {
  counter++;
  return counter;
}

// Good: Separate commands and queries
function getCounter(): number {
  return counter;
}

function incrementCounter(): void {
  counter++;
}

// Exception: Stack operations (pop), but document clearly
function pop<T>(stack: T[]): T | undefined {
  return stack.pop();
}
```

## Method Chaining

### Builder Pattern

```typescript
class QueryBuilder {
  private query: QueryParts = { table: "", conditions: [], limit: undefined };

  from(table: string): this {
    this.query.table = table;
    return this;
  }

  where(condition: string): this {
    this.query.conditions.push(condition);
    return this;
  }

  limit(count: number): this {
    this.query.limit = count;
    return this;
  }

  build(): string {
    const { table, conditions, limit } = this.query;
    let sql = `SELECT * FROM ${table}`;

    if (conditions.length) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    if (limit) {
      sql += ` LIMIT ${limit}`;
    }

    return sql;
  }
}

// Usage
const query = new QueryBuilder()
  .from("users")
  .where("active = true")
  .where("age > 18")
  .limit(10)
  .build();
```

## Summary Checklist

- [ ] Function is under 20 lines
- [ ] 0-3 parameters (use object if more)
- [ ] Single responsibility
- [ ] Descriptive name (verb + noun)
- [ ] Early returns for edge cases
- [ ] Minimal nesting (max 2 levels)
- [ ] Pure when possible
- [ ] Side effects isolated and explicit
