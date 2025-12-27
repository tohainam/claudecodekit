# Mobile Security (iOS & Android)

## Table of Contents
1. [OWASP Mobile Top 10](#owasp-mobile-top-10)
2. [Secure Data Storage](#secure-data-storage)
3. [Authentication & Authorization](#authentication--authorization)
4. [Network Security](#network-security)
5. [Cryptography](#cryptography)
6. [Code Security](#code-security)
7. [Platform-Specific Security](#platform-specific-security)
8. [Reverse Engineering Protection](#reverse-engineering-protection)

---

## OWASP Mobile Top 10

| Rank | Vulnerability | Description |
|------|--------------|-------------|
| M1 | Improper Credential Usage | Hardcoded credentials, insecure storage |
| M2 | Inadequate Supply Chain Security | Vulnerable third-party components |
| M3 | Insecure Authentication/Authorization | Weak auth mechanisms |
| M4 | Insufficient Input/Output Validation | Injection vulnerabilities |
| M5 | Insecure Communication | Unencrypted network traffic |
| M6 | Inadequate Privacy Controls | PII exposure |
| M7 | Insufficient Binary Protections | Reverse engineering risks |
| M8 | Security Misconfiguration | Debug mode, weak settings |
| M9 | Insecure Data Storage | Plaintext sensitive data |
| M10 | Insufficient Cryptography | Weak crypto implementation |

---

## Secure Data Storage

### iOS - Keychain

```swift
// GOOD: Store sensitive data in Keychain
import Security

func saveToKeychain(key: String, data: Data) -> OSStatus {
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: key,
        kSecValueData as String: data,
        kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
    ]

    SecItemDelete(query as CFDictionary)
    return SecItemAdd(query as CFDictionary, nil)
}

func loadFromKeychain(key: String) -> Data? {
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: key,
        kSecReturnData as String: true,
        kSecMatchLimit as String: kSecMatchLimitOne
    ]

    var result: AnyObject?
    let status = SecItemCopyMatching(query as CFDictionary, &result)

    guard status == errSecSuccess else { return nil }
    return result as? Data
}

// GOOD: Use Keychain with biometric protection
func saveWithBiometric(key: String, data: Data) -> OSStatus {
    let access = SecAccessControlCreateWithFlags(
        nil,
        kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
        .biometryCurrentSet,
        nil
    )!

    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: key,
        kSecValueData as String: data,
        kSecAttrAccessControl as String: access
    ]

    return SecItemAdd(query as CFDictionary, nil)
}
```

### Android - EncryptedSharedPreferences & Keystore

```kotlin
// GOOD: Use EncryptedSharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

fun getEncryptedPrefs(context: Context): SharedPreferences {
    val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    return EncryptedSharedPreferences.create(
        context,
        "secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
}

// GOOD: Use Android Keystore for keys
fun generateSecureKey(alias: String): SecretKey {
    val keyGenerator = KeyGenerator.getInstance(
        KeyProperties.KEY_ALGORITHM_AES,
        "AndroidKeyStore"
    )

    val spec = KeyGenParameterSpec.Builder(
        alias,
        KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
    )
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setKeySize(256)
        .setUserAuthenticationRequired(true)
        .setUserAuthenticationParameters(
            30, // Timeout in seconds
            KeyProperties.AUTH_BIOMETRIC_STRONG
        )
        .setIsStrongBoxBacked(true) // Hardware-backed if available
        .build()

    keyGenerator.init(spec)
    return keyGenerator.generateKey()
}
```

### What NOT to Store

```kotlin
// BAD: Storing sensitive data in plain SharedPreferences
val prefs = getSharedPreferences("app", MODE_PRIVATE)
prefs.edit().putString("password", password).apply() // NEVER!
prefs.edit().putString("api_key", apiKey).apply() // NEVER!

// BAD: Storing in external storage
File(getExternalFilesDir(null), "secrets.txt").writeText(secrets)

// BAD: Logging sensitive data
Log.d("Auth", "Token: $authToken") // NEVER in production!

// BAD: Hardcoded secrets
const val API_KEY = "sk-1234567890" // NEVER!
```

---

## Authentication & Authorization

### Biometric Authentication

```swift
// iOS - Face ID / Touch ID
import LocalAuthentication

func authenticateWithBiometrics(completion: @escaping (Bool, Error?) -> Void) {
    let context = LAContext()
    var error: NSError?

    guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
        completion(false, error)
        return
    }

    context.evaluatePolicy(
        .deviceOwnerAuthenticationWithBiometrics,
        localizedReason: "Authenticate to access your account"
    ) { success, error in
        DispatchQueue.main.async {
            completion(success, error)
        }
    }
}
```

```kotlin
// Android - BiometricPrompt
import androidx.biometric.BiometricPrompt

fun showBiometricPrompt(activity: FragmentActivity, onSuccess: () -> Unit) {
    val executor = ContextCompat.getMainExecutor(activity)

    val callback = object : BiometricPrompt.AuthenticationCallback() {
        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
            onSuccess()
        }

        override fun onAuthenticationFailed() {
            // Handle failure
        }
    }

    val promptInfo = BiometricPrompt.PromptInfo.Builder()
        .setTitle("Authentication Required")
        .setSubtitle("Use your fingerprint or face to authenticate")
        .setNegativeButtonText("Cancel")
        .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
        .build()

    BiometricPrompt(activity, executor, callback).authenticate(promptInfo)
}
```

### Session Management

```kotlin
// GOOD: Token handling
class TokenManager(private val secureStorage: SecureStorage) {
    private var accessToken: String? = null
    private var tokenExpiry: Long = 0

    fun getAccessToken(): String? {
        if (System.currentTimeMillis() > tokenExpiry) {
            refreshToken()
        }
        return accessToken
    }

    private fun refreshToken() {
        val refreshToken = secureStorage.get("refresh_token") ?: return

        // Call refresh endpoint
        val response = authApi.refresh(refreshToken)
        accessToken = response.accessToken
        tokenExpiry = System.currentTimeMillis() + (response.expiresIn * 1000)

        // Store new refresh token (rotation)
        secureStorage.save("refresh_token", response.refreshToken)
    }

    fun logout() {
        accessToken = null
        tokenExpiry = 0
        secureStorage.delete("refresh_token")
        // Also call server logout endpoint to invalidate tokens
    }
}
```

---

## Network Security

### Certificate Pinning

```swift
// iOS - Certificate Pinning with URLSession
class PinnedURLSessionDelegate: NSObject, URLSessionDelegate {
    private let pinnedCertificates: [SecCertificate]

    init(certificateNames: [String]) {
        self.pinnedCertificates = certificateNames.compactMap { name in
            guard let path = Bundle.main.path(forResource: name, ofType: "cer"),
                  let data = NSData(contentsOfFile: path) else { return nil }
            return SecCertificateCreateWithData(nil, data)
        }
    }

    func urlSession(_ session: URLSession,
                   didReceive challenge: URLAuthenticationChallenge,
                   completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {

        guard challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
              let serverTrust = challenge.protectionSpace.serverTrust else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }

        // Verify certificate chain
        var result: SecTrustResultType = .invalid
        SecTrustEvaluate(serverTrust, &result)

        // Check if server certificate matches pinned certificate
        guard let serverCert = SecTrustGetCertificateAtIndex(serverTrust, 0) else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }

        let serverCertData = SecCertificateCopyData(serverCert) as Data
        let isPinned = pinnedCertificates.contains { cert in
            SecCertificateCopyData(cert) as Data == serverCertData
        }

        if isPinned {
            completionHandler(.useCredential, URLCredential(trust: serverTrust))
        } else {
            completionHandler(.cancelAuthenticationChallenge, nil)
        }
    }
}
```

```kotlin
// Android - Certificate Pinning with OkHttp
val certificatePinner = CertificatePinner.Builder()
    .add("api.example.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
    .add("api.example.com", "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=")
    .build()

val client = OkHttpClient.Builder()
    .certificatePinner(certificatePinner)
    .build()

// With Network Security Config (Android 7+)
// res/xml/network_security_config.xml
```

```xml
<!-- Android Network Security Config -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>

    <domain-config>
        <domain includeSubdomains="true">api.example.com</domain>
        <pin-set expiration="2025-12-31">
            <pin digest="SHA-256">base64EncodedPin1=</pin>
            <pin digest="SHA-256">base64EncodedPin2=</pin>
        </pin-set>
    </domain-config>
</network-security-config>
```

### Prevent Cleartext Traffic

```xml
<!-- Android Manifest -->
<application
    android:usesCleartextTraffic="false"
    android:networkSecurityConfig="@xml/network_security_config">
```

```swift
// iOS - ATS (App Transport Security)
// Info.plist - Don't disable ATS!
// BAD:
// <key>NSAppTransportSecurity</key>
// <dict>
//     <key>NSAllowsArbitraryLoads</key>
//     <true/>
// </dict>
```

---

## Cryptography

### Secure Random

```kotlin
// GOOD: Use SecureRandom
import java.security.SecureRandom

val secureRandom = SecureRandom()
val token = ByteArray(32)
secureRandom.nextBytes(token)

// BAD: Don't use Random for security
import java.util.Random
val insecureRandom = Random() // NEVER for security purposes!
```

### Encryption

```kotlin
// GOOD: AES-GCM encryption with Keystore
fun encrypt(plaintext: ByteArray, alias: String): Pair<ByteArray, ByteArray> {
    val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    val key = keyStore.getKey(alias, null) as SecretKey

    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.ENCRYPT_MODE, key)

    val iv = cipher.iv
    val ciphertext = cipher.doFinal(plaintext)

    return Pair(iv, ciphertext)
}

fun decrypt(iv: ByteArray, ciphertext: ByteArray, alias: String): ByteArray {
    val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    val key = keyStore.getKey(alias, null) as SecretKey

    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    val spec = GCMParameterSpec(128, iv)
    cipher.init(Cipher.DECRYPT_MODE, key, spec)

    return cipher.doFinal(ciphertext)
}
```

---

## Code Security

### Input Validation

```kotlin
// GOOD: Validate all inputs
fun processUserInput(input: String): Result<ProcessedData> {
    // Length check
    if (input.length > MAX_INPUT_LENGTH) {
        return Result.failure(ValidationError("Input too long"))
    }

    // Pattern validation
    if (!input.matches(ALLOWED_PATTERN.toRegex())) {
        return Result.failure(ValidationError("Invalid characters"))
    }

    // Sanitize for display
    val sanitized = input.replace("<", "&lt;").replace(">", "&gt;")

    return Result.success(ProcessedData(sanitized))
}
```

### WebView Security

```kotlin
// GOOD: Secure WebView configuration
fun configureSecureWebView(webView: WebView) {
    webView.settings.apply {
        javaScriptEnabled = false // Enable only if absolutely necessary
        allowFileAccess = false
        allowContentAccess = false
        allowFileAccessFromFileURLs = false
        allowUniversalAccessFromFileURLs = false
        domStorageEnabled = false
        databaseEnabled = false
        setGeolocationEnabled(false)
    }

    // If JavaScript is required:
    webView.settings.javaScriptEnabled = true
    webView.addJavascriptInterface(SafeJsInterface(), "Android")

    // Validate URLs
    webView.webViewClient = object : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            val url = request.url.toString()
            if (!isAllowedUrl(url)) {
                return true // Block
            }
            return false
        }
    }
}

// BAD: Unsafe JavaScript interface
@JavascriptInterface
fun executeCommand(cmd: String) {
    Runtime.getRuntime().exec(cmd) // NEVER!
}
```

```swift
// iOS - Secure WKWebView
import WebKit

func configureSecureWebView() -> WKWebView {
    let config = WKWebViewConfiguration()

    // Disable JavaScript if not needed
    config.preferences.javaScriptEnabled = false

    // Disable auto-play
    config.mediaTypesRequiringUserActionForPlayback = .all

    let webView = WKWebView(frame: .zero, configuration: config)

    // Content blocking
    webView.configuration.preferences.isFraudulentWebsiteWarningEnabled = true

    return webView
}
```

---

## Platform-Specific Security

### iOS Specific

```swift
// Jailbreak Detection
func isJailbroken() -> Bool {
    #if targetEnvironment(simulator)
    return false
    #else
    // Check for common jailbreak files
    let paths = [
        "/Applications/Cydia.app",
        "/Library/MobileSubstrate/MobileSubstrate.dylib",
        "/bin/bash",
        "/usr/sbin/sshd",
        "/etc/apt",
        "/private/var/lib/apt/"
    ]

    for path in paths {
        if FileManager.default.fileExists(atPath: path) {
            return true
        }
    }

    // Check if can write outside sandbox
    let testPath = "/private/jailbreak_test.txt"
    do {
        try "test".write(toFile: testPath, atomically: true, encoding: .utf8)
        try FileManager.default.removeItem(atPath: testPath)
        return true
    } catch {
        return false
    }
    #endif
}
```

### Android Specific

```kotlin
// Root Detection
fun isRooted(): Boolean {
    // Check for su binary
    val paths = arrayOf(
        "/system/app/Superuser.apk",
        "/sbin/su",
        "/system/bin/su",
        "/system/xbin/su",
        "/data/local/xbin/su",
        "/data/local/bin/su",
        "/system/sd/xbin/su",
        "/system/bin/failsafe/su",
        "/data/local/su"
    )

    for (path in paths) {
        if (File(path).exists()) return true
    }

    // Check for dangerous props
    try {
        val process = Runtime.getRuntime().exec(arrayOf("/system/xbin/which", "su"))
        val reader = BufferedReader(InputStreamReader(process.inputStream))
        if (reader.readLine() != null) return true
    } catch (e: Exception) {
        // Ignore
    }

    return false
}

// Use SafetyNet / Play Integrity API
fun checkDeviceIntegrity(context: Context) {
    val client = PlayIntegrity.getClient(context)
    val request = IntegrityTokenRequest.builder()
        .setNonce(generateNonce())
        .build()

    client.requestIntegrityToken(request)
        .addOnSuccessListener { response ->
            // Send token to server for verification
            verifyIntegrityOnServer(response.token())
        }
}
```

---

## Reverse Engineering Protection

### Code Obfuscation

```groovy
// Android - ProGuard / R8 configuration
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

```proguard
# proguard-rules.pro
-keepattributes SourceFile,LineNumberTable

# Obfuscate everything except public APIs
-keep public class com.example.api.** { public *; }

# Remove logging
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
```

### Anti-Tampering

```kotlin
// Verify app signature
fun verifyAppSignature(context: Context): Boolean {
    val expectedSignature = "SHA256_OF_YOUR_SIGNING_KEY"

    val packageInfo = context.packageManager.getPackageInfo(
        context.packageName,
        PackageManager.GET_SIGNING_CERTIFICATES
    )

    val signatures = packageInfo.signingInfo.apkContentsSigners
    for (signature in signatures) {
        val md = MessageDigest.getInstance("SHA-256")
        val hash = md.digest(signature.toByteArray())
        val hashString = Base64.encodeToString(hash, Base64.NO_WRAP)

        if (hashString == expectedSignature) {
            return true
        }
    }

    return false
}
```

### Debug Detection

```kotlin
// Detect if debugger is attached
fun isDebuggerAttached(): Boolean {
    return Debug.isDebuggerConnected() ||
           Debug.waitingForDebugger() ||
           (context.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0
}

// React to debugging
if (isDebuggerAttached()) {
    // Clear sensitive data
    secureStorage.clearAll()
    // Terminate app
    android.os.Process.killProcess(android.os.Process.myPid())
}
```
