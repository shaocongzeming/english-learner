import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Trash2, Search, BookOpen, Pencil, Check, X } from 'lucide-react'
import AudioButton from '../../components/AudioButton'
import { useWordStore } from '../../stores/useWordStore'

export default function MyWords() {
  const { customWords, removeCustomWord, updateCustomWord } = useWordStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const sorted = [...customWords].sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? ''))

  const startEdit = (id: string, current: string) => {
    setEditingId(id)
    setEditValue(current)
  }

  const saveEdit = (id: string) => {
    updateCustomWord(id, { meaning: editValue.trim() })
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/vocabulary" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-xl font-bold">我的词库</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{sorted.length} 词</span>
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-mw-cream to-white dark:from-gray-800 dark:to-gray-900 border border-mw-red/20 dark:border-red-900/30 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-mw-red/10 text-mw-red">
            <Search size={18} />
          </div>
          <div>
            <p className="font-medium text-sm">在顶部搜索栏查词,一键加入</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">查询结果右上角有"加入我的词库"按钮</p>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700">
          <BookOpen size={40} className="mx-auto text-gray-300 dark:text-gray-600" />
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400">还没有自定义单词</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            在顶部搜索任意英文词,查询后点击"加入我的词库"
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((w) => {
            const isEditing = editingId === w.id
            return (
              <li
                key={w.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/word/${encodeURIComponent(w.word.toLowerCase())}`}
                      className="inline-flex items-center gap-2 group"
                    >
                      <span
                        className="text-lg font-bold group-hover:text-mw-red transition-colors"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {w.word}
                      </span>
                      {w.phonetic && (
                        <span className="text-sm text-gray-400 dark:text-gray-500">{w.phonetic}</span>
                      )}
                    </Link>
                    <AudioButton
                      audioUrl={w.audioUrl}
                      fallbackText={w.word}
                      size={14}
                      className="inline-flex items-center justify-center w-7 h-7 ml-1 rounded-full text-mw-red hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                    />
                    {w.enDefinition && (
                      <p
                        className="mt-1 text-sm text-gray-700 dark:text-gray-200 line-clamp-2"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {w.enDefinition}
                      </p>
                    )}
                    {isEditing ? (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="中文释义"
                          className="flex-1 px-2 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:border-mw-red"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(w.id)}
                          className="p-1.5 rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        {w.meaning || <span className="italic text-gray-400">未填中文释义</span>}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(w.id, w.meaning)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-mw-red hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="编辑中文释义"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`从我的词库中删除 "${w.word}"?`)) removeCustomWord(w.id)
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="删除"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
