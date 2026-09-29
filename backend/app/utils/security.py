"""
Security utilities for file validation and sanitization
"""

import re
import magic
from pathlib import Path
from typing import Tuple, Optional
import logging

from fastapi import UploadFile, HTTPException

from app.config import settings

logger = logging.getLogger(__name__)


class SecurityValidator:
    """Validate and sanitize file uploads"""
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """
        Sanitize filename to prevent directory traversal and other attacks
        
        Args:
            filename: Original filename
            
        Returns:
            Sanitized filename
        """
        # Remove path separators
        filename = filename.replace("/", "_").replace("\\", "_")
        
        # Remove any non-alphanumeric characters except dots, dashes, underscores
        filename = re.sub(r'[^\w\s\-\.]', '_', filename)
        
        # Remove multiple dots (potential security risk)
        filename = re.sub(r'\.+', '.', filename)
        
        # Limit filename length
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        if len(name) > 200:
            name = name[:200]
        
        return f"{name}.{ext}" if ext else name
    
    @staticmethod
    def validate_file_size(file_size: int) -> bool:
        """
        Validate file size against maximum allowed
        
        Args:
            file_size: Size of file in bytes
            
        Returns:
            True if valid
            
        Raises:
            HTTPException: If file is too large
        """
        if file_size > settings.MAX_FILE_SIZE:
            max_mb = settings.MAX_FILE_SIZE / (1024 * 1024)
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {max_mb}MB"
            )
        return True
    
    @staticmethod
    def detect_mime_type(file_path: Path) -> str:
        """
        Detect actual MIME type of file using magic numbers
        
        Args:
            file_path: Path to file
            
        Returns:
            Detected MIME type
        """
        try:
            mime = magic.Magic(mime=True)
            mime_type = mime.from_file(str(file_path))
            return mime_type
        except Exception as e:
            logger.error(f"Error detecting MIME type: {e}")
            # Fallback to extension-based detection
            ext = file_path.suffix.lower()
            mime_map = {
                '.pdf': 'application/pdf',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.doc': 'application/msword',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            }
            return mime_map.get(ext, 'application/octet-stream')
    
    @staticmethod
    def validate_mime_type(mime_type: str, allowed_types: Optional[list] = None) -> bool:
        """
        Validate MIME type against allowed types
        
        Args:
            mime_type: MIME type to validate
            allowed_types: List of allowed MIME types (default: from settings)
            
        Returns:
            True if valid
            
        Raises:
            HTTPException: If MIME type not allowed
        """
        if allowed_types is None:
            allowed_types = settings.ALLOWED_MIME_TYPES
        
        if mime_type not in allowed_types:
            raise HTTPException(
                status_code=415,
                detail=f"File type not supported. Allowed types: {', '.join(allowed_types)}"
            )
        return True
    
    @staticmethod
    async def validate_upload_file(
        file: UploadFile,
        allowed_mime_types: Optional[list] = None
    ) -> Tuple[bytes, str]:
        """
        Comprehensive validation of uploaded file
        
        Args:
            file: FastAPI UploadFile object
            allowed_mime_types: List of allowed MIME types
            
        Returns:
            Tuple of (file_content, sanitized_filename)
            
        Raises:
            HTTPException: If validation fails
        """
        # Read file content
        file_content = await file.read()
        
        # Validate size
        SecurityValidator.validate_file_size(len(file_content))
        
        # Sanitize filename
        if settings.SANITIZE_FILENAMES:
            sanitized_name = SecurityValidator.sanitize_filename(file.filename)
        else:
            sanitized_name = file.filename
        
        return file_content, sanitized_name
    
    @staticmethod
    def validate_file_on_disk(
        file_path: Path,
        allowed_mime_types: Optional[list] = None
    ) -> bool:
        """
        Validate a file that's already on disk
        
        Args:
            file_path: Path to file
            allowed_mime_types: List of allowed MIME types
            
        Returns:
            True if valid
            
        Raises:
            HTTPException: If validation fails
        """
        # Check file exists
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # Validate size
        file_size = file_path.stat().st_size
        SecurityValidator.validate_file_size(file_size)
        
        # Validate MIME type
        mime_type = SecurityValidator.detect_mime_type(file_path)
        SecurityValidator.validate_mime_type(mime_type, allowed_mime_types)
        
        return True
    
    @staticmethod
    def validate_page_range(page_range: str, total_pages: int) -> list[int]:
        """
        Validate and parse page range string
        
        Args:
            page_range: Page range string (e.g., "1,3,5-7")
            total_pages: Total number of pages in document
            
        Returns:
            List of page numbers (0-indexed)
            
        Raises:
            HTTPException: If page range is invalid
        """
        try:
            pages = []
            for part in page_range.split(','):
                part = part.strip()
                if '-' in part:
                    start, end = map(int, part.split('-'))
                    pages.extend(range(start - 1, end))  # Convert to 0-indexed
                else:
                    pages.append(int(part) - 1)  # Convert to 0-indexed
            
            # Validate page numbers
            for page in pages:
                if page < 0 or page >= total_pages:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid page number. Document has {total_pages} pages."
                    )
            
            return sorted(list(set(pages)))  # Remove duplicates and sort
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid page range format. Use format like: 1,3,5-7"
            )


# Global validator instance
validator = SecurityValidator()

# okay
