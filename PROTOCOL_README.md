# RootlessNet Protocol

> A rootless, ownerless substrate for human expression

[![Tests](https://img.shields.io/badge/tests-31%20passing-brightgreen)](./packages)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## Overview

RootlessNet is a decentralized communication protocol designed for censorship-resistant expression. This repository contains the complete TypeScript implementation of the protocol, including cryptographic primitives, identity management, content handling, and end-to-end encrypted messaging.

## Features

- 🔐 **End-to-End Encryption** - All content and messages are encrypted by default
- 🆔 **Self-Sovereign Identity** - Users own their cryptographic identity (DID-based)
- 📝 **Content Addressing** - Immutable content with CID-based addressing
- 💬 **Forward-Secret Messaging** - Signal protocol (X3DH + Double Ratchet)
- 🌐 **Decentralized** - No central authority or single point of failure
- 🔓 **Open Source** - Fully transparent and auditable

## Quick Start

### Installation

```bash
# Using bun (recommended)
bun install

# Run tests
bun test

# Build all packages
bun run build
```

### Usage

```typescript
import { RootlessNet } from '@rootlessnet/sdk';

// Create a new client
const client = new RootlessNet();

// Create your identity
const identity = await client.createIdentity();
console.log('Your DID:', identity.did);

// Post content
const post = await client.post('Hello, RootlessNet!');

// Verify content authenticity
const isValid = await client.verifyContent(post);
```

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [@rootlessnet/crypto](./packages/crypto) | Cryptographic primitives (Ed25519, X25519, XChaCha20-Poly1305, BLAKE3) | 2.0.0 |
| [@rootlessnet/identity](./packages/identity) | Identity creation, verification, and management | 2.0.0 |
| [@rootlessnet/content](./packages/content) | Content creation, signing, and verification | 2.0.0 |
| [@rootlessnet/messaging](./packages/messaging) | E2E encrypted messaging (X3DH, Double Ratchet) | 2.0.0 |
| [@rootlessnet/sdk](./packages/sdk) | Complete SDK combining all packages | 2.0.0 |

## Documentation

| Document | Description |
|----------|-------------|
| [CONTEXT.md](./CONTEXT.md) | Complete protocol specification and philosophy |
| [docs/PROTOCOL_SPEC.md](./docs/PROTOCOL_SPEC.md) | **Comprehensive protocol specification** |
| [docs/CRYPTO_SPEC.md](./docs/CRYPTO_SPEC.md) | **Cryptographic implementation requirements** |
| [docs/SECURITY.md](./docs/SECURITY.md) | Security model and threat analysis |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Technical architecture details |
| [docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) | Developer getting started guide |
| [docs/FAQ.md](./docs/FAQ.md) | Frequently asked questions |

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Application                     │
├─────────────────────────────────────────────────┤
│                   SDK Layer                      │
│  ┌──────────┬──────────┬──────────┬──────────┐ │
│  │ Identity │ Content  │Messaging │  Zones   │ │
│  └──────────┴──────────┴──────────┴──────────┘ │
├─────────────────────────────────────────────────┤
│              Cryptographic Layer                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Ed25519 │ X25519 │ XChaCha20-Poly1305  │  │
│  │  BLAKE3  │  HKDF  │   CID/DID Support   │  │
│  └──────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│              Network/Transport                   │
│         (P2P, DHT, mDNS, WebRTC)                │
└─────────────────────────────────────────────────┘
```

## Security

RootlessNet implements state-of-the-art cryptographic protocols:

- **Signatures**: Ed25519 (128-bit security)
- **Key Exchange**: X25519 ECDH
- **Encryption**: XChaCha20-Poly1305 AEAD
- **Hashing**: BLAKE3
- **Key Derivation**: HKDF-SHA256
- **Password KDF**: Argon2id-like construction
- **Messaging**: Signal Protocol (X3DH + Double Ratchet)

All cryptographic operations use constant-time implementations to prevent timing attacks.

## Testing

```bash
# Run all tests
bun test

# Run tests for specific package
cd packages/crypto && bun test
cd packages/sdk && bun test
```

**Test Results**: ✅ 31 tests passing, 51 assertions

## Development

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- TypeScript >= 5.6

### Project Structure

```
RootlessNet/
├── packages/
│   ├── crypto/          # Core cryptographic primitives
│   ├── identity/        # Identity management
│   ├── content/         # Content protocol
│   ├── messaging/       # E2E encrypted messaging
│   └── sdk/             # Complete SDK
├── docs/                # Documentation
├── package.json         # Root workspace config
└── tsconfig.json        # TypeScript configuration
```

### Building

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Type check
bun run typecheck

# Lint
bun run lint
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## Governance

This project follows a community-driven governance model. See [GOVERNANCE.md](./docs/GOVERNANCE.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Links

- **Website**: https://rootlessnet.org (coming soon)
- **Documentation**: [docs/](./docs)
- **GitHub**: https://github.com/RootlessNet/protocol
- **Community**: (coming soon)

## Acknowledgments

Built with modern cryptographic libraries:
- [@noble/curves](https://github.com/paulmillr/noble-curves) - Ed25519, X25519
- [@noble/ciphers](https://github.com/paulmillr/noble-ciphers) - XChaCha20-Poly1305
- [@noble/hashes](https://github.com/paulmillr/noble-hashes) - BLAKE3, SHA-256
- [multiformats](https://github.com/multiformats/js-multiformats) - CID support

---

**Status**: ✅ Protocol v2.0.0 - Implementation Complete

*A protocol for the people, by the people.*
