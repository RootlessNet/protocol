//! Identity management for RootlessNet
//!
//! Provides self-sovereign identity creation, management, and DID-based addressing.

use crate::crypto::{generate_signing_key, sign_message, hash_blake3, CryptoError};
use ed25519_dalek::{SigningKey, VerifyingKey};
use pyo3::prelude::*;
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

/// Identity representation
#[derive(Clone, Serialize, Deserialize)]
pub struct Identity {
    /// Decentralized Identifier (DID)
    pub did: String,
    /// Display name (optional)
    pub name: Option<String>,
    /// Public key (hex encoded)
    pub public_key: String,
    /// Private key (hex encoded) - stored securely
    private_key: String,
    /// Creation timestamp
    pub created_at: u64,
}

impl Identity {
    /// Create a new identity
    pub fn new(name: Option<String>) -> Self {
        let signing_key = generate_signing_key();
        let verifying_key = signing_key.verifying_key();
        
        let public_key_hex = hex::encode(verifying_key.to_bytes());
        let private_key_hex = hex::encode(signing_key.to_bytes());
        
        // Create DID using the public key hash
        let key_hash = hash_blake3(verifying_key.to_bytes().as_ref());
        let did = format!("did:rootless:key:{}", bs58::encode(&key_hash[..16]).into_string());
        
        let created_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        Identity {
            did,
            name,
            public_key: public_key_hex,
            private_key: private_key_hex,
            created_at,
        }
    }

    /// Sign data with this identity
    pub fn sign(&self, data: &[u8]) -> Result<Vec<u8>, CryptoError> {
        let private_bytes = hex::decode(&self.private_key)
            .map_err(|e| CryptoError::InvalidKey(e.to_string()))?;
        
        let signing_key = SigningKey::from_bytes(
            private_bytes.as_slice().try_into()
                .map_err(|_| CryptoError::InvalidKey("Invalid key length".to_string()))?
        );
        
        Ok(sign_message(&signing_key, data))
    }

    /// Get the verifying key
    pub fn verifying_key(&self) -> Result<VerifyingKey, CryptoError> {
        let public_bytes = hex::decode(&self.public_key)
            .map_err(|e| CryptoError::InvalidKey(e.to_string()))?;
        
        VerifyingKey::from_bytes(
            public_bytes.as_slice().try_into()
                .map_err(|_| CryptoError::InvalidKey("Invalid key length".to_string()))?
        ).map_err(|e| CryptoError::InvalidKey(e.to_string()))
    }

    /// Export identity as JSON
    pub fn export(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }

    /// Import identity from JSON
    pub fn import(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }
}

/// Python wrapper for Identity
#[pyclass]
#[derive(Clone)]
pub struct PyIdentity {
    inner: Identity,
}

#[pymethods]
impl PyIdentity {
    #[new]
    pub fn new(name: Option<String>) -> PyResult<Self> {
        Ok(PyIdentity {
            inner: Identity::new(name),
        })
    }

    /// Get the DID
    #[getter]
    pub fn did(&self) -> String {
        self.inner.did.clone()
    }

    /// Get the display name
    #[getter]
    pub fn name(&self) -> Option<String> {
        self.inner.name.clone()
    }

    /// Get the public key (hex encoded)
    #[getter]
    pub fn public_key(&self) -> String {
        self.inner.public_key.clone()
    }

    /// Get creation timestamp
    #[getter]
    pub fn created_at(&self) -> u64 {
        self.inner.created_at
    }

    /// Sign data with this identity
    pub fn sign(&self, data: &[u8]) -> PyResult<Vec<u8>> {
        self.inner.sign(data)
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(e.to_string()))
    }

    /// Export identity as JSON
    pub fn export(&self) -> PyResult<String> {
        self.inner.export()
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(e.to_string()))
    }

    /// Import identity from JSON
    #[staticmethod]
    pub fn import(json: &str) -> PyResult<Self> {
        let identity = Identity::import(json)
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(e.to_string()))?;
        Ok(PyIdentity { inner: identity })
    }

    fn __repr__(&self) -> String {
        format!("Identity(did={}, name={:?})", self.inner.did, self.inner.name)
    }
}

impl PyIdentity {
    /// Get inner identity
    pub fn inner(&self) -> &Identity {
        &self.inner
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_identity_creation() {
        let identity = Identity::new(Some("Alice".to_string()));
        assert!(identity.did.starts_with("did:rootless:key:"));
        assert_eq!(identity.name, Some("Alice".to_string()));
        assert!(!identity.public_key.is_empty());
    }

    #[test]
    fn test_identity_sign() {
        let identity = Identity::new(None);
        let data = b"Hello, World!";
        let signature = identity.sign(data).unwrap();
        assert_eq!(signature.len(), 64); // Ed25519 signature is 64 bytes
    }

    #[test]
    fn test_identity_export_import() {
        let identity = Identity::new(Some("Bob".to_string()));
        let json = identity.export().unwrap();
        let imported = Identity::import(&json).unwrap();
        
        assert_eq!(identity.did, imported.did);
        assert_eq!(identity.name, imported.name);
        assert_eq!(identity.public_key, imported.public_key);
    }
}
