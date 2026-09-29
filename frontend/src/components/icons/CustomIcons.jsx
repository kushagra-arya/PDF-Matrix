import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

// Merge PDF Icon - Two overlapping documents with arrows pointing inward
export const MergeIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-12 h-12">
      {/* Back document */}
      <div className="absolute left-0 top-2 w-7 h-9 bg-red-400/60 rounded-md shadow-sm">
        <ArrowDownLeft className="absolute top-0.5 right-0.5 text-white" size={12} strokeWidth={3} />
      </div>
      {/* Front document */}
      <div className="absolute right-0 bottom-0 w-7 h-9 bg-white rounded-md shadow-md">
        <ArrowDownLeft className="absolute top-0.5 right-0.5 text-red-500" size={12} strokeWidth={3} />
      </div>
    </div>
  </div>
)

// Split PDF Icon - Document with separating arrows
export const SplitIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-12 h-12">
      {/* Left document */}
      <div className="absolute left-0 top-1.5 w-7 h-9 bg-orange-400/80 rounded-md shadow-sm">
        <ArrowUpRight className="absolute top-0.5 left-0.5 text-white" size={12} strokeWidth={3} />
      </div>
      {/* Right document */}
      <div className="absolute right-0 bottom-0 w-7 h-9 bg-white rounded-md shadow-md">
        <ArrowDownLeft className="absolute bottom-0.5 right-0.5 text-orange-500" size={12} strokeWidth={3} />
      </div>
    </div>
  </div>
)

// Compress PDF Icon - Four arrows pointing to center
export const CompressIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-11 h-11">
      {/* Background square */}
      <div className="absolute inset-0 bg-white rounded-lg shadow-md" />
      {/* Top-left arrow */}
      <div className="absolute top-1 left-1 w-3 h-3 bg-emerald-500 rounded-sm flex items-center justify-center">
        <ArrowDownLeft className="text-white" size={10} strokeWidth={3} />
      </div>
      {/* Top-right arrow */}
      <div className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 rounded-sm flex items-center justify-center">
        <ArrowDownLeft className="text-white rotate-90" size={10} strokeWidth={3} />
      </div>
      {/* Bottom-left arrow */}
      <div className="absolute bottom-1 left-1 w-3 h-3 bg-emerald-400 rounded-sm flex items-center justify-center">
        <ArrowDownLeft className="text-white -rotate-90" size={10} strokeWidth={3} />
      </div>
      {/* Bottom-right arrow */}
      <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-300 rounded-sm flex items-center justify-center">
        <ArrowDownLeft className="text-white rotate-180" size={10} strokeWidth={3} />
      </div>
    </div>
  </div>
)

// Word to PDF Icon
export const WordIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-11 h-11">
      {/* Background document (light) */}
      <div className="absolute left-0 top-1 w-8 h-9 bg-blue-100 rounded-md shadow-sm" />
      {/* Front document with W */}
      <div className="absolute right-0 bottom-0 w-8 h-9 bg-white rounded-md shadow-md flex items-center justify-center">
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-xs">W</span>
        </div>
        {/* Small arrow indicator */}
        <ArrowDownLeft className="absolute -bottom-1 -right-1 text-blue-600 bg-white rounded-full p-0.5" size={10} strokeWidth={3} />
      </div>
    </div>
  </div>
)

// PowerPoint to PDF Icon
export const PptIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-11 h-11">
      {/* Background document (light) */}
      <div className="absolute left-0 top-1 w-8 h-9 bg-orange-100 rounded-md shadow-sm" />
      {/* Front document with P */}
      <div className="absolute right-0 bottom-0 w-8 h-9 bg-white rounded-md shadow-md flex items-center justify-center">
        <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-xs">P</span>
        </div>
        {/* Small arrow indicator */}
        <ArrowDownLeft className="absolute -bottom-1 -right-1 text-orange-600 bg-white rounded-full p-0.5" size={10} strokeWidth={3} />
      </div>
    </div>
  </div>
)

// JPG to PDF Icon - Image with JPG label
export const JpgIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-11 h-11">
      {/* Background image (blue tint) */}
      <div className="absolute left-0 top-1 w-8 h-9 bg-blue-100 rounded-md shadow-sm flex items-center justify-center">
        <div className="w-5 h-4 border-2 border-blue-500 rounded-sm relative overflow-hidden">
          {/* Image icon elements */}
          <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-blue-500 rounded-full" />
          <div className="absolute bottom-0.5 right-0.5 w-2 h-1 bg-blue-300 rounded-sm" />
        </div>
      </div>
      {/* Front document */}
      <div className="absolute right-0 bottom-0 w-8 h-9 bg-white rounded-md shadow-md flex items-center justify-center">
        <div className="text-blue-600 font-bold text-[9px] border-2 border-blue-500 rounded px-1 py-0.5">
          JPG
        </div>
        {/* Small arrow indicator */}
        <ArrowDownLeft className="absolute -bottom-1 -right-1 text-blue-600 bg-white rounded-full p-0.5" size={10} strokeWidth={3} />
      </div>
    </div>
  </div>
)

