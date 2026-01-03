# Integration Test Examples

## API Testing

### REST API with Supertest

```typescript
import request from "supertest";
import { app } from "../app";
import { db } from "../database";

describe("Users API", () => {
  beforeEach(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(async () => {
    await db.migrate.rollback();
  });

  describe("GET /api/users", () => {
    it("should return all users", async () => {
      const response = await request(app)
        .get("/api/users")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
      });
    });

    it("should filter by role", async () => {
      const response = await request(app)
        .get("/api/users?role=admin")
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].role).toBe("admin");
    });
  });

  describe("POST /api/users", () => {
    it("should create new user", async () => {
      const newUser = {
        name: "John Doe",
        email: "john@example.com",
        password: "securepassword123",
      };

      const response = await request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: newUser.name,
        email: newUser.email,
      });
      expect(response.body.password).toBeUndefined();

      // Verify in database
      const dbUser = await db("users").where({ email: newUser.email }).first();
      expect(dbUser).toBeTruthy();
    });

    it("should return 400 for invalid email", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({ name: "Test", email: "invalid", password: "test123" })
        .expect(400);

      expect(response.body.error).toContain("email");
    });

    it("should return 409 for duplicate email", async () => {
      const existingEmail = "existing@example.com";

      await request(app)
        .post("/api/users")
        .send({ name: "First", email: existingEmail, password: "test123" });

      const response = await request(app)
        .post("/api/users")
        .send({ name: "Second", email: existingEmail, password: "test456" })
        .expect(409);

      expect(response.body.error).toContain("exists");
    });
  });

  describe("with authentication", () => {
    let authToken: string;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({ email: "admin@example.com", password: "adminpass" });
      authToken = loginResponse.body.token;
    });

    it("should allow authenticated access", async () => {
      await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
    });

    it("should reject unauthenticated access", async () => {
      await request(app).get("/api/users/me").expect(401);
    });
  });
});
```

## Database Testing with TestContainers

### PostgreSQL

```typescript
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Pool } from "pg";

describe("UserRepository", () => {
  let container: PostgreSqlContainer;
  let pool: Pool;
  let repository: UserRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().withDatabase("testdb").start();

    pool = new Pool({
      connectionString: container.getConnectionUri(),
    });

    // Run migrations
    await runMigrations(pool);

    repository = new UserRepository(pool);
  }, 60000); // Container startup can take time

  afterAll(async () => {
    await pool.end();
    await container.stop();
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE users CASCADE");
  });

  it("should insert and retrieve user", async () => {
    const user = { name: "Alice", email: "alice@example.com" };

    const created = await repository.create(user);
    expect(created.id).toBeDefined();

    const retrieved = await repository.findById(created.id);
    expect(retrieved).toMatchObject(user);
  });

  it("should handle concurrent inserts", async () => {
    const users = Array.from({ length: 10 }, (_, i) => ({
      name: `User ${i}`,
      email: `user${i}@example.com`,
    }));

    await Promise.all(users.map((u) => repository.create(u)));

    const all = await repository.findAll();
    expect(all).toHaveLength(10);
  });
});
```

### MongoDB

```typescript
import { MongoDBContainer } from "@testcontainers/mongodb";
import { MongoClient } from "mongodb";

describe("OrderRepository", () => {
  let container: MongoDBContainer;
  let client: MongoClient;
  let repository: OrderRepository;

  beforeAll(async () => {
    container = await new MongoDBContainer("mongo:6").start();
    client = await MongoClient.connect(container.getConnectionString());
    repository = new OrderRepository(client.db("testdb"));
  }, 60000);

  afterAll(async () => {
    await client.close();
    await container.stop();
  });

  it("should store and retrieve order", async () => {
    const order = {
      customerId: "customer-1",
      items: [{ productId: "prod-1", quantity: 2 }],
      total: 99.99,
    };

    const id = await repository.create(order);
    const retrieved = await repository.findById(id);

    expect(retrieved).toMatchObject(order);
  });
});
```

## Component Integration Tests

### React Components with Testing Library

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { UserList } from "./UserList";

