# Testing Best Practices

Universal testing guidelines for reliable, maintainable test suites.

## Testing Pyramid

```
                    ┌───────┐
                   │  E2E  │  Few, slow, high confidence
                  ├────────┤
                 │ Integration │  Some, medium speed
                ├─────────────┤
               │   Unit Tests   │  Many, fast, isolated
              └─────────────────┘
```

| Type | Purpose | Speed | Quantity | Coverage |
|------|---------|-------|----------|----------|
| Unit | Test individual functions/classes | Fast (ms) | Many (70-80%) | Logic, edge cases |
| Integration | Test component interactions | Medium (s) | Some (15-20%) | APIs, DB, services |
| E2E | Test full user flows | Slow (s-min) | Few (5-10%) | Critical paths |

## Test Structure: AAA Pattern

```javascript
describe('Calculator', () => {
  it('should add two numbers correctly', () => {
    // Arrange: Set up test data and conditions
    const calculator = new Calculator();
    const a = 5;
    const b = 3;

    // Act: Execute the code under test
    const result = calculator.add(a, b);

    // Assert: Verify the outcome
    expect(result).toBe(8);
  });
});
```

## Naming Conventions

### Test File Names
```
# By location (common in JS/TS)
src/
  utils/
    string.ts
    string.test.ts      # Co-located
    string.spec.ts      # Alternative

# By folder (common in Python/Java)
src/utils/string.py
tests/utils/test_string.py

# Pattern: [name].test.[ext] or test_[name].[ext]
```

### Test Names
```javascript
// Pattern: should [expected behavior] when [condition]
it('should return empty array when input is null')
it('should throw ValidationError when email is invalid')
it('should calculate discount when user is premium')

// Pattern: [unit] [behavior] [context]
test('calculateTotal returns 0 for empty cart')
test('UserService.create throws when email exists')

// BDD Style
describe('when user is not authenticated')
  it('redirects to login page')
  it('shows error message')
```

## Test Qualities (F.I.R.S.T.)

| Quality | Description | Example |
|---------|-------------|---------|
| **F**ast | Run quickly (ms for unit tests) | Mock external services |
| **I**ndependent | No test depends on another | Each test sets up own data |
| **R**epeatable | Same result every run | No random, no real time |
| **S**elf-validating | Pass or fail, no manual check | Clear assertions |
| **T**imely | Written with or before code | TDD approach |

## What to Test

### Unit Tests
```javascript
// ✓ Pure functions with various inputs
test('formatCurrency handles negative values', () => {
  expect(formatCurrency(-100)).toBe('-$100.00');
});

// ✓ Edge cases and boundaries
test('validateAge rejects values over 150', () => {
  expect(validateAge(151)).toBe(false);
});

// ✓ Error conditions
test('divide throws on division by zero', () => {
  expect(() => divide(10, 0)).toThrow(DivisionByZeroError);
});

// ✓ State changes
test('addItem increases cart count', () => {
  const cart = new Cart();
  cart.addItem(product);
  expect(cart.itemCount).toBe(1);
});
```

### Integration Tests
```javascript
// ✓ API endpoints
test('POST /users creates user and returns 201', async () => {
  const response = await request(app)
    .post('/users')
    .send({ email: 'test@example.com', name: 'Test' });

  expect(response.status).toBe(201);
  expect(response.body.id).toBeDefined();
});

// ✓ Database operations
test('UserRepository.findByEmail returns user', async () => {
  await db.users.create({ email: 'test@example.com' });

  const user = await userRepo.findByEmail('test@example.com');

  expect(user).not.toBeNull();
  expect(user.email).toBe('test@example.com');
});

// ✓ Service interactions
test('OrderService sends notification after order', async () => {
  await orderService.createOrder(orderData);

  expect(notificationService.send).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'order_confirmation' })
  );
});
```

### E2E Tests
```javascript
// ✓ Critical user journeys
test('user can complete checkout flow', async () => {
  await page.goto('/products');
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="checkout"]');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('[data-testid="place-order"]');

  await expect(page.locator('.order-confirmation')).toBeVisible();
});
```

## Test Doubles

| Type | Purpose | Example |
|------|---------|---------|
| **Stub** | Provide canned answers | `stub.returns({ id: 1 })` |
| **Mock** | Verify interactions | `expect(mock).toHaveBeenCalledWith(args)` |
| **Spy** | Observe real implementation | `spy = jest.spyOn(obj, 'method')` |
| **Fake** | Simplified working implementation | In-memory database |
| **Dummy** | Fill parameter requirements | `new User('dummy')` |

### Mocking Examples
```javascript
// Mocking a module
jest.mock('./emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true })
}));

// Mocking specific methods
const userRepo = {
  findById: jest.fn().mockResolvedValue({ id: 1, name: 'Test' }),
  save: jest.fn().mockResolvedValue({ id: 1 })
};

// Verifying mock calls
expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
expect(emailService.sendEmail).toHaveBeenCalledWith(
  expect.objectContaining({ to: 'user@example.com' })
);
```

## Test Data Management

### Test Fixtures
```javascript
// Shared test data
const fixtures = {
  validUser: {
    email: 'test@example.com',
    name: 'Test User',
    age: 25
  },
  invalidUser: {
    email: 'invalid',
    name: '',
    age: -1
  }
};

// Factory functions (preferred for complex objects)
function createUser(overrides = {}) {
  return {
    id: Math.random().toString(36),
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    ...overrides
  };
}

// Usage
const user = createUser({ name: 'Custom Name' });
```

### Database Cleanup
```javascript
// Before/after hooks
beforeEach(async () => {
  await db.truncate(['users', 'orders']);
});

afterAll(async () => {
  await db.close();
});

// Transaction rollback (faster)
beforeEach(async () => {
  await db.beginTransaction();
});

afterEach(async () => {
  await db.rollback();
});
```

## Coverage Guidelines

### Target Metrics
| Metric | Target | Notes |
|--------|--------|-------|
| Line Coverage | 70-80% | Higher for critical paths |
| Branch Coverage | 70-80% | All conditionals tested |
| Function Coverage | 80-90% | All public functions |

### What NOT to Obsess Over
```
✗ 100% coverage (diminishing returns)
✗ Covering generated code
✗ Covering trivial getters/setters
✗ Covering framework code
✗ Covering configuration

Focus on: Business logic, edge cases, error handling
```

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Testing implementation** | Brittle tests | Test behavior, not how |
| **Test interdependence** | Failures cascade | Isolate each test |
| **Excessive mocking** | Tests pass, code fails | Use real dependencies when feasible |
| **Long setup** | Hard to understand | Extract fixtures, use factories |
| **Magic values** | Unclear intent | Use named constants or variables |
| **No assertions** | False confidence | Every test must assert |
| **Catching exceptions** | Hiding failures | Let exceptions fail tests |
| **Time-dependent tests** | Flaky results | Mock time, use relative dates |

## Testing Checklist

```
UNIT TESTS
□ All public functions tested?
□ Edge cases covered (null, empty, boundary)?
□ Error conditions tested?
□ Tests are fast (< 100ms each)?
□ Tests are independent?

INTEGRATION TESTS
□ API endpoints tested (success and error)?
□ Database operations tested?
□ External service interactions mocked?
□ Authentication/authorization tested?

TEST QUALITY
□ Clear, descriptive test names?
□ AAA pattern followed?
□ No flaky tests?
□ Tests document expected behavior?
□ Coverage targets met?

MAINTENANCE
□ Tests run in CI/CD?
□ Failing tests investigated immediately?
□ Test data managed properly?
□ Mocks updated with implementation?
```
