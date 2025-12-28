---
description: Write tests for specified code
allowed-tools: Task, Read, Glob, Grep, Bash, Edit, Write, TodoWrite
argument-hint: <file or component to test>
---

# Write Tests

You are writing comprehensive tests for the specified code.

## Input
Target to test: $ARGUMENTS

## Process

Use the **test-writer** agent:

```
Task: Launch test-writer agent
Prompt: "Write comprehensive tests for: $ARGUMENTS

Process:

1. ANALYZE
   - Read the target code
   - Identify public APIs and interfaces
   - Understand dependencies
   - Check existing test patterns in the project

2. PLAN TEST CASES
   For each function/method/component:
   - Happy path (normal expected use)
   - Edge cases (boundaries, empty, null, undefined)
   - Error cases (invalid input, exceptions, failures)
   - Boundary values (min, max, off-by-one)

3. WRITE TESTS
   - Follow project's testing conventions
   - Use descriptive test names: 'should [behavior] when [condition]'
   - Arrange-Act-Assert pattern
   - Mock external dependencies
   - One assertion per test when possible

4. RUN & VERIFY
   - Run new tests
   - All tests should pass
   - Check coverage if available

Test Types to Consider:
- Unit tests: Test individual functions/methods
- Integration tests: Test module interactions
- Component tests: Test UI components (if applicable)

Output:
- Test file(s) created
- Test cases summary
- Coverage report (if available)
- Any untestable areas noted"

Subagent: test-writer
```

## Test Naming Convention

```
describe('[Component/Function Name]', () => {
  describe('[method/feature]', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Output

At completion, provide:
- List of test files created
- Number of test cases by category
- Coverage metrics (if available)
- Any areas that couldn't be tested

## Follow-up

After tests are written:
- Run all tests to verify they pass
- Review test coverage
- Consider if more tests needed
