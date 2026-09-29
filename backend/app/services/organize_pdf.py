"""
Organize PDF Service
Reorder, rotate and delete pages from a PDF
"""

from pathlib import Path
from typing import List, Dict
import logging
import json

from pypdf import PdfWriter, PdfReader

logger = logging.getLogger(__name__)


class OrganizePdfService:
    """Service for organising PDF pages - reorder, rotate, delete"""

    @staticmethod
    def get_page_count(input_file: Path) -> int:
        reader = PdfReader(str(input_file))
        return len(reader.pages)

    @staticmethod
    def organize(input_file: Path, output_file: Path, operations: List[Dict]) -> Path:
        """
        Apply page-level operations and produce a new PDF.

        Args:
            input_file: source PDF
            output_file: destination PDF
            operations: ordered list of dicts, each with:
                - page  (int, 0-indexed page number in the *original* PDF)
                - rotation (int, degrees clockwise to add: 0 / 90 / 180 / 270)

        Pages not listed are considered deleted.
        The order of the list determines the page order in the output.
        """
        try:
            reader = PdfReader(str(input_file))
            total = len(reader.pages)
            writer = PdfWriter()

            for op in operations:
                idx = op["page"]
                rotation = op.get("rotation", 0)

                if idx < 0 or idx >= total:
                    raise ValueError(f"Page index {idx} out of range (0-{total - 1})")

                page = reader.pages[idx]
                if rotation:
                    page = page.rotate(rotation)
                writer.add_page(page)

            with open(output_file, "wb") as f:
                writer.write(f)

            logger.info(
                f"Organized PDF: kept {len(operations)}/{total} pages -> {output_file.name}"
            )
            return output_file

        except Exception as e:
            logger.error(f"Error organising PDF: {e}")
            raise Exception(f"Failed to organise PDF: {str(e)}")


organize_pdf_service = OrganizePdfService()
