import { useState } from 'react'
import { ChevronUp, ChevronDown, X, File, ArrowRight, ArrowLeft, CheckCircle, Download, Loader2, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TOOLS } from '../config/tools'
import FileUploader from '../components/FileUploader'
import { useTheme } from '../context/ThemeContext'
import { getApiUrl } from '../config/api'

function Merge() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [success, setSuccess] = useState(false)
  const { darkMode } = useTheme()
  const navigate = useNavigate()

  const tool = TOOLS.find(t => t.id === 'merge')

  const handleFilesSelected = (selectedFiles) => {
    setFiles(prevFiles => [...prevFiles, ...selectedFiles])
    setError(null)
  }

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleMoveUp = (index) => {
    if (index === 0) return
    const newFiles = [...files]
    const temp = newFiles[index]
    newFiles[index] = newFiles[index - 1]
    newFiles[index - 1] = temp
    setFiles(newFiles)
  }

  const handleMoveDown = (index) => {
    if (index === files.length - 1) return
    const newFiles = [...files]
    const temp = newFiles[index]
    newFiles[index] = newFiles[index + 1]
    newFiles[index + 1] = temp
    setFiles(newFiles)
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch(getApiUrl('api/pdf/merge'), {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        let errorMessage = 'Merge failed'
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.detail || JSON.stringify(errorData) || errorMessage
          } catch (e) {
            // fall through to text fallback
          }
        }
        if (errorMessage === 'Merge failed') {
          try {
            const text = await response.text()
            errorMessage = text || `Server error: ${response.status} ${response.statusText}`
          } catch {}
        }
        throw new Error(errorMessage)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const firstFileName = files[0].name.replace(/\.pdf$/i, '')
      setDownloadUrl({ url, filename: `${firstFileName}_merged.pdf` })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
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
    setFiles([])
    setLoading(false)
  }

  // Success State
  if (success) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-8">
            <CheckCircle size={48} strokeWidth={3} />
          </div>
          <h2 className={`text-4xl font-extrabold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>It's Ready!</h2>
          <p className={`text-lg mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your PDFs have been merged successfully</p>
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
          <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Merging PDFs...</h2>
          <p className={`text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Please wait a moment.</p>
        </div>
      </div>
    )
  }

  // Main State
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12 animate-in slide-in-from-top-4 duration-500">
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

      {/* File Uploader */}
      <FileUploader
        files={[]}
        onFilesSelected={handleFilesSelected}
        multiple={true}
        accept="PDF"
        description="Drop your PDF files here"
        darkMode={darkMode}
      />

      {/* File List with Reordering */}
      {files.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Selected Files ({files.length})
            </h3>
            <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Use arrows to reorder
            </p>
          </div>

          {files.map((file, idx) => (
            <div key={idx} className={`flex items-center justify-between p-5 rounded-2xl border transition-all hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
              {/* Reorder Buttons */}
              <div className="flex flex-col gap-1 mr-3">
                <button
                  onClick={() => handleMoveUp(idx)}
                  disabled={idx === 0}
                  className={`p-1 rounded transition-colors ${idx === 0 ? 'opacity-30 cursor-not-allowed' : darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                >
                  <ChevronUp size={18} />
                </button>
                <button
                  onClick={() => handleMoveDown(idx)}
                  disabled={idx === files.length - 1}
                  className={`p-1 rounded transition-colors ${idx === files.length - 1 ? 'opacity-30 cursor-not-allowed' : darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                >
                  <ChevronDown size={18} />
                </button>
              </div>

              {/* File Info */}
              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                <span className={`text-sm font-bold w-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {idx + 1}.
                </span>
                <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
                  <File size={24} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold truncate max-w-[200px] sm:max-w-md text-lg">{file.name}</span>
                  <span className="text-sm opacity-60 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>

              {/* Remove Button */}
              <button 
                onClick={() => handleRemoveFile(idx)}
                className="p-3 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 rounded-xl transition-colors opacity-40 hover:opacity-100"
              >
                <X size={20} />
              </button>
            </div>
          ))}

          {/* Info Banner */}
          <div className={`p-4 rounded-xl flex items-start gap-3 ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
            <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
              Files will be merged in the order shown above. Use the up/down arrows to reorder.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
            </div>
          )}

          {/* Action Button */}
          <div className={`p-5 rounded-2xl flex justify-between items-center animate-in slide-in-from-bottom-4 shadow-xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="px-4">
              <span className="text-base font-semibold opacity-90">{files.length} file(s) selected</span>
            </div>
            <button 
              onClick={handleMerge}
              disabled={files.length < 2}
              className="flex items-center gap-3 bg-rose-600 hover:bg-rose-500 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-rose-500/25 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Merge PDFs <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Merge

// okay
