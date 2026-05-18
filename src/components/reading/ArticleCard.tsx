import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import type { Article } from '../../types/reading'
import { useReadingStore } from '../../stores/useReadingStore'

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  advanced: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
}

interface Props {
  article: Article
}

export default function ArticleCard({ article }: Props) {
  const navigate = useNavigate()
  const progress = useReadingStore((s) => s.progress[article.id])

  return (
    <button
      onClick={() => navigate(`/reading/${article.id}`)}
      className="cream-panel w-full rounded-[1.6rem] p-5 text-left transition-all hover:-translate-y-1 hover:border-teal-300"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="display-font text-2xl text-gray-900 dark:text-gray-100 line-clamp-1">
          {article.title}
        </h3>
        {progress?.completed && (
          <Check size={18} className="shrink-0 text-green-500" />
        )}
      </div>

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${DIFFICULTY_COLORS[article.difficulty]}`}>
          {DIFFICULTY_LABELS[article.difficulty]}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {article.wordCount} 词
        </span>
        {article.topic && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            · {article.topic}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
        {article.summary}
      </p>
    </button>
  )
}
