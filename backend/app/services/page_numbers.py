"""
Page Numbers Service
Add page numbers to a PDF with configurable format, position, font and colour.
"""

from pathlib import Path
from typing import Literal
import logging
import io

from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.lib.pagesizes import letter

logger = logging.getLogger(__name__)

POSITIONS = {
    "top-left", "top-center", "top-right",
    "bottom-left", "bottom-center", "bottom-right",
}

FORMATS = {"numeric", "roman", "alpha", "page_n", "n_of_total"}


def _to_roman(n: int) -> str:
    if n <= 0:
        return str(n)
    vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    syms = ["m", "cm", "d", "cd", "c", "xc", "l", "xl", "x", "ix", "v", "iv", "i"]
    result = ""
    for v, s in zip(vals, syms):
        while n >= v:
            result += s
            n -= v
    return result


def _to_alpha(n: int) -> str:
    if n <= 0:
        return str(n)
    result = ""
    while n > 0:
        n -= 1
        result = chr(65 + n % 26) + result
        n //= 26
    return result


def _format_number(num: int, total: int, fmt: str) -> str:
    if fmt == "roman":
        return _to_roman(num)
    if fmt == "alpha":
        return _to_alpha(num)
    if fmt == "page_n":
        return f"Page {num}"
    if fmt == "n_of_total":
        return f"{num} / {total}"
    return str(num)


class PageNumbersService:
    """Stamp page numbers onto a PDF"""

    @staticmethod
    def add_page_numbers(
        input_file: Path,
        output_file: Path,
        *,
        number_format: str = "numeric",
        position: str = "bottom-center",
        start_at: int = 1,
        font_size: int = 10,
        font_weight: str = "regular",
        color_hex: str = "#000000",
        skip_first: bool = False,
    ) -> Path:
        if number_format not in FORMATS:
            raise ValueError(f"Invalid format '{number_format}'. Must be one of {FORMATS}")
        if position not in POSITIONS:
            raise ValueError(f"Invalid position '{position}'. Must be one of {POSITIONS}")

        reader = PdfReader(str(input_file))
        writer = PdfWriter()
        total_pages = len(reader.pages)

        r = int(color_hex[1:3], 16) / 255
        g = int(color_hex[3:5], 16) / 255
        b = int(color_hex[5:7], 16) / 255

        font_name = "Helvetica-Bold" if font_weight == "bold" else "Helvetica"

        current_num = start_at

        for i, page in enumerate(reader.pages):
            if skip_first and i == 0:
                writer.add_page(page)
                continue

            page_w = float(page.mediabox.width)
            page_h = float(page.mediabox.height)

            label = _format_number(current_num, total_pages, number_format)
            current_num += 1

            # Build an overlay with the number
            buf = io.BytesIO()
            c = rl_canvas.Canvas(buf, pagesize=(page_w, page_h))
            c.setFont(font_name, font_size)
            c.setFillColorRGB(r, g, b)

            text_w = c.stringWidth(label, font_name, font_size)
            margin = 36  # 0.5 inch

            if "left" in position:
                x = margin
            elif "right" in position:
                x = page_w - margin - text_w
            else:
                x = (page_w - text_w) / 2

            if "top" in position:
                y = page_h - margin
            else:
                y = margin - font_size  # sit above the very bottom

            c.drawString(x, y, label)
            c.save()

            buf.seek(0)
            overlay_reader = PdfReader(buf)
            page.merge_page(overlay_reader.pages[0])
            writer.add_page(page)

        with open(output_file, "wb") as f:
            writer.write(f)

        logger.info(f"Added page numbers ({number_format}, {position}) -> {output_file.name}")
        return output_file


page_numbers_service = PageNumbersService()
