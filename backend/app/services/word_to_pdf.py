"""
Word to PDF Service
Convert Word documents to PDF using LibreOffice
"""

from pathlib import Path
import subprocess
import logging
import time
import shutil
import platform

from app.config import settings

logger = logging.getLogger(__name__)


class WordToPdfService:
    """Service for converting Word documents to PDF"""
    
    @staticmethod
    def find_libreoffice() -> str:
        """
        Find LibreOffice executable path
        
        Returns:
            Path to LibreOffice executable
            
        Raises:
            Exception: If LibreOffice is not found
        """
        # Try configured path first
        if Path(settings.LIBREOFFICE_PATH).exists():
            return settings.LIBREOFFICE_PATH
        
        # Common Windows paths
        if platform.system() == "Windows":
            possible_paths = [
                r"C:\Program Files\LibreOffice\program\soffice.exe",
                r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
            ]
            for path in possible_paths:
                if Path(path).exists():
                    return path
                    
            # Try using which/where
            lo_path = shutil.which("soffice")
            if lo_path:
                return lo_path
        else:
            # Linux/Mac
            lo_path = shutil.which("libreoffice") or shutil.which("soffice")
            if lo_path:
                return lo_path
        
        raise Exception(
            "LibreOffice not found. Please install LibreOffice:\n"
            "Windows: Download from https://www.libreoffice.org/download/download-libreoffice/\n"
            "Linux: sudo apt-get install libreoffice\n"
            "Mac: brew install --cask libreoffice"
        )
    
    @staticmethod
    def word_to_pdf(input_file: Path, output_dir: Path) -> Path:
        """
        Convert Word document (.doc, .docx) to PDF using LibreOffice
        
        Args:
            input_file: Path to input Word file
            output_dir: Directory for output PDF
            
        Returns:
            Path to output PDF file
            
        Raises:
            Exception: If conversion fails
        """
        try:
            logger.info(f"Converting Word document to PDF: {input_file.name}")
            
            # Ensure output directory exists
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Find LibreOffice executable
            lo_path = WordToPdfService.find_libreoffice()
            logger.info(f"Using LibreOffice at: {lo_path}")
            
            # Build LibreOffice command with PDF export options
            # --headless: run without GUI
            # --convert-to pdf: convert to PDF format with export filter
            # --outdir: output directory
            # Using PDF Writer export filter for better compatibility
            lo_command = [
                lo_path,
                "--headless",
                "--convert-to",
                "pdf:writer_pdf_Export",
                "--outdir",
                str(output_dir),
                str(input_file)
            ]
            
            # Execute LibreOffice
            result = subprocess.run(
                lo_command,
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout
            )
            
            if result.returncode != 0:
                raise Exception(f"LibreOffice error: {result.stderr}")
            
            # LibreOffice creates PDF with same base name as input
            output_file = output_dir / f"{input_file.stem}.pdf"
            
            # Wait a bit for file to be fully written
            time.sleep(0.5)
            
            # Check if output file was created
            if not output_file.exists():
                raise Exception("Conversion failed - output PDF not created")
            
            logger.info(f"Successfully converted to PDF: {output_file.name}")
            return output_file
            
        except subprocess.TimeoutExpired:
            logger.error("LibreOffice conversion timed out")
            raise Exception("Word to PDF conversion timed out")
        except Exception as e:
            logger.error(f"Error converting Word to PDF: {e}")
            raise Exception(f"Failed to convert Word to PDF: {str(e)}")


# Global service instance
word_to_pdf_service = WordToPdfService()

# okay
