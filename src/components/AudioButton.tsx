import { useRef, useState } from 'react'
import { Volume2 } from 'lucide-react'
import { useTTS } from '../hooks/useTTS'

interface AudioButtonProps {
  audioUrl?: string | null
  fallbackText: string
  size?: number
  className?: string
}

export default function AudioButton({
  audioUrl,
  fallbackText,
  size = 20,
  className,
}: AudioButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { speak } = useTTS()
  const [playing, setPlaying] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (audioUrl) {
      try {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
        const audio = new Audio(audioUrl)
        audioRef.current = audio
        setPlaying(true)
        audio.onended = () => setPlaying(false)
        audio.onerror = () => {
          setPlaying(false)
          speak(fallbackText)
        }
        void audio.play().catch(() => {
          setPlaying(false)
          speak(fallbackText)
        })
        return
      } catch {
        // fall through to TTS
      }
    }
    speak(fallbackText)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        'inline-flex items-center justify-center p-2 rounded-full text-mw-red hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors'
      }
      aria-label={`播放 ${fallbackText} 发音`}
    >
      <Volume2
        size={size}
        className={playing ? 'animate-pulse' : ''}
      />
    </button>
  )
}
