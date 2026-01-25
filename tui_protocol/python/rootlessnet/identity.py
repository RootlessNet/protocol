"""
Identity Module
Bitcoin-like identity system with public/private keys
"""

import secrets
import hashlib
import json
from datetime import datetime
from typing import Optional
from dataclasses import dataclass, field

from nacl.signing import SigningKey, VerifyKey
from nacl.encoding import HexEncoder
from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt

from .wordlist import WORDLIST

# Characters allowed in public keys
PUBLIC_KEY_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$-#"


@dataclass
class UserIdentity:
    """
    User Identity with public and private keys.
    
    The public key is a ~100+ character string visible to everyone.
    The private key is 100 random words from a 4000-word list (mnemonic).
    """
    
    public_key: str
    private_key: str
    signing_key_bytes: bytes
    verifying_key_bytes: bytes
    created_at: int = field(default_factory=lambda: int(datetime.now().timestamp()))
    
    @classmethod
    def new(cls) -> "UserIdentity":
        """Create a new random identity."""
        # Generate Ed25519 keypair for actual crypto operations
        signing_key = SigningKey.generate()
        verifying_key = signing_key.verify_key
        
        # Generate public key string (~100+ chars with alphanumeric + $-#)
        public_key = _generate_public_key_string(verifying_key.encode())
        
        # Generate private key as 100 random words from wordlist
        private_key = _generate_mnemonic_key()
        
        return cls(
            public_key=public_key,
            private_key=private_key,
            signing_key_bytes=bytes(signing_key),
            verifying_key_bytes=bytes(verifying_key),
            created_at=int(datetime.now().timestamp()),
        )
    
    def sign(self, data: bytes) -> bytes:
        """Sign data with private key."""
        signing_key = SigningKey(self.signing_key_bytes)
        return signing_key.sign(data).signature
    
    def to_json(self) -> str:
        """Get identity info as JSON string."""
        return json.dumps({
            "public_key": self.public_key,
            "private_key": self.private_key,
            "signing_key_bytes": self.signing_key_bytes.hex(),
            "verifying_key_bytes": self.verifying_key_bytes.hex(),
            "created_at": self.created_at,
        }, indent=2)
    
    @classmethod
    def from_json(cls, json_str: str) -> "UserIdentity":
        """Create identity from JSON string."""
        data = json.loads(json_str)
        return cls(
            public_key=data["public_key"],
            private_key=data["private_key"],
            signing_key_bytes=bytes.fromhex(data["signing_key_bytes"]),
            verifying_key_bytes=bytes.fromhex(data["verifying_key_bytes"]),
            created_at=data["created_at"],
        )
    
    def public_info(self) -> str:
        """Get public-only identity info (safe to share)."""
        dt = datetime.fromtimestamp(self.created_at)
        return f"Public Key: {self.public_key}\nCreated: {dt.strftime('%Y-%m-%d %H:%M:%S UTC')}"
    
    def export_encrypted(self, password: str) -> str:
        """Export identity to encrypted backup (returns hex string)."""
        # Derive key from password using Scrypt
        salt = secrets.token_bytes(16)
        kdf = Scrypt(salt=salt, length=32, n=2**14, r=8, p=1)
        key = kdf.derive(password.encode())
        
        # Encrypt
        cipher = ChaCha20Poly1305(key)
        nonce = secrets.token_bytes(12)
        data = self.to_json().encode()
        ciphertext = cipher.encrypt(nonce, data, None)
        
        # Return salt + nonce + ciphertext as hex
        return (salt + nonce + ciphertext).hex()
    
    @classmethod
    def import_encrypted(cls, encrypted_hex: str, password: str) -> "UserIdentity":
        """Import identity from encrypted backup."""
        data = bytes.fromhex(encrypted_hex)
        
        # Extract salt, nonce, ciphertext
        salt = data[:16]
        nonce = data[16:28]
        ciphertext = data[28:]
        
        # Derive key
        kdf = Scrypt(salt=salt, length=32, n=2**14, r=8, p=1)
        key = kdf.derive(password.encode())
        
        # Decrypt
        cipher = ChaCha20Poly1305(key)
        plaintext = cipher.decrypt(nonce, ciphertext, None)
        
        return cls.from_json(plaintext.decode())


def _generate_public_key_string(verifying_key_bytes: bytes) -> str:
    """Generate a public key string with ~100+ characters."""
    # Start with hex-encoded verifying key (64 chars)
    result = verifying_key_bytes.hex()
    
    # Add random characters to reach ~100+ chars with allowed symbols
    while len(result) < 100:
        idx = secrets.randbelow(len(PUBLIC_KEY_CHARS))
        result += PUBLIC_KEY_CHARS[idx]
    
    # Add a few more for variability
    extra = secrets.randbelow(15) + 5
    for _ in range(extra):
        idx = secrets.randbelow(len(PUBLIC_KEY_CHARS))
        result += PUBLIC_KEY_CHARS[idx]
    
    return result


def _generate_mnemonic_key() -> str:
    """Generate mnemonic private key (100 random words from 4000-word list)."""
    words = []
    for _ in range(100):
        idx = secrets.randbelow(len(WORDLIST))
        words.append(WORDLIST[idx])
    return " ".join(words)


def generate_identity() -> UserIdentity:
    """Generate a new identity (convenience function)."""
    return UserIdentity.new()


def verify_signature(verifying_key_bytes: bytes, data: bytes, signature: bytes) -> bool:
    """Verify a signature with a public key."""
    try:
        verify_key = VerifyKey(verifying_key_bytes)
        verify_key.verify(data, signature)
        return True
    except Exception:
        return False
