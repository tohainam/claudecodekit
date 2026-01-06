# Code Quality Standards

## DO

- Write clean, readable, self-documenting code
- Follow existing patterns in the codebase
- Handle errors explicitly with meaningful messages
- Keep functions focused and single-purpose
- Use descriptive naming (verbs for functions, nouns for variables)

## DON'T

- Leave commented-out code
- Use magic numbers without constants
- Catch exceptions without handling them
- Create deeply nested conditionals
- Duplicate code - extract to shared functions

## Error Handling

- Always handle potential failure points
- Provide context in error messages
- Log errors with sufficient detail for debugging
- Fail fast and fail loudly in development

## Secure Coding

- Validate all external input
- Use parameterized queries for database operations
- Escape output in templates
- See `safety.md` for credentials and sensitive data handling

## Function Length

| Guideline | Recommendation |
|-----------|----------------|
| Ideal | 5-10 lines |
| Average max | 30 lines |
| Absolute max | 60 lines |

**Key Insight**: Purpose matters more than size. A well-organized long function beats a scattered short one.

## Composition

- Prefer composition over inheritance by default
- Use small, focused interfaces
- Inject dependencies rather than hardcoding them

## AI-Era Readability

- Code must be readable by humans AND AI tools
- Human review is critical for AI-generated code
- Provide rich context in comments for non-obvious decisions
- Work incrementally when using AI assistants

## Related Rules

- See `design-principles.md` for YAGNI, KISS, DRY, SOLID, Law of Demeter
- See `anti-patterns.md` for over-engineering, premature abstraction, code smells
