"""
PDF to JPG Service
Convert PDF pages to JPG images
"""

from pathlib import Path
from typing import List
import logging
from pdf2image import convert_from_path
from PIL import Image
from pypdf import PdfReader

logger = logging.getLogger(__name__)


class PdfToJpgService:
    """Service for converting PDF to JPG images"""
    
    @staticmethod
    def pdf_to_jpg(
        pdf_path: Path,
        output_folder: Path,
        dpi: int = 300,
        quality: int = 95
    ) -> List[Path]:
        """
        Convert PDF pages to JPG images
        
        Args:
            pdf_path: Path to input PDF
            output_folder: Folder to save JPG images
            dpi: Resolution for conversion (default: 300)
            quality: JPG quality 1-100 (default: 95)
            
        Returns:
            List of paths to created JPG files
        """
        try:
            logger.info(f"Converting PDF to JPG: {pdf_path.name}")
            
            # Verify PDF file exists and is readable
            if not pdf_path.exists():
                raise FileNotFoundError(f"PDF file not found: {pdf_path}")
            
            # Validate PDF is readable and get page count
            try:
                reader = PdfReader(str(pdf_path))
                
                # Handle encrypted PDFs
                if reader.is_encrypted:
                    try:
                        reader.decrypt('')  # Try empty password
                        logger.info("PDF was encrypted, decrypted with empty password")
                    except Exception:
                        raise Exception("PDF is password protected. Please remove the password and try again.")
                
                num_pages = len(reader.pages)
                logger.info(f"PDF has {num_pages} pages")
                
                if num_pages == 0:
                    raise Exception("PDF has no pages")
            except Exception as pdf_error:
                logger.error(f"PDF validation error: {pdf_error}")
                if "password" in str(pdf_error).lower():
                    raise Exception(str(pdf_error))
                raise Exception(f"Invalid or corrupted PDF file: {str(pdf_error)}")
            
            # Create output folder if it doesn't exist
            output_folder.mkdir(parents=True, exist_ok=True)
            
            # Convert PDF to images using Poppler
            poppler_path = r'C:\Program Files\poppler\Library\bin'
            
            try:
                logger.info(f"Attempting conversion with DPI={dpi}, poppler_path={poppler_path}")
                images = convert_from_path(
                    str(pdf_path),
                    dpi=dpi,
                    poppler_path=poppler_path,
                    fmt='jpeg',
                    thread_count=2
                )
                logger.info(f"Conversion successful with explicit poppler path")
            except Exception as conv_error:
                error_msg = str(conv_error)
                logger.error(f"Poppler conversion error: {error_msg}")
                
                # Try without explicit poppler path (if it's in system PATH)
                try:
                    logger.info("Retrying without explicit poppler_path...")
                    images = convert_from_path(
                        str(pdf_path),
                        dpi=dpi,
                        fmt='jpeg',
                        thread_count=2
                    )
                    logger.info(f"Conversion successful without explicit path")
                except Exception as fallback_error:
                    logger.error(f"Fallback also failed: {fallback_error}")
                    
                    # Provide specific error messages
                    if "Unable to get page count" in error_msg:
                        raise Exception("Unable to read PDF file. The file may be corrupted, use an unsupported PDF version, or have complex security features. Please try: 1) Re-saving the PDF in a different viewer, 2) Ensuring it's not password protected, 3) Converting to PDF/A format.")
                    elif "poppler" in error_msg.lower():
                        raise Exception("PDF conversion tool (Poppler) error. Please try a simpler PDF file.")
                    else:
                        raise Exception(f"Failed to convert PDF to images: {error_msg}")
            
            if not images:
                raise Exception("No images generated from PDF")
            
            logger.info(f"Converted {len(images)} pages to images")
            
            # Save each page as JPG
            output_files = []
            base_name = pdf_path.stem
            
            for i, image in enumerate(images, 1):
                output_file = output_folder / f"{base_name}_page_{i}.jpg"
                
                # Convert RGBA to RGB if necessary
                if image.mode == 'RGBA':
                    rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                    rgb_image.paste(image, mask=image.split()[3])
                    image = rgb_image
                elif image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Save as JPG
                image.save(output_file, 'JPEG', quality=quality, optimize=True)
                output_files.append(output_file)
                logger.info(f"Saved page {i} to {output_file.name}")
            
            logger.info(f"Successfully converted PDF to {len(output_files)} JPG images")
            return output_files
            
        except FileNotFoundError as e:
            logger.error(f"File not found: {e}")
            raise Exception(f"PDF file not found: {str(e)}")
        except Exception as e:
            logger.error(f"Error converting PDF to JPG: {e}", exc_info=True)
            raise Exception(f"Failed to convert PDF to JPG: {str(e)}")

# okay
