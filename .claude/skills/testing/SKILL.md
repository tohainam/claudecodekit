---
name: testing
description: Testing patterns, strategies, and best practices. Use when: Writing tests for new code, Reviewing test coverage, Choosing testing approach (TDD, BDD), Setting up test infrastructure.
---

# Testing

## When to Use

- Writing tests for new features
- Improving test coverage
- Choosing between testing strategies
- Setting up test infrastructure
- Debugging test failures
- Reviewing test quality

## Quick Start

### Testing Philosophy

```
Tests are documentation that never lies.
Tests are a safety net for refactoring.
Tests give confidence to ship.
```

### Test Pyramid vs Testing Trophy

**Traditional Pyramid** (Google, 70/20/10):

```
        /\
       /  \     E2E (10%)
      /----\
     /      \   Integration (20%)
    /--------\
   /          \ Unit (70%)
  --------------
```

**Testing Trophy** (Kent C. Dodds):

```
         __
        |  |    E2E
     ___|  |___
    |          |   Integration (focus)
    |__________|
        ||        Unit
        ||
     Static Types
```

### Quick Test Template (AAA Pattern)

```typescript
describe("FeatureName", () => {
  it("should [expected behavior] when [condition]", () => {
    // Arrange: Set up test data
    const input = createTestInput();

    // Act: Execute the code under test
    const result = functionUnderTest(input);

    // Assert: Verify the outcome
    expect(result).toEqual(expectedOutput);
  });
});
```

## Guidelines

### DO

- Write tests before or alongside code (TDD/BDD)
- Test behavior, not implementation
- Use descriptive test names that explain intent
- Keep tests independent and isolated
- Test edge cases and error scenarios
- Maintain 80-90% meaningful coverage

### DON'T

- Test implementation details (private methods)
- Write tests that depend on execution order
- Mock everything (integration tests matter)
- Ignore flaky tests (fix or delete them)
- Over-test trivial code (getters/setters)
- Chase 100% coverage at expense of quality

## Test Types Quick Reference

| Type            | Scope                 | Speed  | Confidence  | When to Use            |
| --------------- | --------------------- | ------ | ----------- | ---------------------- |
| **Unit**        | Single function/class | Fast   | Low-Medium  | Pure logic, algorithms |
| **Integration** | Multiple components   | Medium | Medium-High | Features, user flows   |
| **E2E**         | Entire system         | Slow   | High        | Critical paths         |
| **Contract**    | API boundaries        | Fast   | Medium      | Microservices          |

## Coverage Guidelines

### Target: 80-90% Meaningful Coverage

**What to Test**:

- Business logic
- Edge cases
- Error handling
- Integration points
- User-facing features

**What NOT to Test**:

- Framework code
- Third-party libraries
- Configuration files
- Simple getters/setters
- Generated code

### Mutation Testing

Verify test quality by introducing bugs:

```bash
# Using Stryker (JS/TS)
npx stryker run

# Target: 60-80% mutation score
```

## References

- [Testing Pyramid](references/testing-pyramid.md) - Test type distribution
- [TDD & BDD](references/tdd-bdd.md) - Test-driven methodologies
- [Test Coverage](references/test-coverage.md) - Coverage strategies

## Examples

- [Unit Tests](examples/unit-tests.md) - AAA pattern, mocking
- [Integration Tests](examples/integration-tests.md) - API testing, TestContainers
