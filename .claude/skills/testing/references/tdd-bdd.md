# TDD & BDD

## Test-Driven Development (TDD)

### The Red-Green-Refactor Cycle

```
    ┌─────────────────────────────────┐
    │                                 │
    ▼                                 │
┌───────┐     ┌───────┐     ┌─────────┴─┐
│  RED  │ ──► │ GREEN │ ──► │ REFACTOR  │
└───────┘     └───────┘     └───────────┘
 Write         Write         Improve
 failing       minimal       code
 test          code          quality
```

### Step-by-Step

1. **RED**: Write a failing test

   - Test doesn't compile? That counts as failing
   - Test should fail for the right reason
   - One test at a time

2. **GREEN**: Make it pass

   - Write minimal code to pass
   - Don't over-engineer
   - Okay to write "ugly" code here

3. **REFACTOR**: Clean up
   - Improve code quality
   - Remove duplication
   - Tests must still pass

### TDD Example

```typescript
// Step 1: RED - Write failing test
describe("Stack", () => {
  it("should return true for isEmpty when stack is empty", () => {
    const stack = new Stack();
    expect(stack.isEmpty()).toBe(true);
  });
});

// Test fails: Stack doesn't exist

// Step 2: GREEN - Minimal implementation
class Stack {
  isEmpty(): boolean {
    return true; // Simplest thing that works
  }
}

// Test passes!

// Step 3: RED - Add another test
it("should return false for isEmpty after push", () => {
  const stack = new Stack();
  stack.push(1);
  expect(stack.isEmpty()).toBe(false);
});

// Test fails

// Step 4: GREEN - Expand implementation
class Stack {
  private items: number[] = [];

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  push(item: number): void {
    this.items.push(item);
  }
}

// Continue cycle...
```

### TDD Benefits

| Benefit               | Description                           |
| --------------------- | ------------------------------------- |
| **Design feedback**   | Tests reveal API awkwardness early    |
| **Documentation**     | Tests show how to use the code        |
| **Confidence**        | Full coverage by definition           |
| **Focus**             | Work on one thing at a time           |
| **Regression safety** | Changes don't break existing behavior |

### TDD Challenges

| Challenge        | Mitigation                  |
| ---------------- | --------------------------- |
| Slower initially | Pays off in maintenance     |
| Learning curve   | Start with simple functions |
| Legacy code      | Add tests around changes    |
| UI testing       | Use BDD/integration tests   |

## Behavior-Driven Development (BDD)

### Core Concepts

BDD extends TDD with:

- Natural language specifications
- Focus on behavior, not implementation
- Shared understanding (devs, QA, product)

### Gherkin Syntax

```gherkin
Feature: Shopping Cart
  As a customer
  I want to add products to my cart
  So that I can purchase multiple items at once

  Background:
    Given I am logged in as a customer
    And the product catalog is loaded

  Scenario: Adding a product to empty cart
    Given my cart is empty
    When I add "Red T-Shirt" to my cart
    Then my cart should contain 1 item
    And the cart total should be $29.99

  Scenario: Adding multiple quantities
    Given my cart is empty
    When I add 3 "Blue Jeans" to my cart
    Then my cart should contain 3 items
    And the cart total should be $149.97

  Scenario Outline: Discount thresholds
    Given my cart total is <initial_total>
    When I apply discount code "<code>"
    Then my discount should be <discount>

    Examples:
      | initial_total | code   | discount |
      | $50           | SAVE10 | $0       |
      | $100          | SAVE10 | $10      |
      | $200          | SAVE10 | $20      |
```

### Step Definitions

```typescript
// step-definitions/cart.steps.ts
import { Given, When, Then } from "@cucumber/cucumber";

Given("my cart is empty", function () {
  this.cart = new ShoppingCart();
});

When("I add {string} to my cart", function (productName: string) {
  const product = this.catalog.findByName(productName);
  this.cart.add(product);
});

When(
  "I add {int} {string} to my cart",
  function (quantity: number, productName: string) {
    const product = this.catalog.findByName(productName);
    this.cart.add(product, quantity);
  }
);

Then("my cart should contain {int} item(s)", function (count: number) {
  expect(this.cart.itemCount).toBe(count);
});

Then("the cart total should be ${float}", function (total: number) {
  expect(this.cart.total).toBe(total);
});
```

### BDD Without Gherkin

You can apply BDD principles without Cucumber:

```typescript
describe("Shopping Cart", () => {
  describe("when adding products", () => {
    it("should add product to empty cart", () => {
      // Given
      const cart = new ShoppingCart();
      const product = createProduct({ name: "T-Shirt", price: 29.99 });

      // When
      cart.add(product);

      // Then
      expect(cart.itemCount).toBe(1);
      expect(cart.total).toBe(29.99);
    });

    it("should handle multiple quantities", () => {
      // Given
      const cart = new ShoppingCart();
      const product = createProduct({ name: "Jeans", price: 49.99 });

      // When
      cart.add(product, 3);

      // Then
      expect(cart.itemCount).toBe(3);
      expect(cart.total).toBeCloseTo(149.97);
    });
  });
});
```

## TDD vs BDD Comparison

| Aspect            | TDD              | BDD               |
| ----------------- | ---------------- | ----------------- |
| **Language**      | Technical (code) | Natural (Gherkin) |
| **Audience**      | Developers       | Everyone          |
| **Focus**         | Implementation   | Behavior          |
| **Granularity**   | Unit level       | Feature level     |
| **Documentation** | Code comments    | Living specs      |

## When to Use Which

### Use TDD For

- Complex algorithms
- Data transformations
- Utility functions
- Internal APIs
- Library development

### Use BDD For

- User-facing features
- Business rules
- Acceptance criteria
- Cross-team communication
- Complex workflows

### Hybrid Approach

```
Feature Level (BDD):
  ┌─────────────────────────────────┐
  │ Feature: User Registration      │
  │   Scenario: Successful signup   │
  │   Scenario: Email already used  │
  │   Scenario: Invalid email format│
  └─────────────────────────────────┘
              │
              ▼
Unit Level (TDD):
  ┌─────────────────────────────────┐
  │ EmailValidator                  │
  │   - validates format            │
  │   - checks domain               │
  │   - handles edge cases          │
  └─────────────────────────────────┘
```

## Common Patterns

### Arrange-Act-Assert (AAA)

```typescript
it("should apply discount to order", () => {
  // Arrange
  const order = new Order([{ product: "Laptop", price: 1000 }]);
  const discount = new PercentageDiscount(10);

  // Act
  order.applyDiscount(discount);

  // Assert
  expect(order.total).toBe(900);
});
```

### Given-When-Then (GWT)

```typescript
it("should apply discount to order", () => {
  // Given an order with a laptop
  const order = new Order([{ product: "Laptop", price: 1000 }]);

  // When a 10% discount is applied
  order.applyDiscount(new PercentageDiscount(10));

  // Then the total should be reduced
  expect(order.total).toBe(900);
});
```

## Best Practices

### TDD Best Practices

1. **One assertion per test** (ideally)
2. **Test behavior, not implementation**
3. **Don't test private methods**
4. **Keep tests fast**
5. **Refactor tests too**

### BDD Best Practices

1. **Write scenarios before code**
2. **Use business language**
3. **Avoid technical details in scenarios**
4. **Keep scenarios focused**
5. **Reuse step definitions**
