import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WordProgress, DailyRecord, Grade, WordLevel } from '../types/word'
import { createDefaultProgress, calculateNextReview, isDueForReview } from '../utils/spaced-repetition'

interface MistakeEntry {
  wordId: string
  addedAt: string
  count: number
}

interface WordState {
  progress: Record<string, WordProgress>
  dailyRecords: DailyRecord[]
  selectedLevel: WordLevel
  dailyNewTarget: number
  mistakes: Record<string, MistakeEntry>

  setSelectedLevel: (level: WordLevel) => void
  setDailyNewTarget: (n: number) => void
  updateProgress: (wordId: string, grade: Grade) => void
  addMistake: (wordId: string) => void
  removeMistake: (wordId: string) => void
  clearMistakes: () => void
  getDueWords: (wordIds: string[]) => string[]
  getNewWords: (wordIds: string[]) => string[]
  getMistakeWordIds: () => string[]
  getTodayStats: () => { newWords: number; reviewed: number }
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

export const useWordStore = create<WordState>()(
  persist(
    (set, get) => ({
      progress: {},
      dailyRecords: [],
      selectedLevel: 'daily',
      dailyNewTarget: 20,
      mistakes: {},

      setSelectedLevel: (level) => set({ selectedLevel: level }),
      setDailyNewTarget: (n) => set({ dailyNewTarget: n }),

      updateProgress: (wordId, grade) => {
        const current = get().progress[wordId] || createDefaultProgress(wordId)
        const updated = calculateNextReview(current, grade)
        const todayStr = today()

        set((state) => {
          const newRecords = [...state.dailyRecords]
          let record = newRecords.find((r) => r.date === todayStr)
          if (!record) {
            record = { date: todayStr, newWordsLearned: 0, wordsReviewed: 0 }
            newRecords.push(record)
          } else {
            record = { ...record }
            const idx = newRecords.findIndex((r) => r.date === todayStr)
            newRecords[idx] = record
          }
          if (current.status === 'new') {
            record.newWordsLearned++
          } else {
            record.wordsReviewed++
          }

          return {
            progress: { ...state.progress, [wordId]: updated },
            dailyRecords: newRecords,
          }
        })
      },

      addMistake: (wordId) => {
        set((state) => {
          const existing = state.mistakes[wordId]
          return {
            mistakes: {
              ...state.mistakes,
              [wordId]: existing
                ? { ...existing, count: existing.count + 1, addedAt: today() }
                : { wordId, addedAt: today(), count: 1 },
            },
          }
        })
      },

      removeMistake: (wordId) => {
        set((state) => {
          const { [wordId]: _, ...rest } = state.mistakes
          return { mistakes: rest }
        })
      },

      clearMistakes: () => set({ mistakes: {} }),

      getDueWords: (wordIds) => {
        const { progress } = get()
        return wordIds.filter((id) => {
          const p = progress[id]
          if (!p) return false
          return p.status !== 'new' && isDueForReview(p)
        })
      },

      getNewWords: (wordIds) => {
        const { progress } = get()
        return wordIds.filter((id) => {
          const p = progress[id]
          return !p || p.status === 'new'
        })
      },

      getMistakeWordIds: () => {
        return Object.keys(get().mistakes)
      },

      getTodayStats: () => {
        const todayStr = today()
        const record = get().dailyRecords.find((r) => r.date === todayStr)
        return {
          newWords: record?.newWordsLearned ?? 0,
          reviewed: record?.wordsReviewed ?? 0,
        }
      },
    }),
    {
      name: 'english-learner-data',
    }
  )
)
