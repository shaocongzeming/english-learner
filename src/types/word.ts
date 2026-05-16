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
  level: 'cet4' | 'cet6' | 'daily' | 'custom'
  frequency: number
  // Optional fields populated lazily from Dictionary API or filled by user.
  enDefinition?: string
  audioUrl?: string
  synonyms?: string[]
  // Optional. Existing preset data omits this; absence is treated as 'preset'.
  source?: 'preset' | 'custom'
  addedAt?: string
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

export interface DictionaryEntry {
  word: string
  phonetic: string
  phoneticBreakdown: Array<{ pos: string; definition: string; example?: string }>
  audioUrl: string | null
  synonyms: string[]
  cnTranslation?: string | null
}
