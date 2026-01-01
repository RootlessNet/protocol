# RootlessNet Security Model

*Comprehensive security documentation for the RootlessNet protocol.*

---

## 1. Security Philosophy

RootlessNet is designed with **adversarial assumptions** at its core. We assume:

- All network traffic is monitored
- All nodes may be compromised
- All users may be malicious
- All storage may be accessed by adversaries

The protocol must remain secure despite these assumptions.

---

## 2. Threat Model

### 2.1 Adversary Categories

#### Passive Adversaries
- **Network observers**: ISPs, governments, hackers monitoring traffic
- **Data analysts**: Entities correlating metadata patterns
- **Storage inspectors**: Access to encrypted at-rest data

#### Active Adversaries
- **Message injectors**: Attempting to insert fake content
- **Man-in-the-middle**: Intercepting and modifying communications
- **Sybil attackers**: Creating fake identities to manipulate network

#### Insider Threats
- **Compromised clients**: Malicious application code
- **Social engineering**: Targeting users for key theft
- **Coerced nodes**: Legal or physical compulsion

### 2.2 Attack Vectors

| Vector | Description | Mitigation |
|--------|-------------|------------|
| Key Compromise | Private key theft | Hardware wallets, secure enclaves |
| Traffic Analysis | Timing/size correlation | Padding, noise, Tor |
| Sybil Attack | Fake identity flood | PoW, reputation gating |
| Eclipse Attack | Isolating nodes | Diverse peer selection |
| Replay Attack | Resending old messages | Nonces, timestamps |
| Downgrade Attack | Forcing weak crypto | Strict version requirements |
| Supply Chain | Compromised dependencies | Reproducible builds |

---

## 3. Cryptographic Foundation

### 3.1 Algorithm Selection Criteria

All algorithms are selected based on:
- Peer-reviewed security proofs
- Resistance to known attacks
- Performance characteristics
- Implementation availability
- Post-quantum readiness roadmap

### 3.2 Current Algorithms

#### Hashing
```
Primary: BLAKE3 (512-bit output)
Alternative: SHA-256 (compatibility)
Future: SHA-3/Keccak (diversity)
```

#### Digital Signatures
```
Primary: Ed25519 (128-bit security)
Alternative: secp256k1 (Bitcoin compatibility)
Future: CRYSTALS-Dilithium (post-quantum)
```

#### Symmetric Encryption
```
Primary: XChaCha20-Poly1305 (256-bit key, 192-bit nonce)
AEAD: Always authenticated encryption
No: ECB, CBC without HMAC, RC4, DES
```

#### Key Exchange
```
Primary: X25519 (Curve25519 ECDH)
Groups: MLS with X25519
Future: CRYSTALS-Kyber (post-quantum hybrid)
```

#### Key Derivation
```
Password: Argon2id (memory-hard)
Key expansion: HKDF-SHA256
Parameters: At least 256MB memory, 3 iterations
```

### 3.3 Random Number Generation

- System CSPRNG only (getrandom/urandom)
- No userspace PRNGs for cryptographic use
- Entropy pool monitoring
- Failure on insufficient entropy

---

## 4. Identity Security

### 4.1 Key Generation

```typescript
// Secure key generation requirements
interface KeyGeneration {
  // Minimum entropy: 256 bits
  entropy: Uint8Array;  // Must be cryptographically random
  
  // Key type determines algorithm
  algorithm: 'ed25519' | 'secp256k1' | 'x25519';
  
  // Derivation path for hierarchical keys
  derivationPath?: string;
}
```

**Generation Best Practices:**
- Generate on user's device only
- Never transmit private keys
- Use hardware security when available
- Immediate secure storage after generation

### 4.2 Key Storage

#### Hierarchy of Security

| Level | Method | Use Case |
|-------|--------|----------|
| L1 | Hardware wallet/HSM | Master keys |
| L2 | Secure Enclave/TPM | Identity keys |
| L3 | Encrypted keychain | Daily use keys |
| L4 | Password-protected file | Backup |

#### Encryption at Rest

```typescript
interface EncryptedKey {
  // Argon2id parameters
  argon2: {
    memory: 256 * 1024;  // 256MB
    iterations: 3;
    parallelism: 4;
    saltLen: 32;
  };
  
  // Encryption
  algorithm: 'XChaCha20-Poly1305';
  nonce: Uint8Array;  // 24 bytes
  ciphertext: Uint8Array;
  tag: Uint8Array;    // 16 bytes
}
```

