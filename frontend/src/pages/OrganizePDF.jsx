import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, RotateCw, Trash2, Download, Loader2, CheckCircle, GripVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TOOLS } from '../config/tools'
import FileUploader from '../components/FileUploader'
import { useTheme } from '../context/ThemeContext'
import { getApiUrl } from '../config/api'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

function OrganizePDF() {
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])        // {index, rotation, thumb}
  const [loading, setLoading] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [error, setError] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [success, setSuccess] = useState(false)
  const { darkMode } = useTheme()
  const navigate = useNavigate()
  const tool = TOOLS.find(t => t.id === 'organize')

  const dragItem = useRef(null)
  const dragOver = useRef(null)

  // Render thumbnails when file changes
  useEffect(() => {
    if (!file) { setPages([]); return }
    let cancelled = false

    const render = async () => {
      setRendering(true)
      try {
        const arrayBuf = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise
        const items = []

        for (let i = 0; i < pdf.numPages; i++) {
          if (cancelled) return
          const page = await pdf.getPage(i + 1)
          const vp = page.getViewport({ scale: 0.5 })
          const canvas = document.createElement('canvas')
          canvas.width = vp.width
          canvas.height = vp.height
          await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise
          items.push({ index: i, rotation: 0, thumb: canvas.toDataURL() })
        }
        if (!cancelled) setPages(items)
      } catch {
        if (!cancelled) setError('Failed to read PDF pages')
      } finally {
        if (!cancelled) setRendering(false)
      }
    }
    render()
    return () => { cancelled = true }
  }, [file])

  // --- page operations ---
  const rotatePage = (pos) => {
    setPages(prev => prev.map((p, i) => i === pos ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
  }

  const deletePage = (pos) => {
    if (pages.length <= 1) { setError('Cannot delete the last page'); return }
    setPages(prev => prev.filter((_, i) => i !== pos))
  }

  // --- drag & drop reorder ---
  const handleDragStart = (idx) => { dragItem.current = idx }
  const handleDragEnter = (idx) => { dragOver.current = idx }
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return
    const copy = [...pages]
    const dragged = copy.splice(dragItem.current, 1)[0]
    copy.splice(dragOver.current, 0, dragged)
    setPages(copy)
    dragItem.current = null
    dragOver.current = null
  }

  // --- submit ---
  const handleOrganize = async () => {
    if (!file || pages.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const ops = pages.map(p => ({ page: p.index, rotation: p.rotation }))
      const formData = new FormData()
      formData.append('file', file)
      formData.append('operations', JSON.stringify(ops))

      const res = await fetch(getApiUrl('api/pdf/organize'), { method: 'POST', body: formData })
      if (!res.ok) {
        const ct = res.headers.get('content-type') || ''
        let msg = 'Organize failed'
        if (ct.includes('json')) { try { msg = (await res.json()).detail || msg } catch {} }
        throw new Error(msg)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const name = file.name.replace(/\.pdf$/i, '')
      setDownloadUrl({ url, filename: `${name}_organized.pdf` })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!downloadUrl) return
    const a = document.createElement('a')
    a.href = downloadUrl.url
    a.download = downloadUrl.filename
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(downloadUrl.url)
    document.body.removeChild(a)
  }

  const handleReset = () => {
    setFile(null); setPages([]); setDownloadUrl(null)
    setSuccess(false); setError(null)
  }

  // ---- render states ----
  if (success) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-8">
            <CheckCircle size={48} strokeWidth={3} />
          </div>
          <h2 className={`text-4xl font-extrabold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>It's Ready!</h2>
          <p className={`text-lg mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your PDF has been organized successfully</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
            <button onClick={handleReset} className={`flex-1 px-8 py-4 rounded-xl font-bold transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Start Over</button>
            <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5">
              <Download size={20} /> Download
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-rose-500 blur-xl opacity-20 rounded-full animate-pulse" />
            <Loader2 size={80} className="text-rose-500 animate-spin relative z-10" />
          </div>
          <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Organizing PDF...</h2>
          <p className={`text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Please wait a moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
        <button onClick={() => navigate('/')} className={`self-start p-3 rounded-xl transition-all ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:bg-white hover:shadow-md'}`}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center shadow-lg`}>{tool.icon}</div>
            <h1 className={`text-4xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tool.name}</h1>
          </div>
          <p className={`text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tool.desc}</p>
        </div>
      </div>

      {/* Uploader visible when no file yet */}
      {!file && (
        <FileUploader
          onFilesSelected={(f) => { if (f.length) { setFile(f[0]); setError(null) } }}
          accept="PDF"
          multiple={false}
          description="Select or drag & drop a PDF file"
        />
      )}

      {/* Thumbnails */}
      {file && rendering && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={48} className="text-rose-500 animate-spin" />
          <span className={`ml-4 text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Rendering pages...</span>
        </div>
      )}

      {file && !rendering && pages.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
            {pages.map((p, idx) => (
              <div
                key={`${p.index}-${idx}`}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`group relative rounded-2xl overflow-hidden shadow-lg cursor-grab active:cursor-grabbing border-2 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-rose-500' : 'bg-white border-slate-200 hover:border-rose-400'}`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[3/4] overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                  <img
                    src={p.thumb}
                    alt={`Page ${idx + 1}`}
                    className="max-w-full max-h-full object-contain"
                    style={{ transform: `rotate(${p.rotation}deg)` }}
                    draggable={false}
                  />
                  {/* Drag handle overlay */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical size={20} className="text-slate-400" />
                  </div>
                </div>

                {/* Footer bar */}
                <div className={`flex items-center justify-between px-3 py-2 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                  <span className={`font-bold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => rotatePage(idx)} title="Rotate 90°" className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <RotateCw size={16} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
                    </button>
                    <button onClick={() => deletePage(idx)} title="Delete page" className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action bar */}
          <div className={`p-5 rounded-2xl flex justify-between items-center shadow-xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="px-4">
              <span className="text-base font-semibold opacity-90">{pages.length} page(s)</span>
              <span className={`ml-3 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Drag to reorder, rotate or delete pages</span>
            </div>
            <button onClick={handleOrganize} className="flex items-center gap-3 bg-rose-600 hover:bg-rose-500 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-rose-500/25 transform hover:-translate-y-0.5">
              Save PDF →
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}

export default OrganizePDF
