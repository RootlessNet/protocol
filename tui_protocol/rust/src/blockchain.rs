//! Blockchain Module
//! Simple blockchain implementation for decentralized content storage

use pyo3::prelude::*;
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use chrono::Utc;

use crate::content::Content;

/// A single block in the blockchain
#[pyclass]
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Block {
    /// Block index
    #[pyo3(get)]
    pub index: u64,
    
    /// Unix timestamp when block was created
    #[pyo3(get)]
    pub timestamp: i64,
    
    /// Content stored in this block
    #[pyo3(get)]
    pub content: Content,
    
    /// Author's public key
    #[pyo3(get)]
    pub author: String,
    
    /// Hash of the previous block
    #[pyo3(get)]
    pub previous_hash: String,
    
    /// Hash of this block
    #[pyo3(get)]
    pub hash: String,
    
    /// Nonce for proof of work (simple)
    #[pyo3(get)]
    pub nonce: u64,
}

#[pymethods]
impl Block {
    /// Create a new block
    #[new]
    pub fn new(
        index: u64,
        content: Content,
        author: String,
        previous_hash: String,
    ) -> Self {
        let timestamp = Utc::now().timestamp();
        let mut block = Block {
            index,
            timestamp,
            content,
            author,
            previous_hash,
            hash: String::new(),
            nonce: 0,
        };
        block.hash = block.calculate_hash();
        block
    }
    
    /// Calculate hash of the block
    pub fn calculate_hash(&self) -> String {
        let data = format!(
            "{}{}{}{}{}{}",
            self.index,
            self.timestamp,
            serde_json::to_string(&self.content).unwrap_or_default(),
            self.author,
            self.previous_hash,
            self.nonce
        );
        
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        hex::encode(hasher.finalize())
    }
    
    /// Simple proof of work (find hash starting with prefix)
    pub fn mine(&mut self, difficulty: usize) -> PyResult<()> {
        let prefix = "0".repeat(difficulty);
        while !self.hash.starts_with(&prefix) {
            self.nonce += 1;
            self.hash = self.calculate_hash();
            
            // Prevent infinite loop
            if self.nonce > 1_000_000 {
                break;
            }
        }
        Ok(())
    }
    
    /// Convert block to JSON string
    pub fn to_json(&self) -> PyResult<String> {
        serde_json::to_string_pretty(self)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }
    
    /// Get block info as formatted string
    pub fn info(&self) -> String {
        format!(
            "Block #{}\n\
             Timestamp: {}\n\
             Author: {}\n\
             Content Type: {:?}\n\
             Hash: {}\n\
             Previous: {}",
            self.index,
            chrono::DateTime::from_timestamp(self.timestamp, 0)
                .map(|dt| dt.format("%Y-%m-%d %H:%M:%S UTC").to_string())
                .unwrap_or_else(|| "Unknown".to_string()),
            self.author,
            self.content.content_type,
            self.hash,
            self.previous_hash
        )
    }
}

/// The full blockchain
#[pyclass]
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Blockchain {
    /// Chain of blocks
    #[pyo3(get)]
    pub chain: Vec<Block>,
    
    /// Mining difficulty
    #[pyo3(get)]
    pub difficulty: usize,
}

#[pymethods]
impl Blockchain {
    /// Create a new blockchain with genesis block
    #[new]
    pub fn new() -> Self {
        let genesis_content = Content::new(
            crate::content::ContentType::Text,
            "Genesis Block - RootlessNet Protocol".to_string(),
            "Genesis".to_string(),
            "The beginning of the decentralized network".to_string(),
            None,
            None,
            None,
        );
        
        let genesis_block = Block::new(
            0,
            genesis_content,
            "SYSTEM".to_string(),
            "0".repeat(64),
        );
        
        Blockchain {
            chain: vec![genesis_block],
            difficulty: 2, // Start with low difficulty
        }
    }
    
    /// Get the latest block
    pub fn get_latest_block(&self) -> Option<Block> {
        self.chain.last().cloned()
    }
    
    /// Add a new block with content
    pub fn add_block(&mut self, content: Content, author: String) -> Block {
        let previous_block = self.get_latest_block().unwrap();
        let mut new_block = Block::new(
            previous_block.index + 1,
            content,
            author,
            previous_block.hash.clone(),
        );
        
        // Mine the block (simple PoW)
        let _ = new_block.mine(self.difficulty);
        
        self.chain.push(new_block.clone());
        new_block
    }
    
    /// Verify the entire blockchain
    pub fn is_valid(&self) -> bool {
        for i in 1..self.chain.len() {
            let current = &self.chain[i];
            let previous = &self.chain[i - 1];
            
            // Check hash
            if current.hash != current.calculate_hash() {
                return false;
            }
            
            // Check previous hash link
            if current.previous_hash != previous.hash {
                return false;
            }
        }
        true
    }
    
    /// Get block by index
    pub fn get_block(&self, index: u64) -> Option<Block> {
        self.chain.get(index as usize).cloned()
    }
    
    /// Get block by hash
    pub fn get_block_by_hash(&self, hash: &str) -> Option<Block> {
        self.chain.iter().find(|b| b.hash == hash).cloned()
    }
    
    /// Get all blocks by author
    pub fn get_blocks_by_author(&self, author: &str) -> Vec<Block> {
        self.chain.iter()
            .filter(|b| b.author == author)
            .cloned()
            .collect()
    }
    
    /// Get total number of blocks
    pub fn len(&self) -> usize {
        self.chain.len()
    }
    
    /// Export blockchain to JSON
    pub fn to_json(&self) -> PyResult<String> {
        serde_json::to_string_pretty(self)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }
    
    /// Import blockchain from JSON
    #[staticmethod]
    pub fn from_json(json_str: &str) -> PyResult<Self> {
        serde_json::from_str(json_str)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }
    
    /// Get blockchain info summary
    pub fn info(&self) -> String {
        format!(
            "Blockchain Info\n\
             ================\n\
             Total Blocks: {}\n\
             Difficulty: {}\n\
             Valid: {}\n\
             Latest Block: #{}",
            self.chain.len(),
            self.difficulty,
            if self.is_valid() { "Yes" } else { "No" },
            self.chain.last().map(|b| b.index).unwrap_or(0)
        )
    }
}

impl Default for Blockchain {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::content::ContentType;

    #[test]
    fn test_blockchain_creation() {
        let chain = Blockchain::new();
        assert_eq!(chain.chain.len(), 1);
        assert!(chain.is_valid());
    }

    #[test]
    fn test_add_block() {
        let mut chain = Blockchain::new();
        
        let content = Content::new(
            ContentType::Text,
            "Hello World".to_string(),
            "Test Post".to_string(),
            "A test description".to_string(),
            None,
            None,
            None,
        );
        
        chain.add_block(content, "test_author".to_string());
        
        assert_eq!(chain.chain.len(), 2);
        assert!(chain.is_valid());
    }

    #[test]
    fn test_blockchain_validation() {
        let mut chain = Blockchain::new();
        
        for i in 0..5 {
            let content = Content::new(
                ContentType::Text,
                format!("Content {}", i),
                format!("Title {}", i),
                format!("Description {}", i),
                None,
                None,
                None,
            );
            chain.add_block(content, format!("author_{}", i));
        }
        
        assert_eq!(chain.chain.len(), 6);
        assert!(chain.is_valid());
    }
}
