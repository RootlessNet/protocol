# RootlessNet Cryptographic Specification

*Detailed cryptographic implementation requirements.*

---

## 1. Algorithm Requirements

### 1.1 Mandatory Algorithms

| Algorithm | Purpose | Security Level | Library |
|-----------|---------|----------------|---------|
| Ed25519 | Digital Signatures | 128-bit | libsodium |
| X25519 | Key Agreement | 128-bit | libsodium |
| XChaCha20-Poly1305 | AEAD Encryption | 256-bit | libsodium |
| BLAKE3 | Hashing | 256-bit | blake3 |
| HKDF-SHA256 | Key Derivation | Variable | hkdf |
| Argon2id | Password Hashing | Variable | argon2 |

### 1.2 Prohibited Algorithms

The following algorithms MUST NOT be used:

- MD5, SHA-1 (collision attacks)
- DES, 3DES, RC4, Blowfish (weak/broken)
- RSA < 2048 bits
- ECDSA with non-deterministic nonces
- ECB mode
- CBC without authentication

---

## 2. Key Generation

### 2.1 Identity Keys

```typescript
interface KeyGeneration {
  // Generate Ed25519 signing keypair
  generateSigningKeys(): {
    publicKey: Uint8Array;  // 32 bytes
    privateKey: Uint8Array; // 64 bytes (seed + public)
  };
  
  // Generate X25519 encryption keypair
  generateEncryptionKeys(): {
    publicKey: Uint8Array;  // 32 bytes
    privateKey: Uint8Array; // 32 bytes
  };
  
  // Derive keys from seed
  deriveFromSeed(seed: Uint8Array): FullKeySet;
}
```

### 2.2 Entropy Requirements

```typescript
// MUST use OS-provided CSPRNG
function getSecureRandom(length: number): Uint8Array {
  if (typeof crypto !== 'undefined') {
    // Browser
    return crypto.getRandomValues(new Uint8Array(length));
  } else {
    // Node.js
    return require('crypto').randomBytes(length);
  }
}

// Entropy health check
function checkEntropyHealth(): boolean {
  // Implementation-specific
  // Should verify CSPRNG is properly seeded
  return true;
}
```

### 2.3 Key Derivation from Seed

```typescript
const KEY_DERIVATION_CONTEXT = {
  SIGNING: 'rootless-signing-key-v2',
  ENCRYPTION: 'rootless-encryption-key-v2',
  AUTHENTICATION: 'rootless-auth-key-v2',
  DELEGATION: 'rootless-delegation-key-v2',
};

function deriveKeySet(masterSeed: Uint8Array): FullKeySet {
  // Validate seed
  if (masterSeed.length !== 32) {
    throw new Error('Master seed must be 32 bytes');
  }
  
  // Derive signing key
  const signingPrivate = hkdf(
    masterSeed,
    KEY_DERIVATION_CONTEXT.SIGNING,
    32
  );
  const signingPublic = ed25519.getPublicKey(signingPrivate);
  
  // Derive encryption key
  const encryptionPrivate = hkdf(
    masterSeed,
    KEY_DERIVATION_CONTEXT.ENCRYPTION,
    32
  );
  const encryptionPublic = x25519.getPublicKey(encryptionPrivate);
  
  return {
    signing: { public: signingPublic, private: signingPrivate },
    encryption: { public: encryptionPublic, private: encryptionPrivate },
  };
}
```

---

## 3. Digital Signatures

### 3.1 Ed25519 Signing

```typescript
interface SigningOperations {
  // Sign message
  sign(privateKey: Uint8Array, message: Uint8Array): Uint8Array;
  
  // Verify signature
  verify(
    publicKey: Uint8Array,
    message: Uint8Array,
    signature: Uint8Array
  ): boolean;
}

// Implementation
function signContent(
  content: ContentObject,
  privateKey: Uint8Array
): Uint8Array {
  // 1. Serialize to canonical form
  const serialized = canonicalSerialize(content);
  
  // 2. Hash the serialized content
  const hash = blake3(serialized);
  
  // 3. Sign the hash
  return ed25519.sign(hash, privateKey);
}

function verifySignature(
  content: ContentObject,
  signature: Uint8Array,
  publicKey: Uint8Array
): boolean {
  // 1. Serialize to canonical form
  const serialized = canonicalSerialize(content);
  
  // 2. Hash the serialized content
  const hash = blake3(serialized);
  
  // 3. Verify
  return ed25519.verify(signature, hash, publicKey);
}
```

### 3.2 Canonical Serialization

