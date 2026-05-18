import { Link } from 'react-router-dom'
import { BookOpen, XCircle, Bookmark, ArrowRight } from 'lucide-react'
import { useWordStore } from '../../stores/useWordStore'
import { dailyWords } from '../../data/vocabulary/daily'
import Mascot from '../../components/Mascot'

export default function VocabularyIndex() {
  const { getDueWords, getNewWords, progress, getMistakeWordIds, customWords } = useWordStore()
  const allWordIds = [...dailyWords.map((w) => w.id), ...customWords.map((w) => w.id)]
  const dueCount = getDueWords(allWordIds).length
  const newCount = getNewWords(allWordIds).length
  const masteredCount = Object.values(progress).filter((p) => p.status === 'mastered').length
  const mistakeIds = getMistakeWordIds()
  const mistakeCount = mistakeIds.length

  const studyCount = dueCount + Math.min(newCount, 20 - dueCount)
  const canStudy = studyCount > 0

  return (
    <div className="space-y-6">
      <div className="bubbly-card rounded-[2rem] p-6">
        <div className="relative z-10 flex items-center justify-between gap-5">
          <div>
            <p className="text-sm font-extrabold text-teal-700">Vocabulary Garden</p>
            <h1 className="display-font mt-2 text-4xl text-slate-900 dark:text-white">单词学习</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">每天把陌生词种成自己的词库。</p>
          </div>
          <Mascot size="md" mood="focus" gesture="reach" floating />
        </div>
      </div>

      {/* Main word bank card */}
      <div className="cream-panel rounded-[2rem] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="display-font text-2xl text-slate-900 dark:text-white">
            日常高频词汇 + 我的词库
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {dailyWords.length + customWords.length} 词
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-2xl bg-orange-50 py-3 dark:bg-orange-900/20">
            <p className="display-font text-3xl text-orange-500">{dueCount}</p>
            <p className="text-gray-500 dark:text-gray-400">待复习</p>
          </div>
          <div className="rounded-2xl bg-teal-50 py-3 dark:bg-teal-950/30">
            <p className="display-font text-3xl text-teal-600">{newCount}</p>
            <p className="text-gray-500 dark:text-gray-400">新词</p>
          </div>
          <div className="rounded-2xl bg-green-50 py-3 dark:bg-green-900/20">
            <p className="display-font text-3xl text-success">{masteredCount}</p>
            <p className="text-gray-500 dark:text-gray-400">已掌握</p>
          </div>
        </div>

        <Link
          to="/vocabulary/study"
          className={`block text-center py-3 rounded-2xl font-extrabold transition-all ${
            canStudy
              ? 'bg-slate-900 hover:-translate-y-1 hover:bg-slate-800 text-white shadow-xl shadow-slate-300/40'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          onClick={(e) => !canStudy && e.preventDefault()}
        >
          {canStudy ? `开始学习 (${studyCount} 词)` : '今日任务已完成'}
        </Link>
      </div>

      {/* My words card */}
      <Link
        to="/vocabulary/my"
        className="flex items-center justify-between cream-panel rounded-[1.6rem] p-5 hover:border-teal-300 transition-all hover:-translate-y-1"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-teal-100 text-teal-700">
            <Bookmark size={22} />
          </div>
          <div>
            <p className="font-medium">我的词库</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {customWords.length > 0
                ? `${customWords.length} 个自定义单词,已纳入学习`
                : '在顶部搜索任意英文词,一键加入'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {customWords.length > 0 && (
            <span className="bg-mw-red/10 text-mw-red text-xs font-bold px-2 py-1 rounded-full">
              {customWords.length}
            </span>
          )}
          <ArrowRight size={18} className="text-gray-400" />
        </div>
      </Link>

      {/* Mistake book card */}
      <Link
        to="/vocabulary/mistakes"
        className="flex items-center justify-between cream-panel rounded-[1.6rem] p-5 hover:border-red-300 dark:hover:border-red-700 transition-all hover:-translate-y-1"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-red-50 dark:bg-red-900/20">
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
