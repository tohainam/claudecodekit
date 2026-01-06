# Anti-Patterns to Avoid

Common pitfalls that lead to unmaintainable code.

## Over-Engineering vs Under-Engineering

| Trap | Signs | Consequence |
|------|-------|-------------|
| **Over-engineering** | Speculative features, excessive abstraction | Slower development, harder onboarding |
| **Under-engineering** | Rushed code, ignored edge cases | Technical debt, fragile systems |

**Sweet Spot**: "Build for today, design with flexibility for tomorrow."

## Premature Optimization

> "Premature optimization is the root of all evil." — Donald Knuth

**DON'T**:
- Optimize before profiling
- Sacrifice clarity for speed without evidence
- Micro-optimize non-bottleneck code

**DO**:
- Write clear code first
- Profile to find actual bottlenecks
- Optimize only what matters

## Premature Abstraction

**Signs you're abstracting too early**:
- Interface with only one implementation
- Classes with `Impl` suffix
- Abstractions based on assumptions, not patterns

**Solution**: Allow duplication until the pattern emerges. Wrong abstraction is worse than none.

## Code Smells

### God Objects/Classes

- Centralizes too much functionality
- Hard to make isolated changes
- Holds more state than necessary

**Priority**: Remove God Class smell first—it enables other harmful patterns.

### Shotgun Surgery

- Single change requires editing multiple files
- Often from overzealous SRP application
- Fragments cohesive responsibilities

**Fix**: Group related code together. Cohesion > separation.

### Feature Envy

- Method uses more of another class than its own
- Indicates misplaced responsibility

**Fix**: Move the method to where the data lives.

## Pattern Cargo Culting

**DON'T** introduce patterns without actual need:
- Factory when there's only one creation path
- Dependency injection when dependencies never change
- Abstract base class for single implementation
- Repository pattern for simple CRUD

**DO**:
- Solve the problem at hand
- Add patterns when complexity demands it
- Justify each layer of indirection

## Quick Reference

| Anti-Pattern | Key Question |
|--------------|--------------|
| Over-engineering | "Do I need this now?" |
| Premature optimization | "Have I profiled this?" |
| Premature abstraction | "Is there a pattern yet?" |
| God object | "Does this do too much?" |
| Shotgun surgery | "Why change many files?" |
| Feature envy | "Where does this data live?" |
| Cargo culting | "Why this pattern here?" |

## Related Rules

- See `design-principles.md` for positive principles
- See `code-quality.md` for implementation standards
