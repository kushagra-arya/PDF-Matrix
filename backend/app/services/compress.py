"""
PDF Compress Service
Compress PDF files using Ghostscript
"""

from pathlib import Path
import subprocess
import logging
import shutil
import platform

from app.config import settings

logger = logging.getLogger(__name__)


class CompressService:
    """Service for compressing PDF files"""
    
    @staticmethod
    def find_ghostscript() -> str:
        """
        Find Ghostscript executable path
        
        Returns:
            Path to Ghostscript executable
            
        Raises:
            Exception: If Ghostscript is not found
        """
        # Try configured path first (check if it's a full path or command name)
        if settings.GHOSTSCRIPT_PATH:
            # If it's a full path, check if it exists
            if Path(settings.GHOSTSCRIPT_PATH).exists():
                return settings.GHOSTSCRIPT_PATH
            # Otherwise, try to find it in PATH
            gs_in_path = shutil.which(settings.GHOSTSCRIPT_PATH)
            if gs_in_path:
                return gs_in_path
        
        # Common Windows paths
        if platform.system() == "Windows":
            possible_names = ["gswin64c", "gswin32c", "gs"]
            for name in possible_names:
                gs_path = shutil.which(name)
                if gs_path:
                    return gs_path
        else:
            # Linux/Mac
            gs_path = shutil.which("gs")
            if gs_path:
                return gs_path
        
        raise Exception(
            "Ghostscript not found. Please install Ghostscript:\n"
            "Windows: Download from https://ghostscript.com/releases/gsdnld.html\n"
            "Linux: sudo apt-get install ghostscript\n"
            "Mac: brew install ghostscript"
        )
    
    @staticmethod
    def compress_pdf(
        input_file: Path,
        output_file: Path,
        quality: str = "ebook"
    ) -> Path:
        """
        Compress a PDF file using Ghostscript
        
        Args:
            input_file: Path to input PDF file
            output_file: Path for output compressed PDF
            quality: Quality preset (screen, ebook, printer)
            
        Returns:
            Path to compressed PDF file
            
        Raises:
            Exception: If compression fails
        """
        try:
            # Validate quality preset
            if quality not in settings.COMPRESSION_PRESETS:
                raise ValueError(f"Invalid quality preset. Choose from: {list(settings.COMPRESSION_PRESETS.keys())}")
            
            preset = settings.COMPRESSION_PRESETS[quality]
            logger.info(f"Compressing PDF with quality: {quality} ({preset['description']})")
            
            # Find Ghostscript executable
            gs_path = CompressService.find_ghostscript()
            logger.info(f"Using Ghostscript at: {gs_path}")
            
            # Build Ghostscript command
            gs_command = [
                gs_path,
                "-sDEVICE=pdfwrite",
                "-dCompatibilityLevel=1.4",
                f"-dPDFSETTINGS=/{preset['quality']}",
                "-dNOPAUSE",
                "-dQUIET",
                "-dBATCH",
                f"-sOutputFile={output_file}",
                str(input_file)
            ]
            
            # Execute Ghostscript
            result = subprocess.run(
                gs_command,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if result.returncode != 0:
                raise Exception(f"Ghostscript error: {result.stderr}")
            
            # Check if output file was created
            if not output_file.exists():
                raise Exception("Compression failed - output file not created")
            
            # Get file sizes for logging
            input_size = input_file.stat().st_size
            output_size = output_file.stat().st_size
            compression_ratio = (1 - output_size / input_size) * 100 if input_size > 0 else 0
            
            logger.info(
                f"Compression complete. "
                f"Original: {input_size / 1024:.2f}KB, "
                f"Compressed: {output_size / 1024:.2f}KB, "
                f"Saved: {compression_ratio:.1f}%"
            )
            
            return output_file
            
        except subprocess.TimeoutExpired:
            logger.error("Ghostscript compression timed out")
            raise Exception("PDF compression timed out")
        except Exception as e:
            logger.error(f"Error compressing PDF: {e}")
            raise Exception(f"Failed to compress PDF: {str(e)}")
    
    @staticmethod
    def get_available_presets() -> dict:
        """
        Get available compression quality presets
        
        Returns:
            Dictionary of available presets
        """
        return settings.COMPRESSION_PRESETS


# Global service instance
compress_service = CompressService()

# okay
