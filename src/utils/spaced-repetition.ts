import type { Grade, WordProgress, WordStatus } from '../types/word'

const DEFAULT_EASE_FACTOR = 2.5
const MIN_EASE_FACTOR = 1.3

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function createDefaultProgress(wordId: string): WordProgress {
  return {
    wordId,
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    nextReview: today(),
    lastReview: null,
    status: 'new',
  }
}

function deriveStatus(repetitions: number, interval: number): WordStatus {
  if (repetitions === 0) return 'new'
  if (interval <= 1) return 'learning'
  if (repetitions < 5) return 'reviewing'
  return 'mastered'
}

export function calculateNextReview(progress: WordProgress, grade: Grade): WordProgress {
  const { easeFactor, interval, repetitions } = progress

  let newInterval: number
  let newRepetitions: number
  let newEF = easeFactor

  // SM-2 quality mapping: 1→1, 3→3, 5→5
  const quality = grade

  if (quality >= 3) {
    if (repetitions === 0) {
      newInterval = 1
    } else if (repetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * easeFactor)
    }
    newRepetitions = repetitions + 1
  } else {
    newInterval = 1
    newRepetitions = 0
  }

  newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (newEF < MIN_EASE_FACTOR) newEF = MIN_EASE_FACTOR

  const now = today()
  return {
    ...progress,
    easeFactor: newEF,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview: addDays(now, newInterval),
    lastReview: now,
    status: deriveStatus(newRepetitions, newInterval),
  }
}

export function isDueForReview(progress: WordProgress): boolean {
  return progress.nextReview <= today()
}
