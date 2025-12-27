# Testing Patterns & Anti-Patterns

## Table of Contents
1. [Core Testing Patterns](#core-testing-patterns)
2. [Mocking Patterns](#mocking-patterns)
3. [Fixture Patterns](#fixture-patterns)
4. [Assertion Patterns](#assertion-patterns)
5. [Test Organization](#test-organization)
6. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
7. [Framework-Specific Patterns](#framework-specific-patterns)

---

## Core Testing Patterns

### Arrange-Act-Assert (AAA)

```python
def test_user_can_place_order():
    # Arrange - Set up test data and dependencies
    user = User(id="1", balance=100)
    product = Product(id="p1", price=30)
    order_service = OrderService()

    # Act - Execute the code under test
    order = order_service.place_order(user, product, quantity=2)

    # Assert - Verify the expected outcome
    assert order.total == 60
    assert user.balance == 40
    assert order.status == "confirmed"
```

### Given-When-Then (BDD Style)

```python
def test_user_can_place_order():
    # Given a user with sufficient balance
    user = create_user(balance=100)
    product = create_product(price=30)

    # When they place an order for 2 items
    order = place_order(user, product, quantity=2)

    # Then the order is confirmed and balance is deducted
    assert order.status == "confirmed"
    assert user.balance == 40
```

### Four-Phase Test

```typescript
describe('OrderService', () => {
  it('processes order correctly', async () => {
    // 1. Setup - Create test fixtures
    const user = await createTestUser()
    const product = await createTestProduct()

    // 2. Exercise - Call the method under test
    const order = await orderService.process(user.id, product.id, 2)

    // 3. Verify - Assert expected outcomes
    expect(order.status).toBe('completed')
    expect(order.total).toBe(60)

    // 4. Teardown - Clean up (often in afterEach)
    await cleanupTestData()
  })
})
```

### Builder Pattern for Test Data

```typescript
// Test data builder
class UserBuilder {
  private user: Partial<User> = {
    id: 'default-id',
    name: 'Default User',
    email: 'default@test.com',
    role: 'user',
  }

  withId(id: string): this {
    this.user.id = id
    return this
  }

  withName(name: string): this {
    this.user.name = name
    return this
  }

  withRole(role: 'user' | 'admin'): this {
    this.user.role = role
    return this
  }

  asAdmin(): this {
    return this.withRole('admin')
  }

  build(): User {
    return this.user as User
  }
}

// Usage
const admin = new UserBuilder().withName('Admin').asAdmin().build()
const user = new UserBuilder().withId('u123').build()
```

### Object Mother Pattern

```python
class UserMother:
    """Factory for creating test users with common configurations"""

    @staticmethod
    def admin():
        return User(
            id="admin-1",
            name="Admin User",
            email="admin@test.com",
            role="admin",
            permissions=["read", "write", "delete"]
        )

    @staticmethod
    def regular():
        return User(
            id="user-1",
            name="Regular User",
            email="user@test.com",
            role="user",
            permissions=["read"]
        )

    @staticmethod
    def premium():
        return User(
            id="premium-1",
            name="Premium User",
            email="premium@test.com",
            role="user",
            subscription="premium"
        )

# Usage
admin = UserMother.admin()
user = UserMother.regular()
```

---

## Mocking Patterns

### Stub Pattern

```python
# Stub: Returns predetermined values
def test_get_weather_returns_data():
    # Stub the API response
    weather_api = Mock()
    weather_api.get_temperature.return_value = 25

    service = WeatherService(weather_api)
    result = service.get_current_weather("NYC")

    assert result["temperature"] == 25
```

### Mock Pattern

```python
# Mock: Verifies interactions
def test_email_is_sent_on_signup():
    email_service = Mock()

    user_service = UserService(email_service)
    user_service.signup("user@test.com", "password")

    # Verify the mock was called correctly
    email_service.send_welcome_email.assert_called_once_with("user@test.com")
```

### Spy Pattern

```typescript
// Spy: Real implementation + call tracking
it('logs errors when payment fails', async () => {
  const logger = new Logger()
  const logSpy = jest.spyOn(logger, 'error')

  const paymentService = new PaymentService(logger)
  await paymentService.process(invalidCard)

  expect(logSpy).toHaveBeenCalledWith(
    expect.stringContaining('Payment failed')
  )
})
```

### Fake Pattern

```typescript
// Fake: Simplified working implementation
class FakeUserRepository implements UserRepository {
  private users: Map<string, User> = new Map()

  async save(user: User): Promise<void> {
    this.users.set(user.id, user)
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values())
      .find(u => u.email === email) ?? null
  }

  // Test helper methods
  clear(): void {
    this.users.clear()
  }

  count(): number {
    return this.users.size
  }
}
```

### Dependency Injection for Testing

```python
# Production code with DI
class OrderService:
    def __init__(
        self,
        repository: OrderRepository,
        payment_gateway: PaymentGateway,
        email_service: EmailService
    ):
        self.repository = repository
        self.payment_gateway = payment_gateway
        self.email_service = email_service

# Test with injected mocks
def test_order_processing():
    mock_repo = Mock(spec=OrderRepository)
    mock_payment = Mock(spec=PaymentGateway)
    mock_email = Mock(spec=EmailService)

    service = OrderService(mock_repo, mock_payment, mock_email)
    # ... test implementation
```

---

## Fixture Patterns

### Shared Fixtures

```python
# conftest.py
import pytest

@pytest.fixture(scope="session")
def database():
    """Database connection shared across all tests"""
    db = create_test_database()
    yield db
    db.drop()

@pytest.fixture(scope="function")
def clean_db(database):
    """Clean database for each test"""
    yield database
    database.truncate_all()

@pytest.fixture
def user(clean_db):
    """Create a test user"""
    return User.create(name="Test User", email="test@example.com")
```

### Parameterized Fixtures

```python
@pytest.fixture(params=["sqlite", "postgres", "mysql"])
def database(request):
    """Test against multiple databases"""
    db = create_database(request.param)
    yield db
    db.cleanup()

def test_user_crud(database):
    """Runs 3 times - once for each database"""
    user = User.create(db=database, name="Test")
    assert User.find(db=database, id=user.id) is not None
```

### Fixture Composition

```typescript
// Compose fixtures for complex scenarios
const fixtures = {
  user: () => createUser({ role: 'user' }),
  admin: () => createUser({ role: 'admin' }),
  product: () => createProduct({ price: 100 }),

  // Composed fixtures
  userWithOrder: async () => {
    const user = await fixtures.user()
    const product = await fixtures.product()
    const order = await createOrder({ userId: user.id, productId: product.id })
    return { user, product, order }
  },

  adminWithProducts: async () => {
    const admin = await fixtures.admin()
    const products = await Promise.all([
      fixtures.product(),
      fixtures.product(),
      fixtures.product(),
    ])
    return { admin, products }
  },
}
```

---

## Assertion Patterns

### Fluent Assertions

```typescript
// Using expect with chained matchers
expect(user)
  .toMatchObject({
    name: 'John',
    email: expect.stringContaining('@'),
  })
  .toHaveProperty('createdAt')

expect(orders)
  .toHaveLength(3)
  .toContainEqual(expect.objectContaining({ status: 'completed' }))
```

### Custom Matchers

```typescript
// Custom Jest matcher
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const pass = emailRegex.test(received)
    return {
      pass,
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
    }
  },
})

// Usage
expect(user.email).toBeValidEmail()
```

### Soft Assertions (Multiple Checks)

```python
from pytest_check import check

def test_user_profile():
    user = get_user_profile("123")

    # All assertions run even if some fail
    with check:
        assert user.name == "John"
    with check:
        assert user.email == "john@test.com"
    with check:
        assert user.age >= 18
```

---

## Test Organization

### Test File Structure

```
src/
├── services/
│   └── user.ts
└── __tests__/
    └── services/
        └── user.test.ts

# Or colocated
src/
├── services/
│   ├── user.ts
│   └── user.test.ts
```

### Describe Blocks

```typescript
describe('UserService', () => {
  describe('create', () => {
    it('creates user with valid data', () => {})
    it('throws error for duplicate email', () => {})
    it('hashes password before saving', () => {})
  })

  describe('authenticate', () => {
    it('returns token for valid credentials', () => {})
    it('throws error for invalid password', () => {})
    it('locks account after 5 failed attempts', () => {})
  })

  describe('delete', () => {
    it('soft deletes user by default', () => {})
    it('hard deletes when force flag is true', () => {})
  })
})
```

### Test Naming Conventions

```python
# Format: test_[unit]_[scenario]_[expected_result]
def test_calculate_discount_with_valid_percentage_returns_discounted_price():
    pass

def test_user_login_with_invalid_password_raises_auth_error():
    pass

def test_order_total_with_multiple_items_sums_correctly():
    pass
```

---

## Anti-Patterns to Avoid

### 1. Testing Implementation Details

```typescript
// ❌ Bad: Testing internal state
it('sets internal flag', () => {
  const service = new OrderService()
  service.process(order)
  expect(service._internalProcessingFlag).toBe(true)  // Don't test this
})

// ✅ Good: Testing behavior
it('processes order successfully', () => {
  const service = new OrderService()
  const result = service.process(order)
  expect(result.status).toBe('processed')
})
```

### 2. Excessive Mocking

```typescript
// ❌ Bad: Mocking everything
it('creates user', () => {
  const mockDb = mock()
  const mockLogger = mock()
  const mockValidator = mock()
  const mockHasher = mock()
  // ... too many mocks, test is fragile

// ✅ Good: Use fakes for infrastructure, real objects otherwise
it('creates user', () => {
  const db = new FakeDatabase()
  const service = new UserService(db)  // Real validator, hasher, logger
  // ... test with minimal mocking
```

### 3. Test Interdependence

```python
# ❌ Bad: Tests depend on each other
class TestUser:
    user_id = None

    def test_create_user(self):
        user = create_user()
        TestUser.user_id = user.id  # Sharing state!

    def test_get_user(self):
        user = get_user(TestUser.user_id)  # Depends on previous test!

# ✅ Good: Independent tests
class TestUser:
    def test_create_user(self):
        user = create_user()
        assert user.id is not None

    def test_get_user(self):
        user = create_user()  # Create own test data
        result = get_user(user.id)
        assert result == user
```

### 4. Flaky Assertions

```typescript
// ❌ Bad: Time-dependent, flaky
it('sets creation time', () => {
  const user = createUser()
  expect(user.createdAt).toBe(new Date())  // Will fail!
})

// ✅ Good: Flexible time assertions
it('sets creation time', () => {
  const before = new Date()
  const user = createUser()
  const after = new Date()

  expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
  expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
})

// ✅ Better: Mock time
it('sets creation time', () => {
  jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))
  const user = createUser()
  expect(user.createdAt).toEqual(new Date('2024-01-01'))
})
```

### 5. Magic Numbers/Strings

```python
# ❌ Bad: Magic values
def test_discount():
    result = calculate_discount(100, 0.15)
    assert result == 85

# ✅ Good: Named constants with clear intent
def test_discount():
    ORIGINAL_PRICE = 100
    DISCOUNT_PERCENTAGE = 15
    EXPECTED_FINAL_PRICE = 85

    result = calculate_discount(ORIGINAL_PRICE, DISCOUNT_PERCENTAGE / 100)

    assert result == EXPECTED_FINAL_PRICE
```

### 6. Testing the Framework

```typescript
// ❌ Bad: Testing React's useState
it('updates state on click', () => {
  const [count, setCount] = useState(0)
  setCount(1)
  expect(count).toBe(1)  // Testing React, not your code
})

// ✅ Good: Testing component behavior
it('increments counter on button click', () => {
  render(<Counter />)
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByText('1')).toBeInTheDocument()
})
```

---

## Framework-Specific Patterns

### React: Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react'

it('manages counter state', () => {
  const { result } = renderHook(() => useCounter(5))

  expect(result.current.count).toBe(5)

  act(() => {
    result.current.increment()
  })

  expect(result.current.count).toBe(6)
})
```

### Vue: Testing Composables

```typescript
import { ref } from 'vue'
import { useCounter } from './useCounter'

it('manages counter state', () => {
  const { count, increment } = useCounter(5)

  expect(count.value).toBe(5)

  increment()

  expect(count.value).toBe(6)
})
```

### Node.js: Testing Middleware

```typescript
import { createMocks } from 'node-mocks-http'

it('authenticates valid token', async () => {
  const { req, res } = createMocks({
    headers: { authorization: 'Bearer valid-token' },
  })
  const next = jest.fn()

  await authMiddleware(req, res, next)

  expect(next).toHaveBeenCalled()
  expect(req.user).toBeDefined()
})
```
