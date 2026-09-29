import io
import os
import sys
import tempfile
from pathlib import Path

import httpx
from reportlab.pdfgen import canvas

API_BASE = os.environ.get('API_BASE', 'http://localhost:8000')

client = httpx.Client(timeout=30.0)


def make_sample_pdf(path: Path, text: str = 'Hello'):
    c = canvas.Canvas(str(path))
    c.drawString(100, 750, text)
    c.showPage()
    c.save()


def save_response(resp: httpx.Response, out_path: Path):
    out_path.write_bytes(resp.content)
    return out_path.stat().st_size


def test_health():
    print('Testing /health')
    r = client.get(f'{API_BASE}/health')
    print('  status:', r.status_code)
    return r.status_code


def test_presets():
    print('Testing /api/pdf/compression-presets')
    r = client.get(f'{API_BASE}/api/pdf/compression-presets')
    print('  status:', r.status_code, 'body:', r.text[:200])
    return r.status_code


def test_merge(pdf1, pdf2, out_dir: Path):
    print('Testing /api/pdf/merge')
    files = [
        ('files', (pdf1.name, pdf1.open('rb'), 'application/pdf')),
        ('files', (pdf2.name, pdf2.open('rb'), 'application/pdf')),
    ]
    r = client.post(f'{API_BASE}/api/pdf/merge', files=files)
    print('  status:', r.status_code)
    if r.status_code == 200:
        out = out_dir / 'merged.pdf'
        size = save_response(r, out)
        print('  saved:', out, 'size:', size)


def test_split(pdf, out_dir: Path):
    print('Testing /api/pdf/split')
    files = {'file': (pdf.name, pdf.open('rb'), 'application/pdf')}
    data = {'pages': '1'}
    r = client.post(f'{API_BASE}/api/pdf/split', files=files, data=data)
    print('  status:', r.status_code)
    if r.status_code == 200:
        out = out_dir / 'extracted.pdf'
        size = save_response(r, out)
        print('  saved:', out, 'size:', size)


def test_compress(pdf, out_dir: Path):
    print('Testing /api/pdf/compress')
    files = {'file': (pdf.name, pdf.open('rb'), 'application/pdf')}
    data = {'quality': 'ebook'}
    r = client.post(f'{API_BASE}/api/pdf/compress', files=files, data=data)
    print('  status:', r.status_code)
    if r.status_code == 200:
        out = out_dir / 'compressed.pdf'
        size = save_response(r, out)
        print('  saved:', out, 'size:', size)


def test_crop(pdf, out_dir: Path):
    print('Testing /api/pdf/crop')
    files = {'file': (pdf.name, pdf.open('rb'), 'application/pdf')}
    # small crop margins in points (0.5 inch = 36 points)
    data = {'left': '36', 'top': '36', 'right': '36', 'bottom': '36', 'apply_to_all': 'true'}
    r = client.post(f'{API_BASE}/api/pdf/crop', files=files, data=data)
    print('  status:', r.status_code)
    if r.status_code == 200:
        out = out_dir / 'cropped.pdf'
        size = save_response(r, out)
        print('  saved:', out, 'size:', size)


def test_delete_pages(pdf, out_dir: Path):
    print('Testing /api/pdf/delete-pages')
    files = {'file': (pdf.name, pdf.open('rb'), 'application/pdf')}
    data = {'pages': '1'}
    r = client.post(f'{API_BASE}/api/pdf/delete-pages', files=files, data=data)
    print('  status:', r.status_code)
    if r.status_code == 200:
        out = out_dir / 'pages_deleted.pdf'
        size = save_response(r, out)
        print('  saved:', out, 'size:', size)


if __name__ == '__main__':
    tmp = Path(tempfile.mkdtemp(prefix='pdf_mini_test_'))
    print('Temp dir:', tmp)

    pdf1 = tmp / 'a.pdf'
    pdf2 = tmp / 'b.pdf'

    make_sample_pdf(pdf1, 'PDF A')
    make_sample_pdf(pdf2, 'PDF B')

    # create a 2-page for delete-pages test
    pdf_multi = tmp / 'multi.pdf'
    make_sample_pdf(pdf_multi, 'Page 1')
    # append page 2 by creating another and merging via http merge? simpler: copy pdf1 twice
    # For our purposes, use pdf1 and pdf2 merged via endpoint to produce multi.pdf
    
    out_dir = tmp / 'out'
    out_dir.mkdir(exist_ok=True)

    try:
        test_health()
        test_presets()
        test_merge(pdf1, pdf2, out_dir)
        # use merged result for subsequent tests if available
        merged = out_dir / 'merged.pdf'
        if merged.exists():
            test_split(merged, out_dir)
            test_compress(merged, out_dir)
            test_crop(merged, out_dir)
            test_delete_pages(merged, out_dir)
        else:
            print('Merged PDF not found; skipping dependent tests')
    except Exception as e:
        print('Error during tests:', e)
    finally:
        print('Smoke tests complete. Outputs in', out_dir)

# okay
