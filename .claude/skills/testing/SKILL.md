---
name: testing
description: |
  Comprehensive testing expertise for all technologies: frontend (React, Vue, Angular), backend (Python, Node.js, Go, Java), and mobile (React Native, Flutter, iOS, Android). Covers TDD/BDD methodologies, test strategies, coverage optimization, and modern testing tools (Vitest, Playwright, pytest, Jest).

  Use this skill when:
  - Writing unit tests, integration tests, or E2E tests
  - Implementing TDD (Test-Driven Development) or BDD workflows
  - Setting up testing frameworks (Vitest, Jest, pytest, etc.)
  - Configuring Playwright or Cypress for E2E testing
  - Testing React, Vue, Angular, or Svelte components
  - Testing React Native or Flutter mobile apps
  - Writing API/backend tests for any language
  - Improving test coverage or fixing flaky tests
  - Setting up CI/CD test pipelines
  - Creating mocks, stubs, fixtures, or test data
  - Performance/load testing with k6 or Locust
---

# Testing Skill

## Quick Start

### TDD Workflow (Red-Green-Refactor)
1. **RED**: Write failing test first
2. **GREEN**: Write minimum code to pass
3. **REFACTOR**: Improve code while tests pass

### Test Structure (AAA Pattern)
```
Arrange → Set up test data and dependencies
Act     → Execute the code under test
Assert  → Verify expected outcomes
```

## Testing Pyramid

```
         ┌─────────┐
         │  E2E    │ ← Few (3-10), critical flows
        ─┴─────────┴─
      ┌───────────────┐
      │  Integration  │ ← Many, component interactions
     ─┴───────────────┴─
   ┌───────────────────┐
   │      Unit         │ ← Most, business logic
  ─┴───────────────────┴─
```

## Framework Quick Reference

| Stack | Unit Testing | E2E Testing |
|-------|-------------|-------------|
| React/Vue/Angular | Vitest | Playwright |
| Node.js | Vitest/Jest | Supertest + Playwright |
| Python | pytest | pytest + Playwright |
| Go | testing + testify | - |
| Java | JUnit 5 | REST Assured |
| React Native | Jest | Detox |
| Flutter | dart test | Patrol |

## Detailed References

Read these files based on your needs:

| File | When to Read |
|------|--------------|
| [references/tdd-bdd.md](references/tdd-bdd.md) | Learning TDD/BDD methodologies, writing Gherkin specs |
| [references/frontend.md](references/frontend.md) | Testing React, Vue, Angular; Vitest/Playwright setup |
| [references/backend.md](references/backend.md) | API testing, Python/Node.js/Go/Java tests |
| [references/mobile.md](references/mobile.md) | React Native, Flutter, iOS, Android testing |
| [references/strategies.md](references/strategies.md) | Coverage targets, risk-based testing, CI/CD |
| [references/patterns.md](references/patterns.md) | Testing patterns, mocking, anti-patterns to avoid |
| [references/tools.md](references/tools.md) | Tool comparison, setup commands, configurations |

## Common Patterns

### Unit Test Template

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('does X when Y', () => {
      // Arrange
      const input = createTestData()

      // Act
      const result = methodUnderTest(input)

      // Assert
      expect(result).toBe(expected)
    })
  })
})
```

### Mocking External Dependencies

```typescript
// Mock module
vi.mock('./api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'test' })
}))

// Inline mock
const mockFn = vi.fn().mockReturnValue('result')
```

### E2E Test Template

```typescript
test('user completes checkout', async ({ page }) => {
  await page.goto('/products')
  await page.click('[data-testid="add-to-cart"]')
  await page.click('[data-testid="checkout"]')
  await expect(page.locator('[data-testid="confirmation"]')).toBeVisible()
})
```

## Best Practices Checklist

### Writing Tests
- [ ] Test behavior, not implementation
- [ ] One assertion concept per test
- [ ] Use descriptive test names
- [ ] Keep tests independent (no shared state)
- [ ] Test edge cases and error paths

### Test Quality
- [ ] Aim for 80%+ coverage on core logic
- [ ] Use mutation testing for critical code
- [ ] Fix flaky tests immediately
- [ ] Keep test suite fast (<5min for unit tests)

### CI/CD
- [ ] Run tests on every PR
- [ ] Block merges on test failure
- [ ] Generate and track coverage reports
- [ ] Parallelize test execution

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Flaky tests | Add proper waits, mock time-dependent code |
| Slow tests | Parallelize, use in-memory DBs, reduce E2E |
| Low coverage | Focus on untested branches, use mutation testing |
| Test maintenance | Use Page Objects, factories, shared fixtures |
| Mocking complexity | Use fakes for infrastructure, real objects elsewhere |

## Quick Commands

```bash
# Vitest
npx vitest                    # Run tests
npx vitest --coverage         # With coverage
npx vitest --ui               # Interactive UI

# Playwright
npx playwright test           # Run E2E tests
npx playwright codegen        # Generate tests
npx playwright show-report    # View report

# pytest
pytest                        # Run tests
pytest --cov=src              # With coverage
pytest -x                     # Stop on first failure
```
