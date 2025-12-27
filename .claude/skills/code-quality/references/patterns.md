# Clean Code Patterns

Patterns and anti-patterns for writing maintainable, readable code.

## SOLID Principles

### Single Responsibility (SRP)
```
One reason to change per module/class.

BAD:
class UserService {
  createUser() {}
  sendEmail() {}      // Email responsibility
  generatePDF() {}    // Report responsibility
  validateInput() {}  // Validation responsibility
}

GOOD:
class UserService { createUser() {} }
class EmailService { sendEmail() {} }
class ReportGenerator { generatePDF() {} }
class UserValidator { validate() {} }
```

### Open/Closed (OCP)
```
Open for extension, closed for modification.

BAD: Adding new payment type requires modifying existing code
function processPayment(type) {
  if (type === 'card') { ... }
  else if (type === 'paypal') { ... }
  // Must modify to add new type
}

GOOD: Add new payment types via new classes
interface PaymentProcessor { process(): void }
class CardPayment implements PaymentProcessor { process() {} }
class PayPalPayment implements PaymentProcessor { process() {} }
class CryptoPayment implements PaymentProcessor { process() {} } // Just add new class
```

### Liskov Substitution (LSP)
```
Subtypes must be substitutable for base types.

BAD: Square violates Rectangle contract
class Rectangle { setWidth(w) {} setHeight(h) {} }
class Square extends Rectangle {
  setWidth(w) { this.width = this.height = w; } // Breaks expectation
}

GOOD: Separate abstractions
interface Shape { getArea(): number }
class Rectangle implements Shape { ... }
class Square implements Shape { ... }
```

### Interface Segregation (ISP)
```
Clients shouldn't depend on interfaces they don't use.

BAD: Fat interface forces empty implementations
interface Worker {
  work();
  eat();
  sleep();
}
class Robot implements Worker {
  work() { ... }
  eat() { /* robots don't eat */ }  // Forced empty
  sleep() { /* robots don't sleep */ }
}

GOOD: Segregated interfaces
interface Workable { work(); }
interface Eatable { eat(); }
interface Sleepable { sleep(); }
class Robot implements Workable { work() { ... } }
class Human implements Workable, Eatable, Sleepable { ... }
```

### Dependency Inversion (DIP)
```
Depend on abstractions, not concretions.

BAD: High-level depends on low-level
class OrderService {
  private db = new MySQLDatabase();  // Concrete dependency
  save(order) { this.db.insert(order); }
}

GOOD: Depend on abstraction
interface Database { insert(data): void }
class OrderService {
  constructor(private db: Database) {}  // Injected abstraction
  save(order) { this.db.insert(order); }
}
```

## Pragmatic Principles

### DRY (Don't Repeat Yourself)
```
Extract after 3+ duplications with identical PURPOSE.

WRONG APPLICATION:
// Extracting similar-looking but different-purpose code
function formatDate(d) { ... }  // Used everywhere, even when formatting differs

RIGHT APPLICATION:
// Extract when truly duplicated logic
function calculateTax(amount, rate) { return amount * rate; }
// Used consistently for all tax calculations
```

### KISS (Keep It Simple)
```
BAD: Over-engineered
class UserFactoryBuilderProvider {
  createUserFactoryBuilder() {
    return new UserFactoryBuilder(
      new UserFactory(
        new UserBuilder()
      )
    );
  }
}

GOOD: Simple and direct
function createUser(data) {
  return { id: generateId(), ...data, createdAt: new Date() };
}
```

### YAGNI (You Aren't Gonna Need It)
```
BAD: Building for hypothetical futures
class UserService {
  private cache: Map<string, User>;      // "might need caching"
  private eventBus: EventBus;            // "might need events"
  private metricsCollector: Metrics;     // "might need metrics"

  getUser(id) { /* simple DB call wrapped in complexity */ }
}

GOOD: Build for now
class UserService {
  getUser(id) { return this.db.users.findById(id); }
}
// Add caching WHEN you need it, with evidence
```

