import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Word, WordProgress, DailyRecord, Grade, WordLevel } from '../types/word'
import { createDefaultProgress, calculateNextReview, isDueForReview } from '../utils/spaced-repetition'

interface MistakeEntry {
  wordId: string
  addedAt: string
  count: number
}

/** Lazy enrichment from Dictionary API for preset words */
export interface WordEnrichment {
  enDefinition?: string
  audioUrl?: string
  synonyms?: string[]
}

interface WordState {
  progress: Record<string, WordProgress>
  dailyRecords: DailyRecord[]
  selectedLevel: WordLevel
  dailyNewTarget: number
  mistakes: Record<string, MistakeEntry>
  customWords: Word[]
  enrichment: Record<string, WordEnrichment>

  setSelectedLevel: (level: WordLevel) => void
  setDailyNewTarget: (n: number) => void
  updateProgress: (wordId: string, grade: Grade) => void
  addMistake: (wordId: string) => void
  removeMistake: (wordId: string) => void
  clearMistakes: () => void
  addCustomWord: (word: Word) => void
  removeCustomWord: (id: string) => void
  updateCustomWord: (id: string, patch: Partial<Word>) => void
  enrichWord: (wordId: string, patch: WordEnrichment) => void
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
      customWords: [],
      enrichment: {},

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

      addCustomWord: (word) => {
        set((state) => {
          // Dedupe by lowercase word text — overwrite existing custom entry if any.
          const filtered = state.customWords.filter(
            (w) => w.word.toLowerCase() !== word.word.toLowerCase()
          )
          return { customWords: [word, ...filtered] }
        })
      },

      removeCustomWord: (id) => {
        set((state) => {
          // Also drop progress/mistakes/enrichment for the removed word.
          const { [id]: _p, ...progressRest } = state.progress
          const { [id]: _m, ...mistakesRest } = state.mistakes
          const { [id]: _e, ...enrichmentRest } = state.enrichment
          return {
            customWords: state.customWords.filter((w) => w.id !== id),
            progress: progressRest,
            mistakes: mistakesRest,
            enrichment: enrichmentRest,
          }
        })
      },

      updateCustomWord: (id, patch) => {
        set((state) => ({
          customWords: state.customWords.map((w) =>
            w.id === id ? { ...w, ...patch } : w
          ),
        }))
      },

      enrichWord: (wordId, patch) => {
        set((state) => {
          // For custom words, write directly into the word entry.
          const customIdx = state.customWords.findIndex((w) => w.id === wordId)
          if (customIdx >= 0) {
            const updated = [...state.customWords]
            updated[customIdx] = { ...updated[customIdx], ...patch }
            return { customWords: updated }
          }
          // For preset words, stash in enrichment map keyed by wordId.
          const existing = state.enrichment[wordId] ?? {}
          return {
            enrichment: {
              ...state.enrichment,
              [wordId]: { ...existing, ...patch },
            },
          }
        })
      },

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

/** Merge a preset word with any enrichment data stored in the user store */
export function applyEnrichment(word: Word, enrichment: Record<string, WordEnrichment>): Word {
  const e = enrichment[word.id]
  if (!e) return word
  return {
    ...word,
    enDefinition: word.enDefinition ?? e.enDefinition,
    audioUrl: word.audioUrl ?? e.audioUrl,
    synonyms: word.synonyms ?? e.synonyms,
  }
}