// PDF to JPG Icon
export const PdfToJpgIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-11 h-11">
      {/* Background document */}
      <div className="absolute left-0 top-1 w-8 h-9 bg-purple-100 rounded-md shadow-sm" />
      {/* Front image placeholder */}
      <div className="absolute right-0 bottom-0 w-8 h-9 bg-white rounded-md shadow-md flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-purple-500 rounded flex items-center justify-center text-purple-500 text-[8px] font-bold">
          JPG
        </div>
        {/* Small arrow indicator */}
        <ArrowDownLeft className="absolute -bottom-1 -right-1 text-purple-500 bg-white rounded-full p-0.5" size={10} strokeWidth={3} />
      </div>
    </div>
  </div>
)

// OCR Icon
export const OcrIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-11 h-11 bg-white rounded-md shadow-md flex items-center justify-center">
      {/* Scan lines */}
      <div className="absolute inset-2 flex flex-col gap-1">
        <div className="h-0.5 bg-teal-300 rounded-full w-full" />
        <div className="h-0.5 bg-teal-400 rounded-full w-3/4" />
        <div className="h-0.5 bg-teal-500 rounded-full w-full" />
        <div className="h-0.5 bg-teal-400 rounded-full w-2/3" />
        <div className="h-0.5 bg-teal-300 rounded-full w-4/5" />
      </div>
      {/* Corner brackets */}
      <div className="absolute top-0.5 left-0.5 w-2 h-2 border-l-2 border-t-2 border-teal-600 rounded-tl" />
      <div className="absolute top-0.5 right-0.5 w-2 h-2 border-r-2 border-t-2 border-teal-600 rounded-tr" />
      <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-l-2 border-b-2 border-teal-600 rounded-bl" />
      <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-r-2 border-b-2 border-teal-600 rounded-br" />
    </div>
  </div>
)

// Crop PDF Icon
export const CropIconCustom = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-11 h-11 bg-white rounded-md shadow-md">
      {/* Corner brackets indicating crop area */}
      <div className="absolute top-1 left-1 w-3 h-3 border-l-[3px] border-t-[3px] border-pink-600" />
      <div className="absolute top-1 right-1 w-3 h-3 border-r-[3px] border-t-[3px] border-pink-600" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-l-[3px] border-b-[3px] border-pink-600" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-r-[3px] border-b-[3px] border-pink-600" />
      {/* Center content area */}
      <div className="absolute inset-4 bg-pink-50 rounded-sm" />
    </div>
  </div>
)

// Delete Pages Icon
export const DeleteIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-11 h-11">
      {/* Document */}
      <div className="absolute inset-0 bg-white rounded-md shadow-md" />
      {/* Red X */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-7 h-7">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-red-500 rounded-full transform -translate-y-1/2 rotate-45" />
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-red-500 rounded-full transform -translate-y-1/2 -rotate-45" />
        </div>
      </div>
    </div>
  </div>
)

// PDF to Excel Icon (for mega menu)
export const ExcelIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-11 h-11">
      {/* Background document */}
      <div className="absolute left-0 top-1 w-8 h-9 bg-green-100 rounded-md shadow-sm" />
      {/* Front document with X */}
      <div className="absolute right-0 bottom-0 w-8 h-9 bg-white rounded-md shadow-md flex items-center justify-center">
        <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-xs">X</span>
        </div>
        {/* Small arrow indicator */}
        <ArrowDownLeft className="absolute -bottom-1 -right-1 text-green-600 bg-white rounded-full p-0.5" size={10} strokeWidth={3} />
      </div>
    </div>
  </div>
)

// PDF to Word Icon (for mega menu)
export const PdfToWordIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-11 h-11">
      {/* Background document */}
      <div className="absolute left-0 top-1 w-8 h-9 bg-blue-100 rounded-md shadow-sm" />
      {/* Front document with W */}
      <div className="absolute right-0 bottom-0 w-8 h-9 bg-white rounded-md shadow-md flex items-center justify-center">
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-xs">W</span>
        </div>
        {/* Small arrow indicator */}
        <ArrowDownLeft className="absolute -bottom-1 -right-1 text-blue-600 bg-white rounded-full p-0.5" size={10} strokeWidth={3} />
      </div>
    </div>
  </div>
)

// PDF to PowerPoint Icon (for mega menu)
export const PdfToPptIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-11 h-11">
      {/* Background document */}
      <div className="absolute left-0 top-1 w-8 h-9 bg-orange-100 rounded-md shadow-sm" />
      {/* Front document with P */}
      <div className="absolute right-0 bottom-0 w-8 h-9 bg-white rounded-md shadow-md flex items-center justify-center">
        <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-xs">P</span>
        </div>
        {/* Small arrow indicator */}
        <ArrowDownLeft className="absolute -bottom-1 -right-1 text-orange-600 bg-white rounded-full p-0.5" size={10} strokeWidth={3} />
      </div>
    </div>
  </div>
)

// Organize PDF Icon
export const OrganizeIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-11 h-11">
      <div className="absolute inset-0 bg-white rounded-md shadow-md" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <div className="w-5 h-1 bg-cyan-500 rounded-full" />
        <div className="w-5 h-1 bg-cyan-400 rounded-full" />
        <div className="w-5 h-1 bg-cyan-300 rounded-full" />
      </div>
    </div>
  </div>
)

// Page Numbers Icon
export const PageNumbersIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-11 h-11">
      <div className="absolute inset-0 bg-white rounded-md shadow-md" />
      <div className="absolute inset-0 flex items-end justify-center pb-1">
        <span className="text-xs font-bold text-violet-600">1 2 3</span>
      </div>
    </div>
  </div>
)

// okay
