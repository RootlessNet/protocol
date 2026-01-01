# RootlessNet

*A rootless, ownerless substrate for human expression.*

---

## 0. Identity of the Project

**Name:** RootlessNet  
**Tagline:** *Speech without roots. Power without owners.*  
**Version:** Protocol v2.0.0  
**Status:** Active Development  
**License:** MIT + Commons Clause  

RootlessNet is not a platform, company, or product.
It is a **protocol + ecosystem** designed to make human expression structurally resilient to control, capture, and silent erasure.

RootlessNet does not promise safety, comfort, or harmony.
It promises **persistence, exit, and neutrality**.

### 0.1 Project Goals

| Priority | Goal | Status |
|----------|------|--------|
| P0 | Censorship-resistant expression | Core |
| P0 | Identity sovereignty | Core |
| P0 | Data portability | Core |
| P1 | End-to-end encryption | Implemented |
| P1 | Mesh networking support | Implemented |
| P2 | Cross-protocol bridges | Planned |
| P2 | Hardware wallet integration | Planned |

---

## 1. Core Philosophy (Axioms)

These are not features. They are invariants.

1. **Existence ≠ Visibility**
   Content may exist without being amplified.

2. **No Global Authority**
   No entity has the power to define acceptable speech globally.

3. **No Canonical Feed**
   Feeds are client-defined, not protocol-enforced.

4. **Exit Is Always Possible**
   Users can leave without losing identity, history, or audience.

5. **Clients Compete, Protocols Don't**
   Innovation happens at the edges.

6. **Speech Is Contextual, Not Absolute**
   Meaning depends on the zone in which it appears.

7. **Privacy by Default**
   All communications are encrypted unless explicitly made public.

8. **Zero Knowledge Architecture**
   The network learns nothing about users beyond what they choose to reveal.

9. **Adversarial Resilience**
   The system assumes hostile actors at every layer.

10. **Cryptographic Truth**
    All claims are verifiable through cryptographic proofs.

---

## 2. Mental Model

RootlessNet should be understood as:

* Email is to Gmail
* HTTP is to websites
* TCP/IP is to applications
* Bitcoin is to banks

RootlessNet is the **substrate**, not the surface.

### 2.1 Core Comparisons

| Aspect | Traditional Platforms | RootlessNet |
|--------|----------------------|-------------|
| Data Ownership | Platform-owned | User-owned |
| Identity | Platform-issued | Self-sovereign |
| Moderation | Centralized | Distributed |
| Censorship | Single point of failure | Structurally resistant |
| Monetization | Advertising-driven | User-defined |
| Algorithm | Opaque, engagement-driven | Transparent, client-chosen |
| Portability | Locked in | Full export/import |

---

## 3. Layered Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                             │
│         (Clients, UIs, Third-party Integrations)                │
├─────────────────────────────────────────────────────────────────┤
│                    Presentation Layer                            │
│         (Feed Logic, Ranking, Filtering, Curation)              │
├─────────────────────────────────────────────────────────────────┤
│                    Context Layer (Zones)                         │
│         (Social Scope, Norms, Intent, Communities)              │
├─────────────────────────────────────────────────────────────────┤
│                    Content Layer                                 │
│         (Signed Objects, CIDs, Merkle DAGs)                     │
├─────────────────────────────────────────────────────────────────┤
│                    Identity Layer                                │
│         (DIDs, Key Management, Reputation, Proofs)              │
├─────────────────────────────────────────────────────────────────┤
│                    Cryptographic Layer                           │
│         (Signatures, Encryption, ZKPs, Hash Functions)          │
├─────────────────────────────────────────────────────────────────┤
│                    Network Layer                                 │
│         (P2P Transport, DHT, Gossip, Relays)                    │
├─────────────────────────────────────────────────────────────────┤
│                    Storage Layer                                 │
│         (IPFS, Local Storage, Cloud Mirrors, Pinning)           │
└─────────────────────────────────────────────────────────────────┘
```

Each layer is optional above the content layer.

### 3.1 Layer Responsibilities

| Layer | Responsibility | Security Model |
|-------|---------------|----------------|
| Application | User interaction | Client-side validation |
| Presentation | Content ordering | No trust required |
| Context | Social boundaries | Reputation-based |
| Content | Data integrity | Cryptographic proofs |
| Identity | Authentication | Self-sovereign keys |
| Cryptographic | Confidentiality | Zero-knowledge |
| Network | Availability | Byzantine tolerance |
| Storage | Persistence | Content addressing |

---

## 4. Identity System

### 4.1 Principles

* Identity is **self-generated**
* No central registry
* Keys live with the user
* Rotation is always possible
* Identity does not imply personhood
* Multiple identities are a feature, not a bug

### 4.2 Identity Types

| Type | Description | Use Case | Persistence |
|------|-------------|----------|-------------|
| Ephemeral | One-time or disposable presence | Anonymous speech | None |
| Persistent Pseudonym | Stable social identity | Social reputation | Long-term |
| Reputation-Bound | Community-linked identity | High-trust contexts | Permanent |
| Key-Only | Messaging or verification use | Private comms | Session-based |
| Hierarchical | Organization-linked identity | Business/Team use | Delegated |
| Recoverable | Social recovery enabled | Mainstream users | With backup |

### 4.3 Decentralized Identifier (DID) Specification

```
did:rootless:<method>:<identifier>
```

**Supported Methods:**

| Method | Description | Example |
|--------|-------------|---------|
| `key` | Direct public key | `did:rootless:key:z6Mk...` |
| `mesh` | DHT-resolved | `did:rootless:mesh:abc123...` |
| `ens` | Ethereum Name Service | `did:rootless:ens:alice.eth` |
| `dns` | DNS-based verification | `did:rootless:dns:example.com` |
| `onion` | Tor hidden service | `did:rootless:onion:xyz...onion` |

### 4.4 Key Management

#### 4.4.1 Key Hierarchy

```
Master Key (Cold Storage)
    │
    ├── Identity Key (Device-bound)
    │       │
    │       ├── Signing Key (Content)
    │       ├── Encryption Key (Messages)
    │       └── Authentication Key (Sessions)
    │
    ├── Recovery Key (Social/Hardware)
    │
    └── Delegation Key (Permissions)
