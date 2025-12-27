# Architecture Principles

Detailed reference for software design principles and Domain-Driven Design.

## Table of Contents
1. [SOLID Principles Deep Dive](#solid-principles-deep-dive)
2. [Domain-Driven Design (DDD)](#domain-driven-design-ddd)
3. [General Design Principles](#general-design-principles)
4. [Coupling and Cohesion](#coupling-and-cohesion)

---

## SOLID Principles Deep Dive

### Single Responsibility Principle (SRP)

> A class should have only one reason to change.

**Bad Example:**
```python
class UserService:
    def create_user(self, data):
        # Validate data
        # Save to database
        # Send welcome email
        # Generate PDF report
        # Log to file
```

**Good Example:**
```python
class UserService:
    def __init__(self, repo, email_service, logger):
        self.repo = repo
        self.email_service = email_service
        self.logger = logger

    def create_user(self, data):
        user = User.create(data)  # Domain handles validation
        self.repo.save(user)
        self.email_service.send_welcome(user)
        self.logger.log_user_created(user)
```

### Open/Closed Principle (OCP)

> Open for extension, closed for modification.

**Pattern: Strategy**
```python
# Bad: Modifying existing code for new payment types
def process_payment(payment_type, amount):
    if payment_type == "credit":
        # process credit
    elif payment_type == "paypal":
        # process paypal
    elif payment_type == "crypto":  # New code added here
        # process crypto

# Good: Extend through new implementations
class PaymentProcessor(Protocol):
    def process(self, amount: Decimal) -> Result

class CreditCardProcessor(PaymentProcessor):
    def process(self, amount): ...

class PayPalProcessor(PaymentProcessor):
    def process(self, amount): ...

class CryptoProcessor(PaymentProcessor):  # New class, no modification
    def process(self, amount): ...
```

### Liskov Substitution Principle (LSP)

> Subtypes must be substitutable for their base types.

**Violation Example:**
```python
class Bird:
    def fly(self): ...

class Penguin(Bird):
    def fly(self):
        raise NotImplementedError()  # Violates LSP!
```

**Correct Design:**
```python
class Bird:
    def move(self): ...

class FlyingBird(Bird):
    def fly(self): ...
    def move(self):
        self.fly()

class Penguin(Bird):
    def swim(self): ...
    def move(self):
        self.swim()
```

### Interface Segregation Principle (ISP)

> Clients should not be forced to depend on interfaces they don't use.

**Bad:**
```python
class Worker(Protocol):
    def work(self): ...
    def eat(self): ...
    def sleep(self): ...
    def take_vacation(self): ...

class Robot(Worker):  # Robot doesn't eat, sleep, or vacation!
    def eat(self): pass
    def sleep(self): pass
    def take_vacation(self): pass
```

**Good:**
```python
class Workable(Protocol):
    def work(self): ...

class Feedable(Protocol):
    def eat(self): ...

class Human(Workable, Feedable):
    def work(self): ...
    def eat(self): ...

class Robot(Workable):
    def work(self): ...
```

### Dependency Inversion Principle (DIP)

> High-level modules should not depend on low-level modules. Both should depend on abstractions.

```
BAD:                              GOOD:
┌──────────────┐                  ┌──────────────┐
│ OrderService │                  │ OrderService │
└──────┬───────┘                  └──────┬───────┘
       │ depends on                      │ depends on
       ▼                                 ▼
┌──────────────┐                  ┌──────────────┐
│ MySQLDatabase│                  │<<interface>> │
└──────────────┘                  │ Repository   │
                                  └──────┬───────┘
                                         │ implemented by
                                         ▼
                                  ┌──────────────┐
                                  │ MySQLRepo    │
                                  └──────────────┘
```

---

## Domain-Driven Design (DDD)

### Strategic Patterns

#### Bounded Context
A bounded context defines the boundary within which a particular domain model applies.

```
┌─────────────────────────────────────────────────────────────────┐
│                         E-COMMERCE SYSTEM                        │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   ORDERING      │  │   INVENTORY     │  │   SHIPPING      │ │
│  │   Context       │  │   Context       │  │   Context       │ │
│  │                 │  │                 │  │                 │ │
│  │ • Order         │  │ • Product       │  │ • Shipment      │ │
│  │ • OrderLine     │  │ • Stock         │  │ • Carrier       │ │
│  │ • Customer      │  │ • Warehouse     │  │ • TrackingInfo  │ │
│  │   (simplified)  │  │                 │  │ • Address       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
│  Note: "Customer" in Ordering is different from "Customer" in   │
│  a CRM context. Each context has its own definition.            │
└─────────────────────────────────────────────────────────────────┘
```

#### Context Mapping
Relationships between bounded contexts:

| Pattern | Description | Example |
|---------|-------------|---------|
| **Shared Kernel** | Shared subset of domain model | Common types library |
| **Customer/Supplier** | Upstream/downstream relationship | Order → Shipping |
| **Conformist** | Downstream adopts upstream model | Using external API as-is |
| **Anti-Corruption Layer** | Translation layer between contexts | Legacy system integration |
| **Open Host Service** | Public API for integration | REST/GraphQL API |

### Tactical Patterns

#### Entity
Object with unique identity that persists through state changes.

```python
class Order:
    def __init__(self, order_id: OrderId):
        self._id = order_id  # Identity
        self._lines: List[OrderLine] = []
        self._status = OrderStatus.DRAFT

    @property
    def id(self) -> OrderId:
        return self._id

    def __eq__(self, other):
        return isinstance(other, Order) and self._id == other._id
```

#### Value Object
Immutable object defined by its attributes, not identity.

```python
@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str

    def add(self, other: 'Money') -> 'Money':
        if self.currency != other.currency:
            raise ValueError("Currency mismatch")
        return Money(self.amount + other.amount, self.currency)

    def __eq__(self, other):
        return self.amount == other.amount and self.currency == other.currency
```

#### Aggregate
Cluster of entities and value objects with a root entity.

```python
class Order:  # Aggregate Root
    def __init__(self, order_id: OrderId, customer_id: CustomerId):
        self._id = order_id
        self._customer_id = customer_id
        self._lines: List[OrderLine] = []  # Entities within aggregate
        self._shipping_address: Address = None  # Value Object

    def add_line(self, product_id: ProductId, quantity: int, price: Money):
        # All modifications go through aggregate root
        line = OrderLine(product_id, quantity, price)
        self._lines.append(line)

    def calculate_total(self) -> Money:
        return sum(line.subtotal for line in self._lines)
```

**Aggregate Rules:**
1. Reference other aggregates by ID only
2. All changes go through the root
3. One transaction = one aggregate
4. Keep aggregates small

#### Domain Service
Stateless operations that don't belong to entities.

```python
class PricingService:
    def __init__(self, discount_repository, tax_calculator):
        self.discounts = discount_repository
        self.tax = tax_calculator

    def calculate_order_total(self, order: Order, customer: Customer) -> Money:
        subtotal = order.calculate_total()
        discount = self.discounts.get_for_customer(customer)
        discounted = subtotal.subtract(discount.apply(subtotal))
        return self.tax.calculate(discounted, customer.address)
```

#### Repository
Abstraction for aggregate persistence.

```python
class OrderRepository(Protocol):
    def find_by_id(self, order_id: OrderId) -> Optional[Order]: ...
    def save(self, order: Order) -> None: ...
    def delete(self, order: Order) -> None: ...
    def find_by_customer(self, customer_id: CustomerId) -> List[Order]: ...
```

#### Domain Events
Record of something that happened in the domain.

```python
@dataclass(frozen=True)
class OrderPlaced:
    order_id: OrderId
    customer_id: CustomerId
    total: Money
    occurred_at: datetime

class Order:
    def place(self):
        if self._status != OrderStatus.DRAFT:
            raise InvalidOperationError("Order already placed")
        self._status = OrderStatus.PLACED
        self._events.append(OrderPlaced(
            order_id=self._id,
            customer_id=self._customer_id,
            total=self.calculate_total(),
            occurred_at=datetime.now()
        ))
```

---

## General Design Principles

### KISS (Keep It Simple, Stupid)
- Simplest solution that works
- Avoid clever tricks
- If it needs a comment to explain, simplify it

### YAGNI (You Aren't Gonna Need It)
- Don't add functionality until needed
- Build for today's requirements
- Remove unused code immediately

### DRY (Don't Repeat Yourself)
- **Wait for 3 repetitions** before abstracting
- Ensure duplications have the same reason to change
- Avoid wrong abstractions (worse than duplication)

### Composition Over Inheritance
```python
# Prefer this:
class Car:
    def __init__(self):
        self.engine = Engine()
        self.transmission = Transmission()

# Over this:
class Car(Vehicle, Drivable, Refuelable):
    ...
```

### Law of Demeter
Only talk to immediate friends:
```python
# Bad: reaching through objects
order.customer.address.city

# Good: tell, don't ask
order.get_shipping_city()
```

---

## Coupling and Cohesion

### Types of Coupling (worst to best)

| Type | Description | Example |
|------|-------------|---------|
| **Content** | Module modifies another's internal data | Direct field access |
| **Common** | Shared global data | Global variables |
| **Control** | Passing control flags | `process(data, useCache=True)` |
| **Stamp** | Passing data structures with unused fields | Large DTOs |
| **Data** | Passing only required primitive data | Method parameters |
| **Message** | Communication via messages/events | Event-driven |

### Cohesion Types (worst to best)

| Type | Description |
|------|-------------|
| **Coincidental** | Unrelated functions grouped arbitrarily |
| **Logical** | Related by category but not function |
| **Temporal** | Grouped by when they execute |
| **Procedural** | Grouped by execution order |
| **Communicational** | Operate on same data |
| **Sequential** | Output of one is input of next |
| **Functional** | All contribute to single task |

### Goal
**Low Coupling + High Cohesion = Maintainable Code**
