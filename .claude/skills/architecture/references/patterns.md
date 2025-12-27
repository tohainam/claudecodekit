# Architecture Patterns

Detailed reference for major software architecture patterns.

## Table of Contents
1. [Clean Architecture](#clean-architecture)
2. [Hexagonal Architecture](#hexagonal-architecture)
3. [Onion Architecture](#onion-architecture)
4. [Microservices Architecture](#microservices-architecture)
5. [Modular Monolith](#modular-monolith)
6. [Event-Driven Architecture](#event-driven-architecture)
7. [CQRS Pattern](#cqrs-pattern)

---

## Clean Architecture

Introduced by Robert C. Martin (Uncle Bob). Organizes code into concentric layers with dependencies pointing inward.

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRAMEWORKS & DRIVERS                         │
│  (Web, UI, DB, External Interfaces)                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 INTERFACE ADAPTERS                       │    │
│  │  (Controllers, Presenters, Gateways)                    │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │              APPLICATION LAYER                   │   │    │
│  │  │  (Use Cases, Application Services)              │   │    │
│  │  │  ┌─────────────────────────────────────────┐   │   │    │
│  │  │  │            ENTITIES                      │   │   │    │
│  │  │  │  (Enterprise Business Rules)            │   │   │    │
│  │  │  └─────────────────────────────────────────┘   │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Contains | Depends On |
|-------|----------|------------|
| **Entities** | Business objects, domain rules | Nothing |
| **Use Cases** | Application-specific business rules | Entities |
| **Interface Adapters** | Controllers, presenters, repositories | Use Cases, Entities |
| **Frameworks** | Web frameworks, databases, UI | All inner layers |

### Key Rules
1. **Dependency Rule**: Source code dependencies point inward only
2. **Framework Independence**: Business logic doesn't depend on frameworks
3. **Testability**: Business rules testable without UI, database, or external elements
4. **Database Independence**: Can swap databases without affecting business rules

### Directory Structure Example
```
src/
├── domain/                 # Entities layer
│   ├── entities/
│   └── value-objects/
├── application/           # Use Cases layer
│   ├── use-cases/
│   ├── interfaces/        # Port interfaces
│   └── dto/
├── infrastructure/        # Frameworks layer
│   ├── database/
│   ├── http/
│   └── messaging/
└── presentation/          # Interface Adapters
    ├── controllers/
    ├── presenters/
    └── views/
```

---

## Hexagonal Architecture

Also known as "Ports and Adapters". Created by Alistair Cockburn. Isolates application core from external concerns.

```
                    ┌─────────────────────┐
                    │   Primary Adapters  │
                    │  (Driving/Input)    │
                    │  • REST Controller  │
                    │  • CLI              │
                    │  • GraphQL          │
                    └─────────┬───────────┘
                              │ uses
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          PORTS                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   APPLICATION CORE                         │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │                  DOMAIN MODEL                        │  │  │
│  │  │  (Entities, Value Objects, Domain Services)         │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │ uses
                              ▼
                    ┌─────────────────────┐
                    │ Secondary Adapters  │
                    │  (Driven/Output)    │
                    │  • Database Repo    │
                    │  • Email Service    │
                    │  • External API     │
                    └─────────────────────┘
```

### Ports and Adapters

| Type | Port (Interface) | Adapter (Implementation) |
|------|------------------|--------------------------|
| **Primary (Driving)** | Input ports (use case interfaces) | REST controllers, CLI handlers |
| **Secondary (Driven)** | Output ports (repository interfaces) | Database implementations, API clients |

### Implementation Pattern
```
# Port (Interface) - in domain/application layer
interface UserRepository:
    find_by_id(id: str) -> User
    save(user: User) -> None

# Adapter - in infrastructure layer
class PostgresUserRepository implements UserRepository:
    find_by_id(id: str) -> User:
        # PostgreSQL-specific implementation
    save(user: User) -> None:
        # PostgreSQL-specific implementation
```

---

## Onion Architecture

Similar to Clean Architecture with emphasis on domain model at center.

```
┌────────────────────────────────────────────────────────────────┐
│                        INFRASTRUCTURE                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      APPLICATION                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │                 DOMAIN SERVICES                     │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │              DOMAIN MODEL                     │  │  │  │
│  │  │  │  (Entities, Value Objects)                   │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## Microservices Architecture

Decompose application into small, independently deployable services.

### Core Principles
1. **Single Responsibility**: Each service owns one business capability
2. **Autonomy**: Services can be deployed, scaled, updated independently
3. **Decentralized Data**: Each service manages its own database
4. **Smart Endpoints, Dumb Pipes**: Business logic in services, simple communication

### Service Design Guidelines

| Aspect | Guideline |
|--------|-----------|
| **Size** | 2-pizza team rule (5-10 people can own it) |
| **Scope** | One bounded context from DDD |
| **Data** | Private database per service |
| **Communication** | Async preferred, sync when needed |
| **API** | Well-defined contracts, versioned |

### Communication Patterns

```
SYNCHRONOUS (Request-Response)
┌──────────┐    HTTP/gRPC    ┌──────────┐
│ Service A│ ───────────────▶│ Service B│
└──────────┘                 └──────────┘

ASYNCHRONOUS (Event-Driven)
┌──────────┐    Event    ┌─────────────┐    Event    ┌──────────┐
│ Service A│ ──────────▶ │ Message Bus │ ──────────▶ │ Service B│
└──────────┘             └─────────────┘             └──────────┘
```

### When to Use
- Large team that can be divided into autonomous units
- Different parts of system have different scaling needs
- Need independent deployment cycles
- Polyglot persistence requirements

### When NOT to Use
- Small team (< 5 developers)
- Simple domain
- Tight budget (operational complexity is costly)
- Need strong consistency across data

---

## Modular Monolith

Middle ground between monolith and microservices. Single deployment with strict module boundaries.

```
┌───────────────────────────────────────────────────────────────┐
│                        APPLICATION                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Module A  │  │   Module B  │  │   Module C  │           │
│  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │           │
│  │  │Domain │  │  │  │Domain │  │  │  │Domain │  │           │
│  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │           │
│  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │           │
│  │  │ App   │  │  │  │ App   │  │  │  │ App   │  │           │
│  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │           │
│  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │           │
│  │  │Infra  │  │  │  │Infra  │  │  │  │Infra  │  │           │
│  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    SHARED KERNEL                          │ │
│  │  (Common types, utilities, cross-cutting concerns)       │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### Module Rules
1. Modules communicate through public APIs only
2. No direct database access across modules
3. Shared kernel kept minimal
4. Each module could become a microservice later

---

## Event-Driven Architecture

System components communicate through events.

### Event Types

| Type | Purpose | Example |
|------|---------|---------|
| **Domain Events** | Record something happened in domain | `OrderPlaced`, `PaymentReceived` |
| **Integration Events** | Cross-service communication | `OrderPlacedIntegrationEvent` |
| **Commands** | Request action (can be rejected) | `PlaceOrder`, `CancelOrder` |

### Pattern: Event Sourcing
Store state as sequence of events instead of current state.

```
Traditional:
┌─────────────────────────────────────┐
│ Order: { id: 1, status: "shipped" } │
└─────────────────────────────────────┘

Event Sourced:
┌─────────────────────────────────────┐
│ 1. OrderCreated { id: 1 }           │
│ 2. OrderPaid { id: 1 }              │
│ 3. OrderShipped { id: 1 }           │
└─────────────────────────────────────┘
```

---

## CQRS Pattern

Command Query Responsibility Segregation. Separate read and write models.

```
                     ┌─────────────────┐
                     │     Client      │
                     └────────┬────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
       ┌─────────────┐                 ┌─────────────┐
       │  Commands   │                 │   Queries   │
       │  (Writes)   │                 │   (Reads)   │
       └──────┬──────┘                 └──────┬──────┘
              │                               │
              ▼                               ▼
       ┌─────────────┐                 ┌─────────────┐
       │Write Model  │  ──────────▶   │ Read Model  │
       │(Normalized) │    sync/event  │(Denormalized)│
       └─────────────┘                 └─────────────┘
```

### When to Use CQRS
- Read and write workloads differ significantly
- Complex domain with many aggregate roots
- Need to scale reads and writes independently
- Different models for reads vs writes make sense

### When NOT to Use
- Simple CRUD applications
- Domain is straightforward
- Team unfamiliar with pattern
- No significant read/write asymmetry