```typescript
// JSON Canonicalization Scheme (JCS) - RFC 8785
function canonicalSerialize(obj: object): Uint8Array {
  // 1. Sort keys alphabetically
  // 2. Remove undefined values
  // 3. Use minimal number representation
  // 4. Use UTF-8 encoding
  // 5. No whitespace
  
  const sorted = sortObjectKeys(obj);
  const json = JSON.stringify(sorted);
  return new TextEncoder().encode(json);
}

function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((sorted, key) => {
        if (obj[key] !== undefined) {
          sorted[key] = sortObjectKeys(obj[key]);
        }
        return sorted;
      }, {} as any);
  }
  return obj;
}
```

---

## 4. Authenticated Encryption

### 4.1 XChaCha20-Poly1305

```typescript
interface AEADOperations {
  // Encrypt with authentication
  encrypt(
    key: Uint8Array,     // 32 bytes
    nonce: Uint8Array,   // 24 bytes
    plaintext: Uint8Array,
    associatedData?: Uint8Array
  ): Uint8Array;  // ciphertext + 16-byte tag
  
  // Decrypt and verify
  decrypt(
    key: Uint8Array,
    nonce: Uint8Array,
    ciphertext: Uint8Array,  // includes tag
    associatedData?: Uint8Array
  ): Uint8Array | null;  // null if auth fails
}
```

### 4.2 Nonce Generation

```typescript
// CRITICAL: Never reuse nonces!
class NonceGenerator {
  private counter: bigint = 0n;
  private random: Uint8Array;
  
  constructor() {
    // 16 bytes random + 8 bytes counter
    this.random = getSecureRandom(16);
  }
  
  next(): Uint8Array {
    const nonce = new Uint8Array(24);
    nonce.set(this.random, 0);
    
    // Write counter as little-endian
    const view = new DataView(nonce.buffer);
    view.setBigUint64(16, this.counter++, true);
    
    return nonce;
  }
}

// For XChaCha20, random nonces are safe due to large nonce size
function generateRandomNonce(): Uint8Array {
  return getSecureRandom(24);
}
```

### 4.3 Associated Data

```typescript
// Always bind context to encryption
interface EncryptionContext {
  version: number;
  sender: DID;
  recipient: DID;
  timestamp: number;
}

function encryptWithContext(
  key: Uint8Array,
  plaintext: Uint8Array,
  context: EncryptionContext
): EncryptedData {
  const nonce = generateRandomNonce();
  const ad = canonicalSerialize(context);
  
  const ciphertext = xchacha20poly1305.encrypt(
    key, nonce, plaintext, ad
  );
  
  return { nonce, ciphertext, context };
}
```

---

## 5. Key Exchange

### 5.1 X25519 ECDH

```typescript
// Basic key agreement
function computeSharedSecret(
  myPrivate: Uint8Array,
  theirPublic: Uint8Array
): Uint8Array {
  return x25519(myPrivate, theirPublic);
}

// Ephemeral-static exchange
function encryptToRecipient(
  plaintext: Uint8Array,
  recipientPublic: Uint8Array
): EncryptedEnvelope {
  // Generate ephemeral keypair
  const ephemeral = x25519.generateKeyPair();
  
  // Compute shared secret
  const shared = x25519(ephemeral.privateKey, recipientPublic);
  
  // Derive encryption key
  const encKey = hkdf(shared, 'encrypt', 32);
  
  // Encrypt
  const nonce = generateRandomNonce();
  const ciphertext = xchacha20poly1305.encrypt(encKey, nonce, plaintext);
  
  // Zeroize
  zeroize(ephemeral.privateKey);
  zeroize(shared);
  zeroize(encKey);
  
  return {
    ephemeralPublic: ephemeral.publicKey,
    nonce,
    ciphertext,
  };
}
```

### 5.2 X3DH (Extended Triple DH)

