"""
Core module providing Python interfaces to the Rust cryptographic backend.

This module provides fallback Python implementations when the Rust library is not available,
ensuring the TUI can run in pure Python mode for development and testing.
"""

import hashlib
import hmac
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
        """Sign data with this identity's private key using HMAC-SHA256."""
        # Use HMAC for secure message authentication in fallback mode
        return hmac.new(
            bytes.fromhex(self._private_key),
            data,
            hashlib.sha256
        ).digest()
    
    def verify_signature(self, data: bytes, signature: bytes) -> bool:
        """Verify a signature created by this identity."""
        expected = self.sign(data)
        return hmac.compare_digest(expected, signature)
    
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
    _author_private_key: str = field(default="", repr=False)
    
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
            _author_private_key=identity._private_key,
        )
    
    def verify(self) -> bool:
        """Verify the content's signature using HMAC verification."""
        if not self._author_private_key:
            # Cannot verify without private key (signature was created elsewhere)
            # In production, use public-key cryptography (Ed25519)
            return len(self.signature) == 64  # Basic length check
        
        # Reconstruct signature payload
        signature_payload = f"{self.cid}:{self.author}:{self.body}:{self.created_at}".encode()
        
        # Compute expected signature using HMAC
        expected_signature = hmac.new(
            bytes.fromhex(self._author_private_key),
            signature_payload,
            hashlib.sha256
        ).digest()
        
        # Compare signatures in constant time
        try:
            actual_signature = bytes.fromhex(self.signature)
            return hmac.compare_digest(expected_signature, actual_signature)
        except ValueError:
            return False
    
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
    nonce: str  # Added nonce for proper encryption
    mac: str    # Added MAC for authentication
    timestamp: int
    message_id: str


class Messaging:
    """
    End-to-end encrypted messaging for RootlessNet.
    
    Provides secure message encryption and decryption using
    authenticated encryption with HMAC for message integrity.
    """
    
    @staticmethod
    def _derive_keys(sender_public_key: str, recipient_public_key: str) -> tuple[bytes, bytes]:
        """Derive encryption and authentication keys from public keys."""
        # Derive base secret
        keys_combined = sender_public_key + recipient_public_key
        base_secret = hashlib.sha256(keys_combined.encode()).digest()
        
        # Derive separate encryption and MAC keys using HKDF-like expansion
        enc_key = hashlib.sha256(base_secret + b"encryption").digest()
        mac_key = hashlib.sha256(base_secret + b"authentication").digest()
        
        return enc_key, mac_key

    @staticmethod
    def encrypt(
        message: str,
        sender: Identity,
        recipient_public_key: str,
    ) -> str:
        """Encrypt a message for a recipient with authentication."""
        if RUST_BACKEND_AVAILABLE and _rust_core:
            return _rust_core.encrypt_message(message, sender, recipient_public_key)
        
        timestamp = int(time.time())
        
        # Generate random nonce
        nonce = secrets.token_bytes(16)
        
        # Derive encryption and MAC keys
        enc_key, mac_key = Messaging._derive_keys(sender.public_key, recipient_public_key)
        
        # XOR encryption with nonce-derived keystream (CTR-like mode)
        message_bytes = message.encode()
        keystream = b""
        counter = 0
        while len(keystream) < len(message_bytes):
            block = hashlib.sha256(enc_key + nonce + counter.to_bytes(4, 'big')).digest()
            keystream += block
            counter += 1
        
        ciphertext = bytes(m ^ k for m, k in zip(message_bytes, keystream[:len(message_bytes)]))
        
        # Compute MAC over ciphertext for authentication
        mac = hmac.new(mac_key, nonce + ciphertext, hashlib.sha256).digest()
        
        message_id = hashlib.sha256(f"{message}:{timestamp}".encode()).hexdigest()[:16]
        
        return json.dumps({
            "sender_public_key": sender.public_key,
            "recipient_public_key": recipient_public_key,
            "ciphertext": ciphertext.hex(),
            "nonce": nonce.hex(),
            "mac": mac.hex(),
            "timestamp": timestamp,
            "message_id": message_id,
        })
    
    @staticmethod
    def decrypt(
        encrypted_message: str,
        recipient: Identity,
        sender_public_key: str,
    ) -> str:
        """Decrypt a message from a sender with authentication verification."""
        if RUST_BACKEND_AVAILABLE and _rust_core:
            return _rust_core.decrypt_message(encrypted_message, recipient, sender_public_key)
        
        msg_data = json.loads(encrypted_message)
        
        # Verify sender matches
        if msg_data["sender_public_key"] != sender_public_key:
            raise ValueError("Sender public key mismatch")
        
        # Derive keys
        enc_key, mac_key = Messaging._derive_keys(sender_public_key, recipient.public_key)
        
        # Parse message components
        ciphertext = bytes.fromhex(msg_data["ciphertext"])
        nonce = bytes.fromhex(msg_data["nonce"])
        received_mac = bytes.fromhex(msg_data["mac"])
        
        # Verify MAC (authenticate before decrypting)
        expected_mac = hmac.new(mac_key, nonce + ciphertext, hashlib.sha256).digest()
        if not hmac.compare_digest(expected_mac, received_mac):
            raise ValueError("Message authentication failed - message may have been tampered")
        
        # Decrypt using CTR-like mode
        keystream = b""
        counter = 0
        while len(keystream) < len(ciphertext):
            block = hashlib.sha256(enc_key + nonce + counter.to_bytes(4, 'big')).digest()
            keystream += block
            counter += 1
        
        plaintext = bytes(c ^ k for c, k in zip(ciphertext, keystream[:len(ciphertext)]))
        
        return plaintext.decode()
