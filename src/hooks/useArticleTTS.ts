import { useState, useRef, useCallback, useEffect } from 'react'
import type { ArticleSentence } from '../types/reading'

interface UseArticleTTSReturn {
  playing: boolean
  paused: boolean
  currentSentenceIndex: number
  play: (sentences: ArticleSentence[], startIndex?: number) => void
  pause: () => void
  resume: () => void
  stop: () => void
  setRate: (rate: number) => void
  rate: number
}

export function useArticleTTS(): UseArticleTTSReturn {
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1)
  const [rate, setRateState] = useState(0.8)

  const sentencesRef = useRef<ArticleSentence[]>([])
  const indexRef = useRef(0)
  const rateRef = useRef(0.8)

  // Keep rate ref in sync
  useEffect(() => {
    rateRef.current = rate
  }, [rate])

  const speakNext = useCallback(() => {
    const sentences = sentencesRef.current
    const idx = indexRef.current
    if (idx >= sentences.length) {
      setPlaying(false)
      setCurrentSentenceIndex(-1)
      return
    }

    setCurrentSentenceIndex(idx)
    const utterance = new SpeechSynthesisUtterance(sentences[idx].text)
    utterance.lang = 'en-US'
    utterance.rate = rateRef.current

    utterance.onend = () => {
      indexRef.current = idx + 1
      speakNext()
    }

    utterance.onerror = () => {
      indexRef.current = idx + 1
      speakNext()
    }

    window.speechSynthesis.speak(utterance)
  }, [])

  const play = useCallback((sentences: ArticleSentence[], startIndex = 0) => {
    window.speechSynthesis.cancel()
    sentencesRef.current = sentences
    indexRef.current = startIndex
    setPlaying(true)
    setPaused(false)
    speakNext()
  }, [speakNext])

  const pause = useCallback(() => {
    window.speechSynthesis.pause()
    setPaused(true)
  }, [])

  const resume = useCallback(() => {
    window.speechSynthesis.resume()
    setPaused(false)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setPlaying(false)
    setPaused(false)
    setCurrentSentenceIndex(-1)
    indexRef.current = 0
  }, [])

  // Rate change: if playing, restart current sentence at new speed
  const setRate = useCallback((newRate: number) => {
    rateRef.current = newRate
    setRateState(newRate)
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      const currentIdx = indexRef.current
      window.speechSynthesis.cancel()
      indexRef.current = currentIdx
      speakNext()
    }
  }, [speakNext])

  return { playing, paused, currentSentenceIndex, play, pause, resume, stop, setRate, rate }
}
