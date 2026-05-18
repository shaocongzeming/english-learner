import { useState } from 'react'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Article, ArticleDifficulty } from '../../types/reading'
import { splitIntoSentences } from '../../services/articleFetcher'
import { useReadingStore } from '../../stores/useReadingStore'

interface Props {
  onClose: () => void
}

const DIFFICULTY_OPTIONS: { key: ArticleDifficulty; label: string }[] = [
  { key: 'beginner', label: '初级' },
  { key: 'intermediate', label: '中级' },
  { key: 'advanced', label: '高级' },
]

export default function AddArticleModal({ onClose }: Props) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [difficulty, setDifficulty] = useState<ArticleDifficulty>('intermediate')
  const [topic, setTopic] = useState('')
  const addOnlineArticle = useReadingStore((s) => s.addOnlineArticle)

  const handleSubmit = () => {
    if (!title.trim() || !text.trim()) return

    const sentences = splitIntoSentences(text.trim())
    const wordCount = text.trim().split(/\s+/).length

    const article: Article = {
      id: `online-${Date.now()}`,
      title: title.trim(),
      difficulty,
      wordCount,
      source: '用户导入',
      summary: sentences[0]?.text.slice(0, 80) + (sentences[0]?.text.length > 80 ? '...' : '') || '无内容',
      topic: topic.trim() || undefined,
      addedAt: new Date().toISOString().split('T')[0],
      sentences,
    }

    addOnlineArticle(article)
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            添加文章
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              标题 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入文章标题"
              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-mw-red text-sm text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              难度
            </label>
            <div className="flex gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setDifficulty(opt.key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    difficulty === opt.key
                      ? 'bg-mw-red text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              主题（可选）
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="如：科技、文化、生活"
              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-mw-red text-sm text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              文章内容 *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="粘贴英文文章内容..."
              rows={10}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-mw-red text-sm text-gray-900 dark:text-gray-100 resize-y"
            />
            {text.trim() && (
              <p className="mt-1 text-xs text-gray-400">
                {text.trim().split(/\s+/).length} 词 · {splitIntoSentences(text).length} 句
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !text.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-mw-red text-white font-medium hover:bg-mw-red-hover disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-700 transition-colors"
          >
            添加
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
