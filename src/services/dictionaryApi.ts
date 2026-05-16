import type { DictionaryEntry } from '../types/word'
import { fetchChineseTranslation } from './translateApi'

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en'
const CACHE_KEY = 'dict-cache-v1'
const CACHE_LIMIT = 500

type CacheValue = DictionaryEntry | null // null = confirmed-miss, cached to avoid re-hammering API

interface PersistedCache {
  order: string[]
  entries: Record<string, CacheValue>
}

const memoryCache = new Map<string, CacheValue>()
let persistedLoaded = false

function loadPersisted(): PersistedCache {
  if (typeof localStorage === 'undefined') return { order: [], entries: {} }
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return { order: [], entries: {} }
    const parsed = JSON.parse(raw) as PersistedCache
    if (!parsed.order || !parsed.entries) return { order: [], entries: {} }
    return parsed
  } catch {
    return { order: [], entries: {} }
  }
}

function persist(cache: PersistedCache) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Quota exceeded — ignore; in-memory cache still works for this session.
  }
}

function hydrateMemoryCache() {
  if (persistedLoaded) return
  persistedLoaded = true
  const cache = loadPersisted()
  for (const key of cache.order) {
    if (key in cache.entries) memoryCache.set(key, cache.entries[key])
  }
}

function writeToCache(key: string, value: CacheValue) {
  memoryCache.set(key, value)
  const cache = loadPersisted()
  cache.entries[key] = value
  cache.order = cache.order.filter((k) => k !== key)
  cache.order.push(key)
  while (cache.order.length > CACHE_LIMIT) {
    const evicted = cache.order.shift()
    if (evicted) delete cache.entries[evicted]
  }
  persist(cache)
}

interface ApiPhonetic {
  text?: string
  audio?: string
}

interface ApiDefinition {
  definition: string
  example?: string
  synonyms?: string[]
}

interface ApiMeaning {
  partOfSpeech: string
  definitions: ApiDefinition[]
  synonyms?: string[]
}

interface ApiEntry {
  word: string
  phonetic?: string
  phonetics?: ApiPhonetic[]
  meanings?: ApiMeaning[]
}

function parseApiResponse(data: ApiEntry[]): DictionaryEntry | null {
  if (!Array.isArray(data) || data.length === 0) return null
  const first = data[0]
  const word = first.word
  if (!word) return null

  // Phonetic — prefer top-level, fall back to first non-empty phonetics[].text
  let phonetic = first.phonetic || ''
  if (!phonetic && first.phonetics) {
    const withText = first.phonetics.find((p) => p.text)
    if (withText?.text) phonetic = withText.text
  }

  // Audio — first non-empty audio URL across all returned entries
  let audioUrl: string | null = null
  for (const entry of data) {
    const found = entry.phonetics?.find((p) => p.audio && p.audio.trim().length > 0)
    if (found?.audio) {
      audioUrl = found.audio
      break
    }
  }

  // Meanings — flatten across all entries, one definition per part-of-speech
  const phoneticBreakdown: DictionaryEntry['phoneticBreakdown'] = []
  const seenPos = new Set<string>()
  const synonymsSet = new Set<string>()
  for (const entry of data) {
    for (const meaning of entry.meanings ?? []) {
      if (!meaning.definitions?.length) continue
      const def = meaning.definitions[0]
      if (!seenPos.has(meaning.partOfSpeech)) {
        seenPos.add(meaning.partOfSpeech)
        phoneticBreakdown.push({
          pos: meaning.partOfSpeech,
          definition: def.definition,
          example: def.example,
        })
      }
      for (const s of meaning.synonyms ?? []) synonymsSet.add(s)
      for (const s of def.synonyms ?? []) synonymsSet.add(s)
    }
  }

  return {
    word,
    phonetic,
    phoneticBreakdown,
    audioUrl,
    synonyms: Array.from(synonymsSet).slice(0, 6),
  }
}

export async function lookupWord(rawTerm: string): Promise<DictionaryEntry | null> {
  hydrateMemoryCache()
  const term = rawTerm.trim().toLowerCase()
  if (!term) return null

  if (memoryCache.has(term)) {
    return memoryCache.get(term) ?? null
  }

  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(term)}`)
    if (res.status === 404) {
      writeToCache(term, null)
      return null
    }
    if (!res.ok) {
      throw new Error(`Dictionary API error: ${res.status}`)
    }
    const data = (await res.json()) as ApiEntry[]
    const parsed = parseApiResponse(data)
    if (parsed) {
      const cnTranslation = await fetchChineseTranslation(term)
      parsed.cnTranslation = cnTranslation
    }
    writeToCache(term, parsed)
    return parsed
  } catch (err) {
    // Don't cache transient network errors — let caller retry.
    throw err
  }
}

export function clearDictionaryCache() {
  memoryCache.clear()
  if (typeof localStorage !== 'undefined') localStorage.removeItem(CACHE_KEY)
  persistedLoaded = false
}