```

#### 4.4.2 Key Rotation Protocol

1. Generate new key pair
2. Sign rotation announcement with old key
3. Publish rotation proof to DHT
4. Update all active sessions
5. Revoke old key with time delay
6. Notify connected identities

#### 4.4.3 Key Recovery Mechanisms

| Method | Trust Model | Security Level |
|--------|-------------|----------------|
| Social Recovery | M-of-N trusted contacts | High |
| Hardware Backup | Physical device | Very High |
| Seed Phrase | User-memorized | Medium |
| Time-locked Vault | Smart contract | High |
| Biometric + Device | Multi-factor | Medium-High |

### 4.5 Identity Verification

#### 4.5.1 Proof Types

| Proof | Description | Cryptographic Basis |
|-------|-------------|-------------------|
| Ownership Proof | Proves key control | Digital signature |
| Time Proof | Proves temporal existence | Timestamping |
| Membership Proof | Proves zone participation | Merkle inclusion |
| Attribute Proof | Proves property | ZK-SNARK |
| Linkage Proof | Proves identity connection | Ring signature |

#### 4.5.2 Zero-Knowledge Identity Proofs

Users can prove attributes without revealing identity:

- Age verification without birthdate
- Location region without exact coordinates
- Reputation threshold without full history
- Group membership without member list

---

## 5. Content Model

### 5.1 Content Objects

All expression is represented as a signed content object.

#### 5.1.1 Content Object Schema

```typescript
interface ContentObject {
  // Core Fields
  version: string;                    // Protocol version
  id: CID;                           // Content-addressed identifier
  author: DID;                       // Author's decentralized identifier
  
  // Temporal
  timestamp: number;                 // Unix timestamp (milliseconds)
  expiresAt?: number;               // Optional expiration
  
  // Relationships
  parent?: CID;                      // Parent content reference
  thread?: CID;                      // Thread root reference
  zone: ZoneID;                      // Zone reference
  mentions: DID[];                   // Mentioned identities
  
  // Content
  contentType: string;               // MIME type
  payload: EncryptedPayload | ClearPayload;
  payloadHash: Hash;                 // Content-addressed hash
  
  // Metadata
  tags: string[];                    // Semantic tags
  language?: string;                 // ISO 639-1 code
  
  // Cryptographic
  signature: Signature;              // Author's signature
  proofs: Proof[];                   // Additional proofs
  
  // Optional Extensions
  extensions?: Record<string, unknown>;
}
```

#### 5.1.2 Supported Content Types

| Category | Types | Max Size |
|----------|-------|----------|
| Text | Plain, Markdown, Rich Text | 32KB |
| Media | Images, Video, Audio | 100MB |
| Documents | PDF, Office, Archive | 50MB |
| Code | Source files, Notebooks | 10MB |
| Data | JSON, CSV, Binary | 25MB |
| Links | URLs, Content references | 4KB |

### 5.2 Mutability Model

* Content is never edited
* Changes create new objects
* Deletion is not global
* Amendments are linked objects

Persistence is structural, not moral.

#### 5.2.1 Content State Machine

```
┌─────────┐
│ Created │
└────┬────┘
     │
     ▼
