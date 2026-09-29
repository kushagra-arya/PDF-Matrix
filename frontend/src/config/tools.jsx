import { 
  MergeIcon, 
  SplitIcon, 
  CompressIcon, 
  JpgIcon, 
  WordIcon, 
  PptIcon, 
  PdfToJpgIcon, 
  OcrIcon, 
  CropIconCustom, 
  DeleteIcon,
  OrganizeIcon,
  PageNumbersIcon 
} from '../components/icons/CustomIcons'

export const TOOLS = [
  { 
    id: 'merge', 
    name: 'Merge PDF', 
    icon: <MergeIcon />, 
    desc: 'Combine multiple files into one PDF.',
    color: 'bg-rose-500',
    iconColor: 'text-rose-500',
    path: '/merge'
  },
  { 
    id: 'split', 
    name: 'Split PDF', 
    icon: <SplitIcon />, 
    desc: 'Extract pages or split documents.', 
    color: 'bg-amber-500',
    iconColor: 'text-amber-500',
    path: '/split'
  },
  { 
    id: 'compress', 
    name: 'Compress PDF', 
    icon: <CompressIcon />, 
    desc: 'Reduce file size while saving quality.', 
    color: 'bg-emerald-500',
    iconColor: 'text-emerald-500',
    path: '/compress'
  },
  { 
    id: 'img-to-pdf', 
    name: 'JPG to PDF', 
    icon: <JpgIcon />, 
    desc: 'Convert JPG, PNG to PDF.', 
    color: 'bg-blue-500',
    iconColor: 'text-blue-500',
    path: '/image-to-pdf'
  },
  { 
    id: 'word-to-pdf', 
    name: 'Word to PDF', 
    icon: <WordIcon />, 
    desc: 'Convert DOCX documents to PDF.', 
    color: 'bg-indigo-500',
    iconColor: 'text-indigo-500',
    path: '/word-to-pdf'
  },
  { 
    id: 'ppt-to-pdf', 
    name: 'PPT to PDF', 
    icon: <PptIcon />, 
    desc: 'Convert Powerpoint to PDF.', 
    color: 'bg-orange-500',
    iconColor: 'text-orange-500',
    path: '/ppt-to-pdf'
  },
  { 
    id: 'pdf-to-jpg', 
    name: 'PDF to JPG', 
    icon: <PdfToJpgIcon />, 
    desc: 'Convert PDF pages to images.',
    color: 'bg-purple-500',
    iconColor: 'text-purple-500',
    path: '/pdf-to-jpg'
  },
  { 
    id: 'ocr', 
    name: 'OCR PDF', 
    icon: <OcrIcon />, 
    desc: 'Recognize text in scanned files.',
    color: 'bg-teal-500',
    iconColor: 'text-teal-500',
    path: '/ocr'
  },
  { 
    id: 'crop', 
    name: 'Crop PDF', 
    icon: <CropIconCustom />, 
    desc: 'Trim margins and adjust area.', 
    color: 'bg-pink-500',
    iconColor: 'text-pink-500',
    path: '/crop'
  },
  { 
    id: 'delete-pages', 
    name: 'Delete Pages', 
    icon: <DeleteIcon />, 
    desc: 'Remove unwanted pages.', 
    color: 'bg-slate-500',
    iconColor: 'text-slate-500',
    path: '/delete-pages'
  },
  { 
    id: 'organize', 
    name: 'Organize PDF', 
    icon: <OrganizeIcon />, 
    desc: 'Reorder, rotate & delete pages.', 
    color: 'bg-cyan-500',
    iconColor: 'text-cyan-500',
    path: '/organize'
  },
  { 
    id: 'page-numbers', 
    name: 'Page Numbers', 
    icon: <PageNumbersIcon />, 
    desc: 'Add page numbers to your PDF.', 
    color: 'bg-violet-500',
    iconColor: 'text-violet-500',
    path: '/page-numbers'
  }
]

// okay
