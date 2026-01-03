# Refactoring Examples

## Extract Method

### Before: Long Method

```typescript
function generateInvoice(order: Order): Invoice {
  // Calculate subtotal
  let subtotal = 0;
  for (const item of order.items) {
    const product = getProduct(item.productId);
    const itemTotal = product.price * item.quantity;
    if (item.discount) {
      subtotal += itemTotal * (1 - item.discount);
    } else {
      subtotal += itemTotal;
    }
  }

  // Calculate tax
  let taxRate = 0.1;
  if (order.address.state === "DE") {
    taxRate = 0;
  } else if (order.address.state === "CA") {
    taxRate = 0.0725;
  }
  const tax = subtotal * taxRate;

  // Calculate shipping
  let shipping = 0;
  const totalWeight = order.items.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + product.weight * item.quantity;
  }, 0);
  if (totalWeight > 50) {
    shipping = 25;
  } else if (totalWeight > 20) {
    shipping = 15;
  } else {
    shipping = 5;
  }
  if (order.shippingMethod === "express") {
    shipping *= 2;
  }

  // Build invoice
  return {
    orderId: order.id,
    subtotal,
    tax,
    shipping,
    total: subtotal + tax + shipping,
    createdAt: new Date(),
  };
}
```

### After: Extracted Methods

```typescript
function generateInvoice(order: Order): Invoice {
  const subtotal = calculateSubtotal(order.items);
  const tax = calculateTax(subtotal, order.address.state);
  const shipping = calculateShipping(order);

  return {
    orderId: order.id,
    subtotal,
    tax,
    shipping,
    total: subtotal + tax + shipping,
    createdAt: new Date(),
  };
}

function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => {
    return sum + calculateItemTotal(item);
  }, 0);
}

function calculateItemTotal(item: OrderItem): number {
  const product = getProduct(item.productId);
  const baseTotal = product.price * item.quantity;
  return item.discount ? baseTotal * (1 - item.discount) : baseTotal;
}

function calculateTax(subtotal: number, state: string): number {
  const taxRate = getTaxRate(state);
  return subtotal * taxRate;
}

function getTaxRate(state: string): number {
  const taxRates: Record<string, number> = {
    DE: 0,
    CA: 0.0725,
  };
  return taxRates[state] ?? 0.1;
}

function calculateShipping(order: Order): number {
  const baseShipping = getBaseShipping(order.items);
  return order.shippingMethod === "express" ? baseShipping * 2 : baseShipping;
}

function getBaseShipping(items: OrderItem[]): number {
  const weight = calculateTotalWeight(items);
  if (weight > 50) return 25;
  if (weight > 20) return 15;
  return 5;
}

function calculateTotalWeight(items: OrderItem[]): number {
  return items.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + product.weight * item.quantity;
  }, 0);
}
```

## Replace Conditional with Polymorphism

### Before: Switch Statement

```typescript
function calculatePay(employee: Employee): number {
  switch (employee.type) {
    case "hourly":
      return employee.hoursWorked * employee.hourlyRate;
    case "salaried":
      return employee.annualSalary / 12;
    case "commission":
      return employee.basePay + employee.sales * employee.commissionRate;
    default:
      throw new Error(`Unknown employee type: ${employee.type}`);
  }
}
```

### After: Polymorphism

```typescript
interface PayCalculator {
  calculate(): number;
}

class HourlyEmployee implements PayCalculator {
  constructor(private hoursWorked: number, private hourlyRate: number) {}

  calculate(): number {
    return this.hoursWorked * this.hourlyRate;
  }
}

class SalariedEmployee implements PayCalculator {
  constructor(private annualSalary: number) {}

  calculate(): number {
    return this.annualSalary / 12;
  }
}

class CommissionEmployee implements PayCalculator {
  constructor(
    private basePay: number,
    private sales: number,
    private commissionRate: number
  ) {}

  calculate(): number {
    return this.basePay + this.sales * this.commissionRate;
  }
}

// Factory if needed
function createEmployee(data: EmployeeData): PayCalculator {
  switch (data.type) {
    case "hourly":
      return new HourlyEmployee(data.hoursWorked, data.hourlyRate);
    case "salaried":
      return new SalariedEmployee(data.annualSalary);
    case "commission":
      return new CommissionEmployee(
        data.basePay,
        data.sales,
        data.commissionRate
      );
  }
}
```

## Replace Magic Numbers with Constants

### Before

```typescript
function calculateDiscount(total: number, memberYears: number): number {
  if (total > 100) {
    if (memberYears >= 5) {
      return total * 0.15;
    } else if (memberYears >= 2) {
      return total * 0.1;
    }
    return total * 0.05;
  }
  return 0;
}
```

### After

