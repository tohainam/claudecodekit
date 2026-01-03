# API Documentation Template

## OpenAPI 3.1 Template

````yaml
openapi: 3.1.0
info:
  title: Project API
  description: |
    API for managing resources in the project.

    ## Authentication
    All endpoints require a Bearer token in the Authorization header:
    ```
    Authorization: Bearer <token>
    ```

    ## Rate Limiting
    - 100 requests per minute per user
    - 429 status returned when exceeded

    ## Pagination
    List endpoints support pagination via `limit` and `offset` parameters.
  version: 1.0.0
  contact:
    name: API Support
    email: api@example.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging
  - url: http://localhost:3000/v1
    description: Local development

tags:
  - name: Users
    description: User management endpoints
  - name: Items
    description: Item CRUD operations

paths:
  /users:
    get:
      tags: [Users]
      summary: List all users
      description: Returns a paginated list of users
      operationId: listUsers
      parameters:
        - $ref: "#/components/parameters/Limit"
        - $ref: "#/components/parameters/Offset"
        - name: role
          in: query
          description: Filter by role
          schema:
            type: string
            enum: [admin, user, guest]
      responses:
        "200":
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/User"
                  meta:
                    $ref: "#/components/schemas/PaginationMeta"
        "401":
          $ref: "#/components/responses/Unauthorized"

    post:
      tags: [Users]
      summary: Create a new user
      description: Creates a new user account
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateUserRequest"
            example:
              email: user@example.com
              name: John Doe
              role: user
      responses:
        "201":
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
        "400":
          $ref: "#/components/responses/BadRequest"
        "409":
          description: User already exists

  /users/{id}:
    get:
      tags: [Users]
      summary: Get user by ID
      operationId: getUserById
      parameters:
        - $ref: "#/components/parameters/UserId"
      responses:
        "200":
          description: Successful response
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
        "404":
          $ref: "#/components/responses/NotFound"

components:
  schemas:
    User:
      type: object
      required: [id, email, name]
      properties:
        id:
          type: string
          format: uuid
          description: Unique identifier
          example: 550e8400-e29b-41d4-a716-446655440000
        email:
          type: string
          format: email
          description: User email address
          example: user@example.com
        name:
          type: string
          description: User display name
          example: John Doe
        role:
          type: string
          enum: [admin, user, guest]
          default: user
        createdAt:
          type: string
          format: date-time
          example: 2025-01-15T10:30:00Z

    CreateUserRequest:
      type: object
      required: [email, name]
      properties:
        email:
          type: string
          format: email
        name:
          type: string
          minLength: 1
          maxLength: 100
        role:
          type: string
          enum: [admin, user, guest]
          default: user

    PaginationMeta:
      type: object
      properties:
        total:
          type: integer
          description: Total number of items
        limit:
          type: integer
          description: Items per page
        offset:
          type: integer
          description: Current offset

    Error:
      type: object
      required: [code, message]
      properties:
        code:
          type: string
          description: Error code
        message:
          type: string
          description: Human-readable error message
        details:
          type: object
          description: Additional error details

  parameters:
    UserId:
      name: id
      in: path
      required: true
      description: User ID
      schema:
        type: string
        format: uuid

    Limit:
      name: limit
      in: query
      description: Maximum number of items to return
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20

    Offset:
      name: offset
      in: query
      description: Number of items to skip
      schema:
        type: integer
        minimum: 0
        default: 0

  responses:
    BadRequest:
      description: Invalid request
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          example:
            code: VALIDATION_ERROR
            message: Invalid request body
            details:
              email: Must be a valid email address

    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          example:
            code: UNAUTHORIZED
            message: Authentication required

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          example:
            code: NOT_FOUND
            message: Resource not found

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
````

---

## JSDoc/TSDoc for Code

````typescript
/**
 * Creates a new user in the system.
 *
 * @param data - The user data to create
 * @param data.email - User's email address (must be unique)
 * @param data.name - User's display name
 * @param data.role - User's role (defaults to 'user')
 * @returns The created user object
 * @throws {ValidationError} When email format is invalid
 * @throws {ConflictError} When email already exists
 *
 * @example
 * ```typescript
 * const user = await createUser({
 *   email: 'alice@example.com',
 *   name: 'Alice Smith',
 *   role: 'admin'
 * });
 * console.log(user.id); // '550e8400-...'
 * ```
 */
async function createUser(data: CreateUserDTO): Promise<User> {
  // Implementation
}

/**
 * Represents a user in the system.
 *
 * @property id - Unique identifier (UUID v4)
 * @property email - Email address (unique)
 * @property name - Display name
 * @property role - User role
 * @property createdAt - Account creation timestamp
 */
interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "guest";
  createdAt: Date;
}
````

---

## Python Docstrings

```python
def create_user(email: str, name: str, role: str = "user") -> User:
    """
    Create a new user in the system.

    Args:
        email: User's email address (must be unique)
        name: User's display name
        role: User's role. Defaults to "user".
            Valid values: "admin", "user", "guest"

    Returns:
        The created User object with generated ID and timestamps.

    Raises:
        ValidationError: If email format is invalid
        ConflictError: If email already exists in the system

    Example:
        >>> user = create_user(
        ...     email="alice@example.com",
        ...     name="Alice Smith",
        ...     role="admin"
        ... )
        >>> print(user.id)
        '550e8400-e29b-41d4-a716-446655440000'
    """
    pass


class User:
    """
    Represents a user in the system.

    Attributes:
        id: Unique identifier (UUID v4)
        email: Email address (unique)
        name: Display name
        role: User role (admin, user, or guest)
        created_at: Account creation timestamp
    """
    pass
```

---

## API Documentation Best Practices

### Endpoint Documentation Checklist

- [ ] Clear summary and description
- [ ] All parameters documented
- [ ] Request body schema with example
- [ ] All response codes documented
- [ ] Error responses with examples
- [ ] Authentication requirements
- [ ] Rate limiting info

### General Guidelines

| Guideline             | Example                           |
| --------------------- | --------------------------------- |
| Use consistent naming | `GET /users`, not `GET /getUsers` |
| Include examples      | Show realistic request/response   |
| Document errors       | All possible error codes          |
| Version your API      | `/v1/users`, `/v2/users`          |
| Show authentication   | How to obtain and use tokens      |

### Tools for API Documentation

| Tool            | Type           | Notes                 |
| --------------- | -------------- | --------------------- |
| Swagger/OpenAPI | Spec-based     | Industry standard     |
| Redoc           | Renderer       | Beautiful static docs |
| Stoplight       | Platform       | Design-first          |
| Postman         | Testing + Docs | Collection sharing    |
| TypeDoc         | Code-based     | TypeScript            |
| Sphinx          | Code-based     | Python                |
