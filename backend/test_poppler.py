from pdf2image import convert_from_path
import os

print('Testing Poppler...')

# Check for test PDFs
uploads_dir = 'uploads'
if os.path.exists(uploads_dir):
    test_files = [f for f in os.listdir(uploads_dir) if f.endswith('.pdf')]
    print(f'Found {len(test_files)} PDF files in uploads')
    
    if test_files:
        test_file = os.path.join(uploads_dir, test_files[0])
        print(f'Testing with: {test_files[0]}')
        
        # Try with explicit poppler path
        try:
            poppler_path = r'C:\Program Files\poppler\Library\bin'
            print(f'Trying with poppler_path: {poppler_path}')
            images = convert_from_path(test_file, poppler_path=poppler_path, dpi=150)
            print(f'✓ Success! Generated {len(images)} images')
        except Exception as e:
            print(f'✗ Error with explicit path: {e}')
            
            # Try without poppler_path
            print('Trying without poppler_path...')
            try:
                images = convert_from_path(test_file, dpi=150)
                print(f'✓ Success without path! Generated {len(images)} images')
            except Exception as e2:
                print(f'✗ Also failed: {e2}')
    else:
        print('No test PDFs found in uploads folder')
else:
    print('Uploads folder does not exist')

# okay
