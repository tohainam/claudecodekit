# Naming Conventions

Universal naming conventions for clear, maintainable code across all technologies.

## Case Styles Quick Reference

| Style | Example | Common Usage |
|-------|---------|--------------|
| camelCase | `getUserName` | Variables, functions (JS/Java/C#) |
| PascalCase | `UserService` | Classes, components, types |
| snake_case | `user_name` | Variables (Python/Ruby), DB columns |
| SCREAMING_SNAKE | `MAX_RETRIES` | Constants, env variables |
| kebab-case | `user-profile` | URLs, CSS classes, file names |

## By Element Type

### Variables
```
✓ descriptive, reveals intent
✓ pronounceable, searchable
✓ scope-appropriate length

BAD:  d, temp, data, info, x1
GOOD: daysSinceModified, userEmail, isActive

# Loop counters (only exception for short names)
for i in range(10)
for index, item in enumerate(items)
```

### Functions/Methods
```
✓ verb or verb phrase
✓ describes action performed
✓ single responsibility evident from name

BAD:  process(), handle(), doStuff()
GOOD: calculateTax(), validateEmail(), fetchUserById()

# Boolean returns: is/has/can/should prefix
isValid(), hasPermission(), canEdit(), shouldRetry()
```

### Classes/Types
```
✓ noun or noun phrase
✓ describes what it IS, not what it DOES
✓ avoid generic suffixes unless meaningful

BAD:  Manager, Handler, Processor, Helper, Utils
GOOD: UserRepository, PaymentGateway, EmailValidator

# Interfaces: describe capability
Serializable, Comparable, Iterable (Java)
IUserService, IRepository (C#)
```

### Constants
```
✓ SCREAMING_SNAKE_CASE
✓ describes value's meaning, not its content

BAD:  FIVE = 5, STRING_1 = "error"
GOOD: MAX_RETRY_ATTEMPTS = 5, DEFAULT_TIMEOUT_MS = 3000
```

### Files & Directories
```
# Components (React/Vue/Angular)
UserProfile.tsx, OrderSummary.vue, HeaderNav.component.ts

# Modules/Utils
string-utils.ts, date-helpers.py, api_client.rb

# Tests
user.test.ts, user_test.py, UserTest.java

# Config
.env, config.yaml, settings.json
```

## Language-Specific Conventions

### JavaScript/TypeScript
```typescript
// Variables & functions: camelCase
const userName = 'John';
function calculateTotal() {}

// Classes & types: PascalCase
class UserService {}
interface UserProfile {}
type PaymentStatus = 'pending' | 'completed';

// Constants: SCREAMING_SNAKE or camelCase
const MAX_RETRIES = 3;
const defaultConfig = {}; // for object constants

// Private (convention): underscore prefix or #
_privateMethod() {}
#privateField = 'value';

// React components: PascalCase
function UserCard() {}
const ProfileHeader = () => {};
```

### Python
```python
# Variables & functions: snake_case
user_name = 'John'
def calculate_total(): pass

# Classes: PascalCase
class UserService: pass

# Constants: SCREAMING_SNAKE
MAX_RETRIES = 3
DEFAULT_TIMEOUT = 30

# Private: single underscore prefix
_internal_method()  # convention: internal use
__private_attr      # name mangling (avoid unless needed)

# Module-level "constants": lowercase ok if mutable
config = {}  # configuration dict
```

### Java/Kotlin
```java
// Variables & parameters: camelCase
String userName;
void setUserName(String name) {}

// Constants: SCREAMING_SNAKE
public static final int MAX_SIZE = 100;

// Classes & interfaces: PascalCase
class UserRepository {}
interface Serializable {}

// Packages: lowercase, reverse domain
com.company.project.module
```

### Go
```go
// Exported (public): PascalCase
func GetUser() {}
type UserService struct {}

// Unexported (private): camelCase
func getUserFromDB() {}
var internalCache map[string]string

// Packages: short, lowercase, no underscores
package user
package httputil

// Interfaces: -er suffix for single method
type Reader interface {}
type Stringer interface {}
```

### Ruby
```ruby
# Variables & methods: snake_case
user_name = 'John'
def calculate_total; end

# Classes & modules: PascalCase
class UserService; end
module Authentication; end

# Constants: SCREAMING_SNAKE or PascalCase
MAX_RETRIES = 3
DefaultConfig = {}.freeze

# Predicate methods: ? suffix
def valid?; end
def empty?; end

# Dangerous methods: ! suffix
def save!; end  # raises on failure
def sort!       # mutates in place
```

### SQL/Database
```sql
-- Tables: snake_case, plural
users, order_items, payment_methods

-- Columns: snake_case, singular
user_id, created_at, is_active

-- Primary keys: id or table_id
id, user_id

-- Foreign keys: referenced_table_id
user_id, order_id

-- Indexes: idx_table_column
idx_users_email, idx_orders_created_at

-- Constraints: type_table_column
pk_users_id, fk_orders_user_id, uq_users_email
```

## Anti-Patterns

| Anti-Pattern | Example | Problem | Fix |
|--------------|---------|---------|-----|
| Single letter | `x`, `d`, `t` | No meaning | `width`, `delay`, `timeout` |
| Abbreviations | `usrNm`, `btnClk` | Hard to read | `userName`, `buttonClick` |
| Type in name | `userString`, `countInt` | Redundant, fragile | `user`, `count` |
| Generic names | `data`, `info`, `temp` | Meaningless | `userData`, `orderInfo` |
| Negated booleans | `notFound`, `isNotValid` | Double negatives | `found`, `isValid` |
| Numbers | `user2`, `handleClick2` | What's different? | `adminUser`, `handleDoubleClick` |

## Naming Checklist

```
□ Name reveals intent without needing comments?
□ Searchable in codebase (not too short)?
□ Pronounceable (can discuss verbally)?
□ Follows language/project conventions?
□ No misleading abbreviations?
□ Appropriate scope-based length?
□ No redundant type information?
□ Boolean names imply true/false?
□ Functions describe actions?
□ Classes describe things?
```
