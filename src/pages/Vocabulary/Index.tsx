import { Link } from 'react-router-dom'
import { BookOpen, XCircle } from 'lucide-react'
import { useWordStore } from '../../stores/useWordStore'
import { dailyWords } from '../../data/vocabulary/daily'

export default function VocabularyIndex() {
  const { getDueWords, getNewWords, progress, getMistakeWordIds } = useWordStore()
  const allWordIds = dailyWords.map((w) => w.id)
  const dueCount = getDueWords(allWordIds).length
  const newCount = getNewWords(allWordIds).length
  const masteredCount = Object.values(progress).filter((p) => p.status === 'mastered').length
  const mistakeIds = getMistakeWordIds()
  const mistakeCount = mistakeIds.length

  const studyCount = dueCount + Math.min(newCount, 20 - dueCount)
  const canStudy = studyCount > 0

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">单词学习</h2>

      {/* Main word bank card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">日常高频词汇</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{dailyWords.length} 词</span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg py-3">
            <p className="text-xl font-bold text-orange-500">{dueCount}</p>
            <p className="text-gray-500 dark:text-gray-400">待复习</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg py-3">
            <p className="text-xl font-bold text-primary dark:text-blue-400">{newCount}</p>
            <p className="text-gray-500 dark:text-gray-400">新词</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg py-3">
            <p className="text-xl font-bold text-success">{masteredCount}</p>
            <p className="text-gray-500 dark:text-gray-400">已掌握</p>
          </div>
        </div>

        <Link
          to="/vocabulary/study"
          className={`block text-center py-3 rounded-lg font-medium transition-colors ${
            canStudy
              ? 'bg-primary hover:bg-primary-hover text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          onClick={(e) => !canStudy && e.preventDefault()}
        >
          {canStudy ? `开始学习 (${studyCount} 词)` : '今日任务已完成'}
        </Link>
      </div>

      {/* Mistake book card */}
      <Link
        to="/vocabulary/mistakes"
        className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
            <XCircle size={22} className="text-danger" />
          </div>
          <div>
            <p className="font-medium">错词本</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {mistakeCount > 0 ? `${mistakeCount} 个单词待复习` : '暂无错词'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mistakeCount > 0 && (
            <span className="bg-red-100 dark:bg-red-900/30 text-danger text-xs font-bold px-2 py-1 rounded-full">
              {mistakeCount}
            </span>
          )}
          <BookOpen size={18} className="text-gray-400" />
        </div>
      </Link>
    </div>
  )
}
