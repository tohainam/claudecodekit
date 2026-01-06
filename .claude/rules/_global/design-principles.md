# Design Principles

Core software design principles for clean, maintainable code.

## Core Principles

### YAGNI (You Aren't Gonna Need It)

- Implement features only when actually needed
- Don't build for hypothetical future requirements
- Ask: "Is this necessary right now?" If not, don't build it.

### KISS (Keep It Simple, Stupid)

- Simplest solution that works is usually best
- Avoid over-engineering
- **SINE**: "Simple is Not Easy" - simple means few moving parts, not quick to write

### DRY (Don't Repeat Yourself) - With Nuance

| Principle | Description | When to Use |
|-----------|-------------|-------------|
| **DRY** | Single authoritative representation | Clear, stable abstractions |
| **WET** | Write Everything Twice | Allow 2 duplications before abstracting |
| **AHA** | Avoid Hasty Abstractions | When the "right" abstraction isn't clear |

**Key Insight**: Wrong abstraction is worse than no abstraction.

## SOLID (Modern 2025 Interpretation)

| Principle | Modern Application |
|-----------|-------------------|
| **S** - Single Responsibility | Applies to services and modules, not just classes |
| **O** - Open/Closed | Design for extension through composition |
| **L** - Liskov Substitution | Critical for API contracts |
| **I** - Interface Segregation | Smaller, focused interfaces |
| **D** - Dependency Inversion | Foundation of Clean Architecture |

### Warnings

- **Pattern cargo culting**: Don't introduce factories/DI without actual need
- **Hyper-fragmentation**: Don't split so finely that control flow becomes unclear

## Additional Principles

### Law of Demeter

"Only talk to your immediate friends."

**Simple Rule**: Use only one dot. `a.m().n()` breaks the law; `a.m()` does not.

**Exceptions**: Fluent interfaces, Builder pattern (if locally instantiated)

### Composition Over Inheritance

| Aspect | Composition | Inheritance |
|--------|-------------|-------------|
| Flexibility | Mix and match freely | Rigid hierarchy |
| Maintainability | Changes less likely to ripple | Fragile Base Class Problem |
| Testing | Easy to test in isolation | Requires full hierarchy |

**Use inheritance only for**: Clear "is-a" relationships, stable base classes, framework extension points.

### Write for Deletion

- Every line of code has maintenance cost
- Write code that's easy to delete, not easy to extend
- Keep modules loosely coupled and disposable

**Greg Young's Rule**: No self-contained part should take more than a week for someone unfamiliar to rewrite.

## Related Rules

- See `anti-patterns.md` for what to avoid
- See `code-quality.md` for implementation standards
