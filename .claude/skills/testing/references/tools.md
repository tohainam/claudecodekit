# Testing Tools Reference

## Table of Contents
1. [Unit Testing Frameworks](#unit-testing-frameworks)
2. [E2E Testing Tools](#e2e-testing-tools)
3. [Mocking Libraries](#mocking-libraries)
4. [Coverage Tools](#coverage-tools)
5. [Performance Testing](#performance-testing)
6. [API Testing](#api-testing)
7. [CI/CD Integration](#cicd-integration)

---

## Unit Testing Frameworks

### By Language

| Language | Primary Tool | Alternative | Notes |
|----------|-------------|-------------|-------|
| JavaScript/TS | Vitest | Jest | Vitest preferred for Vite projects |
| Python | pytest | unittest | pytest more feature-rich |
| Go | testing | testify | Native + testify for assertions |
| Java | JUnit 5 | TestNG | JUnit 5 is modern standard |
| Rust | cargo test | - | Built-in |
| C# | xUnit | NUnit, MSTest | xUnit most popular |
| Ruby | RSpec | Minitest | RSpec for BDD style |
| PHP | PHPUnit | Pest | Pest for modern syntax |
| Swift | XCTest | Quick/Nimble | Quick for BDD style |
| Kotlin | JUnit 5 | Kotest | Kotest for Kotlin-first |

### Quick Start Commands

```bash
# JavaScript/TypeScript with Vitest
npm install -D vitest
npx vitest

# Python with pytest
pip install pytest pytest-cov
pytest --cov=src

# Go
go test ./... -cover

# Java with Maven
mvn test

# Rust
cargo test

# Ruby with RSpec
bundle exec rspec
```

---

## E2E Testing Tools

### Web Testing

| Tool | Best For | Key Features |
|------|----------|--------------|
| Playwright | Modern web apps | Multi-browser, auto-wait, codegen |
| Cypress | Developer experience | Time travel, real-time reloads |
| Selenium | Legacy apps | Widest browser support |
| Puppeteer | Chrome-specific | Lightweight, fast |

### Playwright Quick Setup

```bash
npm init playwright@latest

# Run tests
npx playwright test

# Run with UI
npx playwright test --ui

# Generate tests
npx playwright codegen https://example.com

# Show report
npx playwright show-report
```

### Cypress Quick Setup

```bash
npm install -D cypress
npx cypress open

# Run headless
npx cypress run

# Run specific spec
npx cypress run --spec "cypress/e2e/login.cy.js"
```

---

## Mocking Libraries

### By Language

| Language | Library | Features |
|----------|---------|----------|
| JavaScript | jest-mock, vitest | Auto-mocking, spies |
| JavaScript | MSW | API mocking (Service Worker) |
| JavaScript | nock | HTTP mocking |
| Python | unittest.mock | Built-in, flexible |
| Python | pytest-mock | pytest integration |
| Python | responses | HTTP mocking |
| Go | testify/mock | Interface mocking |
| Go | gomock | Code generation |
| Java | Mockito | Annotations, verification |
| Java | WireMock | HTTP API mocking |

### MSW (Mock Service Worker)

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'John Doe',
    })
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(body, { status: 201 })
  }),
]

// mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

// test setup
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Mockito (Java)

```java
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository repository;

    @InjectMocks
    private UserService service;

    @Test
    void findUser() {
        when(repository.findById("1"))
            .thenReturn(Optional.of(new User("1", "John")));

        User user = service.findById("1");

        assertThat(user.getName()).isEqualTo("John");
        verify(repository, times(1)).findById("1");
    }
}
```

---

## Coverage Tools

### By Language

| Language | Tool | Integration |
|----------|------|-------------|
| JavaScript | c8, istanbul | Vitest, Jest built-in |
| Python | coverage.py | pytest-cov |
| Go | go test -cover | Built-in |
| Java | JaCoCo | Maven/Gradle plugin |
| C# | Coverlet | .NET CLI |

### Coverage Reports

```bash
# JavaScript with Vitest
npx vitest --coverage

# Python
pytest --cov=src --cov-report=html

# Go
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Java with Maven
mvn jacoco:report
```

### Codecov/Coveralls Integration

```yaml
# .github/workflows/coverage.yml
- name: Upload coverage
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info
    fail_ci_if_error: true
```

---

## Performance Testing

### Load Testing Tools

| Tool | Type | Language |
|------|------|----------|
| k6 | Load testing | JavaScript |
| Locust | Load testing | Python |
| Artillery | Load testing | YAML/JS |
| JMeter | Load testing | Java/GUI |
| wrk | HTTP benchmarking | C |
| hey | HTTP benchmarking | Go |

### k6 Example

```javascript
// load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 100,  // Virtual users
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
}

export default function () {
  const res = http.get('http://localhost:3000/api/users')

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  })

  sleep(1)
}
```

```bash
# Run k6
k6 run load-test.js

# With more options
k6 run --vus 50 --duration 1m load-test.js
```

### Locust Example

```python
# locustfile.py
from locust import HttpUser, task, between

class WebUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def get_users(self):
        self.client.get("/api/users")

    @task(1)
    def create_user(self):
        self.client.post("/api/users", json={
            "name": "Test User",
            "email": "test@example.com"
        })
```

```bash
# Run Locust
locust -f locustfile.py --host http://localhost:3000
```

---

## API Testing

### Tools Comparison

| Tool | Use Case | Format |
|------|----------|--------|
| Postman | Manual + automation | Collection JSON |
| Insomnia | Manual + automation | YAML/JSON |
| Bruno | Git-friendly | Bru format |
| Hoppscotch | Open source | JSON |
| REST Client (VS Code) | In-editor | .http files |

### REST Client (.http files)

```http
### Get all users
GET http://localhost:3000/api/users
Authorization: Bearer {{token}}

### Create user
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}

### Update user
PUT http://localhost:3000/api/users/1
Content-Type: application/json

{
  "name": "Jane Doe"
}
```

### Contract Testing

```bash
# Pact
npm install @pact-foundation/pact

# Schemathesis (OpenAPI)
pip install schemathesis
schemathesis run openapi.yaml --base-url http://localhost:3000

# Dredd (API Blueprint)
npm install -g dredd
dredd api.apib http://localhost:3000
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run test:e2e

      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
```

### GitLab CI

```yaml
stages:
  - test

unit-tests:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm test -- --coverage
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

e2e-tests:
  stage: test
  image: mcr.microsoft.com/playwright:latest
  script:
    - npm ci
    - npx playwright install
    - npm run test:e2e
  artifacts:
    when: always
    paths:
      - playwright-report/
```

### CircleCI

```yaml
version: 2.1

jobs:
  test:
    docker:
      - image: cimg/node:20.0
      - image: cimg/postgres:15.0
    steps:
      - checkout
      - restore_cache:
          keys:
            - npm-deps-{{ checksum "package-lock.json" }}
      - run: npm ci
      - save_cache:
          paths:
            - node_modules
          key: npm-deps-{{ checksum "package-lock.json" }}
      - run: npm test
      - store_test_results:
          path: test-results

workflows:
  main:
    jobs:
      - test
```

---

## Quick Reference Commands

```bash
# Run tests
npm test                    # Node.js
pytest                      # Python
go test ./...              # Go
mvn test                   # Java Maven
gradle test                # Java Gradle
cargo test                 # Rust
bundle exec rspec          # Ruby

# Run with coverage
npm test -- --coverage
pytest --cov=src
go test -cover ./...

# Run specific test
npm test -- path/to/file.test.ts
pytest path/to/test.py::test_name
go test -run TestName ./...

# Watch mode
npm test -- --watch
pytest-watch
cargo watch -x test

# Debug mode
npm test -- --inspect-brk
pytest --pdb
dlv test ./...
```