```typescript
// For establishing secure messaging sessions
interface X3DHKeys {
  identityKey: X25519KeyPair;     // Long-term
  signedPrekey: {
    keyPair: X25519KeyPair;
    signature: Uint8Array;
    timestamp: number;
  };
  oneTimePrekeys: X25519KeyPair[]; // Consumed on use
}

function performX3DH(
  sender: X3DHKeys,
  recipientBundle: PublicPreKeyBundle
): X3DHResult {
  // DH calculations
  const dh1 = x25519(sender.identityKey.privateKey, 
                     recipientBundle.signedPrekey);
  const dh2 = x25519(sender.ephemeral.privateKey, 
                     recipientBundle.identityKey);
  const dh3 = x25519(sender.ephemeral.privateKey, 
                     recipientBundle.signedPrekey);
  
  let dh4: Uint8Array | undefined;
  if (recipientBundle.oneTimePrekey) {
    dh4 = x25519(sender.ephemeral.privateKey, 
                 recipientBundle.oneTimePrekey);
  }
  
  // Combine secrets
  const combined = dh4 
    ? concat(dh1, dh2, dh3, dh4)
    : concat(dh1, dh2, dh3);
  
  // Derive root key for Double Ratchet
  const rootKey = hkdf(combined, 'x3dh-root', 32);
  
  // Zeroize intermediates
  zeroize(dh1);
  zeroize(dh2);
  zeroize(dh3);
  if (dh4) zeroize(dh4);
  zeroize(combined);
  
  return { rootKey };
}
```

---

## 6. Double Ratchet

### 6.1 State Management

```typescript
interface DoubleRatchetState {
  // Diffie-Hellman ratchet
  dhSending: X25519KeyPair;
  dhReceiving: Uint8Array | null;
  
  // Root chain
  rootKey: Uint8Array;
  
  // Symmetric ratchets
  sendingChainKey: Uint8Array | null;
  receivingChainKey: Uint8Array | null;
  
  // Counters
  sendingCounter: number;
  receivingCounter: number;
  previousCounter: number;
  
  // Out-of-order messages
  skippedMessageKeys: Map<string, Uint8Array>;
  maxSkip: number;
}
```

### 6.2 Ratchet Operations

```typescript
// Chain key derivation
function kdfChain(chainKey: Uint8Array): {
  messageKey: Uint8Array;
  nextChainKey: Uint8Array;
} {
  const messageKey = hmacSha256(chainKey, new Uint8Array([0x01]));
  const nextChainKey = hmacSha256(chainKey, new Uint8Array([0x02]));
  return { messageKey, nextChainKey };
}

// DH ratchet step
function dhRatchet(state: DoubleRatchetState, theirPublic: Uint8Array): void {
  // Derive receiving chain key
  const dhOutput = x25519(state.dhSending.privateKey, theirPublic);
  const { chainKey: recvKey, newRootKey: root1 } = kdfRootKey(
    state.rootKey, dhOutput
  );
  state.receivingChainKey = recvKey;
  
  // Generate new DH pair
  state.previousCounter = state.sendingCounter;
  state.sendingCounter = 0;
  state.receivingCounter = 0;
  state.dhReceiving = theirPublic;
  state.dhSending = x25519.generateKeyPair();
  
  // Derive sending chain key
  const dhOutput2 = x25519(state.dhSending.privateKey, theirPublic);
  const { chainKey: sendKey, newRootKey: root2 } = kdfRootKey(
    root1, dhOutput2
  );
  state.sendingChainKey = sendKey;
  state.rootKey = root2;
  
  // Zeroize
  zeroize(dhOutput);
  zeroize(dhOutput2);
}
```

---

## 7. Password-Based Encryption

### 7.1 Argon2id Parameters

```typescript
const ARGON2_PARAMS = {
  // Memory cost: 256 MB
  memoryCost: 262144,
  
  // Time cost: 3 iterations
  timeCost: 3,
  
  // Parallelism: 4 threads
  parallelism: 4,
  
  // Output length: 32 bytes
  hashLength: 32,
  
  // Salt length: 16 bytes
  saltLength: 16,
};

function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Uint8Array {
  return argon2id({
    password: new TextEncoder().encode(password),
    salt,
    ...ARGON2_PARAMS,
  });
}
```

### 7.2 Key File Format

```typescript
interface EncryptedKeyFile {
  // Version
  version: 2;
  
  // KDF parameters
  kdf: {
    algorithm: 'argon2id';
    salt: Uint8Array;      // 16 bytes
    memoryCost: number;
    timeCost: number;
    parallelism: number;
  };
  
  // Encryption
  encryption: {
    algorithm: 'xchacha20-poly1305';
    nonce: Uint8Array;     // 24 bytes
  };
  
  // Encrypted key material
  ciphertext: Uint8Array;
}

function encryptKeyFile(
  keyMaterial: Uint8Array,
  password: string
): EncryptedKeyFile {
  const salt = getSecureRandom(16);
  const key = deriveKeyFromPassword(password, salt);
  const nonce = getSecureRandom(24);
  const ciphertext = xchacha20poly1305.encrypt(key, nonce, keyMaterial);
  
  zeroize(key);
  
  return {
    version: 2,
    kdf: { algorithm: 'argon2id', salt, ...ARGON2_PARAMS },
    encryption: { algorithm: 'xchacha20-poly1305', nonce },
    ciphertext,
  };
}
```

