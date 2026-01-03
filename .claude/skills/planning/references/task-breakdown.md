# Task Breakdown

## INVEST Framework

User stories and tasks should be:

| Criteria        | Description                   | Example                           |
| --------------- | ----------------------------- | --------------------------------- |
| **I**ndependent | Can be developed in any order | Not: "After login is done..."     |
| **N**egotiable  | Details can be discussed      | Not: "Use exactly this SQL query" |
| **V**aluable    | Delivers user/business value  | Not: "Set up database tables"     |
| **E**stimable   | Can be sized with confidence  | Not: "Make it faster"             |
| **S**mall       | Fits in a sprint/iteration    | 2-8 hours ideal                   |
| **T**estable    | Has clear acceptance criteria | "User can see order history"      |

## Vertical Slicing

### What It Is

A vertical slice delivers a thin but complete feature through all layers:

```
┌─────────────────────────────────────────┐
│              UI Component               │ ← User can interact
├─────────────────────────────────────────┤
│            Business Logic               │ ← Rules applied
├─────────────────────────────────────────┤
│             Data Access                 │ ← Data persisted
├─────────────────────────────────────────┤
│               Database                  │ ← Storage
└─────────────────────────────────────────┘
         ↑ Single feature thread ↑
```

### Horizontal vs Vertical

**Horizontal (Anti-pattern)**:

1. Build all database tables
2. Build all API endpoints
3. Build all UI components
4. Integrate everything

**Vertical (Preferred)**:

1. User can create account (DB + API + UI)
2. User can login (DB + API + UI)
3. User can view profile (DB + API + UI)

### Benefits of Vertical Slicing

- **Faster feedback**: Working software after each slice
- **Reduced risk**: Integration issues found early
- **Better estimates**: Similar slices, predictable effort
- **Flexible scope**: Can ship after any slice

## Task Sizing Guidelines

### Ideal Task Size: 2-8 Hours

Tasks outside this range have problems:

**< 2 hours**: Overhead of tracking exceeds value
**> 8 hours**: Too much uncertainty, hard to estimate

### Breaking Down Large Tasks

| Signal                       | Action                       |
| ---------------------------- | ---------------------------- |
| "...and..." in description   | Split at the "and"           |
| Multiple acceptance criteria | One task per criterion       |
| Multiple layers touched      | Consider vertical slices     |
| "It depends on..."           | Create dependency task first |
| Uncertainty about approach   | Add spike/research task      |

### Example Breakdown

**Epic**: User authentication system

**Too big**: "Implement user authentication"

**Proper breakdown**:

1. Create user model and migration (S)
2. Implement password hashing service (S)
3. Create registration endpoint (S)
4. Create registration form UI (S)
5. Create login endpoint (S)
6. Create login form UI (S)
7. Implement session management (M)
8. Add "forgot password" flow (M)
9. Add email verification (M)

## Story Mapping

### Structure

```
                    User Journey (left to right)
                    ─────────────────────────────►

Activities    │ Browse │ Select │ Purchase │ Track │
              ├────────┼────────┼──────────┼───────┤
Tasks         │ Search │ View   │ Add cart │ Order │
              │ Filter │ Detail │ Checkout │ Status│
              │ Sort   │ Reviews│ Payment  │ Ship  │
              ├────────┼────────┼──────────┼───────┤ ◄─ Release 1
              │        │ Compare│ Save cart│       │
              │        │ Zoom   │ Wishlist │       │
              └────────┴────────┴──────────┴───────┘ ◄─ Release 2
```

### Walking Skeleton

First release should be a "walking skeleton":

- Thinnest possible slice through entire system
- Proves architecture works end-to-end
- Foundation for iterative development

## Dependency Management

### Types of Dependencies

1. **Technical**: Database before API, API before UI
2. **Knowledge**: Research before implementation
3. **External**: Third-party integration, approvals
4. **Resource**: Specific person/skill needed

### Handling Dependencies

```
[Independent tasks]     → Parallelize
[Sequential dependencies] → Order correctly
[Circular dependencies]   → Break the cycle (interface/contract)
[External dependencies]   → Start early, have fallback
```

### Dependency Minimization

- Use interfaces/contracts to decouple
- Mock external services for development
- Identify critical path and protect it
- Have fallback plans for external dependencies

## Acceptance Criteria

### Format: Given-When-Then

```gherkin
Given [initial context]
When [action taken]
Then [expected outcome]
```

### Example

```gherkin
Feature: User Login

Given a registered user with email "user@example.com"
When they submit correct credentials
Then they are redirected to dashboard
And a session cookie is set

Given a registered user
When they submit incorrect password
Then they see "Invalid credentials" error
And no session is created
```

### Checklist for Good Acceptance Criteria

- [ ] Specific and measurable
- [ ] Testable (can write automated test)
- [ ] Covers happy path
- [ ] Covers error cases
- [ ] Includes edge cases
- [ ] No implementation details
