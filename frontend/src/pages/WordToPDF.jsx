import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, Download, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TOOLS } from '../config/tools'
import FileUploader from '../components/FileUploader'
import { useTheme } from '../context/ThemeContext'
import { getApiUrl } from '../config/api'

function WordToPDF() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [success, setSuccess] = useState(false)
  const { darkMode } = useTheme()
  const navigate = useNavigate()
  const tool = TOOLS.find(t => t.id === 'word-to-pdf')

  const handleFileSelected = (selectedFiles) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0])
      setError(null)
    }
  }

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a Word document')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(getApiUrl('api/pdf/word-to-pdf'), {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        let errorMessage = 'Conversion failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorMessage
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      // Store blob for download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const filename = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`
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
          <p className={`text-lg mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your Word document has been converted to PDF successfully</p>
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
          <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Converting Word to PDF...</h2>
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
          accept="DOCX, DOC"
          multiple={false}
          description="Select or drag and drop a Word document (.doc or .docx)"
        />

        {file && (
          <div className="mt-6">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024).toFixed(2)} KB)
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

            {/* Action Button */}
            <div className={`p-5 rounded-2xl flex justify-between items-center animate-in slide-in-from-bottom-4 shadow-xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="px-4">
                <span className="text-base font-semibold opacity-90">1 file(s) selected</span>
              </div>
              <button 
                onClick={handleConvert}
                disabled={loading}
                className="flex items-center gap-3 bg-rose-600 hover:bg-rose-500 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-rose-500/25 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Converting...' : 'Convert to PDF'} <ArrowRight size={20} />
              </button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-700 dark:text-blue-400">
                  <p className="font-semibold mb-1">Important Notes:</p>
                  <ul className="space-y-1 list-disc list-inside ml-2">
                    <li>Uses LibreOffice for conversion</li>
                    <li>Complex formatting may not be perfect (tables, text boxes, overlapping elements)</li>
                    <li>For critical documents, verify the output before use</li>
                    <li><strong>Tip:</strong> Save your Word doc in "compatibility mode" or simplify formatting for better results</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WordToPDF

// okay
