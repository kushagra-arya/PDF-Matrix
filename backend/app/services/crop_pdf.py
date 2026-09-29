"""
Crop PDF Service
Crop PDF pages to specified dimensions
"""

from pathlib import Path
import logging

from pypdf import PdfReader, PdfWriter

logger = logging.getLogger(__name__)


class CropPdfService:
    """Service for cropping PDF pages"""
    
    @staticmethod
    def crop_pdf(
        input_file: Path,
        output_file: Path,
        left: float = 0,
        top: float = 0,
        right: float = 0,
        bottom: float = 0,
        page_number: int = None,
        apply_to_all: bool = True
    ) -> Path:
        """
        Crop PDF pages by specified margins
        
        Args:
            input_file: Path to input PDF file
            output_file: Path for output PDF file
            left: Left margin to crop (in points, 72 points = 1 inch)
            top: Top margin to crop (in points)
            right: Right margin to crop (in points)
            bottom: Bottom margin to crop (in points)
            page_number: Specific page to crop (1-indexed), None for all pages
            apply_to_all: If True, apply crop to all pages; if False, only to page_number
            
        Returns:
            Path to output PDF file
            
        Raises:
            Exception: If cropping fails
        """
        try:
            logger.info(f"Cropping PDF: {input_file.name}")
            logger.info(f"Crop margins - Left: {left}, Top: {top}, Right: {right}, Bottom: {bottom}")
            
            # Read PDF
            reader = PdfReader(input_file)
            writer = PdfWriter()
            
            total_pages = len(reader.pages)
            logger.info(f"Processing {total_pages} pages")
            
            # Determine which pages to crop
            if not apply_to_all and page_number:
                pages_to_crop = [page_number]
                logger.info(f"Cropping only page {page_number}")
            else:
                pages_to_crop = range(1, total_pages + 1)
                logger.info(f"Cropping all {total_pages} pages")
            
            # Process each page
            for page_num, page in enumerate(reader.pages, 1):
                # Check if this page should be cropped
                should_crop = page_num in pages_to_crop
                
                if should_crop:
                    # Get current page dimensions
                    media_box = page.mediabox
                    current_width = float(media_box.width)
                    current_height = float(media_box.height)
                    
                    logger.info(f"Page {page_num} original size: {current_width} x {current_height}")
                    
                    # Calculate new dimensions
                    new_lower_left_x = float(media_box.lower_left[0]) + left
                    new_lower_left_y = float(media_box.lower_left[1]) + bottom
                    new_upper_right_x = float(media_box.upper_right[0]) - right
                    new_upper_right_y = float(media_box.upper_right[1]) - top
                    
                    # Validate dimensions
                    if new_upper_right_x <= new_lower_left_x or new_upper_right_y <= new_lower_left_y:
                        raise Exception(f"Invalid crop dimensions for page {page_num}. Crop area too large.")
                    
                    # Apply crop
                    page.mediabox.lower_left = (new_lower_left_x, new_lower_left_y)
                    page.mediabox.upper_right = (new_upper_right_x, new_upper_right_y)
                    
                    # Also update cropbox to match
                    page.cropbox.lower_left = (new_lower_left_x, new_lower_left_y)
                    page.cropbox.upper_right = (new_upper_right_x, new_upper_right_y)
                    
                    new_width = new_upper_right_x - new_lower_left_x
                    new_height = new_upper_right_y - new_lower_left_y
                    logger.info(f"Page {page_num} new size: {new_width} x {new_height}")
                else:
                    logger.info(f"Page {page_num} - not cropped, keeping original dimensions")
                
                # Add all pages to output (cropped or not)
                writer.add_page(page)
            
            # Write output
            with open(output_file, 'wb') as f:
                writer.write(f)
            
            logger.info(f"Successfully cropped PDF: {output_file.name}")
            return output_file
            
        except Exception as e:
            logger.error(f"Error cropping PDF: {e}")
            raise Exception(f"Failed to crop PDF: {str(e)}")

# okay
