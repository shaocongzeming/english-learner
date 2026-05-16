import { useState } from 'react'
import { Plus, Check, BookmarkPlus, Trash2 } from 'lucide-react'
import AudioButton from './AudioButton'
import type { DictionaryEntry, Word } from '../types/word'
import { useWordStore } from '../stores/useWordStore'

interface WordDetailCardProps {
  /** API-fetched data (may be null for offline / unknown words) */
  entry: DictionaryEntry | null
  /** The term the user searched/visited (lowercase) */
  term: string
  /** Existing local word, if already saved */
  localWord?: Word
  /** Loading state to render skeleton */
  loading?: boolean
  /** Show "+ add to my words" CTA */
  showAddButton?: boolean
}

const POS_COLOR: Record<string, string> = {
  noun: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  verb: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  adjective: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  adverb: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  pronoun: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  preposition: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

function posChip(pos: string) {
  const key = pos.toLowerCase()
  return POS_COLOR[key] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}

export default function WordDetailCard({
  entry,
  term,
  localWord,
  loading,
  showAddButton = true,
}: WordDetailCardProps) {
  const { addCustomWord, removeCustomWord } = useWordStore()
  const [meaningInput, setMeaningInput] = useState(localWord?.meaning ?? '')
  const [showAddForm, setShowAddForm] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const wordText = entry?.word ?? localWord?.word ?? term
  const phonetic = entry?.phonetic || localWord?.phonetic || ''
  const audioUrl = entry?.audioUrl ?? localWord?.audioUrl
  const synonyms = entry?.synonyms ?? localWord?.synonyms ?? []

  const breakdown = entry?.phoneticBreakdown ?? (localWord?.enDefinition
    ? [{ pos: localWord.pos || '', definition: localWord.enDefinition }]
    : [])

  const isCustomSaved = localWord?.source === 'custom'

  const handleAdd = () => {
    const newWord: Word = {
      id: `custom-${Date.now()}-${wordText.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      word: wordText,
      phonetic,
      pos: breakdown[0]?.pos ?? '',
      meaning: meaningInput.trim(),
      enDefinition: breakdown[0]?.definition,
      examples: breakdown[0]?.example
        ? [{ en: breakdown[0].example, zh: '' }]
        : [],
      level: 'custom',
      frequency: 3,
      audioUrl: audioUrl ?? undefined,
      synonyms,
      source: 'custom',
      addedAt: new Date().toISOString(),
    }
    addCustomWord(newWord)
    setJustAdded(true)
    setShowAddForm(false)
    setTimeout(() => setJustAdded(false), 1800)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-700/60 rounded" />
          <div className="h-3 w-5/6 bg-gray-100 dark:bg-gray-700/60 rounded" />
          <div className="h-3 w-4/6 bg-gray-100 dark:bg-gray-700/60 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight break-words"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {wordText}
          </h1>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            {phonetic && (
              <span className="text-base text-gray-500 dark:text-gray-400">{phonetic}</span>
            )}
            <AudioButton
              audioUrl={audioUrl ?? undefined}
              fallbackText={wordText}
              size={18}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full text-mw-red bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/60 dark:text-red-400 transition-colors"
            />
          </div>
        </div>

        {showAddButton && (
          <div className="shrink-0">
            {isCustomSaved ? (
              <button
                type="button"
                onClick={() => localWord && removeCustomWord(localWord.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-red-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} /> 已加入
              </button>
            ) : justAdded ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400">
                <Check size={14} /> 已加入
              </span>
            ) : showAddForm ? null : (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                disabled={!entry && !localWord}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-mw-red text-white hover:bg-mw-red-hover disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={14} /> 加入我的词库
              </button>
            )}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
            <BookmarkPlus size={16} />
            <span>加入「我的词库」(可选填中文释义)</span>
          </div>
          <input
            type="text"
            value={meaningInput}
            onChange={(e) => setMeaningInput(e.target.value)}
            placeholder="中文释义 (可留空)"
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-900/40 outline-none focus:border-mw-red text-sm"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-sm rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-3 py-1.5 text-sm rounded-lg bg-mw-red text-white hover:bg-mw-red-hover"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {breakdown.length > 0 ? (
        <div className="space-y-5 pt-2">
          {breakdown.map((b, i) => (
            <div key={`${b.pos}-${i}`} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <div className="pt-0.5">
                <span
                  className="text-3xl font-semibold text-gray-300 dark:text-gray-600 leading-none select-none"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {i + 1}
                </span>
              </div>
              <div>
                {b.pos && (
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wide mb-1 ${posChip(b.pos)}`}>
                    {b.pos}
                  </span>
                )}
                <p
                  className="text-base text-gray-800 dark:text-gray-100 leading-relaxed"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {b.definition}
                </p>
                {i === 0 && localWord?.meaning && (
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{localWord.meaning}</p>
                )}
                {b.example && (
                  <p className="mt-2 text-sm italic text-gray-500 dark:text-gray-400 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                    "{b.example}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 dark:text-gray-400 text-sm">未找到该词条。请检查拼写或换个词试试。</div>
      )}

      {localWord?.examples && localWord.examples.length > 0 && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <h3 className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 font-semibold">
            Examples
          </h3>
          <ul className="space-y-2.5">
            {localWord.examples.slice(0, 3).map((ex, i) => (
              <li key={i} className="text-sm">
                <p className="text-gray-800 dark:text-gray-200">• {ex.en}</p>
                {ex.zh && <p className="text-gray-500 dark:text-gray-400 mt-0.5 pl-3">{ex.zh}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {synonyms.length > 0 && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <h3 className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 font-semibold">
            Synonyms
          </h3>
          <div className="flex flex-wrap gap-2">
            {synonyms.map((s) => (
              <span key={s} className="text-sm text-gray-600 dark:text-gray-300">
                {s}
              </span>
            )).reduce<React.ReactNode[]>((acc, el, i) => {
              if (i > 0) acc.push(<span key={`sep-${i}`} className="text-gray-300 dark:text-gray-600">·</span>)
              acc.push(el)
              return acc
            }, [])}
          </div>
        </div>
      )}
    </div>
  )
}
