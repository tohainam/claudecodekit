# Code Smells Catalog

A code smell is a surface indication that usually corresponds to a deeper problem. This catalog helps identify what's wrong before applying refactoring techniques.

## Table of Contents

1. [Bloaters](#bloaters) - Code that grows too large
2. [Object-Orientation Abusers](#object-orientation-abusers) - OOP misuse
3. [Change Preventers](#change-preventers) - Hard to modify code
4. [Dispensables](#dispensables) - Unnecessary code
5. [Couplers](#couplers) - Excessive coupling
6. [Frontend-Specific](#frontend-specific) - UI/Component smells
7. [Backend-Specific](#backend-specific) - Server-side smells
8. [Data/SQL](#datasql) - Database smells

---

## Bloaters

Code that has grown so large it's hard to work with.

### Long Method

**Signs:**
- Method > 20-40 lines
- Multiple levels of nesting
- Comments explaining "what this part does"
- Hard to name the method (does too much)

**Detection:**
```
# Lines of code check
- Function > 20 lines: Warning
- Function > 40 lines: Smell
- Function > 100 lines: Critical
```

**Fix:** Extract Method, Replace Temp with Query

---

### Large Class

**Signs:**
- Class > 300-500 lines
- Too many instance variables (>7)
- Multiple unrelated responsibilities
- "And" in class name (UserManagerAndValidator)

**Detection:**
```
# Responsibility count
- Class handles > 2 responsibilities: Smell
- Class has > 10 public methods: Warning
- Class has > 15 fields: Smell
```

**Fix:** Extract Class, Extract Subclass, Extract Interface

---

### Long Parameter List

**Signs:**
- Function takes > 3-4 parameters
- Boolean flags as parameters
- Parameters that are always passed together

**Detection:**
```
fn(a, b, c, d, e)  // 5 params = smell
fn(a, b, c, isAdmin, isActive, isVerified)  // boolean flags
```

**Fix:** Introduce Parameter Object, Preserve Whole Object, Replace Parameter with Method Call

---

### Primitive Obsession

**Signs:**
- Using strings for emails, phone numbers, money
- Constants for type codes
- String field names in data structures

**Examples:**
```javascript
// Smell
const email = "user@example.com";
const price = 19.99;
const status = "active";

// Better
const email = new Email("user@example.com");
const price = new Money(19.99, "USD");
const status = UserStatus.ACTIVE;
```

**Fix:** Replace Data Value with Object, Replace Type Code with Class/Enum

---

### Data Clumps

**Signs:**
- Same group of variables appear together repeatedly
- Parameters that are always passed together
- Fields that are always used together

**Example:**
```javascript
// Smell - always together
function createUser(firstName, lastName, street, city, zipCode) {}
function updateAddress(street, city, zipCode) {}
function validateAddress(street, city, zipCode) {}

// Better
function createUser(name: Name, address: Address) {}
```

**Fix:** Extract Class, Introduce Parameter Object

---

## Object-Orientation Abusers

### Switch Statements

**Signs:**
- Same switch/case on same type in multiple places
- Type checking with instanceof/typeof
- Conditional logic based on object type

**Example:**
```javascript
// Smell
function getArea(shape) {
  switch(shape.type) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'rectangle': return shape.width * shape.height;
    case 'triangle': return 0.5 * shape.base * shape.height;
  }
}

// Better - polymorphism
class Circle { getArea() { return Math.PI * this.radius ** 2; } }
class Rectangle { getArea() { return this.width * this.height; } }
```

**Fix:** Replace Conditional with Polymorphism, Replace Type Code with Subclasses

---

### Feature Envy

**Signs:**
- Method uses more data from another class than its own
- Extensive getter chains: `order.getCustomer().getAddress().getCity()`
- Method would make more sense in another class

**Example:**
```javascript
// Smell - EmailService envies User data
class EmailService {
  sendWelcome(user) {
    const greeting = user.getFirstName() + ' ' + user.getLastName();
    const email = user.getEmail();
    const locale = user.getPreferredLocale();
    // ... uses only user data
  }
}

// Better - move to User
class User {
  getWelcomeGreeting() { return `${this.firstName} ${this.lastName}`; }
}
```

**Fix:** Move Method, Move Field, Extract Method

---

### Inappropriate Intimacy

**Signs:**
- Classes access each other's private fields
- Bidirectional dependencies
- Classes change together frequently

**Fix:** Move Method, Move Field, Change Bidirectional to Unidirectional, Extract Class

---

### Refused Bequest

**Signs:**
- Subclass doesn't use inherited methods/properties
- Subclass overrides parent methods to do nothing
- "Is-A" relationship doesn't make sense

**Fix:** Replace Inheritance with Delegation, Extract Superclass

---

## Change Preventers

Code that makes changes difficult.

### Divergent Change

**Signs:**
- One class modified for multiple unrelated reasons
- Single class is a "god object"
- Changes for feature A affect unrelated feature B

**Fix:** Extract Class, Extract Superclass, Extract Subclass

---

### Shotgun Surgery

**Signs:**
- Small change requires edits in many places
- Adding a field requires updating 10+ files
- Concerns scattered across codebase

**Fix:** Move Method, Move Field, Inline Class

---

### Parallel Inheritance Hierarchies

**Signs:**
- Creating subclass in one hierarchy requires subclass in another
- Prefixes match across hierarchies (AndroidButton, AndroidDialog)

**Fix:** Move Method, Move Field to eliminate duplication

---

## Dispensables

Code that is unnecessary.

### Comments (Explaining Bad Code)

**Signs:**
- Comments explain WHAT code does (should be obvious)
- Commented-out code
- TODO comments that are years old

**Good comments:** WHY, not WHAT
```javascript
// Smell
// Loop through users and check if active
for (const user of users) {
  if (user.status === 'active') { ... }
}

// Better - self-documenting
for (const user of activeUsers) { ... }

// Good comment - explains WHY
// Using insertion sort because data is nearly sorted (benchmarked 3x faster)
```

**Fix:** Extract Method, Rename Method, Delete commented code

---

### Duplicate Code

**Signs:**
- Same code structure in multiple places
- Copy-paste with minor variations
- Similar algorithms with different types

**Detection:**
```
- Identical code blocks: Critical
- Similar structure, different names: Smell
- Same algorithm, different types: Consider generics
```

**Fix:** Extract Method, Extract Superclass, Form Template Method

---

### Dead Code

**Signs:**
- Unreachable code after return/throw
- Unused variables, functions, classes
- Commented-out code "just in case"

**Fix:** Delete it. Version control is your backup.

---

### Speculative Generality

**Signs:**
- Abstract classes with single implementation
- Parameters/hooks "for future use"
- "We might need this someday"

**Fix:** Collapse Hierarchy, Inline Class, Remove Parameter

---

### Lazy Class

**Signs:**
- Class does almost nothing
- Class exists "for completeness"
- Could be a simple function

**Fix:** Inline Class, Collapse Hierarchy

---

## Couplers

Excessive coupling between components.

### Message Chains

**Signs:**
- Long chains: `a.getB().getC().getD().doSomething()`
- Changes to intermediate classes break the chain
- Violates Law of Demeter

**Fix:** Hide Delegate, Extract Method, Move Method

---

### Middle Man

**Signs:**
- Class only delegates to another class
- Most methods just forward calls
- No added value

**Fix:** Remove Middle Man, Inline Method, Replace Delegation with Inheritance

---

### Incomplete Library Class

**Signs:**
- Need to modify library behavior
- Extending library class awkwardly
- Utility classes wrapping library

**Fix:** Introduce Foreign Method, Introduce Local Extension

---

## Frontend-Specific

### Prop Drilling

**Signs:**
- Props passed through 3+ component levels
- Intermediate components don't use the prop
- Changes require updating many files

**Fix:** Context/Provider, State management, Composition

---

### God Component

**Signs:**
- Component > 300 lines
- Multiple responsibilities (fetching, rendering, business logic)
- Too many props (>7)
- Too many state variables (>5)

**Fix:** Extract components, Custom hooks, Container/Presentational pattern

---

### Inline Styles Abuse

**Signs:**
- Complex styles inline
- Repeated style objects
- Dynamic styles mixed with static

**Fix:** Extract to stylesheet, CSS-in-JS with theme, Utility classes

---

### Effect Soup

**Signs:**
- useEffect with many dependencies
- Multiple effects that should be one
- Effects with unclear purpose

**Fix:** Extract to custom hook, Split effects by concern, Consider useReducer

---

## Backend-Specific

### Anemic Domain Model

**Signs:**
- Classes with only getters/setters
- All logic in service classes
- Domain objects are just data containers

**Fix:** Move Method to domain, Rich domain model, DDD patterns

---

### Transaction Script Smell

**Signs:**
- Long procedural methods in services
- No domain objects, just data
- Business logic in controllers

**Fix:** Extract domain objects, Apply DDD, Use patterns

---

### Leaky Abstraction

**Signs:**
- Implementation details exposed in interface
- Database-specific types in API responses
- ORM entities used as DTOs

**Fix:** Introduce DTO layer, Abstract repository, Clean architecture

---

### God Service

**Signs:**
- Service class > 500 lines
- Handles unrelated operations
- Injected into many other services

**Fix:** Extract services by domain, Apply SRP, Define bounded contexts

---

## Data/SQL

### SQL Smell: SELECT *

**Signs:**
- `SELECT *` in production code
- Fetching unused columns
- Schema changes break queries

**Fix:** Explicitly list columns

---

### SQL Smell: N+1 Queries

**Signs:**
- Loop that executes query per iteration
- Fetching related data one-by-one
- Performance degrades with data size

**Fix:** JOIN, IN clause, Eager loading

---

### SQL Smell: Business Logic in SQL

**Signs:**
- Complex CASE statements
- Stored procedures with business rules
- Hard to test logic

**Fix:** Move to application layer, Keep SQL for data access

---

## Quick Detection Checklist

```
BLOATERS
[ ] Methods > 40 lines?
[ ] Classes > 500 lines?
[ ] Parameters > 4?
[ ] Primitives for domain concepts?

OO ABUSERS
[ ] Switch on type in multiple places?
[ ] Method uses other class's data heavily?
[ ] Subclass doesn't use parent features?

CHANGE PREVENTERS
[ ] One change = many file edits?
[ ] Class changes for unrelated reasons?

DISPENSABLES
[ ] Duplicate code blocks?
[ ] Unused code?
[ ] Comments explaining what code does?

COUPLERS
[ ] Long method chains (a.b.c.d)?
[ ] Classes only delegating?
```
