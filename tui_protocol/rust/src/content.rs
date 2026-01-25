//! Content Module
//! Defines content types that can be uploaded and stored

use pyo3::prelude::*;
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use chrono::Utc;

/// Types of content that can be uploaded
#[pyclass]
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum ContentType {
    /// Text content (posts, comments)
    Text,
    /// Image/Picture content
    Picture,
    /// Video content
    Video,
    /// Generic file content
    File,
}

#[pymethods]
impl ContentType {
    /// Get string representation
    fn __str__(&self) -> String {
        match self {
            ContentType::Text => "Text".to_string(),
            ContentType::Picture => "Picture".to_string(),
            ContentType::Video => "Video".to_string(),
            ContentType::File => "File".to_string(),
        }
    }
    
    /// Create ContentType from string
    #[staticmethod]
    pub fn from_str(s: &str) -> PyResult<Self> {
        match s.to_lowercase().as_str() {
            "text" => Ok(ContentType::Text),
            "picture" | "image" => Ok(ContentType::Picture),
            "video" => Ok(ContentType::Video),
            "file" => Ok(ContentType::File),
            _ => Err(PyErr::new::<pyo3::exceptions::PyValueError, _>(
                format!("Unknown content type: {}", s)
            ))
        }
    }
}

/// Content metadata and data
#[pyclass]
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Content {
    /// Unique content ID (hash of content)
    #[pyo3(get)]
    pub id: String,
    
    /// Type of content
    #[pyo3(get)]
    pub content_type: ContentType,
    
    /// Title of the content
    #[pyo3(get)]
    pub title: String,
    
    /// Description of the content
    #[pyo3(get)]
    pub description: String,
    
    /// The actual content data (text, base64 for binary)
    #[pyo3(get)]
    pub data: String,
    
    /// File name (for files/media)
    #[pyo3(get)]
    pub filename: Option<String>,
    
    /// MIME type
    #[pyo3(get)]
    pub mime_type: Option<String>,
    
    /// Size in bytes
    #[pyo3(get)]
    pub size: u64,
    
    /// Creation timestamp
    #[pyo3(get)]
    pub created_at: i64,
    
    /// Tags for the content
    #[pyo3(get)]
    pub tags: Vec<String>,
}

#[pymethods]
impl Content {
    /// Create new content
    #[new]
    #[pyo3(signature = (content_type, data, title, description, filename=None, mime_type=None, tags=None))]
    pub fn new(
        content_type: ContentType,
        data: String,
        title: String,
        description: String,
        filename: Option<String>,
        mime_type: Option<String>,
        tags: Option<Vec<String>>,
    ) -> Self {
        let size = data.len() as u64;
        let created_at = Utc::now().timestamp();
        
        // Generate content ID from hash
        let id = Self::generate_id(&data, created_at);
        
        Content {
            id,
            content_type,
            title,
            description,
            data,
            filename,
            mime_type,
            size,
            created_at,
            tags: tags.unwrap_or_default(),
        }
    }
    
    /// Create text content
    #[staticmethod]
    pub fn text(title: String, description: String, text: String) -> Self {
        Content::new(
            ContentType::Text,
            text,
            title,
            description,
            None,
            Some("text/plain".to_string()),
            None,
        )
    }
    
    /// Create picture content from base64 data
    #[staticmethod]
    #[pyo3(signature = (title, description, base64_data, filename, mime_type=None))]
    pub fn picture(
        title: String,
        description: String,
        base64_data: String,
        filename: String,
        mime_type: Option<String>,
    ) -> Self {
        let mime = mime_type.unwrap_or_else(|| {
            if filename.ends_with(".png") {
                "image/png".to_string()
            } else if filename.ends_with(".jpg") || filename.ends_with(".jpeg") {
                "image/jpeg".to_string()
            } else if filename.ends_with(".gif") {
                "image/gif".to_string()
            } else {
                "image/unknown".to_string()
            }
        });
        
        Content::new(
            ContentType::Picture,
            base64_data,
            title,
            description,
            Some(filename),
            Some(mime),
            None,
        )
    }
    