┌─────────┐     ┌──────────────┐
│ Active  │────►│   Amended    │
└────┬────┘     └──────────────┘
     │
     ▼
┌──────────────┐
│ Author-Hidden│
└──────────────┘
```

### 5.3 Content Addressing

All content uses cryptographic content addressing:

| Algorithm | Use Case | Properties |
|-----------|----------|------------|
| SHA-256 | Primary hash | Collision resistant |
| BLAKE3 | High performance | Parallelizable |
| SHA-3 | Post-quantum ready | Keccak-based |

#### 5.3.1 Content Identifier (CID) Format

```
<multibase><multicodec><multihash>
```

Example: `bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi`

### 5.4 Content Encryption

#### 5.4.1 Encryption Levels

| Level | Description | Key Management |
|-------|-------------|----------------|
| Public | No encryption | N/A |
| Zone-locked | Zone members only | Group key |
| Circle | Named recipients | Multi-recipient |
| Private | Single recipient | Asymmetric |
| Self-only | Author's eyes only | Personal key |

#### 5.4.2 Encryption Protocols

| Protocol | Use Case | Security Level |
|----------|----------|----------------|
| X25519-XChaCha20-Poly1305 | Direct messages | 256-bit |
| Sealed Box | Anonymous sending | 256-bit |
| MLS (Message Layer Security) | Group messaging | Forward secrecy |
| Age | File encryption | 256-bit |

---

## 6. Zones (Contexts)

Zones are the primary social organizing unit.

A zone defines:

* Purpose
* Expected norms
* Visibility defaults
* Retention expectations
* Moderation preferences

Zones do **not** enforce rules.
They provide context.

Anyone may create a zone.

### 6.1 Zone Schema

```typescript
interface Zone {
  // Identity
  id: ZoneID;
  name: string;
  description: string;
  creator: DID;
  created: number;
  
  // Configuration
  visibility: 'public' | 'private' | 'secret';
  joinPolicy: 'open' | 'approval' | 'invite' | 'token-gated';
  
  // Governance
  moderators: DID[];
  rules: ZoneRule[];
  votingMechanism?: VotingConfig;
  
  // Content Policy
  allowedContentTypes: string[];
  retentionPolicy: RetentionConfig;
  defaultEncryption: EncryptionLevel;
  
  // Reputation
  reputationConfig: ReputationConfig;
  
  // Cryptographic
  zoneKey?: PublicKey;           // For encrypted zones
  signature: Signature;
}
```

### 6.2 Zone Types

| Type | Description | Example |
|------|-------------|---------|
| Public Square | Open discussion | General topics |
| Topic | Subject-focused | Technology, Art |
| Community | Interest group | Local groups |
| Organization | Formal structure | Companies, DAOs |
| Private Circle | Invite-only | Friends, Family |
| Ephemeral | Time-limited | Events, AMAs |
| Archive | Read-only | Historical records |

### 6.3 Zone Governance

#### 6.3.1 Governance Models

| Model | Description | Decision Making |
|-------|-------------|-----------------|
| Benevolent Dictator | Single owner decides | Unilateral |
| Council | Small group votes | Majority/Consensus |
| Democracy | All members vote | Majority |
| Reputation-weighted | Vote power by reputation | Weighted |
| Token-weighted | Vote power by stake | Weighted |
| Futarchy | Prediction markets | Market-based |

#### 6.3.2 Zone Splitting (Forks)

When consensus breaks down:

1. Any member can propose a fork
2. Members choose which zone to follow
3. Content history is preserved in both
4. New zone inherits no authority from old

### 6.4 Inter-Zone Relationships

| Relationship | Description |
|--------------|-------------|
| Federation | Content sharing agreement |
| Mirroring | One-way content sync |
| Bridge | Two-way content translation |
| Blocklist | Explicit content exclusion |
| Allowlist | Explicit content inclusion |

---

## 7. Feeds

RootlessNet defines **feed interfaces**, not feeds.

Characteristics:

* Client-side
* Subscribable
* Replaceable
* Forkable
* Composable

### 7.1 Feed Types

| Feed | Algorithm | Use Case |
|------|-----------|----------|
| Chronological | Time-ordered | Raw stream |
| Trust-weighted | WoT scored | Curated |
| Zone-local | Zone-filtered | Community |
| Firehose | Unfiltered | Developers |
| Algorithmic | ML-ranked | Engagement |
| Semantic | Topic-clustered | Research |
| Personalized | Preference-based | Daily use |

No feed is authoritative.

### 7.2 Feed Algorithm Interface

```typescript
interface FeedAlgorithm {
  name: string;
  version: string;
  description: string;
  