const server = setupServer(
  rest.get("/api/users", (req, res, ctx) => {
    return res(
      ctx.json([
        { id: "1", name: "Alice", email: "alice@example.com" },
        { id: "2", name: "Bob", email: "bob@example.com" },
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("UserList", () => {
  it("should display users from API", async () => {
    render(<UserList />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });

  it("should handle API error", async () => {
    server.use(
      rest.get("/api/users", (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it("should delete user on button click", async () => {
    const user = userEvent.setup();
    let deleteCallCount = 0;

    server.use(
      rest.delete("/api/users/:id", (req, res, ctx) => {
        deleteCallCount++;
        return res(ctx.status(204));
      })
    );

    render(<UserList />);

    await waitFor(() => screen.getByText("Alice"));

    await user.click(screen.getAllByRole("button", { name: /delete/i })[0]);

    await waitFor(() => {
      expect(deleteCallCount).toBe(1);
    });
  });
});
```

## Service Integration Tests

### With External Services (Mocked)

```typescript
import nock from "nock";
import { PaymentService } from "./payment.service";

describe("PaymentService", () => {
  const stripeApi = "https://api.stripe.com";

  afterEach(() => {
    nock.cleanAll();
  });

  it("should process payment successfully", async () => {
    nock(stripeApi).post("/v1/charges").reply(200, {
      id: "ch_123",
      amount: 5000,
      status: "succeeded",
    });

    const service = new PaymentService();
    const result = await service.charge({
      amount: 5000,
      currency: "usd",
      source: "tok_visa",
    });

    expect(result.status).toBe("succeeded");
    expect(result.chargeId).toBe("ch_123");
  });

  it("should handle card declined", async () => {
    nock(stripeApi)
      .post("/v1/charges")
      .reply(402, {
        error: {
          type: "card_error",
          code: "card_declined",
          message: "Your card was declined.",
        },
      });

    const service = new PaymentService();

    await expect(
      service.charge({ amount: 5000, currency: "usd", source: "tok_visa" })
    ).rejects.toThrow("card_declined");
  });

  it("should retry on network errors", async () => {
    let attempts = 0;

    nock(stripeApi)
      .post("/v1/charges")
      .times(2)
      .reply(() => {
        attempts++;
        if (attempts < 2) {
          return [500, { error: "Server error" }];
        }
        return [200, { id: "ch_123", status: "succeeded" }];
      });

    const service = new PaymentService({ maxRetries: 3 });
    const result = await service.charge({
      amount: 5000,
      currency: "usd",
      source: "tok_visa",
    });

    expect(result.status).toBe("succeeded");
    expect(attempts).toBe(2);
  });
});
```

## Contract Testing with Pact

### Consumer Side

```typescript
import { Pact } from "@pact-foundation/pact";
import { UserClient } from "./user-client";

const provider = new Pact({
  consumer: "Frontend",
  provider: "UserService",
  port: 1234,
});

describe("UserClient", () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());
  afterEach(() => provider.verify());

  it("should get user by id", async () => {
    await provider.addInteraction({
      state: "user with id 1 exists",
      uponReceiving: "a request to get user 1",
      withRequest: {
        method: "GET",
        path: "/users/1",
      },
      willRespondWith: {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          id: "1",
          name: "Alice",
          email: "alice@example.com",
        },
      },
    });

    const client = new UserClient(`http://localhost:${provider.opts.port}`);
    const user = await client.getUser("1");

    expect(user.name).toBe("Alice");
  });
});
```

## Best Practices

### Test Data Management

```typescript
// Use factories for test data
const createUser = (overrides = {}) => ({
  id: faker.datatype.uuid(),
  name: faker.name.fullName(),
  email: faker.internet.email(),
  createdAt: new Date(),
  ...overrides,
});

// Clean up after tests
afterEach(async () => {
  await db("users").del();
  await db("orders").del();
});

// Use transactions for isolation
beforeEach(async () => {
  await db.raw("BEGIN");
});

afterEach(async () => {
  await db.raw("ROLLBACK");
});
```

### Performance Considerations

```typescript
// Reuse expensive resources
let app: Express;
let db: Pool;

beforeAll(async () => {
  db = await createDatabasePool();
  app = createApp(db);
});

afterAll(async () => {
  await db.end();
});

// Parallelize independent tests
describe.concurrent("Independent features", () => {
  it.concurrent("feature A", async () => {});
  it.concurrent("feature B", async () => {});
});
```

### Checklist

- [ ] Tests use real dependencies where practical
- [ ] External services are mocked consistently
- [ ] Database state is isolated between tests
- [ ] Containers are reused where possible
- [ ] Tests clean up after themselves
- [ ] Timeouts are set appropriately
- [ ] Flaky tests are fixed or quarantined
