//! End-to-end encrypted messaging for RootlessNet
//!
//! Provides X25519 key exchange and XChaCha20-Poly1305 encryption for secure messaging.

use crate::crypto::{encrypt_data, decrypt_data, derive_key, hash_blake3, CryptoError};
use crate::identity::PyIdentity;
use pyo3::prelude::*;
use serde::{Deserialize, Serialize};
use x25519_dalek::{PublicKey, StaticSecret};
use std::time::{SystemTime, UNIX_EPOCH};

/// Encrypted message structure
#[derive(Clone, Serialize, Deserialize)]
pub struct EncryptedMessage {
    /// Sender's public key
    pub sender_public_key: String,
    /// Ephemeral public key for key exchange
    pub ephemeral_public_key: String,
    /// Encrypted content
    pub ciphertext: String,
    /// Timestamp
    pub timestamp: u64,
    /// Message ID
    pub message_id: String,
}

/// Encrypt a message for a recipient
pub fn encrypt_message_for_recipient(
    message: &str,
    sender: &PyIdentity,
    recipient_public_key: &str,
) -> Result<String, CryptoError> {
    // Decode recipient's public key (use hash of Ed25519 key for X25519)
    let recipient_pk_bytes = hex::decode(recipient_public_key)
        .map_err(|e| CryptoError::InvalidKey(e.to_string()))?;
    
    // Generate ephemeral X25519 keypair
    let ephemeral_secret = StaticSecret::random_from_rng(rand::rngs::OsRng);
    let ephemeral_public = PublicKey::from(&ephemeral_secret);
    
    // Derive recipient X25519 public key from Ed25519 (simplified for demo)
    let recipient_x25519_pk = derive_x25519_from_ed25519(&recipient_pk_bytes)?;
    let recipient_pk = PublicKey::from(recipient_x25519_pk);
    
    // Perform key exchange
    let shared_secret = ephemeral_secret.diffie_hellman(&recipient_pk);
    
    // Derive encryption key
    let info = format!("rootlessnet:messaging:{}", sender.did());
    let encryption_key = derive_key(
        shared_secret.as_bytes(),
        b"rootlessnet-messaging-v2",
        info.as_bytes(),
        32,
    )?;
    
    // Encrypt message
    let mut key_array = [0u8; 32];
    key_array.copy_from_slice(&encryption_key);
    let ciphertext = encrypt_data(&key_array, message.as_bytes())?;
    
    // Create message ID
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();
    let message_hash = hash_blake3(format!("{}:{}", message, timestamp).as_bytes());
    let message_id = bs58::encode(&message_hash[..16]).into_string();
    
    // Create encrypted message object
    let encrypted_msg = EncryptedMessage {
        sender_public_key: sender.public_key(),
        ephemeral_public_key: hex::encode(ephemeral_public.as_bytes()),
        ciphertext: hex::encode(ciphertext),
        timestamp,
        message_id,
    };
    
    serde_json::to_string(&encrypted_msg)
        .map_err(|e| CryptoError::EncryptionFailed(e.to_string()))
}

/// Decrypt a message from a sender
pub fn decrypt_message_from_sender(
    encrypted_message: &str,
    recipient: &PyIdentity,
    _sender_public_key: &str,
) -> Result<String, CryptoError> {
    // Parse encrypted message
    let msg: EncryptedMessage = serde_json::from_str(encrypted_message)
        .map_err(|e| CryptoError::DecryptionFailed(e.to_string()))?;
    
    // Decode ephemeral public key
    let ephemeral_pk_bytes = hex::decode(&msg.ephemeral_public_key)
        .map_err(|e| CryptoError::InvalidKey(e.to_string()))?;
    
    let ephemeral_pk_array: [u8; 32] = ephemeral_pk_bytes.as_slice().try_into()
        .map_err(|_| CryptoError::InvalidKey("Invalid ephemeral key length".to_string()))?;
    let ephemeral_pk = PublicKey::from(ephemeral_pk_array);
    
    // Derive recipient's X25519 secret from identity
    let recipient_pk_bytes = hex::decode(&recipient.public_key())
        .map_err(|e| CryptoError::InvalidKey(e.to_string()))?;
    let recipient_secret_bytes = derive_x25519_from_ed25519(&recipient_pk_bytes)?;
    let recipient_secret = StaticSecret::from(recipient_secret_bytes);
    
    // Perform key exchange
    let shared_secret = recipient_secret.diffie_hellman(&ephemeral_pk);
    
    // Derive decryption key
    let info = format!("rootlessnet:messaging:{}", msg.sender_public_key);
    let decryption_key = derive_key(
        shared_secret.as_bytes(),
        b"rootlessnet-messaging-v2",
        info.as_bytes(),
        32,
    )?;
    
    // Decrypt message
    let ciphertext = hex::decode(&msg.ciphertext)
        .map_err(|e| CryptoError::DecryptionFailed(e.to_string()))?;
    
    let mut key_array = [0u8; 32];
    key_array.copy_from_slice(&decryption_key);
    let plaintext = decrypt_data(&key_array, &ciphertext)?;
    
    String::from_utf8(plaintext)
        .map_err(|e| CryptoError::DecryptionFailed(e.to_string()))
}

/// Derive X25519 key from Ed25519 key (simplified conversion)
fn derive_x25519_from_ed25519(ed25519_key: &[u8]) -> Result<[u8; 32], CryptoError> {
    // Use HKDF to derive X25519 key from Ed25519 key
    // Note: In production, use proper Ed25519->X25519 conversion
    let derived = derive_key(
        ed25519_key,
        b"rootlessnet-key-conversion",
        b"ed25519-to-x25519",
        32,
    )?;
    
    let mut result = [0u8; 32];
    result.copy_from_slice(&derived);
    Ok(result)
}

/// Python wrapper for Messaging operations
#[pyclass]
pub struct PyMessaging;

#[pymethods]
impl PyMessaging {
    #[new]
    pub fn new() -> Self {
        PyMessaging
    }

    /// Encrypt a message for a recipient
    pub fn encrypt(
        &self,
        message: String,
        sender: &PyIdentity,
        recipient_public_key: String,
    ) -> PyResult<String> {
        encrypt_message_for_recipient(&message, sender, &recipient_public_key)
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(e.to_string()))
    }

    /// Decrypt a message from a sender
    pub fn decrypt(
        &self,
        encrypted_message: String,
        recipient: &PyIdentity,
        sender_public_key: String,
    ) -> PyResult<String> {
        decrypt_message_from_sender(&encrypted_message, recipient, &sender_public_key)
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(e.to_string()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_message_structure() {
        let msg = EncryptedMessage {
            sender_public_key: "abc123".to_string(),
            ephemeral_public_key: "def456".to_string(),
            ciphertext: "encrypted".to_string(),
            timestamp: 1234567890,
            message_id: "msg123".to_string(),
        };
        
        let json = serde_json::to_string(&msg).unwrap();
        let parsed: EncryptedMessage = serde_json::from_str(&json).unwrap();
        
        assert_eq!(parsed.sender_public_key, msg.sender_public_key);
        assert_eq!(parsed.message_id, msg.message_id);
    }
}
