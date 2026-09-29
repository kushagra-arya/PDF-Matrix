"""
Image to PDF Service
Convert image files to PDF
"""

from pathlib import Path
from typing import List
import logging

import img2pdf
from PIL import Image

logger = logging.getLogger(__name__)


class ImageToPdfService:
    """Service for converting images to PDF"""
    
    @staticmethod
    def images_to_pdf(image_files: List[Path], output_file: Path) -> Path:
        """
        Convert multiple images to a single PDF with A4 portrait layout
        
        Args:
            image_files: List of paths to image files
            output_file: Path for output PDF
            
        Returns:
            Path to output PDF file
            
        Raises:
            Exception: If conversion fails
        """
        try:
            logger.info(f"Converting {len(image_files)} images to PDF")
            
            # A4 dimensions in points (72 points = 1 inch)
            # A4 Portrait: 210mm x 297mm = 595.28 x 841.89 points
            a4_width = 595.28
            a4_height = 841.89
            
            # Validate and prepare images
            valid_images = []
            for img_file in image_files:
                try:
                    # Verify image can be opened
                    with Image.open(img_file) as img:
                        # Convert RGBA to RGB if necessary
                        if img.mode in ('RGBA', 'LA', 'P'):
                            logger.info(f"Converting {img_file.name} from {img.mode} to RGB")
                            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                            if img.mode == 'P':
                                img = img.convert('RGBA')
                            rgb_img.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                            
                            # Save converted image temporarily
                            temp_path = img_file.parent / f"temp_{img_file.name}"
                            rgb_img.save(temp_path, 'PNG')
                            valid_images.append(str(temp_path))
                        else:
                            valid_images.append(str(img_file))
                
                except Exception as e:
                    logger.warning(f"Skipping invalid image {img_file.name}: {e}")
                    continue
            
            if not valid_images:
                raise Exception("No valid images found")
            
            # Convert to PDF with A4 portrait layout
            # img2pdf layout parameters for A4 portrait with fit mode
            layout_fun = img2pdf.get_layout_fun(
                pagesize=(img2pdf.mm_to_pt(210), img2pdf.mm_to_pt(297)),  # A4 portrait
                fit=img2pdf.FitMode.into  # Fit image into page while maintaining aspect ratio
            )
            
            with open(output_file, "wb") as f:
                f.write(img2pdf.convert(valid_images, layout_fun=layout_fun))
            
            # Clean up temporary files
            for img_path in valid_images:
                if "temp_" in img_path:
                    try:
                        Path(img_path).unlink()
                    except:
                        pass
            
            logger.info(f"Successfully converted images to PDF: {output_file.name}")
            return output_file
            
        except Exception as e:
            logger.error(f"Error converting images to PDF: {e}")
            raise Exception(f"Failed to convert images to PDF: {str(e)}")
    
    @staticmethod
    def validate_image(image_file: Path) -> bool:
        """
        Validate that a file is a valid image
        
        Args:
            image_file: Path to image file
            
        Returns:
            True if valid image
        """
        try:
            with Image.open(image_file) as img:
                img.verify()
            return True
        except Exception:
            return False


# Global service instance
img_to_pdf_service = ImageToPdfService()

# okay
