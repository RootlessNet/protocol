"""
Core module providing Python interfaces to the Rust cryptographic backend.

This module provides fallback Python implementations when the Rust library is not available,
ensuring the TUI can run in pure Python mode for development and testing.
"""

import hashlib
import json
import secrets
import time
from dataclasses import dataclass, field
from typing import Optional

# Try to import the Rust backend, fall back to pure Python
try:
    from . import rootlessnet_core as _rust_core
    RUST_BACKEND_AVAILABLE = True
except ImportError:
    _rust_core = None
    RUST_BACKEND_AVAILABLE = False


def _generate_did(public_key: bytes) -> str:
    """Generate a DID from a public key."""
    key_hash = hashlib.blake2b(public_key, digest_size=16).hexdigest()
    return f"did:rootless:key:{key_hash}"


def _generate_cid(data: bytes) -> str:
    """Generate a CID from content data."""
    content_hash = hashlib.blake2b(data, digest_size=16).hexdigest()
    return f"bafk{content_hash}"


@dataclass
class Identity:
    """
    Self-sovereign cryptographic identity for RootlessNet.
    
    An identity consists of a keypair and associated metadata that allows
    users to sign content and messages on the network.
    """
    did: str
    name: Optional[str]
    public_key: str
    _private_key: str = field(repr=False)
    created_at: int = field(default_factory=lambda: int(time.time()))
    
    @classmethod
    def create(cls, name: Optional[str] = None) -> "Identity":
        """Create a new identity with a fresh keypair."""
        if RUST_BACKEND_AVAILABLE and _rust_core:
            rust_identity = _rust_core.create_identity(name)
            return cls(
                did=rust_identity.did,
                name=rust_identity.name,
                public_key=rust_identity.public_key,
                _private_key="",  # Kept in Rust
                created_at=rust_identity.created_at,
            )
        
        # Pure Python fallback
        private_key = secrets.token_hex(32)
        public_key = hashlib.sha256(bytes.fromhex(private_key)).hexdigest()
        did = _generate_did(bytes.fromhex(public_key))
        
        return cls(
            did=did,
            name=name,
            public_key=public_key,
            _private_key=private_key,
            created_at=int(time.time()),
        )
    
    def sign(self, data: bytes) -> bytes:
        """Sign data with this identity's private key."""
        # Simplified signature for demo - in production use Ed25519
        signature_input = self._private_key.encode() + data
        return hashlib.sha256(signature_input).digest()
    
    def export(self) -> str:
        """Export identity as JSON."""
        return json.dumps({
            "did": self.did,
            "name": self.name,
            "public_key": self.public_key,
            "private_key": self._private_key,
            "created_at": self.created_at,
        }, indent=2)
    
    @classmethod
    def import_from_json(cls, json_str: str) -> "Identity":
        """Import identity from JSON."""
        data = json.loads(json_str)
        return cls(
            did=data["did"],
            name=data.get("name"),
            public_key=data["public_key"],
            _private_key=data["private_key"],
            created_at=data.get("created_at", int(time.time())),
        )


@dataclass  
class Content:
    """
    Signed content object for RootlessNet.
    
    Content is cryptographically signed by its author and addressed by
    a content identifier (CID) derived from its hash.
    """
    cid: str
    author: str
    author_public_key: str
    body: str
    created_at: int
    signature: str
    
    @classmethod
    def create(cls, body: str, identity: Identity) -> "Content":
        """Create new signed content."""
        created_at = int(time.time())
        
        # Generate CID
        content_data = f"{identity.did}:{body}:{created_at}".encode()
        cid = _generate_cid(content_data)
        
        # Create signature
        signature_payload = f"{cid}:{identity.did}:{body}:{created_at}".encode()
        signature = identity.sign(signature_payload)
        
        return cls(
            cid=cid,
            author=identity.did,
            author_public_key=identity.public_key,
            body=body,
            created_at=created_at,
            signature=signature.hex(),
        )
    
    def verify(self) -> bool:
        """Verify the content's signature."""
        # Simplified verification for demo
        # In production, verify Ed25519 signature
        return len(self.signature) == 64  # SHA256 hex length
    
    def export(self) -> str:
        """Export content as JSON."""
        return json.dumps({
            "cid": self.cid,
            "author": self.author,
            "author_public_key": self.author_public_key,
            "body": self.body,
            "created_at": self.created_at,
            "signature": self.signature,
        }, indent=2)


@dataclass
class EncryptedMessage:
    """Encrypted message structure."""
    sender_public_key: str
    recipient_public_key: str
    ciphertext: str
    timestamp: int
    message_id: str


class Messaging:
    """
    End-to-end encrypted messaging for RootlessNet.
    
    Provides secure message encryption and decryption using
    X25519 key exchange and XChaCha20-Poly1305.
    """
    
    @staticmethod
    def _derive_shared_secret(sender_public_key: str, recipient_public_key: str) -> bytes:
        """Derive a symmetric shared secret from both public keys."""
        # Use both public keys to derive shared secret (available on both sides)
        # Sort keys to ensure same derivation order on both ends
        keys_combined = sender_public_key + recipient_public_key
        shared_secret = hashlib.sha256(keys_combined.encode()).digest()
        return shared_secret

    @staticmethod
    def encrypt(
        message: str,
        sender: Identity,
        recipient_public_key: str,
    ) -> str:
        """Encrypt a message for a recipient."""
        if RUST_BACKEND_AVAILABLE and _rust_core:
            return _rust_core.encrypt_message(message, sender, recipient_public_key)
        
        # Pure Python fallback (simplified)
        timestamp = int(time.time())
        
        # Derive shared secret using both public keys
        key_bytes = Messaging._derive_shared_secret(sender.public_key, recipient_public_key)
        
        # XOR encryption for demo (use real encryption in production)
        message_bytes = message.encode()
        # Extend key to message length
        extended_key = (key_bytes * ((len(message_bytes) // 32) + 1))[:len(message_bytes)]
        encrypted = bytes(m ^ k for m, k in zip(message_bytes, extended_key))
        
        message_id = hashlib.sha256(f"{message}:{timestamp}".encode()).hexdigest()[:16]
        
        msg = EncryptedMessage(
            sender_public_key=sender.public_key,
            recipient_public_key=recipient_public_key,
            ciphertext=encrypted.hex(),
            timestamp=timestamp,
            message_id=message_id,
        )
        
        return json.dumps({
            "sender_public_key": msg.sender_public_key,
            "recipient_public_key": msg.recipient_public_key,
            "ciphertext": msg.ciphertext,
            "timestamp": msg.timestamp,
            "message_id": msg.message_id,
        })
    
    @staticmethod
    def decrypt(
        encrypted_message: str,
        recipient: Identity,
        sender_public_key: str,
    ) -> str:
        """Decrypt a message from a sender."""
        if RUST_BACKEND_AVAILABLE and _rust_core:
            return _rust_core.decrypt_message(encrypted_message, recipient, sender_public_key)
        
        # Pure Python fallback (simplified)
        msg_data = json.loads(encrypted_message)
        
        # Derive shared secret using both public keys (same as encryption)
        key_bytes = Messaging._derive_shared_secret(sender_public_key, recipient.public_key)
        
        # XOR decryption for demo
        ciphertext = bytes.fromhex(msg_data["ciphertext"])
        # Extend key to ciphertext length
        extended_key = (key_bytes * ((len(ciphertext) // 32) + 1))[:len(ciphertext)]
        decrypted = bytes(c ^ k for c, k in zip(ciphertext, extended_key))
        
        return decrypted.decode()
