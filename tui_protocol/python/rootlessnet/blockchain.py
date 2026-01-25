"""
Blockchain Module
Simple blockchain implementation for decentralized content storage
"""

import hashlib
import json
from datetime import datetime
from typing import Optional, List
from dataclasses import dataclass, field

from .content import Content, ContentType


@dataclass
class Block:
    """A single block in the blockchain"""
    
    index: int
    timestamp: int
    content: Content
    author: str
    previous_hash: str
    hash: str = ""
    nonce: int = 0
    
    @classmethod
    def new(
        cls,
        index: int,
        content: Content,
        author: str,
        previous_hash: str,
    ) -> "Block":
        """Create a new block"""
        timestamp = int(datetime.now().timestamp())
        block = cls(
            index=index,
            timestamp=timestamp,
            content=content,
            author=author,
            previous_hash=previous_hash,
        )
        block.hash = block.calculate_hash()
        return block
    
    def calculate_hash(self) -> str:
        """Calculate hash of the block"""
        data = (
            f"{self.index}"
            f"{self.timestamp}"
            f"{self.content.to_json()}"
            f"{self.author}"
            f"{self.previous_hash}"
            f"{self.nonce}"
        )
        return hashlib.sha256(data.encode()).hexdigest()
    
    def mine(self, difficulty: int = 2) -> None:
        """Simple proof of work (find hash starting with prefix)"""
        prefix = "0" * difficulty
        while not self.hash.startswith(prefix):
            self.nonce += 1
            self.hash = self.calculate_hash()
            
            # Prevent infinite loop
            if self.nonce > 1_000_000:
                break
    
    def to_json(self) -> str:
        """Convert block to JSON string"""
        return json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "content": json.loads(self.content.to_json()),
            "author": self.author,
            "previous_hash": self.previous_hash,
            "hash": self.hash,
            "nonce": self.nonce,
        }, indent=2)
    
    @classmethod
    def from_json(cls, json_str: str) -> "Block":
        """Create block from JSON"""
        data = json.loads(json_str)
        content = Content.from_json(json.dumps(data["content"]))
        return cls(
            index=data["index"],
            timestamp=data["timestamp"],
            content=content,
            author=data["author"],
            previous_hash=data["previous_hash"],
            hash=data["hash"],
            nonce=data["nonce"],
        )
    
    def info(self) -> str:
        """Get block info as formatted string"""
        dt = datetime.fromtimestamp(self.timestamp)
        return (
            f"Block #{self.index}\n"
            f"Timestamp: {dt.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
            f"Author: {self.author[:50]}...\n"
            f"Content Type: {self.content.content_type.value}\n"
            f"Hash: {self.hash}\n"
            f"Previous: {self.previous_hash}"
        )


@dataclass
class Blockchain:
    """The full blockchain"""
    
    chain: List[Block] = field(default_factory=list)
    difficulty: int = 2
    
    def __post_init__(self):
        """Initialize with genesis block if empty"""
        if not self.chain:
            genesis_content = Content.new(
                content_type=ContentType.TEXT,
                data="Genesis Block - RootlessNet Protocol",
                title="Genesis",
                description="The beginning of the decentralized network",
            )
            genesis_block = Block.new(
                index=0,
                content=genesis_content,
                author="SYSTEM",
                previous_hash="0" * 64,
            )
            self.chain.append(genesis_block)
    
    def get_latest_block(self) -> Optional[Block]:
        """Get the latest block"""
        return self.chain[-1] if self.chain else None
    
    def add_block(self, content: Content, author: str) -> Block:
        """Add a new block with content"""
        previous_block = self.get_latest_block()
        new_block = Block.new(
            index=previous_block.index + 1 if previous_block else 0,
            content=content,
            author=author,
            previous_hash=previous_block.hash if previous_block else "0" * 64,
        )
        
        # Mine the block (simple PoW)
        new_block.mine(self.difficulty)
        
        self.chain.append(new_block)
        return new_block
    
    def is_valid(self) -> bool:
        """Verify the entire blockchain"""
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]
            
            # Check hash
            if current.hash != current.calculate_hash():
                return False
            
            # Check previous hash link
            if current.previous_hash != previous.hash:
                return False
        
        return True
    
    def get_block(self, index: int) -> Optional[Block]:
        """Get block by index"""
        if 0 <= index < len(self.chain):
            return self.chain[index]
        return None
    
    def get_block_by_hash(self, block_hash: str) -> Optional[Block]:
        """Get block by hash"""
        for block in self.chain:
            if block.hash == block_hash:
                return block
        return None
    
    def get_blocks_by_author(self, author: str) -> List[Block]:
        """Get all blocks by author"""
        return [block for block in self.chain if block.author == author]
    
    def __len__(self) -> int:
        """Get total number of blocks"""
        return len(self.chain)
    
    def to_json(self) -> str:
        """Export blockchain to JSON"""
        return json.dumps({
            "chain": [json.loads(block.to_json()) for block in self.chain],
            "difficulty": self.difficulty,
        }, indent=2)
    
    @classmethod
    def from_json(cls, json_str: str) -> "Blockchain":
        """Import blockchain from JSON"""
        data = json.loads(json_str)
        chain = [Block.from_json(json.dumps(block_data)) for block_data in data["chain"]]
        blockchain = cls(chain=chain, difficulty=data["difficulty"])
        return blockchain
    
    def info(self) -> str:
        """Get blockchain info summary"""
        return (
            f"Blockchain Info\n"
            f"================\n"
            f"Total Blocks: {len(self.chain)}\n"
            f"Difficulty: {self.difficulty}\n"
            f"Valid: {'Yes' if self.is_valid() else 'No'}\n"
            f"Latest Block: #{self.chain[-1].index if self.chain else 0}"
        )
