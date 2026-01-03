# Naming Conventions

## General Principles

### Good Names Are

| Quality           | Example               | Counter-Example         |
| ----------------- | --------------------- | ----------------------- |
| **Descriptive**   | `userEmailAddress`    | `data`, `temp`          |
| **Pronounceable** | `customerId`          | `cstmrId`               |
| **Searchable**    | `MAX_RETRY_COUNT`     | `5`                     |
| **Consistent**    | `getUser`, `getOrder` | `getUser`, `fetchOrder` |

### Naming Length Guidelines

| Scope              | Length      | Example                     |
| ------------------ | ----------- | --------------------------- |
| Loop variable      | 1-2 chars   | `i`, `j`, `x`               |
| Local variable     | Short       | `user`, `count`             |
| Function parameter | Descriptive | `userId`, `options`         |
| Class field        | Clear       | `emailValidator`            |
| Global constant    | Verbose     | `MAX_CONNECTION_TIMEOUT_MS` |

## Language-Specific Conventions

### JavaScript / TypeScript

```typescript
// Variables and functions: camelCase
const userName = "alice";
function getUserById(id: string) {}

// Classes and types: PascalCase
class UserService {}
interface UserConfig {}
type OrderStatus = "pending" | "complete";

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = "https://api.example.com";

// Private fields: _prefix or #prefix
class Service {
  private _cache: Map<string, User>;
  #internalState: State;
}

// Boolean: is/has/can/should prefix
const isValid = true;
const hasPermission = checkAccess();
const canDelete = user.role === "admin";

// Event handlers: handle/on prefix
function handleClick() {}
function onSubmit() {}
```

### Python

```python
# Variables and functions: snake_case
user_name = 'alice'
def get_user_by_id(user_id: str) -> User:
    pass

# Classes: PascalCase
class UserService:
    pass

# Constants: SCREAMING_SNAKE_CASE
MAX_RETRY_COUNT = 3
API_BASE_URL = 'https://api.example.com'

# Private: single underscore prefix
class Service:
    def __init__(self):
        self._cache = {}  # Protected
        self.__secret = None  # Name-mangled

# Module-level private: single underscore
_internal_helper = lambda x: x * 2
```

### Go

```go
// Exported (public): PascalCase
func GetUserByID(id string) (*User, error)
type UserService struct {}
const MaxRetryCount = 3

// Unexported (private): camelCase
func getUserByID(id string) (*User, error)
type userCache struct {}
const defaultTimeout = 30

// Interfaces: -er suffix (typically)
type Reader interface { Read(p []byte) (n int, err error) }
type UserFetcher interface { Fetch(id string) (*User, error) }

// Acronyms: all caps or all lower
var userID string  // not userId
var httpClient *http.Client  // not HTTPClient when unexported
```

### Java

```java
// Variables and methods: camelCase
String userName = "alice";
public User getUserById(String id) { }

// Classes and interfaces: PascalCase
public class UserService { }
public interface UserRepository { }

// Constants: SCREAMING_SNAKE_CASE
public static final int MAX_RETRY_COUNT = 3;

// Packages: lowercase, reverse domain
package com.example.users;

// Generics: single uppercase letter
public class Container<T> { }
public <K, V> Map<K, V> createMap() { }
```

### Rust

```rust
// Variables and functions: snake_case
let user_name = "alice";
fn get_user_by_id(id: &str) -> Option<User> { }

// Types and traits: PascalCase
struct UserService { }
trait UserRepository { }
enum OrderStatus { Pending, Complete }

// Constants and statics: SCREAMING_SNAKE_CASE
const MAX_RETRY_COUNT: u32 = 3;
static API_BASE_URL: &str = "https://api.example.com";

// Lifetimes: short lowercase
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str { }

// Macros: snake_case!
macro_rules! create_user { }
```

## Semantic Naming Patterns

### Functions/Methods

| Pattern       | Use Case                 | Examples                         |
| ------------- | ------------------------ | -------------------------------- |
| `get*`        | Retrieve existing        | `getUser`, `getConfig`           |
| `find*`       | Search (may not exist)   | `findByEmail`, `findMatches`     |
| `create*`     | Make new instance        | `createUser`, `createOrder`      |
| `build*`      | Construct complex object | `buildQuery`, `buildReport`      |
| `is/has/can*` | Boolean check            | `isValid`, `hasAccess`           |
| `to*`         | Convert                  | `toString`, `toJSON`             |
| `parse*`      | Parse from string        | `parseDate`, `parseConfig`       |
| `validate*`   | Check validity           | `validateEmail`, `validateInput` |
| `calculate*`  | Compute value            | `calculateTotal`, `calculateTax` |
| `format*`     | Format for display       | `formatDate`, `formatCurrency`   |

### Collections

| Situation      | Naming                     |
| -------------- | -------------------------- |
| List of items  | `users`, `orders`, `items` |
| Map/Dictionary | `userById`, `configByKey`  |
| Set            | `uniqueTags`, `seenIds`    |
| Queue          | `pendingTasks`, `jobQueue` |
| Count          | `userCount`, `totalItems`  |

### Common Pairs

| Action   | Opposite  |
| -------- | --------- |
| `add`    | `remove`  |
| `create` | `destroy` |
| `start`  | `stop`    |
| `open`   | `close`   |
| `read`   | `write`   |
| `get`    | `set`     |
| `show`   | `hide`    |
| `enable` | `disable` |
| `push`   | `pop`     |
| `begin`  | `end`     |

## Anti-Patterns

### Avoid

| Anti-Pattern                  | Example                       | Better                       |
| ----------------------------- | ----------------------------- | ---------------------------- |
| Single letters (except loops) | `u`, `d`, `x`                 | `user`, `data`               |
| Abbreviations                 | `usrNm`, `calcTtl`            | `userName`, `calculateTotal` |
| Type in name                  | `userString`, `orderList`     | `userName`, `orders`         |
| Noise words                   | `theUser`, `dataInfo`         | `user`, `data`               |
| Generic names                 | `data`, `info`, `temp`, `foo` | Describe what it holds       |
| Negated booleans              | `isNotValid`                  | `isInvalid` or flip logic    |
| Numbers in names              | `user1`, `user2`              | Array or descriptive names   |

### Exceptions

```typescript
// OK: Industry conventions
const i, j, k; // Loop indices
const x, y, z; // Coordinates
const e, err; // Error in catch
const _unused; // Intentionally unused

// OK: Short scope
users.map((u) => u.name); // Clear from context
```

## File and Directory Naming

| Language              | Files                             | Directories   |
| --------------------- | --------------------------------- | ------------- |
| JavaScript/TypeScript | `camelCase.ts` or `kebab-case.ts` | `kebab-case/` |
| Python                | `snake_case.py`                   | `snake_case/` |
| Go                    | `lowercase.go`                    | `lowercase/`  |
| Java                  | `PascalCase.java`                 | `lowercase/`  |
| Rust                  | `snake_case.rs`                   | `snake_case/` |

### Special Files

```
README.md       # Project documentation
CHANGELOG.md    # Version history
LICENSE         # License file
.gitignore      # Git ignore rules
.env.example    # Environment template
```
