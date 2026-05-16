import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { dailyWords } from '../data/vocabulary/daily'
import { cet4Words } from '../data/vocabulary/cet4'
import { useWordStore } from '../stores/useWordStore'

interface SearchBarProps {
  /** Compact appearance for embedding in the top bar */
  compact?: boolean
  autoFocus?: boolean
  initialValue?: string
  onSubmitted?: () => void
}

export default function SearchBar({ compact = true, autoFocus = false, initialValue = '', onSubmitted }: SearchBarProps) {
  const [term, setTerm] = useState(initialValue)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const customWords = useWordStore((s) => s.customWords)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const suggestions = useMemo(() => {
    const q = term.trim().toLowerCase()
    if (!q || q.length < 2) return []
    const pool = [...customWords, ...dailyWords, ...cet4Words]
    const seen = new Set<string>()
    const matches: { word: string; meaning?: string; source: 'custom' | 'preset' }[] = []
    for (const w of pool) {
      const lower = w.word.toLowerCase()
      if (seen.has(lower)) continue
      if (lower.startsWith(q) || lower.includes(q)) {
        seen.add(lower)
        matches.push({
          word: w.word,
          meaning: w.meaning,
          source: w.source === 'custom' ? 'custom' : 'preset',
        })
      }
      if (matches.length >= 6) break
    }
    return matches
  }, [term, customWords])

  const submit = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setOpen(false)
    setTerm('')
    navigate(`/word/${encodeURIComponent(trimmed.toLowerCase())}`)
    onSubmitted?.()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit(term)
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`flex items-center gap-2 rounded-full border transition-colors bg-white dark:bg-gray-800 ${
          compact
            ? 'h-10 px-3 border-gray-200 dark:border-gray-700 focus-within:border-mw-red'
            : 'h-14 px-5 border-gray-300 dark:border-gray-600 focus-within:border-mw-red shadow-sm'
        }`}
      >
        <Search size={compact ? 16 : 20} className="text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={compact ? 'Search the dictionary…' : 'Look up any English word…'}
          className={`flex-1 bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
            compact ? 'text-sm' : 'text-base'
          }`}
          autoComplete="off"
          spellCheck={false}
        />
        {term && (
          <button
            type="button"
            onClick={() => {
              setTerm('')
              inputRef.current?.focus()
            }}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="清空"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.word}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                submit(s.word)
              }}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/60"
            >
              <span className="font-medium">{s.word}</span>
              <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                {s.source === 'custom' && (
                  <span className="text-[10px] uppercase tracking-wider text-mw-red font-semibold">My</span>
                )}
                <span className="truncate max-w-[160px]">{s.meaning ?? ''}</span>
              </span>
            </button>
          ))}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              submit(term)
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-mw-red font-medium hover:bg-red-50 dark:hover:bg-red-950/30 border-t border-gray-100 dark:border-gray-700"
          >
            搜索 "{term}" →
          </button>
        </div>
      )}
    </div>
  )
}
