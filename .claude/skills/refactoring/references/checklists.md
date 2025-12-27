# Refactoring Checklists

Step-by-step checklists for common refactoring scenarios. Use these to ensure safe, systematic refactoring.

## Table of Contents

1. [Pre-Refactoring Checklist](#pre-refactoring-checklist)
2. [Extract Method Checklist](#extract-method-checklist)
3. [Extract Class Checklist](#extract-class-checklist)
4. [Rename Refactoring Checklist](#rename-refactoring-checklist)
5. [Move Method/Field Checklist](#move-methodfield-checklist)
6. [Large-Scale Refactoring Checklist](#large-scale-refactoring-checklist)
7. [Legacy Code Refactoring Checklist](#legacy-code-refactoring-checklist)
8. [Post-Refactoring Checklist](#post-refactoring-checklist)
9. [Code Review Checklist (for refactoring PRs)](#code-review-checklist-for-refactoring-prs)

---

## Pre-Refactoring Checklist

Run through this before ANY refactoring.

```
BEFORE STARTING
===============

[ ] 1. DEFINE THE GOAL
    └── What specific improvement? (readability, testability, etc.)
    └── How will you measure success?
    └── Is this the right time to refactor?

[ ] 2. VERIFY TESTS EXIST
    └── Run existing tests - do they pass?
    └── Check coverage on code to be refactored
    └── If coverage < 80%, write tests FIRST
    └── Tests must pin current behavior

[ ] 3. UNDERSTAND THE CODE
    └── Read all code that will change
    └── Identify all callers/dependents
    └── Map the current flow
    └── Document any "gotchas" or edge cases

[ ] 4. VERSION CONTROL
    └── Commit current state
    └── Create feature branch: refactor/[scope]-[goal]
    └── Ensure clean working directory

[ ] 5. SET UP FOR SMALL STEPS
    └── Plan a sequence of small changes
    └── Each step should be independently testable
    └── Have a rollback plan

READY TO START? All boxes checked?
```

---

## Extract Method Checklist

For extracting code into a new method/function.

```
EXTRACT METHOD
==============

IDENTIFY
[ ] 1. Mark the code to extract
[ ] 2. Verify it has a single clear purpose
[ ] 3. Check no interleaving with surrounding code

ANALYZE VARIABLES
[ ] 4. List local variables READ by extracted code
[ ] 5. List local variables WRITTEN by extracted code
[ ] 6. Check for temporary variables that should be queries

PREPARE
[ ] 7. If multiple variables written → consider Extract Object
[ ] 8. If code modifies parameter → consider return value instead

CREATE
[ ] 9. Create new method with intention-revealing name
    └── Name should describe WHAT, not HOW
    └── Avoid generic names (process, handle, do)
[ ] 10. Copy extracted code to new method
[ ] 11. Add parameters for all read variables
[ ] 12. Add return statement for written variables

CONNECT
[ ] 13. Replace original code with method call
[ ] 14. Pass required arguments
[ ] 15. Handle return value

VERIFY
[ ] 16. Compile/parse (catch syntax errors)
[ ] 17. Run tests
[ ] 18. If tests pass → commit
[ ] 19. If tests fail → revert, analyze, try again

CLEAN UP
[ ] 20. Look for similar code elsewhere
[ ] 21. Consider if new method should be in different class
[ ] 22. Add documentation if public API
```

---

## Extract Class Checklist

For splitting a large class into multiple classes.

```
EXTRACT CLASS
=============

ANALYZE
[ ] 1. Identify distinct responsibility to extract
[ ] 2. List all fields related to that responsibility
[ ] 3. List all methods that use those fields
[ ] 4. Check for fields/methods used by both (requires interface)

PREPARE
[ ] 5. Run all tests - must pass
[ ] 6. Decide relationship: composition or inheritance?
[ ] 7. Choose name for new class (noun, describes concept)

CREATE NEW CLASS
[ ] 8. Create new class with chosen name
[ ] 9. Add link from old class to new class
    └── Private field in old class
    └── Initialize in constructor

MOVE FIELDS (one at a time)
[ ] 10. For each field:
    └── Move field to new class
    └── Create getter/setter in new class
    └── Update old class to delegate
    └── Run tests
    └── Commit

MOVE METHODS (one at a time)
[ ] 11. For each method:
    └── Move method to new class
    └── Update old class to delegate
    └── Run tests
    └── Commit

REFINE INTERFACE
[ ] 12. Review new class's public methods
[ ] 13. Make internal methods private
[ ] 14. Consider if link should be bidirectional
[ ] 15. Update documentation

VERIFY
[ ] 16. All tests pass
[ ] 17. Old class is simpler
[ ] 18. New class has single responsibility
[ ] 19. Coupling is reasonable
```

---

## Rename Refactoring Checklist

For renaming variables, methods, classes, or files.

```
RENAME REFACTORING
==================

BEFORE RENAME
[ ] 1. Choose new name that reveals intent
    └── For methods: verb phrase (calculateTotal, fetchUser)
    └── For classes: noun phrase (OrderProcessor, UserRepository)
    └── For variables: noun (user, orderItems, isActive)
[ ] 2. Check new name isn't already used
[ ] 3. Search for all usages (including strings, configs)

EXECUTE RENAME
[ ] 4. Use IDE's rename refactoring if available
    └── IntelliJ: Shift+F6
    └── VS Code: F2
    └── Eclipse: Alt+Shift+R
[ ] 5. If manual:
    └── Rename definition
    └── Update all references
    └── Update imports/requires
    └── Update tests
    └── Update documentation
    └── Update configuration files
    └── Update database columns (if ORM)

VERIFY
[ ] 6. Compile/parse all affected files
[ ] 7. Run tests
[ ] 8. Search codebase for old name (should be zero)
[ ] 9. Check string literals and comments
[ ] 10. Commit with message: "refactor: rename X to Y"

POST-RENAME
[ ] 11. Update external documentation if needed
[ ] 12. Notify team if public API changed
[ ] 13. Consider deprecation period for libraries
```

---

## Move Method/Field Checklist

For moving methods or fields to a different class.

```
MOVE METHOD/FIELD
=================

DECIDE TARGET
[ ] 1. Identify the class that uses this most
[ ] 2. Consider where the data it needs lives
[ ] 3. Check if move reduces coupling

PREPARE (METHOD)
[ ] 4. Identify all features of source class used by method
[ ] 5. Check if method overrides/is overridden
[ ] 6. Decide how moved method will access needed features
    └── Pass as parameter
    └── Pass source object reference
    └── Move needed features too

MOVE METHOD
[ ] 7. Copy method to target class
[ ] 8. Adjust to fit new home
    └── Update references to source class features
    └── Rename if needed for new context
[ ] 9. Compile target class
[ ] 10. Update source method to delegate to target
[ ] 11. Run tests
[ ] 12. Consider making source method just delegate
[ ] 13. Consider removing source method entirely
[ ] 14. Run tests
[ ] 15. Commit

MOVE FIELD
[ ] 16. If field is public, encapsulate first
[ ] 17. Create field in target class
[ ] 18. Create getter/setter in target
[ ] 19. Compile target
[ ] 20. Update source to use target's field
[ ] 21. Run tests
[ ] 22. Remove field from source
[ ] 23. Run tests
[ ] 24. Commit
```

---

## Large-Scale Refactoring Checklist

For refactoring that spans multiple files/components.

```
LARGE-SCALE REFACTORING
=======================

PLANNING PHASE
[ ] 1. Document current state
    └── Diagrams of current architecture
    └── List of all affected files
    └── Dependencies between components
[ ] 2. Document target state
    └── Diagram of desired architecture
    └── Clear success criteria
[ ] 3. Break down into phases
    └── Each phase should be deployable
    └── Identify intermediate stable states
[ ] 4. Estimate risk and time
[ ] 5. Get team buy-in

EXECUTION STRATEGY
[ ] 6. Choose approach:
    └── Strangler Fig: build new alongside old
    └── Branch by Abstraction: add seam, then swap
    └── Parallel Run: run both, compare results
[ ] 7. Set up feature flags if needed
[ ] 8. Plan rollback strategy

FOR EACH PHASE
[ ] 9. Create branch from main
[ ] 10. Apply small refactorings (use other checklists)
[ ] 11. Run tests frequently
[ ] 12. Commit after each successful step
[ ] 13. Code review
[ ] 14. Merge to main
[ ] 15. Deploy (if possible)
[ ] 16. Monitor for issues
[ ] 17. Document completed changes

COMPLETION
[ ] 18. Remove old code
[ ] 19. Remove feature flags
[ ] 20. Update documentation
[ ] 21. Retrospective: what did we learn?
```

---

## Legacy Code Refactoring Checklist

For refactoring code without tests.

```
LEGACY CODE REFACTORING
=======================

FIRST: GET IT UNDER TEST
[ ] 1. Identify change point (where you need to make changes)
[ ] 2. Find test points (where you can observe behavior)
[ ] 3. Break dependencies using safe techniques:
    └── Extract Interface
    └── Parameterize Constructor
    └── Introduce Static Setter (test-only)
[ ] 4. Write characterization tests
    └── Tests that document current behavior
    └── Not tests of desired behavior
[ ] 5. Verify tests fail if code changes

THEN: MAKE CHANGES
[ ] 6. Apply small refactorings
[ ] 7. Keep tests passing
[ ] 8. Add more tests as you understand code
[ ] 9. Gradually improve coverage

SAFE LEGACY TECHNIQUES
[ ] Sprout Method: new code in new tested method
[ ] Sprout Class: new code in new tested class
[ ] Wrap Method: wrap old method with new behavior
[ ] Wrap Class: decorator around legacy class

AVOID
[ ] Large changes without tests
[ ] "Big bang" rewrites
[ ] Refactoring and changing behavior together
[ ] Deleting code you don't understand
```

---

## Post-Refactoring Checklist

After completing refactoring.

```
POST-REFACTORING
================

VERIFY QUALITY
[ ] 1. All tests pass
[ ] 2. No new warnings or errors
[ ] 3. Coverage maintained or improved
[ ] 4. Linter passes
[ ] 5. Type checker passes (if applicable)

VERIFY BEHAVIOR
[ ] 6. Manual smoke test of affected features
[ ] 7. Check edge cases still work
[ ] 8. Performance hasn't degraded significantly

CLEAN UP
[ ] 9. Remove any temporary scaffolding
[ ] 10. Delete dead code
[ ] 11. Remove TODO comments that are done
[ ] 12. Update related documentation

COMMIT & REVIEW
[ ] 13. Review diff for accidental changes
[ ] 14. Write clear commit message
    └── What was refactored
    └── Why (motivation)
    └── No behavior changes
[ ] 15. Submit for code review
[ ] 16. Squash commits if many small ones

KNOWLEDGE SHARING
[ ] 17. Document any significant learnings
[ ] 18. Share patterns discovered with team
[ ] 19. Update architecture docs if needed
```

---

## Code Review Checklist (for refactoring PRs)

For reviewing someone else's refactoring PR.

```
REFACTORING PR REVIEW
=====================

VERIFY IT'S PURE REFACTORING
[ ] 1. No new features mixed in
[ ] 2. No bug fixes mixed in
[ ] 3. External behavior unchanged
[ ] 4. Tests not modified (or minimally)

CHECK QUALITY IMPROVEMENT
[ ] 5. Code is more readable
[ ] 6. Code is better organized
[ ] 7. Duplication reduced
[ ] 8. Complexity reduced
[ ] 9. Names are clearer

CHECK FOR ISSUES
[ ] 10. No introduced code smells
[ ] 11. No broken patterns
[ ] 12. No performance regressions
[ ] 13. No new dependencies added unnecessarily

CHECK TESTS
[ ] 14. All existing tests pass
[ ] 15. Coverage maintained
[ ] 16. Tests still make sense after refactoring

APPROVE IF
[ ] Clear improvement
[ ] No behavior changes
[ ] Tests pass
[ ] Well-explained in PR description
```

---

## Quick Reference: Which Checklist?

| Scenario | Use Checklist |
|----------|---------------|
| Starting any refactoring | Pre-Refactoring |
| Breaking up long method | Extract Method |
| Class has too many responsibilities | Extract Class |
| Improving naming | Rename |
| Method in wrong class | Move Method/Field |
| Multiple components affected | Large-Scale |
| No tests exist | Legacy Code |
| Finished refactoring | Post-Refactoring |
| Reviewing PR | Code Review |
