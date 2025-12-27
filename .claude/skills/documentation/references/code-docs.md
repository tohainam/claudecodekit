# Code Documentation Patterns

## Table of Contents
1. [JSDoc (JavaScript/TypeScript)](#jsdoc-javascripttypescript)
2. [TypeDoc (TypeScript)](#typedoc-typescript)
3. [Python Docstrings](#python-docstrings)
4. [Go Documentation](#go-documentation)
5. [Rust Documentation](#rust-documentation)
6. [Java/Kotlin Documentation](#javakotlin-documentation)
7. [C# XML Documentation](#c-xml-documentation)
8. [Inline Code Comments](#inline-code-comments)
9. [Documentation Generation Tools](#documentation-generation-tools)

---

## JSDoc (JavaScript/TypeScript)

### Basic JSDoc Tags
```javascript
/**
 * Brief description of what the function does.
 *
 * @param {string} name - The user's name
 * @param {number} [age] - Optional age parameter
 * @param {Object} options - Configuration options
 * @param {boolean} options.verbose - Enable verbose output
 * @param {string} [options.format='json'] - Output format
 * @returns {Promise<User>} The created user object
 * @throws {ValidationError} When name is empty
 * @throws {DatabaseError} When database connection fails
 *
 * @example
 * const user = await createUser('John', 25, { verbose: true });
 * console.log(user.id);
 *
 * @see {@link updateUser} for updating users
 * @since 1.0.0
 * @deprecated Use createUserV2 instead
 */
async function createUser(name, age, options) {
  // implementation
}
```

### TypeScript-Specific JSDoc
```typescript
/**
 * Generic repository for database operations.
 *
 * @template T - Entity type
 * @template ID - Primary key type
 */
interface Repository<T, ID> {
  /**
   * Find entity by ID.
   *
   * @param id - Entity identifier
   * @returns Entity or null if not found
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Save entity to database.
   *
   * @param entity - Entity to save
   * @returns Saved entity with generated ID
   */
  save(entity: Omit<T, 'id'>): Promise<T>;
}

/**
 * User entity representing an application user.
 *
 * @interface
 * @property {string} id - Unique identifier (UUID)
 * @property {string} email - User's email address
 * @property {UserRole} role - User's role for authorization
 * @property {Date} createdAt - Account creation timestamp
 */
interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

/**
 * User roles for authorization.
 *
 * @enum {string}
 * @readonly
 */
const UserRole = {
  /** Standard user with limited access */
  USER: 'user',
  /** Administrator with full access */
  ADMIN: 'admin',
  /** Moderator with content management access */
  MODERATOR: 'moderator',
} as const;
```

### Class Documentation
```typescript
/**
 * Service for managing user authentication and sessions.
 *
 * @class
 * @example
 * ```ts
 * const authService = new AuthService(userRepository, tokenService);
 * const session = await authService.login('user@example.com', 'password');
 * ```
 */
class AuthService {
  /**
   * Create a new AuthService instance.
   *
   * @param {UserRepository} userRepo - User data access
   * @param {TokenService} tokenService - JWT token management
   * @param {AuthConfig} [config] - Optional configuration
   */
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
    private readonly config?: AuthConfig
  ) {}

  /**
   * Authenticate user and create session.
   *
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Session>} New session with tokens
   * @throws {InvalidCredentialsError} When credentials are incorrect
   * @throws {AccountLockedError} When account is locked
   *
   * @fires AuthService#login
   * @listens UserRepository#userUpdated
   */
  async login(email: string, password: string): Promise<Session> {
    // implementation
  }

  /**
   * Invalidate session and logout user.
   *
   * @param {string} sessionId - Session to invalidate
   * @returns {Promise<void>}
   */
  async logout(sessionId: string): Promise<void> {
    // implementation
  }
}
```

### React Component JSDoc
```tsx
/**
 * Props for the Button component.
 */
interface ButtonProps {
  /**
   * Button visual variant.
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'ghost';

  /**
   * Button size.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the button is in loading state.
   * Shows spinner and disables interactions.
   */
  loading?: boolean;

  /**
   * Click handler function.
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Button content.
   */
  children: React.ReactNode;
}

/**
 * A versatile button component with multiple variants and states.
 *
 * @component
 * @example
 * ```tsx
 * // Primary button
 * <Button onClick={handleSubmit}>Submit</Button>
 *
 * // Loading state
 * <Button loading={isSubmitting}>Save</Button>
 *
 * // Secondary variant
 * <Button variant="secondary" size="sm">Cancel</Button>
 * ```
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  onClick,
  children,
}: ButtonProps): JSX.Element {
  // implementation
}
```

---

## TypeDoc (TypeScript)

### TypeDoc Module Documentation
```typescript
/**
 * Authentication module for user session management.
 *
 * This module provides:
 * - User authentication (login/logout)
 * - Session management
 * - Token refresh functionality
 * - Password reset flow
 *
 * @packageDocumentation
 * @module auth
 *
 * @example
 * ```ts
 * import { AuthService, TokenService } from '@app/auth';
 *
 * const auth = new AuthService(tokenService);
 * const session = await auth.login(credentials);
 * ```
 */

export * from './auth.service';
export * from './token.service';
export * from './types';
```

### TypeDoc Category Organization
```typescript
/**
 * @categoryDescription Services
 * Core business logic services
 *
 * @categoryDescription Models
 * Data models and entities
 *
 * @categoryDescription Utils
 * Utility functions and helpers
 */

/**
 * User authentication service.
 *
 * @category Services
 */
export class AuthService {}

/**
 * User entity model.
 *
 * @category Models
 */
export interface User {}

/**
 * Hash a password using bcrypt.
 *
 * @category Utils
 */
export function hashPassword(password: string): Promise<string> {}
```

---

## Python Docstrings

### Google Style (Recommended)
```python
def create_user(
    email: str,
    password: str,
    *,
    role: UserRole = UserRole.USER,
    metadata: dict[str, Any] | None = None,
) -> User:
    """Create a new user account.

    Creates a user with the specified email and password. The password
    is hashed before storage using bcrypt with a cost factor of 12.

    Args:
        email: User's email address. Must be unique and valid format.
        password: Plain text password. Must be at least 8 characters.
        role: User role for authorization. Defaults to UserRole.USER.
        metadata: Optional additional user metadata.

    Returns:
        The created User object with generated ID and timestamps.

    Raises:
        ValidationError: If email format is invalid or password too short.
        DuplicateEmailError: If email already exists in database.
        DatabaseError: If database connection fails.

    Example:
        >>> user = create_user("john@example.com", "securepass123")
        >>> print(user.id)
        'usr_abc123'

        >>> admin = create_user(
        ...     "admin@example.com",
        ...     "adminpass",
        ...     role=UserRole.ADMIN,
        ...     metadata={"department": "IT"}
        ... )

    Note:
        This function sends a verification email to the user.
        The user must verify their email within 24 hours.

    See Also:
        update_user: For updating existing users.
        delete_user: For removing users.

    .. versionadded:: 1.0.0
    .. versionchanged:: 2.0.0
        Added metadata parameter.
    """
    pass
```

### NumPy Style
```python
def calculate_statistics(
    data: np.ndarray,
    axis: int | None = None,
    weights: np.ndarray | None = None,
) -> StatisticsResult:
    """
    Calculate descriptive statistics for the input data.

    Parameters
    ----------
    data : np.ndarray
        Input data array. Can be 1D or 2D.
    axis : int or None, optional
        Axis along which to compute statistics.
        If None, compute over flattened array. Default is None.
    weights : np.ndarray or None, optional
        Weights for weighted statistics. Must have same shape as data.
        Default is None (uniform weights).

    Returns
    -------
    StatisticsResult
        Named tuple containing:
        - mean : float or np.ndarray
            Arithmetic mean.
        - std : float or np.ndarray
            Standard deviation.
        - min : float or np.ndarray
            Minimum value.
        - max : float or np.ndarray
            Maximum value.
        - median : float or np.ndarray
            Median value.

    Raises
    ------
    ValueError
        If data is empty or contains NaN values.
    ShapeError
        If weights shape doesn't match data shape.

    See Also
    --------
    numpy.mean : Compute arithmetic mean.
    numpy.std : Compute standard deviation.

    Notes
    -----
    The standard deviation is calculated using Bessel's correction
    (ddof=1) for sample standard deviation.

    Examples
    --------
    >>> data = np.array([1, 2, 3, 4, 5])
    >>> stats = calculate_statistics(data)
    >>> stats.mean
    3.0
    >>> stats.std
    1.5811388300841898

    >>> data_2d = np.array([[1, 2], [3, 4]])
    >>> stats = calculate_statistics(data_2d, axis=0)
    >>> stats.mean
    array([2., 3.])
    """
    pass
```

### Class Docstrings
```python
class UserService:
    """Service for user management operations.

    This service handles all user-related business logic including
    creation, authentication, and profile management.

    Attributes:
        repository: User data access layer.
        cache: Optional caching layer for performance.
        event_bus: Event publisher for user events.

    Example:
        >>> service = UserService(
        ...     repository=UserRepository(db),
        ...     cache=RedisCache(),
        ... )
        >>> user = await service.get_by_email("user@example.com")

    Note:
        All methods are async and should be awaited.
    """

    def __init__(
        self,
        repository: UserRepository,
        cache: Cache | None = None,
        event_bus: EventBus | None = None,
    ) -> None:
        """Initialize UserService.

        Args:
            repository: User data access layer.
            cache: Optional cache for frequently accessed users.
            event_bus: Optional event bus for publishing user events.
        """
        self.repository = repository
        self.cache = cache
        self.event_bus = event_bus
```

---

## Go Documentation

### Package Documentation
```go
// Package auth provides authentication and authorization functionality.
//
// This package implements JWT-based authentication with support for
// access tokens, refresh tokens, and role-based access control.
//
// # Quick Start
//
// Create an AuthService and use it to authenticate users:
//
//	service := auth.NewService(auth.Config{
//	    SecretKey:    []byte("secret"),
//	    TokenExpiry:  time.Hour,
//	    RefreshExpiry: 7 * 24 * time.Hour,
//	})
//
//	tokens, err := service.Login(ctx, email, password)
//	if err != nil {
//	    log.Fatal(err)
//	}
//
// # Token Validation
//
// Validate tokens using the middleware or directly:
//
//	claims, err := service.ValidateToken(tokenString)
//	if errors.Is(err, auth.ErrTokenExpired) {
//	    // Handle expired token
//	}
//
// # Error Handling
//
// The package defines several error types:
//   - ErrInvalidCredentials: wrong email or password
//   - ErrTokenExpired: token has expired
//   - ErrTokenInvalid: token is malformed
//   - ErrUserNotFound: user doesn't exist
package auth
```

### Function Documentation
```go
// CreateUser creates a new user with the given email and password.
//
// The password is hashed using bcrypt with cost factor 12 before storage.
// A verification email is sent to the user's email address.
//
// CreateUser returns ErrDuplicateEmail if the email is already registered.
// It returns ErrWeakPassword if the password doesn't meet requirements:
//   - At least 8 characters
//   - Contains uppercase and lowercase letters
//   - Contains at least one number
//
// Example:
//
//	user, err := service.CreateUser(ctx, "user@example.com", "SecurePass123")
//	if errors.Is(err, auth.ErrDuplicateEmail) {
//	    // Handle duplicate email
//	}
func (s *Service) CreateUser(ctx context.Context, email, password string) (*User, error) {
    // implementation
}

// User represents an application user.
type User struct {
    // ID is the unique user identifier (UUID).
    ID string

    // Email is the user's email address.
    // It must be unique across all users.
    Email string

    // Role determines the user's permissions.
    Role Role

    // CreatedAt is when the user was created.
    CreatedAt time.Time

    // UpdatedAt is when the user was last modified.
    UpdatedAt time.Time
}

// Role represents a user's authorization level.
type Role string

const (
    // RoleUser is a standard user with limited permissions.
    RoleUser Role = "user"

    // RoleAdmin has full system access.
    RoleAdmin Role = "admin"

    // RoleModerator can manage content but not users.
    RoleModerator Role = "moderator"
)
```

### Interface Documentation
```go
// Repository defines the interface for user data persistence.
//
// Implementations must be safe for concurrent use.
// All methods should respect context cancellation.
type Repository interface {
    // FindByID retrieves a user by their unique identifier.
    // Returns ErrNotFound if the user doesn't exist.
    FindByID(ctx context.Context, id string) (*User, error)

    // FindByEmail retrieves a user by their email address.
    // Returns ErrNotFound if no user has this email.
    FindByEmail(ctx context.Context, email string) (*User, error)

    // Create persists a new user to the database.
    // Returns ErrDuplicateEmail if the email already exists.
    Create(ctx context.Context, user *User) error

    // Update modifies an existing user.
    // Returns ErrNotFound if the user doesn't exist.
    // Returns ErrConcurrentModification if the user was modified
    // since it was loaded.
    Update(ctx context.Context, user *User) error

    // Delete removes a user from the database.
    // Returns ErrNotFound if the user doesn't exist.
    Delete(ctx context.Context, id string) error
}
```

---

## Rust Documentation

### Module Documentation
```rust
//! Authentication and authorization module.
//!
//! This module provides JWT-based authentication with support for:
//! - Access and refresh tokens
//! - Role-based access control
//! - Password hashing with Argon2
//!
//! # Quick Start
//!
//! ```rust
//! use auth::{AuthService, Config};
//!
//! let config = Config::builder()
//!     .secret_key("your-secret-key")
//!     .token_expiry(Duration::hours(1))
//!     .build()?;
//!
//! let service = AuthService::new(config);
//! let tokens = service.login(&email, &password).await?;
//! ```
//!
//! # Error Handling
//!
//! All operations return `Result<T, AuthError>`. Common errors:
//! - [`AuthError::InvalidCredentials`]: Wrong email or password
//! - [`AuthError::TokenExpired`]: JWT has expired
//! - [`AuthError::Unauthorized`]: Missing or invalid token

/// User account information.
///
/// # Examples
///
/// ```rust
/// let user = User {
///     id: Uuid::new_v4(),
///     email: "user@example.com".into(),
///     role: Role::User,
///     created_at: Utc::now(),
/// };
/// ```
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    /// Unique user identifier (UUID v4).
    pub id: Uuid,

    /// User's email address. Must be unique.
    pub email: String,

    /// User role for authorization.
    pub role: Role,

    /// When the account was created.
    pub created_at: DateTime<Utc>,
}

/// Create a new user account.
///
/// Hashes the password using Argon2id and stores the user in the database.
///
/// # Arguments
///
/// * `email` - User's email address
/// * `password` - Plain text password (min 8 characters)
///
/// # Returns
///
/// The created user with generated ID and timestamps.
///
/// # Errors
///
/// * [`AuthError::DuplicateEmail`] - Email already registered
/// * [`AuthError::WeakPassword`] - Password doesn't meet requirements
/// * [`AuthError::Database`] - Database operation failed
///
/// # Examples
///
/// ```rust
/// let user = service.create_user("user@example.com", "SecurePass123").await?;
/// println!("Created user: {}", user.id);
/// ```
///
/// # Panics
///
/// Panics if the password hasher is not properly configured.
pub async fn create_user(&self, email: &str, password: &str) -> Result<User, AuthError> {
    // implementation
}
```

---

## Java/Kotlin Documentation

### JavaDoc
```java
/**
 * Service for managing user authentication and sessions.
 *
 * <p>This service provides methods for user login, logout, and session
 * management. It uses JWT tokens for stateless authentication.</p>
 *
 * <h2>Usage Example</h2>
 * <pre>{@code
 * AuthService authService = new AuthService(userRepository, tokenService);
 * Session session = authService.login("user@example.com", "password");
 * System.out.println("Token: " + session.getAccessToken());
 * }</pre>
 *
 * <h2>Thread Safety</h2>
 * <p>This class is thread-safe. All public methods can be safely called
 * from multiple threads concurrently.</p>
 *
 * @author John Doe
 * @version 2.0
 * @since 1.0
 * @see TokenService
 * @see Session
 */
public class AuthService {

    /**
     * Authenticate user and create a new session.
     *
     * <p>Validates the provided credentials against the user repository
     * and creates a new session with access and refresh tokens.</p>
     *
     * @param email    the user's email address, must not be {@code null}
     * @param password the user's password, must not be {@code null}
     * @return a new {@link Session} containing access and refresh tokens
     * @throws InvalidCredentialsException if the email or password is incorrect
     * @throws AccountLockedException      if the account is locked due to
     *                                     too many failed attempts
     * @throws NullPointerException        if email or password is {@code null}
     *
     * @see #logout(String)
     * @see Session
     */
    public Session login(@NonNull String email, @NonNull String password)
            throws InvalidCredentialsException, AccountLockedException {
        // implementation
    }
}
```

### KDoc (Kotlin)
```kotlin
/**
 * Service for managing user authentication and sessions.
 *
 * Provides methods for user login, logout, and session management
 * using JWT tokens for stateless authentication.
 *
 * ## Usage
 *
 * ```kotlin
 * val authService = AuthService(userRepository, tokenService)
 * val session = authService.login("user@example.com", "password")
 * println("Token: ${session.accessToken}")
 * ```
 *
 * @property userRepository Repository for user data access
 * @property tokenService Service for JWT token management
 * @constructor Creates an AuthService with the specified dependencies
 *
 * @sample com.example.samples.AuthServiceSamples.loginExample
 * @see TokenService
 * @since 1.0.0
 */
class AuthService(
    private val userRepository: UserRepository,
    private val tokenService: TokenService,
) {
    /**
     * Authenticate user and create a new session.
     *
     * Validates credentials and creates a session with access and refresh tokens.
     *
     * @param email User's email address
     * @param password User's password
     * @return New [Session] with tokens
     * @throws InvalidCredentialsException if credentials are incorrect
     * @throws AccountLockedException if account is locked
     */
    suspend fun login(email: String, password: String): Session {
        // implementation
    }
}
```

---

## C# XML Documentation

```csharp
/// <summary>
/// Service for managing user authentication and sessions.
/// </summary>
/// <remarks>
/// <para>
/// This service provides methods for user login, logout, and session
/// management using JWT tokens for stateless authentication.
/// </para>
/// <para>
/// The service is thread-safe and can be registered as a singleton
/// in the dependency injection container.
/// </para>
/// </remarks>
/// <example>
/// <code>
/// var authService = new AuthService(userRepository, tokenService);
/// var session = await authService.LoginAsync("user@example.com", "password");
/// Console.WriteLine($"Token: {session.AccessToken}");
/// </code>
/// </example>
public class AuthService : IAuthService
{
    /// <summary>
    /// Authenticate user and create a new session.
    /// </summary>
    /// <param name="email">The user's email address.</param>
    /// <param name="password">The user's password.</param>
    /// <returns>
    /// A task representing the asynchronous operation.
    /// The task result contains the new <see cref="Session"/> with tokens.
    /// </returns>
    /// <exception cref="ArgumentNullException">
    /// Thrown when <paramref name="email"/> or <paramref name="password"/> is null.
    /// </exception>
    /// <exception cref="InvalidCredentialsException">
    /// Thrown when the email or password is incorrect.
    /// </exception>
    /// <exception cref="AccountLockedException">
    /// Thrown when the account is locked due to too many failed attempts.
    /// </exception>
    /// <seealso cref="LogoutAsync"/>
    /// <seealso cref="Session"/>
    public async Task<Session> LoginAsync(string email, string password)
    {
        // implementation
    }
}
```

---

## Inline Code Comments

### When to Use Comments

**DO comment:**
- Complex algorithms or business logic
- Non-obvious workarounds or edge cases
- TODO/FIXME items with context
- Regex patterns
- Magic numbers with meaning

**DON'T comment:**
- Obvious code that's self-documenting
- What the code does (let the code speak)
- Commented-out code (delete it)

### Good Comment Examples
```typescript
// Calculate compound interest using the formula: A = P(1 + r/n)^(nt)
// where P = principal, r = annual rate, n = compounds per year, t = years
const finalAmount = principal * Math.pow(1 + rate / compounds, compounds * years);

// HACK: Safari doesn't support the standard API, fall back to deprecated method
// Remove when Safari 17+ has >90% adoption (tracked in JIRA-1234)
const clipboard = navigator.clipboard ?? window.clipboardData;

// Regex: Match valid email addresses per RFC 5322 (simplified)
// Format: local@domain where local allows dots/hyphens, domain requires TLD
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 86400000 = 24 hours in milliseconds (24 * 60 * 60 * 1000)
const TOKEN_EXPIRY_MS = 86400000;

// TODO(john): Replace with proper caching when Redis is available
// Current implementation causes N+1 queries on large datasets
const users = await Promise.all(userIds.map(id => fetchUser(id)));

// FIXME: Race condition when multiple tabs are open
// See: https://github.com/org/repo/issues/123
localStorage.setItem('session', JSON.stringify(session));
```

### Bad Comment Examples
```typescript
// DON'T: Obvious comments
// Increment counter by 1
counter++;

// DON'T: What instead of why
// Loop through users
for (const user of users) { }

// DON'T: Outdated comments
// Returns user's first name (WRONG: now returns full name)
function getName(user) { return user.fullName; }

// DON'T: Commented-out code
// const oldImplementation = () => { ... };
```

---

## Documentation Generation Tools

### Tool Comparison

| Tool | Language | Output | Config |
|------|----------|--------|--------|
| **TypeDoc** | TypeScript | HTML, JSON, Markdown | typedoc.json |
| **JSDoc** | JavaScript | HTML | jsdoc.json |
| **Sphinx** | Python | HTML, PDF, ePub | conf.py |
| **pdoc** | Python | HTML, Markdown | CLI args |
| **Godoc** | Go | HTML | None (convention) |
| **rustdoc** | Rust | HTML | Cargo.toml |
| **Dokka** | Kotlin/Java | HTML, Markdown | build.gradle |
| **DocFX** | C#/.NET | HTML | docfx.json |

### TypeDoc Configuration
```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["src/index.ts"],
  "out": "docs",
  "name": "My Library",
  "includeVersion": true,
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeInternal": true,
  "readme": "README.md",
  "plugin": ["typedoc-plugin-markdown"],
  "categorizeByGroup": true,
  "defaultCategory": "Other",
  "categoryOrder": ["Services", "Models", "Utils", "*"]
}
```

### Sphinx Configuration (Python)
```python
# conf.py
project = 'My Project'
copyright = '2025, Author'
author = 'Author'
version = '1.0'
release = '1.0.0'

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.napoleon',  # Google/NumPy style docstrings
    'sphinx.ext.viewcode',
    'sphinx.ext.intersphinx',
    'sphinx_autodoc_typehints',
]

# Napoleon settings for Google-style docstrings
napoleon_google_docstring = True
napoleon_numpy_docstring = True
napoleon_include_init_with_doc = True

# Autodoc settings
autodoc_default_options = {
    'members': True,
    'undoc-members': True,
    'show-inheritance': True,
}

# HTML output
html_theme = 'furo'  # or 'sphinx_rtd_theme'
```

### CI/CD Integration
```yaml
# GitHub Actions - docs generation
name: Documentation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Generate docs
        run: npm run docs

      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```
