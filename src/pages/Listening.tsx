import { Headphones } from 'lucide-react'
import Mascot from '../components/Mascot'

export default function Listening() {
  return (
    <div className="bubbly-card flex flex-col items-center justify-center rounded-[2rem] px-6 py-20 text-center">
      <Mascot size="lg" mood="thinking" floating className="mb-6" />
      <Headphones size={48} className="text-teal-600 dark:text-teal-300 mb-4" />
      <h2 className="display-font text-4xl text-slate-900 dark:text-white mb-2">听力练习</h2>
      <p className="max-w-sm text-gray-500 dark:text-gray-400">
        即将上线。先给你留一间安静的小听力屋，后续可以放精听、跟读和影子练习。
      </p>
    </div>
  )
}
