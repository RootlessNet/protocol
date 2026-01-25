# RootlessNet TUI Protocol

A **beautiful Terminal User Interface** for the RootlessNet decentralized Tor blockchain network, written in **Python** and **Rust**.

## Features

### 🌐 Main Menu Options

1. **🆕 New** - Upload content to the decentralized network
   - 📹 Upload Video
   - 🖼️ Upload Picture  
   - 📝 Upload Text
   - 📁 Upload File

2. **👁️ View** - Browse the network
   - View content by public key
   - Search posts by ID or title
   - Browse all posts in the blockchain

3. **⚙️ Settings** - Customize your experience
   - Export/Import identity
   - View private key
   - Reset blockchain

## Architecture

```
tui_protocol/
├── python/              # Python TUI Application
│   ├── rootlessnet/     # Main package
│   │   ├── main.py      # TUI application (Textual)
│   │   ├── identity.py  # User identity management
│   │   ├── blockchain.py # Blockchain implementation
│   │   ├── content.py   # Content types
│   │   └── wordlist.py  # 4000-word mnemonic list
│   └── pyproject.toml   # Python package config
│
└── rust/                # Rust Core Library
    ├── src/
    │   ├── lib.rs       # Library root
    │   ├── identity.rs  # Crypto identity
    │   ├── blockchain.rs # Blockchain core
    │   ├── content.rs   # Content types
    │   ├── crypto.rs    # Crypto utilities
    │   └── wordlist.rs  # Mnemonic wordlist
    └── Cargo.toml       # Rust package config
```

## User Account System

RootlessNet uses a **Bitcoin-like identity system**:

### Public Key
- ~100+ characters long
- Contains: letters (A-Z, a-z), numbers (0-9), and symbols ($, -, #)
- Visible to everyone as your username

### Private Key  
- 100 random words from a 4000-word list
- **Keep this secret!** Anyone with your private key controls your identity
- Similar to a Bitcoin seed phrase

## Quick Start

### Installation

```bash
cd tui_protocol/python
pip install -e .
```

### Run the TUI

```bash
rootlessnet
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | Open New content menu |
| `V` | Open View screen |
| `S` | Open Settings |
| `Q` | Quit application |
| `Escape` | Cancel/Go back |

## Blockchain Features

- **Proof of Work**: Simple PoW mining for each block
- **Cryptographic Signing**: All content is signed with Ed25519
- **Content Addressing**: Each piece of content has a unique hash ID
- **Chain Validation**: Full blockchain integrity verification

## Security

- **Ed25519** signatures for identity
- **ChaCha20-Poly1305** encryption for identity export
- **Scrypt** key derivation for password-based encryption
- **SHA-256** hashing for blockchain

## Tor Network Integration

The protocol is designed for Tor network integration:
- Anonymous content publishing
- Privacy-preserving communication
- Decentralized storage

## Technology Stack

### Python
- **Textual**: Beautiful TUI framework
- **Rich**: Terminal formatting
- **PyNaCl**: Cryptographic primitives
- **Cryptography**: Additional crypto utilities

### Rust
- **ed25519-dalek**: Ed25519 signatures
- **chacha20poly1305**: AEAD encryption
- **blake3**: Fast hashing
- **pyo3**: Python bindings
- **serde**: Serialization

## Development

### Build Rust Library

```bash
cd tui_protocol/rust
cargo build --release
```

### Run Tests

```bash
# Rust tests
cd tui_protocol/rust
cargo test

# Python tests
cd tui_protocol/python
pytest
```

## License

MIT License - See [LICENSE](../LICENSE) for details.