  // Core method
  rank(
    content: ContentObject[],
    context: UserContext
  ): RankedContent[];
  
  // Optional hooks
  preFilter?(content: ContentObject[]): ContentObject[];
  postProcess?(ranked: RankedContent[]): RankedContent[];
  
  // Transparency
  explainRanking(content: ContentObject): RankingExplanation;
}
```

### 7.3 Feed Composition

Feeds can be composed using operators:

| Operator | Description | Example |
|----------|-------------|---------|
| `UNION` | Combine feeds | Personal + News |
| `INTERSECT` | Common content | Friends ∩ Topic |
| `EXCLUDE` | Remove content | All - Blocked |
| `WEIGHT` | Score adjustment | Boost local |
| `LIMIT` | Restrict count | Top 100 |
| `DEDUPE` | Remove duplicates | Unique content |

### 7.4 Feed Subscriptions

```typescript
interface FeedSubscription {
  feedId: string;
  algorithm: string;
  sources: (ZoneID | DID)[];
  filters: ContentFilter[];
  updateFrequency: number;
  notifyOn: NotificationPolicy;
}
```

---

## 8. Moderation Model

Moderation is non-authoritative and local.

### 8.1 Moderation Actions

#### 8.1.1 Allowed Actions

| Action | Scope | Effect |
|--------|-------|--------|
| Hide | Local | User doesn't see |
| De-rank | Feed | Lower in ranking |
| Filter | Client | Excluded from view |
| Block | User | Ignore entirely |
| Mute | Temporary | Time-limited block |
| Flag | Network | Share assessment |
| Report | Zone | Moderator attention |

#### 8.1.2 Disallowed Actions

* Global deletion
* Silent erasure
* Identity termination
* Content modification
* Retroactive censorship

Moderation modifies **visibility**, not existence.

### 8.2 Moderation Layers

```
┌─────────────────────────────────────────┐
│           User Preferences              │  ← Personal filters
├─────────────────────────────────────────┤
│           Client Defaults               │  ← App-level settings
├─────────────────────────────────────────┤
│           Zone Moderation               │  ← Community rules
├─────────────────────────────────────────┤
│           Web of Trust                  │  ← Network reputation
├─────────────────────────────────────────┤
│           Protocol Layer                │  ← Spam/DoS only
└─────────────────────────────────────────┘
```

### 8.3 Reputation System

#### 8.3.1 Reputation Components

| Component | Weight | Decay |
|-----------|--------|-------|
| Content Quality | 40% | Slow |
| Engagement | 20% | Medium |
| Behavior | 25% | Fast |
| Vouching | 15% | None |

#### 8.3.2 Web of Trust (WoT)

```typescript
interface TrustRelation {
  truster: DID;
  trustee: DID;
  level: number;          // -100 to +100
  context?: string[];     // Specific domains
  expires?: number;
  signature: Signature;
}
```

#### 8.3.3 Reputation Calculation

```
UserReputation = Σ(TrustLevel × TrusterWeight × ContextRelevance × DecayFactor)
```

### 8.4 Automated Moderation

#### 8.4.1 Spam Prevention

| Mechanism | Description |
|-----------|-------------|
| Proof of Work | Computational cost |
| Rate Limiting | Frequency caps |
| Reputation Gating | Minimum score |
| Token Staking | Economic cost |
| CAPTCHA | Human verification |

#### 8.4.2 Content Classification

| Category | Action | Transparency |
|----------|--------|--------------|
| Spam | Auto-filter | Algorithm published |
| Malware | Block + warn | Hash-based |
| CSAM | Report + block | Hash database |
| Harassment | Flag for review | ML-assisted |

---

## 9. Messaging System

Private communication is separated from public speech.

### 9.1 Messaging Properties

* End-to-end encrypted
* Key-based addressing
* Optional ephemerality
* Rate-limited
* Forward secrecy
* Deniable authentication

Messaging logic never touches public content logic.

### 9.2 Message Types

| Type | Encryption | Persistence | Participants |
|------|-----------|-------------|--------------|
| Direct | E2E | Optional | 2 |
| Group | MLS | Optional | N |
| Broadcast | Asymmetric | No | 1-to-many |
| Ephemeral | E2E + Timer | Timed | Any |
| Sealed | Anonymous | Yes | 2 |

### 9.3 Message Schema

```typescript
interface Message {
  id: MessageID;
  type: MessageType;
  sender: DID;
  recipients: DID[];
  
