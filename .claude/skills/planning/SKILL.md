---
name: planning
description: "Implementation planning with Spec-Driven Development (SDD). Use when: Starting new feature development, Breaking down complex requirements, Estimating AI-assisted development tasks, Creating hierarchical project plans."
---

# Planning

## When to Use

- Starting a new feature or project
- Breaking down epics into implementable tasks
- Creating estimates for AI-assisted development
- Managing risks in software projects
- Organizing work into phases and milestones

## Quick Start

### 1. Spec-Driven Development (SDD)

```
Spec → Plan → Execute
```

SDD outperforms unstructured prompting by **8x** for accuracy. Always start with a clear specification.

### 2. Create Hierarchical Plans

**Simple tasks**: Single `_master.md` plan

**Complex features**: Master plan + phase sub-plans

```
.plans/{feature}/
├── _master.md          # Overview, phases, status
├── phase-1-setup.md    # Detailed phase plan
├── phase-2-core.md     # Each phase self-contained
└── phase-3-polish.md
```

### 3. Apply AI Augmentation Factor (AAF)

When estimating with AI assistance:

| Task Type         | AAF     | Notes                        |
| ----------------- | ------- | ---------------------------- |
| Boilerplate       | 0.3-0.5 | AI excels at repetitive code |
| Standard features | 0.5-0.7 | Well-documented patterns     |
| Complex logic     | 0.8-1.0 | AI assists, human leads      |
| Novel problems    | 1.0-1.2 | AI may slow down             |
| Integration work  | 1.2-1.5 | Context switching overhead   |

`AI_Estimate = Traditional_Estimate × AAF`

## Guidelines

### DO

- Write specs before implementation
- Use vertical slicing (each task delivers working software)
- Apply INVEST criteria to user stories
- Include risk assessment in plans
- Track status in plan files
- Break complex work into 2-8 hour tasks

### DON'T

- Skip the spec phase
- Create horizontal slices (all backend, then all frontend)
- Estimate without considering AI assistance impact
- Plan more than 2-3 phases ahead in detail
- Ignore technical debt in estimates

## Estimation Quick Reference

### T-Shirt Sizing

| Size | Effort    | Description                            |
| ---- | --------- | -------------------------------------- |
| XS   | < 2 hours | Single function, config change         |
| S    | 2-4 hours | Single component, simple endpoint      |
| M    | 4-8 hours | Feature slice, multiple components     |
| L    | 1-3 days  | Complex feature, multiple integrations |
| XL   | 3-5 days  | Major feature, architectural changes   |

### Estimation Anti-Patterns

- **Anchoring**: First number mentioned becomes the anchor
- **Planning fallacy**: Underestimating due to optimism
- **Scope creep**: Not accounting for hidden requirements
- **AI overconfidence**: Assuming AI handles everything

## References

- [Task Breakdown](references/task-breakdown.md) - INVEST, vertical slicing, sizing
- [Estimation](references/estimation.md) - AAF, T-shirt sizing, anti-patterns
- [Risk Management](references/risk-management.md) - Risk identification and response

## Templates

- [Master Plan](templates/master-plan.md) - Hierarchical master plan template
- [Phase Plan](templates/phase-plan.md) - Sub-plan template with tasks
