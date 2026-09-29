"""
PDF Merge Service
Merge multiple PDF files into a single PDF
"""

from pathlib import Path
from typing import List
import logging

from pypdf import PdfWriter, PdfReader

logger = logging.getLogger(__name__)


class MergeService:
    """Service for merging PDF files"""
    
    @staticmethod
    def merge_pdfs(input_files: List[Path], output_file: Path) -> Path:
        """
        Merge multiple PDF files into one
        
        Args:
            input_files: List of paths to input PDF files
            output_file: Path for output merged PDF
            
        Returns:
            Path to merged PDF file
            
        Raises:
            Exception: If merge fails
        """
        try:
            logger.info(f"Merging {len(input_files)} PDF files")
            
            # Create PDF writer
            writer = PdfWriter()
            
            # Add pages from each PDF
            for pdf_file in input_files:
                logger.info(f"Adding pages from: {pdf_file.name}")
                reader = PdfReader(str(pdf_file))
                
                # Add all pages from this PDF
                for page in reader.pages:
                    writer.add_page(page)
            
            # Write merged PDF
            with open(output_file, "wb") as f:
                writer.write(f)
            
            logger.info(f"Successfully merged PDFs into: {output_file.name}")
            return output_file
            
        except Exception as e:
            logger.error(f"Error merging PDFs: {e}")
            raise Exception(f"Failed to merge PDFs: {str(e)}")


# Global service instance
merge_service = MergeService()

# okay
