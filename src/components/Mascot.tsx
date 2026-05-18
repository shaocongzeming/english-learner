import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Mood = 'happy' | 'curious' | 'focus' | 'celebrate' | 'encourage' | 'thinking' | 'surprised' | 'sleeping'
type Gesture = 'none' | 'wave' | 'point-left' | 'point-right' | 'clap' | 'reach'

interface MascotProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  mood?: Mood
  gesture?: Gesture
  floating?: boolean
  streak?: number
}

interface Particle {
  id: number
  cx: number
  cy: number
  color: string
  size: number
}

const sizes = { sm: 'w-14 h-14', md: 'w-28 h-28', lg: 'w-44 h-44' }

const mouths: Record<Mood, string> = {
  happy:     'M 88 100 Q 94 110 100 108 Q 106 110 112 100',
  curious:   'M 93 102 Q 97 108 100 106 Q 103 108 107 102',
  focus:     'M 90 104 Q 95 102 100 102 Q 105 102 110 104',
  celebrate: 'M 84 98 Q 90 114 100 112 Q 110 114 116 98',
  encourage: 'M 88 100 Q 94 109 100 107 Q 106 109 112 100',
  thinking:  'M 92 104 Q 96 102 100 102 Q 104 102 108 104',
  surprised: 'M 93 100 Q 96 112 100 110 Q 104 112 107 100',
  sleeping:  'M 92 104 Q 96 108 100 107 Q 104 108 108 104',
}

const scleraRy: Record<Mood, number> = {
  happy: 16, curious: 17, focus: 14, celebrate: 10, encourage: 15, thinking: 15, surprised: 20, sleeping: 2,
}

const pupilR: Record<Mood, number> = {
  happy: 7, curious: 8, focus: 6, celebrate: 3, encourage: 7, thinking: 7, surprised: 9, sleeping: 0,
}

const eyebrowLeft: Record<string, string> = {
  surprised: 'M 64 54 Q 76 46 88 54',
  sleeping:  'M 66 62 Q 76 60 88 62',
  default:   'M 66 60 Q 76 56 88 60',
}

const eyebrowRight: Record<string, string> = {
  surprised: 'M 112 54 Q 124 46 136 54',
  sleeping:  'M 112 62 Q 122 60 134 62',
  default:   'M 112 60 Q 122 56 134 60',
}

const PARTICLE_COLORS = ['#FFD700', '#FF6B6B', '#4ADE80', '#60A5FA', '#F472B6', '#FBBF24']

