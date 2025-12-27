# Cryptography Best Practices

## Table of Contents
1. [Algorithm Selection](#algorithm-selection)
2. [Password Hashing](#password-hashing)
3. [Symmetric Encryption](#symmetric-encryption)
4. [Asymmetric Encryption](#asymmetric-encryption)
5. [Key Management](#key-management)
6. [TLS/SSL Configuration](#tlsssl-configuration)
7. [Random Number Generation](#random-number-generation)
8. [Common Mistakes](#common-mistakes)

---

## Algorithm Selection

### Recommended Algorithms (2025)

| Purpose | Recommended | Acceptable | Deprecated/Weak |
|---------|-------------|------------|-----------------|
| **Symmetric Encryption** | AES-256-GCM, ChaCha20-Poly1305 | AES-128-GCM | DES, 3DES, RC4, Blowfish |
| **Asymmetric Encryption** | RSA-4096, ECDH (P-384+) | RSA-2048 | RSA-1024, DSA |
| **Digital Signatures** | Ed25519, ECDSA (P-384+) | RSA-PSS (4096) | RSA-PKCS1v1.5, DSA |
| **Password Hashing** | Argon2id, bcrypt (12+) | scrypt, PBKDF2 (600k+) | MD5, SHA1, plain SHA256 |
| **General Hashing** | SHA-256, SHA-384, SHA-512, BLAKE3 | SHA-512/256 | MD5, SHA1 |
| **MAC** | HMAC-SHA256, Poly1305 | HMAC-SHA512 | HMAC-MD5, HMAC-SHA1 |
| **Key Derivation** | HKDF, Argon2 | scrypt | MD5-based, SHA1-based |

### Post-Quantum Considerations

```
2025 Status: Prepare for post-quantum migration

Recommended for high-security applications:
- CRYSTALS-Kyber (key encapsulation)
- CRYSTALS-Dilithium (signatures)
- FALCON (signatures)
- SPHINCS+ (signatures)

Hybrid approach recommended:
- Combine classical + post-quantum algorithms
- Example: X25519 + Kyber768 for key exchange
```

---

## Password Hashing

### Argon2id (Preferred)

```python
# Python - Using argon2-cffi
from argon2 import PasswordHasher

# Configure hasher
ph = PasswordHasher(
    time_cost=3,           # Iterations
    memory_cost=65536,     # 64 MB
    parallelism=4,         # Threads
    hash_len=32,           # Output length
    salt_len=16            # Salt length
)

# Hash password
hash = ph.hash(password)

# Verify password
try:
    ph.verify(hash, password)
    # Check if rehash needed (params changed)
    if ph.check_needs_rehash(hash):
        new_hash = ph.hash(password)
except VerifyMismatchError:
    # Invalid password
    pass
```

```javascript
// Node.js - Using argon2
const argon2 = require('argon2');

// Hash password
const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,     // 64 MB
    timeCost: 3,
    parallelism: 4,
    hashLength: 32
});

// Verify password
const isValid = await argon2.verify(hash, password);
```

### bcrypt (Well-Established)

```javascript
// Node.js
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12; // 2024+: Use 12-14

// Hash
const hash = await bcrypt.hash(password, SALT_ROUNDS);

// Verify
const isValid = await bcrypt.compare(password, hash);
```

```python
# Python
import bcrypt

SALT_ROUNDS = 12

# Hash
salt = bcrypt.gensalt(rounds=SALT_ROUNDS)
hash = bcrypt.hashpw(password.encode(), salt)

# Verify
is_valid = bcrypt.checkpw(password.encode(), hash)
```

### Password Hashing Parameters (2025)

| Algorithm | Memory | Iterations | Notes |
|-----------|--------|------------|-------|
| Argon2id | 64MB+ | 3+ | Preferred for new systems |
| bcrypt | N/A | 12-14 | cost parameter is log2 |
| scrypt | 64MB+ | N=2^17 | r=8, p=1 |
| PBKDF2 | N/A | 600,000+ | Only if others unavailable |

---

## Symmetric Encryption

### AES-GCM (Authenticated Encryption)

```python
# Python - cryptography library
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

def encrypt_aes_gcm(plaintext: bytes, key: bytes) -> tuple[bytes, bytes]:
    """Encrypt with AES-256-GCM"""
    # Generate random 96-bit nonce (NEVER reuse!)
    nonce = os.urandom(12)

    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(nonce, plaintext, associated_data=None)

    return nonce, ciphertext

def decrypt_aes_gcm(nonce: bytes, ciphertext: bytes, key: bytes) -> bytes:
    """Decrypt AES-256-GCM"""
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext, associated_data=None)

# Generate key
key = AESGCM.generate_key(bit_length=256)
```

```javascript
// Node.js
const crypto = require('crypto');

function encryptAesGcm(plaintext, key) {
    const iv = crypto.randomBytes(12); // 96-bit IV
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let ciphertext = cipher.update(plaintext, 'utf8');
    ciphertext = Buffer.concat([ciphertext, cipher.final()]);

    const authTag = cipher.getAuthTag();

    return {
        iv: iv.toString('base64'),
        ciphertext: ciphertext.toString('base64'),
        authTag: authTag.toString('base64')
    };
}

function decryptAesGcm(encrypted, key) {
    const iv = Buffer.from(encrypted.iv, 'base64');
    const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');
    const authTag = Buffer.from(encrypted.authTag, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let plaintext = decipher.update(ciphertext);
    plaintext = Buffer.concat([plaintext, decipher.final()]);

    return plaintext.toString('utf8');
}
```

### ChaCha20-Poly1305

```python
# Python
from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305
import os

key = ChaCha20Poly1305.generate_key()
chacha = ChaCha20Poly1305(key)

nonce = os.urandom(12)  # 96-bit nonce
ciphertext = chacha.encrypt(nonce, plaintext, associated_data)
plaintext = chacha.decrypt(nonce, ciphertext, associated_data)
```

### Common Mistakes

```python
# BAD: ECB mode (patterns visible)
cipher = AES.new(key, AES.MODE_ECB)  # NEVER use ECB!

# BAD: Reusing IV/nonce
static_iv = b'\x00' * 12  # NEVER reuse!
cipher.encrypt(static_iv, message1)
cipher.encrypt(static_iv, message2)  # Catastrophic!

# BAD: Using encryption without authentication
cipher = AES.new(key, AES.MODE_CBC, iv)  # No integrity check!

# BAD: Predictable IV
iv = str(user_id).encode().ljust(16)  # Predictable!

# GOOD: Random nonce, authenticated encryption
nonce = os.urandom(12)
aesgcm.encrypt(nonce, plaintext, None)  # GCM provides authentication
```

---

## Asymmetric Encryption

### RSA (For Legacy Compatibility)

```python
# Python - RSA-OAEP (recommended padding)
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

# Generate key pair (4096 bits recommended)
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=4096
)
public_key = private_key.public_key()

# Encrypt with OAEP padding
ciphertext = public_key.encrypt(
    plaintext,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)

# Decrypt
plaintext = private_key.decrypt(
    ciphertext,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)
```

### ECDH (Key Exchange)

```python
# Python - ECDH key exchange
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

# Generate key pairs
private_key = ec.generate_private_key(ec.SECP384R1())
peer_public_key = ec.generate_private_key(ec.SECP384R1()).public_key()

# Perform key exchange
shared_key = private_key.exchange(ec.ECDH(), peer_public_key)

# Derive encryption key from shared secret
derived_key = HKDF(
    algorithm=hashes.SHA256(),
    length=32,
    salt=None,
    info=b'encryption key'
).derive(shared_key)
```

### Digital Signatures

```python
# Ed25519 (recommended)
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

private_key = Ed25519PrivateKey.generate()
public_key = private_key.public_key()

# Sign
signature = private_key.sign(message)

# Verify
public_key.verify(signature, message)  # Raises exception if invalid
```

```python
# ECDSA (when Ed25519 not available)
from cryptography.hazmat.primitives.asymmetric import ec

private_key = ec.generate_private_key(ec.SECP384R1())

signature = private_key.sign(
    message,
    ec.ECDSA(hashes.SHA384())
)

public_key.verify(
    signature,
    message,
    ec.ECDSA(hashes.SHA384())
)
```

---

## Key Management

### Key Generation

```python
# GOOD: Cryptographically secure random
import os
import secrets

# For encryption keys
key = os.urandom(32)  # 256 bits

# For tokens
token = secrets.token_urlsafe(32)

# For API keys
api_key = secrets.token_hex(32)
```

### Key Derivation

```python
# HKDF for deriving multiple keys from one secret
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

def derive_keys(master_key: bytes, num_keys: int, key_length: int = 32) -> list[bytes]:
    """Derive multiple keys from a master key"""
    keys = []
    for i in range(num_keys):
        hkdf = HKDF(
            algorithm=hashes.SHA256(),
            length=key_length,
            salt=None,
            info=f'key-{i}'.encode()
        )
        keys.append(hkdf.derive(master_key))
    return keys

# Derive encryption key and MAC key from password
encryption_key, mac_key = derive_keys(master_key, 2)
```

### Key Storage

```python
# Encrypt keys at rest
from cryptography.fernet import Fernet

# Use HSM or KMS in production
# For development, use encrypted file

def store_key(key: bytes, encryption_key: bytes, filepath: str):
    """Store key encrypted"""
    f = Fernet(encryption_key)
    encrypted_key = f.encrypt(key)
    with open(filepath, 'wb') as file:
        file.write(encrypted_key)

def load_key(encryption_key: bytes, filepath: str) -> bytes:
    """Load and decrypt key"""
    with open(filepath, 'rb') as file:
        encrypted_key = file.read()
    f = Fernet(encryption_key)
    return f.decrypt(encrypted_key)
```

### Key Rotation

```python
# Key versioning for rotation
class KeyManager:
    def __init__(self):
        self.keys = {}
        self.current_version = None

    def add_key(self, version: str, key: bytes):
        self.keys[version] = key
        self.current_version = version

    def encrypt(self, plaintext: bytes) -> tuple[str, bytes, bytes]:
        """Returns (version, nonce, ciphertext)"""
        key = self.keys[self.current_version]
        nonce = os.urandom(12)
        aesgcm = AESGCM(key)
        ciphertext = aesgcm.encrypt(nonce, plaintext, None)
        return self.current_version, nonce, ciphertext

    def decrypt(self, version: str, nonce: bytes, ciphertext: bytes) -> bytes:
        """Decrypt with specified key version"""
        key = self.keys[version]
        aesgcm = AESGCM(key)
        return aesgcm.decrypt(nonce, ciphertext, None)
```

---

## TLS/SSL Configuration

### Server Configuration

```nginx
# Nginx - Strong TLS configuration
server {
    listen 443 ssl http2;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # TLS 1.2 and 1.3 only
    ssl_protocols TLSv1.2 TLSv1.3;

    # Strong cipher suites
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;

    ssl_prefer_server_ciphers on;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;

    # Session configuration
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}
```

### Client Configuration

```python
# Python - Secure TLS client
import ssl
import certifi

def create_ssl_context():
    """Create secure SSL context"""
    context = ssl.create_default_context(cafile=certifi.where())

    # Minimum TLS 1.2
    context.minimum_version = ssl.TLSVersion.TLSv1_2

    # Disable weak ciphers
    context.set_ciphers('ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20')

    # Enable certificate verification
    context.verify_mode = ssl.CERT_REQUIRED
    context.check_hostname = True

    return context

# Use with requests
import requests
session = requests.Session()
session.verify = certifi.where()
```

---

## Random Number Generation

### Secure Random Sources

```python
# Python
import os
import secrets

# For cryptographic keys
key = os.urandom(32)

# For tokens
token = secrets.token_urlsafe(32)
token_hex = secrets.token_hex(32)

# For integers
random_int = secrets.randbelow(100)  # 0 to 99

# For choices
selected = secrets.choice(['option1', 'option2', 'option3'])
```

```javascript
// Node.js
const crypto = require('crypto');

// Random bytes
const key = crypto.randomBytes(32);

// Random integer
const randomInt = crypto.randomInt(0, 100);

// Random UUID
const uuid = crypto.randomUUID();
```

### What NOT to Use

```python
# BAD: Not cryptographically secure
import random
key = bytes([random.randint(0, 255) for _ in range(32)])  # NEVER!

# BAD: Predictable seed
random.seed(time.time())  # NEVER for security!

# BAD: Math.random() in JavaScript
const token = Math.random().toString(36);  # NEVER for security!
```

---

## Common Mistakes

### Anti-Patterns

```python
# 1. Rolling your own crypto
def my_encrypt(data, key):
    return bytes([d ^ k for d, k in zip(data, key)])  # XOR is NOT encryption!

# 2. Using encryption for password storage
encrypted_password = aes.encrypt(password)  # Use hashing instead!

# 3. Hardcoded keys/secrets
SECRET_KEY = "my-secret-key-123"  # NEVER!

# 4. Using MD5/SHA1 for security
hash = hashlib.md5(data).hexdigest()  # Broken!

# 5. ECB mode
cipher = AES.new(key, AES.MODE_ECB)  # Patterns visible!

# 6. Reusing nonces
nonce = b'\x00' * 12  # Static nonce is catastrophic!

# 7. Comparing secrets with ==
if token == expected_token:  # Timing attack!
    # Use secrets.compare_digest() or hmac.compare_digest()

# 8. Truncating hash for uniqueness check
hash[:8] == stored_hash[:8]  # Increases collision probability!

# 9. Using timestamp as IV
iv = str(int(time.time())).encode()  # Predictable!

# 10. Not using authenticated encryption
ciphertext = aes_cbc.encrypt(plaintext)  # No integrity check!
```

### Correct Patterns

```python
import secrets
import hmac
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# 1. Use established libraries
# cryptography, nacl/libsodium, argon2-cffi

# 2. Use password hashing for passwords
from argon2 import PasswordHasher
ph = PasswordHasher()
hash = ph.hash(password)

# 3. Load secrets from environment/vault
import os
secret_key = os.environ.get('SECRET_KEY')

# 4. Use SHA-256 or stronger
hash = hashlib.sha256(data).digest()

# 5. Use GCM or another AEAD mode
aesgcm = AESGCM(key)
ciphertext = aesgcm.encrypt(nonce, plaintext, None)

# 6. Generate random nonces
nonce = os.urandom(12)

# 7. Constant-time comparison
if secrets.compare_digest(token, expected_token):
    pass

# 8. Use full hash
if hash == stored_hash:
    pass

# 9. Random IVs
iv = os.urandom(16)

# 10. Use authenticated encryption (GCM, ChaCha20-Poly1305)
```
