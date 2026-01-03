---
name: implementation
description: Code writing best practices for clean, maintainable software. Use when: Writing new code or features, Reviewing code quality, Refactoring existing code, Pair programming with AI.
---

# Implementation

## When to Use

- Writing new functions, classes, or modules
- Reviewing code for quality and maintainability
- Refactoring existing code
- Establishing coding standards
- AI-assisted code generation

## Quick Start

### Clean Code Principles

```
1. Readable > Clever
2. Simple > Complex
3. Explicit > Implicit
4. Consistent > Perfect
```

### Function Design

**Target**: Under 20 lines, 0-3 parameters

```typescript
// Good: Small, focused, clear name
function calculateOrderTotal(items: OrderItem[]): Money {
  return items.reduce((sum, item) => sum.add(item.price), Money.zero());
}

// Bad: Multiple responsibilities, many parameters
function processOrder(items, user, discount, shipping, tax, notify, log) {
  // 50+ lines of mixed concerns
}
```

### AI-Assisted Coding

Treat AI as a **junior developer**, not autopilot:

| AI Task                 | Human Task             |
| ----------------------- | ---------------------- |
| Generate boilerplate    | Review for correctness |
| Suggest implementations | Validate architecture  |
| Write tests             | Verify edge cases      |
| Draft documentation     | Ensure accuracy        |

## Guidelines

### DO

- Write self-documenting code (clear names > comments)
- Keep functions small and focused (single responsibility)
- Use early returns to reduce nesting
- Handle errors explicitly at boundaries
- Follow existing patterns in the codebase
- Review all AI-generated code

### DON'T

- Use magic numbers without constants
- Create functions with more than 3 parameters
- Nest conditionals more than 2 levels deep
- Leave commented-out code
- Trust AI output without verification
- Optimize prematurely

## SOLID Principles (Quick Reference)

| Principle                 | Meaning                   | Violation Sign               |
| ------------------------- | ------------------------- | ---------------------------- |
| **S**ingle Responsibility | One reason to change      | "...and..." in description   |
| **O**pen/Closed           | Extend, don't modify      | Switch statements everywhere |
| **L**iskov Substitution   | Subtypes replaceable      | `instanceof` checks          |
| **I**nterface Segregation | Small, focused interfaces | Implementing unused methods  |
| **D**ependency Inversion  | Depend on abstractions    | Direct `new` of dependencies |

## Error Handling Pattern

```typescript
// At system boundaries: validate and convert
function parseUserInput(raw: string): Result<User, ValidationError> {
  if (!raw) return Err(new ValidationError("Input required"));
  // Validate and return Result
}

// Internal code: assume valid, throw on bugs
function calculateDiscount(user: User): Money {
  if (!user.tier) throw new Error("Bug: User missing tier");
  // Logic assumes valid user
}
```

## References

- [Clean Code](references/clean-code.md) - SOLID, YAGNI, DRY principles
- [Naming Conventions](references/naming.md) - Language-specific naming
- [Error Handling](references/error-handling.md) - Error categories and patterns

## Examples

- [Function Design](examples/function-design.md) - Small functions, parameters
- [Refactoring](examples/refactoring.md) - Extract method, TDD workflow
