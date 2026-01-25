//! Identity Module
//! Bitcoin-like identity system with public/private keys

use pyo3::prelude::*;
use rand::Rng;
use ed25519_dalek::{SigningKey, VerifyingKey, Signature, Signer, Verifier};
use serde::{Deserialize, Serialize};

use crate::wordlist::WORDLIST;

/// Characters allowed in public keys
const PUBLIC_KEY_CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$-#";

/// User Identity with public and private keys
#[pyclass]
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct UserIdentity {
    /// Public key - visible to everyone, ~100 characters with alphanumeric + symbols
    #[pyo3(get)]
    pub public_key: String,
    
    /// Private key - 100 random words from 4000-word list (mnemonic)
    #[pyo3(get)]
    pub private_key: String,
    
    /// Ed25519 signing key bytes (for actual cryptographic operations)
    pub signing_key_bytes: Vec<u8>,
    
    /// Ed25519 verifying key bytes
    pub verifying_key_bytes: Vec<u8>,
    
    /// Timestamp when identity was created
    #[pyo3(get)]
    pub created_at: i64,
}

#[pymethods]
impl UserIdentity {
    /// Create a new random identity
    #[new]
    pub fn new() -> Self {
        let mut rng = rand::thread_rng();
        
        // Generate Ed25519 keypair for actual crypto operations
        let mut seed = [0u8; 32];
        rng.fill(&mut seed);
        let signing_key = SigningKey::from_bytes(&seed);
        let verifying_key = signing_key.verifying_key();
        
        // Generate public key string (~100+ chars with alphanumeric + $-#)
        let public_key = generate_public_key_string(&verifying_key.to_bytes(), &mut rng);
        
        // Generate private key as 100 random words from wordlist
        let private_key = generate_mnemonic_key(&mut rng);
        
        let created_at = chrono::Utc::now().timestamp();
        
        UserIdentity {
            public_key,
            private_key,
            signing_key_bytes: signing_key.to_bytes().to_vec(),
            verifying_key_bytes: verifying_key.to_bytes().to_vec(),
            created_at,
        }
    }
    
    /// Sign data with private key
    pub fn sign(&self, data: &[u8]) -> PyResult<Vec<u8>> {
        let signing_key_bytes: [u8; 32] = self.signing_key_bytes.clone()
            .try_into()
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyValueError, _>("Invalid signing key"))?;
        let signing_key = SigningKey::from_bytes(&signing_key_bytes);
        let signature = signing_key.sign(data);
        Ok(signature.to_bytes().to_vec())
    }
    
    /// Get identity info as JSON string
    pub fn to_json(&self) -> PyResult<String> {
        serde_json::to_string_pretty(self)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }
    
    /// Get public-only identity info (safe to share)
    pub fn public_info(&self) -> String {
        format!(
            "Public Key: {}\nCreated: {}",
            self.public_key,
            chrono::DateTime::from_timestamp(self.created_at, 0)
                .map(|dt| dt.format("%Y-%m-%d %H:%M:%S UTC").to_string())
                .unwrap_or_else(|| "Unknown".to_string())
        )
    }
    
    /// Export identity to encrypted backup (returns JSON)
    pub fn export_encrypted(&self, password: &str) -> PyResult<String> {
        use sha2::{Sha256, Digest};
        use chacha20poly1305::{ChaCha20Poly1305, KeyInit, aead::Aead};
        use chacha20poly1305::aead::generic_array::GenericArray;
        
        // Derive key from password
        let mut hasher = Sha256::new();
        hasher.update(password.as_bytes());
        let key_bytes = hasher.finalize();
        
        let cipher = ChaCha20Poly1305::new(GenericArray::from_slice(&key_bytes));
        
        // Serialize identity
        let data = serde_json::to_string(self)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))?;
        
        // Encrypt
        let nonce = GenericArray::from_slice(&[0u8; 12]); // In production, use random nonce
        let encrypted = cipher.encrypt(nonce, data.as_bytes())
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))?;
        
        Ok(hex::encode(encrypted))
    }
    
    /// Import identity from encrypted backup
    #[staticmethod]
    pub fn import_encrypted(encrypted_hex: &str, password: &str) -> PyResult<Self> {
        use sha2::{Sha256, Digest};
        use chacha20poly1305::{ChaCha20Poly1305, KeyInit, aead::Aead};
        use chacha20poly1305::aead::generic_array::GenericArray;
        
        // Derive key from password
        let mut hasher = Sha256::new();
        hasher.update(password.as_bytes());
        let key_bytes = hasher.finalize();
        
        let cipher = ChaCha20Poly1305::new(GenericArray::from_slice(&key_bytes));
        
        // Decode and decrypt
        let encrypted = hex::decode(encrypted_hex)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))?;
        
        let nonce = GenericArray::from_slice(&[0u8; 12]);
        let decrypted = cipher.decrypt(nonce, encrypted.as_slice())
            .map_err(|_| PyErr::new::<pyo3::exceptions::PyValueError, _>("Decryption failed - wrong password?"))?;
        
        let json_str = String::from_utf8(decrypted)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))?;
        
        serde_json::from_str(&json_str)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }
}