---

## 8. Secure Memory Handling

### 8.1 Zeroization

```typescript
// Overwrite sensitive data
function zeroize(buffer: Uint8Array): void {
  // Fill with random data first (defense against cold boot)
  crypto.getRandomValues(buffer);
  // Then zero
  buffer.fill(0);
}

// Secure buffer wrapper
class SecureBuffer {
  private data: Uint8Array;
  private destroyed: boolean = false;
  
  constructor(length: number) {
    this.data = new Uint8Array(length);
  }
  
  getView(): Uint8Array {
    if (this.destroyed) {
      throw new Error('Buffer has been destroyed');
    }
    return this.data;
  }
  
  destroy(): void {
    if (!this.destroyed) {
      zeroize(this.data);
      this.destroyed = true;
    }
  }
}
```

### 8.2 Constant-Time Operations

```typescript
// Constant-time comparison
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  
  return result === 0;
}

// Constant-time select
function constantTimeSelect(
  condition: boolean,
  ifTrue: Uint8Array,
  ifFalse: Uint8Array
): Uint8Array {
  const mask = condition ? 0xFF : 0x00;
  const result = new Uint8Array(ifTrue.length);
  
  for (let i = 0; i < result.length; i++) {
    result[i] = (ifTrue[i] & mask) | (ifFalse[i] & ~mask);
  }
  
  return result;
}
```

---

## 9. Content Identifiers

### 9.1 CID Format

```typescript
// Multiformats CID v1
interface CID {
  version: 1;
  codec: number;       // 0x55 = raw, 0x71 = dag-cbor
  multihash: Uint8Array;
}

function computeCID(content: ContentObject): string {
  // 1. Serialize
  const serialized = canonicalSerialize(content);
  
  // 2. Hash with BLAKE3
  const hash = blake3(serialized);
  
  // 3. Create multihash (0x1e = BLAKE3)
  const multihash = new Uint8Array(2 + hash.length);
  multihash[0] = 0x1e; // BLAKE3
  multihash[1] = hash.length;
  multihash.set(hash, 2);
  
  // 4. Create CID
  const cid = new Uint8Array(2 + multihash.length);
  cid[0] = 0x01; // version
  cid[1] = 0x55; // raw codec
  cid.set(multihash, 2);
  
  // 5. Encode as base32
  return 'b' + base32.encode(cid).toLowerCase();
}
```

### 9.2 DID Format

```typescript
// did:rootless:key:<multibase-encoded-public-key>
function createDID(publicKey: Uint8Array): string {
  // 1. Create multicodec (0xed = Ed25519 public key)
  const multicodec = new Uint8Array(2 + publicKey.length);
  multicodec[0] = 0xed;
  multicodec[1] = 0x01;
  multicodec.set(publicKey, 2);
  
  // 2. Encode as base58btc
  const encoded = base58btc.encode(multicodec);
  
  return `did:rootless:key:${encoded}`;
}

function resolveKeyFromDID(did: string): Uint8Array {
  if (!did.startsWith('did:rootless:key:')) {
    throw new Error('Unsupported DID method');
  }
  
  const encoded = did.slice('did:rootless:key:'.length);
  const multicodec = base58btc.decode(encoded);
  
  // Verify codec
  if (multicodec[0] !== 0xed || multicodec[1] !== 0x01) {
    throw new Error('Invalid key codec');
  }
  
  return multicodec.slice(2);
}
```

---

## 10. Security Audit Checklist

### 10.1 Implementation Review

- [ ] All random numbers from OS CSPRNG
- [ ] No custom/weak RNG implementations
- [ ] Nonces never reused
- [ ] Keys zeroized after use
- [ ] Constant-time comparisons for secrets
- [ ] No secret-dependent branches
- [ ] Proper error handling (no info leaks)
- [ ] Input validation on all crypto parameters

### 10.2 Key Management

- [ ] Keys generated on user device only
- [ ] Private keys never transmitted
- [ ] Key storage uses platform keychain
- [ ] Backup encryption uses Argon2id
- [ ] Key rotation protocol implemented
- [ ] Key revocation supported

### 10.3 Protocol Security

- [ ] All messages authenticated
- [ ] Forward secrecy implemented
- [ ] Post-compromise security (ratcheting)
- [ ] Replay protection (nonces/counters)
- [ ] Timestamp validation

---

*Cryptographic Specification Version: 2.0.0*
*Last Updated: January 2026*
*Status: Draft Standard*
