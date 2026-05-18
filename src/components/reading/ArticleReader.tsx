import { useMemo } from 'react'
import type { ArticleSentence } from '../../types/reading'
import { tokenizeSentence } from '../../services/articleFetcher'

interface Props {
  sentences: ArticleSentence[]
  highlightIndex: number | null
  onWordClick: (word: string, rect: DOMRect) => void
}

export default function ArticleReader({ sentences, highlightIndex, onWordClick }: Props) {
  const tokenized = useMemo(
    () => sentences.map((s) => ({ ...s, tokens: tokenizeSentence(s.text) })),
    [sentences]
  )

  return (
    <div className="space-y-4 leading-relaxed text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
      {tokenized.map((sentence) => {
        const isHighlighted = highlightIndex === sentence.index
        return (
          <span
            key={sentence.index}
            className={`inline transition-colors rounded ${
              isHighlighted
                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                : ''
            }`}
          >
            {sentence.tokens.map((token, ti) =>
              token.word ? (
                <button
                  key={ti}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    onWordClick(token.word!, rect)
                  }}
                  className="text-gray-800 dark:text-gray-100 hover:text-mw-red dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-sm transition-colors cursor-pointer"
                >
                  {token.display}
                </button>
              ) : (
                <span key={ti} className="text-gray-800 dark:text-gray-100">
                  {token.display}
                </span>
              )
            )}
          </span>
        )
      })}
    </div>
  )
}
