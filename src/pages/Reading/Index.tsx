import { useState } from 'react'
import { BookOpen, Plus } from 'lucide-react'
import type { ArticleDifficulty } from '../../types/reading'
import { builtinArticles } from '../../data/reading/articles'
import { useReadingStore } from '../../stores/useReadingStore'
import ArticleCard from '../../components/reading/ArticleCard'
import DifficultyFilter from '../../components/reading/DifficultyFilter'
import AddArticleModal from '../../components/reading/AddArticleModal'
import Mascot from '../../components/Mascot'
import { AnimatePresence, motion } from 'framer-motion'

export default function ReadingIndex() {
  const [filter, setFilter] = useState<ArticleDifficulty | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const onlineArticles = useReadingStore((s) => s.onlineArticles)

  const allArticles = [...onlineArticles, ...builtinArticles]
  const filtered = filter === 'all'
    ? allArticles
    : allArticles.filter((a) => a.difficulty === filter)

  return (
    <div className="space-y-6">
      <div className="bubbly-card rounded-[2rem] p-6">
        <div className="relative z-10 flex items-center justify-between gap-5">
          <div>
            <p className="text-sm font-extrabold text-teal-700">Reading Room</p>
            <h1 className="display-font mt-2 text-4xl text-slate-900 dark:text-white">
              阅读训练
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              像拆小故事一样读英文，每篇都能点词学习。
            </p>
          </div>
          <Mascot size="md" mood="focus" floating />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen size={24} className="text-teal-700" />
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">文章列表</h2>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {allArticles.length} 篇
          </span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-extrabold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          <Plus size={16} />
          添加文章
        </button>
      </div>

      <DifficultyFilter value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          该分类暂无文章
        </div>
      ) : (
        <motion.div
          className="grid gap-4 sm:grid-cols-2"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {filtered.map((article) => (
            <motion.div
              key={article.id}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <ArticleCard article={article} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <AddArticleModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
