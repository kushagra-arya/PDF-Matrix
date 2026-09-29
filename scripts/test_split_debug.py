import os
from pathlib import Path
import tempfile
import httpx

API_BASE = os.environ.get('API_BASE', 'http://localhost:8000')
client = httpx.Client(timeout=60.0)

import glob
merged = None
env_path = os.environ.get('MERGED_PDF')
if env_path:
    merged = Path(env_path)
if not merged or not merged.exists():
    # try to find merged in temp out directories
    pattern = os.path.join(tempfile.gettempdir(), 'pdf_mini_test_*', 'out', 'merged.pdf')
    matches = glob.glob(pattern)
    if matches:
        merged = Path(matches[0])

if not merged or not merged.exists():
    print('Merged PDF not found; run smoke_test first')
    raise SystemExit(1)

print('Using merged:', merged)

files = {'file': (merged.name, merged.open('rb'), 'application/pdf')}
data = {'pages': '1'}

try:
    r = client.post(f'{API_BASE}/api/pdf/split', files=files, data=data)
    print('Status:', r.status_code)
    print('Headers:', r.headers)
    print('Content length:', len(r.content))
    if r.status_code != 200:
        print('Body:', r.text)
except Exception as e:
    print('Exception:', type(e), e)
    import traceback
    traceback.print_exc()

# okay
