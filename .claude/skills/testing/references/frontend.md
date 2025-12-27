# Frontend Testing Guide

## Table of Contents
1. [Testing Pyramid for Frontend](#testing-pyramid-for-frontend)
2. [Vitest](#vitest)
3. [Playwright](#playwright)
4. [React Testing](#react-testing)
5. [Vue Testing](#vue-testing)
6. [Angular Testing](#angular-testing)
7. [Component Testing](#component-testing)
8. [E2E Testing Patterns](#e2e-testing-patterns)

---

## Testing Pyramid for Frontend

```
┌─────────────────────────────────────────────────────────┐
│                FRONTEND TESTING PYRAMID                 │
│                                                         │
│                    ┌─────────┐                         │
│                    │  E2E    │ ◄── Few (3-10 tests)    │
│                    │Playwright│    Critical flows       │
│                   ─┴─────────┴─                        │
│                 ┌───────────────┐                      │
│                 │  Component    │ ◄── Many             │
│                 │ Vitest+Browser│    UI interactions   │
│                ─┴───────────────┴─                     │
│              ┌───────────────────┐                     │
│              │      Unit         │ ◄── Most            │
│              │  Vitest/Jest      │    Business logic   │
│             ─┴───────────────────┴─                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Vitest

### Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom', // or 'happy-dom'
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
})
```

### Browser Mode (Component Testing)

```typescript
// vitest.config.ts for browser mode
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [
        { browser: 'chromium' },
      ],
    },
  },
})
```

### Unit Test Example

```typescript
// utils/format.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate } from './format'

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56')
  })

  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00')
  })

  it('handles negative values', () => {
    expect(formatCurrency(-100, 'USD')).toBe('-$100.00')
  })
})
```

### Mocking

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { fetchUser } from './api'

// Mock module
vi.mock('./api', () => ({
  fetchUser: vi.fn(),
}))

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays user data', async () => {
    vi.mocked(fetchUser).mockResolvedValue({
      id: 1,
      name: 'John Doe',
    })
    // ... test component
  })
})
```

---

## Playwright

### Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Example

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can login successfully', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="email"]', 'user@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="submit"]')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="welcome"]'))
      .toContainText('Welcome')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="email"]', 'wrong@example.com')
    await page.fill('[data-testid="password"]', 'wrongpass')
    await page.click('[data-testid="submit"]')

    await expect(page.locator('[data-testid="error"]'))
      .toBeVisible()
  })
})
```

### Page Object Model

```typescript
// e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.locator('[data-testid="email"]')
    this.passwordInput = page.locator('[data-testid="password"]')
    this.submitButton = page.locator('[data-testid="submit"]')
    this.errorMessage = page.locator('[data-testid="error"]')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}

// Usage in test
test('login flow', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('user@example.com', 'password')
})
```

---

## React Testing

### Setup with Vitest

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

### Component Test

```typescript
// components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('is disabled when loading', () => {
    render(<Button loading>Submit</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Testing Hooks

```typescript
// hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })

  it('increments count', () => {
    const { result } = renderHook(() => useCounter(5))

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(6)
  })
})
```

### Testing with React Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

it('fetches and displays data', async () => {
  render(<UserProfile userId="1" />, { wrapper: createWrapper() })
  // ... assertions
})
```

---

## Vue Testing

### Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
```

### Component Test

```typescript
// components/Counter.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Counter from './Counter.vue'

describe('Counter', () => {
  it('renders initial count', () => {
    const wrapper = mount(Counter, {
      props: { initialCount: 5 },
    })
    expect(wrapper.text()).toContain('5')
  })

  it('increments on button click', async () => {
    const wrapper = mount(Counter)

    await wrapper.find('button').trigger('click')

    expect(wrapper.text()).toContain('1')
  })

  it('emits update event', async () => {
    const wrapper = mount(Counter)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update')).toHaveLength(1)
    expect(wrapper.emitted('update')[0]).toEqual([1])
  })
})
```

### Testing with Pinia

```typescript
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { useUserStore } from '@/stores/user'

describe('UserProfile', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('displays user from store', () => {
    const store = useUserStore()
    store.user = { name: 'John' }

    const wrapper = mount(UserProfile)
    expect(wrapper.text()).toContain('John')
  })
})
```

---

## Angular Testing

### Component Test with TestBed

```typescript
// user.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UserComponent } from './user.component'
import { UserService } from './user.service'
import { of } from 'rxjs'

describe('UserComponent', () => {
  let component: UserComponent
  let fixture: ComponentFixture<UserComponent>
  let userService: jasmine.SpyObj<UserService>

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UserService', ['getUser'])

    await TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [{ provide: UserService, useValue: spy }],
    }).compileComponents()

    fixture = TestBed.createComponent(UserComponent)
    component = fixture.componentInstance
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>
  })

  it('should display user name', () => {
    userService.getUser.and.returnValue(of({ name: 'John' }))

    fixture.detectChanges()

    const element = fixture.nativeElement.querySelector('.name')
    expect(element.textContent).toContain('John')
  })
})
```

---

## Component Testing

### Vitest Browser Mode

```typescript
// components/Modal.test.tsx
import { render } from 'vitest-browser-react'
import { page } from '@vitest/browser/context'
import { describe, it, expect } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
  it('opens and closes correctly', async () => {
    const screen = render(<Modal title="Test Modal" />)

    // Open modal
    await page.getByRole('button', { name: 'Open' }).click()
    await expect.element(page.getByRole('dialog')).toBeVisible()

    // Close modal
    await page.getByRole('button', { name: 'Close' }).click()
    await expect.element(page.getByRole('dialog')).not.toBeVisible()
  })
})
```

### Golden/Snapshot Testing

```typescript
// For visual regression testing
import { expect, test } from '@playwright/test'

test('homepage visual regression', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('homepage.png')
})
```

---

## E2E Testing Patterns

### Handling Flaky Tests

```typescript
// Retry unstable tests
test('flaky network test', async ({ page }) => {
  test.info().annotations.push({ type: 'flaky' })
  // test implementation
})

// In config
retries: process.env.CI ? 2 : 0
```

### API Mocking

```typescript
test('mocked API response', async ({ page }) => {
  await page.route('**/api/users', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([{ id: 1, name: 'Mock User' }]),
    })
  })

  await page.goto('/users')
  await expect(page.locator('.user')).toContainText('Mock User')
})
```

### Accessibility Testing

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('should pass accessibility checks', async ({ page }) => {
  await page.goto('/')

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
```
