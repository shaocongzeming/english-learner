import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, ArrowRight, XCircle, Bookmark, Sparkles } from 'lucide-react'
import { useWordStore } from '../stores/useWordStore'
import { dailyWords } from '../data/vocabulary/daily'
import WordOfTheDay from '../components/WordOfTheDay'
import Mascot from '../components/Mascot'

export default function Dashboard() {
  const { getDueWords, getNewWords, getTodayStats, progress, getMistakeWordIds, customWords } = useWordStore()
  const stats = getTodayStats()

  const allWordIds = [...dailyWords.map((w) => w.id), ...customWords.map((w) => w.id)]
  const dueCount = getDueWords(allWordIds).length
  const newCount = getNewWords(allWordIds).length
  const totalWords = dailyWords.length + customWords.length
  const masteredCount = Object.values(progress).filter((p) => p.status === 'mastered').length
  const mistakeCount = getMistakeWordIds().length
  const totalStudied = stats.newWords + stats.reviewed

  return (
    <div className="space-y-6">
      <motion.div
        className="bubbly-card rounded-[2rem] p-6 md:p-7"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative z-10 flex items-center justify-between gap-5">
          <div className="max-w-[15rem]">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold text-teal-700 shadow-sm">
              <Sparkles size={13} />
              今日学习
            </div>
            <h1 className="display-font mt-4 text-4xl leading-none text-slate-900 md:text-5xl">
              Grow one word today.
            </h1>
            <p className="mt-3 text-sm font-semibold text-slate-500">
              {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
          <Mascot size="lg" mood="happy" gesture="wave" floating className="hidden sm:block" />
        </div>
      </motion.div>

      <WordOfTheDay />

      {/* Today stats */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
      >
        <motion.div
          variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
          className="cream-panel rounded-[1.5rem] p-4"
        >
          <p className="display-font text-4xl text-teal-600">{totalStudied}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">今日已学</p>
        </motion.div>
        <motion.div
          variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
          className="cream-panel rounded-[1.5rem] p-4"
        >
          <p className="display-font text-4xl text-orange-500">{dueCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">待复习</p>
        </motion.div>
        <motion.div
          variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
          className="cream-panel rounded-[1.5rem] p-4"
        >
          <p className="display-font text-4xl text-success">{masteredCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">已掌握</p>
        </motion.div>
        <motion.div
          variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
        >
          <Link
            to="/vocabulary/mistakes"
            className="cream-panel rounded-[1.5rem] p-4 flex items-center gap-2 transition-transform hover:-translate-y-1"
          >
            <XCircle size={20} className="text-danger" />
            <div>
              <p className="display-font text-4xl text-danger">{mistakeCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">错词</p>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Progress bar */}
      <div className="cream-panel rounded-[1.5rem] p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500 dark:text-gray-400">总词汇进度</span>
          <span className="font-medium">
            {masteredCount} / {totalWords}
          </span>
        </div>
        <div className="h-3 bg-white/80 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-400 via-lime-300 to-orange-300 rounded-full transition-all duration-700"
            style={{ width: `${totalWords ? (masteredCount / totalWords) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* My words */}
      <Link
        to="/vocabulary/my"
        className="flex items-center justify-between cream-panel hover:border-teal-300 rounded-[1.5rem] p-4 transition-all hover:-translate-y-1"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-teal-100 text-teal-700">
            <Bookmark size={20} />
          </div>
          <div>
            <p className="font-medium">我的词库</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {customWords.length > 0 ? `${customWords.length} 个自定义单词` : '搜索查词,一键加入'}
            </p>
          </div>
        </div>
        <ArrowRight size={18} className="text-gray-400" />
      </Link>

      {/* Quick start */}
      <Link
        to="/vocabulary"
        className="flex items-center justify-between rounded-[1.6rem] bg-slate-900 p-4 text-white shadow-xl shadow-slate-300/40 transition-all hover:-translate-y-1 hover:bg-slate-800"
      >
        <div className="flex items-center gap-3">
          <BookOpen size={24} />
          <div>
            <p className="font-medium">
              {dueCount > 0 ? '继续复习' : newCount > 0 ? '开始学习' : '今日任务已完成'}
            </p>
            <p className="text-sm text-red-100">
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
