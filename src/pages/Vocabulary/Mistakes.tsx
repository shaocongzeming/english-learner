import { Link } from 'react-router-dom'
import { ArrowLeft, Trash2, RotateCcw, XCircle } from 'lucide-react'
import { dailyWords } from '../../data/vocabulary/daily'
import { useWordStore, applyEnrichment } from '../../stores/useWordStore'
import AudioButton from '../../components/AudioButton'
import type { Word } from '../../types/word'

export default function MistakeBook() {
  const { mistakes, removeMistake, clearMistakes, customWords, enrichment } = useWordStore()

  type MistakeEntry = (typeof mistakes)[string] & { word: Word }

  const pool: Word[] = [
    ...customWords,
    ...dailyWords.map((w) => applyEnrichment(w, enrichment)),
  ]

  const mistakeEntries: MistakeEntry[] = Object.values(mistakes)
    .map((m) => {
      const word = pool.find((w) => w.id === m.wordId)
      return word ? { ...m, word } : null
    })
    .filter(Boolean) as MistakeEntry[]

  mistakeEntries.sort((a, b) => b.count - a.count)

  if (mistakeEntries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/vocabulary" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-xl font-bold">错词本</h2>
        </div>
        <div className="text-center py-20">
          <XCircle size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-lg text-gray-500 dark:text-gray-400">暂无错词</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">学习中标记为"不认识"的词会出现在这里</p>
          <Link
            to="/vocabulary"
            className="inline-block mt-6 px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
          >
            去学习
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/vocabulary" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-xl font-bold">错词本</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{mistakeEntries.length} 词</span>
        </div>
        <button
          onClick={() => {
            if (confirm('确认清空所有错词？')) clearMistakes()
          }}
          className="p-2 rounded-lg text-gray-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Review all mistakes */}
      <Link
        to="/vocabulary/study"
        className="flex items-center justify-between bg-primary hover:bg-primary-hover text-white rounded-xl p-4 transition-colors"
      >
        <div className="flex items-center gap-3">
          <RotateCcw size={20} />
          <span className="font-medium">复习全部错词</span>
        </div>
        <span className="text-sm text-blue-100">学习中自动出现</span>
      </Link>

      {/* Mistake list */}
      <div className="space-y-2">
        {mistakeEntries.map((entry) => (
          <div
            key={entry.wordId}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/word/${encodeURIComponent(entry.word.word.toLowerCase())}`}
                    className="font-bold text-lg hover:text-mw-red transition-colors"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {entry.word.word}
                  </Link>
                  <span className="text-sm text-gray-400 dark:text-gray-500">{entry.word.phonetic}</span>
                  <AudioButton
                    audioUrl={entry.word.audioUrl}
                    fallbackText={entry.word.word}
                    size={14}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-mw-red hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                  />
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                  {entry.word.pos} {entry.word.meaning}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                  错 {entry.count} 次
                </span>
                <button
                  onClick={() => removeMistake(entry.wordId)}
                  className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-success hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  title="标记已掌握"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
