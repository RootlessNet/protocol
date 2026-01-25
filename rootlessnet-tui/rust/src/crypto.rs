//! Cryptographic primitives for RootlessNet
//!
//! Implements Ed25519 signatures, X25519 key exchange, XChaCha20-Poly1305 encryption,
//! and BLAKE3 hashing.

use ed25519_dalek::{Signer, SigningKey, Verifier, VerifyingKey};
use x25519_dalek::{PublicKey, StaticSecret};
use chacha20poly1305::{
    aead::{Aead, KeyInit},
    XChaCha20Poly1305, XNonce,
};
use rand::rngs::OsRng;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CryptoError {
    #[error("Invalid key format: {0}")]
    InvalidKey(String),
    #[error("Signature verification failed")]
    SignatureVerificationFailed,
    #[error("Encryption failed: {0}")]
    EncryptionFailed(String),
    #[error("Decryption failed: {0}")]
    DecryptionFailed(String),
    #[error("Key derivation failed: {0}")]
    KeyDerivationFailed(String),
}

/// Generate a new Ed25519 keypair and return as hex strings
pub fn generate_keypair_hex() -> Result<(String, String), CryptoError> {
    let signing_key = SigningKey::generate(&mut OsRng);
    let verifying_key = signing_key.verifying_key();
    
    Ok((
        hex::encode(signing_key.to_bytes()),
        hex::encode(verifying_key.to_bytes()),
    ))
}

/// Generate Ed25519 signing key
pub fn generate_signing_key() -> SigningKey {
    SigningKey::generate(&mut OsRng)
}

/// Sign a message with Ed25519
pub fn sign_message(signing_key: &SigningKey, message: &[u8]) -> Vec<u8> {
    signing_key.sign(message).to_bytes().to_vec()
}

/// Verify an Ed25519 signature
pub fn verify_signature(
    public_key: &VerifyingKey,
    message: &[u8],
    signature: &[u8],
) -> Result<(), CryptoError> {
    let signature = ed25519_dalek::Signature::from_slice(signature)
        .map_err(|_| CryptoError::SignatureVerificationFailed)?;
    
    public_key
        .verify(message, &signature)
        .map_err(|_| CryptoError::SignatureVerificationFailed)
}

/// Generate X25519 static secret for key exchange
pub fn generate_x25519_secret() -> StaticSecret {
    StaticSecret::random_from_rng(OsRng)
}

/// Derive shared secret using X25519
pub fn derive_shared_secret(private_key: &StaticSecret, public_key: &PublicKey) -> [u8; 32] {
    private_key.diffie_hellman(public_key).to_bytes()
}

/// Encrypt data using XChaCha20-Poly1305
pub fn encrypt_data(key: &[u8; 32], plaintext: &[u8]) -> Result<Vec<u8>, CryptoError> {
    let cipher = XChaCha20Poly1305::new_from_slice(key)
        .map_err(|e| CryptoError::EncryptionFailed(e.to_string()))?;
    
    // Generate random nonce
    let mut nonce_bytes = [0u8; 24];
    rand::RngCore::fill_bytes(&mut OsRng, &mut nonce_bytes);
    let nonce = XNonce::from_slice(&nonce_bytes);
    
    let ciphertext = cipher
        .encrypt(nonce, plaintext)
        .map_err(|e| CryptoError::EncryptionFailed(e.to_string()))?;
    
    // Prepend nonce to ciphertext
    let mut result = nonce_bytes.to_vec();
    result.extend(ciphertext);
    
    Ok(result)
}

/// Decrypt data using XChaCha20-Poly1305
pub fn decrypt_data(key: &[u8; 32], ciphertext: &[u8]) -> Result<Vec<u8>, CryptoError> {
    if ciphertext.len() < 24 {
        return Err(CryptoError::DecryptionFailed("Ciphertext too short".to_string()));
    }
    
    let cipher = XChaCha20Poly1305::new_from_slice(key)
        .map_err(|e| CryptoError::DecryptionFailed(e.to_string()))?;
    
    let nonce = XNonce::from_slice(&ciphertext[..24]);
    let encrypted = &ciphertext[24..];
    
    cipher
        .decrypt(nonce, encrypted)
        .map_err(|e| CryptoError::DecryptionFailed(e.to_string()))
}

/// Hash data using BLAKE3
pub fn hash_blake3(data: &[u8]) -> [u8; 32] {
    blake3::hash(data).into()
}

/// Derive key using HKDF-SHA256
pub fn derive_key(ikm: &[u8], salt: &[u8], info: &[u8], length: usize) -> Result<Vec<u8>, CryptoError> {
    use hkdf::Hkdf;
    use sha2::Sha256;
    
    let hk = Hkdf::<Sha256>::new(Some(salt), ikm);
    let mut okm = vec![0u8; length];
    hk.expand(info, &mut okm)
        .map_err(|e| CryptoError::KeyDerivationFailed(e.to_string()))?;
    
    Ok(okm)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_keypair_generation() {
        let (private_hex, public_hex) = generate_keypair_hex().unwrap();
        assert_eq!(private_hex.len(), 64); // 32 bytes = 64 hex chars
        assert_eq!(public_hex.len(), 64);
    }

    #[test]
    fn test_sign_verify() {
        let signing_key = generate_signing_key();
        let message = b"Hello, RootlessNet!";
        
        let signature = sign_message(&signing_key, message);
        let result = verify_signature(&signing_key.verifying_key(), message, &signature);
        
        assert!(result.is_ok());
    }

    #[test]
    fn test_encrypt_decrypt() {
        let key = [42u8; 32];
        let plaintext = b"Secret message";
        
        let ciphertext = encrypt_data(&key, plaintext).unwrap();
        let decrypted = decrypt_data(&key, &ciphertext).unwrap();
        
        assert_eq!(decrypted, plaintext);
    }

    #[test]
    fn test_blake3_hash() {
        let data = b"Hello, World!";
        let hash = hash_blake3(data);
        assert_eq!(hash.len(), 32);
    }
}
