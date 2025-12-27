# API Documentation Patterns

## Table of Contents
1. [OpenAPI 3.x (REST APIs)](#openapi-3x-rest-apis)
2. [AsyncAPI 3.0 (Event-Driven APIs)](#asyncapi-30-event-driven-apis)
3. [GraphQL Documentation](#graphql-documentation)
4. [gRPC Documentation](#grpc-documentation)
5. [SDK/Client Library Documentation](#sdkclient-library-documentation)
6. [API Versioning Documentation](#api-versioning-documentation)
7. [Authentication Documentation](#authentication-documentation)
8. [Error Handling Documentation](#error-handling-documentation)

---

## OpenAPI 3.x (REST APIs)

### Minimal OpenAPI Spec
```yaml
openapi: 3.1.0
info:
  title: My API
  version: 1.0.0
  description: Brief API description

servers:
  - url: https://api.example.com/v1
    description: Production

paths:
  /users:
    get:
      summary: List users
      operationId: listUsers
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'

components:
  schemas:
    User:
      type: object
      required: [id, email]
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
```

### Comprehensive OpenAPI Spec
```yaml
openapi: 3.1.0
info:
  title: E-Commerce API
  version: 2.0.0
  description: |
    RESTful API for e-commerce operations.

    ## Authentication
    All endpoints require Bearer token authentication.

    ## Rate Limiting
    - 100 requests/minute for standard tier
    - 1000 requests/minute for premium tier
  contact:
    name: API Support
    email: api@example.com
    url: https://developer.example.com/support
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.example.com/v2
    description: Production
  - url: https://staging-api.example.com/v2
    description: Staging
  - url: http://localhost:3000/v2
    description: Local development

tags:
  - name: Products
    description: Product catalog operations
  - name: Orders
    description: Order management
  - name: Users
    description: User account operations

paths:
  /products:
    get:
      tags: [Products]
      summary: List products
      description: Retrieve paginated list of products with filtering options
      operationId: listProducts
      parameters:
        - name: category
          in: query
          schema:
            type: string
          description: Filter by category slug
        - name: minPrice
          in: query
          schema:
            type: number
            minimum: 0
          description: Minimum price filter
        - name: maxPrice
          in: query
          schema:
            type: number
          description: Maximum price filter
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/LimitParam'
      responses:
        '200':
          description: Paginated product list
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductList'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

    post:
      tags: [Products]
      summary: Create product
      description: Create a new product (admin only)
      operationId: createProduct
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProductCreate'
            examples:
              simple:
                summary: Simple product
                value:
                  name: "T-Shirt"
                  price: 29.99
                  categoryId: "cat_123"
              withVariants:
                summary: Product with variants
                value:
                  name: "T-Shirt"
                  price: 29.99
                  categoryId: "cat_123"
                  variants:
                    - size: "S"
                      sku: "TSHIRT-S"
                    - size: "M"
                      sku: "TSHIRT-M"
      responses:
        '201':
          description: Product created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

  /products/{productId}:
    parameters:
      - name: productId
        in: path
        required: true
        schema:
          type: string
        description: Product identifier

    get:
      tags: [Products]
      summary: Get product
      operationId: getProduct
      responses:
        '200':
          description: Product details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '404':
          $ref: '#/components/responses/NotFound'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtained from /auth/login

  parameters:
    PageParam:
      name: page
      in: query
      schema:
        type: integer
        minimum: 1
        default: 1
      description: Page number for pagination

    LimitParam:
      name: limit
      in: query
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20
      description: Items per page

  schemas:
    Product:
      type: object
      required: [id, name, price, createdAt]
      properties:
        id:
          type: string
          example: "prod_abc123"
        name:
          type: string
          example: "Premium T-Shirt"
        description:
          type: string
          nullable: true
        price:
          type: number
          format: float
          minimum: 0
          example: 29.99
        category:
          $ref: '#/components/schemas/Category'
        variants:
          type: array
          items:
            $ref: '#/components/schemas/ProductVariant'
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    ProductCreate:
      type: object
      required: [name, price, categoryId]
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 200
        description:
          type: string
          maxLength: 5000
        price:
          type: number
          minimum: 0
        categoryId:
          type: string
        variants:
          type: array
          items:
            type: object
            properties:
              size:
                type: string
              sku:
                type: string

    ProductList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Product'
        pagination:
          $ref: '#/components/schemas/Pagination'

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer

    Error:
      type: object
      required: [code, message]
      properties:
        code:
          type: string
          description: Machine-readable error code
        message:
          type: string
          description: Human-readable error message
        details:
          type: object
          additionalProperties: true
          description: Additional error context

  responses:
    BadRequest:
      description: Invalid request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "VALIDATION_ERROR"
            message: "Invalid request body"
            details:
              field: "price"
              issue: "must be a positive number"

    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "UNAUTHORIZED"
            message: "Authentication required"

    Forbidden:
      description: Insufficient permissions
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "FORBIDDEN"
            message: "Insufficient permissions"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "NOT_FOUND"
            message: "Product not found"

security:
  - bearerAuth: []
```

---

## AsyncAPI 3.0 (Event-Driven APIs)

### AsyncAPI Spec for Event-Driven Architecture
```yaml
asyncapi: 3.0.0
info:
  title: Order Events API
  version: 1.0.0
  description: |
    Real-time order events for e-commerce platform.

    ## Channels
    - `orders.created` - New order placed
    - `orders.updated` - Order status changed
    - `orders.cancelled` - Order cancelled
  contact:
    name: Events Team
    email: events@example.com

servers:
  production:
    host: kafka.example.com:9092
    protocol: kafka
    description: Production Kafka cluster
    security:
      - $ref: '#/components/securitySchemes/sasl'

  development:
    host: localhost:9092
    protocol: kafka
    description: Local development

defaultContentType: application/json

channels:
  orderCreated:
    address: orders.created
    messages:
      orderCreatedMessage:
        $ref: '#/components/messages/OrderCreated'
    description: Published when a new order is placed

  orderUpdated:
    address: orders.updated
    messages:
      orderUpdatedMessage:
        $ref: '#/components/messages/OrderUpdated'
    description: Published when order status changes

  orderCancelled:
    address: orders.cancelled
    messages:
      orderCancelledMessage:
        $ref: '#/components/messages/OrderCancelled'
    description: Published when an order is cancelled

operations:
  publishOrderCreated:
    action: send
    channel:
      $ref: '#/channels/orderCreated'
    summary: Publish order created event
    description: Sent by Order Service when a new order is placed

  consumeOrderCreated:
    action: receive
    channel:
      $ref: '#/channels/orderCreated'
    summary: Consume order created events
    description: Subscribe to new order notifications

components:
  messages:
    OrderCreated:
      name: OrderCreated
      title: Order Created Event
      summary: Event published when a new order is created
      contentType: application/json
      headers:
        $ref: '#/components/schemas/EventHeaders'
      payload:
        $ref: '#/components/schemas/OrderCreatedPayload'
      examples:
        - name: standardOrder
          summary: Standard order creation
          headers:
            eventId: "evt_123"
            eventType: "order.created"
            timestamp: "2025-01-15T10:30:00Z"
          payload:
            orderId: "ord_abc123"
            customerId: "cust_456"
            items:
              - productId: "prod_789"
                quantity: 2
                price: 29.99
            total: 59.98
            status: "pending"

    OrderUpdated:
      name: OrderUpdated
      title: Order Updated Event
      contentType: application/json
      headers:
        $ref: '#/components/schemas/EventHeaders'
      payload:
        $ref: '#/components/schemas/OrderUpdatedPayload'

    OrderCancelled:
      name: OrderCancelled
      title: Order Cancelled Event
      contentType: application/json
      headers:
        $ref: '#/components/schemas/EventHeaders'
      payload:
        $ref: '#/components/schemas/OrderCancelledPayload'

  schemas:
    EventHeaders:
      type: object
      required: [eventId, eventType, timestamp]
      properties:
        eventId:
          type: string
          description: Unique event identifier
        eventType:
          type: string
          description: Event type identifier
        timestamp:
          type: string
          format: date-time
          description: Event timestamp
        correlationId:
          type: string
          description: Request correlation ID for tracing

    OrderCreatedPayload:
      type: object
      required: [orderId, customerId, items, total, status]
      properties:
        orderId:
          type: string
        customerId:
          type: string
        items:
          type: array
          items:
            $ref: '#/components/schemas/OrderItem'
        total:
          type: number
        status:
          type: string
          enum: [pending, confirmed, processing]

    OrderItem:
      type: object
      properties:
        productId:
          type: string
        quantity:
          type: integer
        price:
          type: number

  securitySchemes:
    sasl:
      type: scramSha256
      description: SASL/SCRAM-SHA-256 authentication
```

---

## GraphQL Documentation

### Schema Documentation
```graphql
"""
Root Query type for fetching data.
All queries require authentication unless marked otherwise.
"""
type Query {
  """
  Get the currently authenticated user.
  Returns null if not authenticated.
  """
  me: User

  """
  Fetch a user by their unique identifier.
  Requires ADMIN role for accessing other users' data.
  """
  user(
    "Unique user identifier"
    id: ID!
  ): User

  """
  Search and filter products with pagination.
  Available to all users including unauthenticated.
  """
  products(
    "Search query for product name/description"
    search: String
    "Filter by category ID"
    categoryId: ID
    "Pagination options"
    pagination: PaginationInput = { page: 1, limit: 20 }
  ): ProductConnection!
}

"""
Root Mutation type for modifying data.
All mutations require authentication.
"""
type Mutation {
  """
  Create a new product.
  Requires SELLER or ADMIN role.
  """
  createProduct(input: CreateProductInput!): CreateProductPayload!

  """
  Update an existing product.
  Only the product owner or ADMIN can update.
  """
  updateProduct(
    "Product to update"
    id: ID!
    "Fields to update"
    input: UpdateProductInput!
  ): UpdateProductPayload!
}

"""
User account information.
"""
type User {
  "Unique identifier"
  id: ID!

  "Email address (only visible to self or ADMIN)"
  email: String!

  "Display name"
  displayName: String

  "User role determining permissions"
  role: UserRole!

  "Products created by this user (SELLER only)"
  products(pagination: PaginationInput): ProductConnection

  "Account creation timestamp"
  createdAt: DateTime!
}

"""
User roles for authorization.
"""
enum UserRole {
  "Standard user with read access"
  USER
  "Can create and manage products"
  SELLER
  "Full system access"
  ADMIN
}

"""
Product in the catalog.
"""
type Product {
  id: ID!
  name: String!
  description: String
  price: Float!
  category: Category!
  seller: User!
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""
Paginated product results.
"""
type ProductConnection {
  "List of products"
  edges: [ProductEdge!]!
  "Pagination information"
  pageInfo: PageInfo!
  "Total count of matching products"
  totalCount: Int!
}

input CreateProductInput {
  name: String!
  description: String
  price: Float!
  categoryId: ID!
}

input PaginationInput {
  page: Int = 1
  limit: Int = 20
}
```

### GraphQL Documentation in Markdown
```markdown
# GraphQL API

## Endpoint

```
POST https://api.example.com/graphql
```

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Queries

### Get Current User
```graphql
query Me {
  me {
    id
    email
    displayName
    role
  }
}
```

### List Products with Filters
```graphql
query Products($search: String, $categoryId: ID) {
  products(search: $search, categoryId: $categoryId) {
    edges {
      node {
        id
        name
        price
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

**Variables:**
```json
{
  "search": "shirt",
  "categoryId": "cat_123"
}
```

## Mutations

### Create Product
```graphql
mutation CreateProduct($input: CreateProductInput!) {
  createProduct(input: $input) {
    product {
      id
      name
      price
    }
    errors {
      field
      message
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "name": "Premium T-Shirt",
    "price": 29.99,
    "categoryId": "cat_123"
  }
}
```

## Error Handling

Errors are returned in the `errors` array:
```json
{
  "errors": [
    {
      "message": "Not authorized",
      "extensions": {
        "code": "UNAUTHORIZED"
      },
      "path": ["createProduct"]
    }
  ]
}
```
```

---

## gRPC Documentation

### Proto File Documentation
```protobuf
syntax = "proto3";

package ecommerce.v1;

option go_package = "github.com/example/ecommerce/gen/go/v1";

// ProductService handles product catalog operations.
// All methods require authentication via metadata.
service ProductService {
  // ListProducts retrieves a paginated list of products.
  // Supports filtering by category and price range.
  rpc ListProducts(ListProductsRequest) returns (ListProductsResponse);

  // GetProduct retrieves a single product by ID.
  // Returns NOT_FOUND if product doesn't exist.
  rpc GetProduct(GetProductRequest) returns (Product);

  // CreateProduct adds a new product to the catalog.
  // Requires SELLER or ADMIN role.
  rpc CreateProduct(CreateProductRequest) returns (Product);

  // StreamProductUpdates opens a server stream for real-time
  // product inventory updates.
  rpc StreamProductUpdates(StreamProductUpdatesRequest)
    returns (stream ProductUpdate);
}

// Product represents an item in the catalog.
message Product {
  // Unique product identifier.
  string id = 1;

  // Product name (1-200 characters).
  string name = 2;

  // Optional product description.
  optional string description = 3;

  // Price in cents (e.g., 2999 = $29.99).
  int64 price_cents = 4;

  // Category this product belongs to.
  string category_id = 5;

  // Current inventory count.
  int32 inventory_count = 6;

  // Creation timestamp.
  google.protobuf.Timestamp created_at = 7;
}

message ListProductsRequest {
  // Filter by category ID.
  optional string category_id = 1;

  // Minimum price in cents.
  optional int64 min_price_cents = 2;

  // Maximum price in cents.
  optional int64 max_price_cents = 3;

  // Page size (default: 20, max: 100).
  int32 page_size = 4;

  // Page token for pagination.
  string page_token = 5;
}

message ListProductsResponse {
  // List of products.
  repeated Product products = 1;

  // Token for next page, empty if no more results.
  string next_page_token = 2;

  // Total count of matching products.
  int32 total_count = 3;
}
```

---

## SDK/Client Library Documentation

### SDK Quick Start
```markdown
# JavaScript SDK

## Installation

```bash
npm install @example/sdk
```

## Quick Start

```javascript
import { Client } from '@example/sdk';

const client = new Client({
  apiKey: process.env.EXAMPLE_API_KEY,
  // Optional: custom base URL
  baseUrl: 'https://api.example.com/v2'
});

// List products
const products = await client.products.list({
  category: 'electronics',
  limit: 10
});

// Get single product
const product = await client.products.get('prod_123');

// Create product
const newProduct = await client.products.create({
  name: 'Widget',
  price: 9.99
});
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | Required | Your API key |
| `baseUrl` | `string` | `https://api.example.com/v2` | API base URL |
| `timeout` | `number` | `30000` | Request timeout in ms |
| `retries` | `number` | `3` | Max retry attempts |

## Error Handling

```javascript
import { Client, APIError, ValidationError } from '@example/sdk';

try {
  await client.products.create({ name: '' });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.details);
  } else if (error instanceof APIError) {
    console.error(`API error ${error.status}: ${error.message}`);
  }
}
```

## TypeScript Support

Full TypeScript support with generated types:

```typescript
import { Client, Product, CreateProductInput } from '@example/sdk';

const input: CreateProductInput = {
  name: 'Widget',
  price: 9.99
};

const product: Product = await client.products.create(input);
```
```

---

## API Versioning Documentation

### Versioning Strategy
```markdown
# API Versioning

## Strategy

We use **URL path versioning** with semantic versioning principles.

- Major versions in URL: `/v1/`, `/v2/`
- Minor/patch versions don't break compatibility
- Each major version maintained for 2 years after successor release

## Current Versions

| Version | Status | Sunset Date |
|---------|--------|-------------|
| v2 | Current | - |
| v1 | Deprecated | 2026-06-01 |

## Version Headers

All responses include version information:
```
X-API-Version: 2.3.1
X-API-Deprecated: false
```

## Migration Guide (v1 → v2)

### Breaking Changes

1. **Pagination**: Changed from offset to cursor-based
   ```diff
   - GET /v1/products?offset=20&limit=10
   + GET /v2/products?cursor=abc123&limit=10
   ```

2. **Error format**: Standardized error responses
   ```diff
   - { "error": "Not found" }
   + { "code": "NOT_FOUND", "message": "Product not found" }
   ```

3. **Authentication**: Moved from query param to header
   ```diff
   - GET /v1/products?api_key=xxx
   + GET /v2/products
   + Authorization: Bearer xxx
   ```

### Deprecated Endpoints

| v1 Endpoint | v2 Replacement |
|-------------|----------------|
| `GET /v1/user` | `GET /v2/users/me` |
| `POST /v1/product` | `POST /v2/products` |
```

---

## Authentication Documentation

### Auth Documentation Template
```markdown
# Authentication

## Overview

The API supports multiple authentication methods:
- **API Keys**: For server-to-server communication
- **JWT Tokens**: For user sessions
- **OAuth 2.0**: For third-party integrations

## API Key Authentication

Include your API key in the `X-API-Key` header:

```bash
curl https://api.example.com/v2/products \
  -H "X-API-Key: your_api_key"
```

### Key Types

| Type | Prefix | Use Case |
|------|--------|----------|
| Test | `sk_test_` | Development/testing |
| Live | `sk_live_` | Production |

## JWT Authentication

### Obtaining Tokens

```bash
POST /v2/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

Response:
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "dGhpcyB...",
  "expiresIn": 3600
}
```

### Using Tokens

```bash
curl https://api.example.com/v2/users/me \
  -H "Authorization: Bearer eyJhbG..."
```

### Refreshing Tokens

```bash
POST /v2/auth/refresh
Content-Type: application/json

{
  "refreshToken": "dGhpcyB..."
}
```

## OAuth 2.0

### Authorization Flow

1. Redirect user to authorization URL:
```
https://auth.example.com/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://yourapp.com/callback&
  response_type=code&
  scope=read:products write:orders
```

2. Exchange code for tokens:
```bash
POST https://auth.example.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTH_CODE&
client_id=YOUR_CLIENT_ID&
client_secret=YOUR_CLIENT_SECRET&
redirect_uri=https://yourapp.com/callback
```

### Scopes

| Scope | Description |
|-------|-------------|
| `read:products` | Read product catalog |
| `write:products` | Create/update products |
| `read:orders` | Read order information |
| `write:orders` | Create/modify orders |
```

---

## Error Handling Documentation

### Error Response Standards
```markdown
# Error Handling

## Error Response Format

All errors follow a consistent format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context"
  },
  "requestId": "req_abc123"
}
```

## HTTP Status Codes

| Status | Meaning | When Used |
|--------|---------|-----------|
| 400 | Bad Request | Validation errors, malformed JSON |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Valid auth but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists, concurrent modification |
| 422 | Unprocessable | Business logic validation failure |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Unexpected server error |
| 503 | Service Unavailable | Maintenance or overload |

## Error Codes

### Authentication Errors (401)
| Code | Description |
|------|-------------|
| `AUTH_TOKEN_MISSING` | No authentication token provided |
| `AUTH_TOKEN_INVALID` | Token is malformed or signature invalid |
| `AUTH_TOKEN_EXPIRED` | Token has expired |

### Validation Errors (400)
| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request body/params validation failed |
| `INVALID_JSON` | Request body is not valid JSON |
| `MISSING_FIELD` | Required field not provided |

### Business Errors (422)
| Code | Description |
|------|-------------|
| `INSUFFICIENT_INVENTORY` | Not enough stock for order |
| `PAYMENT_DECLINED` | Payment processor declined transaction |
| `ORDER_ALREADY_SHIPPED` | Cannot modify shipped order |

## Handling Errors

### JavaScript Example
```javascript
try {
  const product = await api.products.create(data);
} catch (error) {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      // Show field-specific errors
      error.details.forEach(d => showError(d.field, d.message));
      break;
    case 'AUTH_TOKEN_EXPIRED':
      // Refresh token and retry
      await refreshAuth();
      return api.products.create(data);
    default:
      // Log and show generic error
      console.error('Request failed:', error.requestId);
      showError('An unexpected error occurred');
  }
}
```

## Rate Limiting

When rate limited (429), the response includes:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705312800
Retry-After: 60
```

Implement exponential backoff:
```javascript
async function requestWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429) {
        const delay = Math.pow(2, i) * 1000;
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
}
```
```
