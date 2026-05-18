import type { ArticleDifficulty } from '../../types/reading'

interface Props {
  value: ArticleDifficulty | 'all'
  onChange: (v: ArticleDifficulty | 'all') => void
}

const OPTIONS: { key: ArticleDifficulty | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'beginner', label: '初级' },
  { key: 'intermediate', label: '中级' },
  { key: 'advanced', label: '高级' },
]

export default function DifficultyFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-4 py-2 rounded-full text-sm font-extrabold transition-all ${
            value === opt.key
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-300/40'
              : 'bg-white/80 dark:bg-gray-800 border-2 border-white/80 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:-translate-y-0.5 hover:border-teal-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