### 4.3 Key Rotation

**Rotation Protocol:**

1. Generate new key pair
2. Sign rotation announcement with OLD key
3. Include new public key in announcement
4. Publish to DHT with expiration
5. Update all active sessions
6. Implement grace period (7 days)
7. Revoke old key after grace period

**Forced Rotation Triggers:**
- Key age > 1 year
- Suspected compromise
- Device loss
- Security upgrade

### 4.4 Key Recovery

#### Social Recovery (Shamir's Secret Sharing)

```
Master Key → Split into N shares
Recovery requires M of N shares (M < N)

Recommended: 3-of-5 split
- 5 trusted contacts
- Any 3 can recover
- No single point of failure
```

#### Recovery Contacts

| Requirement | Purpose |
|-------------|---------|
| Identity verification | Prevent impersonation |
| Secure communication | Key exchange |
| Geographic distribution | Jurisdiction diversity |
| Relationship diversity | Different social circles |

---

## 5. Content Security

### 5.1 Signing Content

All content MUST be signed by the author:

```typescript
interface ContentSignature {
  // Algorithm identifier
  algorithm: 'ed25519';
  
  // Public key of signer
  publicKey: Uint8Array;
  
  // Signature bytes (64 for Ed25519)
  signature: Uint8Array;
  
  // Timestamp (prevents old content replay)
  signedAt: number;
}
```

**Signing Process:**
1. Serialize content to canonical form
2. Hash serialized content (BLAKE3)
3. Sign hash with private key
4. Include signature in content object

### 5.2 Content Verification

```typescript
function verifyContent(content: ContentObject): VerificationResult {
  const checks = [
    // 1. Signature validity
    verifySignature(content),
    
    // 2. Hash integrity
    verifyHash(content),
    
    // 3. Timestamp reasonability
    verifyTimestamp(content, tolerance: 5 * 60 * 1000),
    
    // 4. Author key validity
    verifyAuthorKey(content.author),
    
    // 5. Zone membership (if applicable)
    verifyZoneMembership(content.zone, content.author),
  ];
  
  return {
    valid: checks.every(c => c.passed),
    checks,
  };
}
```

### 5.3 Content Encryption

#### Encryption Levels

```
Public → No encryption (signed only)
Zone → Symmetric key shared with zone members
Circle → Multi-recipient asymmetric (NaCl Box)
Private → Two-party asymmetric
Self → Personal key only
```

#### Multi-Recipient Encryption

```typescript
interface MultiRecipientPayload {
  // Encrypted content key
  encryptedKeys: {
    recipient: DID;
    encryptedKey: Uint8Array;  // Key encrypted to recipient
  }[];
  
  // Content encrypted with symmetric key
  encryptedContent: {
    nonce: Uint8Array;
    ciphertext: Uint8Array;
    tag: Uint8Array;
  };
}
```

---

## 6. Messaging Security

### 6.1 Direct Messages (1:1)

**Protocol: Signal-style Double Ratchet**

Components:
- X3DH for initial key exchange
- Double Ratchet for message keys
- Header encryption for metadata protection

```
Alice                         Bob
  │                            │
  │─── Prekey Bundle Request ─►│
  │                            │
  │◄── Prekey Bundle ──────────│
  │                            │
  │─── X3DH + First Message ──►│
  │                            │
  │◄── Ratchet Response ───────│
  │                            │
  [Ongoing Double Ratchet]
```

### 6.2 Group Messages

**Protocol: Message Layer Security (MLS)**

Features:
- Forward secrecy for all members
- Post-compromise security
- Efficient group key rotation
- Authenticated group changes

```typescript
interface MLSGroup {
  groupId: Uint8Array;
  epoch: number;  // Increments on membership changes
  
  members: {
    member: DID;
    leafNode: LeafNode;
  }[];
  
  // Ratchet tree for efficient key updates
  tree: RatchetTree;
  
  // Current group secrets
  secrets: {
    initSecret: Uint8Array;
    senderDataSecret: Uint8Array;
    encryptionSecret: Uint8Array;
    exporterSecret: Uint8Array;
    confirmationKey: Uint8Array;
    membershipKey: Uint8Array;
  };
}
```

