# Unit Test Examples

## AAA Pattern

### Basic Structure

```typescript
describe("Calculator", () => {
  describe("add", () => {
    it("should add two positive numbers", () => {
      // Arrange
      const calculator = new Calculator();
      const a = 5;
      const b = 3;

      // Act
      const result = calculator.add(a, b);

      // Assert
      expect(result).toBe(8);
    });

    it("should handle negative numbers", () => {
      // Arrange
      const calculator = new Calculator();

      // Act
      const result = calculator.add(-5, 3);

      // Assert
      expect(result).toBe(-2);
    });

    it("should handle decimal numbers", () => {
      // Arrange
      const calculator = new Calculator();

      // Act
      const result = calculator.add(0.1, 0.2);

      // Assert
      expect(result).toBeCloseTo(0.3);
    });
  });
});
```

### With Setup/Teardown

```typescript
describe("UserService", () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Arrange (shared setup)
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    userService = new UserService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should find user by id", async () => {
    // Arrange
    const expectedUser = { id: "1", name: "Alice" };
    mockRepository.findById.mockResolvedValue(expectedUser);

    // Act
    const result = await userService.getUser("1");

    // Assert
    expect(result).toEqual(expectedUser);
    expect(mockRepository.findById).toHaveBeenCalledWith("1");
  });
});
```

## Mocking Strategies

### Manual Mocks

```typescript
// Simple mock object
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock with implementation
const mockCache = {
  get: jest.fn((key: string) => {
    if (key === "existing") return "cached-value";
    return null;
  }),
  set: jest.fn(),
};
```

### Jest Mocks

```typescript
// Mock module
jest.mock("./database");

// Mock with factory
jest.mock("./api-client", () => ({
  ApiClient: jest.fn().mockImplementation(() => ({
    fetch: jest.fn().mockResolvedValue({ data: "test" }),
  })),
}));

// Spy on existing method
const consoleSpy = jest.spyOn(console, "error").mockImplementation();

// Mock return values
mockFunction.mockReturnValue("value");
mockFunction.mockReturnValueOnce("first").mockReturnValueOnce("second");
mockFunction.mockResolvedValue(asyncValue);
mockFunction.mockRejectedValue(new Error("fail"));
```

### Partial Mocks

```typescript
// Mock only specific methods
jest.mock("./user-service", () => {
  const actual = jest.requireActual("./user-service");
  return {
    ...actual,
    sendEmail: jest.fn(), // Only mock this
  };
});
```

### Mock Assertions

```typescript
// Was called
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(3);

// Called with specific arguments
expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
expect(mockFn).toHaveBeenLastCalledWith("last-arg");
expect(mockFn).toHaveBeenNthCalledWith(2, "second-call-arg");

// Call order
expect(mockFn1).toHaveBeenCalledBefore(mockFn2);
```

## Testing Async Code

### Promises

```typescript
// Using async/await
it("should fetch user data", async () => {
  const result = await fetchUser("123");
  expect(result.name).toBe("Alice");
});

// Using resolves/rejects
it("should resolve with user data", () => {
  return expect(fetchUser("123")).resolves.toEqual({ name: "Alice" });
});

it("should reject for invalid id", () => {
  return expect(fetchUser("invalid")).rejects.toThrow("User not found");
});
```

### Timers

```typescript
describe("debounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should delay function execution", () => {
    const callback = jest.fn();
    const debounced = debounce(callback, 1000);

    debounced();
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
```

## Testing Errors

### Thrown Errors

```typescript
it("should throw for invalid input", () => {
  expect(() => divide(10, 0)).toThrow("Division by zero");
  expect(() => divide(10, 0)).toThrow(DivisionError);
  expect(() => divide(10, 0)).toThrowError(/zero/);
});

// Async errors
it("should reject for missing user", async () => {
  await expect(getUser("invalid")).rejects.toThrow("Not found");
});
```

### Error Properties

```typescript
it("should include error code", () => {
  try {
    validateEmail("invalid");
    fail("Expected error to be thrown");
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.code).toBe("INVALID_EMAIL");
    expect(error.field).toBe("email");
  }
});
```

## Parameterized Tests

### Using test.each

```typescript
describe("isValidEmail", () => {
  test.each([
    ["user@example.com", true],
    ["invalid", false],
    ["user@", false],
    ["@example.com", false],
    ["user.name+tag@example.co.uk", true],
  ])("isValidEmail(%s) should return %s", (email, expected) => {
    expect(isValidEmail(email)).toBe(expected);
  });
});

// With named parameters
test.each`
  input | expected
  ${1}  | ${"one"}
  ${2}  | ${"two"}
  ${3}  | ${"three"}
`("numberToWord($input) returns $expected", ({ input, expected }) => {
  expect(numberToWord(input)).toBe(expected);
});
```

### Describe.each

```typescript
describe.each([
  { currency: "USD", symbol: "$" },
  { currency: "EUR", symbol: "€" },
  { currency: "GBP", symbol: "£" },
])("formatCurrency with $currency", ({ currency, symbol }) => {
  it(`should use ${symbol} symbol`, () => {
    expect(formatCurrency(100, currency)).toContain(symbol);
  });

  it("should format with two decimal places", () => {
    expect(formatCurrency(100, currency)).toMatch(/\d+\.\d{2}/);
  });
});
```

## Property-Based Testing

### With fast-check

```typescript
import fc from "fast-check";

describe("sort", () => {
  it("should return array of same length", () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const sorted = sort(arr);
        return sorted.length === arr.length;
      })
    );
  });

  it("should be idempotent", () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const once = sort(arr);
        const twice = sort(once);
        return JSON.stringify(once) === JSON.stringify(twice);
      })
    );
  });

  it("should maintain elements", () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const sorted = sort(arr);
        return arr.every((x) => sorted.includes(x));
      })
    );
  });
});
```

## Snapshot Testing

### Basic Snapshots

```typescript
it("should render correctly", () => {
  const tree = render(<UserCard user={mockUser} />);
  expect(tree).toMatchSnapshot();
});

// Inline snapshot
it("should format address", () => {
  expect(formatAddress(address)).toMatchInlineSnapshot(`
    "123 Main St
    Apt 4B
    New York, NY 10001"
  `);
});
```

### Custom Serializers

```typescript
expect.addSnapshotSerializer({
  test: (val) => val instanceof Date,
  serialize: (val) => `Date(${val.toISOString()})`,
});
```

## Test Organization

### File Structure

```
src/
├── user/
│   ├── user.service.ts
│   ├── user.service.test.ts     # Co-located
│   └── user.repository.ts
└── __tests__/                    # Or separate folder
    └── user.service.test.ts

# Test file naming
*.test.ts
*.spec.ts
*.test.tsx (React components)
```

### Grouping Tests

```typescript
describe("UserService", () => {
  describe("createUser", () => {
    describe("with valid input", () => {
      it("should create user", () => {});
      it("should hash password", () => {});
      it("should send welcome email", () => {});
    });

    describe("with invalid input", () => {
      it("should reject empty email", () => {});
      it("should reject weak password", () => {});
    });
  });

  describe("deleteUser", () => {
    it("should remove user from database", () => {});
    it("should revoke all sessions", () => {});
  });
});
```

## Best Practices Checklist

- [ ] One concept per test
- [ ] Descriptive test names
- [ ] Independent tests (no shared state)
- [ ] Fast execution (< 100ms each)
- [ ] Deterministic (no flakiness)
- [ ] Test behavior, not implementation
- [ ] Clear AAA structure
- [ ] Minimal mocking
- [ ] Meaningful assertions
