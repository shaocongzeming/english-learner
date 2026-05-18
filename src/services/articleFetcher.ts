import type { ArticleSentence } from '../types/reading'

export function splitIntoSentences(text: string): ArticleSentence[] {
  return (
    text
      .match(/[^.!?]*[.!?]+/g)
      ?.map((s, i) => ({ index: i, text: s.trim() }))
      .filter((s) => s.text.length > 0) ?? []
  )
}

export interface Token {
  display: string
  word: string | null
}

export function tokenizeSentence(text: string): Token[] {
  const tokens: Token[] = []
  const regex = /([a-zA-Z'-]+)|([^a-zA-Z'-]+)/g
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      const raw = match[1]
      const cleaned = raw.replace(/^['-]+|['-]+$/g, '')
      tokens.push({ display: raw, word: cleaned.length > 0 ? cleaned.toLowerCase() : null })
    } else if (match[2]) {
      tokens.push({ display: match[2], word: null })
    }
  }
  return tokens
}
