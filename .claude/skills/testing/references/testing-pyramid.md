# Testing Pyramid & Trophy

## Classic Testing Pyramid

```
                    ╱╲
                   ╱  ╲         E2E / UI Tests
                  ╱    ╲        (~10%)
                 ╱──────╲       Slow, expensive, high confidence
                ╱        ╲
               ╱          ╲     Integration Tests
              ╱            ╲    (~20%)
             ╱──────────────╲   Medium speed, moderate cost
            ╱                ╲
           ╱                  ╲ Unit Tests
          ╱                    ╲(~70%)
         ╱────────────────────── Fast, cheap, focused
```

### Rationale

| Level       | Speed  | Cost   | Confidence | Maintenance |
| ----------- | ------ | ------ | ---------- | ----------- |
| Unit        | ~1ms   | Low    | Low        | Low         |
| Integration | ~100ms | Medium | Medium     | Medium      |
| E2E         | ~1-10s | High   | High       | High        |

### Google's Recommended Split

- **70% Unit Tests**: Fast feedback, test in isolation
- **20% Integration Tests**: Component interaction
- **10% E2E Tests**: Critical user journeys only

## Testing Trophy (Kent C. Dodds)

```
              ┌────────┐
              │  E2E   │  Few, critical paths
              ├────────┤
        ┌─────┤        ├─────┐
        │     │        │     │
        │ Integration  │     │  Most tests here
        │     │        │     │
        └─────┤        ├─────┘
              ├────────┤
              │  Unit  │  Shared utilities
              ├────────┤
              │ Static │  TypeScript, ESLint
              └────────┘
```

### Key Differences from Pyramid

| Aspect          | Pyramid               | Trophy               |
| --------------- | --------------------- | -------------------- |
| Focus           | Unit tests            | Integration tests    |
| Philosophy      | Isolate everything    | Test like users      |
| Mocking         | Mock all dependencies | Mock minimally       |
| Coverage source | Many unit tests       | Fewer, broader tests |

### Trophy Rationale

> "Write tests. Not too many. Mostly integration."
> — Guillermo Rauch

- Integration tests give **highest confidence per line of test code**
- Users don't use units, they use features
- Over-mocking creates tests that pass but app fails

## Choosing Your Strategy

### Use Pyramid When

- Large codebase with complex business logic
- Many pure functions/algorithms
- Team familiar with unit testing
- Need fast CI feedback

### Use Trophy When

- UI-heavy applications
- Feature-focused development
- Small to medium codebase
- Team prefers realistic tests

### Hybrid Approach (Recommended 2025)

```
E2E:          5-10%   Critical user journeys
Integration:  40-50%  Feature tests, API tests
Unit:         30-40%  Complex logic, utilities
Static:       Always  Types, linting
```

## Test Type Details

### Unit Tests

**Characteristics**:

- Test single function/class
- No I/O (database, network, filesystem)
- Mock all dependencies
- Fast (< 10ms each)

**Best For**:

- Pure functions
- Algorithms
- Data transformations
- Validation logic

```typescript
// Unit test example
describe("calculateDiscount", () => {
  it("applies 10% discount for orders over $100", () => {
    expect(calculateDiscount(150)).toBe(15);
  });

  it("returns 0 for orders under $100", () => {
    expect(calculateDiscount(50)).toBe(0);
  });
});
```

### Integration Tests

**Characteristics**:

- Test multiple components together
- May include database, API calls
- Minimal mocking (only external services)
- Medium speed (100ms - 1s)

**Best For**:

- API endpoints
- Database operations
- Service interactions
- User features

```typescript
// Integration test example
describe("POST /api/orders", () => {
  it("creates order and sends confirmation email", async () => {
    // Real database, mocked email service
    const response = await request(app)
      .post("/api/orders")
      .send({ items: [{ id: "123", quantity: 2 }] });

    expect(response.status).toBe(201);
    expect(await db.orders.findById(response.body.id)).toBeTruthy();
    expect(emailService.send).toHaveBeenCalled();
  });
});
```

### E2E Tests

**Characteristics**:

- Test entire application
- Real browser/environment
- No mocking
- Slow (1-30s each)

**Best For**:

- Critical user journeys
- Smoke tests
- Cross-browser testing
- Visual regression

```typescript
// E2E test example (Playwright)
test("user can complete checkout", async ({ page }) => {
  await page.goto("/");
  await page.click('[data-test="add-to-cart"]');
  await page.click('[data-test="checkout"]');
  await page.fill('[name="email"]', "test@example.com");
  await page.click('[data-test="submit-order"]');

  await expect(page.locator(".confirmation")).toBeVisible();
});
```

### Contract Tests

**Characteristics**:

- Test API contracts between services
- Consumer-driven
- No full integration needed
- Fast and focused

**Best For**:

- Microservices
- Third-party API integration
- Versioned APIs

```typescript
// Contract test example (Pact)
describe("User API Contract", () => {
  it("returns user data", async () => {
    await provider.addInteraction({
      state: "user exists",
      uponReceiving: "a request for user",
      withRequest: { method: "GET", path: "/users/1" },
      willRespondWith: {
        status: 200,
        body: { id: 1, name: like("John") },
      },
    });

    const user = await client.getUser(1);
    expect(user.name).toBe("John");
  });
});
```

## Test Distribution by Project Type

### Web Application (Frontend)

```
E2E:         15%  User flows, cross-browser
Integration: 50%  Component tests with real DOM
Unit:        25%  Utilities, hooks, pure functions
Static:      10%  TypeScript, ESLint
```

### REST API (Backend)

```
E2E:          5%  Smoke tests
Integration: 60%  Endpoint tests with real DB
Unit:        30%  Business logic, validators
Contract:     5%  Consumer contracts
```

### CLI Tool

```
E2E:         20%  Command execution
Integration: 30%  Feature tests
Unit:        50%  Parsers, formatters, logic
```

### Library/Package

```
E2E:          0%  N/A
Integration: 20%  Public API tests
Unit:        80%  All exported functions
```