impl Default for UserIdentity {
    fn default() -> Self {
        Self::new()
    }
}

/// Generate a public key string with ~100+ characters
fn generate_public_key_string<R: Rng>(verifying_key_bytes: &[u8; 32], rng: &mut R) -> String {
    let mut result = String::with_capacity(120);
    
    // Start with hex-encoded verifying key (64 chars)
    result.push_str(&hex::encode(verifying_key_bytes));
    
    // Add random characters to reach ~100+ chars with allowed symbols
    while result.len() < 100 {
        let idx = rng.gen_range(0..PUBLIC_KEY_CHARS.len());
        result.push(PUBLIC_KEY_CHARS[idx] as char);
    }
    
    // Add a few more for variability
    let extra = rng.gen_range(5..20);
    for _ in 0..extra {
        let idx = rng.gen_range(0..PUBLIC_KEY_CHARS.len());
        result.push(PUBLIC_KEY_CHARS[idx] as char);
    }
    
    result
}

/// Generate mnemonic private key (100 random words from 4000-word list)
fn generate_mnemonic_key<R: Rng>(rng: &mut R) -> String {
    let words: Vec<&str> = (0..100)
        .map(|_| {
            let idx = rng.gen_range(0..WORDLIST.len());
            WORDLIST[idx]
        })
        .collect();
    
    words.join(" ")
}

/// Generate a new identity (Python function)
#[pyfunction]
pub fn generate_identity() -> UserIdentity {
    UserIdentity::new()
}

/// Verify a signature with a public key
#[pyfunction]
pub fn verify_signature(verifying_key_bytes: Vec<u8>, data: Vec<u8>, signature_bytes: Vec<u8>) -> PyResult<bool> {
    let verifying_key_array: [u8; 32] = verifying_key_bytes
        .try_into()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyValueError, _>("Invalid verifying key length"))?;
    
    let signature_array: [u8; 64] = signature_bytes
        .try_into()
        .map_err(|_| PyErr::new::<pyo3::exceptions::PyValueError, _>("Invalid signature length"))?;
    
    let verifying_key = VerifyingKey::from_bytes(&verifying_key_array)
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))?;
    
    let signature = Signature::from_bytes(&signature_array);
    
    Ok(verifying_key.verify(&data, &signature).is_ok())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_identity_creation() {
        let identity = UserIdentity::new();
        assert!(identity.public_key.len() >= 100);
        assert_eq!(identity.private_key.split_whitespace().count(), 100);
    }

    #[test]
    fn test_sign_and_verify() {
        let identity = UserIdentity::new();
        let data = b"Hello, RootlessNet!";
        
        let signature = identity.sign(data).unwrap();
        
        let is_valid = verify_signature(
            identity.verifying_key_bytes.clone(),
            data.to_vec(),
            signature,
        ).unwrap();
        
        assert!(is_valid);
    }

    #[test]
    fn test_export_import() {
        let identity = UserIdentity::new();
        let password = "test_password_123";
        
        let encrypted = identity.export_encrypted(password).unwrap();
        let imported = UserIdentity::import_encrypted(&encrypted, password).unwrap();
        
        assert_eq!(identity.public_key, imported.public_key);
        assert_eq!(identity.private_key, imported.private_key);
    }
}