export default function Mascot({
  className = '',
  size = 'md',
  mood = 'happy',
  gesture = 'none',
  floating = false,
  streak = 0,
}: MascotProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [pupil, setPupil] = useState({ x: 0, y: 0 })

  // === Feature 1: Poke reaction ===
  const [poked, setPoked] = useState(false)

  // === Feature 3: Idle sleeping ===
  const sleepingRef = useRef(false)
  const [sleeping, setSleeping] = useState(false)

  // === Feature 2: Streak particles ===
  const [particles, setParticles] = useState<Particle[]>([])

  // Active mood priority: poked > sleeping > prop
  const activeMood: Mood = poked ? 'surprised' : sleeping ? 'sleeping' : mood

  // Eye tracking
  useEffect(() => {
    let raf = 0
    const handler = (e: MouseEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (!svgRef.current) return
        const rect = svgRef.current.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height * 0.4
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const angle = Math.atan2(dy, dx)
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxR = 6
        const r = Math.min(dist / 100, 1) * maxR
        setPupil({ x: Math.cos(angle) * r, y: Math.sin(angle) * r })
      })
    }
    const leaveHandler = () => setPupil({ x: 0, y: 0 })
    window.addEventListener('mousemove', handler)
    window.addEventListener('mouseleave', leaveHandler)
    return () => {
      window.removeEventListener('mousemove', handler)
      window.removeEventListener('mouseleave', leaveHandler)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Idle sleeping — 15s no activity → sleep, any activity → wake with surprise
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const startActivity = () => {
      clearTimeout(timer)
      if (sleepingRef.current) {
        sleepingRef.current = false
        setSleeping(false)
        setPoked(true)
        setTimeout(() => setPoked(false), 500)
      }
      timer = setTimeout(() => {
        sleepingRef.current = true
        setSleeping(true)
      }, 15000)
    }

    const events = ['mousemove', 'click', 'keydown', 'touchstart', 'scroll'] as const
    events.forEach(e => window.addEventListener(e, startActivity, { passive: true }))
    startActivity()

    return () => {
      events.forEach(e => window.removeEventListener(e, startActivity))
      clearTimeout(timer)
    }
  }, [])

  // Streak particles — spawn when streak >= 3
  useEffect(() => {
    if (streak >= 3) {
      const base = Date.now()
      const newParticles: Particle[] = Array.from({ length: 6 }, (_, i) => ({
        id: base + i,
        cx: 60 + i * 16,
        cy: 25 + (i % 2) * 8,
        color: PARTICLE_COLORS[i],
        size: 2 + (i % 3),
      }))
      setParticles(newParticles)
      const timer = setTimeout(() => setParticles([]), 800)
      return () => clearTimeout(timer)
    }
    setParticles([])
  }, [streak])

  // Poke click handler
  const handlePoke = () => {
    if (sleepingRef.current) return
    setPoked(true)
    setTimeout(() => setPoked(false), 300)
  }

  const px = activeMood === 'sleeping' ? 0 : pupil.x
  const py = activeMood === 'sleeping' ? 0 : pupil.y

  return (
    <motion.div
      className={`select-none ${sizes[size]} ${className}`}
      animate={floating && activeMood !== 'sleeping' ? { y: [0, -6, 0] } : undefined}
      transition={floating && activeMood !== 'sleeping' ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <motion.svg
        ref={svgRef}
        viewBox="0 0 200 180"
        className="w-full h-full"
        aria-hidden="true"
        onClick={handlePoke}
        style={{ cursor: 'pointer' }}
        animate={
          poked ? { scale: [1, 1.15, 0.95, 1.05, 1] } :
          activeMood === 'celebrate' ? { scale: [1, 1.04, 1] } :
          {}
        }
        transition={
          poked ? { duration: 0.4 } :
          activeMood === 'celebrate' ? { duration: 0.5, repeat: Infinity } :
          {}
        }
      >
        {/* Shadow */}
        <motion.ellipse
          cx={100} cy={176} rx={32} ry={4}
          animate={{ fill: activeMood === 'sleeping' ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.06)' }}
        />

        {/* === Streak particles === */}
        <AnimatePresence>
          {particles.map(p => (
            <motion.circle
              key={p.id}
              cx={p.cx} cy={p.cy} r={p.size}
              fill={p.color}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -35 }}
              transition={{ duration: 0.7 }}
            />
          ))}
        </AnimatePresence>

        {/* === Zzz (sleeping) === */}
        {activeMood === 'sleeping' && (
          <>
            <motion.text
              x={138} y={42} fontSize={12} fill="#94A3B8" fontWeight="bold" fontStyle="italic"
              animate={{ opacity: [0, 0.8, 0], y: [0, -12] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >z</motion.text>
            <motion.text
              x={148} y={30} fontSize={16} fill="#94A3B8" fontWeight="bold" fontStyle="italic"
              animate={{ opacity: [0, 0.8, 0], y: [0, -16] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.7 }}
            >Z</motion.text>
            <motion.text
              x={154} y={16} fontSize={20} fill="#94A3B8" fontWeight="bold" fontStyle="italic"
              animate={{ opacity: [0, 0.8, 0], y: [0, -20] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1.4 }}
            >Z</motion.text>
          </>
        )}

        {/* === BODY (teal hoodie) === */}
        <path
          d="M 65 134 Q 62 124 100 121 Q 138 124 135 134 L 139 163 Q 139 172 130 172 L 70 172 Q 61 172 61 163 Z"
          fill="#2DD4BF" stroke="#14B8A6" strokeWidth={1}
        />
        <path
          d="M 82 152 Q 82 146 100 146 Q 118 146 118 152 L 116 160 Q 116 163 100 163 Q 84 163 84 160 Z"
          fill="#14B8A6" opacity={0.25}
        />
        <line x1={92} y1={125} x2={93} y2={138} stroke="#99F6E4" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={108} y1={125} x2={107} y2={138} stroke="#99F6E4" strokeWidth={1.5} strokeLinecap="round" />

        {/* === LEFT ARM === */}
        <motion.g
          style={{ transformOrigin: '65px 134px' }}
          animate={{
            rotate: gesture === 'wave' ? [0, -25, 5, -25, 0] :
                    gesture === 'point-left' ? -20 :
                    gesture === 'clap' ? [-35, -10, -35] :
                    gesture === 'reach' ? -15 : 0,
          }}
          transition={
            gesture === 'wave' || gesture === 'clap'
              ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.3 }
          }
        >
          <path d="M 65 134 Q 48 130 44 142 Q 40 155 50 152" fill="#2DD4BF" stroke="#14B8A6" strokeWidth={1} />
          <circle cx={48} cy={150} r={7} fill="#FFD7B5" />
          <circle cx={44} cy={147} r={3} fill="#FFD7B5" />
        </motion.g>

        {/* === RIGHT ARM === */}
        <motion.g
          style={{ transformOrigin: '135px 134px' }}
          animate={{
            rotate: gesture === 'clap' ? [35, 10, 35] :
                    gesture === 'reach' ? 15 : 0,
          }}
          transition={
            gesture === 'clap'
              ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.3 }
          }
        >
          <path d="M 135 134 Q 152 130 156 142 Q 160 155 150 152" fill="#2DD4BF" stroke="#14B8A6" strokeWidth={1} />
          <circle cx={152} cy={150} r={7} fill="#FFD7B5" />
          <circle cx={156} cy={147} r={3} fill="#FFD7B5" />
        </motion.g>

        {/* === NECK === */}
        <rect x={91} y={114} width={18} height={13} rx={6} fill="#FFD7B5" />

        {/* === HEAD === */}
        <circle cx={100} cy={70} r={52} fill="#FFD7B5" />
        <ellipse cx={88} cy={45} rx={18} ry={8} fill="rgba(255,255,255,0.15)" />

        {/* === HAIR === */}
        <path
          d="M 48 60 Q 52 22 78 26 Q 82 4 102 8 Q 122 2 128 26 Q 152 20 156 60
             Q 148 36 132 43 Q 120 24 102 30 Q 84 22 70 40 Q 56 34 48 60Z"
          fill="#3D2B1F"
        />
        <path d="M 70 38 Q 80 32 95 36" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={2} strokeLinecap="round" />

        {/* === EARS === */}
        <ellipse cx={49} cy={72} rx={8} ry={10} fill="#FFCBA4" />
        <ellipse cx={49} cy={72} rx={5} ry={7} fill="rgba(240,184,138,0.4)" />
        <ellipse cx={151} cy={72} rx={8} ry={10} fill="#FFCBA4" />
        <ellipse cx={151} cy={72} rx={5} ry={7} fill="rgba(240,184,138,0.4)" />

        {/* === EYES === */}
        <motion.ellipse cx={78} cy={72} fill="white"
          animate={{ rx: 14, ry: scleraRy[activeMood] }}
          transition={{ duration: 0.25 }}
        />
        <motion.ellipse cx={122} cy={72} fill="white"
          animate={{ rx: 14, ry: scleraRy[activeMood] }}
          transition={{ duration: 0.25 }}
        />

        {/* Sleeping eyelids — curved lines over closed eyes */}
        {activeMood === 'sleeping' && (
          <>
            <path d="M 66 72 Q 78 77 90 72" fill="none" stroke="#8B6F5E" strokeWidth={1.5} strokeLinecap="round" />
            <path d="M 110 72 Q 122 77 134 72" fill="none" stroke="#8B6F5E" strokeWidth={1.5} strokeLinecap="round" />
          </>
        )}

        {/* Pupils */}
        {activeMood !== 'sleeping' && (
          <g style={{ transform: `translate(${px}px, ${py}px)` }}>
            <motion.circle cx={78} cy={72} fill="#1E293B"
              animate={{ r: pupilR[activeMood] }}
              transition={{ duration: 0.25 }}
            />
            <motion.circle cx={122} cy={72} fill="#1E293B"
              animate={{ r: pupilR[activeMood] }}
              transition={{ duration: 0.25 }}
            />
            <circle cx={83} cy={68} r={2.5} fill="white" />
            <circle cx={127} cy={68} r={2.5} fill="white" />
            <circle cx={80} cy={74} r={1.2} fill="rgba(255,255,255,0.6)" />
            <circle cx={124} cy={74} r={1.2} fill="rgba(255,255,255,0.6)" />
          </g>
        )}

        {/* === EYEBROWS === */}
        <motion.path
          fill="none" stroke="#3D2B1F" strokeWidth={2.5} strokeLinecap="round"
          animate={{ d: eyebrowLeft[activeMood] || eyebrowLeft.default }}
          transition={{ duration: 0.25 }}
        />
        <motion.path
          fill="none" stroke="#3D2B1F" strokeWidth={2.5} strokeLinecap="round"
          animate={{ d: eyebrowRight[activeMood] || eyebrowRight.default }}
          transition={{ duration: 0.25 }}
        />

        {/* === NOSE === */}
        <ellipse cx={100} cy={86} rx={3.5} ry={2.5} fill="#F0B88A" />

        {/* === CHEEKS === */}
        <motion.circle cx={60} cy={88} fill="rgba(251,113,133,0.22)"
          animate={{ r: ['celebrate', 'surprised'].includes(activeMood) ? 12 : ['encourage', 'sleeping'].includes(activeMood) ? 10 : 9 }}
          transition={{ duration: 0.3 }}
        />
        <motion.circle cx={140} cy={88} fill="rgba(251,113,133,0.22)"
          animate={{ r: ['celebrate', 'surprised'].includes(activeMood) ? 12 : ['encourage', 'sleeping'].includes(activeMood) ? 10 : 9 }}
          transition={{ duration: 0.3 }}
        />

        {/* === MOUTH === */}
        <motion.path
          fill="none" stroke="#8B4513" strokeWidth={2.5} strokeLinecap="round"
          animate={{ d: mouths[activeMood] }}
          transition={{ duration: 0.25 }}
        />
      </motion.svg>
    </motion.div>
  )
}
