# Backend & API Testing Guide

## Table of Contents
1. [API Testing Strategy](#api-testing-strategy)
2. [Python Testing](#python-testing)
3. [Node.js Testing](#nodejs-testing)
4. [Go Testing](#go-testing)
5. [Java Testing](#java-testing)
6. [Database Testing](#database-testing)
7. [Contract Testing](#contract-testing)
8. [Performance Testing](#performance-testing)

---

## API Testing Strategy

### Testing Levels

```
┌─────────────────────────────────────────────────────────┐
│               BACKEND TESTING PYRAMID                   │
│                                                         │
│                    ┌─────────┐                         │
│                    │  E2E    │ ◄── 3-10 tests          │
│                    │  Live   │    Real infrastructure  │
│                   ─┴─────────┴─                        │
│                 ┌───────────────┐                      │
│                 │  Component    │ ◄── Many             │
│                 │  Integration  │    Mocked deps       │
│                ─┴───────────────┴─                     │
│              ┌───────────────────┐                     │
│              │      Unit         │ ◄── Most            │
│              │  Pure functions   │    No I/O           │
│             ─┴───────────────────┴─                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Types of API Tests

| Type | Focus | Speed | Dependencies |
|------|-------|-------|--------------|
| Unit | Business logic | Fast | None |
| Integration | API endpoints | Medium | Mocked/Test DB |
| Contract | API specification | Fast | None |
| E2E | Full system | Slow | Real services |
| Performance | Latency/throughput | Varies | Real services |

---

## Python Testing

### pytest Configuration

```python
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
addopts = "-v --cov=src --cov-report=html"
markers = [
    "slow: marks tests as slow",
    "integration: marks tests as integration tests",
]

# conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture(scope="session")
def db_engine():
    engine = create_engine("sqlite:///:memory:")
    yield engine
    engine.dispose()

@pytest.fixture
def db_session(db_engine):
    Session = sessionmaker(bind=db_engine)
    session = Session()
    yield session
    session.rollback()
    session.close()
```

### Unit Test

```python
# tests/test_services.py
import pytest
from src.services import calculate_discount, UserService

class TestCalculateDiscount:
    def test_percentage_discount(self):
        result = calculate_discount(100, percentage=10)
        assert result == 90

    def test_zero_price(self):
        result = calculate_discount(0, percentage=50)
        assert result == 0

    @pytest.mark.parametrize("price,percentage,expected", [
        (100, 10, 90),
        (200, 25, 150),
        (50, 100, 0),
    ])
    def test_various_discounts(self, price, percentage, expected):
        assert calculate_discount(price, percentage=percentage) == expected
```

### FastAPI Integration Test

```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport
from src.main import app

# Sync client
@pytest.fixture
def client():
    return TestClient(app)

def test_get_users(client):
    response = client.get("/api/users")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# Async client
@pytest.fixture
async def async_client():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        yield client

@pytest.mark.asyncio
async def test_create_user(async_client):
    response = await async_client.post(
        "/api/users",
        json={"name": "John", "email": "john@example.com"}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "John"
```

### Mocking with pytest-mock

```python
from unittest.mock import AsyncMock

def test_send_email(mocker):
    mock_smtp = mocker.patch("src.services.smtp_client")
    mock_smtp.send.return_value = True

    result = send_welcome_email("user@example.com")

    assert result is True
    mock_smtp.send.assert_called_once()

@pytest.mark.asyncio
async def test_fetch_external_api(mocker):
    mock_response = AsyncMock()
    mock_response.json.return_value = {"data": "test"}

    mocker.patch("httpx.AsyncClient.get", return_value=mock_response)

    result = await fetch_data()
    assert result == {"data": "test"}
```

---

## Node.js Testing

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80 },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
}
```

### Unit Test

```typescript
// tests/services/user.test.ts
import { UserService } from '@/services/user'
import { mockDeep, mockReset } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'

const mockPrisma = mockDeep<PrismaClient>()

describe('UserService', () => {
  let service: UserService

  beforeEach(() => {
    mockReset(mockPrisma)
    service = new UserService(mockPrisma)
  })

  describe('findById', () => {
    it('returns user when found', async () => {
      const mockUser = { id: '1', name: 'John', email: 'john@test.com' }
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await service.findById('1')

      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      })
    })

    it('returns null when not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await service.findById('999')

      expect(result).toBeNull()
    })
  })
})
```

### Supertest Integration

```typescript
// tests/api/users.test.ts
import request from 'supertest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'

describe('POST /api/users', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  it('creates user with valid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'John', email: 'john@test.com' })
      .expect(201)

    expect(response.body).toMatchObject({
      name: 'John',
      email: 'john@test.com',
    })
    expect(response.body.id).toBeDefined()
  })

  it('returns 400 for invalid email', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'John', email: 'invalid' })
      .expect(400)

    expect(response.body.error).toContain('email')
  })
})
```

### JWT Authentication Testing

```typescript
import jwt from 'jsonwebtoken'
import request from 'supertest'

const generateTestToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' })
}

describe('Protected Routes', () => {
  it('allows access with valid token', async () => {
    const token = generateTestToken('user-123')

    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })

  it('rejects invalid token', async () => {
    await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401)
  })
})
```

---

## Go Testing

### Table-Driven Tests

```go
// user_test.go
package user

import (
    "testing"
)

func TestValidateEmail(t *testing.T) {
    tests := []struct {
        name    string
        email   string
        wantErr bool
    }{
        {"valid email", "user@example.com", false},
        {"valid with subdomain", "user@mail.example.com", false},
        {"missing @", "userexample.com", true},
        {"missing domain", "user@", true},
        {"empty string", "", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateEmail(tt.email)
            if (err != nil) != tt.wantErr {
                t.Errorf("ValidateEmail(%q) error = %v, wantErr %v",
                    tt.email, err, tt.wantErr)
            }
        })
    }
}
```

### HTTP Handler Test

```go
// handlers_test.go
package handlers

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
)

func TestCreateUser(t *testing.T) {
    handler := NewUserHandler(mockDB)

    body := map[string]string{"name": "John", "email": "john@test.com"}
    jsonBody, _ := json.Marshal(body)

    req := httptest.NewRequest(http.MethodPost, "/users", bytes.NewBuffer(jsonBody))
    req.Header.Set("Content-Type", "application/json")

    rec := httptest.NewRecorder()
    handler.Create(rec, req)

    if rec.Code != http.StatusCreated {
        t.Errorf("expected status 201, got %d", rec.Code)
    }

    var response map[string]interface{}
    json.NewDecoder(rec.Body).Decode(&response)

    if response["name"] != "John" {
        t.Errorf("expected name John, got %s", response["name"])
    }
}
```

### Mocking with testify

```go
import (
    "testing"
    "github.com/stretchr/testify/mock"
    "github.com/stretchr/testify/assert"
)

type MockUserRepo struct {
    mock.Mock
}

func (m *MockUserRepo) FindByID(id string) (*User, error) {
    args := m.Called(id)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*User), args.Error(1)
}

func TestUserService_GetUser(t *testing.T) {
    mockRepo := new(MockUserRepo)
    service := NewUserService(mockRepo)

    expectedUser := &User{ID: "1", Name: "John"}
    mockRepo.On("FindByID", "1").Return(expectedUser, nil)

    user, err := service.GetUser("1")

    assert.NoError(t, err)
    assert.Equal(t, "John", user.Name)
    mockRepo.AssertExpectations(t)
}
```

---

## Java Testing

### JUnit 5 + Spring Boot

```java
// UserServiceTest.java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("findById returns user when exists")
    void findById_ReturnsUser_WhenExists() {
        // Arrange
        User expected = new User(1L, "John", "john@test.com");
        when(userRepository.findById(1L)).thenReturn(Optional.of(expected));

        // Act
        User result = userService.findById(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("John");
        verify(userRepository).findById(1L);
    }

    @ParameterizedTest
    @CsvSource({
        "john@test.com, true",
        "invalid-email, false",
        "'', false"
    })
    void validateEmail_ReturnsExpected(String email, boolean expected) {
        assertThat(userService.isValidEmail(email)).isEqualTo(expected);
    }
}
```

### REST Assured Integration Test

```java
// UserApiTest.java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class UserApiTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setup() {
        RestAssured.port = port;
    }

    @Test
    void createUser_ReturnsCreated() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "name": "John",
                    "email": "john@test.com"
                }
                """)
        .when()
            .post("/api/users")
        .then()
            .statusCode(201)
            .body("name", equalTo("John"))
            .body("id", notNullValue());
    }

    @Test
    void getUser_ReturnsNotFound_WhenNotExists() {
        given()
        .when()
            .get("/api/users/999")
        .then()
            .statusCode(404);
    }
}
```

---

## Database Testing

### Test Containers

```python
# Python with testcontainers
import pytest
from testcontainers.postgres import PostgresContainer

@pytest.fixture(scope="session")
def postgres():
    with PostgresContainer("postgres:15") as postgres:
        yield postgres

@pytest.fixture
def db_url(postgres):
    return postgres.get_connection_url()
```

```typescript
// Node.js with testcontainers
import { PostgreSqlContainer } from '@testcontainers/postgresql'

let container: PostgreSqlContainer

beforeAll(async () => {
  container = await new PostgreSqlContainer().start()
  process.env.DATABASE_URL = container.getConnectionUri()
})

afterAll(async () => {
  await container.stop()
})
```

### Database Seeding

```python
@pytest.fixture
def seed_users(db_session):
    users = [
        User(name="Alice", email="alice@test.com"),
        User(name="Bob", email="bob@test.com"),
    ]
    db_session.add_all(users)
    db_session.commit()
    return users
```

---

## Contract Testing

### OpenAPI Validation

```python
# Python with schemathesis
import schemathesis

schema = schemathesis.from_path("openapi.yaml")

@schema.parametrize()
def test_api_conforms_to_spec(case):
    response = case.call()
    case.validate_response(response)
```

### Pact Consumer Test

```typescript
// consumer.pact.test.ts
import { PactV3 } from '@pact-foundation/pact'

const provider = new PactV3({
  consumer: 'UserService',
  provider: 'AuthService',
})

describe('User API', () => {
  it('gets user by id', async () => {
    await provider
      .given('user exists')
      .uponReceiving('a request for user')
      .withRequest({ method: 'GET', path: '/users/1' })
      .willRespondWith({
        status: 200,
        body: { id: '1', name: 'John' },
      })

    await provider.executeTest(async (mockServer) => {
      const response = await fetch(`${mockServer.url}/users/1`)
      expect(response.status).toBe(200)
    })
  })
})
```

---

## Performance Testing

### k6 Load Test

```javascript
// load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up
    { duration: '1m', target: 20 },   // Stay
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.01'],    // <1% errors
  },
}

export default function () {
  const response = http.get('http://localhost:3000/api/users')

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  })

  sleep(1)
}
```

### Benchmark Test (Go)

```go
func BenchmarkUserService_FindById(b *testing.B) {
    service := setupTestService()

    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        service.FindById("user-123")
    }
}
```
