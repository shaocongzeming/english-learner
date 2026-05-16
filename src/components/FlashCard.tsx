import { useEffect, useState } from 'react'
import type { Word, Grade } from '../types/word'
import AudioButton from './AudioButton'
import { lookupWord } from '../services/dictionaryApi'
import { useWordStore } from '../stores/useWordStore'

interface FlashCardProps {
  word: Word
  onGrade: (grade: Grade) => void
  index: number
  total: number
}

export default function FlashCard({ word, onGrade, index, total }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false)
  const enrich = useWordStore((s) => s.enrichWord)

  const handleFlip = () => setFlipped(!flipped)

  const handleGrade = (grade: Grade) => {
    setFlipped(false)
    onGrade(grade)
  }

  // Lazy enrichment: when flipping to back, if EN definition or audio missing, fetch in background.
  useEffect(() => {
    if (!flipped) return
    if (word.enDefinition && word.audioUrl) return
    let cancelled = false
    lookupWord(word.word)
      .then((entry) => {
        if (cancelled || !entry) return
        enrich(word.id, {
          enDefinition: word.enDefinition ?? entry.phoneticBreakdown[0]?.definition,
          audioUrl: word.audioUrl ?? entry.audioUrl ?? undefined,
          synonyms: word.synonyms ?? entry.synonyms,
        })
      })
      .catch(() => {
        // Silent — fall back to TTS / existing data.
      })
    return () => {
      cancelled = true
    }
  }, [flipped, word.id, word.word, word.enDefinition, word.audioUrl, word.synonyms, enrich])

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{index + 1} / {total}</span>
        <div className="flex-1 mx-3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-mw-red rounded-full transition-all duration-300"
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
          className="relative w-full min-h-[340px] transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : '',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-mw-cream to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p
              className="text-5xl font-bold mb-4 text-mw-ink dark:text-white tracking-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {word.word}
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">{word.phonetic}</p>
            <AudioButton
              audioUrl={word.audioUrl}
              fallbackText={word.word}
              size={26}
              className="inline-flex items-center justify-center w-14 h-14 rounded-full text-mw-red bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow"
            />
            <p className="mt-6 text-sm text-gray-400 dark:text-gray-500">点击翻转查看释义</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-7 flex flex-col items-center overflow-y-auto"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <p
                className="text-2xl font-bold text-mw-ink dark:text-white"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {word.word}
              </p>
              <AudioButton
                audioUrl={word.audioUrl}
                fallbackText={word.word}
                size={18}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-mw-red hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {word.phonetic} {word.pos && `· ${word.pos}`}
            </p>

            <p
              className="text-xl font-medium text-mw-ink dark:text-white"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {word.meaning}
            </p>

            {word.enDefinition && (
              <p
                className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic leading-relaxed text-center max-w-md"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {word.enDefinition}
              </p>
            )}

            {word.examples.length > 0 && (
              <div className="w-full space-y-2 text-sm mt-5">
                {word.examples.slice(0, 2).map((ex, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-700 dark:text-gray-300">{ex.en}</p>
                    {ex.zh && <p className="text-gray-400 dark:text-gray-500 mt-1">{ex.zh}</p>}
                  </div>
                ))}
              </div>
            )}
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
