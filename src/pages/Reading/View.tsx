import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Pause, Square, Gauge } from 'lucide-react'
import { builtinArticles } from '../../data/reading/articles'
import { useReadingStore } from '../../stores/useReadingStore'
import ArticleReader from '../../components/reading/ArticleReader'
import WordPopover from '../../components/reading/WordPopover'
import { useArticleTTS } from '../../hooks/useArticleTTS'
import { AnimatePresence } from 'framer-motion'
import type { Article } from '../../types/reading'

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  advanced: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
}

const SPEED_OPTIONS = [0.5, 0.7, 0.8, 1, 1.2]

export default function ReadingView() {
  const { articleId } = useParams<{ articleId: string }>()
  const navigate = useNavigate()
  const onlineArticles = useReadingStore((s) => s.onlineArticles)
  const updateProgress = useReadingStore((s) => s.updateProgress)
  const addToHistory = useReadingStore((s) => s.addToHistory)

  const [article, setArticle] = useState<Article | null>(null)
  const [popover, setPopover] = useState<{ word: string; rect: DOMRect } | null>(null)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)

  const tts = useArticleTTS()

  useEffect(() => {
    if (!articleId) return
    const found =
      builtinArticles.find((a) => a.id === articleId) ??
      onlineArticles.find((a) => a.id === articleId) ??
      null
    setArticle(found)
    if (found) addToHistory(found.id)
  }, [articleId, onlineArticles, addToHistory])

  useEffect(() => {
    if (!article) return
    const handleBeforeUnload = () => {
      updateProgress(article.id, {
        completed: true,
        lastReadAt: new Date().toISOString(),
      })
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [article, updateProgress])

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-400 dark:text-gray-500">文章不存在</p>
        <button
          onClick={() => navigate('/reading')}
          className="mt-4 text-mw-red hover:underline"
        >
          返回阅读列表
        </button>
      </div>
    )
  }

  const handleWordClick = (word: string, rect: DOMRect) => {
    setPopover({ word, rect })
    const lookedUp = useReadingStore.getState().progress[article.id]?.lookedUpWords ?? []
    if (!lookedUp.includes(word)) {
      updateProgress(article.id, { lookedUpWords: [...lookedUp, word] })
    }
  }

  const handleMarkComplete = () => {
    updateProgress(article.id, {
      completed: true,
      lastReadAt: new Date().toISOString(),
    })
    navigate('/reading')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-32">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/reading')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-mw-red dark:hover:text-red-400 transition-colors mb-4"
        >
          <ArrowLeft size={16} /> 返回列表
        </button>
        <h1
          className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {article.title}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${DIFFICULTY_COLORS[article.difficulty]}`}>
            {DIFFICULTY_LABELS[article.difficulty]}
          </span>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {article.wordCount} 词 · {article.sentences.length} 句
          </span>
          {article.topic && (
            <span className="text-sm text-gray-400 dark:text-gray-500">
              · {article.topic}
            </span>
          )}
        </div>
      </div>

      {/* Article body */}
      <ArticleReader
        sentences={article.sentences}
        highlightIndex={tts.currentSentenceIndex}
        onWordClick={handleWordClick}
      />

      {/* Mark complete */}
      <div className="mt-8 text-center">
        <button
          onClick={handleMarkComplete}
          className="px-6 py-2.5 rounded-xl bg-mw-red text-white font-medium hover:bg-mw-red-hover transition-colors"
        >
          标记已读完
        </button>
      </div>

      {/* TTS control bar */}
      <div className="fixed bottom-20 left-0 right-0 z-40">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg px-4 py-3 flex items-center gap-3">
            {!tts.playing ? (
              <button
                onClick={() => tts.play(article.sentences)}
                className="w-10 h-10 rounded-full bg-mw-red text-white flex items-center justify-center hover:bg-mw-red-hover transition-colors"
              >
                <Play size={18} className="ml-0.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={tts.paused ? tts.resume : tts.pause}
                  className="w-10 h-10 rounded-full bg-mw-red text-white flex items-center justify-center hover:bg-mw-red-hover transition-colors"
                >
                  {tts.paused ? <Play size={18} className="ml-0.5" /> : <Pause size={18} />}
                </button>
                <button
                  onClick={tts.stop}
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <Square size={16} />
                </button>
              </>
            )}

            <span className="text-sm text-gray-500 dark:text-gray-400 flex-1 text-center">
              {tts.playing
                ? `朗读中 ${tts.currentSentenceIndex + 1}/${article.sentences.length}`
                : '点击播放朗读'}
            </span>

            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-mw-red dark:hover:text-red-400 transition-colors"
              >
                <Gauge size={16} />
                {tts.rate}x
              </button>
              {showSpeedMenu && (
                <>
                  <div className="fixed inset-0" onClick={() => setShowSpeedMenu(false)} />
                  <div className="absolute right-0 bottom-full mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                    {SPEED_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => { tts.setRate(s); setShowSpeedMenu(false) }}
                        className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          tts.rate === s ? 'text-mw-red font-medium' : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Word popover */}
      <AnimatePresence>
        {popover && (
          <WordPopover
            word={popover.word}
            anchorRect={popover.rect}
            onClose={() => setPopover(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
