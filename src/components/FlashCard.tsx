import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import type { Word, Grade } from '../types/word'
import { useTTS } from '../hooks/useTTS'

interface FlashCardProps {
  word: Word
  onGrade: (grade: Grade) => void
  index: number
  total: number
}

export default function FlashCard({ word, onGrade, index, total }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false)
  const { speak } = useTTS()

  const handleFlip = () => setFlipped(!flipped)

  const handleGrade = (grade: Grade) => {
    setFlipped(false)
    onGrade(grade)
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{index + 1} / {total}</span>
        <div className="flex-1 mx-3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary dark:bg-blue-400 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        onClick={handleFlip}
        className="relative cursor-pointer select-none"
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full min-h-[320px] transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : '',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-4xl font-bold mb-4">{word.word}</p>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">{word.phonetic}</p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                speak(word.word)
              }}
              className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Volume2 size={24} className="text-primary dark:text-blue-400" />
            </button>
            <p className="mt-6 text-sm text-gray-400 dark:text-gray-500">点击翻转查看释义</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-2xl font-bold mb-2">{word.word}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {word.phonetic} · {word.pos}
            </p>
            <p className="text-xl mb-6">{word.meaning}</p>

            {word.examples.length > 0 && (
              <div className="w-full space-y-3 text-sm">
                {word.examples.slice(0, 2).map((ex, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-700 dark:text-gray-300">{ex.en}</p>
                    <p className="text-gray-400 dark:text-gray-500 mt-1">{ex.zh}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation()
                speak(word.word)
              }}
              className="mt-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Volume2 size={20} className="text-primary dark:text-blue-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Grade buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleGrade(1)}
          className="py-3 rounded-xl font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          不认识
        </button>
        <button
          onClick={() => handleGrade(3)}
          className="py-3 rounded-xl font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
        >
          模糊
        </button>
        <button
          onClick={() => handleGrade(5)}
          className="py-3 rounded-xl font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          认识
        </button>
      </div>
    </div>
  )
}
