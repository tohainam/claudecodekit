# Test Strategies & Coverage

## Table of Contents
1. [Test Coverage Strategies](#test-coverage-strategies)
2. [Risk-Based Testing](#risk-based-testing)
3. [Shift-Left Testing](#shift-left-testing)
4. [Continuous Testing](#continuous-testing)
5. [Test Data Management](#test-data-management)
6. [Flaky Test Management](#flaky-test-management)
7. [Test Metrics](#test-metrics)

---

## Test Coverage Strategies

### Coverage Types

| Type | Measures | Use Case |
|------|----------|----------|
| Line coverage | % of lines executed | Basic metric |
| Branch coverage | % of branches taken | Conditional logic |
| Function coverage | % of functions called | API coverage |
| Statement coverage | % of statements executed | Similar to line |
| Path coverage | % of execution paths | Complex flows |
| Mutation score | % of mutants killed | Test quality |

### Coverage Targets

```
┌─────────────────────────────────────────────────────────┐
│              RECOMMENDED COVERAGE TARGETS               │
│                                                         │
│  Critical Code (payments, auth, security)              │
│  ├── Line coverage: 90%+                               │
│  ├── Branch coverage: 85%+                             │
│  └── Mutation score: 80%+                              │
│                                                         │
│  Core Business Logic                                   │
│  ├── Line coverage: 80%+                               │
│  ├── Branch coverage: 75%+                             │
│  └── Mutation score: 70%+                              │
│                                                         │
│  General Code                                          │
│  ├── Line coverage: 70%+                               │
│  └── Branch coverage: 60%+                             │
│                                                         │
│  UI/Presentation Layer                                 │
│  └── Line coverage: 50%+ (focus on integration tests) │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Mutation Testing

```python
# Example: mutmut for Python
# mutmut run --paths-to-mutate=src/

# Original code
def calculate_discount(price, percentage):
    return price * (1 - percentage / 100)

# Mutants generated:
# 1. return price * (1 + percentage / 100)  # Changed - to +
# 2. return price * (1 - percentage * 100)  # Changed / to *
# 3. return price / (1 - percentage / 100)  # Changed * to /

# Good tests kill all mutants
def test_discount_calculation():
    assert calculate_discount(100, 10) == 90  # Kills mutant 1, 2, 3
    assert calculate_discount(200, 50) == 100  # Additional validation
```

### Code Coverage Configuration

```javascript
// Jest coverage configuration
module.exports = {
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/critical/': {
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/mocks/',
  ],
}
```

---

## Risk-Based Testing

### Risk Assessment Matrix

```
┌─────────────────────────────────────────────────────────┐
│                 RISK ASSESSMENT MATRIX                  │
│                                                         │
│         │  Low Impact  │ Medium Impact │  High Impact  │
│  ───────┼──────────────┼───────────────┼───────────────│
│  High   │   Medium     │    High       │   Critical    │
│  Prob.  │   Priority   │    Priority   │   Priority    │
│  ───────┼──────────────┼───────────────┼───────────────│
│  Medium │    Low       │    Medium     │    High       │
│  Prob.  │   Priority   │    Priority   │   Priority    │
│  ───────┼──────────────┼───────────────┼───────────────│
│  Low    │    Low       │     Low       │    Medium     │
│  Prob.  │   Priority   │    Priority   │   Priority    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Prioritization Factors

| Factor | Weight | Examples |
|--------|--------|----------|
| Business impact | High | Revenue, reputation |
| User exposure | High | Daily active users affected |
| Complexity | Medium | Code complexity, dependencies |
| Change frequency | Medium | How often code changes |
| Historical bugs | Medium | Past defect density |
| Security sensitivity | High | Auth, payments, PII |

### Risk-Based Test Selection

```python
# Example: Tag tests by risk level
import pytest

@pytest.mark.critical
def test_payment_processing():
    """Critical: Financial transactions"""
    pass

@pytest.mark.high
def test_user_authentication():
    """High: Security-related"""
    pass

@pytest.mark.medium
def test_profile_update():
    """Medium: Core functionality"""
    pass

@pytest.mark.low
def test_ui_animation():
    """Low: Non-critical UX"""
    pass

# Run only critical tests in emergency deployment
# pytest -m critical
```

---

## Shift-Left Testing

### Traditional vs Shift-Left

```
┌─────────────────────────────────────────────────────────┐
│              SHIFT-LEFT TESTING                         │
│                                                         │
│  TRADITIONAL:                                           │
│  Requirements → Design → Code → Test → Deploy          │
│                                    ▲                    │
│                                    └── Testing here     │
│                                                         │
│  SHIFT-LEFT:                                            │
│  Requirements → Design → Code → Test → Deploy          │
│       ▲           ▲       ▲                            │
│       │           │       └── Unit tests               │
│       │           └── Design reviews, static analysis  │
│       └── Requirements testing, BDD                    │
│                                                         │
│  Cost to fix defects:                                  │
│  Requirements: $1 → Design: $5 → Code: $10 →           │
│  Test: $50 → Production: $100                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Shift-Left Practices

1. **Static Analysis**
   ```yaml
   # Pre-commit hooks
   repos:
     - repo: https://github.com/pre-commit/pre-commit-hooks
       hooks:
         - id: trailing-whitespace
         - id: check-yaml
     - repo: https://github.com/astral-sh/ruff-pre-commit
       hooks:
         - id: ruff
   ```

2. **Type Checking**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true
     }
   }
   ```

3. **PR-level Testing**
   ```yaml
   # Run tests on every PR
   on:
     pull_request:
       branches: [main]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - run: npm test
         - run: npm run lint
         - run: npm run typecheck
   ```

---

## Continuous Testing

### CI/CD Pipeline Integration

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v4
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v4
      - run: npx playwright install
      - run: npm run test:e2e

  deploy-staging:
    runs-on: ubuntu-latest
    needs: e2e-tests
    if: github.ref == 'refs/heads/main'
    steps:
      - run: ./deploy-staging.sh

  smoke-tests:
    runs-on: ubuntu-latest
    needs: deploy-staging
    steps:
      - run: npm run test:smoke -- --env=staging
```

### Test Parallelization

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
```

```python
# pytest parallelization
# pytest -n auto  # Uses all CPU cores
# pytest -n 4     # Uses 4 workers
```

---

## Test Data Management

### Strategies

| Strategy | Pros | Cons | Use Case |
|----------|------|------|----------|
| Fixtures | Fast, deterministic | Maintenance | Unit tests |
| Factories | Flexible, readable | Learning curve | Integration tests |
| Snapshots | Real data | Privacy, size | Edge cases |
| Mocks | Isolated, fast | May miss bugs | External services |

### Factory Pattern

```typescript
// factories/user.ts
import { faker } from '@faker-js/faker'

export const userFactory = {
  build: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    createdAt: faker.date.past(),
    ...overrides,
  }),

  buildList: (count: number, overrides = {}) =>
    Array.from({ length: count }, () => userFactory.build(overrides)),
}

// Usage
const user = userFactory.build({ name: 'John Doe' })
const users = userFactory.buildList(10)
```

```python
# Python with factory_boy
from factory import Factory, Faker, LazyAttribute
from myapp.models import User

class UserFactory(Factory):
    class Meta:
        model = User

    id = Faker('uuid4')
    name = Faker('name')
    email = LazyAttribute(lambda o: f"{o.name.lower().replace(' ', '.')}@test.com")

# Usage
user = UserFactory()
users = UserFactory.create_batch(10)
```

### Database Seeding

```typescript
// seeds/test-data.ts
export async function seedTestData(db: Database) {
  await db.transaction(async (tx) => {
    const users = await tx.insert(usersTable).values([
      { name: 'Alice', email: 'alice@test.com' },
      { name: 'Bob', email: 'bob@test.com' },
    ]).returning()

    await tx.insert(ordersTable).values([
      { userId: users[0].id, total: 100 },
      { userId: users[1].id, total: 200 },
    ])
  })
}
```

---

## Flaky Test Management

### Identifying Flaky Tests

```yaml
# Run tests multiple times to detect flakiness
- run: |
    for i in {1..5}; do
      npm test || echo "Run $i failed"
    done
```

### Handling Strategies

```typescript
// Retry mechanism
test.describe('Flaky API tests', () => {
  test.describe.configure({ retries: 2 })

  test('network-dependent test', async () => {
    // test implementation
  })
})
```

```python
# pytest-rerunfailures
# pytest --reruns 3 --reruns-delay 1

@pytest.mark.flaky(reruns=3, reruns_delay=1)
def test_network_call():
    pass
```

### Root Causes & Fixes

| Cause | Symptoms | Fix |
|-------|----------|-----|
| Race conditions | Intermittent failures | Add proper waits, locks |
| Shared state | Order-dependent failures | Isolate test data |
| Time-dependent | Fails at midnight/DST | Mock time, use relative dates |
| Network issues | Timeout failures | Mock external services |
| Resource leaks | Progressive slowdown | Proper cleanup in teardown |

---

## Test Metrics

### Key Metrics Dashboard

```
┌─────────────────────────────────────────────────────────┐
│               TEST METRICS DASHBOARD                    │
│                                                         │
│  Coverage Metrics                                       │
│  ├── Line coverage: 82% ████████░░ Target: 80%        │
│  ├── Branch coverage: 75% ███████░░░ Target: 75%      │
│  └── Mutation score: 68% ██████░░░░ Target: 70%       │
│                                                         │
│  Reliability Metrics                                   │
│  ├── Test pass rate: 98.5%                            │
│  ├── Flaky test rate: 1.2%                            │
│  └── False positive rate: 0.3%                        │
│                                                         │
│  Performance Metrics                                   │
│  ├── Unit test suite: 45s                             │
│  ├── Integration tests: 3m 20s                        │
│  └── E2E tests: 12m 15s                               │
│                                                         │
│  Quality Metrics                                       │
│  ├── Defect escape rate: 2%                           │
│  ├── Test-to-code ratio: 1.2:1                        │
│  └── Mean time to detect: 15 min                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Tracking in CI

```yaml
# Store test metrics
- name: Generate metrics
  run: |
    echo "coverage=$(npm test -- --coverage --json | jq .total.lines.pct)" >> $GITHUB_OUTPUT
    echo "test_count=$(npm test -- --json | jq .numTotalTests)" >> $GITHUB_OUTPUT
    echo "duration=$(npm test -- --json | jq .testResults[].perfStats.runtime)" >> $GITHUB_OUTPUT

- name: Report to metrics service
  run: |
    curl -X POST https://metrics.example.com/api/tests \
      -d '{"coverage": ${{ steps.metrics.outputs.coverage }}}'
```
