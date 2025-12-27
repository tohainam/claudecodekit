# API Design

Comprehensive guide for designing APIs: REST, GraphQL, and gRPC.

## Table of Contents
1. [API Design Principles](#api-design-principles)
2. [REST API Design](#rest-api-design)
3. [GraphQL Design](#graphql-design)
4. [gRPC Design](#grpc-design)
5. [Choosing the Right API Style](#choosing-the-right-api-style)
6. [Cross-Cutting Concerns](#cross-cutting-concerns)

---

## API Design Principles

### Universal Principles

| Principle | Description |
|-----------|-------------|
| **Consistency** | Same patterns throughout the API |
| **Predictability** | Behavior matches expectations |
| **Discoverability** | Easy to understand and explore |
| **Backwards Compatibility** | Don't break existing clients |
| **Security by Default** | Secure without extra configuration |

### API-First Design
Design the API contract before implementation:
1. Define resource models
2. Design endpoints/operations
3. Document with OpenAPI/GraphQL schema
4. Get stakeholder feedback
5. Implement

---

## REST API Design

### Resource Naming

```
# Use nouns, not verbs
GET /users          ✓ (not /getUsers)
POST /orders        ✓ (not /createOrder)

# Use plural nouns
GET /users          ✓ (not /user)
GET /users/123      ✓

# Hierarchical resources
GET /users/123/orders           # User's orders
GET /orders/456/items           # Order's items
GET /users/123/orders/456/items # Avoid deep nesting (max 2-3 levels)
```

### HTTP Methods

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Read resource | Yes | Yes |
| POST | Create resource | No | No |
| PUT | Replace resource | Yes | No |
| PATCH | Partial update | No | No |
| DELETE | Remove resource | Yes | No |

### Status Codes

| Range | Category | Common Codes |
|-------|----------|--------------|
| 2xx | Success | 200 OK, 201 Created, 204 No Content |
| 3xx | Redirect | 301 Moved, 304 Not Modified |
| 4xx | Client Error | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable |
| 5xx | Server Error | 500 Internal, 502 Bad Gateway, 503 Unavailable |

### Response Format

```json
// Success (single resource)
{
  "data": {
    "id": "123",
    "type": "user",
    "attributes": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}

// Success (collection)
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20
  },
  "links": {
    "self": "/users?page=1",
    "next": "/users?page=2",
    "last": "/users?page=5"
  }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {"field": "email", "message": "Invalid email format"}
    ]
  }
}
```

### Pagination

```
# Offset-based (simple but slow for large datasets)
GET /users?page=2&per_page=20

# Cursor-based (efficient for large datasets)
GET /users?cursor=abc123&limit=20
```

### Filtering, Sorting, Search

```
# Filtering
GET /users?status=active&role=admin

# Sorting
GET /users?sort=created_at:desc,name:asc

# Search
GET /users?q=john

# Field selection
GET /users?fields=id,name,email
```

### Versioning Strategies

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| URL Path | `/v1/users` | Clear, easy to route | URL changes |
| Header | `Accept: application/vnd.api.v1+json` | Clean URLs | Hidden version |
| Query Param | `/users?version=1` | Easy to add | Can be forgotten |

**Recommendation**: URL path for simplicity, header for purity.

---

## GraphQL Design

### Schema Design Best Practices

```graphql
# Use clear, descriptive names
type User {
  id: ID!
  email: String!
  displayName: String!       # Not 'name' (ambiguous)
  createdAt: DateTime!
  orders(first: Int, after: String): OrderConnection!
}

# Use connections for pagination
type OrderConnection {
  edges: [OrderEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type OrderEdge {
  node: Order!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### Mutation Design

```graphql
# Input types for mutations
input CreateUserInput {
  email: String!
  displayName: String!
  password: String!
}

# Payload types for responses
type CreateUserPayload {
  user: User
  errors: [UserError!]!
}

type UserError {
  field: String!
  message: String!
}

# Mutation definition
type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
}
```

### Query Complexity & Performance

```graphql
# Limit query depth and complexity
# Bad: Unbounded depth
query {
  users {
    friends {
      friends {
        friends { ... }  # Infinitely deep
      }
    }
  }
}

# Good: Use connections with limits
query {
  users(first: 10) {
    edges {
      node {
        friends(first: 10) {
          edges {
            node { id, name }
          }
        }
      }
    }
  }
}
```

### N+1 Query Prevention
Use DataLoader pattern:
```python
# Without DataLoader: N+1 queries
for user in users:
    user.orders = fetch_orders(user.id)  # 1 query per user

# With DataLoader: 2 queries total
user_ids = [user.id for user in users]
orders = batch_fetch_orders(user_ids)  # 1 query for all orders
```

---

## gRPC Design

### Protocol Buffers

```protobuf
syntax = "proto3";

package myservice.v1;

// Service definition
service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
  rpc CreateUser(CreateUserRequest) returns (User);
  rpc UpdateUser(UpdateUserRequest) returns (User);
  rpc DeleteUser(DeleteUserRequest) returns (google.protobuf.Empty);

  // Streaming
  rpc WatchUsers(WatchUsersRequest) returns (stream User);
}

message User {
  string id = 1;
  string email = 2;
  string display_name = 3;
  google.protobuf.Timestamp created_at = 4;
}

message GetUserRequest {
  string id = 1;
}

message ListUsersRequest {
  int32 page_size = 1;
  string page_token = 2;
}

message ListUsersResponse {
  repeated User users = 1;
  string next_page_token = 2;
}
```

### gRPC Patterns

| Pattern | Use Case |
|---------|----------|
| **Unary** | Simple request-response |
| **Server Streaming** | Server pushes multiple responses |
| **Client Streaming** | Client sends multiple requests |
| **Bidirectional** | Real-time two-way communication |

---

## Choosing the Right API Style

```
                    ┌─────────────────────────┐
                    │   What's your need?     │
                    └───────────┬─────────────┘
                                │
    ┌───────────────────────────┼───────────────────────────┐
    ▼                           ▼                           ▼
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│  Simple     │          │  Flexible   │          │  High       │
│  CRUD       │          │  Queries    │          │  Performance│
└──────┬──────┘          └──────┬──────┘          └──────┬──────┘
       │                        │                        │
       ▼                        ▼                        ▼
   ┌───────┐              ┌─────────┐              ┌───────┐
   │ REST  │              │ GraphQL │              │ gRPC  │
   └───────┘              └─────────┘              └───────┘
```

### Comparison Matrix

| Aspect | REST | GraphQL | gRPC |
|--------|------|---------|------|
| **Learning Curve** | Low | Medium | High |
| **Flexibility** | Low | High | Low |
| **Performance** | Good | Variable | Excellent |
| **Caching** | Built-in (HTTP) | Complex | Manual |
| **Real-time** | WebSockets/SSE | Subscriptions | Native streaming |
| **Browser Support** | Native | Library needed | Needs proxy |
| **Use Case** | Public APIs | Flexible frontends | Internal services |

### Hybrid Approach
Common in 2025:
```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│  (Web, Mobile, Third-party)                                 │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY                              │
│  (REST/GraphQL for external clients)                        │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  INTERNAL SERVICES                           │
│  (gRPC for high-performance inter-service communication)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Cross-Cutting Concerns

### Authentication

| Method | Use Case |
|--------|----------|
| **API Keys** | Simple, server-to-server |
| **JWT** | Stateless, scalable |
| **OAuth 2.0** | Third-party access |
| **mTLS** | High security, internal |

### Rate Limiting

```http
# Response headers
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
Retry-After: 60
```

Strategies:
- **Fixed Window**: Simple but has burst issues
- **Sliding Window**: Smoother but more complex
- **Token Bucket**: Best for bursts
- **Leaky Bucket**: Consistent rate

### Idempotency

```http
# Client provides idempotency key
POST /orders
Idempotency-Key: abc123

# Server stores result, returns same result on retry
```

### HATEOAS (REST)

```json
{
  "data": {
    "id": "123",
    "status": "pending"
  },
  "_links": {
    "self": { "href": "/orders/123" },
    "cancel": { "href": "/orders/123/cancel", "method": "POST" },
    "pay": { "href": "/orders/123/pay", "method": "POST" }
  }
}
```

### Documentation

| Tool | For |
|------|-----|
| **OpenAPI/Swagger** | REST APIs |
| **GraphQL Playground** | GraphQL |
| **Buf** | Protocol Buffers |
| **Postman** | All types |