### 6.3 Anonymous Sending (Sealed Sender)

For messages where sender identity should be protected:

```typescript
// Sealed sender uses authenticated encryption
// where only the recipient can decrypt

function sealMessage(
  message: Uint8Array,
  recipientPublicKey: Uint8Array
): SealedMessage {
  // Generate ephemeral key pair
  const ephemeral = generateKeypair();
  
  // Compute shared secret
  const shared = x25519(ephemeral.privateKey, recipientPublicKey);
  
  // Derive encryption key
  const key = hkdf(shared, 'sealed-sender');
  
  // Encrypt message
  return {
    ephemeralPublic: ephemeral.publicKey,
    ciphertext: encrypt(key, message),
  };
}
```

---

## 7. Network Security

### 7.1 Transport Encryption

All network connections use encrypted transports:

| Transport | Encryption | Authentication |
|-----------|-----------|----------------|
| libp2p | Noise Protocol | Peer keys |
| WebSocket | TLS 1.3 | Certificate |
| WebRTC | DTLS 1.3 | Self-signed |
| Tor | Onion layers | Consensus |

### 7.2 Peer Authentication

```typescript
interface PeerAuthentication {
  // Challenge-response protocol
  async authenticate(peer: Peer): Promise<boolean> {
    // 1. Exchange ephemeral keys
    const ephemeral = await exchangeEphemeral(peer);
    
    // 2. Derive session key
    const sessionKey = deriveSessionKey(ephemeral);
    
    // 3. Sign challenge with identity key
    const challenge = randomBytes(32);
    await sendEncrypted(sessionKey, challenge);
    
    // 4. Verify response
    const response = await receiveEncrypted(sessionKey);
    return verifySignature(peer.publicKey, challenge, response);
  }
}
```

### 7.3 DoS Protection

#### Rate Limiting

```typescript
interface RateLimits {
  // Content creation
  postsPerMinute: 10;
  postsPerHour: 100;
  postsPerDay: 500;
  
  // Messaging
  messagesPerMinute: 60;
  conversationsPerDay: 100;
  
  // Network
  connectionsPerMinute: 30;
  queriesPerSecond: 100;
  
  // Reputation-based multipliers
  reputationMultiplier: (reputation: number) => number;
}
```

#### Proof of Work

For expensive operations, require computational proof:

```typescript
interface ProofOfWork {
  challenge: Uint8Array;
  difficulty: number;  // Leading zeros required
  solution: Uint8Array;
  
  verify(): boolean {
    const hash = blake3(concat(this.challenge, this.solution));
    return countLeadingZeros(hash) >= this.difficulty;
  }
}
```

### 7.4 Sybil Resistance

Multiple layers of Sybil protection:

| Layer | Mechanism | Strength |
|-------|-----------|----------|
| 1 | Proof of Work | Computational cost |
| 2 | Reputation | Social cost |
| 3 | Vouching | Trust network |
| 4 | Token stake | Economic cost |
| 5 | Time lock | Temporal cost |

---

## 8. Privacy Protections

### 8.1 Metadata Protection

Metadata often reveals more than content:

| Metadata | Risk | Protection |
|----------|------|------------|
| IP Address | Location, identity | Tor, VPN, relays |
| Timing | Activity patterns | Random delays |
| Message size | Content hints | Padding |
| Contact list | Social graph | Encrypted storage |
| Access patterns | Interest inference | Private queries |

### 8.2 Traffic Analysis Resistance

```typescript
interface TrafficPadding {
  // Constant rate sending
  sendInterval: 1000;  // ms
  
  // Fixed message size
  maxMessageSize: 16384;  // bytes
  
  // Pad all messages to max
  padMessage(message: Uint8Array): Uint8Array {
    const padded = new Uint8Array(this.maxMessageSize);
    padded.set(message);
    // Random padding for remainder
    crypto.getRandomValues(padded.subarray(message.length));
    return padded;
  }
  
  // Cover traffic when idle
  generateCoverTraffic(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.maxMessageSize));
  }
}
```

### 8.3 Zero-Knowledge Proofs

Prove attributes without revealing data:

