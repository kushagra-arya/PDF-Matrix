import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, Download, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TOOLS } from '../config/tools'
import FileUploader from '../components/FileUploader'
import { useTheme } from '../context/ThemeContext'
import { getApiUrl } from '../config/api'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

function CropPDF() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [success, setSuccess] = useState(false)
  const { darkMode } = useTheme()
  const navigate = useNavigate()
  const tool = TOOLS.find(t => t.id === 'crop')
  const [cropValues, setCropValues] = useState({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  })
  
  // Canvas refs for interactive cropping
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const [pdfDimensions, setPdfDimensions] = useState(null)
  const [cropArea, setCropArea] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [applyToAllPages, setApplyToAllPages] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pdfDocRef = useRef(null)

  const handleFileSelected = async (selectedFiles) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0]
      setFile(selectedFile)
      setError(null)
      setCropArea(null)
      
      // Render PDF preview
      await renderPDF(selectedFile)
    }
  }
  
  const renderPDF = async (file, pageNum = 1) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      
      pdfDocRef.current = pdf
      setTotalPages(pdf.numPages)
      setCurrentPage(pageNum)
      
      const page = await pdf.getPage(pageNum)
      
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = viewport.width
      canvas.height = viewport.height
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      
      await page.render(renderContext).promise
      
      // Store PDF dimensions for crop calculation
      setPdfDimensions({
        width: viewport.width,
        height: viewport.height,
        scale: 1.5,
        pageWidth: page.view[2], // PDF points
        pageHeight: page.view[3]
      })
    } catch (err) {
      console.error('Error rendering PDF:', err)
      setError('Failed to render PDF preview')
    }
  }
  
  const handlePageChange = (newPage) => {
    if (file && newPage >= 1 && newPage <= totalPages) {
      setCropArea(null)
      renderPDF(file, newPage)
    }
  }

  const handleCropChange = (side, value) => {
    const numValue = parseFloat(value) || 0
    setCropValues(prev => ({ ...prev, [side]: numValue }))
  }

  const handleCrop = async () => {
    if (!file) {
      setError('Please select a PDF file')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let leftPts, topPts, rightPts, bottomPts
      
      // Use interactive crop area if available, otherwise use manual inputs
      if (cropArea && pdfDimensions) {
        // Convert canvas pixels to PDF points
        // The crop area represents what we KEEP, so we calculate margins to REMOVE
        const { x, y, width, height } = cropArea
        const { scale, pageWidth, pageHeight } = pdfDimensions
        
        // Convert canvas coordinates to PDF points
        // The selection rectangle shows what to KEEP, so:
        // - left margin = distance from left edge to selection start
        // - right margin = distance from selection end to right edge
        // - top margin = distance from top edge to selection start
        // - bottom margin = distance from selection end to bottom edge
        leftPts = x / scale
        topPts = y / scale
        rightPts = (pageWidth - (x + width) / scale)
        bottomPts = (pageHeight - (y + height) / scale)
      } else if (Object.values(cropValues).some(v => v > 0)) {
        // Use manual input values
        leftPts = cropValues.left * 72
        topPts = cropValues.top * 72
        rightPts = cropValues.right * 72
        bottomPts = cropValues.bottom * 72
      } else {
        setError('Please drag on the preview to select crop area or enter crop values')
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('left', leftPts)
      formData.append('top', topPts)
      formData.append('right', rightPts)
      formData.append('bottom', bottomPts)
      formData.append('page_number', currentPage)
      formData.append('apply_to_all', applyToAllPages)

      const response = await fetch(getApiUrl('api/pdf/crop'), {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        let errorMessage = 'Crop failed'
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.detail || JSON.stringify(errorData) || errorMessage
          } catch (e) {}
        }
        if (errorMessage === 'Crop failed') {
          try {
            const text = await response.text()
            errorMessage = text || `Server error: ${response.status} ${response.statusText}`
          } catch {}
        }
        throw new Error(errorMessage)
      }

      // Store blob for download with original filename
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const originalName = file.name.replace(/\.pdf$/i, '')
      
      // Set appropriate filename based on crop mode
      let filename
      if (applyToAllPages) {
        filename = `${originalName}_cropped_all.pdf`
      } else {
        filename = `${originalName}_cropped_page${currentPage}.pdf`
      }
      
      setDownloadUrl({ url, filename })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a')
      a.href = downloadUrl.url
      a.download = downloadUrl.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl.url)
      document.body.removeChild(a)
    }
  }

  const handleReset = () => {
    setDownloadUrl(null)
    setSuccess(false)
    setError(null)
    setFile(null)
    setCropValues({ left: 0, top: 0, right: 0, bottom: 0 })
    setCropArea(null)
    setPdfDimensions(null)
    
    // Clear canvases
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext('2d')
      ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height)
    }
  }

  // Helper: convert a CSS-pixel position (from pointer events) to canvas logical pixels
  const toCanvasCoords = (canvas, clientX, clientY) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  // Pointer-capture drag handlers – works even when the cursor leaves the canvas
  const handlePointerDown = (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const { x, y } = toCanvasCoords(e.currentTarget, e.clientX, e.clientY)
    setIsDragging(true)
    setDragStart({ x, y })
    setCropArea({ x, y, width: 0, height: 0 })
  }

  const handlePointerMove = (e) => {
    if (!isDragging || !dragStart) return
    e.preventDefault()

    // Auto-scroll the page when the pointer is near the viewport edges so the
    // user can drag all the way to the bottom/top of a tall PDF preview.
    const scrollZone = 60           // px from the edge that triggers scroll
    const scrollSpeed = 12          // px scrolled per event
    const vy = e.clientY
    const vh = window.innerHeight
    if (vy < scrollZone) {
      window.scrollBy({ top: -scrollSpeed, behavior: 'instant' })
    } else if (vy > vh - scrollZone) {
      window.scrollBy({ top: scrollSpeed, behavior: 'instant' })
    }

    const canvas = e.currentTarget
    const { x: rawX, y: rawY } = toCanvasCoords(canvas, e.clientX, e.clientY)
    // Clamp to canvas logical dimensions so the selection never exceeds the page
    const currentX = Math.max(0, Math.min(rawX, canvas.width))
    const currentY = Math.max(0, Math.min(rawY, canvas.height))
    const width = currentX - dragStart.x
    const height = currentY - dragStart.y
    setCropArea({
      x: width < 0 ? currentX : dragStart.x,
      y: height < 0 ? currentY : dragStart.y,
      width: Math.abs(width),
      height: Math.abs(height),
    })
  }

  const handlePointerUp = (e) => {
    if (!isDragging) return
    e.preventDefault()
    setIsDragging(false)
    setDragStart(null)
  }
  
  // Draw crop overlay
  useEffect(() => {
    if (!overlayRef.current || !canvasRef.current) return
    
    const canvas = overlayRef.current
    const ctx = canvas.getContext('2d')
    
    // Match overlay size to PDF canvas
    canvas.width = canvasRef.current.width
    canvas.height = canvasRef.current.height
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (cropArea) {
      // Draw semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Clear the crop area to show the PDF underneath
      ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)
      
      // Draw border around crop area
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)
    }
  }, [cropArea])

  // Success State
  if (success) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-8">
            <CheckCircle size={48} strokeWidth={3} />
          </div>
          <h2 className={`text-4xl font-extrabold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>It's Ready!</h2>
          <p className={`text-lg mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your PDF has been cropped successfully</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
            <button 
              onClick={handleReset} 
              className={`flex-1 px-8 py-4 rounded-xl font-bold transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
            >
              Start Over
            </button>
            <button 
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Download size={20} /> Download
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading State
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-rose-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
            <Loader2 size={80} className="text-rose-500 animate-spin relative z-10" />
          </div>
          <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Cropping PDF...</h2>
          <p className={`text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Please wait a moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
        <button 
          onClick={() => navigate('/')} 
          className={`self-start p-3 rounded-xl transition-all ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:bg-white hover:shadow-md'}`}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center shadow-lg`}>
              {tool.icon}
            </div>
            <h1 className={`text-4xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tool.name}</h1>
          </div>
          <p className={`text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tool.desc}</p>
        </div>
      </div>

      <div className="card">
        <FileUploader
          onFilesSelected={handleFileSelected}
          accept="PDF"
          multiple={false}
          description="Select or drag and drop a PDF file"
        />

        {file && (
          <div className="mt-6">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Apply to All Pages Toggle - Prominent at top */}
            {totalPages > 1 && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      Crop Mode
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      {applyToAllPages 
                        ? `Crop will be applied to all ${totalPages} pages` 
                        : `Crop will be applied to page ${currentPage} only`}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyToAllPages}
                      onChange={(e) => setApplyToAllPages(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                      {applyToAllPages ? 'All Pages' : 'Single Page'}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Interactive PDF Preview */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Interactive Crop Preview
                </label>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      ← Prev
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
              
              <div className="relative border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden" style={{ maxWidth: '100%' }}>
                <canvas 
                  ref={canvasRef}
                  className="w-full h-auto"
                  style={{ display: 'block' }}
                />
                <canvas
                  ref={overlayRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                  style={{ pointerEvents: 'all', userSelect: 'none', touchAction: 'none' }}
                />
              </div>
              
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {cropArea 
                  ? `✓ Crop area selected (${Math.round(cropArea.width)}×${Math.round(cropArea.height)} pixels). Click and drag again to adjust.`
                  : 'Click and drag on the preview to select the area you want to keep. The darker area will be removed.'}
              </p>
            </div>

            {/* Manual Crop Inputs (Alternative) */}
            <details className="mb-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Or enter crop margins manually (in inches)
              </summary>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Left
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={cropValues.left}
                    onChange={(e) => handleCropChange('left', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Top
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={cropValues.top}
                    onChange={(e) => handleCropChange('top', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Right
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={cropValues.right}
                    onChange={(e) => handleCropChange('right', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Bottom
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={cropValues.bottom}
                    onChange={(e) => handleCropChange('bottom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
            </details>

            {/* Action Button */}
            <div className={`p-5 rounded-2xl flex justify-between items-center animate-in slide-in-from-bottom-4 shadow-xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="px-4">
                <span className="text-base font-semibold opacity-90">1 file(s) selected</span>
              </div>
              <button 
                onClick={handleCrop}
                disabled={loading}
                className="flex items-center gap-3 bg-rose-600 hover:bg-rose-500 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-rose-500/25 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Cropping...' : 'Crop PDF'} <ArrowRight size={20} />
              </button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                💡 <strong>Tip:</strong> Drag on the preview to visually select what to keep. 
                {totalPages > 1 && (
                  <span> Use the toggle above to crop only the current page or apply to all pages. The download will only contain the cropped pages.</span>
                )}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CropPDF

// okay
