import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Merge from './pages/Merge'
import Split from './pages/Split'
import Compress from './pages/Compress'
import ImageToPDF from './pages/ImageToPDF'
import WordToPDF from './pages/WordToPDF'
import PptToPDF from './pages/PptToPDF'
import PdfToJpg from './pages/PdfToJpg'
import CropPDF from './pages/CropPDF'
import DeletePages from './pages/DeletePages'
import OCR from './pages/OCR'
import OrganizePDF from './pages/OrganizePDF'
import AddPageNumbers from './pages/AddPageNumbers'

function AppContent() {
  const { darkMode } = useTheme()

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      <ScrollToTop />
      <main className="container mx-auto px-4 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/merge" element={<Merge />} />
          <Route path="/split" element={<Split />} />
          <Route path="/compress" element={<Compress />} />
          <Route path="/image-to-pdf" element={<ImageToPDF />} />
          <Route path="/word-to-pdf" element={<WordToPDF />} />
          <Route path="/ppt-to-pdf" element={<PptToPDF />} />
          <Route path="/pdf-to-jpg" element={<PdfToJpg />} />
          <Route path="/crop" element={<CropPDF />} />
          <Route path="/delete-pages" element={<DeletePages />} />
          <Route path="/ocr" element={<OCR />} />
          <Route path="/organize" element={<OrganizePDF />} />
          <Route path="/page-numbers" element={<AddPageNumbers />} />
        </Routes>
      </main>
      <footer className={`py-6 border-t ${darkMode ? 'border-slate-900 text-slate-600' : 'border-slate-200 text-slate-400'}`}>
        <div className="container mx-auto px-24 lg:px-48 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-medium">© 2025 PDF MATRIX. Built for speed and privacy.</p>
          <div className="flex items-center gap-3">
            <a 
              href="https://www.linkedin.com/in/kushagraarya" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`p-2.5 rounded-lg transition-all duration-200 ${darkMode ? 'hover:bg-slate-800 hover:text-blue-400' : 'hover:bg-slate-100 hover:text-blue-600'}`}
              title="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a 
              href="https://github.com/kushagra-arya" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`p-2.5 rounded-lg transition-all duration-200 ${darkMode ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'}`}
              title="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}

export default App
