import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen, Headphones, FileText, BarChart3, Sun, Moon, Search, X } from 'lucide-react'
import { useThemeStore } from '../stores/useThemeStore'
import SearchBar from './SearchBar'

const navItems = [
  { to: '/', icon: BarChart3, label: '首页' },
  { to: '/vocabulary', icon: BookOpen, label: '单词' },
  { to: '/reading', icon: FileText, label: '阅读' },
  { to: '/listening', icon: Headphones, label: '听力' },
]

export default function Layout() {
  const { theme, toggle } = useThemeStore()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <span
              className="text-xl font-bold tracking-tight text-mw-red"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              EL
            </span>
            <span className="hidden sm:inline text-sm font-medium text-gray-600 dark:text-gray-300">English Learner</span>
          </NavLink>

          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <SearchBar compact />
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="搜索"
            >
              {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs transition-colors ${
                  isActive
                    ? 'text-mw-red'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
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
