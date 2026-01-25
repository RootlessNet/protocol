//! RootlessNet Core Library
//!
//! A decentralized blockchain network protocol implementation in Rust.
//! This library provides the cryptographic foundation for the RootlessNet protocol,
//! including identity management, content signing, and end-to-end encrypted messaging.

use pyo3::prelude::*;
use pyo3::exceptions::PyRuntimeError;

mod crypto;
mod identity;
mod content;
mod messaging;

pub use crypto::*;
pub use identity::*;
pub use content::*;
pub use messaging::*;

/// RootlessNet Core Python Module
#[pymodule]
fn rootlessnet_core(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PyIdentity>()?;
    m.add_class::<PyContent>()?;
    m.add_class::<PyMessaging>()?;
    m.add_function(wrap_pyfunction!(create_identity, m)?)?;
    m.add_function(wrap_pyfunction!(create_content, m)?)?;
    m.add_function(wrap_pyfunction!(verify_content, m)?)?;
    m.add_function(wrap_pyfunction!(encrypt_message, m)?)?;
    m.add_function(wrap_pyfunction!(decrypt_message, m)?)?;
    m.add_function(wrap_pyfunction!(generate_keypair, m)?)?;
    Ok(())
}

/// Generate a new Ed25519 keypair
#[pyfunction]
fn generate_keypair() -> PyResult<(String, String)> {
    crypto::generate_keypair_hex()
        .map_err(|e| PyRuntimeError::new_err(e.to_string()))
}

/// Create a new identity
#[pyfunction]
fn create_identity(name: Option<String>) -> PyResult<PyIdentity> {
    PyIdentity::new(name)
}

/// Create new content
#[pyfunction]
fn create_content(content: String, identity: &PyIdentity) -> PyResult<PyContent> {
    PyContent::new(content, identity)
}

/// Verify content signature
#[pyfunction]
fn verify_content(content: &PyContent) -> PyResult<bool> {
    content.verify()
}

/// Encrypt a message for a recipient
#[pyfunction]
fn encrypt_message(
    message: String,
    sender: &PyIdentity,
    recipient_public_key: String,
) -> PyResult<String> {
    messaging::encrypt_message_for_recipient(&message, sender, &recipient_public_key)
        .map_err(|e| PyRuntimeError::new_err(e.to_string()))
}

/// Decrypt a message
#[pyfunction]
fn decrypt_message(
    encrypted_message: String,
    recipient: &PyIdentity,
    sender_public_key: String,
) -> PyResult<String> {
    messaging::decrypt_message_from_sender(&encrypted_message, recipient, &sender_public_key)
        .map_err(|e| PyRuntimeError::new_err(e.to_string()))
}
