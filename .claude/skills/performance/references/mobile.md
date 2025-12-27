# Mobile Performance Optimization

## Table of Contents
1. [Performance Metrics](#performance-metrics)
2. [React Native Optimization](#react-native-optimization)
3. [Flutter Optimization](#flutter-optimization)
4. [iOS Native Optimization](#ios-native-optimization)
5. [Android Native Optimization](#android-native-optimization)
6. [Memory Management](#memory-management)
7. [Network Optimization](#network-optimization)
8. [Battery Optimization](#battery-optimization)

---

## Performance Metrics

### Key Mobile Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cold Start | < 2s | Time from tap to interactive |
| Warm Start | < 1s | Time from background to interactive |
| Frame Rate | 60 FPS | Smooth scrolling/animations |
| Memory Usage | < 150MB | Average memory footprint |
| Battery Impact | < 5% per hour | Active usage drain |
| Network Latency | < 100ms | API response time |
| App Size | < 50MB | Download size |

### Frame Rate Analysis

```
Target: 60 FPS = 16.67ms per frame
Target: 120 FPS = 8.33ms per frame

Frame Budget Breakdown:
├── Layout/Measure: < 2ms
├── Draw/Render: < 8ms
├── GPU Rasterize: < 4ms
└── Buffer: ~2ms
```

---

## React Native Optimization

### JavaScript Thread Optimization

```javascript
// Bad: Heavy computation on JS thread
function processData(data) {
  return data.map(item => heavyComputation(item));
}

// Good: Use InteractionManager
import { InteractionManager } from 'react-native';

InteractionManager.runAfterInteractions(() => {
  // Run after animations complete
  processData(data);
});

// Good: Use requestAnimationFrame for animations
function animate() {
  // Animation logic
  requestAnimationFrame(animate);
}
```

### FlatList Optimization

```javascript
import { FlatList } from 'react-native';

<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}

  // Performance props
  removeClippedSubviews={true}           // Unmount off-screen items
  maxToRenderPerBatch={10}               // Render 10 items per batch
  updateCellsBatchingPeriod={50}         // Batch updates every 50ms
  initialNumToRender={10}                // Initial render count
  windowSize={5}                         // Render 5 screens worth
  getItemLayout={(data, index) => ({     // Skip measurement
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>

// Memoize renderItem
const renderItem = useCallback(({ item }) => (
  <ItemComponent item={item} />
), []);

// Memoize item component
const ItemComponent = React.memo(({ item }) => (
  <View><Text>{item.name}</Text></View>
));
```

### Image Optimization

```javascript
import FastImage from 'react-native-fast-image';

// Use FastImage for better caching
<FastImage
  source={{
    uri: imageUrl,
    priority: FastImage.priority.high,
    cache: FastImage.cacheControl.immutable,
  }}
  resizeMode={FastImage.resizeMode.cover}
/>

// Preload images
FastImage.preload([
  { uri: 'https://example.com/image1.jpg' },
  { uri: 'https://example.com/image2.jpg' },
]);
```

### Hermes Engine (Default in RN 0.70+)

```javascript
// Hermes improves:
// - Startup time (up to 2x faster)
// - Memory usage (reduced by up to 30%)
// - App size (smaller bundle)

// Check if Hermes is enabled
const isHermes = () => !!global.HermesInternal;
console.log('Hermes enabled:', isHermes());
```

### New Architecture (Fabric + TurboModules)

```javascript
// Enable in react-native.config.js
module.exports = {
  project: {
    ios: { automaticPodsInstallation: true },
    android: {}
  },
};

// android/gradle.properties
newArchEnabled=true

// Benefits:
// - Synchronous native calls (no bridge)
// - Lazy loading of native modules
// - Better memory management
// - Improved startup time (~20% faster)
```

### Avoid Re-renders

```javascript
// Use React.memo for functional components
const ExpensiveComponent = React.memo(({ data }) => {
  // Complex render logic
});

// Use useMemo for expensive calculations
const processedData = useMemo(() =>
  data.filter(item => item.active).sort((a, b) => a.name.localeCompare(b.name)),
  [data]
);

// Use useCallback for callbacks passed to children
const handlePress = useCallback((id) => {
  // Handle press
}, []);
```

---

## Flutter Optimization

### Build Modes

```dart
// Debug: Hot reload, assertions, slow
// Profile: Performance profiling
// Release: Optimized, no debug info

// Run in profile mode
// flutter run --profile
```

### Widget Optimization

```dart
// Use const constructors
class MyWidget extends StatelessWidget {
  const MyWidget({super.key});  // const constructor

  @override
  Widget build(BuildContext context) {
    return const Text('Hello');  // const widget
  }
}

// Split widgets to minimize rebuilds
// Bad: Entire widget rebuilds
class BadWidget extends StatefulWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ExpensiveWidget(),  // Rebuilds unnecessarily
        Text(counter.toString()),
      ],
    );
  }
}

// Good: Only counter text rebuilds
class GoodWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const ExpensiveWidget(),  // Never rebuilds
        CounterText(),  // Only this rebuilds
      ],
    );
  }
}
```

### ListView Optimization

```dart
// Use ListView.builder for large lists
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(items[index]),
);

// Add cacheExtent for smoother scrolling
ListView.builder(
  cacheExtent: 500,  // Pre-render 500 pixels ahead
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(items[index]),
);

// Use itemExtent when height is fixed
ListView.builder(
  itemExtent: 60,  // Fixed height for optimization
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(items[index]),
);
```

### Image Optimization

```dart
// Cache network images
CachedNetworkImage(
  imageUrl: url,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
);

// Use appropriate image sizes
Image.network(
  url,
  cacheWidth: 200,   // Resize in memory
  cacheHeight: 200,
);

// Precache images
precacheImage(NetworkImage(url), context);
```

### Impeller Renderer (Flutter 3.20+)

```dart
// Impeller is now default, provides:
// - 30% better rendering performance
// - Reduced jank
// - 17% less battery drain
// - Consistent 120 FPS on supported devices

// To disable (not recommended):
// flutter run --no-enable-impeller
```

### Isolates for Heavy Computation

```dart
import 'dart:isolate';

// Run heavy work in separate isolate
Future<List<ProcessedItem>> processDataInIsolate(List<RawItem> data) async {
  return await Isolate.run(() {
    return data.map((item) => heavyProcess(item)).toList();
  });
}

// For repeated work, use long-running isolate
class DataProcessor {
  late Isolate _isolate;
  late SendPort _sendPort;

  Future<void> start() async {
    final receivePort = ReceivePort();
    _isolate = await Isolate.spawn(
      _isolateEntry,
      receivePort.sendPort,
    );
    _sendPort = await receivePort.first;
  }

  static void _isolateEntry(SendPort sendPort) {
    final receivePort = ReceivePort();
    sendPort.send(receivePort.sendPort);

    receivePort.listen((message) {
      // Process message
    });
  }
}
```

### DevTools Profiling

```bash
# Launch DevTools
flutter pub global activate devtools
flutter pub global run devtools

# Performance overlay in app
MaterialApp(
  showPerformanceOverlay: true,
  // ...
)
```

---

## iOS Native Optimization

### Instruments Profiling

```swift
// Key instruments:
// - Time Profiler: CPU usage
// - Allocations: Memory usage
// - Leaks: Memory leaks
// - Core Animation: Rendering performance
// - Energy Log: Battery usage

// Profile in Xcode: Product > Profile (⌘I)
```

### UITableView/UICollectionView

```swift
// Register cells for reuse
tableView.register(MyCell.self, forCellReuseIdentifier: "cell")

// Dequeue reusable cells
func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath) as! MyCell
    cell.configure(with: data[indexPath.row])
    return cell
}

// Prefetch data
extension ViewController: UITableViewDataSourcePrefetching {
    func tableView(_ tableView: UITableView, prefetchRowsAt indexPaths: [IndexPath]) {
        for indexPath in indexPaths {
            loadImage(for: indexPath)
        }
    }
}

// Estimate row heights
tableView.estimatedRowHeight = 100
tableView.rowHeight = UITableView.automaticDimension
```

### Image Loading

```swift
// Use SDWebImage or Kingfisher for caching
import Kingfisher

imageView.kf.setImage(
    with: URL(string: imageUrl),
    placeholder: UIImage(named: "placeholder"),
    options: [
        .transition(.fade(0.2)),
        .cacheOriginalImage
    ]
)

// Downscale images for display
extension UIImage {
    func scaled(to size: CGSize) -> UIImage {
        UIGraphicsImageRenderer(size: size).image { _ in
            draw(in: CGRect(origin: .zero, size: size))
        }
    }
}
```

### Async/Await (iOS 15+)

```swift
// Modern concurrency
func fetchData() async throws -> [Item] {
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode([Item].self, from: data)
}

// MainActor for UI updates
@MainActor
func updateUI(with items: [Item]) {
    self.items = items
    tableView.reloadData()
}
```

---

## Android Native Optimization

### RecyclerView Optimization

```kotlin
// Use DiffUtil for efficient updates
class ItemDiffCallback(
    private val oldList: List<Item>,
    private val newList: List<Item>
) : DiffUtil.Callback() {
    override fun getOldListSize() = oldList.size
    override fun getNewListSize() = newList.size
    override fun areItemsTheSame(oldPos: Int, newPos: Int) =
        oldList[oldPos].id == newList[newPos].id
    override fun areContentsTheSame(oldPos: Int, newPos: Int) =
        oldList[oldPos] == newList[newPos]
}

// Apply diff
val diffResult = DiffUtil.calculateDiff(ItemDiffCallback(oldList, newList))
diffResult.dispatchUpdatesTo(adapter)

// Or use ListAdapter with AsyncListDiffer
class ItemAdapter : ListAdapter<Item, ItemViewHolder>(ItemDiffCallback) {
    // Handles diffing automatically
}

// Set fixed size if possible
recyclerView.setHasFixedSize(true)

// Use item view caching
recyclerView.setItemViewCacheSize(20)
```

### Image Loading

```kotlin
// Use Coil (Kotlin-first) or Glide
implementation("io.coil-kt:coil:2.5.0")

// Load with Coil
imageView.load(url) {
    crossfade(true)
    placeholder(R.drawable.placeholder)
    error(R.drawable.error)
    size(200, 200)  // Resize
}

// Preload images
val imageLoader = ImageLoader(context)
val request = ImageRequest.Builder(context)
    .data(url)
    .build()
imageLoader.enqueue(request)
```

### Coroutines for Async Work

```kotlin
// Launch on appropriate dispatcher
lifecycleScope.launch {
    // IO for network/disk
    val data = withContext(Dispatchers.IO) {
        repository.fetchData()
    }

    // Default for CPU-intensive
    val processed = withContext(Dispatchers.Default) {
        processData(data)
    }

    // Main for UI
    updateUI(processed)
}
```

### Memory Optimization

```kotlin
// Use SparseArray instead of HashMap for int keys
val map = SparseArray<String>()

// Avoid autoboxing
// Bad
val numbers: List<Int> = listOf(1, 2, 3)  // Boxed integers

// Good
val numbers = intArrayOf(1, 2, 3)  // Primitive array

// Release resources in onDestroy
override fun onDestroy() {
    super.onDestroy()
    bitmap?.recycle()
    bitmap = null
}
```

---

## Memory Management

### Common Memory Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| Memory leak | Growing memory over time | Check references, use WeakReference |
| Bitmap memory | OutOfMemoryError | Resize images, use inSampleSize |
| Context leak | Activity not garbage collected | Use application context, clear references |
| Listener leak | Objects not released | Unregister listeners in onDestroy |

### Detecting Leaks

```kotlin
// Android: Use LeakCanary
debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.12'

// iOS: Use Instruments > Leaks
// React Native: Use Flipper with Hermes
```

---

## Network Optimization

### Efficient API Calls

```javascript
// Batch requests
const results = await Promise.all([
  api.getUser(userId),
  api.getOrders(userId),
  api.getPreferences(userId)
]);

// Use pagination
const { data, nextCursor } = await api.getItems({ cursor, limit: 20 });

// Cache responses
const cachedResponse = await AsyncStorage.getItem(`api:${endpoint}`);
if (cachedResponse && !isExpired(cachedResponse)) {
  return JSON.parse(cachedResponse);
}
```

### Offline Support

```javascript
// React Native: NetInfo + AsyncStorage
import NetInfo from '@react-native-community/netinfo';

NetInfo.addEventListener(state => {
  if (state.isConnected) {
    syncPendingChanges();
  }
});

// Queue operations when offline
async function saveData(data) {
  if (await isOnline()) {
    await api.save(data);
  } else {
    await queueForSync(data);
  }
}
```

---

## Battery Optimization

### Best Practices

| Practice | Impact | Implementation |
|----------|--------|----------------|
| Batch network requests | High | Combine API calls |
| Reduce GPS usage | High | Use significant location changes |
| Optimize refresh rates | Medium | Lower frequency when background |
| Use efficient formats | Medium | WebP images, gzip compression |
| Lazy load resources | Medium | Load on demand |
| Reduce wake locks | High | Release when not needed |

### Background Task Optimization

```kotlin
// Android: Use WorkManager for deferred work
val constraints = Constraints.Builder()
    .setRequiredNetworkType(NetworkType.CONNECTED)
    .setRequiresBatteryNotLow(true)
    .build()

val workRequest = PeriodicWorkRequestBuilder<SyncWorker>(
    repeatInterval = 1,
    repeatIntervalTimeUnit = TimeUnit.HOURS
).setConstraints(constraints).build()

WorkManager.getInstance(context).enqueue(workRequest)
```

```swift
// iOS: Use BGTaskScheduler
BGTaskScheduler.shared.register(
    forTaskWithIdentifier: "com.app.refresh",
    using: nil
) { task in
    self.handleAppRefresh(task: task as! BGAppRefreshTask)
}

func scheduleAppRefresh() {
    let request = BGAppRefreshTaskRequest(identifier: "com.app.refresh")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
    try? BGTaskScheduler.shared.submit(request)
}
```
