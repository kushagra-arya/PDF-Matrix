"""
PDF Split Service
Extract specific pages from a PDF file
"""

from pathlib import Path
from typing import List
import logging

from pypdf import PdfWriter, PdfReader

logger = logging.getLogger(__name__)


class SplitService:
    """Service for splitting/extracting pages from PDF files"""
    
    @staticmethod
    def split_pdf(input_file: Path, pages: List[int], output_file: Path) -> Path:
        """
        Extract specific pages from a PDF
        
        Args:
            input_file: Path to input PDF file
            pages: List of page numbers to extract (0-indexed)
            output_file: Path for output PDF
            
        Returns:
            Path to output PDF file
            
        Raises:
            Exception: If split fails
        """
        try:
            logger.info(f"Extracting pages {pages} from: {input_file.name}")
            
            # Read input PDF
            reader = PdfReader(str(input_file))
            total_pages = len(reader.pages)
            
            logger.info(f"Input PDF has {total_pages} pages")
            
            # Validate page numbers
            for page_num in pages:
                if page_num < 0 or page_num >= total_pages:
                    raise ValueError(f"Page {page_num + 1} is out of range (1-{total_pages})")
            
            # Create writer and add selected pages
            writer = PdfWriter()
            for page_num in pages:
                writer.add_page(reader.pages[page_num])
            
            # Write output PDF
            with open(output_file, "wb") as f:
                writer.write(f)
            
            logger.info(f"Successfully extracted {len(pages)} pages to: {output_file.name}")
            return output_file
            
        except Exception as e:
            logger.error(f"Error splitting PDF: {e}")
            raise Exception(f"Failed to split PDF: {str(e)}")
    
    @staticmethod
    def get_page_count(pdf_file: Path) -> int:
        """
        Get the number of pages in a PDF
        
        Args:
            pdf_file: Path to PDF file
            
        Returns:
            Number of pages
        """
        try:
            reader = PdfReader(str(pdf_file))
            return len(reader.pages)
        except Exception as e:
            logger.error(f"Error getting page count: {e}")
            raise Exception(f"Failed to read PDF: {str(e)}")


# Global service instance
split_service = SplitService()

# okay
