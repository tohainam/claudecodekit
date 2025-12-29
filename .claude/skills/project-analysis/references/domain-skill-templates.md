# Domain Skill Templates Reference

Templates for creating project-specific skills that document **ACTUAL CODE PATTERNS** found in the codebase.

## Core Principle

**Skills must document CODE, not concepts.**

❌ BAD (generic knowledge):
```markdown
## Payment Integration
- Use webhooks for async notifications
- Implement idempotency
- Handle errors gracefully
```

✅ GOOD (actual code patterns):
```markdown
## Payment Integration

**Pattern found in `src/services/payment/stripeService.ts:20-80`:**

```typescript
// Your project's payment flow pattern
export async function createPaymentIntent(orderId: string, amount: number) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  const intent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'usd',
    metadata: { orderId }
  });
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentIntentId: intent.id, status: 'PAYMENT_PENDING' }
  });
  return intent;
}
```

**Follow this pattern when:**
- Creating new payment flows
- Adding new payment methods
```

## Template Structure

All domain skill templates follow this structure:

```markdown
---
name: [domain]
description: |
  Code patterns and conventions for [DOMAIN] functionality in [PROJECT_NAME].
  Use when working with [FILE_PATTERNS].
allowed-tools: Read, Grep, Glob
---

# [DOMAIN] Code Patterns

Extracted patterns from this project's codebase.

## Project Files

| Area | Files | Lines |
|------|-------|-------|
| [Area 1] | `[file:line-range]` | [purpose] |
| [Area 2] | `[file:line-range]` | [purpose] |

## Pattern 1: [Pattern Name]

**Location:** `[file:line-range]`

```[language]
// Actual code extracted from the project
[CODE_SNIPPET]
```

**When to use this pattern:**
- [condition 1]
- [condition 2]

**Related files:**
- `[related_file_1]`
- `[related_file_2]`

## Pattern 2: [Pattern Name]
...
```

---

## Universal Skill Template (For Any Domain)

**File:** `.claude/skills/[domain]/SKILL.md`

```markdown
---
name: [domain]
description: |
  Code patterns for [DOMAIN] in [PROJECT_NAME].
  Use when working with files in [FOLDER_PATTERNS].
allowed-tools: Read, Grep, Glob
---

# [DOMAIN] Code Patterns

## Key Files

| Purpose | File | Key Lines |
|---------|------|-----------|
| [PURPOSE_1] | `[FILE_PATH_1]` | [LINE_RANGE] |
| [PURPOSE_2] | `[FILE_PATH_2]` | [LINE_RANGE] |
| [PURPOSE_3] | `[FILE_PATH_3]` | [LINE_RANGE] |

## Pattern: [ENTITY] Lifecycle

**Source:** `[FILE_PATH]:[LINE_START]-[LINE_END]`

```[LANGUAGE]
[ACTUAL_CODE_FROM_PROJECT]
```

**Usage:** [When to follow this pattern]

## Pattern: [OPERATION_NAME]

**Source:** `[FILE_PATH]:[LINE_START]-[LINE_END]`

```[LANGUAGE]
[ACTUAL_CODE_FROM_PROJECT]
```

**Usage:** [When to follow this pattern]

## Naming Conventions

Found in this project:
- Files: `[PATTERN]` (e.g., `*Service.ts`, `*Repository.ts`)
- Functions: `[PATTERN]` (e.g., `create*`, `update*`, `delete*`)
- Types: `[PATTERN]` (e.g., `*Props`, `*State`, `*Response`)

## Error Handling Pattern

**Source:** `[FILE_PATH]:[LINE_RANGE]`

```[LANGUAGE]
[ACTUAL_ERROR_HANDLING_CODE]
```

## Testing Pattern

**Source:** `[TEST_FILE_PATH]:[LINE_RANGE]`

```[LANGUAGE]
[ACTUAL_TEST_CODE]
```
```

---

## Generation Process

When onboard detects a domain and generates a skill:

### Step 1: Identify Key Files

```bash
# Find files related to domain
grep -r -l "[DOMAIN_KEYWORDS]" --include="*.ts" src/

# Example for e-commerce:
grep -r -l "cart\|order\|payment\|checkout" --include="*.ts" src/
```

### Step 2: Extract Code Patterns

For each key file found:

1. **Read the file**
2. **Identify patterns:**
   - Function signatures
   - Class structures
   - State transitions
   - Error handling
   - Data transformations
3. **Extract code snippets** with line numbers
4. **Document the pattern** with actual code

### Step 3: Identify Naming Conventions

```bash
# Find naming patterns
grep -r "function \|const \|class " --include="*.ts" src/ | head -20

# Extract common patterns:
# - Functions: createOrder, updateOrder, deleteOrder
# - Files: orderService.ts, orderRepository.ts
# - Types: OrderProps, OrderState, OrderResponse
```

