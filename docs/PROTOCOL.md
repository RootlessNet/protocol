# RootlessNet Protocol Specification

*Formal protocol specification for interoperability.*

---

## 1. Overview

This document provides an overview of the RootlessNet protocol for decentralized, censorship-resistant communication.

**Protocol Version:** 2.0.0  
**Status:** Draft Standard

### 1.1 Related Documents

| Document | Description |
|----------|-------------|
| [PROTOCOL_SPEC.md](./PROTOCOL_SPEC.md) | Complete protocol specification with all operations |
| [CRYPTO_SPEC.md](./CRYPTO_SPEC.md) | Cryptographic implementation requirements |
| [SECURITY.md](./SECURITY.md) | Threat model and security guarantees |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture overview |

---

## 2. Wire Format

### 2.1 Message Envelope

All protocol messages use this envelope:

```
┌────────────────────────────────────────┐
│  Magic Number (4 bytes): 0x524E4554    │
│  Version (2 bytes)                      │
│  Message Type (2 bytes)                 │
│  Length (4 bytes)                       │
│  Payload (variable)                     │
│  Checksum (4 bytes): CRC32             │
└────────────────────────────────────────┘
```

### 2.2 Message Types

| Type | Code | Description |
|------|------|-------------|
| HANDSHAKE | 0x0001 | Connection establishment |
| PING | 0x0002 | Keep-alive |
| PONG | 0x0003 | Keep-alive response |
| CONTENT | 0x0100 | Content object |
| CONTENT_REQUEST | 0x0101 | Request content by CID |
| SYNC | 0x0200 | Sync request/response |
| IDENTITY | 0x0300 | Identity announcement |
| MESSAGE | 0x0400 | Encrypted message |

---

## 3. Data Structures

### 3.1 Content Object

```
ContentObject {
  version: u8
  id: CID (var)
  author: DID (var)
  timestamp: i64
  zone: ZoneID (32 bytes)
  parent: CID? (var)
  content_type: string (var)
  payload_hash: Hash (32 bytes)
  payload: bytes (var)
  signature: Signature (64 bytes)
}
```

### 3.2 Identity

```
Identity {
  version: u8
  did: DID (var)
  public_key: PublicKey (32 bytes)
  created: i64
  key_type: u8
  metadata: bytes? (var)
  signature: Signature (64 bytes)
}
```

### 3.3 Zone

```
Zone {
  version: u8
  id: ZoneID (32 bytes)
  name: string (var)
  creator: DID (var)
  visibility: u8
  join_policy: u8
  config: bytes (var)
  created: i64
  signature: Signature (64 bytes)
}
```

---

## 4. Cryptographic Protocols

### 4.1 Required Algorithms

| Purpose | Algorithm | Parameters |
|---------|-----------|------------|
| Hashing | BLAKE3 | 256-bit output |
| Signing | Ed25519 | - |
| Encryption | XChaCha20-Poly1305 | 256-bit key |
| Key Exchange | X25519 | - |
| KDF | HKDF-SHA256 | - |

### 4.2 Content Signing

```
message = serialize(content)
hash = BLAKE3(message)
signature = Ed25519.sign(private_key, hash)
```

### 4.3 Key Derivation

```
shared_secret = X25519(private_key, peer_public_key)
encryption_key = HKDF(shared_secret, "rootless-encryption")
```

---

## 5. Network Protocols

### 5.1 Handshake

```
Client                          Server
  │                               │
  │──── HANDSHAKE(version) ──────►│
  │                               │
  │◄─── HANDSHAKE(version) ───────│
  │                               │
  │──── IDENTITY(proof) ─────────►│
  │                               │
  │◄─── IDENTITY(proof) ──────────│
  │                               │
  [Connection Established]
```

### 5.2 Sync Protocol

```
Client                          Server
  │                               │
  │──── SYNC_REQUEST(since) ─────►│
  │                               │
  │◄─── CONTENT[] ────────────────│
  │◄─── CONTENT[] ────────────────│
  │◄─── SYNC_COMPLETE ────────────│
```

### 5.3 Gossip

Content propagation uses epidemic gossip:
- Each node maintains peer list
- New content pushed to random subset
- TTL decrements each hop
- Deduplication via CID

---

## 6. Content Identifiers

### 6.1 CID Format

```
<multibase><version><codec><multihash>
```

| Field | Description |
|-------|-------------|
| multibase | Encoding (base58btc = 'z') |
| version | CID version (1) |
| codec | Content codec (raw = 0x55) |
| multihash | Hash function + digest |

### 6.2 DID Format

```
did:rootless:<method>:<identifier>
```

| Method | Description |
|--------|-------------|
| key | Direct public key |
| mesh | DHT-resolved |

---

## 7. Encryption Protocols

### 7.1 Message Encryption

```
plaintext = serialize(message)
nonce = random(24)
key = derive_key(sender_private, recipient_public)
ciphertext = XChaCha20Poly1305.encrypt(key, nonce, plaintext)
```

### 7.2 Group Encryption

Uses MLS (Message Layer Security) for group key management.

---

## 8. Error Codes

| Code | Name | Description |
|------|------|-------------|
| 0x0000 | OK | Success |
| 0x0001 | INVALID_SIGNATURE | Signature verification failed |
| 0x0002 | INVALID_CID | Content not found |
| 0x0003 | RATE_LIMITED | Too many requests |
| 0x0004 | UNAUTHORIZED | Access denied |
| 0x0005 | INVALID_FORMAT | Malformed message |

---

## 9. Extensibility

### 9.1 Extension Registry

Extensions use the `extensions` field in content objects:

```json
{
  "extensions": {
    "ext-reactions": { "emoji": "👍" },
    "ext-poll": { "options": ["A", "B"] }
  }
}
```

### 9.2 Reserved Extension IDs

| ID | Purpose |
|----|---------|
| ext-reactions | Content reactions |
| ext-poll | Voting polls |
| ext-payment | Payment metadata |

---

## 10. Conformance

### 10.1 Compliance Levels

| Level | Requirements |
|-------|-------------|
| Basic | Content signing, verification |
| Standard | + Zones, sync protocol |
| Full | + Messaging, all transports |

### 10.2 Test Vectors

Test vectors available at: `tests/vectors/`

---

*Protocol Version: 2.0.0 | Last Updated: December 2024*
