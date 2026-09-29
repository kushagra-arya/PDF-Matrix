"""
Delete Pages Service
Remove specific pages from PDF
"""

from pathlib import Path
import logging
from typing import List

from pypdf import PdfReader, PdfWriter

logger = logging.getLogger(__name__)


class DeletePagesService:
    """Service for deleting pages from PDF"""
    
    @staticmethod
    def parse_page_ranges(pages_str: str, total_pages: int) -> List[int]:
        """
        Parse page ranges string into list of page numbers
        
        Examples:
            "1,3,5" -> [1, 3, 5]
            "1-3,5" -> [1, 2, 3, 5]
            "1-3,5,7-9" -> [1, 2, 3, 5, 7, 8, 9]
        
        Args:
            pages_str: String with page numbers/ranges (1-based)
            total_pages: Total number of pages in document
            
        Returns:
            List of page numbers to delete (1-based)
        """
        pages_to_delete = set()
        
        # Split by comma
        parts = pages_str.split(',')
        
        for part in parts:
            part = part.strip()
            
            if '-' in part:
                # Range
                try:
                    start, end = part.split('-')
                    start = int(start.strip())
                    end = int(end.strip())
                    
                    if start < 1 or end > total_pages or start > end:
                        raise ValueError(f"Invalid range: {part}")
                    
                    pages_to_delete.update(range(start, end + 1))
                except ValueError as e:
                    raise ValueError(f"Invalid page range '{part}': {str(e)}")
            else:
                # Single page
                try:
                    page_num = int(part)
                    if page_num < 1 or page_num > total_pages:
                        raise ValueError(f"Page {page_num} out of range (1-{total_pages})")
                    pages_to_delete.add(page_num)
                except ValueError as e:
                    raise ValueError(f"Invalid page number '{part}': {str(e)}")
        
        return sorted(list(pages_to_delete))
    
    @staticmethod
    def delete_pages(input_file: Path, output_file: Path, pages_to_delete: str) -> Path:
        """
        Delete specified pages from PDF
        
        Args:
            input_file: Path to input PDF file
            output_file: Path for output PDF file
            pages_to_delete: Comma-separated page numbers or ranges (e.g., "1,3,5-7")
            
        Returns:
            Path to output PDF file
            
        Raises:
            Exception: If deletion fails
        """
        try:
            logger.info(f"Deleting pages from PDF: {input_file.name}")
            logger.info(f"Pages to delete: {pages_to_delete}")
            
            # Read PDF
            reader = PdfReader(input_file)
            total_pages = len(reader.pages)
            
            logger.info(f"Total pages: {total_pages}")
            
            # Parse pages to delete
            delete_list = DeletePagesService.parse_page_ranges(pages_to_delete, total_pages)
            
            if not delete_list:
                raise Exception("No valid pages specified for deletion")
            
            if len(delete_list) >= total_pages:
                raise Exception("Cannot delete all pages. At least one page must remain.")
            
            logger.info(f"Deleting {len(delete_list)} pages: {delete_list}")
            
            # Create writer and add pages that should be kept
            writer = PdfWriter()
            pages_kept = 0
            
            for page_num in range(1, total_pages + 1):
                if page_num not in delete_list:
                    writer.add_page(reader.pages[page_num - 1])
                    pages_kept += 1
            
            if pages_kept == 0:
                raise Exception("No pages would remain after deletion")
            
            # Write output
            with open(output_file, 'wb') as f:
                writer.write(f)
            
            logger.info(f"Successfully deleted pages. Remaining pages: {pages_kept}")
            return output_file
            
        except Exception as e:
            logger.error(f"Error deleting pages: {e}")
            raise Exception(f"Failed to delete pages: {str(e)}")

# okay
