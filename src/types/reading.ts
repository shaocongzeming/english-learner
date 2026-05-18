export type ArticleDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface ArticleSentence {
  index: number
  text: string
}

export interface Article {
  id: string
  title: string
  difficulty: ArticleDifficulty
  wordCount: number
  source: string
  summary: string
  topic?: string
  url?: string
  addedAt: string
  sentences: ArticleSentence[]
}

export interface ArticleProgress {
  articleId: string
  completed: boolean
  lastReadAt: string | null
  lookedUpWords: string[]
}
