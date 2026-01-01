<<<<<<< HEAD
# protocol
The main protocol for RootLess Network
=======
# RootlessNet

<p align="center">
  <strong>A rootless, ownerless substrate for human expression.</strong>
</p>

<p align="center">
  <em>Speech without roots. Power without owners.</em>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## What is RootlessNet?

RootlessNet is a **decentralized protocol** for censorship-resistant communication. It's not a platform, company, or product—it's infrastructure that makes human expression structurally resilient to control, capture, and silent erasure.

### Key Principles

- 🔑 **Self-Sovereign Identity** — You own your keys, you own your identity
- 📦 **Data Portability** — Take your content and audience anywhere
- 🌐 **No Central Authority** — No one can globally censor or control
- 🔒 **Privacy by Default** — End-to-end encryption for private communications
- 🏛️ **Local Moderation** — Communities choose their own rules
- 🔄 **Client Diversity** — Multiple clients, one protocol

---

## Features

### Identity
- Self-generated cryptographic identities
- Persistent pseudonyms or ephemeral presence
- Key rotation and recovery options
- Zero-knowledge proofs for attribute verification

### Content
- Signed, content-addressed posts
- Multi-format support (text, media, documents)
- Threaded conversations
- Optional encryption levels

### Zones (Communities)
- Create topic-focused spaces
- Flexible governance models
- Local moderation policies
- Federation between zones

### Messaging
- End-to-end encrypted direct messages
- Group messaging with forward secrecy
- Optional message expiration
- Anonymous sending option

### Network
- P2P mesh networking
- Multiple transport options
- Tor/I2P support for anonymity
- Offline-first design

---

## Quick Start

### Installation

```bash
# Using bun (recommended)
bun add @rootlessnet/sdk

# Install CLI globally
bun add -g @rootlessnet/cli
```

### Create Your Identity

```bash
rootless identity create
```

### Post Your First Content

```bash
rootless post "Hello, RootlessNet!"
```

### Start a Node

```bash
rootless node start
```

### SDK Usage

```typescript
import { RootlessNet } from '@rootlessnet/sdk';

const client = new RootlessNet();

// Create identity
const identity = await client.identity.create();

// Post content
const post = await client.content.create({
  type: 'text/plain',
  payload: 'Hello, decentralized world!',
});

// Send encrypted message
await client.messaging.send(recipientDid, {
  payload: 'Private message here',
});
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [CONTEXT.md](./CONTEXT.md) | Complete protocol specification and philosophy |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Technical architecture details |
| [docs/SECURITY.md](./docs/SECURITY.md) | Security model and threat analysis |
| [docs/PROTOCOL.md](./docs/PROTOCOL.md) | Wire protocol overview |
| [docs/PROTOCOL_SPEC.md](./docs/PROTOCOL_SPEC.md) | **Comprehensive protocol specification** |
| [docs/CRYPTO_SPEC.md](./docs/CRYPTO_SPEC.md) | **Cryptographic implementation requirements** |
| [docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) | Developer getting started guide |
| [docs/FAQ.md](./docs/FAQ.md) | Frequently asked questions |
| [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) | How to contribute |
| [docs/GOVERNANCE.md](./docs/GOVERNANCE.md) | Project governance |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
├─────────────────────────────────────────────────────────────┤
│                    Protocol Layer                            │
├─────────────────────────────────────────────────────────────┤
│   Identity   │   Content   │   Zones   │   Messaging        │
├─────────────────────────────────────────────────────────────┤
│                    Cryptographic Layer                       │
├─────────────────────────────────────────────────────────────┤
│   P2P Network   │   Relays   │   Storage   │   DHT         │
└─────────────────────────────────────────────────────────────┘
```

---

## Security

RootlessNet is designed with security as a core principle:

- **Signatures**: Ed25519 for all content signing
- **Encryption**: XChaCha20-Poly1305 for symmetric encryption
- **Key Exchange**: X25519 for asymmetric operations
- **Hashing**: BLAKE3 for content addressing
- **Forward Secrecy**: Double Ratchet for messages

See [SECURITY.md](./docs/SECURITY.md) for the complete threat model.

### Reporting Vulnerabilities

Please report security issues to: security@rootlessnet.org

---

## Roadmap

### Current (v2.0)
- ✅ Core protocol specification
- ✅ Identity system
- ✅ Content creation and sync
- ✅ Zone support
- ✅ E2E messaging

### Next (v2.1)
- 🔄 Post-quantum cryptography migration
- 🔄 Hardware wallet integration
- 🔄 Enhanced reputation system

### Future
- 📋 Cross-protocol bridges
- 📋 Mobile apps
- 📋 Incentive layer

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

```bash
# Clone the repository
git clone https://github.com/rootlessnet/protocol

# Install dependencies
bun install

# Run tests
bun test

# Start development
bun run dev
```

---

## Community

- 💬 [Discord](https://discord.gg/rootlessnet)
- 🐦 [Twitter](https://twitter.com/rootlessnet)
- 📧 [Mailing List](https://lists.rootlessnet.org)
- 📖 [Blog](https://blog.rootlessnet.org)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Speech is structural. Freedom is designed.</strong>
</p>

<p align="center">
  Made with ❤️ by the RootlessNet community
</p>
>>>>>>> source/main