### Step 4: Generate Skill File

Replace placeholders with ACTUAL code from the project:

| Placeholder | Source |
|-------------|--------|
| `[ACTUAL_CODE_FROM_PROJECT]` | Read file, extract lines |
| `[FILE_PATH]:[LINE_RANGE]` | Grep results |
| `[NAMING_PATTERNS]` | Analysis of file/function names |
| `[ERROR_HANDLING_CODE]` | Found try-catch patterns |
| `[TEST_CODE]` | Found test files |

---

## Example: Generated E-commerce Skill

After analyzing an actual e-commerce project:

```markdown
---
name: ecommerce
description: |
  Code patterns for e-commerce functionality in acme-store.
  Use when working with files in src/services/order/, src/services/payment/, src/services/cart/.
allowed-tools: Read, Grep, Glob
---

# E-commerce Code Patterns

## Key Files

| Purpose | File | Key Lines |
|---------|------|-----------|
| Order lifecycle | `src/services/order/orderService.ts` | 45-120 |
| Payment flow | `src/services/payment/stripeService.ts` | 20-80 |
| Cart management | `src/stores/cart.ts` | 10-60 |
| Order model | `prisma/schema.prisma` | 75-95 |

## Pattern: Order State Transitions

**Source:** `src/services/order/orderService.ts:45-78`

```typescript
export async function transitionOrderState(
  orderId: string,
  newState: OrderStatus
): Promise<Order> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  // Validate transition
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['PAID', 'CANCELLED'],
    PAID: ['PROCESSING', 'REFUNDED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
    REFUNDED: []
  };

  if (!validTransitions[order.status].includes(newState)) {
    throw new InvalidStateTransitionError(order.status, newState);
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: newState, updatedAt: new Date() }
  });
}
```

**Usage:** All order state changes must go through this function.

## Pattern: Payment Webhook Handling

**Source:** `src/services/payment/webhookHandler.ts:15-55`

```typescript
export async function handleStripeWebhook(
  event: Stripe.Event
): Promise<void> {
  // Idempotency check
  const processed = await prisma.webhookEvent.findUnique({
    where: { eventId: event.id }
  });
  if (processed) return;

  // Process by event type
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
      break;
  }

  // Mark as processed
  await prisma.webhookEvent.create({
    data: { eventId: event.id, type: event.type, processedAt: new Date() }
  });
}
```

**Usage:** All Stripe webhooks are handled through this pattern.

## Pattern: Cart State Management

**Source:** `src/stores/cart.ts:10-45`

```typescript
export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product: Product, quantity: number) => {
    const items = get().items;
    const existing = items.find(i => i.productId === product.id);

    if (existing) {
      set({ items: items.map(i =>
        i.productId === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      )});
    } else {
      set({ items: [...items, { productId: product.id, quantity, price: product.price }] });
    }
  },

  removeItem: (productId: string) => {
    set({ items: get().items.filter(i => i.productId !== productId) });
  },

  clearCart: () => set({ items: [] })
}));
```

**Usage:** All cart operations use Zustand store pattern.

## Naming Conventions

Found in this project:
- Services: `[entity]Service.ts` (orderService.ts, paymentService.ts)
- Functions: `create[Entity]`, `update[Entity]`, `delete[Entity]`, `get[Entity]ById`
- Types: `[Entity]`, `[Entity]Input`, `[Entity]Response`
- Enums: `[Entity]Status`, `[Entity]Type`

## Error Handling Pattern

**Source:** `src/lib/errors.ts:5-25`

```typescript
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export class InvalidStateTransitionError extends AppError {
  constructor(from: string, to: string) {
    super('INVALID_TRANSITION', `Cannot transition from ${from} to ${to}`, 400);
  }
}
```

**Usage:** All domain errors extend `AppError` with code, message, statusCode.

## Testing Pattern

**Source:** `src/services/order/__tests__/orderService.test.ts:10-35`

```typescript
describe('transitionOrderState', () => {
  it('should transition PENDING to PAID', async () => {
    const order = await createTestOrder({ status: 'PENDING' });

    const result = await transitionOrderState(order.id, 'PAID');

    expect(result.status).toBe('PAID');
  });

  it('should reject invalid transition', async () => {
    const order = await createTestOrder({ status: 'DELIVERED' });

    await expect(
      transitionOrderState(order.id, 'PENDING')
    ).rejects.toThrow(InvalidStateTransitionError);
  });
});
```

**Usage:** Follow AAA pattern (Arrange, Act, Assert) with test helpers.
```

---

## Notes

- **Extract, don't invent**: All code in skills must come from actual project files
- **Include line numbers**: Always reference `file:line-range` for traceability
- **Focus on patterns**: Document reusable patterns, not one-off code
- **Keep it DRY**: If a pattern appears in multiple places, document once with all locations
- **Update on changes**: Skills should be updated when code patterns change
