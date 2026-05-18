import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Article, ArticleProgress } from '../types/reading'

const HISTORY_LIMIT = 50

interface ReadingState {
  onlineArticles: Article[]
  progress: Record<string, ArticleProgress>
  history: string[]

  addOnlineArticle: (article: Article) => void
  removeOnlineArticle: (id: string) => void
  updateProgress: (articleId: string, patch: Partial<ArticleProgress>) => void
  addToHistory: (articleId: string) => void
  getArticleProgress: (articleId: string) => ArticleProgress | undefined
}

function defaultProgress(articleId: string): ArticleProgress {
  return { articleId, completed: false, lastReadAt: null, lookedUpWords: [] }
}

export const useReadingStore = create<ReadingState>()(
  persist(
    (set, get) => ({
      onlineArticles: [],
      progress: {},
      history: [],

      addOnlineArticle: (article) => {
        set((state) => ({
          onlineArticles: [article, ...state.onlineArticles],
        }))
      },

      removeOnlineArticle: (id) => {
        set((state) => {
          const { [id]: _p, ...progressRest } = state.progress
          return {
            onlineArticles: state.onlineArticles.filter((a) => a.id !== id),
            history: state.history.filter((h) => h !== id),
            progress: progressRest,
          }
        })
      },

      updateProgress: (articleId, patch) => {
        set((state) => {
          const existing = state.progress[articleId] ?? defaultProgress(articleId)
          return {
            progress: {
              ...state.progress,
              [articleId]: { ...existing, ...patch },
            },
          }
        })
      },

      addToHistory: (articleId) => {
        set((state) => {
          const filtered = state.history.filter((h) => h !== articleId)
          return { history: [articleId, ...filtered].slice(0, HISTORY_LIMIT) }
        })
      },

      getArticleProgress: (articleId) => {
        return get().progress[articleId]
      },
    }),
    { name: 'english-learner-reading' }
  )
)