```typescript
const DISCOUNT_THRESHOLD = 100;
const LOYALTY_YEARS = {
  GOLD: 5,
  SILVER: 2,
} as const;
const DISCOUNT_RATES = {
  GOLD: 0.15,
  SILVER: 0.1,
  BRONZE: 0.05,
} as const;

function calculateDiscount(total: number, memberYears: number): number {
  if (total <= DISCOUNT_THRESHOLD) {
    return 0;
  }

  const rate = getDiscountRate(memberYears);
  return total * rate;
}

function getDiscountRate(memberYears: number): number {
  if (memberYears >= LOYALTY_YEARS.GOLD) {
    return DISCOUNT_RATES.GOLD;
  }
  if (memberYears >= LOYALTY_YEARS.SILVER) {
    return DISCOUNT_RATES.SILVER;
  }
  return DISCOUNT_RATES.BRONZE;
}
```

## TDD: Red-Green-Refactor

### Step 1: Red (Write Failing Test)

```typescript
describe("PasswordValidator", () => {
  it("should require minimum 8 characters", () => {
    const validator = new PasswordValidator();

    expect(validator.validate("short")).toEqual({
      valid: false,
      errors: ["Password must be at least 8 characters"],
    });
  });
});

// Test fails: PasswordValidator doesn't exist
```

### Step 2: Green (Minimal Implementation)

```typescript
class PasswordValidator {
  validate(password: string): ValidationResult {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Test passes
```

### Step 3: Add More Tests (Red Again)

```typescript
it("should require at least one number", () => {
  const validator = new PasswordValidator();

  expect(validator.validate("password")).toEqual({
    valid: false,
    errors: ["Password must contain at least one number"],
  });
});

// Test fails
```

### Step 4: Green Again

```typescript
class PasswordValidator {
  validate(password: string): ValidationResult {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
```

### Step 5: Refactor

```typescript
interface ValidationRule {
  test: (password: string) => boolean;
  message: string;
}

class PasswordValidator {
  private rules: ValidationRule[] = [
    {
      test: (p) => p.length >= 8,
      message: "Password must be at least 8 characters",
    },
    {
      test: (p) => /\d/.test(p),
      message: "Password must contain at least one number",
    },
    {
      test: (p) => /[A-Z]/.test(p),
      message: "Password must contain at least one uppercase letter",
    },
  ];

  validate(password: string): ValidationResult {
    const errors = this.rules
      .filter((rule) => !rule.test(password))
      .map((rule) => rule.message);

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// All tests still pass
```

## Introduce Parameter Object

### Before

```typescript
function searchProducts(
  query: string,
  minPrice: number,
  maxPrice: number,
  category: string,
  inStock: boolean,
  sortBy: string,
  sortOrder: "asc" | "desc",
  page: number,
  pageSize: number
): Product[] {
  // ...
}
```

### After

```typescript
interface SearchOptions {
  query: string;
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    inStock?: boolean;
  };
  sort?: {
    by: string;
    order?: "asc" | "desc";
  };
  pagination?: {
    page?: number;
    pageSize?: number;
  };
}

function searchProducts(options: SearchOptions): Product[] {
  const {
    query,
    filters = {},
    sort = { by: "relevance", order: "desc" },
    pagination = { page: 1, pageSize: 20 },
  } = options;

  // ...
}

// Usage
searchProducts({
  query: "laptop",
  filters: { minPrice: 500, inStock: true },
  sort: { by: "price", order: "asc" },
});
```

## Replace Nested Conditionals with Guard Clauses

### Before

```typescript
function getPayAmount(employee: Employee): number {
  let result: number;

  if (employee.isSeparated) {
    result = separatedAmount();
  } else {
    if (employee.isRetired) {
      result = retiredAmount();
    } else {
      result = normalPayAmount();
    }
  }

  return result;
}
```

### After

```typescript
function getPayAmount(employee: Employee): number {
  if (employee.isSeparated) {
    return separatedAmount();
  }

  if (employee.isRetired) {
    return retiredAmount();
  }

  return normalPayAmount();
}
```

## Refactoring Checklist

### When to Refactor

- [ ] Before adding new feature (prepare the ground)
- [ ] After making something work (clean up)
- [ ] When code smells detected (proactive)
- [ ] During code review (collaborative)

### Safe Refactoring Steps

1. **Ensure tests exist** - Or write them first
2. **Make small changes** - One refactoring at a time
3. **Run tests after each change** - Verify behavior preserved
4. **Commit frequently** - Easy to revert if needed

### Common Refactorings

| Smell                  | Refactoring                           |
| ---------------------- | ------------------------------------- |
| Long method            | Extract Method                        |
| Long parameter list    | Introduce Parameter Object            |
| Duplicated code        | Extract Method/Class                  |
| Conditional complexity | Replace Conditional with Polymorphism |
| Magic numbers          | Replace with Named Constants          |
| Feature envy           | Move Method                           |
| Data clump             | Extract Class                         |
| Primitive obsession    | Replace Primitive with Object         |
