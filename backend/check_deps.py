import os
import shutil

print("=== Dependency Verification ===\n")

# Check LibreOffice
lo_path = r"C:\Program Files\LibreOffice\program\soffice.exe"
lo_exists = os.path.exists(lo_path)
print(f"✓ LibreOffice: {'FOUND' if lo_exists else 'MISSING'}")
if lo_exists:
    print(f"  Path: {lo_path}")

# Check Ghostscript
gs_cmd = shutil.which("gswin64c")
print(f"\n✓ Ghostscript: {'FOUND' if gs_cmd else 'MISSING'}")
if gs_cmd:
    print(f"  Path: {gs_cmd}")

# Check Poppler
poppler_path = r"C:\Program Files\poppler\Library\bin\pdftoppm.exe"
poppler_exists = os.path.exists(poppler_path)
print(f"\n✓ Poppler: {'FOUND' if poppler_exists else 'MISSING'}")
if poppler_exists:
    print(f"  Path: {poppler_path}")

print("\n" + "="*40)
if lo_exists and gs_cmd and poppler_exists:
    print("✓ All dependencies installed!")
else:
    print("✗ Some dependencies are missing")
