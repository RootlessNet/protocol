//! Cryptographic utilities module
//! Provides hashing and encryption functions

use pyo3::prelude::*;
use sha2::{Sha256, Digest};
use blake3;

/// Hash data using SHA-256
#[pyfunction]
pub fn hash_data(data: Vec<u8>) -> String {
    let mut hasher = Sha256::new();
    hasher.update(&data);
    hex::encode(hasher.finalize())
}

/// Hash data using BLAKE3 (faster)
#[pyfunction]
pub fn hash_blake3(data: Vec<u8>) -> String {
    let hash = blake3::hash(&data);
    hash.to_hex().to_string()
}

/// Hash string data using SHA-256
#[pyfunction]
pub fn hash_string(data: &str) -> String {
    hash_data(data.as_bytes().to_vec())
}

/// Generate a content-addressed ID from data
#[pyfunction]
pub fn content_id(data: Vec<u8>) -> String {
    format!("cid:{}", hash_blake3(data))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_data() {
        let data = b"Hello, World!";
        let hash = hash_data(data.to_vec());
        assert_eq!(hash.len(), 64); // SHA-256 produces 32 bytes = 64 hex chars
    }

    #[test]
    fn test_hash_blake3() {
        let data = b"Hello, World!";
        let hash = hash_blake3(data.to_vec());
        assert_eq!(hash.len(), 64); // BLAKE3 produces 32 bytes = 64 hex chars
    }

    #[test]
    fn test_hash_string() {
        let hash1 = hash_string("test");
        let hash2 = hash_string("test");
        assert_eq!(hash1, hash2); // Same input = same output
    }

    #[test]
    fn test_content_id() {
        let data = b"Some content";
        let cid = content_id(data.to_vec());
        assert!(cid.starts_with("cid:"));
    }
}
