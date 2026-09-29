"""
PowerPoint to PDF Service
Convert PowerPoint presentations to PDF format
"""

from pathlib import Path
import logging
import subprocess
import shutil
import os

from app.config import settings

logger = logging.getLogger(__name__)


class PptToPdfService:
    """Service for converting PowerPoint to PDF"""
    
    @staticmethod
    def find_libreoffice() -> str:
        """Find LibreOffice installation"""
        # Try configured path first
        if settings.LIBREOFFICE_PATH and os.path.exists(settings.LIBREOFFICE_PATH):
            return settings.LIBREOFFICE_PATH
        
        # Common Windows paths
        common_paths = [
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                logger.info(f"Found LibreOffice at: {path}")
                return path
        
        # Try to find via which/where
        libreoffice_cmd = shutil.which("soffice")
        if libreoffice_cmd:
            logger.info(f"Found LibreOffice via PATH: {libreoffice_cmd}")
            return libreoffice_cmd
        
        raise Exception(
            "LibreOffice not found. Please install LibreOffice and configure LIBREOFFICE_PATH in .env file.\n"
            "Download from: https://www.libreoffice.org/download/download/"
        )
    
    @staticmethod
    def ppt_to_pdf(input_file: Path, output_file: Path) -> Path:
        """
        Convert PowerPoint to PDF using LibreOffice
        
        Args:
            input_file: Path to input PowerPoint file (.ppt, .pptx)
            output_file: Path for output PDF file
            
        Returns:
            Path to output PDF file
            
        Raises:
            Exception: If conversion fails
        """
        try:
            logger.info(f"Converting PowerPoint to PDF: {input_file.name}")
            
            # Find LibreOffice
            libreoffice_path = PptToPdfService.find_libreoffice()
            
            # Create temp directory for output
            temp_dir = output_file.parent
            
            # LibreOffice command for PPT to PDF conversion
            cmd = [
                libreoffice_path,
                '--headless',
                '--convert-to', 'pdf',
                '--outdir', str(temp_dir),
                str(input_file)
            ]
            
            logger.info(f"Running LibreOffice command: {' '.join(cmd)}")
            
            # Run conversion
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout
            )
            
            if result.returncode != 0:
                error_msg = result.stderr or result.stdout or "Unknown error"
                logger.error(f"LibreOffice conversion failed: {error_msg}")
                raise Exception(f"Conversion failed: {error_msg}")
            
            # LibreOffice creates PDF with same name as input
            expected_output = temp_dir / f"{input_file.stem}.pdf"
            
            if not expected_output.exists():
                raise Exception("Conversion completed but output file not found")
            
            # Rename if needed
            if expected_output != output_file:
                if output_file.exists():
                    output_file.unlink()
                expected_output.rename(output_file)
            
            logger.info(f"Successfully converted PowerPoint to PDF: {output_file.name}")
            return output_file
            
        except subprocess.TimeoutExpired:
            logger.error("LibreOffice conversion timed out")
            raise Exception("Conversion timed out. The presentation might be too large or complex.")
        except Exception as e:
            logger.error(f"Error converting PowerPoint to PDF: {e}")
            raise Exception(f"Failed to convert PowerPoint to PDF: {str(e)}")

# okay