```typescript
interface ZKProofSystem {
  // Prove membership in a set without revealing which member
  proveMembership(
    set: DID[],
    myIndex: number,
    myKey: PrivateKey
  ): MembershipProof;
  
  // Prove age above threshold without revealing exact age
  proveAgeAbove(
    birthdate: Date,
    threshold: number
  ): RangeProof;
  
  // Prove reputation above threshold
  proveReputationAbove(
    reputation: number,
    threshold: number
  ): RangeProof;
}
```

---

## 9. Secure Coding Requirements

### 9.1 Input Validation

All input MUST be validated:

```typescript
// Content validation
function validateContent(input: unknown): ContentObject {
  // Type checking
  if (typeof input !== 'object' || input === null) {
    throw new ValidationError('Invalid content type');
  }
  
  // Required fields
  const required = ['author', 'timestamp', 'payload', 'signature'];
  for (const field of required) {
    if (!(field in input)) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }
  
  // Size limits
  if (input.payload.length > MAX_PAYLOAD_SIZE) {
    throw new ValidationError('Payload too large');
  }
  
  // Cryptographic validation
  if (!verifySignature(input)) {
    throw new ValidationError('Invalid signature');
  }
  
  return input as ContentObject;
}
```

### 9.2 Memory Safety

- Zero sensitive data after use
- Constant-time comparisons for secrets
- No logging of sensitive data
- Secure memory allocation for keys

```typescript
// Secure memory handling
function secureCompare(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

function zeroize(buffer: Uint8Array): void {
  crypto.getRandomValues(buffer);  // Overwrite
  buffer.fill(0);  // Zero
}
```

### 9.3 Error Handling

- Never leak sensitive info in errors
- Log security events
- Graceful degradation
- Alert on anomalies

---

## 10. Security Audit Checklist

### 10.1 Implementation Review

- [ ] All cryptographic operations use reviewed libraries
- [ ] No homebrew cryptography
- [ ] Keys are properly generated and stored
- [ ] Secrets are zeroized after use
- [ ] Constant-time operations for sensitive comparisons
- [ ] Input validation on all external data
- [ ] Output encoding to prevent injection
- [ ] Rate limiting on all endpoints

### 10.2 Protocol Review

- [ ] Authentication is mutual
- [ ] Encryption provides confidentiality and authenticity
- [ ] Forward secrecy is implemented
- [ ] Replay protection is in place
- [ ] Timestamp validation prevents old messages
- [ ] Key rotation is supported
- [ ] Recovery procedures are documented

### 10.3 Operational Security

- [ ] Secure build pipeline
- [ ] Reproducible builds
- [ ] Signed releases
- [ ] Dependency auditing
- [ ] Incident response plan
- [ ] Security disclosure process

---

## 11. Incident Response

### 11.1 Vulnerability Disclosure

Contact: aaryan.bansal.dev@gmail.com (PGP key available)

**Responsible Disclosure Policy:**
1. Report vulnerability privately
2. Allow 90 days for fix
3. Coordinate disclosure timing
4. Credit researchers appropriately

### 11.2 Incident Classification

| Severity | Description | Response Time |
|----------|-------------|---------------|
| Critical | Active exploitation, key compromise | Immediate |
| High | Remotely exploitable | 24 hours |
| Medium | Requires local access | 1 week |
| Low | Defense in depth issues | 1 month |

### 11.3 Response Procedures

1. **Contain**: Limit damage scope
2. **Assess**: Determine impact
3. **Remediate**: Deploy fixes
4. **Communicate**: Notify users
5. **Learn**: Post-mortem analysis

---

## 12. Future Security Roadmap

### 12.1 Post-Quantum Cryptography

Timeline for PQC migration:

| Phase | Timeline | Actions |
|-------|----------|---------|
| Preparation | 2024 | Algorithm selection, testing |
| Hybrid | 2025 | Deploy hybrid classical+PQC |
| Migration | 2026 | Full PQC for new keys |
| Deprecation | 2027+ | Phase out classical-only |

### 12.2 Hardware Security

Planned hardware integrations:
- Hardware wallet support (Ledger, Trezor)
- Secure enclave utilization (SGX, TrustZone)
- TPM integration for key storage
- FIDO2/WebAuthn for authentication

### 12.3 Formal Verification

Long-term goals:
- Formal protocol verification
- Verified cryptographic implementations
- Automated security testing
- Continuous fuzzing

---

*Document Version: 1.0.0*
*Last Updated: December 2024*
*Classification: Public*
