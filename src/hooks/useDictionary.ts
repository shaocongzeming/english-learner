import { useCallback, useEffect, useState } from 'react'
import { lookupWord } from '../services/dictionaryApi'
import type { DictionaryEntry } from '../types/word'

interface UseDictionaryState {
  entry: DictionaryEntry | null
  loading: boolean
  error: string | null
  notFound: boolean
}

export function useDictionary(term: string | undefined) {
  const [state, setState] = useState<UseDictionaryState>({
    entry: null,
    loading: false,
    error: null,
    notFound: false,
  })

  const lookup = useCallback(async (t: string) => {
    setState({ entry: null, loading: true, error: null, notFound: false })
    try {
      const entry = await lookupWord(t)
      setState({
        entry,
        loading: false,
        error: null,
        notFound: entry === null,
      })
    } catch (err) {
      setState({
        entry: null,
        loading: false,
        error: err instanceof Error ? err.message : '查询失败',
        notFound: false,
      })
    }
  }, [])

  useEffect(() => {
    if (term && term.trim()) {
      lookup(term)
    }
  }, [term, lookup])

  return { ...state, lookup }
}
