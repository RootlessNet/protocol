//! RootlessNet Core Library
//! Decentralized Tor Blockchain Protocol Core

pub mod identity;
pub mod blockchain;
pub mod content;
pub mod crypto;
pub mod wordlist;

use pyo3::prelude::*;

/// RootlessNet Core Python Module
#[pymodule]
fn rootless_core(_py: Python<'_>, m: &PyModule) -> PyResult<()> {
    m.add_class::<identity::UserIdentity>()?;
    m.add_class::<blockchain::Block>()?;
    m.add_class::<blockchain::Blockchain>()?;
    m.add_class::<content::Content>()?;
    m.add_class::<content::ContentType>()?;
    m.add_function(wrap_pyfunction!(identity::generate_identity, m)?)?;
    m.add_function(wrap_pyfunction!(identity::verify_signature, m)?)?;
    m.add_function(wrap_pyfunction!(crypto::hash_data, m)?)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_identity_creation() {
        let id = identity::UserIdentity::new();
        assert!(!id.public_key.is_empty());
        assert!(!id.private_key.is_empty());
        assert!(id.public_key.len() >= 100);
    }

    #[test]
    fn test_blockchain_creation() {
        let mut chain = blockchain::Blockchain::new();
        assert_eq!(chain.chain.len(), 1); // Genesis block
        
        let content = content::Content::new(
            content::ContentType::Text,
            "Hello World".to_string(),
            "Test Post".to_string(),
            "A test description".to_string(),
            None,
            None,
            None,
        );
        
        chain.add_block(content, "test_author".to_string());
        assert_eq!(chain.chain.len(), 2);
    }
}
