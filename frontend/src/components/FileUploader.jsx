import { useRef, useState } from 'react'
import { UploadCloud, X, File } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function FileUploader({ 
  onFilesSelected, 
  accept = "*", 
  multiple = false,
  maxFiles = null,
  description = "Drop your files here",
  files = [],
  onRemoveFile
}) {
  const [isDragging, setIsDragging] = useState(false)
  const { darkMode } = useTheme()
  const fileInputRef = useRef(null)

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
  }

  const handleFiles = (newFiles) => {
    if (maxFiles && newFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }
    onFilesSelected(newFiles)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-3 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-300
          flex flex-col items-center justify-center gap-6 min-h-[350px] group
          ${isDragging 
            ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 scale-[1.01]' 
            : darkMode 
              ? 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800' 
              : 'border-slate-200 bg-white hover:border-rose-300 hover:bg-rose-50/30'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className={`p-6 rounded-3xl transition-transform duration-300 group-hover:scale-110 ${darkMode ? 'bg-slate-700' : 'bg-rose-50'}`}>
          <UploadCloud size={56} className="text-rose-500" />
        </div>
        
        <div>
          <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            {description}
          </h3>
          <p className={`text-base font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            or click to browse from your computer
          </p>
          {accept !== "*" && (
            <p className="mt-2 text-sm text-slate-400">
              Accepted: {accept.split(',').map(type => type.trim()).join(', ')}
            </p>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-8 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          {files.map((file, idx) => (
            <div key={idx} className={`flex items-center justify-between p-5 rounded-2xl border transition-all hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
                  <File size={24} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold truncate max-w-[200px] sm:max-w-md text-lg">{file.name}</span>
                  <span className="text-sm opacity-60 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
              {onRemoveFile && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemoveFile(idx); }}
                  className="p-3 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 rounded-xl transition-colors opacity-40 hover:opacity-100"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUploader

// okay
