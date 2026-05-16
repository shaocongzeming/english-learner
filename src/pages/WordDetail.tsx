import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react'
import { useDictionary } from '../hooks/useDictionary'
import { useWordStore, applyEnrichment } from '../stores/useWordStore'
import { dailyWords } from '../data/vocabulary/daily'
import { cet4Words } from '../data/vocabulary/cet4'
import WordDetailCard from '../components/WordDetailCard'

export default function WordDetail() {
  const { term: rawTerm } = useParams<{ term: string }>()
  const term = decodeURIComponent(rawTerm ?? '').toLowerCase()
  const { entry, loading, error, notFound } = useDictionary(term)

  const customWords = useWordStore((s) => s.customWords)
  const enrichment = useWordStore((s) => s.enrichment)
  const enrich = useWordStore((s) => s.enrichWord)

  const localWord = useMemo(() => {
    const pool = [...customWords, ...dailyWords, ...cet4Words]
    const found = pool.find((w) => w.word.toLowerCase() === term)
    return found ? applyEnrichment(found, enrichment) : undefined
  }, [term, customWords, enrichment])

  useEffect(() => {
    if (!entry || !localWord) return
    if (localWord.enDefinition && localWord.audioUrl) return
    enrich(localWord.id, {
      enDefinition: localWord.enDefinition ?? entry.phoneticBreakdown[0]?.definition,
      audioUrl: localWord.audioUrl ?? entry.audioUrl ?? undefined,
      synonyms: localWord.synonyms ?? entry.synonyms,
    })
  }, [entry, localWord, enrich])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-xl font-bold">词条详情</h2>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 size={14} className="animate-spin" />
          正在查询 {term}...
        </div>
      )}

      {error && !localWord && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">无法连接到词典服务</p>
            <p className="mt-1 text-amber-700 dark:text-amber-300">请检查网络后刷新页面重试。</p>
          </div>
        </div>
      )}

      {notFound && !localWord && (
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 text-center">
          <p className="text-lg font-medium" style={{ fontFamily: 'var(--font-serif)' }}>
            没找到 "{term}"
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            可能是拼写错误,或这是一个专有名词。
          </p>
        </div>
      )}

      {(entry || localWord || loading) && (
        <WordDetailCard
          entry={entry}
          term={term}
          localWord={localWord}
          loading={loading && !localWord}
        />
      )}
    </div>
  )
}
