import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight, XCircle } from 'lucide-react'
import { useWordStore } from '../stores/useWordStore'
import { dailyWords } from '../data/vocabulary/daily'

export default function Dashboard() {
  const { getDueWords, getNewWords, getTodayStats, progress, getMistakeWordIds } = useWordStore()
  const stats = getTodayStats()

  const allWordIds = dailyWords.map((w) => w.id)
  const dueCount = getDueWords(allWordIds).length
  const newCount = getNewWords(allWordIds).length
  const totalWords = dailyWords.length
  const masteredCount = Object.values(progress).filter((p) => p.status === 'mastered').length
  const mistakeCount = getMistakeWordIds().length
  const totalStudied = stats.newWords + stats.reviewed

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">今日学习</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {/* Today stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-3xl font-bold text-primary dark:text-blue-400">{totalStudied}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">今日已学</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-3xl font-bold text-orange-500">{dueCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">待复习</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-3xl font-bold text-success">{masteredCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">已掌握</p>
        </div>
        <Link
          to="/vocabulary/mistakes"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center gap-2"
        >
          <XCircle size={20} className="text-danger" />
          <div>
            <p className="text-3xl font-bold text-danger">{mistakeCount}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">错词</p>
          </div>
        </Link>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500 dark:text-gray-400">日常词汇进度</span>
          <span className="font-medium">
            {masteredCount} / {totalWords}
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary dark:bg-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${totalWords ? (masteredCount / totalWords) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Quick start */}
      <Link
        to="/vocabulary"
        className="flex items-center justify-between bg-primary hover:bg-primary-hover text-white rounded-xl p-4 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BookOpen size={24} />
          <div>
            <p className="font-medium">
              {dueCount > 0 ? '继续复习' : newCount > 0 ? '开始学习' : '今日任务已完成'}
            </p>
            <p className="text-sm text-blue-100">
              {dueCount > 0
                ? `${dueCount} 个单词待复习`
                : newCount > 0
                  ? `${Math.min(newCount, 20)} 个新单词待学习`
                  : '明天继续加油'}
            </p>
          </div>
        </div>
        <ArrowRight size={20} />
      </Link>
    </div>
  )
}