  // Encrypted payload
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  
  // Metadata (may be encrypted)
  timestamp: number;
  replyTo?: MessageID;
  expiresAt?: number;
  
  // Cryptographic
  ephemeralKey?: PublicKey;
  signature: Signature;
}
```

### 9.4 Key Exchange Protocols

| Protocol | Use Case | Properties |
|----------|----------|------------|
| X3DH | Initial exchange | Forward secrecy |
| Double Ratchet | Ongoing comms | Self-healing keys |
| MLS | Large groups | Scalable |
| Noise XX | Mutual auth | Low latency |

### 9.5 Delivery Guarantees

| Guarantee | Implementation |
|-----------|---------------|
| At-least-once | Retry with ACK |
| Ordered | Sequence numbers |
| Offline delivery | Store-and-forward |
| Read receipts | Optional confirmation |

---

## 10. Transport & Storage

RootlessNet abstracts transport and storage.

### 10.1 Transport Protocols

| Protocol | Use Case | Properties |
|----------|----------|------------|
| libp2p | Default P2P | Multi-transport |
| Tor | Anonymous | Onion routing |
| I2P | Hidden services | Garlic routing |
| WebSocket | Browser | Firewall-friendly |
| WebRTC | Real-time | Direct P2P |
| QUIC | Low latency | Multiplexed |
| Noise | Secure channels | Encrypted |

### 10.2 Network Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                    Full Nodes (Validators)                       │
│         Complete history, DHT participation, relaying           │
├─────────────────────────────────────────────────────────────────┤
│                    Light Nodes (Users)                           │
│         Local content, selective sync, proof verification       │
├─────────────────────────────────────────────────────────────────┤
│                    Relay Nodes (Infrastructure)                  │
│         NAT traversal, offline delivery, bandwidth              │
├─────────────────────────────────────────────────────────────────┤
│                    Archive Nodes (Historians)                    │
│         Complete backups, historical access, redundancy         │
└─────────────────────────────────────────────────────────────────┘
```

### 10.3 Storage Backends

| Backend | Use Case | Trade-offs |
|---------|----------|------------|
| IPFS | Content addressing | Global, slow |
| Local SQLite | User data | Fast, single-device |
| Tor Hidden | Censorship resistance | Slow, anonymous |
| S3-compatible | Backups | Centralized |
| Filecoin | Incentivized storage | Paid, permanent |
| Arweave | Permanent storage | Paid, immutable |

### 10.4 Data Sync Protocol

```typescript
interface SyncProtocol {
  // Sync state
  getHead(): CID;
  getHistory(since: CID, until: CID): CID[];
  
  // Content retrieval
  getContent(cid: CID): ContentObject;
  getContentBatch(cids: CID[]): ContentObject[];
  
  // Real-time
  subscribe(filter: ContentFilter): AsyncIterable<ContentObject>;
  
  // Verification
  verifyInclusion(cid: CID): InclusionProof;
}
```

### 10.5 Discovery Mechanisms

| Mechanism | Description |
|-----------|-------------|
| DHT | Distributed hash table |
| mDNS | Local network discovery |
| Bootstrap | Known entry nodes |
| PEX | Peer exchange |
| DNS Seeds | Domain-based discovery |
| QR/NFC | Proximity sharing |

---

## 11. Security Architecture

### 11.1 Threat Model

#### 11.1.1 Adversary Capabilities

| Adversary | Capabilities | Mitigations |
|-----------|-------------|-------------|
| Passive Observer | Traffic analysis | Tor, padding, noise |
| Active Attacker | Message injection | Signatures, MACs |
| Network Adversary | Sybil attacks | PoW, reputation |
| Compromised Node | Data exposure | E2E encryption |
| State Actor | Legal compulsion | Decentralization |
| Malicious Client | Protocol abuse | Rate limits, proofs |

#### 11.1.2 Security Goals

| Goal | Priority | Implementation |
|------|----------|---------------|
| Confidentiality | P0 | E2E encryption |
| Integrity | P0 | Signatures, hashes |
| Availability | P0 | Redundancy, mesh |
| Authenticity | P0 | Public key crypto |
| Non-repudiation | P1 | Digital signatures |
| Forward Secrecy | P1 | Ratcheting |
| Anonymity | P2 | Onion routing |
| Unlinkability | P2 | ZKPs, mixnets |

### 11.2 Cryptographic Primitives

#### 11.2.1 Algorithms

