# Domain Detection Reference

This reference provides detection patterns for identifying business domains in a codebase. Use this during onboard workflow to recommend creating project-specific skills and agents.

## Overview

Domain detection goes beyond tech stack detection. It identifies the **business domain** of the project to recommend creating domain-specific skills and agents tailored to the project's actual use case.

**CRITICAL**: Domain detection is used to create CODE-FOCUSED skills, NOT generic domain knowledge. The detected domain tells us WHERE to look for code patterns, but the skills themselves must document ACTUAL CODE from the project with file:line references.

## Detection Method

### Step 1: Keyword Scanning

Use Grep to scan for domain-specific keywords in:
- Model/entity files (Prisma schema, TypeORM entities, Django models)
- API route names and paths
- Service/controller file names
- Variable and function names
- Folder structure

### Step 2: Confidence Scoring

| Matches | Confidence |
|---------|------------|
| 5+ keywords from same domain | High |
| 3-4 keywords | Medium |
| 1-2 keywords | Low (don't recommend) |

### Step 3: Multi-Domain Projects

Some projects span multiple domains. Detect and recommend skills for each:
- E-commerce + Analytics → Recommend both `ecommerce` and `analytics` skills
- Healthcare + Booking → Recommend both `healthcare` and `booking` skills

## Domain Detection Tables

### E-commerce Domain

**Detection Keywords:**
```
cart, checkout, payment, order, product, sku, inventory,
price, discount, coupon, shipping, fulfillment, refund,
wishlist, catalog, storefront, merchant, customer, purchase
```

**File/Folder Patterns:**
```
src/services/payment/
src/services/cart/
src/services/order/
src/models/Product
src/models/Order
prisma/schema.prisma containing: Product, Order, Cart, Payment
```

**API Route Patterns:**
```
/api/cart
/api/checkout
/api/orders
/api/products
/api/payments
/api/inventory
```

**Recommended NEW Skill:** `ecommerce` (documents CODE PATTERNS for orders, payments, cart - NOT generic e-commerce advice)
**Recommended NEW Agents:** `order-debugger`, `payment-validator` (with actual state definitions, transition logic, file:line references)

---

### Healthcare Domain

**Detection Keywords:**
```
patient, appointment, prescription, diagnosis, medical,
doctor, physician, nurse, clinic, hospital, treatment,
medication, symptom, vitals, chart, ehr, hipaa, phi,
insurance, claim, billing, procedure, icd, cpt
```

**File/Folder Patterns:**
```
src/services/patient/
src/services/appointment/
src/models/Patient
src/models/Appointment
src/models/Prescription
```

**API Route Patterns:**
```
/api/patients
/api/appointments
/api/prescriptions
/api/medical-records
/api/diagnoses
```

**Recommended NEW Skill:** `healthcare`
**Recommended NEW Agents:** `hipaa-auditor`, `patient-flow-debugger`

---

### Fintech Domain

**Detection Keywords:**
```
transaction, account, balance, ledger, transfer, payment,
bank, wallet, deposit, withdrawal, statement, reconciliation,
kyc, aml, compliance, fraud, risk, credit, debit, settlement
```

**File/Folder Patterns:**
```
src/services/transaction/
src/services/account/
src/services/ledger/
src/models/Transaction
src/models/Account
src/models/Ledger
```

**API Route Patterns:**
```
/api/transactions
/api/accounts
/api/transfers
/api/balances
/api/statements
```

**Recommended NEW Skill:** `fintech`
**Recommended NEW Agents:** `transaction-tracer`, `reconciliation-validator`

---

### EdTech Domain

**Detection Keywords:**
```
course, lesson, enrollment, quiz, student, instructor,
curriculum, module, assignment, grade, certificate,
learning, classroom, lecture, exam, assessment, progress
```

**File/Folder Patterns:**
```
src/services/course/
src/services/enrollment/
src/models/Course
src/models/Student
src/models/Lesson
```

**API Route Patterns:**
```
/api/courses
/api/lessons
/api/enrollments
/api/quizzes
/api/grades
```

**Recommended NEW Skill:** `edtech`
**Recommended NEW Agents:** `enrollment-debugger`, `progress-tracker`

---

### Booking/Reservation Domain

**Detection Keywords:**
```
booking, reservation, availability, slot, schedule,
calendar, appointment, room, resource, capacity,
check-in, check-out, guest, host, venue, event
```

**File/Folder Patterns:**
```
src/services/booking/
src/services/reservation/
src/services/availability/
src/models/Booking
src/models/Reservation
```

**API Route Patterns:**
```
/api/bookings
/api/reservations
/api/availability
/api/slots
/api/calendar
```

**Recommended NEW Skill:** `booking`
**Recommended NEW Agents:** `availability-debugger`, `booking-validator`

---

### Social/Community Domain

**Detection Keywords:**
```
post, feed, comment, like, follow, profile, user,
friend, message, notification, share, timeline,
community, group, thread, reaction, mention, hashtag
```

**File/Folder Patterns:**
```
src/services/feed/
src/services/post/
src/services/social/
src/models/Post
src/models/Comment
src/models/Follow
```

**API Route Patterns:**
```
/api/posts
/api/feed
/api/comments
/api/likes
/api/followers
/api/notifications
```

**Recommended NEW Skill:** `social`
**Recommended NEW Agents:** `feed-debugger`, `notification-tracer`

---

### Analytics/Dashboard Domain

**Detection Keywords:**
```
analytics, dashboard, report, metric, chart, graph,
visualization, kpi, insight, tracking, event, funnel,
cohort, segment, aggregation, timeseries, realtime
```

**File/Folder Patterns:**
```
src/services/analytics/
src/services/reporting/
src/models/Event
src/models/Metric
src/components/Dashboard
src/components/Chart
```

**API Route Patterns:**
```
/api/analytics
/api/reports
/api/metrics
/api/events
/api/dashboards
```

**Recommended NEW Skill:** `analytics`
**Recommended NEW Agents:** `metric-debugger`, `data-pipeline-validator`

---

### CMS/Content Domain

**Detection Keywords:**
```
article, blog, content, page, media, asset, publish,
draft, revision, author, category, tag, seo, slug,
template, block, widget, layout, cms, editor
```

**File/Folder Patterns:**
```
src/services/content/
src/services/media/
src/models/Article
src/models/Page
src/models/Media
```

**API Route Patterns:**
```
/api/articles
/api/pages
/api/media
/api/content
/api/assets
```

**Recommended NEW Skill:** `cms`
**Recommended NEW Agents:** `content-publisher`, `media-validator`

---

### Project Management Domain

**Detection Keywords:**
```
project, task, issue, ticket, sprint, backlog, kanban,
milestone, deadline, assignee, priority, status, workflow,
board, epic, story, subtask, estimation, velocity
```

**File/Folder Patterns:**
```
src/services/project/
src/services/task/
src/models/Project
src/models/Task
src/models/Sprint
```

**API Route Patterns:**
```
/api/projects
/api/tasks
/api/issues
/api/sprints
/api/boards
```

**Recommended NEW Skill:** `project-management`
**Recommended NEW Agents:** `workflow-debugger`, `sprint-analyzer`

---

### IoT/Device Domain

**Detection Keywords:**
```
device, sensor, telemetry, mqtt, iot, gateway, firmware,
reading, measurement, threshold, alert, actuator, protocol,
edge, connectivity, provisioning, ota, heartbeat
```

**File/Folder Patterns:**
```
src/services/device/
src/services/telemetry/
src/models/Device
src/models/Sensor
src/models/Reading
```

**API Route Patterns:**
```
/api/devices
/api/sensors
/api/telemetry
/api/readings
/api/alerts
```

**Recommended NEW Skill:** `iot`
**Recommended NEW Agents:** `device-debugger`, `telemetry-validator`

---

### Marketplace Domain

**Detection Keywords:**
```
listing, seller, buyer, bid, auction, offer, review,
rating, commission, escrow, dispute, verification,
storefront, vendor, marketplace, transaction
```

**File/Folder Patterns:**
```
src/services/listing/
src/services/seller/
src/models/Listing
src/models/Seller
src/models/Offer
```

**API Route Patterns:**
```
/api/listings
/api/sellers
/api/buyers
/api/offers
/api/reviews
```

**Recommended NEW Skill:** `marketplace`
**Recommended NEW Agents:** `listing-validator`, `transaction-mediator`

---

## Detection Algorithm

```python
def detect_domains(codebase_path):
    """
    Detect business domains in a codebase.
    Returns list of (domain, confidence, evidence) tuples.
    """
    results = []

    for domain, config in DOMAIN_CONFIGS.items():
        # Count keyword matches
        keyword_matches = grep_keywords(codebase_path, config['keywords'])
        folder_matches = glob_folders(codebase_path, config['folders'])
        route_matches = grep_routes(codebase_path, config['routes'])

        total_score = len(keyword_matches) + len(folder_matches) * 2 + len(route_matches) * 2

        if total_score >= 5:
            confidence = 'High'
        elif total_score >= 3:
            confidence = 'Medium'
        else:
            continue  # Skip low confidence

        results.append({
            'domain': domain,
            'confidence': confidence,
            'evidence': {
                'keywords': keyword_matches[:5],  # Top 5
                'folders': folder_matches,
                'routes': route_matches
            }
        })

    return results
```

## Grep Commands for Detection

```bash
# E-commerce detection
grep -r -i -l "cart\|checkout\|payment\|order\|inventory" --include="*.ts" --include="*.tsx" --include="*.py" --include="*.go" src/

# Healthcare detection
grep -r -i -l "patient\|appointment\|prescription\|diagnosis" --include="*.ts" --include="*.py" src/

# Fintech detection
grep -r -i -l "transaction\|account\|balance\|ledger\|transfer" --include="*.ts" --include="*.py" src/

# General domain detection (count matches)
grep -r -i -c "keyword1\|keyword2\|keyword3" --include="*.ts" src/ | awk -F: '{sum += $2} END {print sum}'
```

## Output Format

When domains are detected, include in ONBOARD-REPORT.md:

```markdown
## Domain Analysis

### Detected Domains

#### 1. E-commerce (High Confidence)

**Evidence:**
- Keywords found: `cart` (15 matches), `order` (42 matches), `payment` (28 matches)
- Folders: `src/services/payment/`, `src/services/order/`
- Routes: `/api/cart`, `/api/checkout`, `/api/orders`

**Recommended NEW Skill:** `ecommerce`
**Recommended NEW Agents:** `order-debugger`, `payment-validator`

#### 2. Analytics (Medium Confidence)

**Evidence:**
- Keywords found: `analytics` (8 matches), `metric` (5 matches)
- Folders: `src/services/analytics/`

**Recommended NEW Skill:** `analytics`
```

## Notes

- **Multiple domains** are common - recommend skills for each detected domain
- **Low confidence** domains should not be recommended (user can manually create)
- **Evidence-based** recommendations build trust - always show what was detected
- **Domain skills** complement tech skills - both should be recommended

## CRITICAL: CODE-FOCUS Requirement

**Domain detection is for LOCATING code patterns, not for generating generic knowledge.**

When a domain is detected, the generated skill must:

1. **Extract ACTUAL CODE** from the project files identified
2. **Include file:line references** for all patterns
3. **Document project-specific patterns**, not generic domain advice
4. **Show actual function signatures, state machines, transitions** found in this codebase

Example of what NOT to do:
```markdown
## E-commerce Patterns
- Use webhooks for payment notifications
- Implement idempotency for order creation
```

Example of what TO do:
```markdown
## E-commerce Patterns

### Order State Transitions
**Source:** `src/services/order/orderService.ts:45-78`
```typescript
const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'REFUNDED'],
  // ACTUAL CODE FROM THIS PROJECT
};
```
```

The detected keywords and folders are used to FIND the code, but the skill documents the CODE itself.
