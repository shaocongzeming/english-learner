export interface Example {
  en: string
  zh: string
}

export interface Word {
  id: string
  word: string
  phonetic: string
  pos: string
  meaning: string
  examples: Example[]
  level: 'cet4' | 'cet6' | 'daily'
  frequency: number
}

export type WordLevel = Word['level']

export type Grade = 1 | 3 | 5 // 不认识 | 模糊 | 认识

export type WordStatus = 'new' | 'learning' | 'reviewing' | 'mastered'

export interface WordProgress {
  wordId: string
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: string
  lastReview: string | null
  status: WordStatus
}

export interface DailyRecord {
  date: string
  newWordsLearned: number
  wordsReviewed: number
}
