const CACHE_KEY = 'translate-cache-v1'
const CACHE_LIMIT = 500

const memoryCache = new Map<string, string | null>()
let persistedLoaded = false

interface PersistedCache {
  order: string[]
  entries: Record<string, string | null>
}

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
    // quota exceeded
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

function writeToCache(key: string, value: string | null) {
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

function jsonpFetch(word: string): Promise<string | null> {
  return new Promise((resolve) => {
    const cb = `youdao_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`
    let script: HTMLScriptElement | null = null
    let done = false

    const timeout = setTimeout(() => {
      if (!done) { done = true; cleanup(); resolve(null) }
    }, 5000)

    function cleanup() {
      clearTimeout(timeout)
      delete (window as unknown as Record<string, unknown>)[cb]
      if (script && script.parentNode) script.parentNode.removeChild(script)
    }

    ;(window as unknown as Record<string, unknown>)[cb] = (data: {
      data?: { entries?: Array<{ explain?: string }> }
    }) => {
      if (done) return
      done = true
      cleanup()
      try {
        const entries = data?.data?.entries
        if (Array.isArray(entries) && entries.length > 0 && entries[0].explain) {
          resolve(entries[0].explain)
        } else {
          resolve(null)
        }
      } catch {
        resolve(null)
      }
    }

    script = document.createElement('script')
    script.src = `https://dict.youdao.com/suggest?num=1&doctype=json&callback=${cb}&q=${encodeURIComponent(word)}`
    script.onerror = () => { if (!done) { done = true; cleanup(); resolve(null) } }
    document.head.appendChild(script)
  })
}

export async function fetchChineseTranslation(word: string): Promise<string | null> {
  hydrateMemoryCache()
  const key = word.trim().toLowerCase()
  if (!key) return null

  if (memoryCache.has(key)) return memoryCache.get(key) ?? null

  const result = await jsonpFetch(key)
  writeToCache(key, result)
  return result
}

export function clearTranslateCache() {
  memoryCache.clear()
  if (typeof localStorage !== 'undefined') localStorage.removeItem(CACHE_KEY)
  persistedLoaded = false
}