| Purpose | Algorithm | Security Level |
|---------|-----------|----------------|
| Hashing | BLAKE3, SHA-256, SHA-3 | 256-bit |
| Signing | Ed25519, secp256k1 | 128-bit |
| Encryption | XChaCha20-Poly1305 | 256-bit |
| Key Exchange | X25519 | 128-bit |
| KDF | HKDF-SHA256, Argon2id | Variable |
| Random | CSPRNG (OS) | 256-bit |

#### 11.2.2 Post-Quantum Roadmap

| Algorithm | Purpose | Status |
|-----------|---------|--------|
| CRYSTALS-Kyber | Key exchange | Testing |
| CRYSTALS-Dilithium | Signatures | Testing |
| SPHINCS+ | Hash-based sigs | Backup |
| Hybrid schemes | Transition | Planned |

### 11.3 Authentication Protocols

#### 11.3.1 Challenge-Response

```
Client                          Server
  │                               │
  │──────── Hello + Nonce ───────►│
  │                               │
  │◄─────── Challenge + Nonce ────│
  │                               │
  │──────── Signature + Proof ───►│
  │                               │
  │◄─────── Session Token ────────│
```

#### 11.3.2 Session Management

| Property | Implementation |
|----------|---------------|
| Token format | JWT + signature |
| Lifetime | 24h default |
| Refresh | Sliding window |
| Revocation | Immediate, DHT |
| Multi-device | Device-specific keys |

### 11.4 Content Security

#### 11.4.1 Content Verification

```typescript
function verifyContent(obj: ContentObject): boolean {
  // 1. Verify signature
  if (!verifySignature(obj.author, obj.signature, obj)) {
    return false;
  }
  
  // 2. Verify content hash
  if (hash(obj.payload) !== obj.payloadHash) {
    return false;
  }
  
  // 3. Verify CID
  if (computeCID(obj) !== obj.id) {
    return false;
  }
  
  // 4. Verify timestamp (within tolerance)
  if (!isReasonableTime(obj.timestamp)) {
    return false;
  }
  
  return true;
}
```

#### 11.4.2 Payload Encryption

```
┌──────────────────────────────────────────────────┐
│                  Encrypted Payload                │
├──────────────────────────────────────────────────┤
│  Nonce (24 bytes)                                │
│  Ciphertext (variable)                           │
│  Authentication Tag (16 bytes)                   │
└──────────────────────────────────────────────────┘
```

### 11.5 Network Security

#### 11.5.1 DoS Mitigation

| Attack | Mitigation |
|--------|------------|
| Flood | Rate limiting per identity |
| Amplification | Response size limits |
| Sybil | Proof of work, reputation |
| Eclipse | Diverse peer selection |
| Slowloris | Connection timeouts |

#### 11.5.2 Traffic Analysis Resistance

| Technique | Description |
|-----------|-------------|
| Padding | Constant-size messages |
| Noise traffic | Dummy messages |
| Onion routing | Multi-hop encryption |
| Cover traffic | Continuous sending |
| Mixnets | Batch, delay, shuffle |

### 11.6 Privacy Protections

#### 11.6.1 Metadata Minimization

| Data Type | Protection |
|-----------|------------|
| IP Address | Tor, VPN, relay |
| Timing | Random delays |
| Message size | Padding |
| Contact graph | Encrypted headers |
| Read receipts | Optional, encrypted |

#### 11.6.2 Zero-Knowledge Proofs

| Proof Type | Use Case |
|------------|----------|
| Membership | Prove zone access |
| Range | Prove age/reputation threshold |
| Set membership | Prove attribute |
| Predicate | Prove computed condition |

---

## 12. API Specification

### 12.1 Core APIs

#### 12.1.1 Identity API

```typescript
interface IdentityAPI {
  // Creation
  createIdentity(config?: IdentityConfig): Promise<Identity>;
  importIdentity(backup: Uint8Array, passphrase: string): Promise<Identity>;
  
  // Management
  exportIdentity(id: DID, passphrase: string): Promise<Uint8Array>;
  rotateKeys(id: DID): Promise<void>;
  revokeKey(keyId: string): Promise<void>;
  
  // Proofs
  createProof(claim: Claim): Promise<Proof>;
  verifyProof(proof: Proof): Promise<boolean>;
  
  // Recovery
  setupRecovery(config: RecoveryConfig): Promise<void>;
  recoverIdentity(shares: Share[]): Promise<Identity>;
}
```

#### 12.1.2 Content API