## Function Design

### Small Functions
```
BAD: Function doing too much
function processOrder(order) {
  // Validate (20 lines)
  // Calculate totals (30 lines)
  // Apply discounts (25 lines)
  // Update inventory (15 lines)
  // Send notifications (20 lines)
  // Generate invoice (40 lines)
}

GOOD: Single-purpose functions
function processOrder(order) {
  validateOrder(order);
  const totals = calculateTotals(order);
  const discounted = applyDiscounts(totals);
  updateInventory(order.items);
  notifyCustomer(order);
  return generateInvoice(discounted);
}
```

### Pure Functions (When Possible)
```
BAD: Side effects, external state
let total = 0;
function addToTotal(amount) {
  total += amount;  // Modifies external state
  logToFile(amount);  // Side effect
  return total;
}

GOOD: Pure, predictable
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
// Side effects handled separately at boundaries
```

### Command-Query Separation
```
Commands: change state, return nothing
Queries: return data, no side effects

BAD: Mixed
function getAndIncrementCounter() {
  this.counter++;
  return this.counter;  // Both modifies and returns
}

GOOD: Separated
function incrementCounter() { this.counter++; }
function getCounter() { return this.counter; }
```

## Code Smells & Fixes

| Smell | Sign | Fix |
|-------|------|-----|
| **Long Method** | > 20 lines, scrolling needed | Extract methods |
| **Long Parameter List** | > 3 parameters | Introduce parameter object |
| **Primitive Obsession** | Using primitives for domain concepts | Create value objects |
| **Feature Envy** | Method uses another class more | Move method to that class |
| **Data Clumps** | Same fields/params always together | Extract class |
| **Divergent Change** | One class changed for many reasons | Split by responsibility |
| **Shotgun Surgery** | One change affects many classes | Consolidate responsibility |
| **Dead Code** | Unreachable or unused code | Delete it |
| **Comments** | Explaining bad code | Refactor code to be clear |
| **Magic Numbers** | Unexplained literal values | Extract named constants |

## Refactoring Patterns

### Extract Method
```
BEFORE:
function printBill(invoice) {
  console.log("=== INVOICE ===");
  console.log(`Customer: ${invoice.customer}`);
  console.log("Items:");
  let total = 0;
  for (const item of invoice.items) {
    console.log(`  ${item.name}: $${item.price}`);
    total += item.price;
  }
  console.log(`Total: $${total}`);
}

AFTER:
function printBill(invoice) {
  printHeader(invoice);
  const total = printItems(invoice.items);
  printTotal(total);
}
```

### Replace Conditional with Polymorphism
```
BEFORE:
function getSpeed(vehicle) {
  switch (vehicle.type) {
    case 'car': return vehicle.baseSpeed * 1.2;
    case 'bicycle': return vehicle.baseSpeed * 0.5;
    case 'plane': return vehicle.baseSpeed * 10;
  }
}

AFTER:
class Car { getSpeed() { return this.baseSpeed * 1.2; } }
class Bicycle { getSpeed() { return this.baseSpeed * 0.5; } }
class Plane { getSpeed() { return this.baseSpeed * 10; } }
```

### Introduce Parameter Object
```
BEFORE:
function createUser(name, email, age, city, country, zipCode) { ... }

AFTER:
function createUser(userData: UserData) { ... }
interface UserData {
  name: string;
  email: string;
  age: number;
  address: Address;
}
```

## Complexity Metrics

| Metric | Target | Action if Exceeded |
|--------|--------|-------------------|
| Cyclomatic Complexity | < 10 | Extract conditionals, use polymorphism |
| Cognitive Complexity | < 15 | Simplify nesting, extract helper functions |
| Lines per Function | < 30 | Extract methods |
| Parameters per Function | ≤ 3 | Use parameter objects |
| Nesting Depth | ≤ 3 | Early returns, extract methods |
| Class Methods | < 20 | Split class by responsibility |
