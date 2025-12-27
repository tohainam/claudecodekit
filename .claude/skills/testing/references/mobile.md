# Mobile Testing Guide

## Table of Contents
1. [Mobile Testing Strategy](#mobile-testing-strategy)
2. [React Native Testing](#react-native-testing)
3. [Flutter Testing](#flutter-testing)
4. [iOS Native Testing](#ios-native-testing)
5. [Android Native Testing](#android-native-testing)
6. [Cross-Platform Tools](#cross-platform-tools)
7. [Device Testing](#device-testing)

---

## Mobile Testing Strategy

### Testing Pyramid for Mobile

```
┌─────────────────────────────────────────────────────────┐
│               MOBILE TESTING PYRAMID                    │
│                                                         │
│                    ┌─────────┐                         │
│                    │  E2E    │ ◄── Critical flows      │
│                    │ Detox/  │    Real devices         │
│                    │ Patrol  │                         │
│                   ─┴─────────┴─                        │
│                 ┌───────────────┐                      │
│                 │  Integration  │ ◄── Widget/Component │
│                 │  Widget Tests │    UI interactions   │
│                ─┴───────────────┴─                     │
│              ┌───────────────────┐                     │
│              │      Unit         │ ◄── Business logic  │
│              │  Jest/dart test   │    Pure functions   │
│             ─┴───────────────────┴─                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Key Testing Areas

| Area | What to Test | Tools |
|------|-------------|-------|
| Business Logic | Pure functions, state | Jest, dart test |
| UI Components | Rendering, interactions | Testing Library, Widget tests |
| Navigation | Screen transitions | Detox, Patrol |
| API Integration | Network calls | MSW, Mockito |
| Device Features | Camera, GPS, storage | Mocks, Real devices |
| Performance | Startup, animations | Profilers |

---

## React Native Testing

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
}
```

### Component Test with Testing Library

```typescript
// __tests__/components/Button.test.tsx
import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react-native'
import { Button } from '@/components/Button'

describe('Button', () => {
  it('renders with title', () => {
    render(<Button title="Press me" onPress={() => {}} />)

    expect(screen.getByText('Press me')).toBeTruthy()
  })

  it('calls onPress when pressed', () => {
    const onPress = jest.fn()
    render(<Button title="Press" onPress={onPress} />)

    fireEvent.press(screen.getByText('Press'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('is disabled when loading', () => {
    render(<Button title="Submit" loading onPress={() => {}} />)

    const button = screen.getByTestId('button')
    expect(button.props.accessibilityState.disabled).toBe(true)
  })
})
```

### Testing Hooks

```typescript
// __tests__/hooks/useAuth.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native'
import { useAuth } from '@/hooks/useAuth'
import { AuthProvider } from '@/contexts/AuthContext'

const wrapper = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useAuth', () => {
  it('logs in user successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.login('user@test.com', 'password')
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })
  })
})
```

### Detox E2E Testing

```typescript
// e2e/login.test.ts
import { device, element, by, expect } from 'detox'

describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('should login successfully with valid credentials', async () => {
    await element(by.id('email-input')).typeText('user@test.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('login-button')).tap()

    await expect(element(by.id('home-screen'))).toBeVisible()
    await expect(element(by.text('Welcome'))).toBeVisible()
  })

  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('wrong@test.com')
    await element(by.id('password-input')).typeText('wrongpass')
    await element(by.id('login-button')).tap()

    await expect(element(by.id('error-message'))).toBeVisible()
  })
})
```

### Detox Configuration

```javascript
// .detoxrc.js
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Debug-iphonesimulator/MyApp.app',
      build: 'xcodebuild -workspace ios/MyApp.xcworkspace -scheme MyApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 15' },
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_7_API_34' },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
}
```

---

## Flutter Testing

### Unit Test

```dart
// test/services/calculator_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:myapp/services/calculator.dart';

void main() {
  group('Calculator', () {
    late Calculator calculator;

    setUp(() {
      calculator = Calculator();
    });

    test('adds two numbers correctly', () {
      expect(calculator.add(2, 3), equals(5));
    });

    test('handles negative numbers', () {
      expect(calculator.add(-1, 1), equals(0));
    });

    test('divides with error handling', () {
      expect(() => calculator.divide(10, 0), throwsArgumentError);
    });
  });
}
```

### Widget Test

```dart
// test/widgets/counter_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:myapp/widgets/counter.dart';

void main() {
  testWidgets('Counter increments on tap', (WidgetTester tester) async {
    // Build widget
    await tester.pumpWidget(
      const MaterialApp(home: CounterWidget()),
    );

    // Verify initial state
    expect(find.text('0'), findsOneWidget);
    expect(find.text('1'), findsNothing);

    // Tap increment button
    await tester.tap(find.byIcon(Icons.add));
    await tester.pump();

    // Verify state changed
    expect(find.text('0'), findsNothing);
    expect(find.text('1'), findsOneWidget);
  });

  testWidgets('Counter decrements on tap', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: CounterWidget(initialValue: 5)),
    );

    await tester.tap(find.byIcon(Icons.remove));
    await tester.pump();

    expect(find.text('4'), findsOneWidget);
  });
}
```

### Mocking with Mockito

```dart
// test/services/user_service_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:myapp/services/api_client.dart';
import 'package:myapp/services/user_service.dart';

import 'user_service_test.mocks.dart';

@GenerateMocks([ApiClient])
void main() {
  late MockApiClient mockApiClient;
  late UserService userService;

  setUp(() {
    mockApiClient = MockApiClient();
    userService = UserService(mockApiClient);
  });

  test('getUser returns user from API', () async {
    when(mockApiClient.get('/users/1'))
        .thenAnswer((_) async => {'id': '1', 'name': 'John'});

    final user = await userService.getUser('1');

    expect(user.name, equals('John'));
    verify(mockApiClient.get('/users/1')).called(1);
  });
}
```

### Golden Tests with Alchemist

```dart
// test/golden/button_test.dart
import 'package:alchemist/alchemist.dart';
import 'package:flutter/material.dart';
import 'package:myapp/widgets/custom_button.dart';

void main() {
  goldenTest(
    'CustomButton renders correctly',
    fileName: 'custom_button',
    builder: () => GoldenTestGroup(
      children: [
        GoldenTestScenario(
          name: 'default',
          child: CustomButton(label: 'Click Me'),
        ),
        GoldenTestScenario(
          name: 'disabled',
          child: CustomButton(label: 'Disabled', enabled: false),
        ),
        GoldenTestScenario(
          name: 'loading',
          child: CustomButton(label: 'Loading', isLoading: true),
        ),
      ],
    ),
  );
}
```

### Patrol E2E Testing

```dart
// integration_test/login_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:patrol/patrol.dart';
import 'package:myapp/main.dart' as app;

void main() {
  patrolTest(
    'User can login successfully',
    ($) async {
      app.main();
      await $.pumpAndSettle();

      // Find and interact with native elements
      await $(#emailField).enterText('user@test.com');
      await $(#passwordField).enterText('password123');
      await $(#loginButton).tap();

      // Wait for navigation
      await $.pumpAndSettle();

      // Verify home screen
      expect($(#homeScreen), findsOneWidget);
      expect($('Welcome'), findsOneWidget);
    },
  );
}
```

---

## iOS Native Testing

### XCTest Unit Test

```swift
// UserServiceTests.swift
import XCTest
@testable import MyApp

final class UserServiceTests: XCTestCase {
    var sut: UserService!
    var mockAPI: MockAPIClient!

    override func setUp() {
        super.setUp()
        mockAPI = MockAPIClient()
        sut = UserService(apiClient: mockAPI)
    }

    override func tearDown() {
        sut = nil
        mockAPI = nil
        super.tearDown()
    }

    func testFetchUser_ReturnsUser() async throws {
        // Arrange
        let expectedUser = User(id: "1", name: "John")
        mockAPI.stubbedResult = expectedUser

        // Act
        let user = try await sut.fetchUser(id: "1")

        // Assert
        XCTAssertEqual(user.name, "John")
        XCTAssertEqual(mockAPI.fetchCallCount, 1)
    }

    func testFetchUser_ThrowsOnError() async {
        mockAPI.shouldThrowError = true

        do {
            _ = try await sut.fetchUser(id: "1")
            XCTFail("Expected error to be thrown")
        } catch {
            XCTAssertTrue(error is APIError)
        }
    }
}
```

### XCUITest

```swift
// LoginUITests.swift
import XCTest

final class LoginUITests: XCTestCase {
    var app: XCUIApplication!

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    func testSuccessfulLogin() {
        let emailField = app.textFields["email"]
        let passwordField = app.secureTextFields["password"]
        let loginButton = app.buttons["Login"]

        emailField.tap()
        emailField.typeText("user@test.com")

        passwordField.tap()
        passwordField.typeText("password123")

        loginButton.tap()

        // Wait for home screen
        let homeScreen = app.otherElements["HomeScreen"]
        XCTAssertTrue(homeScreen.waitForExistence(timeout: 5))
    }
}
```

---

## Android Native Testing

### JUnit 5 Test

```kotlin
// UserServiceTest.kt
import org.junit.jupiter.api.*
import org.mockito.kotlin.*
import kotlinx.coroutines.test.runTest

class UserServiceTest {
    private lateinit var mockApi: ApiClient
    private lateinit var sut: UserService

    @BeforeEach
    fun setup() {
        mockApi = mock()
        sut = UserService(mockApi)
    }

    @Test
    fun `getUser returns user when API succeeds`() = runTest {
        // Arrange
        val expected = User(id = "1", name = "John")
        whenever(mockApi.getUser("1")).thenReturn(expected)

        // Act
        val result = sut.getUser("1")

        // Assert
        assertEquals("John", result.name)
        verify(mockApi).getUser("1")
    }

    @Test
    fun `getUser throws when API fails`() = runTest {
        whenever(mockApi.getUser(any())).thenThrow(ApiException())

        assertThrows<ApiException> {
            sut.getUser("1")
        }
    }
}
```

### Espresso UI Test

```kotlin
// LoginActivityTest.kt
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.*
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.ext.junit.rules.ActivityScenarioRule
import org.junit.Rule
import org.junit.Test

class LoginActivityTest {
    @get:Rule
    val activityRule = ActivityScenarioRule(LoginActivity::class.java)

    @Test
    fun successfulLogin_navigatesToHome() {
        onView(withId(R.id.emailInput))
            .perform(typeText("user@test.com"), closeSoftKeyboard())

        onView(withId(R.id.passwordInput))
            .perform(typeText("password123"), closeSoftKeyboard())

        onView(withId(R.id.loginButton))
            .perform(click())

        onView(withId(R.id.homeScreen))
            .check(matches(isDisplayed()))
    }
}
```

---

## Cross-Platform Tools

### Maestro (YAML-based)

```yaml
# .maestro/login_flow.yaml
appId: com.myapp
---
- launchApp
- tapOn:
    id: "email-input"
- inputText: "user@test.com"
- tapOn:
    id: "password-input"
- inputText: "password123"
- tapOn:
    id: "login-button"
- assertVisible:
    id: "home-screen"
```

### Appium Test

```typescript
// login.appium.test.ts
import { remote } from 'webdriverio'

describe('Login Flow', () => {
  let driver: WebdriverIO.Browser

  before(async () => {
    driver = await remote({
      capabilities: {
        platformName: 'iOS',
        'appium:deviceName': 'iPhone 15',
        'appium:app': './path/to/app.ipa',
      },
    })
  })

  it('should login successfully', async () => {
    const emailInput = await driver.$('~email-input')
    await emailInput.setValue('user@test.com')

    const passwordInput = await driver.$('~password-input')
    await passwordInput.setValue('password123')

    const loginButton = await driver.$('~login-button')
    await loginButton.click()

    const homeScreen = await driver.$('~home-screen')
    await expect(homeScreen).toBeDisplayed()
  })
})
```

---

## Device Testing

### Device Matrix

| Category | Devices to Test |
|----------|-----------------|
| iOS | iPhone 15, iPhone SE, iPad |
| Android | Pixel 7, Samsung S23, Budget device |
| Screen sizes | Small, Medium, Large, Tablet |
| OS versions | Latest, Latest-1, Minimum supported |

### CI Configuration (GitHub Actions)

```yaml
# .github/workflows/mobile-tests.yml
name: Mobile Tests

on: [push, pull_request]

jobs:
  ios-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
      - run: flutter test
      - run: flutter build ios --simulator
      - run: flutter test integration_test

  android-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
      - uses: subosito/flutter-action@v2
      - run: flutter test
      - uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 34
          script: flutter test integration_test
```
