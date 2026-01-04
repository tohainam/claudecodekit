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
