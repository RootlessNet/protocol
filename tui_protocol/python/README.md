# RootlessNet TUI Protocol

A beautiful terminal user interface for the RootlessNet decentralized Tor blockchain network protocol.

## Features

- 🆕 **New**: Upload videos, pictures, text, and files to the decentralized network
- 👁️ **View**: Browse users, posts, and content by public key
- ⚙️ **Settings**: Customize your experience

## Installation

```bash
pip install -e .
```

## Usage

```bash
rootlessnet
```

## Account System

RootlessNet uses a Bitcoin-like identity system:
- **Public Key**: ~100+ character identifier (alphanumeric + $-#) visible to everyone
- **Private Key**: 100 random words from a 4000-word list (keep this secret!)

## Architecture

- **Python TUI**: Beautiful terminal interface using Textual
- **Rust Core**: Cryptographic operations and blockchain logic
- **Tor Network**: Privacy-preserving decentralized communication
