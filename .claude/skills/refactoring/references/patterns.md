# Design Patterns for Refactoring

Patterns to refactor toward, organized by technology domain. These are target structures that improve code quality.

## Table of Contents

1. [Universal Patterns](#universal-patterns)
2. [Frontend Patterns](#frontend-patterns)
3. [Backend Patterns](#backend-patterns)
4. [Mobile Patterns](#mobile-patterns)
5. [Infrastructure Patterns](#infrastructure-patterns)
6. [Data Patterns](#data-patterns)

---

## Universal Patterns

Patterns applicable across all technologies.

### Strategy Pattern

**Use When:** Algorithm varies independently from clients that use it.

**Refactor From:**
```javascript
// Switch on type
function calculateShipping(order) {
  switch (order.shippingType) {
    case 'standard': return order.weight * 1.5;
    case 'express': return order.weight * 3.0;
    case 'overnight': return order.weight * 5.0;
  }
}
```

**Refactor To:**
```javascript
// Strategy pattern
const shippingStrategies = {
  standard: (order) => order.weight * 1.5,
  express: (order) => order.weight * 3.0,
  overnight: (order) => order.weight * 5.0,
};

function calculateShipping(order) {
  return shippingStrategies[order.shippingType](order);
}
```

---

### Factory Pattern

**Use When:** Creation logic is complex or varies by type.

**Refactor From:**
```javascript
function createNotification(type, message) {
  if (type === 'email') {
    const n = new EmailNotification();
    n.setRecipient(config.emailRecipient);
    n.setSubject('Alert');
    n.setBody(message);
    return n;
  } else if (type === 'sms') {
    const n = new SMSNotification();
    n.setPhone(config.phoneNumber);
    n.setText(message);
    return n;
  }
  // ... more types
}
```

**Refactor To:**
```javascript
class NotificationFactory {
  static create(type, message) {
    const creators = {
      email: () => new EmailNotification(config.emailRecipient, message),
      sms: () => new SMSNotification(config.phoneNumber, message),
      push: () => new PushNotification(config.deviceId, message),
    };
    return creators[type]?.() ?? new NullNotification();
  }
}
```

---

### Builder Pattern

**Use When:** Complex object construction with many optional parameters.

**Refactor From:**
```javascript
const query = new Query(
  'users',
  ['name', 'email'],
  { status: 'active' },
  null,
  { name: 'asc' },
  10,
  0,
  true
);
```

**Refactor To:**
```javascript
const query = new QueryBuilder('users')
  .select(['name', 'email'])
  .where({ status: 'active' })
  .orderBy('name', 'asc')
  .limit(10)
  .withCount()
  .build();
```

---

### Facade Pattern

**Use When:** Complex subsystem needs simpler interface.

**Refactor From:**
```javascript
// Client code touches many subsystems
const user = userRepo.find(userId);
const cart = cartService.getCart(user);
const inventory = inventoryService.check(cart.items);
const payment = paymentService.charge(user.paymentMethod, cart.total);
const order = orderService.create(user, cart, payment);
emailService.sendConfirmation(user.email, order);
```

**Refactor To:**
```javascript
// Facade hides complexity
class CheckoutFacade {
  checkout(userId) {
    const user = this.userRepo.find(userId);
    const cart = this.cartService.getCart(user);
    this.inventoryService.reserve(cart.items);
    const payment = this.paymentService.charge(user.paymentMethod, cart.total);
    const order = this.orderService.create(user, cart, payment);
    this.emailService.sendConfirmation(user.email, order);
    return order;
  }
}

// Client code
const order = checkoutFacade.checkout(userId);
```

---

### Decorator Pattern

**Use When:** Adding behavior dynamically without modifying class.

**Refactor From:**
```javascript
class DataSource {
  write(data) {
    const encrypted = encrypt(data);
    const compressed = compress(encrypted);
    fs.writeFileSync(this.path, compressed);
  }
}
```

**Refactor To:**
```javascript
// Base
class FileDataSource {
  write(data) { fs.writeFileSync(this.path, data); }
}

// Decorators
class EncryptionDecorator {
  constructor(wrapped) { this.wrapped = wrapped; }
  write(data) { this.wrapped.write(encrypt(data)); }
}

class CompressionDecorator {
  constructor(wrapped) { this.wrapped = wrapped; }
  write(data) { this.wrapped.write(compress(data)); }
}

// Compose behavior
const source = new CompressionDecorator(
  new EncryptionDecorator(
    new FileDataSource(path)
  )
);
```

---

### Observer Pattern

**Use When:** Multiple objects need to react to state changes.

**Refactor From:**
```javascript
class Order {
  complete() {
    this.status = 'completed';
    emailService.sendConfirmation(this);
    inventoryService.updateStock(this.items);
    analyticsService.trackPurchase(this);
    loyaltyService.addPoints(this.customer, this.total);
  }
}
```

**Refactor To:**
```javascript
class Order extends EventEmitter {
  complete() {
    this.status = 'completed';
    this.emit('completed', this);
  }
}

// Subscribers registered elsewhere
order.on('completed', (o) => emailService.sendConfirmation(o));
order.on('completed', (o) => inventoryService.updateStock(o.items));
order.on('completed', (o) => analyticsService.trackPurchase(o));
order.on('completed', (o) => loyaltyService.addPoints(o.customer, o.total));
```

---

## Frontend Patterns

### Container/Presentational Pattern

**Use When:** Component mixes logic and presentation.

**Refactor From:**
```jsx
// Mixed concerns
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />;
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          <img src={user.avatar} />
          <span>{user.name}</span>
        </li>
      ))}
    </ul>
  );
}
```

**Refactor To:**
```jsx
// Container (logic)
function UserListContainer() {
  const { users, loading } = useUsers();
  if (loading) return <Spinner />;
  return <UserList users={users} />;
}

// Presentational (pure UI)
function UserList({ users }) {
  return (
    <ul>
      {users.map(user => <UserListItem key={user.id} user={user} />)}
    </ul>
  );
}

function UserListItem({ user }) {
  return (
    <li>
      <img src={user.avatar} />
      <span>{user.name}</span>
    </li>
  );
}

// Custom hook
function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => { setUsers(data); setLoading(false); });
  }, []);
  return { users, loading };
}
```

---

### Compound Components Pattern

**Use When:** Related components need implicit communication.

**Refactor From:**
```jsx
<Select
  value={selected}
  onChange={setSelected}
  options={options}
  renderOption={(opt) => <CustomOption {...opt} />}
  showClearButton={true}
  placeholder="Select..."
/>
```

**Refactor To:**
```jsx
<Select value={selected} onChange={setSelected}>
  <Select.Trigger placeholder="Select..." />
  <Select.Options>
    {options.map(opt => (
      <Select.Option key={opt.id} value={opt.id}>
        <CustomOption {...opt} />
      </Select.Option>
    ))}
  </Select.Options>
  <Select.ClearButton />
</Select>
```

---

### Render Props / Custom Hooks Pattern

**Use When:** Sharing stateful logic between components.

**Refactor From (duplicated):**
```jsx
function ComponentA() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  // use position...
}

function ComponentB() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // Same logic duplicated...
}
```

**Refactor To (custom hook):**
```jsx
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return position;
}

function ComponentA() {
  const position = useMousePosition();
  // use position...
}

function ComponentB() {
  const position = useMousePosition();
  // use position...
}
```

---

### State Machine Pattern

**Use When:** Component has complex state transitions.

**Refactor From:**
```jsx
function Form() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit() {
    setIsSubmitting(true);
    setIsError(false);
    try {
      await submitForm(data);
      setIsSuccess(true);
    } catch (e) {
      setIsError(true);
      setErrorMessage(e.message);
    } finally {
      setIsSubmitting(false);
    }
  }
  // Multiple boolean flags, easy to have invalid states
}
```

**Refactor To:**
```jsx
const formMachine = {
  idle: { submit: 'submitting' },
  submitting: { success: 'success', error: 'error' },
  success: { reset: 'idle' },
  error: { retry: 'submitting', reset: 'idle' },
};

function Form() {
  const [state, setState] = useState('idle');
  const [error, setError] = useState(null);

  function transition(event) {
    const nextState = formMachine[state][event];
    if (nextState) setState(nextState);
  }

  async function handleSubmit() {
    transition('submit');
    try {
      await submitForm(data);
      transition('success');
    } catch (e) {
      setError(e);
      transition('error');
    }
  }

  // Single state variable, impossible to have invalid states
  return (
    <>
      {state === 'idle' && <button onClick={handleSubmit}>Submit</button>}
      {state === 'submitting' && <Spinner />}
      {state === 'success' && <SuccessMessage />}
      {state === 'error' && <ErrorMessage error={error} onRetry={handleSubmit} />}
    </>
  );
}
```

---

## Backend Patterns

### Repository Pattern

**Use When:** Data access logic is scattered or tightly coupled.

**Refactor From:**
```python
# Controller directly queries database
class UserController:
    def get_users(self):
        connection = db.connect()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users WHERE active = 1")
        users = cursor.fetchall()
        return [{"id": u[0], "name": u[1]} for u in users]
```

**Refactor To:**
```python
# Repository abstracts data access
class UserRepository:
    def find_active(self) -> List[User]:
        return self.session.query(User).filter(User.active == True).all()

    def find_by_id(self, id: int) -> Optional[User]:
        return self.session.query(User).get(id)

    def save(self, user: User) -> User:
        self.session.add(user)
        self.session.commit()
        return user

class UserController:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def get_users(self):
        return self.user_repo.find_active()
```

---

### Service Layer Pattern

**Use When:** Business logic is in controllers or scattered.

**Refactor From:**
```python
class OrderController:
    def create_order(self, data):
        user = db.users.get(data['user_id'])
        if not user.is_active:
            raise Error("User inactive")

        items = []
        for item in data['items']:
            product = db.products.get(item['product_id'])
            if product.stock < item['quantity']:
                raise Error("Insufficient stock")
            product.stock -= item['quantity']
            items.append(OrderItem(product, item['quantity']))

        order = Order(user, items)
        order.total = sum(i.product.price * i.quantity for i in items)
        db.orders.save(order)
        email.send(user.email, "Order confirmed")
        return order
```

**Refactor To:**
```python
class OrderService:
    def __init__(self, user_repo, product_repo, order_repo, email_service):
        self.user_repo = user_repo
        self.product_repo = product_repo
        self.order_repo = order_repo
        self.email_service = email_service

    def create_order(self, user_id: int, items: List[OrderItemDTO]) -> Order:
        user = self._get_active_user(user_id)
        order_items = self._prepare_items(items)
        order = Order(user, order_items)
        self.order_repo.save(order)
        self.email_service.send_order_confirmation(user, order)
        return order

    def _get_active_user(self, user_id):
        user = self.user_repo.find_by_id(user_id)
        if not user or not user.is_active:
            raise UserNotActiveError()
        return user

    def _prepare_items(self, items):
        # ...encapsulated logic

class OrderController:
    def create_order(self, data):
        return self.order_service.create_order(
            data['user_id'],
            data['items']
        )
```

---

### Middleware/Decorator Pattern (Backend)

**Use When:** Cross-cutting concerns (logging, auth, caching) are duplicated.

**Refactor From:**
```python
class UserController:
    def get_user(self, id):
        logger.info(f"Getting user {id}")
        start = time.time()
        try:
            if not self.auth.check():
                raise Unauthorized()
            user = self.user_repo.find(id)
            logger.info(f"Completed in {time.time() - start}s")
            return user
        except Exception as e:
            logger.error(f"Error: {e}")
            raise
```

**Refactor To:**
```python
# Decorators handle cross-cutting concerns
@authenticated
@logged
@timed
def get_user(self, id):
    return self.user_repo.find(id)

# Or middleware pipeline
app.use(logging_middleware)
app.use(auth_middleware)
app.use(timing_middleware)
```

---

### CQRS (Command Query Responsibility Segregation)

**Use When:** Read and write models have different requirements.

**Refactor From:**
```python
class ProductRepository:
    def get_product(self, id):
        # Same model for reading...
        return self.session.query(Product).get(id)

    def get_products_for_catalog(self):
        # ...and for complex queries
        return self.session.query(Product)\
            .join(Category)\
            .join(Inventory)\
            .filter(Inventory.stock > 0)\
            .all()

    def save(self, product):
        self.session.add(product)
```

**Refactor To:**
```python
# Write model (Commands)
class ProductCommandRepository:
    def save(self, product):
        self.session.add(product)

# Read model (Queries) - can be denormalized
class ProductQueryRepository:
    def get_catalog_view(self):
        # Optimized for reading, possibly from different store
        return self.read_db.query(CatalogView).all()

    def get_product_details(self, id):
        return self.read_db.query(ProductDetailView).get(id)
```

---

## Mobile Patterns

### MVVM (Model-View-ViewModel)

**Use When:** UI logic mixed with business logic in views.

**Refactor From:**
```swift
// iOS example - everything in ViewController
class UserViewController: UIViewController {
    @IBOutlet weak var nameLabel: UILabel!

    var userId: Int!

    override func viewDidLoad() {
        super.viewDidLoad()
        fetchUser()
    }

    func fetchUser() {
        let url = URL(string: "https://api.example.com/users/\(userId!)")!
        URLSession.shared.dataTask(with: url) { data, _, _ in
            let user = try! JSONDecoder().decode(User.self, from: data!)
            DispatchQueue.main.async {
                self.nameLabel.text = user.firstName + " " + user.lastName
            }
        }.resume()
    }
}
```

**Refactor To:**
```swift
// ViewModel
class UserViewModel: ObservableObject {
    @Published var displayName: String = ""
    @Published var isLoading: Bool = false

    private let userService: UserService

    func loadUser(id: Int) {
        isLoading = true
        userService.fetchUser(id: id) { [weak self] result in
            DispatchQueue.main.async {
                self?.isLoading = false
                if case .success(let user) = result {
                    self?.displayName = "\(user.firstName) \(user.lastName)"
                }
            }
        }
    }
}

// View
class UserViewController: UIViewController {
    @IBOutlet weak var nameLabel: UILabel!

    var viewModel: UserViewModel!

    override func viewDidLoad() {
        super.viewDidLoad()
        viewModel.$displayName
            .receive(on: DispatchQueue.main)
            .sink { [weak self] name in
                self?.nameLabel.text = name
            }
            .store(in: &cancellables)
        viewModel.loadUser(id: userId)
    }
}
```

---

### Coordinator Pattern (Navigation)

**Use When:** Navigation logic scattered across views.

**Refactor From:**
```swift
// Navigation in view controllers
class ProductListViewController {
    func didSelectProduct(_ product: Product) {
        let vc = ProductDetailViewController()
        vc.product = product
        navigationController?.pushViewController(vc, animated: true)
    }
}

class ProductDetailViewController {
    func buyTapped() {
        let vc = CheckoutViewController()
        vc.product = product
        navigationController?.pushViewController(vc, animated: true)
    }
}
```

**Refactor To:**
```swift
// Coordinator owns navigation
protocol Coordinator {
    func start()
}

class ProductCoordinator: Coordinator {
    private let navigationController: UINavigationController

    func start() {
        showProductList()
    }

    func showProductList() {
        let vc = ProductListViewController()
        vc.delegate = self
        navigationController.pushViewController(vc, animated: true)
    }

    func showProductDetail(_ product: Product) {
        let vc = ProductDetailViewController()
        vc.product = product
        vc.delegate = self
        navigationController.pushViewController(vc, animated: true)
    }

    func startCheckout(_ product: Product) {
        let coordinator = CheckoutCoordinator(navigationController)
        coordinator.start(with: product)
    }
}

extension ProductCoordinator: ProductListDelegate {
    func didSelectProduct(_ product: Product) {
        showProductDetail(product)
    }
}
```

---

## Infrastructure Patterns

### Module Pattern (Terraform/IaC)

**Use When:** Infrastructure code is duplicated across environments.

**Refactor From:**
```hcl
# dev/main.tf
resource "aws_instance" "web" {
  ami           = "ami-12345"
  instance_type = "t2.micro"
  tags = { Name = "dev-web", Environment = "dev" }
}

# prod/main.tf (duplicated)
resource "aws_instance" "web" {
  ami           = "ami-12345"
  instance_type = "t2.large"
  tags = { Name = "prod-web", Environment = "prod" }
}
```

**Refactor To:**
```hcl
# modules/web-server/main.tf
variable "environment" {}
variable "instance_type" {}

resource "aws_instance" "web" {
  ami           = var.ami
  instance_type = var.instance_type
  tags = {
    Name        = "${var.environment}-web"
    Environment = var.environment
  }
}

# environments/dev/main.tf
module "web" {
  source        = "../../modules/web-server"
  environment   = "dev"
  instance_type = "t2.micro"
}

# environments/prod/main.tf
module "web" {
  source        = "../../modules/web-server"
  environment   = "prod"
  instance_type = "t2.large"
}
```

---

## Data Patterns

### Data Access Object (DAO) Pattern

**Refactor From:**
```python
# SQL scattered in business logic
def process_order(order_id):
    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order = cursor.fetchone()
    # business logic
    cursor.execute("UPDATE orders SET status = ? WHERE id = ?", ('processed', order_id))
```

**Refactor To:**
```python
class OrderDAO:
    def find_by_id(self, id: int) -> Order:
        cursor.execute("SELECT * FROM orders WHERE id = ?", (id,))
        return self._map_to_order(cursor.fetchone())

    def update_status(self, id: int, status: str):
        cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (status, id))

def process_order(order_id):
    order = order_dao.find_by_id(order_id)
    # business logic
    order_dao.update_status(order_id, 'processed')
```

---

## Pattern Selection Guide

| Situation | Consider Pattern |
|-----------|-----------------|
| Algorithm varies by type | Strategy |
| Complex object construction | Builder |
| Hide subsystem complexity | Facade |
| Add behavior dynamically | Decorator |
| React to state changes | Observer |
| Separate UI from logic | Container/Presentational, MVVM |
| Share stateful logic | Custom Hooks, Render Props |
| Abstract data access | Repository |
| Separate concerns in backend | Service Layer |
| Navigation scattered | Coordinator |
| Infra code duplicated | Module Pattern |
