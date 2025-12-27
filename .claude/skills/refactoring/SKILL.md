---
name: refactoring
description: |
  Safe code refactoring techniques for improving code quality without changing behavior.
  Use PROACTIVELY when:
  - Code exhibits smells (long methods, duplicate code, large classes, feature envy)
  - Improving readability, maintainability, or testability
  - Reducing technical debt or complexity
  - Preparing code for new features or changes
  - Extracting/inlining methods, classes, or variables
  - Renaming for clarity
  - Restructuring modules or components
  - Modernizing legacy code patterns
  Applies to ALL technologies: frontend, backend, mobile, data, infrastructure.
---

# Refactoring Skill

Transform code structure without changing external behavior. The goal: code that is easier to understand, modify, and extend.

## Golden Rules

```
1. NEVER change behavior - refactoring ≠ fixing bugs or adding features
2. ALWAYS have tests before refactoring - no tests = write them first
3. SMALL STEPS - one change at a time, test after each
4. COMMIT FREQUENTLY - atomic commits for easy rollback
5. REFACTOR OR ADD FEATURES - never both simultaneously
```

## The Refactoring Process

### Phase 1: Preparation

```
[ ] Verify test coverage exists (aim for >80% on refactored code)
[ ] Run all tests - must pass before starting
[ ] Create feature branch: refactor/[scope]-[goal]
[ ] Identify code smells (see references/code-smells.md)
[ ] Define clear goal: "Make X easier to Y"
```

### Phase 2: Execute (Small Steps Loop)

```
REPEAT {
  1. Make ONE small change
  2. Run tests
  3. IF pass → commit with descriptive message
  4. IF fail → revert immediately, try different approach
}
```

### Phase 3: Verify

```
[ ] All tests pass
[ ] No behavior changes (diff review)
[ ] Code quality improved (measurable)
[ ] No new code smells introduced
[ ] Documentation updated if public API changed
```

## Quick Reference

| Need | Reference File |
|------|----------------|
| Identify what's wrong | [references/code-smells.md](references/code-smells.md) |
| How to fix it | [references/techniques.md](references/techniques.md) |
| Design patterns to apply | [references/patterns.md](references/patterns.md) |
| Step-by-step checklists | [references/checklists.md](references/checklists.md) |
| Tooling & automation | [references/tools.md](references/tools.md) |

## Common Refactoring Scenarios

### Scenario: Long Method (>20-40 lines)
```
1. Identify logical blocks within method
2. Extract each block → new method with descriptive name
3. Method names become documentation
4. See: references/techniques.md#extract-method
```

### Scenario: Duplicate Code
```
1. Identify all duplicates
2. Extract to shared method/function/module
3. Replace all occurrences
4. See: references/techniques.md#extract-method
```

### Scenario: Large Class (>300-500 lines)
```
1. Identify distinct responsibilities
2. Group related fields and methods
3. Extract each group → new class
4. Use composition or inheritance
5. See: references/techniques.md#extract-class
```

### Scenario: Feature Envy
```
1. Method uses another class's data extensively
2. Move method to the class it envies
3. Or extract the envied data into shared abstraction
4. See: references/code-smells.md#feature-envy
```

### Scenario: Primitive Obsession
```
1. Identify primitives representing domain concepts
2. Create value objects/types (Email, Money, PhoneNumber)
3. Move validation into value objects
4. See: references/code-smells.md#primitive-obsession
```

## When NOT to Refactor

```
❌ No tests exist (write tests first)
❌ Unclear requirements (clarify first)
❌ Active deadline pressure (schedule later)
❌ Code will be deleted soon
❌ During debugging (fix bug first, then refactor)
❌ Major rewrite needed (refactoring ≠ rewriting)
```

## Technology-Agnostic Principles

These principles apply regardless of language or framework:

### Universal Principles
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple)
- Prefer composition over inheritance
- Depend on abstractions, not concretions

### Frontend (React, Vue, Angular, Svelte, etc.)
- Extract reusable components
- Separate logic from presentation (hooks, composables, services)
- Consolidate state management
- See: [references/patterns.md#frontend-patterns](references/patterns.md#frontend-patterns)

### Backend (Node, Python, Java, Go, Rust, etc.)
- Layer architecture (controller → service → repository)
- Extract middleware/decorators
- Consolidate error handling
- See: [references/patterns.md#backend-patterns](references/patterns.md#backend-patterns)

### Mobile (iOS, Android, React Native, Flutter)
- Extract ViewModels/Presenters
- Consolidate navigation logic
- Abstract platform-specific code
- See: [references/patterns.md#mobile-patterns](references/patterns.md#mobile-patterns)

### Data/Infrastructure (Terraform, SQL, ETL, etc.)
- Parameterize configurations
- Extract reusable modules
- Consolidate resource definitions
- See: [references/patterns.md#infrastructure-patterns](references/patterns.md#infrastructure-patterns)
