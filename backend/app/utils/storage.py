"""
Storage utilities for handling file uploads, downloads, and cleanup
"""

import os
import uuid
import shutil
from pathlib import Path
from typing import Optional
from datetime import datetime, timedelta
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class StorageManager:
    """Manage file storage operations"""
    
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_unique_filename(self, original_filename: str) -> str:
        """
        Generate a unique filename to prevent collisions
        
        Args:
            original_filename: Original filename from upload
            
        Returns:
            Unique filename with UUID prefix
        """
        # Extract file extension
        _, ext = os.path.splitext(original_filename)
        
        # Generate unique ID
        unique_id = str(uuid.uuid4())
        
        # Create new filename
        return f"{unique_id}{ext}"
    
    def get_file_path(self, filename: str) -> Path:
        """
        Get full path for a filename in upload directory
        
        Args:
            filename: Name of the file
            
        Returns:
            Full path to the file
        """
        return self.upload_dir / filename
    
    async def save_upload_file(self, file_content: bytes, filename: str) -> Path:
        """
        Save uploaded file to disk
        
        Args:
            file_content: File content as bytes
            filename: Filename to save as
            
        Returns:
            Path to saved file
        """
        file_path = self.get_file_path(filename)
        
        try:
            with open(file_path, "wb") as f:
                f.write(file_content)
            
            logger.info(f"Saved file: {filename}")
            return file_path
        except Exception as e:
            logger.error(f"Error saving file {filename}: {e}")
            raise

    def save_file(self, file_content: bytes, filename: str) -> Path:
        """
        Synchronous wrapper to save uploaded file to disk.

        Many parts of the codebase call `storage.save_file(...)` synchronously.
        This method provides that API while delegating to the same logic
        as `save_upload_file` but without requiring an event loop.

        Args:
            file_content: File content as bytes
            filename: Filename to save as

        Returns:
            Path to saved file
        """
        file_path = self.get_file_path(filename)

        try:
            with open(file_path, "wb") as f:
                f.write(file_content)

            logger.info(f"Saved file: {filename}")
            return file_path
        except Exception as e:
            logger.error(f"Error saving file {filename}: {e}")
            raise
    
    def delete_file(self, file_path: Path) -> bool:
        """
        Delete a file from storage
        
        Args:
            file_path: Path to file to delete
            
        Returns:
            True if deleted successfully
        """
        try:
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Deleted file: {file_path.name}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {e}")
            return False
    
    def delete_files(self, file_paths: list[Path]) -> None:
        """
        Delete multiple files from storage
        
        Args:
            file_paths: List of file paths to delete
        """
        for file_path in file_paths:
            self.delete_file(file_path)
    
    def cleanup_old_files(self, max_age_seconds: Optional[int] = None) -> int:
        """
        Clean up files older than specified age
        
        Args:
            max_age_seconds: Maximum age of files in seconds (default: from settings)
            
        Returns:
            Number of files deleted
        """
        if max_age_seconds is None:
            max_age_seconds = settings.FILE_RETENTION_TIME
        
        cutoff_time = datetime.now() - timedelta(seconds=max_age_seconds)
        deleted_count = 0
        
        try:
            for file_path in self.upload_dir.iterdir():
                if file_path.is_file():
                    file_mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                    
                    if file_mtime < cutoff_time:
                        if self.delete_file(file_path):
                            deleted_count += 1
            
            logger.info(f"Cleaned up {deleted_count} old files")
            return deleted_count
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
            return deleted_count
    
    def get_storage_stats(self) -> dict:
        """
        Get storage statistics
        
        Returns:
            Dictionary with storage stats
        """
        try:
            files = list(self.upload_dir.iterdir())
            total_size = sum(f.stat().st_size for f in files if f.is_file())
            
            return {
                "total_files": len(files),
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "upload_dir": str(self.upload_dir)
            }
        except Exception as e:
            logger.error(f"Error getting storage stats: {e}")
            return {}


# Global storage manager instance
storage = StorageManager()

# okay
