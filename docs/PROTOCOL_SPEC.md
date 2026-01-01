# RootlessNet Protocol Specification v2.0

*Complete protocol specification for secure posting, receiving, and communication.*

---

## Table of Contents

1. [Overview](#1-overview)
2. [Cryptographic Foundations](#2-cryptographic-foundations)
3. [Identity Protocol](#3-identity-protocol)
4. [Content Protocol](#4-content-protocol)
5. [Messaging Protocol](#5-messaging-protocol)
6. [Zone Protocol](#6-zone-protocol)
7. [Sync Protocol](#7-sync-protocol)
8. [Network Protocol](#8-network-protocol)
9. [Security Guarantees](#9-security-guarantees)
10. [Wire Format](#10-wire-format)
11. [Error Handling](#11-error-handling)
12. [Test Vectors](#12-test-vectors)

---

## 1. Overview

### 1.1 Design Goals

| Goal | Priority | Implementation |
|------|----------|----------------|
| Censorship Resistance | P0 | Decentralized, content-addressed |
| End-to-End Security | P0 | All crypto client-side |
| Forward Secrecy | P0 | Ratcheting protocols |
| Metadata Protection | P1 | Sealed sender, padding |
| Deniability | P1 | Deniable authentication |
| Post-Quantum Ready | P2 | Hybrid schemes planned |

### 1.2 Protocol Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Application Protocol (Content, Messages, Zones)            │
├─────────────────────────────────────────────────────────────┤
│  Security Protocol (Signatures, Encryption, Proofs)         │
├─────────────────────────────────────────────────────────────┤
│  Transport Protocol (Framing, Multiplexing)                 │
├─────────────────────────────────────────────────────────────┤
│  Network Protocol (P2P, Relay, DHT)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Cryptographic Foundations

### 2.1 Algorithm Suite

#### 2.1.1 Required Algorithms

| Purpose | Algorithm | Parameters |
|---------|-----------|------------|
| Hashing | BLAKE3 | 256-bit output |
| Signing | Ed25519 | Curve25519, SHA-512 |
| Encryption | XChaCha20-Poly1305 | 256-bit key, 192-bit nonce |
| Key Exchange | X25519 | Curve25519 ECDH |
| KDF | HKDF-SHA256 | Variable output |
| Password KDF | Argon2id | 256MB, 3 iterations, 4 threads |

#### 2.1.2 Key Sizes

| Key Type | Size | Encoding |
|----------|------|----------|
| Ed25519 Public | 32 bytes | Raw |
| Ed25519 Private | 64 bytes | Seed + Public |
| X25519 Public | 32 bytes | Raw |
| X25519 Private | 32 bytes | Scalar |
| Symmetric | 32 bytes | Raw |
| Nonce | 24 bytes | Random |
| Auth Tag | 16 bytes | Poly1305 |

### 2.2 Random Number Generation

```typescript
interface SecureRandom {
  // MUST use OS CSPRNG (getrandom/CryptGenRandom)
  getRandomBytes(length: number): Uint8Array;
  
  // Check entropy availability
  hasEntropy(): boolean;
  
  // Block if entropy insufficient
  getRandomBytesBlocking(length: number): Uint8Array;
}

// NEVER use Math.random() or userspace PRNGs
```

### 2.3 Key Derivation

#### 2.3.1 HKDF for Session Keys

```typescript
function deriveSessionKey(
  sharedSecret: Uint8Array,  // 32 bytes
  salt: Uint8Array,          // 32 bytes, random
  info: string,              // Context string
  length: number             // Output length
): Uint8Array {
  const prk = hkdf_extract(salt, sharedSecret, 'SHA-256');
  return hkdf_expand(prk, encode(info), length, 'SHA-256');
}

// Standard info strings:
const INFO_ENCRYPT = 'rootless-v2-encrypt';
const INFO_AUTH = 'rootless-v2-auth';
const INFO_CHAIN = 'rootless-v2-chain';
```

#### 2.3.2 Argon2id for Passwords

```typescript
interface Argon2Params {
  memory: 262144;    // 256 MB
  iterations: 3;
  parallelism: 4;
  hashLength: 32;
  salt: Uint8Array;  // 16 bytes random
}

function deriveKeyFromPassword(
  password: string,
  params: Argon2Params
): Uint8Array {
  return argon2id(
    encode(password),
    params.salt,
    params
  );
}
```

---

## 3. Identity Protocol

### 3.1 Identity Creation

#### 3.1.1 Key Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Generate 32 bytes from CSPRNG                           │
│     seed = getRandomBytes(32)                               │
├─────────────────────────────────────────────────────────────┤
│  2. Derive Ed25519 keypair                                  │
│     (signingPub, signingPriv) = ed25519_keygen(seed)        │
├─────────────────────────────────────────────────────────────┤
│  3. Derive X25519 keypair for encryption                    │
│     encryptionPriv = hkdf(seed, "encryption-key", 32)       │
│     encryptionPub = x25519_public(encryptionPriv)           │
├─────────────────────────────────────────────────────────────┤
│  4. Compute DID                                             │
│     did = "did:rootless:key:" + multibase(signingPub)       │
├─────────────────────────────────────────────────────────────┤
│  5. Create identity document                                │
│     Sign with signingPriv                                   │
└─────────────────────────────────────────────────────────────┘
```

#### 3.1.2 Identity Document

```typescript
interface IdentityDocument {
  // Specification version
  version: 2;
  
  // Primary identifier
  did: string;  // did:rootless:key:z6Mk...
  
  // Public keys with purposes
  publicKeys: [{
    id: string;           // did#key-1
    type: 'Ed25519';
    purpose: 'signing' | 'authentication';
    publicKey: Uint8Array;  // 32 bytes
    created: number;        // Unix timestamp ms
    expires?: number;
  }, {
    id: string;           // did#key-2
    type: 'X25519';
    purpose: 'encryption' | 'keyAgreement';
    publicKey: Uint8Array;
    created: number;
    expires?: number;
  }];
  
  // Creation timestamp
  created: number;
  
  // Self-signature
  proof: {
    type: 'Ed25519Signature2020';
    created: number;
    verificationMethod: string;  // did#key-1
    signature: Uint8Array;       // 64 bytes
  };
}
```

#### 3.1.3 Identity Serialization

```typescript
function serializeIdentity(doc: IdentityDocument): Uint8Array {
  // Canonical JSON serialization (sorted keys, no whitespace)
  const json = canonicalJson(doc);
  return new TextEncoder().encode(json);
}

function computeIdentitySignature(
  doc: IdentityDocument,
  privateKey: Uint8Array
): Uint8Array {
  const serialized = serializeIdentity(doc);
  const hash = blake3(serialized);
  return ed25519_sign(privateKey, hash);
}
```

### 3.2 Key Rotation Protocol

```
Old Key                                New Key
   │                                      │
   │  1. Generate new keypair             │
   │  ◄────────────────────────────────── │
   │                                      │
   │  2. Create rotation announcement     │
   │  ───────────────────────────────────►│
   │                                      │
   │  3. Sign with OLD key               │
   │  ◄────────────────────────────────── │
   │                                      │
   │  4. Publish to DHT                   │
   │  ───────────────────────────────────►│
   │                                      │
   │  5. Grace period (7 days)            │
   │  ═══════════════════════════════════ │
   │                                      │
   │  6. Revoke old key                   │
   │  ◄────────────────────────────────── │
```

#### 3.2.1 Rotation Message

```typescript
interface KeyRotation {
  version: 2;
  type: 'key-rotation';
  
  // Identity being rotated
  did: string;
  
  // Old key being retired
  oldKey: {
    id: string;
    publicKey: Uint8Array;
  };
  
  // New key taking over
  newKey: {
    id: string;
    type: 'Ed25519' | 'X25519';
    purpose: string;
    publicKey: Uint8Array;
  };
  
  // When rotation takes effect
  effectiveAt: number;
  
  // When old key becomes invalid
  oldKeyInvalidAt: number;
  
  // Signatures from BOTH keys
  proofs: [{
    verificationMethod: string;  // Old key
    signature: Uint8Array;
  }, {
    verificationMethod: string;  // New key
    signature: Uint8Array;
  }];
}
```

### 3.3 Identity Recovery (Shamir's Secret Sharing)

```typescript
interface RecoveryConfig {
  threshold: number;  // M shares needed
  total: number;      // N total shares
  guardians: DID[];   // Guardian identities
}

// Split master key into shares
function createRecoveryShares(
  masterKey: Uint8Array,
  config: RecoveryConfig
): RecoveryShare[] {
  const shares = shamirSplit(masterKey, config.threshold, config.total);
  
  return shares.map((share, i) => ({
    index: i + 1,
    guardian: config.guardians[i],
    encryptedShare: sealBox(
      share,
      getPublicKey(config.guardians[i])
    ),
    created: Date.now(),
  }));
}

// Recover from M shares
function recoverFromShares(
  shares: DecryptedShare[],
  threshold: number
): Uint8Array {
  if (shares.length < threshold) {
    throw new Error('Insufficient shares');
  }
  return shamirCombine(shares.slice(0, threshold));
}
```

---

## 4. Content Protocol

### 4.1 Content Creation

#### 4.1.1 Content Object Structure

```typescript
interface ContentObject {
  // Protocol version
  version: 2;
  
  // Content-addressed identifier (computed)
  id: CID;
  
  // Author identity
  author: DID;
  
  // Timestamps
  timestamp: number;       // Creation time (ms)
  expiresAt?: number;      // Optional expiration
  
  // Relationships
  zone: ZoneID;            // Required zone context
  parent?: CID;            // Reply/thread parent
  thread?: CID;            // Thread root
  mentions: DID[];         // Mentioned identities
  
  // Payload
  contentType: string;     // MIME type
  payloadEncryption: 'none' | 'zone' | 'recipients' | 'self';
  payload: ContentPayload;
  payloadHash: Uint8Array; // BLAKE3 of decrypted payload
  
  // Metadata
  tags: string[];
  language?: string;       // ISO 639-1
  
  // Extensions
  extensions?: Record<string, unknown>;
  
  // Cryptographic proof
  signature: Uint8Array;   // Ed25519 signature (64 bytes)
}
```

#### 4.1.2 Content Signing Process

```typescript
async function createContent(
  input: ContentInput,
  identity: Identity
): Promise<ContentObject> {
  // 1. Prepare payload
  const payloadBytes = encodePayload(input.payload, input.contentType);
  const payloadHash = blake3(payloadBytes);
  
  // 2. Encrypt if needed
  let payload: ContentPayload;
  let encryption: PayloadEncryption;
  
  switch (input.encryption) {
    case 'none':
      payload = { type: 'clear', data: payloadBytes };
      encryption = 'none';
      break;
    case 'zone':
      payload = await encryptForZone(payloadBytes, input.zone);
      encryption = 'zone';
      break;
    case 'recipients':
      payload = await encryptForRecipients(payloadBytes, input.recipients);
      encryption = 'recipients';
      break;
    case 'self':
      payload = await encryptForSelf(payloadBytes, identity);
      encryption = 'self';
      break;
  }
  
  // 3. Build content object (without signature)
  const content: Omit<ContentObject, 'id' | 'signature'> = {
    version: 2,
    author: identity.did,
    timestamp: Date.now(),
    expiresAt: input.expiresAt,
    zone: input.zone,
    parent: input.parent,
    thread: input.thread,
    mentions: input.mentions || [],
    contentType: input.contentType,
    payloadEncryption: encryption,
    payload,
    payloadHash,
    tags: input.tags || [],
    language: input.language,
    extensions: input.extensions,
  };
  
  // 4. Serialize for signing (canonical form)
  const serialized = canonicalSerialize(content);
  
  // 5. Sign
  const signature = ed25519_sign(identity.signingKey, blake3(serialized));
  
  // 6. Compute CID
  const fullContent = { ...content, signature };
  const id = computeCID(fullContent);
  
  return { id, ...fullContent };
}
```

#### 4.1.3 Content Verification

```typescript
async function verifyContent(content: ContentObject): Promise<VerifyResult> {
  const errors: string[] = [];
  
  // 1. Verify signature
  const serialized = canonicalSerialize(excludeFields(content, ['id', 'signature']));
  const hash = blake3(serialized);
  
  const authorKey = await resolvePublicKey(content.author, 'signing');
  if (!ed25519_verify(authorKey, hash, content.signature)) {
    errors.push('INVALID_SIGNATURE');
  }
  
  // 2. Verify CID
  const computedCID = computeCID(content);
  if (!cidEquals(computedCID, content.id)) {
    errors.push('INVALID_CID');
  }
  
  // 3. Verify timestamp
  const now = Date.now();
  const drift = 5 * 60 * 1000; // 5 minutes
  if (content.timestamp > now + drift) {
    errors.push('FUTURE_TIMESTAMP');
  }
  if (content.timestamp < now - 365 * 24 * 60 * 60 * 1000) {
    errors.push('ANCIENT_TIMESTAMP');
  }
  
  // 4. Verify payload hash (if decryptable)
  if (content.payloadEncryption === 'none') {
    const computedHash = blake3(content.payload.data);
    if (!constantTimeEquals(computedHash, content.payloadHash)) {
      errors.push('INVALID_PAYLOAD_HASH');
    }
  }
  
  // 5. Check expiration
  if (content.expiresAt && content.expiresAt < now) {
    errors.push('EXPIRED');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### 4.2 Payload Encryption

#### 4.2.1 Multi-Recipient Encryption

```typescript
interface EncryptedPayload {
  type: 'encrypted';
  
  // Ephemeral public key for this message
  ephemeralPublic: Uint8Array;  // 32 bytes
  
  // Per-recipient wrapped keys
  recipients: {
    did: DID;
    encryptedKey: Uint8Array;  // 48 bytes (32 key + 16 tag)
    nonce: Uint8Array;         // 24 bytes
  }[];
  
  // Encrypted content
  ciphertext: Uint8Array;
  nonce: Uint8Array;  // 24 bytes
}

async function encryptForRecipients(
  plaintext: Uint8Array,
  recipients: DID[]
): Promise<EncryptedPayload> {
  // 1. Generate content encryption key
  const contentKey = getRandomBytes(32);
  
  // 2. Generate ephemeral keypair for this message
  const ephemeral = x25519_keygen();
  
  // 3. Encrypt content key for each recipient
  const wrappedKeys = await Promise.all(
    recipients.map(async (did) => {
      const recipientPub = await resolvePublicKey(did, 'encryption');
      
      // Compute shared secret
      const shared = x25519(ephemeral.privateKey, recipientPub);
      
      // Derive wrapping key
      const wrapKey = hkdf(shared, 'rootless-key-wrap', 32);
      
      // Encrypt content key
      const nonce = getRandomBytes(24);
      const encryptedKey = xchacha20poly1305_encrypt(
        wrapKey,
        nonce,
        contentKey
      );
      
      return { did, encryptedKey, nonce };
    })
  );
  
  // 4. Encrypt content
  const contentNonce = getRandomBytes(24);
  const ciphertext = xchacha20poly1305_encrypt(
    contentKey,
    contentNonce,
    plaintext
  );
  
  // 5. Zeroize sensitive material
  zeroize(contentKey);
  zeroize(ephemeral.privateKey);
  
  return {
    type: 'encrypted',
    ephemeralPublic: ephemeral.publicKey,
    recipients: wrappedKeys,
    ciphertext,
    nonce: contentNonce,
  };
}
```

#### 4.2.2 Zone Encryption

```typescript
interface ZoneEncryptedPayload {
  type: 'zone-encrypted';
  
  // Zone key epoch (for key rotation)
  epoch: number;
  
  // Encrypted with zone group key
  ciphertext: Uint8Array;
  nonce: Uint8Array;
}

async function encryptForZone(
  plaintext: Uint8Array,
  zone: ZoneID
): Promise<ZoneEncryptedPayload> {
  // Get current zone key
  const { key, epoch } = await getZoneKey(zone);
  
  const nonce = getRandomBytes(24);
  const ciphertext = xchacha20poly1305_encrypt(key, nonce, plaintext);
  
  return {
    type: 'zone-encrypted',
    epoch,
    ciphertext,
    nonce,
  };
}
```

---

## 5. Messaging Protocol

### 5.1 Initial Key Exchange (X3DH)

```
Alice                                             Bob
  │                                                │
  │  1. Fetch Bob's prekey bundle from DHT         │
  │  ─────────────────────────────────────────────►│
  │                                                │
  │  PreKeyBundle:                                 │
  │  - Identity Key (IK_B)                         │
  │  - Signed Prekey (SPK_B) + Signature           │
  │  - One-time Prekey (OPK_B) [optional]          │
  │  ◄─────────────────────────────────────────────│
  │                                                │
  │  2. Generate ephemeral keypair (EK_A)          │
  │                                                │
  │  3. Compute shared secrets:                    │
  │     DH1 = X25519(IK_A, SPK_B)                  │
  │     DH2 = X25519(EK_A, IK_B)                   │
  │     DH3 = X25519(EK_A, SPK_B)                  │
  │     DH4 = X25519(EK_A, OPK_B) [if available]   │
  │                                                │
  │  4. Derive root key:                           │
  │     SK = KDF(DH1 || DH2 || DH3 || DH4)         │
  │                                                │
  │  5. Send initial message with:                 │
  │     - IK_A                                     │
  │     - EK_A                                     │
  │     - Used prekey IDs                          │
  │     - Ciphertext (encrypted with SK)           │
  │  ─────────────────────────────────────────────►│
```

#### 5.1.1 Prekey Bundle

```typescript
interface PrekeyBundle {
  // Identity key
  identityKey: Uint8Array;  // X25519 public
  
  // Signed prekey (rotates periodically)
  signedPrekey: {
    id: number;
    publicKey: Uint8Array;
    signature: Uint8Array;  // Signed by identity Ed25519 key
    created: number;
  };
  
  // One-time prekeys (consumed on use)
  oneTimePrekeys: {
    id: number;
    publicKey: Uint8Array;
  }[];
}
```

#### 5.1.2 X3DH Implementation

```typescript
async function performX3DH(
  myIdentity: Identity,
  theirBundle: PrekeyBundle
): Promise<X3DHResult> {
  // Verify signed prekey
  if (!verifyPrekey(theirBundle.signedPrekey, theirBundle.identityKey)) {
    throw new Error('Invalid signed prekey');
  }
  
  // Generate ephemeral key
  const ephemeral = x25519_keygen();
  
  // Calculate DH values
  const dh1 = x25519(myIdentity.encryptionKey, theirBundle.signedPrekey.publicKey);
  const dh2 = x25519(ephemeral.privateKey, theirBundle.identityKey);
  const dh3 = x25519(ephemeral.privateKey, theirBundle.signedPrekey.publicKey);
  
  let dh4: Uint8Array | null = null;
  let usedOTP: number | null = null;
  
  if (theirBundle.oneTimePrekeys.length > 0) {
    const otp = theirBundle.oneTimePrekeys[0];
    dh4 = x25519(ephemeral.privateKey, otp.publicKey);
    usedOTP = otp.id;
  }
  
  // Derive shared key
  const combined = concat(dh1, dh2, dh3, dh4 || new Uint8Array(0));
  const sharedSecret = hkdf(combined, 'x3dh-v1', 64);
  
  return {
    sharedSecret,
    ephemeralPublic: ephemeral.publicKey,
    usedSignedPrekeyId: theirBundle.signedPrekey.id,
    usedOneTimePrekeyId: usedOTP,
  };
}
```

### 5.2 Double Ratchet

```typescript
interface RatchetState {
  // DH ratchet
  dhSend: KeyPair;       // Our current DH key
  dhReceive?: Uint8Array; // Their current DH public
  
  // Root key
  rootKey: Uint8Array;
  
  // Chain keys
  sendChainKey: Uint8Array;
  receiveChainKey?: Uint8Array;
  
  // Message numbers
  sendN: number;
  receiveN: number;
  previousSendN: number;
  
  // Skipped messages (for out-of-order)
  skippedKeys: Map<string, Uint8Array>;
}

function ratchetEncrypt(
  state: RatchetState,
  plaintext: Uint8Array
): EncryptedMessage {
  // Derive message key from chain
  const { messageKey, nextChainKey } = kdfChain(state.sendChainKey);
  state.sendChainKey = nextChainKey;
  
  // Encrypt
  const nonce = getRandomBytes(24);
  const ciphertext = xchacha20poly1305_encrypt(messageKey, nonce, plaintext);
  
  // Build header
  const header = {
    dhPublic: state.dhSend.publicKey,
    n: state.sendN,
    pn: state.previousSendN,
  };
  
  state.sendN++;
  zeroize(messageKey);
  
  return {
    header,
    nonce,
    ciphertext,
  };
}

function ratchetDecrypt(
  state: RatchetState,
  message: EncryptedMessage
): Uint8Array {
  // Check for skipped messages
  const skipKey = `${toHex(message.header.dhPublic)}:${message.header.n}`;
  if (state.skippedKeys.has(skipKey)) {
    const messageKey = state.skippedKeys.get(skipKey)!;
    state.skippedKeys.delete(skipKey);
    return xchacha20poly1305_decrypt(messageKey, message.nonce, message.ciphertext);
  }
  
  // DH ratchet step if new public key
  if (!constantTimeEquals(message.header.dhPublic, state.dhReceive)) {
    // Skip remaining messages in current chain
    skipMessages(state, message.header.pn);
    
    // Perform DH ratchet
    dhRatchet(state, message.header.dhPublic);
  }
  
  // Skip messages in new chain
  skipMessages(state, message.header.n);
  
  // Derive message key
  const { messageKey, nextChainKey } = kdfChain(state.receiveChainKey!);
  state.receiveChainKey = nextChainKey;
  state.receiveN++;
  
  // Decrypt
  const plaintext = xchacha20poly1305_decrypt(
    messageKey,
    message.nonce,
    message.ciphertext
  );
  
  zeroize(messageKey);
  return plaintext;
}
```

### 5.3 Message Format

```typescript
interface DirectMessage {
  version: 2;
  id: MessageID;
  
  // Conversation reference
  conversationId: string;
  
  // Sender identity
  sender: DID;
  
  // Ratchet header (encrypted in sealed sender mode)
  header: {
    dhPublic: Uint8Array;
    n: number;
    pn: number;
  };
  
  // Encrypted content
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  
  // Timestamp
  timestamp: number;
  
  // Optional: reply reference
  replyTo?: MessageID;
  
  // Optional: expiration
  expiresAt?: number;
}
```

### 5.4 Sealed Sender (Anonymous Messages)

```typescript
async function sealMessage(
  message: DirectMessage,
  senderIdentity: Identity,
  recipientDID: DID
): Promise<SealedMessage> {
  // Get recipient's encryption key
  const recipientKey = await resolvePublicKey(recipientDID, 'encryption');
  
  // Generate ephemeral key
  const ephemeral = x25519_keygen();
  
  // Derive encryption key
  const shared = x25519(ephemeral.privateKey, recipientKey);
  const key = hkdf(shared, 'sealed-sender-v1', 32);
  
  // Serialize inner message (includes sender info)
  const inner = canonicalSerialize(message);
  
  // Encrypt
  const nonce = getRandomBytes(24);
  const ciphertext = xchacha20poly1305_encrypt(key, nonce, inner);
  
  zeroize(ephemeral.privateKey);
  zeroize(key);
  
  return {
    version: 2,
    type: 'sealed',
    ephemeralPublic: ephemeral.publicKey,
    ciphertext,
    nonce,
  };
}
```

### 5.5 Group Messaging (MLS)

```typescript
interface MLSGroup {
  groupId: Uint8Array;
  epoch: number;
  
  // Ratchet tree
  tree: RatchetTree;
  
  // Group secrets
  secrets: {
    joinerSecret: Uint8Array;
    epochSecret: Uint8Array;
    senderDataSecret: Uint8Array;
    encryptionSecret: Uint8Array;
    exporterSecret: Uint8Array;
    authenticationSecret: Uint8Array;
    externalSecret: Uint8Array;
    confirmationKey: Uint8Array;
    membershipKey: Uint8Array;
    resumptionSecret: Uint8Array;
  };
  
  // Member list
  members: Map<number, LeafNode>;
  
  // Transcript hash
  transcriptHash: Uint8Array;
}

// Group operations
interface MLSOperations {
  // Create new group
  createGroup(groupId: Uint8Array, creator: Identity): MLSGroup;
  
  // Add member
  addMember(group: MLSGroup, keyPackage: KeyPackage): Commit;
  
  // Remove member
  removeMember(group: MLSGroup, memberIndex: number): Commit;
  
  // Update own keys
  updateKeys(group: MLSGroup): Commit;
  
  // Process received commit
  processCommit(group: MLSGroup, commit: Commit): MLSGroup;
  
  // Encrypt message
  encryptMessage(group: MLSGroup, plaintext: Uint8Array): MLSCiphertext;
  
  // Decrypt message
  decryptMessage(group: MLSGroup, ciphertext: MLSCiphertext): Uint8Array;
}
```

---

## 6. Zone Protocol

### 6.1 Zone Creation

```typescript
interface ZoneCreation {
  version: 2;
  
  // Zone identifier
  id: ZoneID;  // BLAKE3 hash of creation params
  
  // Basic info
  name: string;
  description: string;
  
  // Creator
  creator: DID;
  
  // Configuration
  config: {
    visibility: 'public' | 'private' | 'secret';
    joinPolicy: 'open' | 'approval' | 'invite' | 'token';
    contentPolicy: ContentPolicy;
    retentionDays?: number;
  };
  
  // Initial moderators
  moderators: DID[];
  
  // For encrypted zones
  encryption?: {
    type: 'mls';
    initialEpoch: number;
    groupInfo: Uint8Array;
  };
  
  // Timestamps
  created: number;
  
  // Signature
  signature: Uint8Array;
}
```

### 6.2 Zone Membership

```typescript
// Join request
interface ZoneJoinRequest {
  zone: ZoneID;
  requester: DID;
  message?: string;
  timestamp: number;
  signature: Uint8Array;
}

// Membership proof
interface ZoneMembership {
  zone: ZoneID;
  member: DID;
  role: 'member' | 'moderator' | 'admin';
  grantedBy: DID;
  grantedAt: number;
  expiresAt?: number;
  
  // Merkle proof of inclusion
  proof: {
    root: Uint8Array;
    path: Uint8Array[];
    index: number;
  };
  
  signature: Uint8Array;
}
```

### 6.3 Zone Key Management

```typescript
// Zone uses MLS for key distribution
interface ZoneKeyState {
  epoch: number;
  groupState: MLSGroup;
  
  // Current encryption key
  contentKey: Uint8Array;
  
  // Key rotation schedule
  nextRotation: number;
}

async function rotateZoneKey(zone: Zone, initiator: Identity): Promise<void> {
  // 1. Create MLS update
  const commit = mlsUpdateKeys(zone.keyState.groupState);
  
  // 2. Broadcast commit to members
  await broadcastCommit(zone.id, commit);
  
  // 3. Derive new content key
  const newContentKey = hkdf(
    zone.keyState.groupState.secrets.encryptionSecret,
    'zone-content-key',
    32
  );
  
  zone.keyState.contentKey = newContentKey;
  zone.keyState.epoch++;
}
```

---

## 7. Sync Protocol

### 7.1 Sync Messages

```typescript
type SyncMessage =
  | HeadAnnouncement
  | SyncRequest
  | SyncResponse
  | ContentPush;

interface HeadAnnouncement {
  type: 'head';
  zone: ZoneID;
  head: CID;          // Latest content CID
  timestamp: number;
  signature: Uint8Array;
}

interface SyncRequest {
  type: 'sync-request';
  zone: ZoneID;
  since?: CID;        // Get content after this
  limit: number;
  requestId: string;
}

interface SyncResponse {
  type: 'sync-response';
  requestId: string;
  content: ContentObject[];
  hasMore: boolean;
  nextCursor?: CID;
}

interface ContentPush {
  type: 'push';
  content: ContentObject[];
  sender: DID;
  signature: Uint8Array;
}
```

### 7.2 Sync Flow

```
Node A                                    Node B
  │                                          │
  │  1. Announce head                        │
  │  ──── HEAD(zone, head_cid) ─────────────►│
  │                                          │
  │  2. Compare heads                        │
  │                                          │
  │  3. Request missing content              │
  │  ◄──── SYNC_REQUEST(since=my_head) ──────│
  │                                          │
  │  4. Send content batch                   │
  │  ──── SYNC_RESPONSE(content[]) ─────────►│
  │                                          │
  │  5. Continue until synced                │
  │  ◄──── SYNC_REQUEST(cursor) ─────────────│
  │  ──── SYNC_RESPONSE(content[]) ─────────►│
  │                                          │
  │  6. Sync complete                        │
```

### 7.3 Content Verification During Sync

```typescript
async function processSyncedContent(
  content: ContentObject[]
): Promise<SyncResult> {
  const accepted: CID[] = [];
  const rejected: { cid: CID; reason: string }[] = [];
  
  for (const obj of content) {
    // 1. Verify cryptographic integrity
    const result = await verifyContent(obj);
    if (!result.valid) {
      rejected.push({ cid: obj.id, reason: result.errors.join(', ') });
      continue;
    }
    
    // 2. Check author still valid
    const authorValid = await verifyIdentity(obj.author);
    if (!authorValid) {
      rejected.push({ cid: obj.id, reason: 'AUTHOR_REVOKED' });
      continue;
    }
    
    // 3. Check zone membership (if required)
    if (obj.zone) {
      const inZone = await verifyZoneMembership(obj.author, obj.zone, obj.timestamp);
      if (!inZone) {
        rejected.push({ cid: obj.id, reason: 'NOT_ZONE_MEMBER' });
        continue;
      }
    }
    
    // 4. Store locally
    await storeContent(obj);
    accepted.push(obj.id);
  }
  
  return { accepted, rejected };
}
```

---

## 8. Network Protocol

### 8.1 Peer Discovery

```typescript
interface PeerDiscovery {
  // Bootstrap nodes (hardcoded)
  bootstrap: string[];
  
  // Local network (mDNS)
  enableMDNS: boolean;
  
  // DHT discovery
  enableDHT: boolean;
  
  // Peer exchange
  enablePEX: boolean;
}

// DHT provider record
interface ProviderRecord {
  peer: PeerID;
  zone: ZoneID;       // Content they have
  addresses: string[];
  timestamp: number;
  signature: Uint8Array;
}
```

### 8.2 Peer Authentication

```typescript
interface PeerHandshake {
  // Protocol version
  version: 2;
  
  // Peer identity
  peerId: PeerID;     // Derived from public key
  identity?: DID;     // Optional RootlessNet identity
  
  // Supported protocols
  protocols: string[];
  
  // Transport encryption
  noiseKey: Uint8Array;  // Noise NK public key
  
  // Timestamp
  timestamp: number;
  
  // Signature (if identity provided)
  signature?: Uint8Array;
}

// Noise XX handshake for mutual authentication
async function performHandshake(
  conn: Connection,
  localIdentity: Identity
): Promise<SecureChannel> {
  const noise = new NoiseXX();
  
  // -> e
  const e = noise.generateEphemeral();
  await send(conn, { type: 'e', publicKey: e.publicKey });
  
  // <- e, ee, s, es
  const msg1 = await receive(conn);
  noise.mixHash(msg1.ephemeral);
  noise.mixKey(x25519(e.privateKey, msg1.ephemeral));
  const peerStatic = noise.decryptAndHash(msg1.encryptedStatic);
  noise.mixKey(x25519(e.privateKey, peerStatic));
  
  // -> s, se
  const encryptedStatic = noise.encryptAndHash(localIdentity.noiseKey.publicKey);
  noise.mixKey(x25519(localIdentity.noiseKey.privateKey, msg1.ephemeral));
  await send(conn, { type: 'se', encryptedStatic });
  
  return noise.split();
}
```

### 8.3 Rate Limiting

```typescript
interface RateLimits {
  // Per-identity limits
  identity: {
    postsPerMinute: 10;
    postsPerHour: 100;
    messagesPerMinute: 60;
    syncRequestsPerMinute: 30;
  };
  
  // Per-IP limits (for unauthenticated)
  ip: {
    connectionsPerMinute: 20;
    requestsPerSecond: 50;
  };
  
  // Global limits
  global: {
    maxPeers: 100;
    maxBandwidthMbps: 100;
  };
}

// Proof of Work for expensive operations
interface ProofOfWork {
  challenge: Uint8Array;  // 32 bytes
  difficulty: number;     // Leading zero bits
  solution: Uint8Array;   // Nonce that satisfies
  
  verify(): boolean {
    const hash = blake3(concat(this.challenge, this.solution));
    return countLeadingZeros(hash) >= this.difficulty;
  }
}
```

---

## 9. Security Guarantees

### 9.1 Confidentiality

| Data Type | Protection | Algorithm |
|-----------|------------|-----------|
| Private Messages | E2E | Double Ratchet |
| Group Messages | E2E | MLS |
| Encrypted Content | Recipients only | X25519-XChaCha20 |
| Zone Content | Members only | MLS Group Key |
| At-rest Keys | Password | Argon2id + XChaCha20 |

### 9.2 Integrity

| Object | Verification |
|--------|-------------|
| Content | Ed25519 signature + BLAKE3 hash |
| Messages | AEAD authentication |
| Identity | Self-signed document |
| Key Rotation | Dual signatures |

### 9.3 Availability

| Threat | Mitigation |
|--------|------------|
| Node Failure | Content replication |
| DDoS | Rate limiting, PoW |
| Sybil | Reputation, PoW |
| Eclipse | Diverse peer selection |

### 9.4 Forward Secrecy

| Protocol | Mechanism |
|----------|-----------|
| Direct Messages | Double Ratchet |
| Group Messages | MLS epoch rotation |
| Zone Keys | Periodic rotation |

---

## 10. Wire Format

### 10.1 Message Envelope

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     Magic Number (0x524E4554)                 |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|    Version    |     Flags     |          Message Type         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         Payload Length                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                         Payload                               +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          CRC32                                |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### 10.2 Message Types

| Code | Type | Description |
|------|------|-------------|
| 0x0001 | HANDSHAKE | Connection setup |
| 0x0002 | PING | Keep-alive |
| 0x0003 | PONG | Keep-alive response |
| 0x0010 | IDENTITY | Identity document |
| 0x0011 | KEY_ROTATION | Key rotation msg |
| 0x0020 | CONTENT | Content object |
| 0x0021 | CONTENT_REQUEST | Request by CID |
| 0x0030 | MESSAGE | Direct message |
| 0x0031 | MESSAGE_ACK | Delivery ack |
| 0x0040 | SYNC_REQUEST | Sync request |
| 0x0041 | SYNC_RESPONSE | Sync response |
| 0x0050 | ZONE_CREATE | Zone creation |
| 0x0051 | ZONE_JOIN | Join request |
| 0x0052 | ZONE_LEAVE | Leave announcement |
| 0x0060 | DHT_PUT | DHT store |
| 0x0061 | DHT_GET | DHT retrieve |
| 0xFFFF | ERROR | Error response |

---

## 11. Error Handling

### 11.1 Error Codes

| Code | Name | Description |
|------|------|-------------|
| 0x0000 | OK | Success |
| 0x0001 | INVALID_SIGNATURE | Signature verification failed |
| 0x0002 | INVALID_CID | CID mismatch |
| 0x0003 | CONTENT_NOT_FOUND | Content doesn't exist |
| 0x0004 | IDENTITY_NOT_FOUND | Identity not resolved |
| 0x0005 | RATE_LIMITED | Too many requests |
| 0x0006 | UNAUTHORIZED | Access denied |
| 0x0007 | INVALID_FORMAT | Malformed message |
| 0x0008 | EXPIRED | Content/key expired |
| 0x0009 | DECRYPTION_FAILED | Cannot decrypt |
| 0x000A | KEY_REVOKED | Key has been revoked |
| 0x000B | NOT_ZONE_MEMBER | Not in zone |
| 0x000C | PROTOCOL_ERROR | Protocol violation |

### 11.2 Error Response

```typescript
interface ErrorResponse {
  type: 'error';
  code: number;
  message: string;
  requestId?: string;
  retryAfter?: number;  // For rate limits
}
```

---

## 12. Test Vectors

### 12.1 Key Generation

```
Input:
  seed = 0x0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20

Output:
  ed25519_public = 0x...
  ed25519_private = 0x...
  x25519_public = 0x...
  did = did:rootless:key:z6Mk...
```

### 12.2 Content Signing

```
Input:
  content = {...}
  signing_key = 0x...

Process:
  canonical = canonicalSerialize(content)
  hash = blake3(canonical)
  signature = ed25519_sign(signing_key, hash)

Output:
  signature = 0x...
  cid = bafyb...
```

### 12.3 Encryption

```
Input:
  plaintext = "Hello, World!"
  key = 0x...
  nonce = 0x...

Output:
  ciphertext = 0x...
  tag = 0x...
```

---

*Protocol Version: 2.0.0*
*Last Updated: January 2026*
*Status: Draft Standard*
