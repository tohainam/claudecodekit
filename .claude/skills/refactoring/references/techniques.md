# Refactoring Techniques Catalog

A comprehensive catalog of refactoring techniques organized by category. Each technique includes motivation, mechanics, and language-agnostic examples.

## Table of Contents

1. [Composing Methods](#composing-methods)
2. [Moving Features](#moving-features)
3. [Organizing Data](#organizing-data)
4. [Simplifying Conditionals](#simplifying-conditionals)
5. [Simplifying Method Calls](#simplifying-method-calls)
6. [Dealing with Generalization](#dealing-with-generalization)
7. [Encapsulation](#encapsulation)

---

## Composing Methods

Breaking down large methods into smaller, focused pieces.

### Extract Method

**When:** Code fragment can be grouped together with a clear purpose.

**Mechanics:**
1. Create new method with intention-revealing name
2. Copy extracted code to new method
3. Scan for local variables - pass as parameters or return
4. Replace original code with method call
5. Test

**Before:**
```javascript
function printOwing(invoice) {
  let outstanding = 0;

  // print banner
  console.log("***********************");
  console.log("**** Customer Owes ****");
  console.log("***********************");

  // calculate outstanding
  for (const o of invoice.orders) {
    outstanding += o.amount;
  }

  // print details
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
}
```

**After:**
```javascript
function printOwing(invoice) {
  printBanner();
  const outstanding = calculateOutstanding(invoice);
  printDetails(invoice, outstanding);
}

function printBanner() {
  console.log("***********************");
  console.log("**** Customer Owes ****");
  console.log("***********************");
}

function calculateOutstanding(invoice) {
  return invoice.orders.reduce((sum, o) => sum + o.amount, 0);
}

function printDetails(invoice, outstanding) {
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
}
```

---

### Inline Method

**When:** Method body is as clear as the name.

**Mechanics:**
1. Check method isn't overridden in subclasses
2. Replace all calls with method body
3. Delete the method
4. Test

**Before:**
```javascript
function getRating(driver) {
  return moreThanFiveLateDeliveries(driver) ? 2 : 1;
}

function moreThanFiveLateDeliveries(driver) {
  return driver.numberOfLateDeliveries > 5;
}
```

**After:**
```javascript
function getRating(driver) {
  return driver.numberOfLateDeliveries > 5 ? 2 : 1;
}
```

---

### Extract Variable

**When:** Expression is complex and hard to understand.

**Mechanics:**
1. Ensure expression has no side effects
2. Declare variable and set it to the expression
3. Replace original expression with variable
4. Test

**Before:**
```javascript
return order.quantity * order.itemPrice -
  Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 +
  Math.min(order.quantity * order.itemPrice * 0.1, 100);
```

**After:**
```javascript
const basePrice = order.quantity * order.itemPrice;
const quantityDiscount = Math.max(0, order.quantity - 500) * order.itemPrice * 0.05;
const shipping = Math.min(basePrice * 0.1, 100);
return basePrice - quantityDiscount + shipping;
```

---

### Inline Variable

**When:** Variable name doesn't communicate more than the expression.

**Before:**
```javascript
const basePrice = order.basePrice;
return basePrice > 1000;
```

**After:**
```javascript
return order.basePrice > 1000;
```

---

### Replace Temp with Query

**When:** Temporary variable holds expression result used multiple times.

**Before:**
```javascript
function calculateTotal(order) {
  const basePrice = order.quantity * order.itemPrice;
  if (basePrice > 1000) {
    return basePrice * 0.95;
  } else {
    return basePrice * 0.98;
  }
}
```

**After:**
```javascript
function calculateTotal(order) {
  if (getBasePrice(order) > 1000) {
    return getBasePrice(order) * 0.95;
  } else {
    return getBasePrice(order) * 0.98;
  }
}

function getBasePrice(order) {
  return order.quantity * order.itemPrice;
}
```

---

### Split Variable

**When:** Variable is assigned more than once (not a loop variable).

**Before:**
```javascript
let temp = 2 * (height + width);
console.log(temp);
temp = height * width;
console.log(temp);
```

**After:**
```javascript
const perimeter = 2 * (height + width);
console.log(perimeter);
const area = height * width;
console.log(area);
```

---

## Moving Features

Moving features between classes/modules.

### Move Method

**When:** Method uses more features of another class than its own.

**Mechanics:**
1. Examine all features used in source class
2. Check sub/superclasses for other declarations
3. Declare method in target class
4. Copy code, adjust for new home
5. Turn source method into delegator or remove
6. Test

**Before:**
```javascript
class Account {
  overdraftCharge() {
    if (this.type.isPremium) {
      const baseCharge = 10;
      if (this.daysOverdrawn > 7) {
        return baseCharge + (this.daysOverdrawn - 7) * 0.85;
      }
      return baseCharge;
    }
    return this.daysOverdrawn * 1.75;
  }
}
```

**After:**
```javascript
class AccountType {
  overdraftCharge(daysOverdrawn) {
    if (this.isPremium) {
      const baseCharge = 10;
      if (daysOverdrawn > 7) {
        return baseCharge + (daysOverdrawn - 7) * 0.85;
      }
      return baseCharge;
    }
    return daysOverdrawn * 1.75;
  }
}

class Account {
  overdraftCharge() {
    return this.type.overdraftCharge(this.daysOverdrawn);
  }
}
```

---

### Move Field

**When:** Field is used more by another class.

**Mechanics:**
1. Ensure field is encapsulated
2. Create field and accessors in target
3. Update all references to use new location
4. Remove original field
5. Test

---

### Extract Class

**When:** Class does too much or has too many responsibilities.

**Mechanics:**
1. Decide how to split responsibilities
2. Create new class for split-off responsibilities
3. Create link from old to new class
4. Move fields one at a time
5. Move methods one at a time
6. Review and reduce interfaces
7. Test after each move

**Before:**
```javascript
class Person {
  constructor() {
    this.name = '';
    this.officeAreaCode = '';
    this.officeNumber = '';
  }

  getTelephoneNumber() {
    return `(${this.officeAreaCode}) ${this.officeNumber}`;
  }
}
```

**After:**
```javascript
class Person {
  constructor() {
    this.name = '';
    this.telephoneNumber = new TelephoneNumber();
  }

  getTelephoneNumber() {
    return this.telephoneNumber.toString();
  }
}

class TelephoneNumber {
  constructor() {
    this.areaCode = '';
    this.number = '';
  }

  toString() {
    return `(${this.areaCode}) ${this.number}`;
  }
}
```

---

### Inline Class

**When:** Class isn't doing enough to justify its existence.

**Mechanics:**
1. Create public fields in target for all methods of source
2. Change all references to use target
3. Delete source class
4. Test

---

### Hide Delegate

**When:** Client calls a method on a field of server object (violates Law of Demeter).

**Before:**
```javascript
// Client code
const manager = person.getDepartment().getManager();
```

**After:**
```javascript
// Person class
getManager() {
  return this.department.getManager();
}

// Client code
const manager = person.getManager();
```

---

## Organizing Data

Working with data structures and variables.

### Replace Primitive with Object

**When:** Primitive carries domain meaning or requires behavior.

**Before:**
```javascript
class Order {
  constructor() {
    this.priority = '';  // "high", "low", "rush"
  }
}
```

**After:**
```javascript
class Priority {
  constructor(value) {
    if (!['low', 'normal', 'high', 'rush'].includes(value)) {
      throw new Error(`Invalid priority: ${value}`);
    }
    this.value = value;
  }

  higherThan(other) {
    const values = ['low', 'normal', 'high', 'rush'];
    return values.indexOf(this.value) > values.indexOf(other.value);
  }
}

class Order {
  constructor() {
    this.priority = new Priority('normal');
  }
}
```

---

### Replace Temp with Query

See [Composing Methods](#replace-temp-with-query) above.

---

### Replace Magic Number with Symbolic Constant

**Before:**
```javascript
function potentialEnergy(mass, height) {
  return mass * 9.81 * height;
}
```

**After:**
```javascript
const GRAVITATIONAL_CONSTANT = 9.81;

function potentialEnergy(mass, height) {
  return mass * GRAVITATIONAL_CONSTANT * height;
}
```

---

### Encapsulate Collection

**When:** Getter returns collection directly, allowing external modification.

**Before:**
```javascript
class Person {
  getCourses() { return this.courses; }
  setCourses(courses) { this.courses = courses; }
}
```

**After:**
```javascript
class Person {
  getCourses() { return [...this.courses]; }  // return copy
  addCourse(course) { this.courses.push(course); }
  removeCourse(course) {
    const index = this.courses.indexOf(course);
    if (index > -1) this.courses.splice(index, 1);
  }
}
```

---

## Simplifying Conditionals

### Decompose Conditional

**When:** Complex conditional logic is hard to understand.

**Before:**
```javascript
if (date.isBefore(SUMMER_START) || date.isAfter(SUMMER_END)) {
  charge = quantity * winterRate + winterServiceCharge;
} else {
  charge = quantity * summerRate;
}
```

**After:**
```javascript
if (isWinter(date)) {
  charge = winterCharge(quantity);
} else {
  charge = summerCharge(quantity);
}

function isWinter(date) {
  return date.isBefore(SUMMER_START) || date.isAfter(SUMMER_END);
}
function winterCharge(quantity) {
  return quantity * winterRate + winterServiceCharge;
}
function summerCharge(quantity) {
  return quantity * summerRate;
}
```

---

### Consolidate Conditional Expression

**When:** Multiple conditions return the same result.

**Before:**
```javascript
function disabilityAmount(employee) {
  if (employee.seniority < 2) return 0;
  if (employee.monthsDisabled > 12) return 0;
  if (employee.isPartTime) return 0;
  // compute disability
}
```

**After:**
```javascript
function disabilityAmount(employee) {
  if (isNotEligibleForDisability(employee)) return 0;
  // compute disability
}

function isNotEligibleForDisability(employee) {
  return employee.seniority < 2 ||
         employee.monthsDisabled > 12 ||
         employee.isPartTime;
}
```

---

### Replace Nested Conditional with Guard Clauses

**When:** Special cases should be handled early and exit.

**Before:**
```javascript
function getPayAmount(employee) {
  let result;
  if (employee.isDead) {
    result = deadAmount();
  } else {
    if (employee.isSeparated) {
      result = separatedAmount();
    } else {
      if (employee.isRetired) {
        result = retiredAmount();
      } else {
        result = normalPayAmount();
      }
    }
  }
  return result;
}
```

**After:**
```javascript
function getPayAmount(employee) {
  if (employee.isDead) return deadAmount();
  if (employee.isSeparated) return separatedAmount();
  if (employee.isRetired) return retiredAmount();
  return normalPayAmount();
}
```

---

### Replace Conditional with Polymorphism

**When:** Conditional selects different behavior based on type.

**Before:**
```javascript
function plumage(bird) {
  switch (bird.type) {
    case 'EuropeanSwallow':
      return 'average';
    case 'AfricanSwallow':
      return bird.numberOfCoconuts > 2 ? 'tired' : 'average';
    case 'NorwegianBlueParrot':
      return bird.voltage > 100 ? 'scorched' : 'beautiful';
    default:
      return 'unknown';
  }
}
```

**After:**
```javascript
class Bird {
  plumage() { return 'unknown'; }
}

class EuropeanSwallow extends Bird {
  plumage() { return 'average'; }
}

class AfricanSwallow extends Bird {
  plumage() {
    return this.numberOfCoconuts > 2 ? 'tired' : 'average';
  }
}

class NorwegianBlueParrot extends Bird {
  plumage() {
    return this.voltage > 100 ? 'scorched' : 'beautiful';
  }
}
```

---

### Introduce Special Case (Null Object)

**When:** Many places check for null/special value and do same thing.

**Before:**
```javascript
// Repeated in many places
if (customer === null) {
  name = 'occupant';
  billingPlan = registry.getBillingPlan('basic');
} else {
  name = customer.name;
  billingPlan = customer.billingPlan;
}
```

**After:**
```javascript
class NullCustomer {
  get name() { return 'occupant'; }
  get billingPlan() { return registry.getBillingPlan('basic'); }
}

// Usage becomes simple
name = customer.name;
billingPlan = customer.billingPlan;
```

---

## Simplifying Method Calls

### Rename Method

**When:** Method name doesn't reveal intention.

**Mechanics:**
1. Check if method is part of interface/polymorphic
2. Create new method with better name
3. Copy body to new method
4. Change old body to delegate to new
5. Find all callers, update to new name
6. Remove old method
7. Test

---

### Add Parameter

**When:** Method needs more information from caller.

**Consider:** Is there a better way? Can you pass an object? Is there a method on the object that could provide this?

---

### Remove Parameter

**When:** Parameter is no longer used by method body.

---

### Separate Query from Modifier

**When:** Method both returns value AND has side effects.

**Before:**
```javascript
function getTotalOutstandingAndSendBill() {
  const result = customer.invoices.reduce((total, inv) =>
    inv.amount + total, 0);
  sendBill();
  return result;
}
```

**After:**
```javascript
function getTotalOutstanding() {
  return customer.invoices.reduce((total, inv) =>
    inv.amount + total, 0);
}

function sendBill() {
  emailGateway.send(formatBill(customer));
}
```

---

### Parameterize Method

**When:** Multiple methods do similar things with different hardcoded values.

**Before:**
```javascript
function tenPercentRaise(person) {
  person.salary = person.salary * 1.1;
}
function fivePercentRaise(person) {
  person.salary = person.salary * 1.05;
}
```

**After:**
```javascript
function raise(person, factor) {
  person.salary = person.salary * (1 + factor);
}
```

---

### Replace Parameter with Explicit Methods

**When:** Parameter is an enum/flag that changes method behavior.

**Before:**
```javascript
function setValue(name, value) {
  if (name === 'height') {
    this.height = value;
  } else if (name === 'width') {
    this.width = value;
  }
}
```

**After:**
```javascript
function setHeight(value) { this.height = value; }
function setWidth(value) { this.width = value; }
```

---

## Dealing with Generalization

### Pull Up Method

**When:** Same method exists in multiple subclasses.

**Mechanics:**
1. Inspect methods to ensure they are identical
2. Check all methods use same signatures
3. Create new method in superclass
4. Delete subclass methods
5. Test

---

### Push Down Method

**When:** Method only makes sense for some subclasses.

**Mechanics:**
1. Copy method to all subclasses that need it
2. Delete from superclass
3. Test

---

### Extract Superclass

**When:** Two classes have similar features.

**Mechanics:**
1. Create new empty superclass
2. Make original classes extend it
3. Pull Up Constructor Body
4. Pull Up Method for common methods
5. Pull Up Field for common fields
6. Test after each step

---

### Collapse Hierarchy

**When:** Superclass and subclass are too similar.

**Mechanics:**
1. Pick which to remove
2. Pull Up/Push Down all features to survivor
3. Adjust all references
4. Remove empty class
5. Test

---

### Replace Inheritance with Delegation

**When:** Subclass only uses part of superclass interface, or inheritance doesn't model "is-a".

**Before:**
```javascript
class Stack extends ArrayList {
  push(element) { this.add(element); }
  pop() { return this.remove(this.size() - 1); }
}
```

**After:**
```javascript
class Stack {
  constructor() {
    this.storage = new ArrayList();
  }
  push(element) { this.storage.add(element); }
  pop() { return this.storage.remove(this.storage.size() - 1); }
}
```

---

## Encapsulation

### Encapsulate Variable

**When:** Mutable data is accessed directly.

**Mechanics:**
1. Create encapsulating functions
2. Run static checks
3. For each reference, replace with function call
4. Restrict visibility of variable
5. Test

**Before:**
```javascript
let defaultOwner = { firstName: 'Martin', lastName: 'Fowler' };

// Usage
spaceship.owner = defaultOwner;
defaultOwner = { firstName: 'Rebecca', lastName: 'Parsons' };
```

**After:**
```javascript
let defaultOwnerData = { firstName: 'Martin', lastName: 'Fowler' };

function getDefaultOwner() { return { ...defaultOwnerData }; }
function setDefaultOwner(owner) { defaultOwnerData = owner; }

// Usage
spaceship.owner = getDefaultOwner();
setDefaultOwner({ firstName: 'Rebecca', lastName: 'Parsons' });
```

---

### Encapsulate Record

**When:** Mutable record/hash/dictionary needs controlled access.

**Before:**
```javascript
const organization = { name: 'Acme', country: 'US' };
```

**After:**
```javascript
class Organization {
  constructor(data) {
    this.name = data.name;
    this.country = data.country;
  }
  get name() { return this.name; }
  set name(value) { this.name = value; }
  get country() { return this.country; }
  set country(value) { this.country = value; }
}
```

---

## Quick Reference: Which Technique to Use?

| Problem | Technique |
|---------|-----------|
| Long method | Extract Method |
| Complex expression | Extract Variable |
| Data used more in other class | Move Field |
| Method uses other class's data | Move Method |
| Class has multiple responsibilities | Extract Class |
| Complex conditional | Decompose Conditional |
| Nested conditionals | Replace with Guard Clauses |
| Switch on type | Replace with Polymorphism |
| Duplicate code | Extract Method/Superclass |
| Primitive represents concept | Replace Primitive with Object |
| Direct access to mutable data | Encapsulate Variable |
| Collection returned directly | Encapsulate Collection |
| Null checks everywhere | Introduce Special Case |