```typescript
interface ContentAPI {
  // Creation
  create(content: ContentInput): Promise<ContentObject>;
  amend(original: CID, amendment: ContentInput): Promise<ContentObject>;
  
  // Retrieval
  get(cid: CID): Promise<ContentObject>;
  getBatch(cids: CID[]): Promise<ContentObject[]>;
  getThread(root: CID): Promise<ContentObject[]>;
  
  // Queries
  query(filter: ContentFilter): Promise<ContentObject[]>;
  search(query: SearchQuery): Promise<SearchResult[]>;
  
  // Actions
  hide(cid: CID): Promise<void>;
  pin(cid: CID): Promise<void>;
  unpin(cid: CID): Promise<void>;
}
```

#### 12.1.3 Zone API

```typescript
interface ZoneAPI {
  // Management
  create(config: ZoneConfig): Promise<Zone>;
  update(zoneId: ZoneID, updates: ZoneUpdate): Promise<void>;
  delete(zoneId: ZoneID): Promise<void>;
  
  // Membership
  join(zoneId: ZoneID): Promise<void>;
  leave(zoneId: ZoneID): Promise<void>;
  invite(zoneId: ZoneID, recipient: DID): Promise<Invitation>;
  
  // Discovery
  list(filter?: ZoneFilter): Promise<Zone[]>;
  search(query: string): Promise<Zone[]>;
  
  // Moderation
  setModerators(zoneId: ZoneID, mods: DID[]): Promise<void>;
  moderate(zoneId: ZoneID, action: ModerationAction): Promise<void>;
}
```

#### 12.1.4 Messaging API

```typescript
interface MessagingAPI {
  // Conversations
  startConversation(recipients: DID[]): Promise<Conversation>;
  getConversations(): Promise<Conversation[]>;
  
  // Messages
  send(convId: string, message: MessageInput): Promise<Message>;
  getMessages(convId: string, options?: PaginationOptions): Promise<Message[]>;
  
  // Real-time
  subscribe(convId: string): AsyncIterable<Message>;
  
  // Status
  markRead(convId: string, until: MessageID): Promise<void>;
  typing(convId: string, isTyping: boolean): Promise<void>;
}
```

### 12.2 Event System

```typescript
interface EventEmitter {
  // Core events
  on('content:new', handler: (content: ContentObject) => void): void;
  on('content:hidden', handler: (cid: CID) => void): void;
  on('message:received', handler: (message: Message) => void): void;
  on('identity:updated', handler: (did: DID) => void): void;
  on('zone:updated', handler: (zone: Zone) => void): void;
  on('peer:connected', handler: (peer: PeerInfo) => void): void;
  on('sync:progress', handler: (progress: SyncProgress) => void): void;
}
```

### 12.3 Plugin API

```typescript
interface PluginAPI {
  // Registration
  register(plugin: Plugin): void;
  unregister(pluginId: string): void;
  
  // Hooks
  addHook(event: string, handler: HookHandler): void;
  removeHook(hookId: string): void;
  
  // Storage
  getStorage(namespace: string): PluginStorage;
  
  // UI
  addMenuItem(item: MenuItem): void;
  addPanel(panel: PanelDefinition): void;
}
```

---

## 13. Client Implementation Guide

### 13.1 Minimum Client Requirements

| Requirement | Importance | Notes |
|-------------|------------|-------|
| Identity management | Required | Key generation, storage |
| Content signing | Required | Ed25519 signatures |
| Content verification | Required | Signature + hash checks |
| P2P networking | Required | At least one transport |
| Content encryption | Recommended | E2E for messages |
| Local storage | Recommended | Offline support |
| Zone support | Recommended | Community features |

### 13.2 Reference Client Features

