import { useState, useMemo } from 'react'
import { ArrowLeft, Download, Loader2, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TOOLS } from '../config/tools'
import FileUploader from '../components/FileUploader'
import { useTheme } from '../context/ThemeContext'
import { getApiUrl } from '../config/api'

const FORMATS = [
  { value: 'numeric',    label: '1, 2, 3' },
  { value: 'roman',      label: 'i, ii, iii' },
  { value: 'alpha',      label: 'A, B, C' },
  { value: 'page_n',     label: 'Page 1' },
  { value: 'n_of_total', label: '1 / 10' },
]

const POSITIONS = [
  ['top-left',    'top-center',    'top-right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
]

const PRESET_COLORS = [
  '#4D4D4D', '#000000', '#E53E3E', '#3B82F6', '#10B981', '#8B5CF6', '#F97316',
]

function toRoman(n) {
  const v = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  const s = ['m','cm','d','cd','c','xc','l','xl','x','ix','v','iv','i']
  let r = ''
  v.forEach((val, i) => { while (n >= val) { r += s[i]; n -= val } })
  return r
}

function toAlpha(n) {
  if (n === 0) return '0'
  let r = ''
  while (n > 0) { n--; r = String.fromCharCode(65 + n % 26) + r; n = Math.floor(n / 26) }
  return r
}

function formatNumber(num, total, fmt) {
  if (fmt === 'roman') return toRoman(num)
  if (fmt === 'alpha') return toAlpha(num)
  if (fmt === 'page_n') return `Page ${num}`
  if (fmt === 'n_of_total') return `${num} / ${total}`
  return String(num)
}

function AddPageNumbers() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [success, setSuccess] = useState(false)
  const { darkMode } = useTheme()
  const navigate = useNavigate()
  const tool = TOOLS.find(t => t.id === 'page-numbers')

  // Options state
  const [activeTab, setActiveTab] = useState('format')
  const [numberFormat, setNumberFormat] = useState('numeric')
  const [position, setPosition] = useState('bottom-center')
  const [startAt, setStartAt] = useState(0)
  const [fontSize, setFontSize] = useState(10)
  const [fontWeight, setFontWeight] = useState('regular')
  const [colorHex, setColorHex] = useState('#4D4D4D')
  const [skipFirst, setSkipFirst] = useState(false)
  const [customColor, setCustomColor] = useState('#4D4D4D')

  const previewLabel = useMemo(
    () => formatNumber(startAt, 10, numberFormat),
    [startAt, numberFormat]
  )

  // --- handlers ---
  const handleProcess = async () => {
    if (!file) { setError('Please select a PDF file'); return }
    setLoading(true); setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('number_format', numberFormat)
      fd.append('position', position)
      fd.append('start_at', startAt)
      fd.append('font_size', fontSize)
      fd.append('font_weight', fontWeight)
      fd.append('color_hex', colorHex)
      fd.append('skip_first', skipFirst)

      const res = await fetch(getApiUrl('api/pdf/page-numbers'), { method: 'POST', body: fd })
      if (!res.ok) {
        const ct = res.headers.get('content-type') || ''
        let msg = 'Failed to add page numbers'
        if (ct.includes('json')) { try { msg = (await res.json()).detail || msg } catch {} }
        throw new Error(msg)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const name = file.name.replace(/\.pdf$/i, '')
      setDownloadUrl({ url, filename: `${name}_numbered.pdf` })
      setSuccess(true)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const handleDownload = () => {
    if (!downloadUrl) return
    const a = document.createElement('a')
    a.href = downloadUrl.url; a.download = downloadUrl.filename
    document.body.appendChild(a); a.click()
    URL.revokeObjectURL(downloadUrl.url); document.body.removeChild(a)
  }

  const handleReset = () => {
    setFile(null); setDownloadUrl(null); setSuccess(false); setError(null)
  }

  // --- position label ---
  const posLabel = (p) => p.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())

  // ---- render states ----
  if (success) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-8"><CheckCircle size={48} strokeWidth={3} /></div>
          <h2 className={`text-4xl font-extrabold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>It's Ready!</h2>
          <p className={`text-lg mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Page numbers added successfully</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
            <button onClick={handleReset} className={`flex-1 px-8 py-4 rounded-xl font-bold transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Start Over</button>
            <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5"><Download size={20} /> Download</button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="relative mb-10"><div className="absolute inset-0 bg-rose-500 blur-xl opacity-20 rounded-full animate-pulse" /><Loader2 size={80} className="text-rose-500 animate-spin relative z-10" /></div>
          <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Adding Page Numbers...</h2>
          <p className={`text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Please wait a moment.</p>
        </div>
      </div>
    )
  }

  const tabBtn = (id, label) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all ${activeTab === id
        ? (darkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow')
        : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')}`}
    >{label}</button>
  )

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
        <button onClick={() => navigate('/')} className={`self-start p-3 rounded-xl transition-all ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:bg-white hover:shadow-md'}`}><ArrowLeft size={24} /></button>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center shadow-lg`}>{tool.icon}</div>
            <h1 className={`text-4xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tool.name}</h1>
          </div>
          <p className={`text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tool.desc}</p>
        </div>
      </div>

      {/* File uploader */}
      {!file && (
        <FileUploader onFilesSelected={(f) => { if (f.length) { setFile(f[0]); setError(null) } }} accept="PDF" multiple={false} description="Select or drag & drop a PDF file" />
      )}

      {file && (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Options panel */}
          <div className={`flex-1 rounded-2xl p-6 shadow-lg ${darkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
            {/* Tabs */}
            <div className={`flex gap-1 p-1 rounded-full mb-6 ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
              {tabBtn('format', 'Format & Position')}
              {tabBtn('style', 'Text Style')}
            </div>

            {/* ---- Format & Position tab ---- */}
            {activeTab === 'format' && (
              <div className="space-y-6">
                {/* Number format */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Number Format</label>
                  <div className="flex flex-wrap gap-2">
                    {FORMATS.map(f => (
                      <button key={f.value} onClick={() => setNumberFormat(f.value)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${numberFormat === f.value
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                          : (darkMode ? 'border-slate-600 text-slate-300 hover:border-slate-400' : 'border-slate-300 text-slate-700 hover:border-slate-500')}`}
                      >{f.label}</button>
                    ))}
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Position</label>
                  <div className={`rounded-2xl p-4 ${darkMode ? 'bg-slate-900' : 'bg-slate-50 border border-slate-200'}`}>
                    {POSITIONS.map((row, ri) => (
                      <div key={ri} className={`flex justify-between ${ri === 0 ? 'mb-12' : ''}`}>
                        {row.map(pos => (
                          <button key={pos} onClick={() => setPosition(pos)} title={posLabel(pos)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${position === pos
                              ? 'bg-slate-900 dark:bg-white scale-110 shadow-lg' : (darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300')}`}>
                            <div className={`w-3 h-3 rounded-full ${position === pos ? 'bg-white dark:bg-slate-900' : (darkMode ? 'bg-slate-500' : 'bg-slate-400')}`} />
                          </button>
                        ))}
                      </div>
                    ))}
                    <p className={`text-center text-sm mt-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{posLabel(position)}</p>
                  </div>
                </div>

                {/* Start At & Font Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Start At</label>
                    <input type="number" min={0} value={startAt} onChange={e => setStartAt(Math.max(0, Number(e.target.value)))}
                      className={`w-full px-4 py-3 rounded-xl font-semibold text-lg ${darkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900'} border focus:ring-2 focus:ring-rose-500 outline-none`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Font Size (pt)</label>
                    <input type="number" min={6} max={48} value={fontSize} onChange={e => setFontSize(Math.min(48, Math.max(6, Number(e.target.value))))}
                      className={`w-full px-4 py-3 rounded-xl font-semibold text-lg ${darkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900'} border focus:ring-2 focus:ring-rose-500 outline-none`} />
                  </div>
                </div>

                {/* Skip first */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" checked={skipFirst} onChange={e => setSkipFirst(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500" />
                  <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Skip first page (cover)</span>
                </label>
              </div>
            )}

            {/* ---- Text Style tab ---- */}
            {activeTab === 'style' && (
              <div className="space-y-6">
                {/* Color */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Number Colour</label>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {PRESET_COLORS.map(c => (
                      <button key={c} onClick={() => { setColorHex(c); setCustomColor(c) }}
                        className={`w-10 h-10 rounded-full transition-all ${colorHex === c ? 'ring-2 ring-offset-2 ring-rose-500 scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                    {/* custom via native picker */}
                    <label className="w-10 h-10 rounded-full cursor-pointer overflow-hidden relative bg-gradient-to-br from-red-500 via-green-500 to-blue-500 hover:scale-105 transition-all"
                      title="Custom colour">
                      <input type="color" value={customColor}
                        onChange={e => { setCustomColor(e.target.value); setColorHex(e.target.value) }}
                        className="absolute inset-0 opacity-0 cursor-pointer" />
                    </label>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'bg-slate-900' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: colorHex }} />
                    <div>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Selected</p>
                      <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{colorHex.toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                {/* Font size slider */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Font Size — {fontSize}pt</label>
                  <input type="range" min={6} max={48} value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
                    className="w-full accent-rose-600" />
                  <div className="flex justify-between text-xs text-slate-400 mt-1"><span>6pt</span><span>24pt</span><span>48pt</span></div>
                </div>

                {/* Font weight */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Font Weight</label>
                  <div className="flex gap-2">
                    {['regular', 'bold'].map(w => (
                      <button key={w} onClick={() => setFontWeight(w)}
                        className={`flex-1 py-2.5 rounded-full text-sm font-semibold border transition-all capitalize ${fontWeight === w
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                          : (darkMode ? 'border-slate-600 text-slate-300 hover:border-slate-400' : 'border-slate-300 text-slate-700 hover:border-slate-500')}`}
                      >{w === 'regular' ? 'Regular' : 'Bold'}</button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Live Preview</label>
                  <div className={`rounded-xl p-6 flex items-center justify-center ${darkMode ? 'bg-slate-900' : 'bg-slate-50 border border-slate-200'}`}>
                    <span style={{ fontSize: `${fontSize}pt`, fontWeight: fontWeight === 'bold' ? 700 : 400, color: colorHex }}>{previewLabel}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* File info & action on the right */}
          <div className="lg:w-72 flex flex-col gap-4">
            <div className={`rounded-2xl p-4 ${darkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'} shadow-lg`}>
              <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{file.name}</p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{(file.size / 1024).toFixed(1)} KB</p>
              <button onClick={() => { setFile(null); setError(null) }} className="mt-3 text-xs text-red-500 hover:text-red-400 font-semibold">Remove file</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom action bar when file present */}
      {file && (
        <div className={`mt-8 p-5 rounded-2xl flex flex-col sm:flex-row justify-end gap-4 shadow-xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-blue-50 border border-blue-200'}`}>
          <button onClick={handleProcess} className="flex items-center gap-3 bg-rose-600 hover:bg-rose-500 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-rose-500/25 transform hover:-translate-y-0.5">
            Add Numbers →
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}

export default AddPageNumbers
