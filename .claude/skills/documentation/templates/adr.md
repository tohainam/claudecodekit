# Architecture Decision Record (ADR) Template

## ADR Format (Michael Nygard)

```markdown
# ADR {NUMBER}: {TITLE}

**Date:** {YYYY-MM-DD}

**Status:** {Proposed | Accepted | Deprecated | Superseded by ADR-XXX}

## Context

What is the issue that we're seeing that is motivating this decision or change?

Describe the forces at play (technical, political, social, project).
What is the current situation? What problem needs to be solved?

## Decision

What is the change that we're proposing and/or doing?

State the decision clearly. Use active voice: "We will..."

## Consequences

What becomes easier or more difficult to do because of this change?

- **Positive:** List benefits
- **Negative:** List drawbacks
- **Neutral:** List other impacts

## Alternatives Considered

What other options were evaluated?

### Option 1: {Name}

- Description
- Pros
- Cons
- Why not chosen

### Option 2: {Name}

- Description
- Pros
- Cons
- Why not chosen
```

---

## Example ADR

```markdown
# ADR 001: Use PostgreSQL for Primary Database

**Date:** 2025-01-15

**Status:** Accepted

## Context

We need to choose a primary database for our new e-commerce platform.
The system will handle:

- User accounts and authentication
- Product catalog (~100,000 products)
- Orders and transactions
- Inventory management

Requirements:

- ACID compliance for financial transactions
- Strong querying capabilities
- Full-text search
- JSON support for flexible product attributes
- Horizontal scalability for future growth

Team has experience with both PostgreSQL and MySQL.

## Decision

We will use PostgreSQL 16 as our primary database.

## Consequences

### Positive

- Full ACID compliance ensures data integrity for orders
- Native JSON/JSONB support for flexible product schemas
- Full-text search reduces need for separate search engine
- Strong ecosystem (extensions, tools, cloud support)
- Excellent performance for complex queries
- Team has existing expertise

### Negative

- More complex replication setup than some alternatives
- Requires more careful tuning than SQLite for small deployments
- Slightly higher memory requirements

### Neutral

- Will need to set up connection pooling (PgBouncer)
- Standard backup/recovery procedures apply

## Alternatives Considered

### MySQL 8.0

- Pros: Simple replication, wide hosting support
- Cons: Weaker JSON support, less capable full-text search
- Not chosen: PostgreSQL's JSON capabilities better fit our flexible schema needs

### MongoDB

- Pros: Flexible schema, built-in horizontal scaling
- Cons: No ACID for multi-document transactions (critical for orders)
- Not chosen: Financial transactions require strong ACID guarantees

### SQLite

- Pros: Zero configuration, embedded
- Cons: Single-writer limitation, not suitable for web applications at scale
- Not chosen: Doesn't meet scalability requirements
```

---

## ADR Best Practices

### Naming Convention

```
docs/adr/
├── 0001-record-architecture-decisions.md
├── 0002-use-postgresql.md
├── 0003-api-versioning-strategy.md
└── 0004-authentication-approach.md
```

### Status Lifecycle

```
Proposed ──► Accepted ──► Deprecated
                │              │
                │              └─► Superseded by ADR-XXX
                │
                └─► Rejected
```

### When to Write an ADR

- Significant technology choices
- Architectural patterns
- Integration approaches
- Security decisions
- Performance trade-offs
- Process/workflow decisions

### ADR Principles

1. **Immutable**: Don't edit accepted ADRs (write new ones)
2. **Concise**: Keep it short and focused
3. **Context-rich**: Include why, not just what
4. **One decision**: One ADR per significant decision
5. **Dated**: Always include the decision date
6. **Searchable**: Use clear titles

### Review Cadence

| Activity                          | Frequency   |
| --------------------------------- | ----------- |
| Review proposed ADRs              | Weekly      |
| Audit for outdated ADRs           | Quarterly   |
| Check implementation matches ADRs | Per release |

---

## MADR (Markdown ADR) Alternative

```markdown
# {TITLE}

- Status: {proposed | rejected | accepted | deprecated | superseded by ADR-XXX}
- Deciders: {list of people involved}
- Date: {YYYY-MM-DD}

## Context and Problem Statement

{Describe the context and problem in 1-2 sentences}

## Decision Drivers

- {Driver 1}
- {Driver 2}

## Considered Options

- {Option 1}
- {Option 2}
- {Option 3}

## Decision Outcome

Chosen option: "{option}", because {justification}.

### Positive Consequences

- {Positive consequence 1}
- {Positive consequence 2}

### Negative Consequences

- {Negative consequence 1}
- {Negative consequence 2}

## Pros and Cons of the Options

### {Option 1}

- Good, because {argument}
- Bad, because {argument}

### {Option 2}

- Good, because {argument}
- Bad, because {argument}
```

---

## ADR Index Template

```markdown
# Architecture Decision Records

## Accepted

| #                                            | Title                               | Date       | Status   |
| -------------------------------------------- | ----------------------------------- | ---------- | -------- |
| [001](0001-record-architecture-decisions.md) | Record architecture decisions       | 2025-01-01 | Accepted |
| [002](0002-use-postgresql.md)                | Use PostgreSQL for primary database | 2025-01-15 | Accepted |
| [003](0003-api-versioning-strategy.md)       | URL-based API versioning            | 2025-01-20 | Accepted |

## Superseded

| #                           | Title        | Superseded By              |
| --------------------------- | ------------ | -------------------------- |
| [004](0004-use-rest-api.md) | Use REST API | [007](0007-graphql-api.md) |

## Deprecated

| #                              | Title                 | Reason           |
| ------------------------------ | --------------------- | ---------------- |
| [005](0005-use-redis-cache.md) | Use Redis for caching | No longer needed |
```
