"""
PDF Tools Router
All API endpoints for PDF operations
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import FileResponse
from typing import List, Optional
import asyncio
import logging

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.utils.storage import storage
from app.utils.security import validator
from app.services.merge import merge_service
from app.services.split import split_service
from app.services.compress import compress_service
from app.services.img_to_pdf import img_to_pdf_service
from app.services.word_to_pdf import word_to_pdf_service
from app.services.ppt_to_pdf import PptToPdfService
from app.services.crop_pdf import CropPdfService
from app.services.delete_pages import DeletePagesService
from app.services.ocr_service import OcrService
from app.services.pdf_to_jpg import PdfToJpgService
from app.services.organize_pdf import organize_pdf_service
from app.services.page_numbers import page_numbers_service
from starlette.background import BackgroundTask
import json

logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()


@router.post("/merge")
@limiter.limit("10/minute")
async def merge_pdfs(request: Request, files: List[UploadFile] = File(...)):
    """
    Merge multiple PDF files into one
    
    - **files**: List of PDF files to merge (minimum 2)
    """
    uploaded_files = []
    
    try:
        # Validate minimum number of files
        if len(files) < 2:
            raise HTTPException(status_code=400, detail="At least 2 PDF files required")
        
        # Process each uploaded file
        for file in files:
            # Validate file
            file_content, sanitized_name = await validator.validate_upload_file(
                file,
                allowed_mime_types=["application/pdf"]
            )
            
            # Generate unique filename
            unique_name = storage.generate_unique_filename(sanitized_name)
            
            # Save file
            file_path = await storage.save_upload_file(file_content, unique_name)
            
            # Validate on disk
            validator.validate_file_on_disk(file_path, ["application/pdf"])
            
            uploaded_files.append(file_path)
        
        # Generate output filename
        output_name = storage.generate_unique_filename("merged.pdf")
        output_path = storage.get_file_path(output_name)
        
        # Merge PDFs
        result_path = await asyncio.to_thread(merge_service.merge_pdfs, uploaded_files, output_path)
        
        # Return merged PDF
        return FileResponse(
            path=result_path,
            media_type="application/pdf",
            filename="merged.pdf",
            background=BackgroundTask(storage.delete_files, uploaded_files + [result_path])
        )
        
    except HTTPException:
        # Clean up uploaded files
        storage.delete_files(uploaded_files)
        raise
    except Exception as e:
        # Clean up uploaded files
        storage.delete_files(uploaded_files)
        logger.error(f"Error in merge endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/split")
@limiter.limit("10/minute")
async def split_pdf(
    request: Request,
    file: UploadFile = File(...),
    pages: str = Form(..., description="Page numbers or ranges (e.g., '1,3,5-7')")
):
    """
    Extract specific pages from a PDF
    
    - **file**: PDF file to split
    - **pages**: Page numbers or ranges (e.g., "1,3,5-7")
    """
    uploaded_file = None
    output_file = None
    
    try:
        # Validate and save file
        file_content, sanitized_name = await validator.validate_upload_file(
            file,
            allowed_mime_types=["application/pdf"]
        )
        
        unique_name = storage.generate_unique_filename(sanitized_name)
        uploaded_file = await storage.save_upload_file(file_content, unique_name)
        validator.validate_file_on_disk(uploaded_file, ["application/pdf"])
        
        # Get total pages
        total_pages = await asyncio.to_thread(split_service.get_page_count, uploaded_file)
        
        # Parse and validate page range
        page_list = validator.validate_page_range(pages, total_pages)
        
        # Generate output filename
        output_name = storage.generate_unique_filename("extracted.pdf")
        output_file = storage.get_file_path(output_name)
        
        # Split PDF
        result_path = await asyncio.to_thread(split_service.split_pdf, uploaded_file, page_list, output_file)
        
        # Return extracted PDF
        return FileResponse(
            path=result_path,
            media_type="application/pdf",
            filename="extracted.pdf",
            background=BackgroundTask(storage.delete_files, [uploaded_file, result_path])
        )
        
    except HTTPException:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        raise
    except Exception as e:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        logger.error(f"Error in split endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compress")
@limiter.limit("10/minute")
async def compress_pdf(
    request: Request,
    file: UploadFile = File(...),
    quality: str = Form("ebook", description="Compression quality: screen, ebook, or printer")
):
    """
    Compress a PDF file
    
    - **file**: PDF file to compress
    - **quality**: Quality preset (screen=72dpi, ebook=150dpi, printer=300dpi)
    """
    uploaded_file = None
    output_file = None
    
    try:
        # Validate and save file
        file_content, sanitized_name = await validator.validate_upload_file(
            file,
            allowed_mime_types=["application/pdf"]
        )
        
        unique_name = storage.generate_unique_filename(sanitized_name)
        uploaded_file = await storage.save_upload_file(file_content, unique_name)
        validator.validate_file_on_disk(uploaded_file, ["application/pdf"])
        
        # Generate output filename
        output_name = storage.generate_unique_filename("compressed.pdf")
        output_file = storage.get_file_path(output_name)
        
        # Compress PDF
        result_path = await asyncio.to_thread(compress_service.compress_pdf, uploaded_file, output_file, quality)
        
        # Return compressed PDF
        return FileResponse(
            path=result_path,
            media_type="application/pdf",
            filename="compressed.pdf",
            background=BackgroundTask(storage.delete_files, [uploaded_file, result_path])
        )
        
    except HTTPException:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        raise
    except Exception as e:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        logger.error(f"Error in compress endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/image-to-pdf")
@limiter.limit("10/minute")
async def images_to_pdf(request: Request, files: List[UploadFile] = File(...)):
    """
    Convert images to PDF
    
    - **files**: List of image files (PNG/JPG) to convert
    """
    uploaded_files = []
    output_file = None
    
    try:
        # Validate minimum number of files
        if len(files) < 1:
            raise HTTPException(status_code=400, detail="At least 1 image file required")
        
        # Process each uploaded file
        for file in files:
            # Validate file
            file_content, sanitized_name = await validator.validate_upload_file(
                file,
                allowed_mime_types=["image/png", "image/jpeg", "image/jpg"]
            )
            
            # Generate unique filename
            unique_name = storage.generate_unique_filename(sanitized_name)
            
            # Save file
            file_path = await storage.save_upload_file(file_content, unique_name)
            
            uploaded_files.append(file_path)
        
        # Generate output filename
        output_name = storage.generate_unique_filename("images.pdf")
        output_file = storage.get_file_path(output_name)
        
        # Convert images to PDF
        result_path = await asyncio.to_thread(img_to_pdf_service.images_to_pdf, uploaded_files, output_file)
        
        # Return PDF
        return FileResponse(
            path=result_path,
            media_type="application/pdf",
            filename="images.pdf",
            background=BackgroundTask(storage.delete_files, uploaded_files + [result_path])
        )
        
    except HTTPException:
        storage.delete_files(uploaded_files)
        if output_file:
            storage.delete_file(output_file)
        raise
    except Exception as e:
        storage.delete_files(uploaded_files)
        if output_file:
            storage.delete_file(output_file)
        logger.error(f"Error in image-to-pdf endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/word-to-pdf")
@limiter.limit("10/minute")
async def word_to_pdf(request: Request, file: UploadFile = File(...)):
    """
    Convert Word document to PDF using LibreOffice
    
    - **file**: Word file (.doc or .docx) to convert
    
    **Note:** Complex Word formatting (text boxes, overlapping elements, advanced tables) 
    may not convert perfectly. For best results:
    - Use simple formatting
    - Avoid complex layouts with floating text boxes
    - Test the output before final use
    """
    uploaded_file = None
    output_file = None
    
    try:
        # Validate and save file
        file_content, sanitized_name = await validator.validate_upload_file(
            file,
            allowed_mime_types=[
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ]
        )
        
        unique_name = storage.generate_unique_filename(sanitized_name)
        uploaded_file = await storage.save_upload_file(file_content, unique_name)
        
        # Convert to PDF
        output_file = await asyncio.to_thread(word_to_pdf_service.word_to_pdf, uploaded_file, storage.upload_dir)
        
        # Return PDF
        return FileResponse(
            path=output_file,
            media_type="application/pdf",
            filename=f"{uploaded_file.stem}.pdf",
            background=BackgroundTask(storage.delete_files, [uploaded_file, output_file])
        )
        
    except HTTPException:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        raise
    except Exception as e:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        logger.error(f"Error in word-to-pdf endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/compression-presets")
async def get_compression_presets():
    """Get available compression quality presets"""
    return compress_service.get_available_presets()


@router.post("/ppt-to-pdf")
@limiter.limit("10/minute")
async def ppt_to_pdf(request: Request, file: UploadFile = File(...)):
    """
    Convert PowerPoint presentation to PDF
    
    - **file**: PowerPoint file (.ppt, .pptx)
    
    Returns converted PDF file
    """
    uploaded_file = None
    output_file = None
    
    try:
        # Validate file
        file_content, sanitized_name = await validator.validate_upload_file(file)
        
        # Save uploaded file
        uploaded_file = storage.save_file(file_content, sanitized_name)
        validator.validate_file_on_disk(uploaded_file, [
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ])
        
        # Generate output filename
        output_name = storage.generate_unique_filename("presentation.pdf")
        output_file = storage.get_file_path(output_name)
        
        # Convert to PDF
        result_path = await asyncio.to_thread(PptToPdfService.ppt_to_pdf, uploaded_file, output_file)
        
        # Return PDF
        return FileResponse(
            path=result_path,
            media_type="application/pdf",
            filename="converted.pdf",
            background=BackgroundTask(storage.delete_files, [uploaded_file, result_path])
        )
        
    except HTTPException:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        raise
    except Exception as e:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        logger.error(f"Error in ppt-to-pdf endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/crop")
@limiter.limit("10/minute")
async def crop_pdf(
    request: Request,
    file: UploadFile = File(...),
    left: float = Form(0),
    top: float = Form(0),
    right: float = Form(0),
    bottom: float = Form(0),
    page_number: int = Form(None),
    apply_to_all: bool = Form(True)
):
    """
    Crop PDF pages by specified margins
    
    - **file**: PDF file to crop
    - **left**: Left margin to crop in points (72 points = 1 inch)
    - **top**: Top margin to crop in points
    - **right**: Right margin to crop in points
    - **bottom**: Bottom margin to crop in points
    - **page_number**: Specific page to crop (1-indexed), optional
    - **apply_to_all**: If true, apply to all pages; if false, only to page_number
    """
    uploaded_file = None
    output_file = None
    
    try:
        # Validate file
        file_content, sanitized_name = await validator.validate_upload_file(file)
        
        # Save uploaded file
        uploaded_file = storage.save_file(file_content, sanitized_name)
        validator.validate_file_on_disk(uploaded_file, ["application/pdf"])
        
        # Generate output filename
        output_name = storage.generate_unique_filename("cropped.pdf")
        output_file = storage.get_file_path(output_name)
        
        # Crop PDF
        result_path = await asyncio.to_thread(
            CropPdfService.crop_pdf,
            uploaded_file,
            output_file,
            left, top, right, bottom,
            page_number,
            apply_to_all
        )
        
        # Return PDF
        return FileResponse(
            path=result_path,
            media_type="application/pdf",
            filename="cropped.pdf",
            background=BackgroundTask(storage.delete_files, [uploaded_file, result_path])
        )
        
    except HTTPException:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        raise
    except Exception as e:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        logger.error(f"Error in crop endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/delete-pages")
@limiter.limit("10/minute")
async def delete_pages(
    request: Request,
    file: UploadFile = File(...),
    pages: str = Form(...)
):
    """
    Delete specified pages from PDF
    
    - **file**: PDF file
    - **pages**: Pages to delete (e.g., "1,3,5-7")
    """
    uploaded_file = None
    output_file = None
    
    try:
        logger.info(f"Delete pages request received. Pages: {pages}")
        
        # Validate file
        file_content, sanitized_name = await validator.validate_upload_file(file)
        
        # Save uploaded file
        uploaded_file = storage.save_file(file_content, sanitized_name)
        validator.validate_file_on_disk(uploaded_file, ["application/pdf"])
        
        # Generate output filename
        output_name = storage.generate_unique_filename("pages_deleted.pdf")
        output_file = storage.get_file_path(output_name)
        
        # Delete pages
        result_path = await asyncio.to_thread(DeletePagesService.delete_pages, uploaded_file, output_file, pages)
        logger.info(f"Pages deleted successfully: {result_path}")
        
        # Return PDF
        return FileResponse(
            path=result_path,
            media_type="application/pdf",
            filename="pages_deleted.pdf",
            background=BackgroundTask(storage.delete_files, [uploaded_file, result_path])
        )
        
    except HTTPException:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        raise
    except Exception as e:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        logger.error(f"Error in delete-pages endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ocr")
@limiter.limit("5/minute")
async def ocr_document(
    request: Request,
    file: UploadFile = File(...),
    output_format: str = Form("searchable_pdf"),
    force_ocr: bool = Form(False),
    language: str = Form("eng")
):
    """
    Perform OCR on scanned PDF or image
    
    - **file**: PDF or image file (jpg, png, etc.)
    - **output_format**: Output format - 'searchable_pdf', 'text', or 'docx'
    - **force_ocr**: Force OCR even if PDF has text (default: false)
    - **language**: OCR language code (default: 'eng' for English)
    """
    uploaded_file = None
    output_file = None
    
    try:
        # Validate output format
        valid_formats = ["searchable_pdf", "text", "docx"]
        if output_format not in valid_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid output format. Must be one of: {', '.join(valid_formats)}"
            )
        
        # Validate file
        file_content, sanitized_name = await validator.validate_upload_file(file)
        
        # Save uploaded file
        uploaded_file = storage.save_file(file_content, sanitized_name)
        
        # Validate file type
        file_ext = uploaded_file.suffix.lower()
        allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.bmp']
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Generate output filename
        extension_map = {
            "searchable_pdf": ".pdf",
            "text": ".txt",
            "docx": ".docx"
        }
        output_ext = extension_map[output_format]
        output_name = storage.generate_unique_filename(f"ocr_result{output_ext}")
        output_file = storage.get_file_path(output_name)
        
        # Enforce page limit before heavy OCR processing
        if uploaded_file.suffix.lower() == '.pdf':
            from pypdf import PdfReader as _PdfReader
            page_count = len(_PdfReader(str(uploaded_file)).pages)
            if page_count > 50:
                storage.delete_file(uploaded_file)
                raise HTTPException(
                    status_code=400,
                    detail=f"OCR is limited to 50 pages. Your PDF has {page_count} pages. "
                           f"Please split it into smaller parts first."
                )

        # Process OCR
        logger.info(f"Starting OCR: format={output_format}, force={force_ocr}, lang={language}")
        result_path, ocr_performed = await asyncio.to_thread(
            OcrService.process_ocr,
            uploaded_file,
            output_file,
            output_format,
            force_ocr,
            language
        )
        
        # Determine media type and filename
        media_type_map = {
            "searchable_pdf": "application/pdf",
            "text": "text/plain",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
        media_type = media_type_map[output_format]
        
        # Return file
        return FileResponse(
            path=result_path,
            media_type=media_type,
            filename=f"ocr_result{output_ext}",
            background=lambda: storage.delete_files([uploaded_file, result_path])
        )
        
    except HTTPException:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file and output_file.exists():
            storage.delete_file(output_file)
        raise
    except Exception as e:
        logger.error(f"Error in OCR processing: {e}")
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file and output_file.exists():
            storage.delete_file(output_file)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pdf-to-jpg")
@limiter.limit("5/minute")
async def pdf_to_jpg(
    request: Request,
    file: UploadFile = File(...),
    dpi: int = Form(300),
    quality: int = Form(95)
):
    """
    Convert PDF pages to JPG images
    
    - **file**: PDF file
    - **dpi**: Resolution for images (default: 300)
    - **quality**: JPG quality 1-100 (default: 95)
    """
    uploaded_file = None
    output_folder = None
    
    try:
        # Validate file
        file_content, sanitized_name = await validator.validate_upload_file(
            file,
            allowed_mime_types=['application/pdf']
        )
        
        # Save uploaded file
        uploaded_file = storage.save_file(file_content, sanitized_name)
        
        # Create output folder
        output_folder = storage.get_file_path(f"jpg_output_{uploaded_file.stem}")
        output_folder.mkdir(parents=True, exist_ok=True)
        
        # Convert PDF to JPG
        logger.info(f"Converting PDF to JPG: dpi={dpi}, quality={quality}")
        jpg_files = await asyncio.to_thread(
            PdfToJpgService.pdf_to_jpg,
            uploaded_file,
            output_folder,
            dpi,
            quality
        )
        
        # Always create ZIP file, even for single page
        import zipfile
        import shutil
        
        zip_name = storage.generate_unique_filename(f"{uploaded_file.stem}_images.zip")
        zip_path = storage.get_file_path(zip_name)
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for jpg_file in jpg_files:
                zipf.write(jpg_file, jpg_file.name)
        
        # Clean up individual JPG files and folder
        shutil.rmtree(output_folder, ignore_errors=True)
        
        return FileResponse(
            path=zip_path,
            media_type="application/zip",
            filename=f"{uploaded_file.stem}_images.zip",
            background=BackgroundTask(storage.delete_files, [uploaded_file, zip_path])
        )
        
    except HTTPException:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_folder and output_folder.exists():
            import shutil
            shutil.rmtree(output_folder, ignore_errors=True)
        raise
    except Exception as e:
        logger.error(f"Error in PDF to JPG conversion: {e}")
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_folder and output_folder.exists():
            import shutil
            shutil.rmtree(output_folder, ignore_errors=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/organize")
@limiter.limit("10/minute")
async def organize_pdf(
    request: Request,
    file: UploadFile = File(...),
    operations: str = Form(..., description='JSON array of {"page": 0, "rotation": 0}')
):
    """
    Organize PDF: reorder, rotate and remove pages.

    - **file**: PDF file
    - **operations**: JSON array – each element is {"page": <0-indexed>, "rotation": <0|90|180|270>}.
      Order of elements = page order in output. Omitted pages are deleted.
    """
    uploaded_file = None
    output_file = None

    try:
        try:
            ops = json.loads(operations)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in 'operations' field")

        if not isinstance(ops, list) or len(ops) == 0:
            raise HTTPException(status_code=400, detail="Operations must be a non-empty JSON array")

        file_content, sanitized_name = await validator.validate_upload_file(
            file, allowed_mime_types=["application/pdf"]
        )
        unique_name = storage.generate_unique_filename(sanitized_name)
        uploaded_file = await storage.save_upload_file(file_content, unique_name)
        validator.validate_file_on_disk(uploaded_file, ["application/pdf"])

        output_name = storage.generate_unique_filename("organized.pdf")
        output_file = storage.get_file_path(output_name)

        result_path = await asyncio.to_thread(
            organize_pdf_service.organize, uploaded_file, output_file, ops
        )

        return FileResponse(
            path=result_path,
            media_type="application/pdf",
            filename="organized.pdf",
            background=BackgroundTask(storage.delete_files, [uploaded_file, result_path]),
        )

    except HTTPException:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        raise
    except Exception as e:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        logger.error(f"Error in organize endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/page-numbers")
@limiter.limit("10/minute")
async def add_page_numbers(
    request: Request,
    file: UploadFile = File(...),
    number_format: str = Form("numeric"),
    position: str = Form("bottom-center"),
    start_at: int = Form(1),
    font_size: int = Form(10),
    font_weight: str = Form("regular"),
    color_hex: str = Form("#000000"),
    skip_first: bool = Form(False),
):
    """
    Add page numbers to a PDF.

    - **number_format**: numeric | roman | alpha | page_n | n_of_total
    - **position**: top-left | top-center | top-right | bottom-left | bottom-center | bottom-right
    - **start_at**: number to start counting from (default 1)
    - **font_size**: in points (default 10)
    - **font_weight**: regular | bold
    - **color_hex**: hex colour e.g. #000000
    - **skip_first**: skip numbering on the first page (cover)
    """
    uploaded_file = None
    output_file = None

    try:
        file_content, sanitized_name = await validator.validate_upload_file(
            file, allowed_mime_types=["application/pdf"]
        )
        unique_name = storage.generate_unique_filename(sanitized_name)
        uploaded_file = await storage.save_upload_file(file_content, unique_name)
        validator.validate_file_on_disk(uploaded_file, ["application/pdf"])

        output_name = storage.generate_unique_filename("numbered.pdf")
        output_file = storage.get_file_path(output_name)

        result_path = await asyncio.to_thread(
            page_numbers_service.add_page_numbers,
            uploaded_file,
            output_file,
            number_format=number_format,
            position=position,
            start_at=start_at,
            font_size=font_size,
            font_weight=font_weight,
            color_hex=color_hex,
            skip_first=skip_first,
        )

        return FileResponse(
            path=result_path,
            media_type="application/pdf",
            filename="numbered.pdf",
            background=BackgroundTask(storage.delete_files, [uploaded_file, result_path]),
        )

    except HTTPException:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        raise
    except Exception as e:
        if uploaded_file:
            storage.delete_file(uploaded_file)
        if output_file:
            storage.delete_file(output_file)
        logger.error(f"Error in page-numbers endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))