"""
Tests for RootlessNet TUI core module.
"""

import pytest
from rootlessnet_tui.core import Identity, Content, Messaging


class TestIdentity:
    """Tests for Identity class."""
    
    def test_create_identity_without_name(self):
        """Test creating an anonymous identity."""
        identity = Identity.create()
        
        assert identity.did.startswith("did:rootless:key:")
        assert identity.name is None
        assert len(identity.public_key) == 64  # hex encoded 32 bytes
        assert identity.created_at > 0
    
    def test_create_identity_with_name(self):
        """Test creating a named identity."""
        identity = Identity.create("Alice")
        
        assert identity.did.startswith("did:rootless:key:")
        assert identity.name == "Alice"
    
    def test_identity_sign(self):
        """Test signing data with identity."""
        identity = Identity.create("Test")
        data = b"Hello, World!"
        
        signature = identity.sign(data)
        
        assert len(signature) == 32  # SHA256 in fallback mode
    
    def test_identity_export_import(self):
        """Test exporting and importing identity."""
        identity = Identity.create("Bob")
        exported = identity.export()
        
        imported = Identity.import_from_json(exported)
        
        assert imported.did == identity.did
        assert imported.name == identity.name
        assert imported.public_key == identity.public_key
    
    def test_unique_identities(self):
        """Test that each identity is unique."""
        id1 = Identity.create()
        id2 = Identity.create()
        
        assert id1.did != id2.did
        assert id1.public_key != id2.public_key


class TestContent:
    """Tests for Content class."""
    
    def test_create_content(self):
        """Test creating content."""
        identity = Identity.create("Author")
        content = Content.create("Hello, RootlessNet!", identity)
        
        assert content.cid.startswith("bafk")
        assert content.author == identity.did
        assert content.body == "Hello, RootlessNet!"
        assert content.created_at > 0
        assert len(content.signature) == 64  # hex encoded signature
    
    def test_verify_content(self):
        """Test verifying content signature."""
        identity = Identity.create()
        content = Content.create("Test content", identity)
        
        assert content.verify() is True
    
    def test_export_content(self):
        """Test exporting content to JSON."""
        identity = Identity.create()
        content = Content.create("Export test", identity)
        
        exported = content.export()
        
        assert "cid" in exported
        assert "author" in exported
        assert "body" in exported
        assert "Export test" in exported
    
    def test_unique_content_ids(self):
        """Test that each content gets a unique CID."""
        identity = Identity.create()
        
        c1 = Content.create("Content 1", identity)
        c2 = Content.create("Content 2", identity)
        
        assert c1.cid != c2.cid


class TestMessaging:
    """Tests for Messaging class."""
    
    def test_encrypt_decrypt_message(self):
        """Test encrypting and decrypting a message."""
        sender = Identity.create("Alice")
        recipient = Identity.create("Bob")
        
        message = "Hello, Bob!"
        encrypted = Messaging.encrypt(message, sender, recipient.public_key)
        
        # Encrypted message should be JSON
        assert "sender_public_key" in encrypted
        assert "ciphertext" in encrypted
        
        # Decrypt
        decrypted = Messaging.decrypt(encrypted, recipient, sender.public_key)
        
        assert decrypted == message
    
    def test_encrypted_message_is_different(self):
        """Test that encrypted message differs from plaintext."""
        sender = Identity.create()
        recipient = Identity.create()
        
        message = "Secret message"
        encrypted = Messaging.encrypt(message, sender, recipient.public_key)
        
        assert message not in encrypted
    
    def test_different_recipients_different_ciphertext(self):
        """Test that different recipients get different ciphertexts."""
        sender = Identity.create()
        recipient1 = Identity.create()
        recipient2 = Identity.create()
        
        message = "Same message"
        
        enc1 = Messaging.encrypt(message, sender, recipient1.public_key)
        enc2 = Messaging.encrypt(message, sender, recipient2.public_key)
        
        assert enc1 != enc2


class TestIntegration:
    """Integration tests for the complete workflow."""
    
    def test_full_workflow(self):
        """Test complete identity -> content -> messaging workflow."""
        # Create identities
        alice = Identity.create("Alice")
        bob = Identity.create("Bob")
        
        assert alice.did != bob.did
        
        # Alice posts content
        post = Content.create("Hello from Alice!", alice)
        assert post.verify()
        
        # Bob posts content
        reply = Content.create("Hello back from Bob!", bob)
        assert reply.verify()
        
        # Alice sends encrypted message to Bob
        secret = "This is a secret message"
        encrypted = Messaging.encrypt(secret, alice, bob.public_key)
        
        # Bob decrypts the message
        decrypted = Messaging.decrypt(encrypted, bob, alice.public_key)
        assert decrypted == secret


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
