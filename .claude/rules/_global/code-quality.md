# Code Quality Rules

These rules define coding standards and best practices that Claude should follow when writing or reviewing code.

## Naming Conventions

### Variables & Functions
- Use `camelCase` for variables and functions: `getUserData`, `isValid`, `totalCount`
- Use descriptive names that reveal intent: `fetchUserProfile` not `getData`
- Boolean variables should start with `is`, `has`, `can`, `should`: `isActive`, `hasPermission`

### Classes & Types
- Use `PascalCase` for classes, interfaces, types, enums: `UserService`, `ApiResponse`
- Prefix interfaces with `I` only if project convention requires it
- Use descriptive type names: `CreateUserRequest`, `PaymentStatus`

### Files & Directories
- Use `kebab-case` for file names: `user-service.ts`, `api-client.js`
- Match file name to primary export: `UserService` class in `user-service.ts`
- Group related files in descriptive directories

### Constants
- Use `SCREAMING_SNAKE_CASE` for true constants: `MAX_RETRY_COUNT`, `API_BASE_URL`
- Use `camelCase` for configuration objects

## Code Structure

### Functions
- Keep functions small and focused (single responsibility)
- Limit parameters to 3-4; use options object for more
- Return early to avoid deep nesting
- Use descriptive function names that explain what, not how

### Classes
- Keep classes focused on a single responsibility
- Prefer composition over inheritance
- Use dependency injection for testability
- Limit public API surface

### Files
- One primary export per file
- Keep files under 300 lines; split if larger
- Group imports: external, internal, relative
- Export types/interfaces alongside implementations

## Clean Code Principles

### DRY (Don't Repeat Yourself)
- Extract repeated code into reusable functions
- Use constants for repeated values
- Create shared utilities for common operations

### KISS (Keep It Simple)
- Prefer simple solutions over clever ones
- Avoid premature optimization
- Write code for humans first, machines second

### YAGNI (You Aren't Gonna Need It)
- Only implement what's currently needed
- Don't add features "just in case"
- Refactor when requirements change

## Anti-Patterns to Avoid

### Code Smells
- Long functions (> 50 lines)
- Deep nesting (> 3 levels)
- Magic numbers/strings (use constants)
- God classes (classes that do everything)
- Feature envy (methods using other class's data excessively)

### Common Mistakes
- Ignoring error handling
- Using `any` type excessively (TypeScript)
- Mutating function parameters
- Side effects in pure functions
- Hardcoding configuration values

### Security Issues
- Never log sensitive data (passwords, tokens, PII)
- Validate and sanitize all user input
- Use parameterized queries for databases
- Don't expose internal errors to users

## Error Handling

### Best Practices
- Catch specific errors, not generic ones
- Provide meaningful error messages
- Log errors with context for debugging
- Use custom error classes for domain errors
- Always handle promises (async/await or .catch())

### Pattern
```
try {
  // operation
} catch (error) {
  // log with context
  // handle or rethrow with more context
}
```

## Comments & Documentation

### When to Comment
- Explain WHY, not WHAT (code shows what)
- Document complex algorithms
- Note non-obvious behavior or edge cases
- Mark TODOs with context and ticket reference

### When NOT to Comment
- Obvious code that's self-documenting
- Commented-out code (delete it)
- Comments that duplicate function/variable names
