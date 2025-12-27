---
name: architecture
description: |
  Software architecture design, system design, and component design guidance applicable to all technologies (frontend, backend, APIs, microservices). Use when: (1) Planning new features or systems, (2) Designing component structure, (3) Making architectural decisions, (4) Evaluating design patterns, (5) Reviewing system design, (6) Refactoring for better architecture, (7) Designing APIs or data flow, (8) Working with Clean/Hexagonal/Layered architecture.
---

# Architecture

Universal software architecture principles and patterns for designing maintainable, scalable, and testable systems.

## Core Principles (Apply Always)

### SOLID Principles
| Principle | Rule | Violation Sign |
|-----------|------|----------------|
| **S**ingle Responsibility | One reason to change per module | Class doing too many things |
| **O**pen/Closed | Extend behavior without modifying | Changing existing code for new features |
| **L**iskov Substitution | Subtypes replaceable for base types | Override breaking parent contract |
| **I**nterface Segregation | Small, focused interfaces | Clients implement unused methods |
| **D**ependency Inversion | Depend on abstractions, not concretions | High-level importing low-level directly |

### Pragmatic Rules
```
KISS: Prefer simple over clever. If it needs explanation, simplify it.
YAGNI: Don't build for hypothetical futures. Build for now.
DRY: Extract only after 3+ duplications with identical purpose.
Separation of Concerns: Each module handles one aspect of functionality.
```

## Architecture Decision Framework

```
                    ┌─────────────────────────┐
                    │   What's the scope?     │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   ┌─────────┐            ┌─────────┐            ┌─────────┐
   │ Simple  │            │ Medium  │            │ Complex │
   │ CRUD    │            │ Feature │            │ System  │
   └────┬────┘            └────┬────┘            └────┬────┘
        │                      │                      │
        ▼                      ▼                      ▼
   Keep simple            Use patterns           Full arch
   No over-eng.           as needed              patterns
```

### Complexity Guide

| Complexity | Characteristics | Approach |
|------------|-----------------|----------|
| **Low** | < 3 files, simple logic, no external deps | Direct implementation, minimal abstraction |
| **Medium** | 3-10 files, some business logic, 1-2 deps | Apply relevant patterns, single layer of abstraction |
| **High** | 10+ files, complex domain, multiple deps | Full architecture (Clean/Hexagonal), multiple layers |

## Layered Architecture (Universal)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (UI Components, Controllers, Views, CLI, API Endpoints)    │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                         │
│  (Use Cases, Services, Orchestration, DTOs)                 │
├─────────────────────────────────────────────────────────────┤
│                      DOMAIN LAYER                            │
│  (Entities, Value Objects, Domain Services, Business Rules) │
├─────────────────────────────────────────────────────────────┤
│                  INFRASTRUCTURE LAYER                        │
│  (Database, External APIs, File System, Messaging)          │
└─────────────────────────────────────────────────────────────┘

DEPENDENCY RULE: Dependencies point INWARD only.
                 Inner layers know nothing about outer layers.
```

## Component Design Checklist

Before creating/modifying components:

```
□ Single purpose clearly defined?
□ Dependencies explicit and minimal?
□ Interface stable (implementation can change)?
□ Testable in isolation?
□ Side effects contained and predictable?
□ Naming reflects purpose (not implementation)?
```

## Design Pattern Selection

| Problem | Pattern | When to Use |
|---------|---------|-------------|
| Object creation complexity | Factory / Builder | Multiple creation paths, complex initialization |
| Algorithm variation | Strategy | Behavior changes at runtime |
| Object state changes | State | Distinct behavioral states |
| Cross-cutting concerns | Decorator | Add behavior without changing class |
| Complex subsystem | Facade | Simplify interface to subsystem |
| Object relationships | Observer | One-to-many dependency updates |
| Data access | Repository | Abstract data persistence |
| Request handling | Chain of Responsibility | Variable handler chains |

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **God Class** | Class knows/does too much | Split by responsibility |
| **Spaghetti Code** | Tangled dependencies | Introduce clear layers |
| **Golden Hammer** | Same solution for everything | Choose pattern by problem |
| **Premature Optimization** | Complexity before need | Measure first, optimize later |
| **Leaky Abstraction** | Implementation details exposed | Strengthen interface boundaries |
| **Circular Dependencies** | A → B → A | Introduce abstraction layer |

## Quick Reference by Domain

### Backend Systems
- See [references/patterns.md](references/patterns.md) for Clean/Hexagonal/Onion architecture
- See [references/principles.md](references/principles.md) for DDD building blocks
- See [references/api-design.md](references/api-design.md) for REST/GraphQL/gRPC patterns

### Frontend Applications
- See [references/frontend.md](references/frontend.md) for component patterns
- Key patterns: Atomic Design, Feature-Sliced Design, Container/Presenter

### API Design
- See [references/api-design.md](references/api-design.md) for API architecture
- Key principles: Resource-oriented, versioning, pagination, security

## Architecture Review Checklist

When reviewing or planning architecture:

```
STRUCTURE
□ Clear separation between layers?
□ Dependencies flow in one direction?
□ No circular dependencies?

MODULARITY
□ Modules can be developed independently?
□ Changes localized to single module?
□ Interfaces stable, implementations swappable?

SCALABILITY
□ Can handle 10x load with horizontal scaling?
□ Stateless where possible?
□ Bottlenecks identified and addressable?

TESTABILITY
□ Business logic testable without infrastructure?
□ Dependencies injectable?
□ Side effects isolated?

MAINTAINABILITY
□ New team member can understand in 1 day?
□ Common patterns used consistently?
□ Documentation matches implementation?
```
