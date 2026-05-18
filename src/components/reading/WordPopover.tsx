import { useEffect, useState } from 'react'
import { Plus, Check } from 'lucide-react'
import type { DictionaryEntry, Word } from '../../types/word'
import { lookupWord } from '../../services/dictionaryApi'
import { useWordStore } from '../../stores/useWordStore'
import AudioButton from '../AudioButton'
import { motion } from 'framer-motion'

interface Props {
  word: string
  anchorRect: DOMRect
  onClose: () => void
}

export default function WordPopover({ word, anchorRect, onClose }: Props) {
  const [entry, setEntry] = useState<DictionaryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [justAdded, setJustAdded] = useState(false)
  const addCustomWord = useWordStore((s) => s.addCustomWord)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    lookupWord(word).then((result) => {
      if (!cancelled) {
        setEntry(result)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [word])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.word-popover')) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const position = getPosition(anchorRect)

  const handleAdd = () => {
    const wordText = entry?.word ?? word
    const newWord: Word = {
      id: `custom-${Date.now()}-${wordText.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      word: wordText,
      phonetic: entry?.phonetic ?? '',
      pos: entry?.phoneticBreakdown?.[0]?.pos ?? '',
      meaning: entry?.cnTranslation ?? '',
      enDefinition: entry?.phoneticBreakdown?.[0]?.definition,
      examples: entry?.phoneticBreakdown?.[0]?.example
        ? [{ en: entry.phoneticBreakdown[0].example, zh: '' }]
        : [],
      level: 'custom',
      frequency: 3,
      audioUrl: entry?.audioUrl ?? undefined,
      synonyms: entry?.synonyms ?? [],
      source: 'custom',
      addedAt: new Date().toISOString(),
    }
    addCustomWord(newWord)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1800)
  }

  return (
    <motion.div
      className="word-popover fixed z-50 w-72 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl"
      style={{ left: position.left, top: position.top }}
      initial={{ opacity: 0, scale: 0.9, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 4 }}
      transition={{ duration: 0.15 }}
    >
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-mw-red rounded-full animate-spin" />
            查询中...
          </div>
        ) : !entry ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            未找到「{word}」的释义
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span
                className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {entry.word}
              </span>
              {entry.phonetic && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {entry.phonetic}
                </span>
              )}
              <AudioButton
                audioUrl={entry.audioUrl ?? undefined}
                fallbackText={entry.word}
                size={14}
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-mw-red bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/60 dark:text-red-400 transition-colors"
              />
            </div>

            {entry.phoneticBreakdown.length > 0 && (
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                {entry.phoneticBreakdown.slice(0, 2).map((b, i) => (
                  <div key={i}>
                    {b.pos && (
                      <span className="text-[11px] uppercase text-gray-400 dark:text-gray-500 mr-1">
                        {b.pos}
                      </span>
                    )}
                    {b.definition}
                  </div>
                ))}
              </div>
            )}

            {entry.cnTranslation && (
              <div className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
                {entry.cnTranslation}
              </div>
            )}

            <div className="pt-1">
              {justAdded ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                  <Check size={14} /> 已加入词库
                </span>
              ) : (
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center gap-1.5 text-sm font-medium bg-mw-red text-white px-3 py-1.5 rounded-lg hover:bg-mw-red-hover transition-colors"
                >
                  <Plus size={14} /> 加入词库
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

function getPosition(anchorRect: DOMRect): { left: number; top: number } {
  const popoverWidth = 288
  const popoverHeight = 250
  const gap = 8

  let left = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2
  let top = anchorRect.bottom + gap

  if (left < 8) left = 8
  if (left + popoverWidth > window.innerWidth - 8) left = window.innerWidth - popoverWidth - 8
  if (top + popoverHeight > window.innerHeight - 8) {
    top = anchorRect.top - popoverHeight - gap
  }

  return { left, top }
}
