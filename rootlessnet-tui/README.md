# RootlessNet TUI

A beautiful terminal user interface (TUI) for the RootlessNet decentralized blockchain network protocol.

![RootlessNet TUI](https://img.shields.io/badge/TUI-Textual-blue)
![Python](https://img.shields.io/badge/Python-3.10+-green)
![Rust](https://img.shields.io/badge/Rust-2021-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

## Overview

RootlessNet TUI provides a stunning terminal interface for interacting with the RootlessNet decentralized protocol. Built with Python's [Textual](https://textual.textualize.io/) framework for the frontend and Rust for the cryptographic backend, it offers three main features:

1. **🔑 Identity Management** - Create and manage self-sovereign cryptographic identities
2. **📝 Post Content** - Create, sign, and verify content on the network
3. **💬 Send Messages** - End-to-end encrypted messaging with forward secrecy

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Python TUI Layer                          │
│                  (Textual Framework)                         │
├─────────────────────────────────────────────────────────────┤
│                    PyO3 Bindings                             │
├─────────────────────────────────────────────────────────────┤
│                    Rust Core Library                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Ed25519  │  X25519  │  XChaCha20-Poly1305  │ BLAKE3 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Identity Management
- **Self-sovereign identities** - Generate your own cryptographic identity
- **DID-based addressing** - Decentralized identifiers (`did:rootless:key:...`)
- **Export/Import** - Backup and restore your identity
- **Multiple identities** - Create as many identities as you need

### Content Creation
- **Cryptographic signing** - All content is signed with Ed25519
- **Content addressing** - CID-based immutable content identifiers
- **Signature verification** - Verify content authenticity
- **Rich text support** - Markdown content support

### Encrypted Messaging
- **X25519 key exchange** - Elliptic curve Diffie-Hellman
- **XChaCha20-Poly1305** - Modern authenticated encryption
- **Forward secrecy** - Each message uses ephemeral keys
- **End-to-end encryption** - Only sender and recipient can read

## Installation

### Prerequisites

- Python 3.10 or higher
- Rust 1.70 or higher (for building the Rust core)
- [Maturin](https://github.com/PyO3/maturin) (for Python-Rust bindings)

### Quick Start

```bash
# Navigate to the Python directory
cd rootlessnet-tui/python

# Install dependencies
pip install -e .

# Run the TUI
python -m rootlessnet_tui.main
```

### Building the Rust Core

```bash
# Navigate to the Rust directory
cd rootlessnet-tui/rust

# Build the library
cargo build --release

# Run tests
cargo test
```

### Building Python Bindings

```bash
# Install maturin
pip install maturin

# Build the Python extension
cd rootlessnet-tui/python
maturin develop
```

## Usage

### Running the TUI

```bash
# From the python directory
python -m rootlessnet_tui.main

# Or using the installed entry point
rootlessnet
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Open Identity Management |
| `2` | Open Post Content |
| `3` | Open Messaging |
| `q` | Quit application |
| `ESC` | Return to main menu |
| `c` | Create (context-sensitive) |
| `e` | Export |
| `s` | Send |

### Programmatic Usage

```python
from rootlessnet_tui import Identity, Content, Messaging

# Create an identity
alice = Identity.create("Alice")
print(f"DID: {alice.did}")

# Create and sign content
post = Content.create("Hello, RootlessNet!", alice)
print(f"CID: {post.cid}")
print(f"Valid: {post.verify()}")

# Create another identity for messaging
bob = Identity.create("Bob")

# Send encrypted message
encrypted = Messaging.encrypt("Secret message", alice, bob.public_key)
decrypted = Messaging.decrypt(encrypted, bob, alice.public_key)
print(f"Decrypted: {decrypted}")
```

## Security

### Cryptographic Primitives

| Operation | Algorithm | Security Level |
|-----------|-----------|----------------|
| Signatures | Ed25519 | 128-bit |
| Key Exchange | X25519 | 128-bit |
| Encryption | XChaCha20-Poly1305 | 256-bit |
| Hashing | BLAKE3 | 256-bit |
| Key Derivation | HKDF-SHA256 | Variable |

### Security Features

- **Zero-knowledge** - The system learns nothing about users
- **Forward secrecy** - Compromise of long-term keys doesn't affect past messages
- **Content integrity** - All content is cryptographically signed
- **Tamper detection** - Any modification invalidates signatures

## Development

### Running Tests

```bash
# Python tests
cd rootlessnet-tui/python
pytest tests/ -v

# Rust tests
cd rootlessnet-tui/rust
cargo test
```

### Code Style

```bash
# Python linting
ruff check .
mypy .

# Rust formatting
cargo fmt
cargo clippy
```

## Project Structure

```
rootlessnet-tui/
├── python/
│   ├── rootlessnet_tui/
│   │   ├── __init__.py      # Package exports
│   │   ├── app.py           # TUI application
│   │   ├── core.py          # Core classes
│   │   └── main.py          # Entry point
│   ├── tests/
│   │   └── test_core.py     # Unit tests
│   └── pyproject.toml       # Python config
│
└── rust/
    ├── src/
    │   ├── lib.rs           # Library root
    │   ├── crypto.rs        # Crypto primitives
    │   ├── identity.rs      # Identity management
    │   ├── content.rs       # Content handling
    │   └── messaging.rs     # E2E messaging
    └── Cargo.toml           # Rust config
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../docs/CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**RootlessNet** - *Speech without roots. Power without owners.*