```
┌─────────────────────────────────────────────────────────────────┐
│                    Desktop Client                                │
├─────────────────────────────────────────────────────────────────┤
│  ✓ Full identity management                                     │
│  ✓ All content types                                            │
│  ✓ Multiple transport protocols                                 │
│  ✓ Plugin support                                               │
│  ✓ Local-first storage                                          │
│  ✓ Multiple feed algorithms                                     │
├─────────────────────────────────────────────────────────────────┤
│                    Mobile Client                                 │
├─────────────────────────────────────────────────────────────────┤
│  ✓ Core identity features                                       │
│  ✓ Text and image content                                       │
│  ✓ WebSocket transport                                          │
│  ✓ Cached storage                                               │
│  ✓ Push notifications                                           │
├─────────────────────────────────────────────────────────────────┤
│                    Web Client                                    │
├─────────────────────────────────────────────────────────────────┤
│  ✓ Key management via extension                                 │
│  ✓ All content types                                            │
│  ✓ WebSocket + WebRTC                                           │
│  ✓ IndexedDB storage                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 13.3 Security Requirements for Clients

| Requirement | Implementation |
|-------------|---------------|
| Secure key storage | OS keychain, encrypted file |
| Memory protection | Zeroize sensitive data |
| Certificate pinning | For relay connections |
| Input validation | All user/network input |
| CSP | Web clients |
| Code signing | Desktop/mobile |

---

## 14. Open Source Strategy

### Phase 1: Foundation

* Publish protocol specification
* Release reference client (all platforms)
* Security audit by reputable firm
* Bug bounty program

### Phase 2: Ecosystem

* Encourage alternative clients
* Encourage feed experimentation
* Developer grants program
* Community governance formation

### Phase 3: Decentralization

* Withdraw central influence
* Transfer all assets to community
* Sunset official infrastructure
* Archive development history

The protocol must outlive its creators.

---

## 15. Minimal Viable Implementation (MVI)

The first implementation must prove:

* Identity portability
* Content persistence
* Client sovereignty

### Included

* Identity generation & export
* Signed posting
* Content encryption
* Zones (basic)
* Chronological feed
* Local filtering
* Direct messaging
* P2P sync

### Excluded

* Monetization
* Complex ranking algorithms
* Formal verification systems
* Legal compliance tools
* Analytics

---

## 16. Intentionally Unsolved Problems

RootlessNet leaves these open:

* Abuse mitigation at scale
* Legal and jurisdictional conflict
* Reputation economics
* Social collapse scenarios
* Content moderation consensus
* Incentive alignment
* Governance capture

Unsolved problems are surfaced as interfaces.

---

## 17. Protocol Extensions

### 17.1 Extension Registry

| Extension | Status | Description |
|-----------|--------|-------------|
| `ext-reactions` | Stable | Content reactions |
| `ext-polls` | Stable | Voting polls |
| `ext-payments` | Draft | Payment integration |
| `ext-nft` | Draft | NFT attachments |
| `ext-voice` | Experimental | Voice notes |
| `ext-video` | Experimental | Live video |
| `ext-calendar` | Proposed | Event scheduling |

### 17.2 Extension Interface

```typescript
interface Extension {
  id: string;
  version: string;
  dependencies: string[];
  
  // Lifecycle
  initialize(context: ExtensionContext): Promise<void>;
  shutdown(): Promise<void>;
  
  // Capabilities
  contentTypes?: ContentTypeHandler[];
  feedModifiers?: FeedModifier[];
  messageHandlers?: MessageHandler[];
}
```

---

## 18. Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first post | < 30s | New user |
| Post latency | < 500ms | Compose to visible |
| Message delivery | < 2s | Send to receive |
| Feed load | < 1s | 50 items |
| Sync time | < 5s | 1000 new items |
| Memory usage | < 200MB | Idle client |
| Battery impact | < 5%/hr | Active use |

---

## 19. Compliance & Legal

### 19.1 Design Principles

* No personally identifiable information stored by protocol
* User responsible for their data
* No single point of legal jurisdiction
* Transparency reports where applicable

### 19.2 Law Enforcement Cooperation

The protocol is designed such that:

* No single entity can comply with takedown requests
* Content can be hidden, not deleted
* User identity is self-sovereign
* Encryption keys are user-held

### 19.3 GDPR Considerations

| Right | Implementation |
|-------|---------------|
| Access | Users control their data |
| Erasure | Self-hiding, key deletion |
| Portability | Native export format |
| Rectification | Amendment objects |
| Object to processing | Client-side option |

---

## 20. What RootlessNet Is

* A protocol
* A substrate
* A public good
* A tool for human expression
* An alternative to platform capture

## 21. What RootlessNet Is Not

* A company
* A moderator
* A moral authority
* A safe space
* A solution to all problems

---

## 22. Glossary

| Term | Definition |
|------|------------|
| CID | Content Identifier - cryptographic hash of content |
| DID | Decentralized Identifier - self-sovereign identity |
| DHT | Distributed Hash Table - decentralized key-value store |
| E2E | End-to-End encryption |
| MLS | Message Layer Security - group encryption protocol |
| P2P | Peer-to-Peer networking |
| WoT | Web of Trust - reputation network |
| ZKP | Zero-Knowledge Proof |
| Zone | Social context container |

---

## 23. Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2024-12 | Major security enhancements |
| 1.5.0 | 2024-09 | Zone governance added |
| 1.0.0 | 2024-06 | Initial specification |
| 0.5.0 | 2024-03 | Beta release |
| 0.1.0 | 2024-01 | Alpha release |

---

## Final Note

RootlessNet does not claim to make speech safe.
It claims to make speech **hard to erase**.

Freedom in RootlessNet is not enforced.
It is **structural**.

The best censorship resistance is **invisibility to censors**.

---

*Document Version: 2.0.0*
*Last Updated: December 2024*
*Status: Active Development*
