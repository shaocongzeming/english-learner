import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowUpRight } from 'lucide-react'
import AudioButton from './AudioButton'
import { dailyWords } from '../data/vocabulary/daily'
import { cet4Words } from '../data/vocabulary/cet4'
import { lookupWord } from '../services/dictionaryApi'
import { useWordStore, applyEnrichment } from '../stores/useWordStore'
import Mascot from './Mascot'

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
    <div className="bubbly-card relative rounded-[2rem] p-6 md:p-7">
      <Mascot size="sm" mood="happy" floating className="absolute right-5 top-5 z-0 opacity-90" />
      <div className="relative z-10 ml-14 sm:ml-16 max-w-[calc(100%-8.5rem)] flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-teal-700">
        <Sparkles size={12} />
        Word of the Day
      </div>
      <div className="relative z-10 mt-3 flex items-baseline gap-3 flex-wrap pr-16 sm:pr-20">
        <h2
          className="display-font text-4xl sm:text-5xl md:text-6xl text-slate-900 dark:text-white"
        >
          {word.word}
        </h2>
        <AudioButton
          audioUrl={word.audioUrl}
          fallbackText={word.word}
          size={18}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full text-teal-700 bg-white/90 hover:bg-white dark:bg-gray-700/60 dark:hover:bg-gray-700 dark:text-teal-300 transition-colors shadow-sm"
        />
      </div>
      <div className="relative z-10 mt-1.5 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        {word.phonetic && <span>{word.phonetic}</span>}
        {word.pos && (
          <span className="italic" style={{ fontFamily: 'var(--font-serif)' }}>
            {word.pos}
          </span>
        )}
      </div>

      {word.enDefinition && (
        <p
          className="relative z-10 mt-4 text-base text-gray-800 dark:text-gray-100 leading-relaxed"
        >
          {word.enDefinition}
        </p>
      )}
      <p className="relative z-10 mt-1.5 text-sm text-gray-600 dark:text-gray-300">{word.meaning}</p>

      {word.examples[0] && (
        <p
          className="relative z-10 mt-3 text-sm italic text-gray-500 dark:text-gray-400 border-l-4 border-teal-300 pl-3"
        >
          "{word.examples[0].en}"
        </p>
      )}

      <Link
        to={`/word/${encodeURIComponent(word.word.toLowerCase())}`}
        className="relative z-10 mt-5 inline-flex items-center gap-1 rounded-full bg-white/80 px-4 py-2 text-sm font-extrabold text-teal-700 shadow-sm transition-transform hover:-translate-y-0.5"
      >
        了解更多 <ArrowUpRight size={14} />
      </Link>
    </div>
  )
}
