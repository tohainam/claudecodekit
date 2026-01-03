# Clean Code Principles

## Core Principles

### SOLID

#### Single Responsibility Principle (SRP)

> A class should have only one reason to change.

**Violation Signs**:

- Class name includes "And" or "Manager"
- Multiple unrelated methods
- Changes for different reasons

```typescript
// Bad: Multiple responsibilities
class UserManager {
  validateEmail(email: string) {}
  hashPassword(password: string) {}
  sendWelcomeEmail(user: User) {}
  saveToDatabase(user: User) {}
}

// Good: Single responsibility each
class EmailValidator {
  validate(email: string) {}
}
class PasswordHasher {
  hash(password: string) {}
}
class UserRepository {
  save(user: User) {}
}
class WelcomeEmailSender {
  send(user: User) {}
}
```

#### Open/Closed Principle (OCP)

> Open for extension, closed for modification.

```typescript
// Bad: Modify for each new type
function calculateArea(shape) {
  switch (shape.type) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    // Add new case for each shape...
  }
}

// Good: Extend via new classes
interface Shape {
  area(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}
  area() {
    return Math.PI * this.radius ** 2;
  }
}
```

#### Liskov Substitution Principle (LSP)

> Subtypes must be substitutable for their base types.

```typescript
// Bad: Square breaks Rectangle contract
class Rectangle {
  setWidth(w: number) {
    this.width = w;
  }
  setHeight(h: number) {
    this.height = h;
  }
}

class Square extends Rectangle {
  setWidth(w: number) {
    this.width = this.height = w;
  } // Breaks expectations
}

// Good: Don't inherit if contract differs
interface Shape {
  area(): number;
}
```

#### Interface Segregation Principle (ISP)

> Clients shouldn't depend on interfaces they don't use.

```typescript
// Bad: Fat interface
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
}

// Robot can't eat or sleep!
class Robot implements Worker {
  /* forced to implement unused methods */
}

// Good: Segregated interfaces
interface Workable {
  work(): void;
}
interface Feedable {
  eat(): void;
}
interface Sleepable {
  sleep(): void;
}

class Robot implements Workable {
  work() {}
}
class Human implements Workable, Feedable, Sleepable {
  /* ... */
}
```

#### Dependency Inversion Principle (DIP)

> Depend on abstractions, not concretions.

```typescript
// Bad: Direct dependency
class OrderService {
  private db = new MySQLDatabase(); // Tightly coupled

  save(order: Order) {
    this.db.insert("orders", order);
  }
}

// Good: Depend on abstraction
interface OrderRepository {
  save(order: Order): void;
}

class OrderService {
  constructor(private repo: OrderRepository) {} // Injected

  save(order: Order) {
    this.repo.save(order);
  }
}
```

### YAGNI (You Aren't Gonna Need It)

> Don't add functionality until it's needed.

**Signs of YAGNI Violation**:

- "We might need this later"
- Unused parameters or config options
- Abstract classes with one implementation
- Feature flags for features not built yet

```typescript
// Bad: Over-engineered for hypothetical needs
class UserService {
  constructor(
    private cache?: CacheProvider,
    private metrics?: MetricsProvider,
    private featureFlags?: FeatureFlagProvider
  ) {}
}

// Good: Only what's needed now
class UserService {
  constructor(private repo: UserRepository) {}
}
```

### DRY (Don't Repeat Yourself)

> Every piece of knowledge should have a single representation.

**But**: Don't DRY too early. Rule of Three:

1. First time: Just write it
2. Second time: Note the duplication
3. Third time: Refactor

```typescript
// Premature DRY (bad)
// Creating abstraction after first duplication

// Good DRY: Extract after third occurrence
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
```

### KISS (Keep It Simple, Stupid)

> Simpler is better. Complexity is the enemy.

```typescript
// Overcomplicated
const isEven = (n: number): boolean => ((n & 1) === 0 ? true : false);

// Simple
const isEven = (n: number): boolean => n % 2 === 0;
```

## Code Smells

### Function Smells

| Smell               | Sign             | Fix                      |
| ------------------- | ---------------- | ------------------------ |
| Long function       | > 20 lines       | Extract methods          |
| Too many parameters | > 3 params       | Use object parameter     |
| Flag arguments      | `doThing(true)`  | Split into two functions |
| Dead code           | Unreachable code | Delete it                |

### Class Smells

| Smell                  | Sign                        | Fix                    |
| ---------------------- | --------------------------- | ---------------------- |
| God class              | Does everything             | Split responsibilities |
| Data class             | Only getters/setters        | Move behavior to class |
| Feature envy           | Uses other class's data     | Move method            |
| Inappropriate intimacy | Knows too much about others | Introduce interface    |

### Architecture Smells

| Smell                 | Sign                    | Fix                  |
| --------------------- | ----------------------- | -------------------- |
| Circular dependencies | A → B → C → A           | Dependency injection |
| Shotgun surgery       | One change = many files | Group related code   |
| Divergent change      | One class, many reasons | Split class          |

## Readability Guidelines

### Naming

```typescript
// Variables: noun, describes content
const userCount = users.length;
const isValid = validateEmail(email);

// Functions: verb, describes action
function calculateTotal(items) {}
function sendNotification(user) {}

// Classes: noun, describes entity
class OrderProcessor {}
class EmailValidator {}

// Booleans: is/has/can/should prefix
const isActive = true;
const hasPermission = checkPermission(user);
```

### Comments

```typescript
// Bad: Explains what (code should be clear)
// Increment i by 1
i++;

// Good: Explains why (non-obvious reason)
// Offset by 1 because API uses 1-based indexing
const apiPage = page + 1;

// Good: Documents gotcha
// HACK: setTimeout needed due to race condition in library v2.3
// TODO: Remove when upgrading to v3.0
setTimeout(init, 0);
```

### Formatting

```typescript
// Consistent indentation (2 or 4 spaces)
// Blank lines between logical sections
// Line length < 100 characters
// One statement per line

function processOrder(order: Order): Result {
  // Validation section
  const validationResult = validate(order);
  if (!validationResult.ok) {
    return validationResult;
  }

  // Processing section
  const processed = transform(order);

  // Persistence section
  return save(processed);
}
```
