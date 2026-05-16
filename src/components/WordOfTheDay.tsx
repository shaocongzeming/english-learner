import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowUpRight } from 'lucide-react'
import AudioButton from './AudioButton'
import { dailyWords } from '../data/vocabulary/daily'
import { cet4Words } from '../data/vocabulary/cet4'
import { lookupWord } from '../services/dictionaryApi'
import { useWordStore, applyEnrichment } from '../stores/useWordStore'

function hashDate(dateStr: string): number {
  let h = 0
  for (let i = 0; i < dateStr.length; i++) {
    h = (h * 31 + dateStr.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export default function WordOfTheDay() {
  const enrichment = useWordStore((s) => s.enrichment)
  const enrich = useWordStore((s) => s.enrichWord)

  const word = useMemo(() => {
    const pool = [...dailyWords, ...cet4Words]
    const dateStr = new Date().toISOString().split('T')[0]
    const idx = hashDate(dateStr) % pool.length
    return applyEnrichment(pool[idx], enrichment)
  }, [enrichment])

  useEffect(() => {
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
        // Silent fail — keep showing what we have.
      })
    return () => {
      cancelled = true
    }
  }, [word.id, word.enDefinition, word.audioUrl, word.word, word.synonyms, enrich])

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-mw-cream via-white to-amber-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 border border-mw-red/20 dark:border-red-900/30 p-6 md:p-7">
      <div className="absolute top-3 right-3 text-mw-red opacity-30">
        <Sparkles size={28} />
      </div>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-mw-red">
        <Sparkles size={12} />
        Word of the Day
      </div>
      <div className="mt-3 flex items-baseline gap-3 flex-wrap">
        <h2
          className="text-4xl md:text-5xl font-bold text-mw-ink dark:text-white"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {word.word}
        </h2>
        <AudioButton
          audioUrl={word.audioUrl}
          fallbackText={word.word}
          size={18}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full text-mw-red bg-white/80 hover:bg-white dark:bg-gray-700/60 dark:hover:bg-gray-700 dark:text-red-400 transition-colors shadow-sm"
        />
      </div>
      <div className="mt-1.5 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        {word.phonetic && <span>{word.phonetic}</span>}
        {word.pos && (
          <span className="italic" style={{ fontFamily: 'var(--font-serif)' }}>
            {word.pos}
          </span>
        )}
      </div>

      {word.enDefinition && (
        <p
          className="mt-4 text-base text-gray-800 dark:text-gray-100 leading-relaxed"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {word.enDefinition}
        </p>
      )}
      <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300">{word.meaning}</p>

      {word.examples[0] && (
        <p
          className="mt-3 text-sm italic text-gray-500 dark:text-gray-400 border-l-2 border-mw-red/40 pl-3"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          "{word.examples[0].en}"
        </p>
      )}

      <Link
        to={`/word/${encodeURIComponent(word.word.toLowerCase())}`}
        className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-mw-red hover:underline"
      >
        了解更多 <ArrowUpRight size={14} />
      </Link>
    </div>
  )
}
