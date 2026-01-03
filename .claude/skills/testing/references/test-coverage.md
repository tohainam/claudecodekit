# Test Coverage

## Coverage Metrics

### Types of Coverage

| Metric                 | Description              | Target |
| ---------------------- | ------------------------ | ------ |
| **Line Coverage**      | % of lines executed      | 80-90% |
| **Branch Coverage**    | % of if/else paths taken | 75-85% |
| **Function Coverage**  | % of functions called    | 90-95% |
| **Statement Coverage** | % of statements executed | 80-90% |

### Example

```typescript
function processOrder(order: Order): Result {
  // Line 1
  if (order.items.length === 0) {
    // Line 2, Branch A
    return { error: "Empty order" }; // Line 3
  } // Line 4

  const total = calculateTotal(order.items); // Line 5

  if (total > 1000) {
    // Line 6, Branch B
    return { result: "premium", total }; // Line 7
  } // Line 8

  return { result: "standard", total }; // Line 9
}
```

**Test 1**: Order with items, total = 500

- Lines covered: 1, 2, 5, 6, 9
- Line coverage: 5/9 = 56%
- Branch coverage: 2/4 = 50% (A-false, B-false)

**Test 2**: Empty order

- Lines covered: 1, 2, 3
- Combined with Test 1: 6/9 = 67%
- Branch coverage: 3/4 = 75% (A-true, A-false, B-false)

**Test 3**: Order with total > 1000

- Lines covered: 1, 2, 5, 6, 7
- Combined: 9/9 = 100%
- Branch coverage: 4/4 = 100%

## Coverage Targets

### Recommended Targets (2025)

| Project Type     | Minimum | Target | Stretch |
| ---------------- | ------- | ------ | ------- |
| Critical systems | 90%     | 95%    | 98%     |
| Web applications | 70%     | 80%    | 90%     |
| CLI tools        | 75%     | 85%    | 95%     |
| Libraries        | 85%     | 90%    | 95%     |
| Prototypes       | 50%     | 60%    | -       |

### Coverage is Not Quality

**100% coverage doesn't mean**:

- All bugs are found
- Edge cases are handled
- Tests are meaningful
- Code is correct

**Good coverage means**:

- Code paths are exercised
- Obvious bugs are caught
- Refactoring is safer
- Missing tests are visible

## What to Test

### High Priority (Test Thoroughly)

- **Business logic**: Rules, calculations, workflows
- **Data transformations**: Parsing, formatting, mapping
- **Error handling**: Edge cases, validation, failures
- **Security-sensitive**: Auth, permissions, sanitization
- **Integration points**: APIs, databases, external services

### Medium Priority

- **UI components**: User interactions, rendering
- **Configuration**: Settings, feature flags
- **Utilities**: Helpers, formatters

### Low Priority (Don't Over-Test)

- **Framework code**: Router setup, middleware config
- **Simple getters/setters**: Trivial accessors
- **Type definitions**: TypeScript interfaces
- **Constants**: Static configuration
- **Third-party libraries**: Already tested

### Skip Testing

- **Generated code**: Auto-generated types, migrations
- **One-time scripts**: Data migrations (test manually)
- **Dead code**: Delete it instead

## Mutation Testing

### What Is It?

Mutation testing verifies test quality by introducing bugs (mutants) and checking if tests catch them.

```typescript
// Original code
function isAdult(age: number): boolean {
  return age >= 18;
}

// Mutants (introduced bugs)
return age > 18; // Changed >= to >
return age >= 17; // Changed 18 to 17
return age <= 18; // Changed >= to <=
return true; // Removed condition
```

### Mutation Score

```
Mutation Score = Killed Mutants / Total Mutants × 100
```

| Score  | Quality           |
| ------ | ----------------- |
| 90%+   | Excellent         |
| 80-90% | Good              |
| 60-80% | Acceptable        |
| < 60%  | Needs improvement |

### Running Mutation Tests

```bash
# JavaScript/TypeScript (Stryker)
npm install --save-dev @stryker-mutator/core
npx stryker init
npx stryker run

# Python (mutmut)
pip install mutmut
mutmut run

# Java (PIT)
mvn org.pitest:pitest-maven:mutationCoverage
```

### Mutation Testing Tips

1. **Start small**: Run on critical modules first
2. **Set thresholds**: Fail CI if score drops
3. **Review surviving mutants**: They reveal weak tests
4. **Don't chase 100%**: Diminishing returns

## Coverage Tools

### JavaScript/TypeScript

```bash
# Jest (built-in)
jest --coverage

# Vitest
vitest --coverage

# NYC/Istanbul
nyc npm test
```

### Python

```bash
# pytest-cov
pytest --cov=mypackage --cov-report=html

# coverage.py
coverage run -m pytest
coverage report
coverage html
```

### Go

```bash
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

## Coverage Reports

### HTML Report Structure

```
coverage/
├── index.html          # Summary
├── lcov-report/
│   ├── index.html     # Detailed report
│   └── src/
│       ├── module1.ts.html
│       └── module2.ts.html
└── lcov.info          # Machine-readable
```

### Interpreting Reports

```
File           | % Stmts | % Branch | % Funcs | % Lines |
---------------|---------|----------|---------|---------|
All files      |   85.5  |   72.3   |   91.2  |   85.5  |
 src/          |   88.2  |   75.0   |   95.0  |   88.2  |
  auth.ts      |   92.0  |   80.0   |  100.0  |   92.0  |  ✅
  cart.ts      |   65.0  |   50.0   |   75.0  |   65.0  |  ⚠️
  utils.ts     |  100.0  |  100.0   |  100.0  |  100.0  |  ✅
```

### Red Flags

| Pattern                   | Concern                    |
| ------------------------- | -------------------------- |
| < 50% in business logic   | Critical undertesting      |
| 100% everywhere           | Tests might be too shallow |
| Many uncovered branches   | Missing edge cases         |
| Covered but no assertions | False confidence           |

## CI Integration

### GitHub Actions

```yaml
- name: Test with coverage
  run: npm test -- --coverage --coverageReporters=lcov

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    fail_ci_if_error: true
    minimum_coverage: 80
```

### Coverage Enforcement

```yaml
# jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 85,
      lines: 80,
      statements: 80,
    },
    './src/critical/': {
      branches: 90,
      lines: 90,
    },
  },
};
```

## Best Practices

### Do

- Set realistic, incremental targets
- Focus on meaningful coverage
- Use mutation testing for quality
- Review uncovered code regularly
- Automate coverage checks in CI

### Don't

- Chase 100% coverage blindly
- Write tests just for coverage
- Ignore branch coverage
- Skip testing error paths
- Disable coverage thresholds
