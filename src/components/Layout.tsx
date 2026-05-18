import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BookOpen, Headphones, FileText, BarChart3, Sun, Moon, Search, X } from 'lucide-react'
import { useThemeStore } from '../stores/useThemeStore'
import SearchBar from './SearchBar'
import { AnimatePresence, motion } from 'framer-motion'

const navItems = [
  { to: '/', icon: BarChart3, label: '首页' },
  { to: '/vocabulary', icon: BookOpen, label: '单词' },
  { to: '/reading', icon: FileText, label: '阅读' },
  { to: '/listening', icon: Headphones, label: '听力' },
]

export default function Layout() {
  const { theme, toggle } = useThemeStore()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="app-shell min-h-screen text-slate-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-gray-800/90 backdrop-blur-xl border-b border-white/70 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-400 text-white shadow-lg shadow-teal-200/70 display-font text-xl">
              e
            </span>
            <span className="hidden sm:inline text-sm font-extrabold text-slate-700 dark:text-gray-200">Sprout English</span>
          </NavLink>

          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <SearchBar compact />
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="md:hidden p-2 rounded-xl hover:bg-white/70 dark:hover:bg-gray-700"
              aria-label="搜索"
            >
              {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            <button
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-white/70 dark:hover:bg-gray-700 transition-colors"
              aria-label="切换主题"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3">
            <SearchBar compact autoFocus onSubmitted={() => setMobileSearchOpen(false)} />
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/78 dark:bg-gray-800/92 backdrop-blur-xl border-t border-white/70 dark:border-gray-700">
        <div className="max-w-4xl mx-auto flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-100 text-teal-700 shadow-sm dark:bg-teal-950 dark:text-teal-200'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-white/60 hover:text-gray-700 dark:hover:text-gray-200'
                }`
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