    /// Create video content from base64 data
    #[staticmethod]
    #[pyo3(signature = (title, description, base64_data, filename, mime_type=None))]
    pub fn video(
        title: String,
        description: String,
        base64_data: String,
        filename: String,
        mime_type: Option<String>,
    ) -> Self {
        let mime = mime_type.unwrap_or_else(|| {
            if filename.ends_with(".mp4") {
                "video/mp4".to_string()
            } else if filename.ends_with(".webm") {
                "video/webm".to_string()
            } else if filename.ends_with(".avi") {
                "video/avi".to_string()
            } else {
                "video/unknown".to_string()
            }
        });
        
        Content::new(
            ContentType::Video,
            base64_data,
            title,
            description,
            Some(filename),
            Some(mime),
            None,
        )
    }
    
    /// Create file content from base64 data
    #[staticmethod]
    #[pyo3(signature = (title, description, base64_data, filename, mime_type=None))]
    pub fn file(
        title: String,
        description: String,
        base64_data: String,
        filename: String,
        mime_type: Option<String>,
    ) -> Self {
        Content::new(
            ContentType::File,
            base64_data,
            title,
            description,
            Some(filename),
            mime_type,
            None,
        )
    }
    
    /// Generate content ID from data hash
    #[staticmethod]
    fn generate_id(data: &str, timestamp: i64) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        hasher.update(timestamp.to_string().as_bytes());
        hex::encode(hasher.finalize())
    }
    
    /// Add a tag
    pub fn add_tag(&mut self, tag: String) {
        if !self.tags.contains(&tag) {
            self.tags.push(tag);
        }
    }
    
    /// Remove a tag
    pub fn remove_tag(&mut self, tag: &str) {
        self.tags.retain(|t| t != tag);
    }
    
    /// Convert to JSON
    pub fn to_json(&self) -> PyResult<String> {
        serde_json::to_string_pretty(self)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }
    
    /// Create from JSON
    #[staticmethod]
    pub fn from_json(json_str: &str) -> PyResult<Self> {
        serde_json::from_str(json_str)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))
    }
    
    /// Get content info summary
    pub fn info(&self) -> String {
        format!(
            "Content ID: {}\n\
             Type: {:?}\n\
             Title: {}\n\
             Description: {}\n\
             Size: {} bytes\n\
             Created: {}\n\
             Tags: {}",
            self.id,
            self.content_type,
            self.title,
            self.description,
            self.size,
            chrono::DateTime::from_timestamp(self.created_at, 0)
                .map(|dt| dt.format("%Y-%m-%d %H:%M:%S UTC").to_string())
                .unwrap_or_else(|| "Unknown".to_string()),
            if self.tags.is_empty() { "None".to_string() } else { self.tags.join(", ") }
        )
    }
    
    /// Get short summary
    pub fn summary(&self) -> String {
        let preview = if self.data.len() > 50 {
            format!("{}...", &self.data[..50])
        } else {
            self.data.clone()
        };
        
        format!("[{:?}] {} - {}", self.content_type, self.title, preview)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_text_content() {
        let content = Content::text(
            "Test Title".to_string(),
            "Test Description".to_string(),
            "Hello, World!".to_string(),
        );
        
        assert_eq!(content.content_type, ContentType::Text);
        assert_eq!(content.title, "Test Title");
        assert!(!content.id.is_empty());
    }

    #[test]
    fn test_picture_content() {
        let content = Content::picture(
            "My Photo".to_string(),
            "A beautiful sunset".to_string(),
            "base64encodeddata".to_string(),
            "sunset.jpg".to_string(),
            None,
        );
        
        assert_eq!(content.content_type, ContentType::Picture);
        assert_eq!(content.mime_type, Some("image/jpeg".to_string()));
    }

    #[test]
    fn test_tags() {
        let mut content = Content::text(
            "Tagged Post".to_string(),
            "Description".to_string(),
            "Content with tags".to_string(),
        );
        
        content.add_tag("rust".to_string());
        content.add_tag("blockchain".to_string());
        
        assert_eq!(content.tags.len(), 2);
        assert!(content.tags.contains(&"rust".to_string()));
        
        content.remove_tag("rust");
        assert_eq!(content.tags.len(), 1);
    }
}
