import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { dailyWords } from '../../data/vocabulary/daily'
import { useWordStore, applyEnrichment } from '../../stores/useWordStore'
import FlashCard from '../../components/FlashCard'
import type { Grade, Word } from '../../types/word'

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export default function StudyPage() {
  const {
    getDueWords,
    getNewWords,
    updateProgress,
    addMistake,
    dailyNewTarget,
    getMistakeWordIds,
    customWords,
    enrichment,
  } = useWordStore()

  const studyQueue = useMemo<Word[]>(() => {
    const pool: Word[] = [
      ...customWords,
      ...dailyWords.map((w) => applyEnrichment(w, enrichment)),
    ]
    const allWordIds = pool.map((w) => w.id)
    const dueIds = getDueWords(allWordIds)
    const mistakeIds = getMistakeWordIds().filter((id) => allWordIds.includes(id))
    const mistakeNew = mistakeIds.filter((id) => !dueIds.includes(id))

    const newIds = getNewWords(allWordIds)
    const newSlots = Math.max(0, dailyNewTarget - dueIds.length - mistakeNew.length)
    const newSlice = newIds.slice(0, newSlots)

    const dueWords = shuffleArray(dueIds)
    const mistakeWords = shuffleArray(mistakeNew)
    const newWords = shuffleArray(newSlice)

    return [...dueWords, ...mistakeWords, ...newWords]
      .map((id) => pool.find((w) => w.id === id)!)
      .filter(Boolean)
  }, [getDueWords, getNewWords, dailyNewTarget, getMistakeWordIds, customWords, enrichment])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<Record<string, Grade>>({})
  const [finished, setFinished] = useState(false)

  if (studyQueue.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/vocabulary" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-xl font-bold">学习</h2>
        </div>
        <div className="text-center py-20">
          <Trophy size={48} className="mx-auto text-success mb-4" />
          <p className="text-xl font-bold">今日任务已完成</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">明天继续加油！</p>
          <Link
            to="/vocabulary"
            className="inline-block mt-6 px-6 py-2 bg-mw-red hover:bg-mw-red-hover text-white rounded-lg transition-colors"
          >
            返回词库
          </Link>
        </div>
      </div>
    )
  }

  const handleGrade = (grade: Grade) => {
    const word = studyQueue[currentIndex]
    updateProgress(word.id, grade)
    setResults((prev) => ({ ...prev, [word.id]: grade }))

    if (grade < 3) {
      addMistake(word.id)
    }

    if (currentIndex + 1 >= studyQueue.length) {
      setFinished(true)
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  if (finished) {
    const correct = Object.values(results).filter((g) => g >= 3).length
    const wrong = Object.values(results).filter((g) => g < 3).length

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/vocabulary" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-xl font-bold">学习完成</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center space-y-4">
          <Trophy size={48} className="mx-auto text-warning" />
          <p className="text-2xl font-bold">本轮完成</p>

          <div className="grid grid-cols-3 gap-4 py-4">
            <div>
              <p className="text-2xl font-bold">{studyQueue.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">总计</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{correct}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">认识</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-danger">{wrong}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">不认识</p>
            </div>
          </div>

          {wrong > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {wrong} 个错词已加入错词本
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Link
            to="/vocabulary"
            className="flex-1 py-3 rounded-xl font-medium bg-gray-100 dark:bg-gray-700 text-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            返回词库
          </Link>
          <button
            onClick={() => {
              setCurrentIndex(0)
              setResults({})
              setFinished(false)
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium bg-mw-red text-white hover:bg-mw-red-hover transition-colors"
          >
            <RotateCcw size={18} />
            再来一轮
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/vocabulary" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-xl font-bold">学习中</h2>
      </div>

      <FlashCard
        word={studyQueue[currentIndex]}
        onGrade={handleGrade}
        index={currentIndex}
        total={studyQueue.length}
      />
    </div>
  )
}
