//! Content management for RootlessNet
//!
//! Provides content creation, signing, verification, and CID-based addressing.

use crate::crypto::{hash_blake3, verify_signature, CryptoError};
use crate::identity::{Identity, PyIdentity};
use pyo3::prelude::*;
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

/// Content types supported by the protocol
#[derive(Clone, Serialize, Deserialize, PartialEq, Debug)]
pub enum ContentType {
    Text,
    Media,
    Document,
    Thread,
}

impl Default for ContentType {
    fn default() -> Self {
        ContentType::Text
    }
}

/// Signed content object
#[derive(Clone, Serialize, Deserialize)]
pub struct Content {
    /// Content Identifier (CID)
    pub cid: String,
    /// Author's DID
    pub author: String,
    /// Author's public key
    pub author_public_key: String,
    /// Content type
    pub content_type: ContentType,
    /// The actual content body
    pub body: String,
    /// Creation timestamp
    pub created_at: u64,
    /// Cryptographic signature
    pub signature: String,
}

impl Content {
    /// Create new signed content
    pub fn new(body: String, identity: &Identity) -> Result<Self, CryptoError> {
        let created_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        // Create content hash for CID
        let content_data = format!("{}:{}:{}", identity.did, body, created_at);
        let content_hash = hash_blake3(content_data.as_bytes());
        let cid = format!("bafk{}", bs58::encode(&content_hash[..16]).into_string());
        
        // Create signature payload
        let signature_payload = format!("{}:{}:{}:{}", cid, identity.did, body, created_at);
        let signature = identity.sign(signature_payload.as_bytes())?;
        
        Ok(Content {
            cid,
            author: identity.did.clone(),
            author_public_key: identity.public_key.clone(),
            content_type: ContentType::Text,
            body,
            created_at,
            signature: hex::encode(signature),
        })
    }

    /// Verify content signature
    pub fn verify(&self) -> Result<bool, CryptoError> {
        // Reconstruct signature payload
        let signature_payload = format!(
            "{}:{}:{}:{}",
            self.cid, self.author, self.body, self.created_at
        );
        
        // Decode public key and signature
        let public_key_bytes = hex::decode(&self.author_public_key)
            .map_err(|e| CryptoError::InvalidKey(e.to_string()))?;
        
        let signature_bytes = hex::decode(&self.signature)
            .map_err(|e| CryptoError::InvalidKey(e.to_string()))?;
        
        let verifying_key = ed25519_dalek::VerifyingKey::from_bytes(
            public_key_bytes.as_slice().try_into()
                .map_err(|_| CryptoError::InvalidKey("Invalid key length".to_string()))?
        ).map_err(|e| CryptoError::InvalidKey(e.to_string()))?;
        
        verify_signature(&verifying_key, signature_payload.as_bytes(), &signature_bytes)?;
        Ok(true)
    }

    /// Export content as JSON
    pub fn export(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }
}

/// Python wrapper for Content
#[pyclass]
#[derive(Clone)]
pub struct PyContent {
    inner: Content,
}

#[pymethods]
impl PyContent {
    #[new]
    pub fn new(body: String, identity: &PyIdentity) -> PyResult<Self> {
        let content = Content::new(body, identity.inner())
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(e.to_string()))?;
        Ok(PyContent { inner: content })
    }

    /// Get the CID
    #[getter]
    pub fn cid(&self) -> String {
        self.inner.cid.clone()
    }

    /// Get the author DID
    #[getter]
    pub fn author(&self) -> String {
        self.inner.author.clone()
    }

    /// Get the content body
    #[getter]
    pub fn body(&self) -> String {
        self.inner.body.clone()
    }

    /// Get creation timestamp
    #[getter]
    pub fn created_at(&self) -> u64 {
        self.inner.created_at
    }

    /// Verify the content signature
    pub fn verify(&self) -> PyResult<bool> {
        self.inner.verify()
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(e.to_string()))
    }

    /// Export content as JSON
    pub fn export(&self) -> PyResult<String> {
        self.inner.export()
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(e.to_string()))
    }

    fn __repr__(&self) -> String {
        format!(
            "Content(cid={}, author={}, body={}...)",
            self.inner.cid,
            self.inner.author,
            &self.inner.body.chars().take(20).collect::<String>()
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_content_creation() {
        let identity = Identity::new(Some("Alice".to_string()));
        let content = Content::new("Hello, RootlessNet!".to_string(), &identity).unwrap();
        
        assert!(content.cid.starts_with("bafk"));
        assert_eq!(content.author, identity.did);
        assert_eq!(content.body, "Hello, RootlessNet!");
    }

    #[test]
    fn test_content_verification() {
        let identity = Identity::new(None);
        let content = Content::new("Test content".to_string(), &identity).unwrap();
        
        assert!(content.verify().unwrap());
    }

    #[test]
    fn test_tampered_content_fails_verification() {
        let identity = Identity::new(None);
        let mut content = Content::new("Original".to_string(), &identity).unwrap();
        
        // Tamper with content
        content.body = "Tampered".to_string();
        
        assert!(content.verify().is_err());
    }
}
