import { Link } from 'react-router-dom'
import { ArrowRight, Lock, Rocket, Palette } from 'lucide-react'
import { TOOLS } from '../config/tools'
import { useTheme } from '../context/ThemeContext'

function Home() {
  const { darkMode } = useTheme()

  return (
    <div className="py-20 animate-in fade-in duration-700">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className={`text-5xl md:text-6xl font-extrabold mb-8 tracking-tight leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Every tool you need to <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">manage your PDFs</span>
        </h1>
        <p className={`text-xl md:text-2xl font-medium leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Merge, split, compress, and convert PDFs entirely in your browser. 
          <br className="hidden md:block"/> Fast, private, and 100% free.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {TOOLS.map((tool) => (
          <Link
            key={tool.id}
            to={tool.path}
            className={`group relative p-8 rounded-3xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col items-start
              ${darkMode 
                ? 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:shadow-slate-900/50' 
                : 'bg-white border-slate-100 hover:border-slate-200 shadow-xl shadow-slate-200/50'
              }`}
          >
            {/* Icon Container */}
            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center shadow-lg ${tool.color} shadow-${tool.color}/30 group-hover:scale-110 transition-transform duration-300`}>
              {tool.icon}
            </div>
            
            <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{tool.name}</h3>
            <p className={`text-sm leading-relaxed font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tool.desc}</p>
            
            <div className={`absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 ${darkMode ? 'text-slate-500' : 'text-slate-300'}`}>
              <ArrowRight size={24} />
            </div>
          </Link>
        ))}
      </div>

      <div className={`mt-20 max-w-7xl mx-auto px-4 p-12 rounded-3xl ${darkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-100 shadow-xl'}`}>
        <h2 className={`text-3xl font-bold mb-8 text-center ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Why Choose PDF Matrix?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
            </div>
            <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Privacy First</h3>
            <p className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              All files are automatically deleted after processing. We don't store your data.
            </p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                <Rocket className="w-10 h-10 text-orange-600 dark:text-orange-400" strokeWidth={2} />
              </div>
            </div>
            <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Fast & Free</h3>
            <p className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Lightning-fast processing with no registration or fees required.
            </p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-pink-100 dark:bg-pink-900/30 rounded-2xl">
                <Palette className="w-10 h-10 text-pink-600 dark:text-pink-400" strokeWidth={2} />
              </div>
            </div>
            <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Simple & Clean</h3>
            <p className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Beautiful, intuitive interface that just works. No clutter, no ads.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

// okay
