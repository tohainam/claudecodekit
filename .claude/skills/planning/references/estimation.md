# Estimation

## AI Augmentation Factor (AAF)

### Overview

In AI-assisted development, traditional estimates need adjustment. The AI Augmentation Factor accounts for how AI tools affect productivity.

```
AI_Estimate = Traditional_Estimate × AAF
```

### AAF Values by Task Type

| Task Type              | AAF     | Rationale                                  |
| ---------------------- | ------- | ------------------------------------------ |
| **Boilerplate code**   | 0.3-0.5 | AI generates repetitive patterns quickly   |
| **CRUD operations**    | 0.4-0.6 | Well-documented, predictable patterns      |
| **Unit tests**         | 0.4-0.6 | AI excels at generating test cases         |
| **Documentation**      | 0.5-0.7 | AI drafts, human reviews/refines           |
| **Standard features**  | 0.5-0.7 | Common patterns, good examples available   |
| **Refactoring**        | 0.6-0.8 | AI suggests, human validates safety        |
| **Bug fixes**          | 0.7-0.9 | Diagnosis still human-intensive            |
| **Complex algorithms** | 0.8-1.0 | AI assists, human leads design             |
| **System design**      | 0.9-1.1 | Requires deep context understanding        |
| **Novel problems**     | 1.0-1.2 | May slow down due to incorrect suggestions |
| **Legacy integration** | 1.0-1.3 | AI lacks context, may mislead              |
| **Security-critical**  | 1.1-1.5 | Requires extra review of AI output         |

### Factors Affecting AAF

**Lower AAF (AI helps more)**:

- Clear, well-documented requirements
- Standard technology stack
- Good examples in training data
- Isolated, self-contained tasks
- Strong test coverage for validation

**Higher AAF (AI helps less)**:

- Ambiguous requirements
- Proprietary/custom frameworks
- Novel or cutting-edge tech
- Highly integrated systems
- Security or compliance constraints

## T-Shirt Sizing

### Size Definitions

| Size    | Time Range | Complexity   | Example                          |
| ------- | ---------- | ------------ | -------------------------------- |
| **XS**  | < 2 hours  | Trivial      | Config change, typo fix          |
| **S**   | 2-4 hours  | Simple       | Single component, basic endpoint |
| **M**   | 4-8 hours  | Moderate     | Feature slice, 2-3 components    |
| **L**   | 1-3 days   | Complex      | Multi-component feature          |
| **XL**  | 3-5 days   | Very complex | Architectural changes            |
| **XXL** | > 5 days   | Epic         | Needs breakdown                  |

### Sizing Heuristics

| Indicator                    | Likely Size     |
| ---------------------------- | --------------- |
| "Just change this one thing" | XS-S            |
| Touches 1-2 files            | S               |
| Touches 3-5 files            | M               |
| Touches 6-10 files           | L               |
| Touches 10+ files            | XL (break down) |
| New external integration     | +1 size         |
| Unfamiliar technology        | +1 size         |
| No existing tests            | +1 size         |

### Story Points to Hours (Reference)

| Points | Hours | T-Shirt |
| ------ | ----- | ------- |
| 1      | 1-2   | XS      |
| 2      | 2-4   | S       |
| 3      | 4-6   | S-M     |
| 5      | 6-10  | M       |
| 8      | 10-16 | M-L     |
| 13     | 16-24 | L       |
| 21     | 24-40 | XL      |

_Note: Points measure complexity, not time. This is a rough correlation._

## Estimation Techniques

### Three-Point Estimation

```
Estimate = (Optimistic + 4×Most_Likely + Pessimistic) / 6
```

| Scenario            | Description                        |
| ------------------- | ---------------------------------- |
| **Optimistic (O)**  | Everything goes right, no blockers |
| **Most Likely (M)** | Realistic, some minor issues       |
| **Pessimistic (P)** | Major blockers, rework needed      |

**Example**:

- O: 4 hours (clean implementation)
- M: 8 hours (some debugging)
- P: 20 hours (major refactoring needed)
- Estimate: (4 + 32 + 20) / 6 = **9.3 hours**

### Planning Poker

1. Each estimator picks a card (Fibonacci: 1,2,3,5,8,13,21)
2. All reveal simultaneously
3. High/low explain reasoning
4. Discuss and re-estimate
5. Repeat until consensus

### Reference-Based Estimation

Compare to completed similar tasks:

```
New Task Estimate = Similar_Task_Actual × Complexity_Ratio
```

## Estimation Anti-Patterns

### Anchoring

**Problem**: First number mentioned becomes the anchor.

**Example**: "I think it's about 3 days..." (everyone now thinks 2-4 days)

**Solution**: Independent estimates before discussion.

### Planning Fallacy

**Problem**: Underestimating due to optimism.

**Example**: "This is straightforward, 2 hours max" → takes 8 hours

**Solution**:

- Use historical data
- Add buffer (1.5-2x)
- Three-point estimation

### Scope Creep Blindness

**Problem**: Not accounting for hidden requirements.

**Example**: "Add a button" → button + validation + API + tests + docs

**Solution**:

- Explicit acceptance criteria
- Definition of done checklist
- Include testing/docs in estimates

### AI Overconfidence

**Problem**: Assuming AI handles everything.

**Example**: "AI can write all the tests" → tests need review, edge cases

**Solution**:

- AI generates, human reviews
- Factor in review time
- Account for AI mistakes

### Hofstadter's Law

> "It always takes longer than you expect, even when you take into account Hofstadter's Law."

**Solution**: Track actual vs. estimated, adjust multiplier.

## Estimation Checklist

Before finalizing an estimate:

- [ ] Requirements are clear and written
- [ ] Acceptance criteria defined
- [ ] Dependencies identified
- [ ] Similar past tasks reviewed
- [ ] AI assistance impact considered
- [ ] Testing time included
- [ ] Code review time included
- [ ] Documentation time included
- [ ] Buffer for unknowns added
- [ ] Team capacity considered
