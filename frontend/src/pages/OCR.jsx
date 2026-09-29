import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, Download, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TOOLS } from '../config/tools'
import FileUploader from '../components/FileUploader'
import { useTheme } from '../context/ThemeContext'
import { getApiUrl } from '../config/api'

function OCR() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [success, setSuccess] = useState(false)
  const [language, setLanguage] = useState('eng')
  const { darkMode } = useTheme()
  const navigate = useNavigate()
  const tool = TOOLS.find(t => t.id === 'ocr')

  const handleFileSelected = (selectedFiles) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0])
      setError(null)
    }
  }

  const handleOCR = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('output_format', 'searchable_pdf')
      formData.append('force_ocr', 'true')
      formData.append('language', language)

      const response = await fetch(getApiUrl('api/pdf/ocr'), {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        let errorMessage = 'OCR processing failed'
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.detail || JSON.stringify(errorData) || errorMessage
          } catch (e) {}
        }
        if (errorMessage === 'OCR processing failed') {
          try {
            const text = await response.text()
            errorMessage = text || `Server error: ${response.status} ${response.statusText}`
          } catch {}
        }
        throw new Error(errorMessage)
      }

      // Store blob for download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const originalName = file.name.replace(/\.[^/.]+$/, '')
      
      setDownloadUrl({ url, filename: `${originalName}_searchable.pdf` })
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
          <p className={`text-lg mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your PDF has been processed with OCR successfully</p>
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
          <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Processing OCR...</h2>
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
          accept="PDF, IMAGE"
          multiple={false}
          description="Select or drag and drop a PDF or image file"
        />

        {file && (
          <div className="mt-6">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
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

            {/* Language Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                OCR Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="eng">English</option>
                <option value="hin">Hindi (हिन्दी - Devanagari)</option>
                <option value="spa">Spanish</option>
                <option value="fra">French</option>
                <option value="deu">German</option>
                <option value="ita">Italian</option>
                <option value="por">Portuguese</option>
                <option value="rus">Russian</option>
                <option value="chi_sim">Chinese (Simplified)</option>
                <option value="jpn">Japanese</option>
                <option value="kor">Korean</option>
                <option value="ara">Arabic</option>
              </select>
            </div>

            {/* Action Button */}
            <div className={`p-5 rounded-2xl flex justify-between items-center animate-in slide-in-from-bottom-4 shadow-xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="px-4">
                <span className="text-base font-semibold opacity-90">1 file(s) selected</span>
              </div>
              <button 
                onClick={handleOCR}
                disabled={loading}
                className="flex items-center gap-3 bg-rose-600 hover:bg-rose-500 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-rose-500/25 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Processing OCR...' : 'Extract Text'} <ArrowRight size={20} />
              </button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>💡 How it works:</strong>
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-400 mt-2 space-y-1 ml-4 list-disc">
                <li>Converts scanned PDFs and images to searchable PDFs</li>
                <li>Creates a text layer overlay for copy/paste and search functionality</li>
                <li>Supports multiple languages including Hindi (Devanagari script)</li>
                <li>Always performs OCR for best accuracy</li>
              </ul>
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

export default OCR

// okay
