# TDD, BDD & ATDD Methodologies

## Table of Contents
1. [Test-Driven Development (TDD)](#test-driven-development-tdd)
2. [Behavior-Driven Development (BDD)](#behavior-driven-development-bdd)
3. [Acceptance Test-Driven Development (ATDD)](#acceptance-test-driven-development-atdd)
4. [Combining Methodologies](#combining-methodologies)
5. [AI-Assisted TDD (2025)](#ai-assisted-tdd-2025)

---

## Test-Driven Development (TDD)

### Red-Green-Refactor Cycle

```
┌─────────────────────────────────────────────────────────┐
│                    TDD CYCLE                            │
│                                                         │
│     ┌─────────┐                                        │
│     │  RED    │ ◄── Write failing test first           │
│     └────┬────┘                                        │
│          │                                              │
│          ▼                                              │
│     ┌─────────┐                                        │
│     │  GREEN  │ ◄── Write minimum code to pass         │
│     └────┬────┘                                        │
│          │                                              │
│          ▼                                              │
│     ┌─────────┐                                        │
│     │REFACTOR │ ◄── Improve code, tests still pass    │
│     └────┬────┘                                        │
│          │                                              │
│          └──────────────► Repeat                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### TDD Best Practices

1. **Write descriptive test names**
   ```python
   # Bad
   def test_user():
       pass

   # Good
   def test_user_creation_with_valid_email_succeeds():
       pass
   ```

2. **Use Arrange-Act-Assert (AAA) pattern**
   ```python
   def test_calculate_discount():
       # Arrange
       cart = ShoppingCart()
       cart.add_item(Item(price=100))

       # Act
       discount = cart.calculate_discount(percentage=10)

       # Assert
       assert discount == 10
   ```

3. **Keep tests atomic and isolated**
   - Each test should be independent
   - No shared mutable state between tests
   - Use setup/teardown for initialization

4. **Test edge cases before happy paths**
   - Null/empty inputs
   - Boundary values
   - Error conditions

5. **Write minimum code to pass**
   - Avoid over-engineering
   - Let tests drive the design

### Benefits of TDD

| Metric | Impact |
|--------|--------|
| Defect reduction | 40-90% fewer bugs |
| Test coverage | Near 100% by design |
| Development time | +15-35% initially, saves later |
| Code quality | Cleaner APIs, modular design |

---

## Behavior-Driven Development (BDD)

### Gherkin Syntax

```gherkin
Feature: User Authentication
  As a registered user
  I want to log into my account
  So that I can access personalized features

  Scenario: Successful login with valid credentials
    Given I am on the login page
    And I have a registered account with email "user@example.com"
    When I enter my email "user@example.com"
    And I enter my password "correct_password"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message

  Scenario: Failed login with invalid password
    Given I am on the login page
    When I enter my email "user@example.com"
    And I enter my password "wrong_password"
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page
```

### BDD Frameworks by Language

| Language | Framework | Key Features |
|----------|-----------|--------------|
| Python | behave, pytest-bdd | Gherkin support, fixtures |
| JavaScript | Cucumber.js | Async support, browser testing |
| Java | Cucumber-JVM | Spring integration |
| Ruby | Cucumber | Original implementation |
| Go | godog | Concurrent execution |

### Step Definition Example (Python)

```python
from behave import given, when, then

@given('I am on the login page')
def step_on_login_page(context):
    context.browser.visit('/login')

@when('I enter my email "{email}"')
def step_enter_email(context, email):
    context.browser.fill('email', email)

@when('I click the login button')
def step_click_login(context):
    context.browser.click_button('Login')

@then('I should be redirected to the dashboard')
def step_redirected_dashboard(context):
    assert context.browser.url.endswith('/dashboard')
```

---

## Acceptance Test-Driven Development (ATDD)

### ATDD Process

```
┌─────────────────────────────────────────────────────────┐
│                    ATDD WORKFLOW                        │
│                                                         │
│  1. DISCUSS                                            │
│     ├── Business analysts                              │
│     ├── Developers                                     │
│     └── QA define acceptance criteria together         │
│                                                         │
│  2. DISTILL                                            │
│     └── Convert criteria to executable tests           │
│                                                         │
│  3. DEVELOP                                            │
│     └── Implement until all acceptance tests pass      │
│                                                         │
│  4. DEMO                                               │
│     └── Demonstrate working feature to stakeholders    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### ATDD vs BDD vs TDD

| Aspect | TDD | BDD | ATDD |
|--------|-----|-----|------|
| Focus | Code correctness | System behavior | Business requirements |
| Written by | Developers | Developers + QA | Team + Stakeholders |
| Language | Technical | Natural (Gherkin) | Business-oriented |
| Scope | Unit level | Feature level | Acceptance level |
| Primary goal | Design + Quality | Communication | Alignment |

---

## Combining Methodologies

### Recommended Approach (2025)

```
┌─────────────────────────────────────────────────────────┐
│               COMBINED APPROACH                         │
│                                                         │
│  ATDD (Acceptance)                                     │
│    │                                                    │
│    └──► BDD (Feature/Integration)                      │
│           │                                             │
│           └──► TDD (Unit)                              │
│                                                         │
│  Flow:                                                  │
│  1. Define acceptance criteria with stakeholders       │
│  2. Write BDD scenarios for features                   │
│  3. Implement using TDD for each component             │
│  4. Verify all levels pass before merge                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Integration Example

```python
# Level 1: Acceptance Test (ATDD)
# acceptance_tests/test_checkout.py
def test_user_can_complete_purchase():
    """Customer can checkout and receive confirmation email"""
    # High-level end-to-end test

# Level 2: BDD Scenario
# features/checkout.feature
"""
Scenario: Successful checkout with valid payment
  Given I have items in my cart
  When I proceed to checkout
  And I enter valid payment details
  Then my order should be confirmed
"""

# Level 3: TDD Unit Tests
# tests/test_payment_processor.py
def test_payment_processor_validates_card_number():
    # Detailed unit test
```

---

## AI-Assisted TDD (2025)

### AI Integration Points

1. **Test scaffolding**: AI generates starter unit tests
2. **Edge case discovery**: LLMs suggest corner scenarios humans miss
3. **Refactoring assistance**: AI highlights redundant tests
4. **Regression automation**: AI predicts high-risk areas

### AI-Augmented Workflow

```python
# Example: AI-suggested test cases
# Original function
def calculate_shipping(weight, distance, express=False):
    base_rate = weight * 0.5 + distance * 0.1
    return base_rate * 2 if express else base_rate

# AI-suggested edge cases:
# 1. weight = 0 (empty package)
# 2. distance = 0 (local pickup)
# 3. weight = MAX_FLOAT (overflow)
# 4. negative values (validation)
# 5. express toggle with zero base rate
```

### Best Practices for AI-Assisted Testing

- Review AI-generated tests for correctness
- Use AI for coverage gaps, not replacement
- Validate edge cases AI suggests
- Maintain human oversight of test quality
