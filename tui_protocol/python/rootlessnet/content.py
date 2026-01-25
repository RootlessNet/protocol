"""
Content Module
Defines content types that can be uploaded and stored
"""

import hashlib
import base64
import json
from datetime import datetime
from enum import Enum
from typing import Optional, List
from dataclasses import dataclass, field


class ContentType(Enum):
    """Types of content that can be uploaded"""
    TEXT = "text"
    PICTURE = "picture"
    VIDEO = "video"
    FILE = "file"


@dataclass
class Content:
    """Content metadata and data"""
    
    id: str
    content_type: ContentType
    title: str
    description: str
    data: str  # Text or base64 encoded binary
    filename: Optional[str] = None
    mime_type: Optional[str] = None
    size: int = 0
    created_at: int = field(default_factory=lambda: int(datetime.now().timestamp()))
    tags: List[str] = field(default_factory=list)
    
    @classmethod
    def new(
        cls,
        content_type: ContentType,
        data: str,
        title: str,
        description: str,
        filename: Optional[str] = None,
        mime_type: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> "Content":
        """Create new content"""
        size = len(data)
        created_at = int(datetime.now().timestamp())
        content_id = cls._generate_id(data, created_at)
        
        return cls(
            id=content_id,
            content_type=content_type,
            title=title,
            description=description,
            data=data,
            filename=filename,
            mime_type=mime_type,
            size=size,
            created_at=created_at,
            tags=tags or [],
        )
    
    @classmethod
    def text(cls, title: str, description: str, text: str) -> "Content":
        """Create text content"""
        return cls.new(
            content_type=ContentType.TEXT,
            data=text,
            title=title,
            description=description,
            mime_type="text/plain",
        )
    
    @classmethod
    def picture(
        cls,
        title: str,
        description: str,
        file_path: str,
    ) -> "Content":
        """Create picture content from file"""
        with open(file_path, "rb") as f:
            data = base64.b64encode(f.read()).decode()
        
        filename = file_path.split("/")[-1]
        
        # Guess mime type
        if filename.lower().endswith(".png"):
            mime_type = "image/png"
        elif filename.lower().endswith((".jpg", ".jpeg")):
            mime_type = "image/jpeg"
        elif filename.lower().endswith(".gif"):
            mime_type = "image/gif"
        else:
            mime_type = "image/unknown"
        
        return cls.new(
            content_type=ContentType.PICTURE,
            data=data,
            title=title,
            description=description,
            filename=filename,
            mime_type=mime_type,
        )
    
    @classmethod
    def video(
        cls,
        title: str,
        description: str,
        file_path: str,
    ) -> "Content":
        """Create video content from file"""
        with open(file_path, "rb") as f:
            data = base64.b64encode(f.read()).decode()
        
        filename = file_path.split("/")[-1]
        
        # Guess mime type
        if filename.lower().endswith(".mp4"):
            mime_type = "video/mp4"
        elif filename.lower().endswith(".webm"):
            mime_type = "video/webm"
        elif filename.lower().endswith(".avi"):
            mime_type = "video/avi"
        else:
            mime_type = "video/unknown"
        
        return cls.new(
            content_type=ContentType.VIDEO,
            data=data,
            title=title,
            description=description,
            filename=filename,
            mime_type=mime_type,
        )
    
    @classmethod
    def file(
        cls,
        title: str,
        description: str,
        file_path: str,
    ) -> "Content":
        """Create file content from file"""
        with open(file_path, "rb") as f:
            data = base64.b64encode(f.read()).decode()
        
        filename = file_path.split("/")[-1]
        
        return cls.new(
            content_type=ContentType.FILE,
            data=data,
            title=title,
            description=description,
            filename=filename,
        )
    
    @staticmethod
    def _generate_id(data: str, timestamp: int) -> str:
        """Generate content ID from data hash"""
        hasher = hashlib.sha256()
        hasher.update(data.encode())
        hasher.update(str(timestamp).encode())
        return hasher.hexdigest()
    
    def add_tag(self, tag: str) -> None:
        """Add a tag"""
        if tag not in self.tags:
            self.tags.append(tag)
    
    def remove_tag(self, tag: str) -> None:
        """Remove a tag"""
        if tag in self.tags:
            self.tags.remove(tag)
    
    def to_json(self) -> str:
        """Convert to JSON"""
        return json.dumps({
            "id": self.id,
            "content_type": self.content_type.value,
            "title": self.title,
            "description": self.description,
            "data": self.data,
            "filename": self.filename,
            "mime_type": self.mime_type,
            "size": self.size,
            "created_at": self.created_at,
            "tags": self.tags,
        }, indent=2)
    
    @classmethod
    def from_json(cls, json_str: str) -> "Content":
        """Create from JSON"""
        data = json.loads(json_str)
        return cls(
            id=data["id"],
            content_type=ContentType(data["content_type"]),
            title=data["title"],
            description=data["description"],
            data=data["data"],
            filename=data.get("filename"),
            mime_type=data.get("mime_type"),
            size=data["size"],
            created_at=data["created_at"],
            tags=data.get("tags", []),
        )
    
    def info(self) -> str:
        """Get content info summary"""
        dt = datetime.fromtimestamp(self.created_at)
        return (
            f"Content ID: {self.id}\n"
            f"Type: {self.content_type.value}\n"
            f"Title: {self.title}\n"
            f"Description: {self.description}\n"
            f"Size: {self.size} bytes\n"
            f"Created: {dt.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
            f"Tags: {', '.join(self.tags) if self.tags else 'None'}"
        )
    
    def summary(self) -> str:
        """Get short summary"""
        preview = self.data[:50] + "..." if len(self.data) > 50 else self.data
        return f"[{self.content_type.value}] {self.title} - {preview}"
