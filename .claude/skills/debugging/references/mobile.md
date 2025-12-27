# Mobile Debugging

Debugging techniques for iOS, Android, React Native, and Flutter applications.

## Table of Contents

1. [iOS Debugging](#ios-debugging)
2. [Android Debugging](#android-debugging)
3. [React Native Debugging](#react-native-debugging)
4. [Flutter Debugging](#flutter-debugging)
5. [Common Mobile Issues](#common-mobile-issues)

---

## iOS Debugging

### Xcode Debugger

**LLDB Commands**:
```
po object          - Print object description
p variable         - Print variable value
expr var = value   - Modify variable at runtime
bt                 - Print backtrace
frame select N     - Go to frame N
thread list        - List all threads
thread backtrace all - All thread backtraces
```

**Breakpoint Actions**:
- Log message without stopping
- Play sound
- Execute debugger command
- Evaluate expression

### Instruments

| Instrument | Purpose |
|------------|---------|
| Time Profiler | CPU usage analysis |
| Allocations | Memory allocation tracking |
| Leaks | Memory leak detection |
| Network | Network traffic analysis |
| Core Animation | UI performance (FPS) |
| Energy Log | Battery usage |

### Common iOS Issues

#### Memory Leaks (Retain Cycles)

```swift
// Bug: Strong reference cycle
class Parent {
    var child: Child?
}
class Child {
    var parent: Parent? // Strong reference back
}

// Fix: Use weak reference
class Child {
    weak var parent: Parent?
}
```

**Debug**: Product → Profile → Leaks

#### Main Thread Violations

```swift
// Bug: UI update from background thread
DispatchQueue.global().async {
    self.label.text = "Updated" // Crash or undefined behavior
}

// Fix: Dispatch to main thread
DispatchQueue.global().async {
    let result = self.compute()
    DispatchQueue.main.async {
        self.label.text = result
    }
}
```

**Debug**: Enable Main Thread Checker in scheme diagnostics.

#### Crash Symbolication

```bash
# Symbolicate crash log
xcrun atos -arch arm64 -o App.app.dSYM/Contents/Resources/DWARF/App -l 0x100000000 0x1000abcde
```

---

## Android Debugging

### Android Studio Debugger

**Logcat**:
```kotlin
Log.v(TAG, "Verbose")
Log.d(TAG, "Debug")
Log.i(TAG, "Info")
Log.w(TAG, "Warning")
Log.e(TAG, "Error", exception)
```

**Filter logcat**:
```
tag:MyApp              - By tag
level:error            - By level
package:com.myapp      - By package
```

### Android Profiler

```
View → Tool Windows → Profiler

CPU Profiler:
- Sample or trace Java/Kotlin methods
- View call chart, flame chart
- Identify hot methods

Memory Profiler:
- Track allocations
- Capture heap dump
- Detect memory leaks

Network Profiler:
- View request/response
- Check payload sizes
- Timeline of network calls
```

### Common Android Issues

#### Memory Leaks

```kotlin
// Bug: Activity leak via inner class
class MyActivity : Activity() {
    inner class MyHandler : Handler() { // Holds implicit reference to Activity
        override fun handleMessage(msg: Message) { }
    }
}

// Fix: Use static class with weak reference
class MyActivity : Activity() {
    class MyHandler(activity: MyActivity) : Handler() {
        private val activityRef = WeakReference(activity)
        override fun handleMessage(msg: Message) {
            activityRef.get()?.let { /* use activity */ }
        }
    }
}
```

**Debug**: Use LeakCanary library for automatic leak detection.

#### ANR (Application Not Responding)

```
Causes:
- Main thread blocked >5 seconds
- BroadcastReceiver not finished in 10 seconds
- Service not started in 20 seconds

Debug:
1. Check /data/anr/traces.txt
2. Look for main thread doing I/O, network, heavy computation
3. Move work to background thread
```

#### Fragment Lifecycle Issues

```kotlin
// Bug: Accessing view after onDestroyView
override fun onDestroyView() {
    super.onDestroyView()
    // binding is now invalid
}

// Fix: Null out binding
private var _binding: FragmentBinding? = null
private val binding get() = _binding!!

override fun onDestroyView() {
    super.onDestroyView()
    _binding = null
}
```

### ADB Commands

```bash
# Install/uninstall
adb install app.apk
adb uninstall com.package.name

# Shell
adb shell
adb shell am start -n com.package/.MainActivity

# Logs
adb logcat
adb logcat -c  # Clear log

# Files
adb pull /sdcard/file.txt ./
adb push ./file.txt /sdcard/

# Screen capture
adb exec-out screencap -p > screen.png
adb shell screenrecord /sdcard/video.mp4
```

---

## React Native Debugging

### Flipper

Facebook's extensible mobile app debugger:
- Layout Inspector
- Network Inspector
- Database Inspector
- Shared Preferences Viewer
- Crash Reporter
- React DevTools integration

### React Native Debugger

```
Shake device or Cmd+D (iOS) / Cmd+M (Android)
→ Debug with Chrome

Features:
- Console logging
- React DevTools
- Redux DevTools
- Network inspection
- Breakpoints
```

### Common React Native Issues

#### Bridge Performance

```javascript
// Bug: Excessive bridge traffic
<FlatList
  data={largeData}
  renderItem={({item}) => (
    <TouchableOpacity onPress={() => handlePress(item)}>
      {/* Creates new function on every render */}
    </TouchableOpacity>
  )}
/>

// Fix: Memoize callbacks
const renderItem = useCallback(({item}) => (
  <TouchableOpacity onPress={() => handlePress(item.id)}>
    {/* ... */}
  </TouchableOpacity>
), [handlePress]);
```

#### Metro Bundler Issues

```bash
# Clear cache
npx react-native start --reset-cache

# Or manually
rm -rf node_modules/.cache
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
watchman watch-del-all
```

#### Native Module Errors

```
"Invariant Violation: Native module cannot be null"

Debug:
1. Check native module is linked (react-native link / autolinking)
2. Rebuild native project (cd ios && pod install)
3. Check module name matches between JS and native
4. Verify module is registered in correct location
```

### Hermes Debugging

```
For Hermes-enabled apps:
1. Use Flipper (has Hermes debugger)
2. Or: chrome://inspect → Configure → localhost:8081

Hermes-specific profiling:
- hermes-profile-transformer for CPU profiles
```

---

## Flutter Debugging

### Flutter DevTools

```bash
flutter pub global activate devtools
flutter pub global run devtools
```

**Features**:
- Widget Inspector
- Performance view
- CPU Profiler
- Memory view
- Network view
- Logging

### Debugging Commands

```dart
// Debug print
debugPrint('Message'); // Truncates long output

// Debug paint
import 'package:flutter/rendering.dart';
debugPaintSizeEnabled = true;
debugPaintBaselinesEnabled = true;
debugPaintLayerBordersEnabled = true;

// Widget inspector
import 'package:flutter/widgets.dart';
debugDumpApp();
debugDumpRenderTree();
debugDumpLayerTree();
```

### Common Flutter Issues

#### Overflow Errors

```dart
// Bug: RenderFlex overflowed
Row(
  children: [
    Text('Very long text that causes overflow'),
  ],
)

// Fix: Use Flexible/Expanded
Row(
  children: [
    Flexible(
      child: Text('Long text', overflow: TextOverflow.ellipsis),
    ),
  ],
)
```

#### setState After Dispose

```dart
// Bug: setState called after dispose
void fetchData() async {
  final data = await api.getData();
  setState(() { this.data = data; }); // Error if widget disposed
}

// Fix: Check mounted
void fetchData() async {
  final data = await api.getData();
  if (mounted) {
    setState(() { this.data = data; });
  }
}
```

#### Widget Rebuild Performance

```dart
// Bug: Entire tree rebuilds
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<MyModel>( // Rebuilds everything below
      builder: (context, model, child) => ExpensiveWidget(model.data),
    );
  }
}

// Fix: Use const and child parameter
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<MyModel>(
      builder: (context, model, child) => Column(
        children: [Text(model.data), child!],
      ),
      child: const ExpensiveWidget(), // Not rebuilt
    );
  }
}
```

---

## Common Mobile Issues

### Network Connectivity

```
Issues:
- Intermittent failures on mobile networks
- Timeout settings too aggressive
- No offline handling

Debug:
1. Test with Network Link Conditioner (iOS) or Network Profiler (Android)
2. Simulate airplane mode, poor connection
3. Check retry logic and timeout configuration
```

### Battery Drain

```
Causes:
- Frequent location updates
- Excessive network polling
- Wake locks held too long
- Background processing

Debug:
- iOS: Instruments → Energy Log
- Android: Battery Historian
```

### App Size

```
iOS:
- Enable bitcode
- Remove unused architectures for release
- Optimize assets

Android:
- Enable ProGuard/R8
- Use Android App Bundle
- Remove unused resources
```

### Deep Linking Issues

```
Debug:
1. Verify URL scheme registration
2. Test with: adb shell am start -a android.intent.action.VIEW -d "myapp://path"
3. Check universal links / app links configuration
4. Verify apple-app-site-association / assetlinks.json
```
