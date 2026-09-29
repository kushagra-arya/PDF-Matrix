import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Sun, Moon, ChevronDown, Menu } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { WordIcon, PptIcon, JpgIcon, PdfToJpgIcon, OcrIcon } from './icons/CustomIcons'

function Navbar() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [isConvertHovered, setIsConvertHovered] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <nav className={`w-full h-24 border-b px-24 lg:px-48 relative z-50 transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
      <div className="container mx-auto px-4 flex items-center h-full">

        {/* Left: Logo & Title */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform">
            <img 
              src="/logo.png" 
              alt="PDF Matrix Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-red-500/20">M</div>';
              }}
            />
          </div>
          <span className={`font-bold text-2xl tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>PDF MATRIX</span>
        </Link>

        {/* Center: Main Tools & Mega Menu */}
        <div className="hidden lg:flex items-center h-full font-semibold text-base tracking-wide gap-2 flex-1 justify-center">
          <Link to="/merge" className={`px-4 py-2 rounded-lg transition-all duration-200 ${darkMode ? 'text-white hover:bg-white/10' : 'text-slate-800 hover:bg-slate-900/10'}`}>MERGE</Link>
          <Link to="/split" className={`px-4 py-2 rounded-lg transition-all duration-200 ${darkMode ? 'text-white hover:bg-white/10' : 'text-slate-800 hover:bg-slate-900/10'}`}>SPLIT</Link>
          <Link to="/compress" className={`px-4 py-2 rounded-lg transition-all duration-200 ${darkMode ? 'text-white hover:bg-white/10' : 'text-slate-800 hover:bg-slate-900/10'}`}>COMPRESS</Link>
          
          {/* Mega Menu Trigger */}
          <div 
            className="relative h-full flex items-center"
            onMouseEnter={() => setIsConvertHovered(true)}
            onMouseLeave={() => setIsConvertHovered(false)}
          >
            <button className={`px-4 py-2 flex items-center gap-1 rounded-lg transition-all duration-200 ${isConvertHovered ? 'text-rose-500' : darkMode ? 'text-white' : 'text-slate-800'}`}>
              CONVERT PDF <ChevronDown size={14} className={`transition-transform duration-200 ${isConvertHovered ? 'rotate-180' : ''}`} />
            </button>

            {/* The Dropdown Panel */}
            {isConvertHovered && (
              <div className={`absolute top-full left-1/2 -translate-x-1/2 w-[600px] shadow-2xl rounded-xl p-8 flex gap-8 animate-in fade-in slide-in-from-top-2 duration-200 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                {/* Column 1 */}
                <div className="flex-1">
                  <h4 className={`text-xs font-bold mb-4 tracking-wider transition-colors duration-200 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>CONVERT TO PDF</h4>
                  <ul className="space-y-4">
                    <li onClick={() => { navigate('/image-to-pdf'); setIsConvertHovered(false); }} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-8 h-8 scale-75">
                        <JpgIcon />
                      </div>
                      <span className={`font-medium transition-colors duration-200 group-hover:text-rose-500 ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>JPG to PDF</span>
                    </li>
                    <li onClick={() => { navigate('/word-to-pdf'); setIsConvertHovered(false); }} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-8 h-8 scale-75">
                        <WordIcon />
                      </div>
                      <span className={`font-medium transition-colors duration-200 group-hover:text-rose-500 ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>WORD to PDF</span>
                    </li>
                    <li onClick={() => { navigate('/ppt-to-pdf'); setIsConvertHovered(false); }} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-8 h-8 scale-75">
                        <PptIcon />
                      </div>
                      <span className={`font-medium transition-colors duration-200 group-hover:text-rose-500 ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>POWERPOINT to PDF</span>
                    </li>
                  </ul>
                </div>

                {/* Column 2 */}
                <div className="flex-1 border-l pl-8 border-slate-100 dark:border-slate-700 transition-colors duration-200">
                  <h4 className={`text-xs font-bold mb-4 tracking-wider transition-colors duration-200 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>CONVERT FROM PDF</h4>
                  <ul className="space-y-4">
                    <li onClick={() => { navigate('/pdf-to-jpg'); setIsConvertHovered(false); }} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-8 h-8 scale-75">
                        <PdfToJpgIcon />
                      </div>
                      <span className={`font-medium transition-colors duration-200 group-hover:text-rose-500 ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>PDF to JPG</span>
                    </li>
                    <li onClick={() => { navigate('/ocr'); setIsConvertHovered(false); }} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-8 h-8 scale-75">
                        <OcrIcon />
                      </div>
                      <span className={`font-medium transition-colors duration-200 group-hover:text-rose-500 ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>OCR - Text Recognition</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Dark Mode Button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode}
            className={`p-3 rounded-full transition-all ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button 
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} className={darkMode ? 'text-white' : 'text-slate-800'} />
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`absolute top-full left-0 right-0 border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} lg:hidden`}>
          <div className="flex flex-col p-4 space-y-2">
            <Link to="/merge" className={`px-4 py-3 rounded-lg ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} onClick={() => setIsMobileMenuOpen(false)}>Merge PDF</Link>
            <Link to="/split" className={`px-4 py-3 rounded-lg ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} onClick={() => setIsMobileMenuOpen(false)}>Split PDF</Link>
            <Link to="/compress" className={`px-4 py-3 rounded-lg ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} onClick={() => setIsMobileMenuOpen(false)}>Compress PDF</Link>
            <Link to="/image-to-pdf" className={`px-4 py-3 rounded-lg ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} onClick={() => setIsMobileMenuOpen(false)}>JPG to PDF</Link>
            <Link to="/word-to-pdf" className={`px-4 py-3 rounded-lg ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} onClick={() => setIsMobileMenuOpen(false)}>Word to PDF</Link>
            <Link to="/ppt-to-pdf" className={`px-4 py-3 rounded-lg ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} onClick={() => setIsMobileMenuOpen(false)}>PPT to PDF</Link>
            <Link to="/pdf-to-jpg" className={`px-4 py-3 rounded-lg ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} onClick={() => setIsMobileMenuOpen(false)}>PDF to JPG</Link>
            <Link to="/ocr" className={`px-4 py-3 rounded-lg ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} onClick={() => setIsMobileMenuOpen(false)}>OCR</Link>
            <Link to="/crop" className={`px-4 py-3 rounded-lg ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} onClick={() => setIsMobileMenuOpen(false)}>Crop PDF</Link>
            <Link to="/delete-pages" className={`px-4 py-3 rounded-lg ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} onClick={() => setIsMobileMenuOpen(false)}>Delete Pages</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

// okay
