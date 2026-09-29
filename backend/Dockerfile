# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
# - LibreOffice  : Word/PPT → PDF
# - Ghostscript  : PDF compression
# - Tesseract    : OCR
# - Poppler      : PDF → image (pdf2image)
# - libmagic     : MIME type detection
# - curl         : healthcheck
RUN apt-get update && apt-get install -y \
    ghostscript \
    libreoffice-writer \
    libreoffice-impress \
    libreoffice-common \
    libmagic1 \
    tesseract-ocr \
    poppler-utils \
    curl \
    fonts-liberation \
    fonts-dejavu-core \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./app /app/app

# Create temporary upload directory
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV UPLOAD_DIR=/app/uploads

# Health check — uses $PORT if set (Render), falls back to 8000 (local/compose)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Run the application — $PORT is injected by Render; defaults to 8000 locally
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
