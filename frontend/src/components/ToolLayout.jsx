import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, Download, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import FileUploader from './FileUploader'

function ToolLayout({ 
  tool,
  files, 
  setFiles, 
  onProcess, 
  loading, 
  success, 
  onDownload, 
  onReset,
  children,
  multiple = false,
  accept = "*",
  showFileList = true
}) {
  const [darkMode, setDarkMode] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDark)
  }, [])

  useEffect(() => {
    const handleStorage = () => {
      setDarkMode(localStorage.getItem('darkMode') === 'true')
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
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
          <p className={`text-lg mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your file has been processed successfully</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
            <button 
              onClick={onReset} 
              className={`flex-1 px-8 py-4 rounded-xl font-bold transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
            >
              Start Over
            </button>
            <button 
              onClick={onDownload}
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
          <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Processing...</h2>
          <p className={`text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Please wait a moment.</p>
        </div>
      </div>
    )
  }

  // Main Tool State
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
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

      {children ? (
        children
      ) : (
        <>
          <FileUploader
            files={showFileList ? files : []}
            onFilesSelected={(newFiles) => setFiles(multiple ? [...files, ...newFiles] : newFiles)}
            onRemoveFile={showFileList ? handleRemoveFile : null}
            multiple={multiple}
            accept={accept}
            darkMode={darkMode}
          />
          
          {files.length > 0 && (
            <div className={`mt-10 p-5 rounded-2xl flex justify-between items-center animate-in slide-in-from-bottom-4 shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-900 text-white'}`}>
              <div className="px-4">
                <span className="text-base font-semibold opacity-90">{files.length} file(s) selected</span>
              </div>
              <button 
                onClick={onProcess} 
                className="flex items-center gap-3 bg-rose-600 hover:bg-rose-500 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-rose-500/25 transform hover:-translate-y-0.5"
              >
                {tool.name} <ArrowRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ToolLayout

// okay
