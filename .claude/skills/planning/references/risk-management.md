# Risk Management

## Risk Identification

### Common Software Project Risks

| Category         | Risk Examples                                       |
| ---------------- | --------------------------------------------------- |
| **Technical**    | New technology, integration complexity, performance |
| **Requirements** | Unclear specs, scope creep, changing priorities     |
| **Resource**     | Key person dependency, skill gaps, availability     |
| **External**     | Third-party APIs, vendor reliability, regulations   |
| **Schedule**     | Unrealistic deadlines, dependencies, holidays       |
| **Quality**      | Technical debt, insufficient testing, security      |

### AI-Specific Risks (2025)

| Risk                    | Description                               | Likelihood |
| ----------------------- | ----------------------------------------- | ---------- |
| **Hallucination**       | AI generates plausible but incorrect code | High       |
| **Context loss**        | AI forgets earlier conversation context   | Medium     |
| **Outdated patterns**   | AI suggests deprecated approaches         | Medium     |
| **Security blindspots** | AI misses security implications           | High       |
| **Over-reliance**       | Team stops verifying AI output            | Medium     |
| **License issues**      | AI-generated code with unclear licensing  | Low        |

### Risk Identification Techniques

**Brainstorming**

- "What could go wrong?"
- "What assumptions are we making?"
- "What has failed in similar projects?"

**Pre-mortem**

- Imagine the project failed
- Work backwards: "What caused the failure?"
- Identify preventive measures

**Checklist Review**

- Standard risk categories
- Past project learnings
- Industry-specific concerns

## Risk Assessment

### Probability × Impact Matrix

```
                     Impact
              Low    Medium    High
         ┌────────┬─────────┬────────┐
    High │ Medium │  High   │Critical│
         ├────────┼─────────┼────────┤
Prob Med │  Low   │ Medium  │  High  │
         ├────────┼─────────┼────────┤
    Low  │  Low   │  Low    │ Medium │
         └────────┴─────────┴────────┘
```

### Risk Scoring

| Score | Probability | Impact                       |
| ----- | ----------- | ---------------------------- |
| 1     | < 10%       | Negligible delay             |
| 2     | 10-30%      | Minor delay (< 1 day)        |
| 3     | 30-50%      | Moderate delay (1-3 days)    |
| 4     | 50-70%      | Significant delay (3-7 days) |
| 5     | > 70%       | Severe delay (> 1 week)      |

**Risk Score = Probability × Impact**

| Total | Priority                 |
| ----- | ------------------------ |
| 1-6   | Low (monitor)            |
| 7-14  | Medium (plan response)   |
| 15-25 | High (active mitigation) |

## Risk Response Strategies

### The Four T's

| Strategy      | When to Use                       | Example                           |
| ------------- | --------------------------------- | --------------------------------- |
| **Terminate** | Risk unacceptable, avoid entirely | Don't use unstable library        |
| **Transfer**  | Someone else handles better       | Use managed service vs. self-host |
| **Treat**     | Reduce probability or impact      | Add more tests, create fallbacks  |
| **Tolerate**  | Accept and monitor                | Minor UI inconsistency            |

### Response Planning Template

```markdown
## Risk: [Name]

**Description**: [What could happen]
**Probability**: [1-5]
**Impact**: [1-5]
**Score**: [P × I]

**Response Strategy**: [Terminate/Transfer/Treat/Tolerate]

**Mitigation Actions**:

1. [Action to reduce probability]
2. [Action to reduce impact]

**Trigger**: [When to activate contingency]

**Contingency Plan**: [What to do if risk occurs]

**Owner**: [Who monitors this risk]
```

## Risk Monitoring

### Risk Register

| ID  | Risk             | P   | I   | Score | Strategy | Owner | Status  |
| --- | ---------------- | --- | --- | ----- | -------- | ----- | ------- |
| R1  | API rate limits  | 3   | 4   | 12    | Treat    | Dev   | Active  |
| R2  | Key dev vacation | 2   | 3   | 6     | Treat    | PM    | Monitor |
| R3  | Scope creep      | 4   | 4   | 16    | Treat    | PM    | Active  |

### Status Definitions

| Status         | Meaning                              |
| -------------- | ------------------------------------ |
| **Identified** | New risk, not yet assessed           |
| **Active**     | Being actively mitigated             |
| **Monitor**    | Low priority, watching               |
| **Triggered**  | Risk occurred, executing contingency |
| **Closed**     | Risk passed or no longer relevant    |

### Review Cadence

| Project Phase | Review Frequency         |
| ------------- | ------------------------ |
| Planning      | At each planning session |
| Development   | Weekly                   |
| Pre-release   | Daily                    |
| Maintenance   | Monthly                  |

## AI-Assisted Development Risks

### Hallucination Mitigation

```
Risk: AI generates incorrect but plausible code

Probability: High (4)
Impact: Medium-High (3-4)

Mitigation:
1. Always review AI-generated code
2. Require tests for AI code
3. Use type checking and linters
4. Cross-reference with documentation
5. Verify security implications

Trigger: Code review finds AI errors

Contingency: Revert, manually implement
```

### Context Loss Mitigation

```
Risk: AI loses context in long conversations

Probability: Medium (3)
Impact: Medium (3)

Mitigation:
1. Keep conversations focused
2. Summarize context periodically
3. Use specs/docs as source of truth
4. Break large tasks into sessions

Trigger: AI gives inconsistent answers

Contingency: Start fresh with context summary
```

### Over-reliance Mitigation

```
Risk: Team stops verifying AI output

Probability: Medium (3)
Impact: High (4)

Mitigation:
1. Mandatory code review for AI code
2. AI code flagged in PRs
3. Rotate reviewers
4. Track AI-related bugs

Trigger: Bug traced to unreviewed AI code

Contingency: Additional review process
```

## Contingency Planning

### Contingency vs. Mitigation

|             | Mitigation         | Contingency              |
| ----------- | ------------------ | ------------------------ |
| **When**    | Before risk occurs | After risk occurs        |
| **Purpose** | Prevent/reduce     | Respond/recover          |
| **Example** | Add caching        | Switch to backup service |

### Contingency Checklist

- [ ] Trigger conditions defined
- [ ] Response actions documented
- [ ] Resources identified (budget, people)
- [ ] Communication plan ready
- [ ] Recovery timeline estimated
- [ ] Owner assigned

## Risk Communication

### Stakeholder Updates

**Format**:

```
Risk Update: [Date]

New Risks: [Count]
- [Brief description of significant new risks]

Status Changes: [Count]
- [R1]: Active → Closed
- [R3]: Monitor → Active

Top Risks:
1. [Risk name] - Score [X] - [Status]
2. [Risk name] - Score [X] - [Status]

Actions Needed:
- [Decision or resource needed]
```

### Escalation Criteria

| Escalate When   | To Whom                |
| --------------- | ---------------------- |
| Score > 15      | Project Manager        |
| Score > 20      | Technical Lead         |
| Risk triggered  | Immediate stakeholders |
| Resource needed | Resource owner         |
| Timeline impact | Project sponsor        |
